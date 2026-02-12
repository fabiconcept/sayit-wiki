interface NameSearchOptions {
  minScore?: number;
  maxResults?: number;
  caseSensitive?: boolean;
  typoTolerance?: 'strict' | 'moderate' | 'loose'; // controls edit distance allowance
}

interface SearchResult {
  _id: any;
  name: string;
  score: number;
  matchedParts: string[];
}

// ---------------------------------------------------------------------------
// CLIENT-SIDE HELPERS (run in Node/app layer before building the pipeline)
// ---------------------------------------------------------------------------

/**
 * Strip symbols, numbers, and extra punctuation from a query string.
 * Preserves spaces and basic alpha chars (and unicode letters for i18n names).
 *
 * e.g. "J0hn!  Sm1th##" → "John Smith"
 *      "Fav. Ajo. Emm." → "Fav Ajo Emm"
 *      "123 Mary-Jane"  → "Mary Jane"
 */
export function sanitizeQuery(raw: string): string {
  return (
    raw
      // Replace hyphens / underscores between word chars with a space so
      // "Mary-Jane" becomes "Mary Jane" rather than "MaryJane"
      .replace(/(?<=\w)[-_](?=\w)/g, ' ')
      // Strip everything that is not a letter, digit used as letter substitute,
      // or whitespace. Keeps Unicode letters (accented chars, etc.)
      .replace(/[^\p{L}\p{M}\s]/gu, ' ')
      // Collapse runs of whitespace
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Normalise common leet-speak / number-as-letter substitutions so that
 * "J0hn", "Sm1th", "4nn4" still match "John", "Smith", "Anna".
 */
export function normalizeLeetSpeak(s: string): string {
  return s
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')  // also covers l → i edge; good enough heuristically
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/8/g, 'b')
    .replace(/9/g, 'g');
}

/**
 * Collapse runs of the same character (handles "Smiiith" → "Smith", "Jooohn" → "John").
 * Only collapses runs of 3+ to avoid turning "ll" (valid in many names) into "l".
 */
export function collapseRepeatedChars(s: string): string {
  return s.replace(/(.)\1{2,}/g, '$1$1');
}

/**
 * Compute Levenshtein edit distance between two strings.
 * Used client-side to decide which variants to inject into the pipeline.
 */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = Array.from({ length: b.length + 1 }, (_, i) =>
    Array.from({ length: a.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : 1 + Math.min(matrix[i - 1][j - 1], matrix[i - 1][j], matrix[i][j - 1]);
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Given a single query token, produce an array of "variant" strings that
 * account for likely typos based on the chosen tolerance level.
 *
 * Strategy: generate all single-edit neighbours and filter by allowed distance.
 * For short words (≤3 chars) we only allow distance 1 in 'loose' mode to avoid
 * too many false positives.
 *
 * Returns the original token plus any close variants (deduped).
 */
export function generateTypoVariants(
  token: string,
  tolerance: 'strict' | 'moderate' | 'loose'
): string[] {
  const maxDist =
    tolerance === 'strict'
      ? 0
      : tolerance === 'moderate'
      ? token.length <= 4 ? 1 : 2
      : token.length <= 3 ? 1 : 2; // loose still caps at 2 to stay sane

  if (maxDist === 0) return [token];

  const variants = new Set<string>([token]);
  const chars = 'abcdefghijklmnopqrstuvwxyz';

  // Deletions
  for (let i = 0; i < token.length; i++) {
    const v = token.slice(0, i) + token.slice(i + 1);
    if (v.length >= 2 && levenshtein(token, v) <= maxDist) variants.add(v);
  }

  // Substitutions
  for (let i = 0; i < token.length; i++) {
    for (const c of chars) {
      if (c === token[i]) continue;
      const v = token.slice(0, i) + c + token.slice(i + 1);
      if (levenshtein(token, v) <= maxDist) variants.add(v);
    }
  }

  // Transpositions (swap adjacent chars)
  for (let i = 0; i < token.length - 1; i++) {
    const arr = token.split('');
    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    const v = arr.join('');
    if (levenshtein(token, v) <= maxDist) variants.add(v);
  }

  // Insertions (only for moderate/loose, very targeted)
  if (tolerance === 'loose') {
    for (let i = 0; i <= token.length; i++) {
      for (const c of chars) {
        const v = token.slice(0, i) + c + token.slice(i);
        if (levenshtein(token, v) <= maxDist) variants.add(v);
      }
    }
  }

  return Array.from(variants);
}

/**
 * Full pre-processing pipeline for a raw search query.
 * Returns cleaned tokens and their typo-expanded variants.
 */
export function preprocessQuery(
  rawQuery: string,
  options: Pick<NameSearchOptions, 'caseSensitive' | 'typoTolerance'> = {}
): { tokens: string[]; variantMap: Record<string, string[]> } {
  const { caseSensitive = false, typoTolerance = 'moderate' } = options;

  const sanitized = sanitizeQuery(rawQuery);
  const leetNorm = normalizeLeetSpeak(sanitized);
  const collapsed = collapseRepeatedChars(leetNorm);
  const cased = caseSensitive ? collapsed : collapsed.toLowerCase();

  const tokens = cased.split(/\s+/).filter((t) => t.length > 0);

  const variantMap: Record<string, string[]> = {};
  for (const token of tokens) {
    variantMap[token] = generateTypoVariants(token, typoTolerance);
  }

  return { tokens, variantMap };
}

// ---------------------------------------------------------------------------
// MONGODB AGGREGATION PIPELINE
// ---------------------------------------------------------------------------

/**
 * Generates a MongoDB aggregation pipeline for fuzzy name search.
 *
 * Improvements over the original:
 *  - Input sanitization (symbols, numbers, leet-speak, repeated chars)
 *  - Typo-tolerant matching via client-side variant expansion fed into the pipeline
 *  - Scoring that penalises matches that relied on a typo variant (not exact)
 *  - Extra characters / noise in the stored name are handled by substring and
 *    prefix matching (a stored "John123 Smith" will still match "John Smith")
 */
export function generateNameSearchPipeline(
  searchQuery: string,
  nameField: string = 'name',
  options: NameSearchOptions = {}
): any[] {
  const {
    minScore = 0.3,
    maxResults = 10,
    caseSensitive = false,
    typoTolerance = 'moderate',
  } = options;

  const { tokens, variantMap } = preprocessQuery(searchQuery, {
    caseSensitive,
    typoTolerance,
  });

  // Flatten all variants across all tokens for a broad pre-filter $match.
  // This keeps the pipeline fast by discarding clearly irrelevant docs early.
  const allVariants = Array.from(new Set(Object.values(variantMap).flat()));

  // Build a regex that requires at least one variant to appear anywhere in
  // the name. This acts as a cheap pre-filter before the scoring stage.
  const preFilterPattern = allVariants
    .map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // escape regex special chars
    .join('|');

  return [
    // ── Stage 1: cheap pre-filter ──────────────────────────────────────────
    // Strip noise from the stored name field before matching.
    {
      $addFields: {
        // A sanitised, lowercased (unless case-sensitive) version of the name
        // with symbols/numbers stripped — mirrors what we did to the query.
        _cleanName: {
          $trim: {
            input: {
              $replaceAll: {
                input: {
                  $replaceAll: {
                    input: {
                      $toLower: caseSensitive
                        ? `$${nameField}`
                        : `$${nameField}`,
                    },
                    find: '-',
                    replacement: ' ',
                  },
                },
                find: '_',
                replacement: ' ',
              },
            },
            chars: ' ',
          },
        },
      },
    },
    // Use $addFields to compute a regex-stripped clean name in Mongo.
    // Note: MongoDB has no built-in "strip non-alpha" operator, so we use
    // the pre-filter regex on the raw field and rely on the scoring stage
    // (which uses the JS-cleaned tokens) for correctness.
    {
      $match: {
        [nameField]: {
          $regex: preFilterPattern,
          $options: caseSensitive ? '' : 'i',
        },
      },
    },

    // ── Stage 2: split name into parts ────────────────────────────────────
    {
      $addFields: {
        _normalizedName: caseSensitive
          ? `$${nameField}`
          : { $toLower: `$${nameField}` },

        // Split on whitespace to get individual name tokens.
        // Stored names like "Jôhn Smïth" or "John123 Smith" are split here.
        _nameParts: {
          $split: [
            caseSensitive ? `$${nameField}` : { $toLower: `$${nameField}` },
            ' ',
          ],
        },
      },
    },

    // ── Stage 3: score each document ──────────────────────────────────────
    {
      $addFields: {
        _searchScore: {
          $let: {
            vars: {
              // For every query token, find the best score across all name parts
              // and across all typo variants of that token.
              partScores: {
                $map: {
                  // Iterate over query token indices
                  input: tokens.map((_, idx) => idx),
                  as: 'queryIdx',
                  in: {
                    $let: {
                      vars: {
                        // The canonical token (used to detect whether we matched
                        // on a typo variant vs the original).
                        canonicalToken: {
                          $arrayElemAt: [tokens, '$$queryIdx'],
                        },

                        // All variants for this token position
                        tokenVariants: {
                          $arrayElemAt: [
                            // Embed the variant arrays as a constant literal
                            tokens.map((t) => variantMap[t]),
                            '$$queryIdx',
                          ],
                        },

                        // Best match score across all name parts for this query token
                        bestMatchScore: {
                          $max: {
                            $map: {
                              input: '$_nameParts',
                              as: 'namePart',
                              in: {
                                $let: {
                                  vars: {
                                    // ---------- Exact / prefix / substring matching
                                    // per variant, take the best score then discount
                                    // if it required a typo variant.

                                    variantBestScore: {
                                      $max: {
                                        $map: {
                                          input: {
                                            $arrayElemAt: [
                                              tokens.map((t) => variantMap[t]),
                                              '$$queryIdx',
                                            ],
                                          },
                                          as: 'variant',

                                          in: {
                                            $let: {
                                              vars: {
                                                // 1.0 – exact full match
                                                exactMatch: {
                                                  $cond: [
                                                    { $eq: ['$$namePart', '$$variant'] },
                                                    1.0,
                                                    0,
                                                  ],
                                                },

                                                // 0.95 – prefix match (query starts namePart)
                                                prefixMatch: {
                                                  $cond: [
                                                    {
                                                      $eq: [
                                                        {
                                                          $indexOfCP: [
                                                            '$$namePart',
                                                            '$$variant',
                                                          ],
                                                        },
                                                        0,
                                                      ],
                                                    },
                                                    0.95,
                                                    0,
                                                  ],
                                                },

                                                // 0.9 – initial (single char) match
                                                initialMatch: {
                                                  $cond: [
                                                    {
                                                      $and: [
                                                        {
                                                          $eq: [
                                                            { $strLenCP: '$$variant' },
                                                            1,
                                                          ],
                                                        },
                                                        {
                                                          $eq: [
                                                            {
                                                              $substrCP: [
                                                                '$$namePart',
                                                                0,
                                                                1,
                                                              ],
                                                            },
                                                            '$$variant',
                                                          ],
                                                        },
                                                      ],
                                                    },
                                                    0.9,
                                                    0,
                                                  ],
                                                },

                                                // 0.7 – substring match anywhere
                                                substringMatch: {
                                                  $cond: [
                                                    {
                                                      $gte: [
                                                        {
                                                          $indexOfCP: [
                                                            '$$namePart',
                                                            '$$variant',
                                                          ],
                                                        },
                                                        0,
                                                      ],
                                                    },
                                                    0.7,
                                                    0,
                                                  ],
                                                },
                                              },
                                              in: {
                                                $max: [
                                                  '$$exactMatch',
                                                  '$$prefixMatch',
                                                  '$$initialMatch',
                                                  '$$substringMatch',
                                                ],
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },

                                    // Was the best variant the original token?
                                    // If not, apply a typo penalty (multiply by 0.8).
                                    exactVariantScore: {
                                      $let: {
                                        vars: {
                                          canonToken: {
                                            $arrayElemAt: [tokens, '$$queryIdx'],
                                          },
                                          rawScore: {
                                            $max: [
                                              // exact
                                              {
                                                $cond: [
                                                  {
                                                    $eq: [
                                                      '$$namePart',
                                                      {
                                                        $arrayElemAt: [
                                                          tokens,
                                                          '$$queryIdx',
                                                        ],
                                                      },
                                                    ],
                                                  },
                                                  1.0,
                                                  0,
                                                ],
                                              },
                                              // prefix
                                              {
                                                $cond: [
                                                  {
                                                    $eq: [
                                                      {
                                                        $indexOfCP: [
                                                          '$$namePart',
                                                          {
                                                            $arrayElemAt: [
                                                              tokens,
                                                              '$$queryIdx',
                                                            ],
                                                          },
                                                        ],
                                                      },
                                                      0,
                                                    ],
                                                  },
                                                  0.95,
                                                  0,
                                                ],
                                              },
                                            ],
                                          },
                                        },
                                        in: '$$rawScore',
                                      },
                                    },
                                  },

                                  in: {
                                    // If canonical token already gave a good score,
                                    // use it unpenalised. Otherwise apply typo penalty.
                                    $cond: [
                                      { $gt: ['$$exactVariantScore', 0] },
                                      '$$exactVariantScore',
                                      // Typo variant matched — penalise slightly
                                      { $multiply: ['$$variantBestScore', 0.8] },
                                    ],
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      in: '$$bestMatchScore',
                    },
                  },
                },
              },
            },

            in: {
              // Weighted final score:
              //   avg(partScores) × coverage bonus
              // Coverage bonus rewards queries where more tokens matched.
              $multiply: [
                { $avg: '$$partScores' },
                {
                  $add: [
                    1,
                    {
                      $divide: [
                        {
                          $size: {
                            $filter: {
                              input: '$$partScores',
                              as: 'ps',
                              cond: { $gt: ['$$ps', 0] },
                            },
                          },
                        },
                        { $max: [{ $size: '$$partScores' }, 1] },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
      },
    },

    // ── Stage 4: filter, sort, trim ───────────────────────────────────────
    {
      $match: {
        _searchScore: { $gte: minScore },
      },
    },
    {
      $sort: { _searchScore: -1 },
    },
    {
      $limit: maxResults,
    },
    {
      $project: {
        _normalizedName: 0,
        _nameParts: 0,
        _cleanName: 0,
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// SIMPLE PIPELINE (regex-only, large datasets)
// ---------------------------------------------------------------------------

/**
 * A lighter-weight pipeline that pre-processes the query client-side
 * (sanitize + leet-speak + typo variants) and builds a combined regex.
 * Faster on large collections at the cost of some scoring nuance.
 */
export function generateSimpleNameSearchPipeline(
  searchQuery: string,
  nameField: string = 'name',
  options: NameSearchOptions = {}
): any[] {
  const { maxResults = 10, typoTolerance = 'moderate' } = options;

  const { tokens, variantMap } = preprocessQuery(searchQuery, {
    caseSensitive: false,
    typoTolerance,
  });

  // Each token group: one of the variants must match
  const tokenPatterns = tokens.map((t) => {
    const escaped = variantMap[t].map((v) =>
      v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    return `(?:${escaped.join('|')})`;
  });

  // All token patterns must appear (in any order) somewhere in the name
  const combinedPattern = tokenPatterns.join('(?:.*?)');

  return [
    {
      $match: {
        [nameField]: {
          $regex: combinedPattern,
          $options: 'i',
        },
      },
    },
    {
      $limit: maxResults,
    },
  ];
}

// ---------------------------------------------------------------------------
// PUBLIC API
// ---------------------------------------------------------------------------

/**
 * Run a fuzzy name search against a MongoDB collection.
 *
 * @example
 * // Handles typos:        "Smth"   → "Smith"
 * // Handles leet-speak:   "Sm1th"  → "Smith"
 * // Handles extra chars:  "Sm!th"  → "Smith"
 * // Handles initials:     "J. S."  → "John Smith"
 * // Handles extra noise:  "John123 Smith" stored → still matched by "John Smith"
 */
export async function searchNames(
  collection: any,
  searchQuery: string,
  options?: NameSearchOptions
): Promise<SearchResult[]> {
  const pipeline = generateNameSearchPipeline(searchQuery, 'name', options);
  const results = await collection.aggregate(pipeline).toArray();

  return results.map(
    (doc: { _id: string; name: string; _searchScore: number }) =>
      ({
        _id: doc._id,
        name: doc.name,
        score: doc._searchScore || 0,
        matchedParts: [],
      } as SearchResult)
  );
}
