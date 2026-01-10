/**
 * NoBadWord - A flexible content moderation class
 * Supports multiple moderation levels and an expandable word library
 */

import { badwords } from "@/constants/mock/badword";

export enum ModerationLevel {
    STRICT = 'strict',     // Blocks mild, moderate, and severe content
    MODERATE = 'moderate', // Blocks moderate and severe content
    RELAXED = 'relaxed',   // Blocks only severe content
    OFF = 'off'           // No moderation
}

export enum WordSeverity {
    MILD = 'mild',         // Minor profanity, slang
    MODERATE = 'moderate', // Standard profanity
    SEVERE = 'severe',      // Extreme profanity, slurs, hate speech
    WTF = 'absolutely not',           // What the fuck
}

export interface WordEntry {
    word: string;
    severity: WordSeverity;
    alternatives?: string[];
    variants?: string[];
}

export interface ModerationResult {
    isClean: boolean;
    isWTF: boolean;
    foundWords: string[];
    severity: WordSeverity | null;
    sanitized: string;
    matches: Array<{
        word: string;
        severity: WordSeverity;
        position: number;
    }>;
}

export class NoBadWord {
    private moderationLevel: ModerationLevel;
    private wordLibrary: Map<string, WordEntry>;
    private censorChar: string;

    constructor(
        moderationLevel: ModerationLevel = ModerationLevel.MODERATE,
        censorChar: string = '*'
    ) {
        this.moderationLevel = moderationLevel;
        this.censorChar = censorChar;
        this.wordLibrary = new Map();
        this.initializeDefaultLibrary();
    }

    /**
     * Initialize with a basic default library
     * Users should expand this based on their needs
     */
    private initializeDefaultLibrary(): void {
        // MILD examples
        this.addWord('damn', WordSeverity.MILD, ['darn', 'dang']);
        this.addWord('hell', WordSeverity.MILD, ['heck']);
        this.addWord('crap', WordSeverity.MILD, ['crud']);
        this.addWord('piss', WordSeverity.MILD, ['ticked']);

        // MODERATE examples
        this.addWord('shit', WordSeverity.MODERATE, ['shoot', 'crap']);
        this.addWord('ass', WordSeverity.MODERATE, ['butt']);
        this.addWord('bitch', WordSeverity.MODERATE, ['jerk']);
        this.addWord('bastard', WordSeverity.MODERATE, ['jerk']);

        // SEVERE examples (placeholder - real implementation should be comprehensive)
        this.addWord('fuck', WordSeverity.SEVERE, ['fudge', 'heck']);
    }

    /**
     * Add a single word to the library
     */
    addWord(word: string, severity: WordSeverity, alternatives?: string[], variants?: string[]): void {
        this.wordLibrary.set(word.toLowerCase(), {
            word: word.toLowerCase(),
            severity,
            alternatives,
            variants: variants || []
        });
    }

    /**
     * Add multiple words at once
     */
    addWords(entries: WordEntry[]): void {
        entries.forEach(entry => {
            this.addWord(entry.word, entry.severity, entry.alternatives, entry.variants);
        });
    }

    /**
     * Remove a word from the library
     */
    removeWord(word: string): boolean {
        return this.wordLibrary.delete(word.toLowerCase());
    }

    /**
     * Import a word library from JSON
     */
    importLibrary(jsonData: WordEntry[]): void {
        this.addWords(jsonData);
    }

    /**
     * Export the current library to JSON
     */
    exportLibrary(): WordEntry[] {
        return Array.from(this.wordLibrary.values());
    }

    /**
     * Clear the entire library
     */
    clearLibrary(): void {
        this.wordLibrary.clear();
    }

    /**
     * Change the moderation level
     */
    setModerationLevel(level: ModerationLevel): void {
        this.moderationLevel = level;
    }

    /**
     * Get current moderation level
     */
    getModerationLevel(): ModerationLevel {
        return this.moderationLevel;
    }

    /**
     * Check if a severity level should be blocked based on current moderation level
     */
    private shouldBlock(severity: WordSeverity): boolean {
        if (this.moderationLevel === ModerationLevel.OFF) return false;

        const severityMap = {
            [ModerationLevel.RELAXED]: [WordSeverity.SEVERE, WordSeverity.WTF],
            [ModerationLevel.MODERATE]: [WordSeverity.MODERATE, WordSeverity.SEVERE, WordSeverity.WTF],
            [ModerationLevel.STRICT]: [WordSeverity.MILD, WordSeverity.MODERATE, WordSeverity.SEVERE, WordSeverity.WTF]
        };

        return severityMap[this.moderationLevel]?.includes(severity) ?? false;
    }

    /**
     * Create regex pattern for word matching
     * Handles word boundaries and common obfuscation techniques
     */
    private createWordPattern(word: string): RegExp {
        // Escape special regex characters first
        const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Replace common character substitutions
        const pattern = escaped
            .split('')
            .map(char => {
                const substitutions: Record<string, string> = {
                    'a': '[aа@4áàâäåɑα]',
                    'e': '[eе3€éèêëė]',
                    'i': '[iі1!|íìîïıɪ]',
                    'o': '[oо0óòôöøοơ]',
                    'u': '[uúùûüυս]',
                    's': '[sѕ$5zʂ]',
                    't': '[t7+]',
                    'l': '[l1!|]',
                    'b': '[b8]',
                    'g': '[g96]',
                    'z': '[z2]',
                    'c': '[cсϲ]',
                    'p': '[pрρ]',
                    'y': '[yуү]',
                    'x': '[xхҳ]',
                    'd': '[d]',
                    'f': '[f]',
                    'h': '[h]',
                    'k': '[k]',
                    'm': '[m]',
                    'n': '[nñń]',
                    'q': '[q]',
                    'r': '[r]',
                    'v': '[v]',
                    'w': '[w]'
                };

                const lowerChar = char.toLowerCase();
                const upperChar = char.toUpperCase();

                if (substitutions[lowerChar]) {
                    return substitutions[lowerChar];
                }

                return `[${char}${lowerChar}${upperChar}]`;
            })
            .join('[\\W_\\s]*'); // Allow special characters, underscores, and spaces between letters

        // Add optional 's' at the end for plurals (with obfuscation variants)
        // This catches: "niggers", "n1ggers", "bitches", "b!tches", etc.
        const pluralPattern = `${pattern}(?:[\\W_\\s]*[sѕ$5zʂ])?`;

        return new RegExp(`(?:^|\\s|[^a-zA-Z])(${pluralPattern})(?:$|\\s|[^a-zA-Z])`, 'gi');
    }

    /**
     * Get all words to check (main word + all variants)
     */
    private getAllWordsToCheck(entry: WordEntry): string[] {
        const words = [entry.word];
        if (entry.variants && entry.variants.length > 0) {
            words.push(...entry.variants);
        }
        return words;
    }

    /**
     * Moderate content and return detailed results
     */
    moderate(content: string): ModerationResult {
        if (this.moderationLevel === ModerationLevel.OFF) {
            return {
                isClean: true,
                isWTF: false,
                foundWords: [],
                severity: null,
                sanitized: content,
                matches: []
            };
        }

        const foundWords: string[] = [];
        const foundWTFs: string[] = [];
        const matches: Array<{ word: string; severity: WordSeverity; position: number }> = [];
        let maxSeverity: WordSeverity | null = null;
        let sanitized = content;

        // Build a list of all words to check (including variants)
        const wordsToCheck: Array<{ word: string; entry: WordEntry }> = [];

        for (const entry of this.wordLibrary.values()) {
            if (!this.shouldBlock(entry.severity)) continue;

            const allWords = this.getAllWordsToCheck(entry);
            for (const word of allWords) {
                wordsToCheck.push({ word, entry });
            }
        }

        // Sort by length (longest first) to handle overlapping matches
        wordsToCheck.sort((a, b) => b.word.length - a.word.length);

        // Track which positions have already been censored
        const censoredRanges: Array<[number, number]> = [];

        const isPositionCensored = (start: number, end: number): boolean => {
            return censoredRanges.some(([cStart, cEnd]) =>
                (start >= cStart && start < cEnd) ||
                (end > cStart && end <= cEnd) ||
                (start <= cStart && end >= cEnd)
            );
        };

        // Check each word (including variants)
        for (const { word, entry } of wordsToCheck) {
            const pattern = this.createWordPattern(word);
            let match;

            // Reset regex for each word
            pattern.lastIndex = 0;

            while ((match = pattern.exec(content)) !== null) {
                // The actual matched word is in capture group 1
                const matchedWord = match[1];
                const matchStart = match.index + match[0].indexOf(matchedWord);
                const matchEnd = matchStart + matchedWord.length;

                // Skip if this position has already been censored
                if (isPositionCensored(matchStart, matchEnd)) {
                    continue;
                }

                foundWords.push(matchedWord);
                if (entry.severity === WordSeverity.WTF) {
                    foundWTFs.push(matchedWord);
                }
                matches.push({
                    word: matchedWord,
                    severity: entry.severity,
                    position: matchStart
                });

                // Track highest severity found
                if (!maxSeverity || this.getSeverityRank(entry.severity) > this.getSeverityRank(maxSeverity)) {
                    maxSeverity = entry.severity;
                }

                // Mark this range as censored
                censoredRanges.push([matchStart, matchEnd]);
            }
        }

        // Apply censoring in reverse order to maintain positions
        const sortedMatches = matches.sort((a, b) => b.position - a.position);
        for (const match of sortedMatches) {
            const replacement = this.censorChar.repeat(match.word.length);
            sanitized = sanitized.slice(0, match.position) +
                replacement +
                sanitized.slice(match.position + match.word.length);
        }

        return {
            isClean: foundWords.length === 0,
            isWTF: foundWTFs.length > 0,
            foundWords: [...new Set(foundWords)], // Remove duplicates
            severity: maxSeverity,
            sanitized,
            matches: matches.sort((a, b) => a.position - b.position)
        };
    }

    /**
     * Quick check if content is clean
     */
    isClean(content: string): boolean {
        return this.moderate(content).isClean;
    }

    /**
     * Get sanitized version of content
     */
    sanitize(content: string): string {
        return this.moderate(content).sanitized;
    }

    /**
     * Get severity ranking for comparison
     */
    private getSeverityRank(severity: WordSeverity): number {
        const ranks = {
            [WordSeverity.MILD]: 1,
            [WordSeverity.MODERATE]: 2,
            [WordSeverity.SEVERE]: 3,
            [WordSeverity.WTF]: 4
        };
        return ranks[severity];
    }

    /**
     * Get library statistics
     */
    getStats(): {
        total: number;
        mild: number;
        moderate: number;
        severe: number;
        wtf: number;
        totalVariants: number;
    } {
        const stats = {
            total: this.wordLibrary.size,
            mild: 0,
            moderate: 0,
            severe: 0,
            wtf: 0,
            totalVariants: 0
        };

        for (const entry of this.wordLibrary.values()) {
            stats[entry.severity as keyof typeof stats] = (stats[entry.severity as keyof typeof stats] || 0) + 1;
            if (entry.variants) {
                stats.totalVariants += entry.variants.length;
            }
        }

        return stats;
    }

    /**
     * Moderate a sentence with context awareness
     */
    moderateSentence(sentence: string, preserveStructure: boolean = false): ModerationResult {
        const result = this.moderate(sentence);

        if (preserveStructure && !result.isClean) {
            // Replace bad words with alternatives if available
            let sanitized = sentence;
            const sortedMatches = [...result.matches].sort((a, b) => b.position - a.position);

            for (const match of sortedMatches) {
                // Find the entry by checking all words and their variants
                let matchedEntry: WordEntry | undefined;

                for (const entry of this.wordLibrary.values()) {
                    const allWords = this.getAllWordsToCheck(entry);
                    if (allWords.some(w => w.toLowerCase() === match.word.toLowerCase())) {
                        matchedEntry = entry;
                        break;
                    }
                }

                if (matchedEntry?.alternatives && matchedEntry.alternatives.length > 0) {
                    const replacement = matchedEntry.alternatives[0];
                    sanitized = sanitized.slice(0, match.position) +
                        replacement +
                        sanitized.slice(match.position + match.word.length);
                }
            }

            result.sanitized = sanitized;
        }

        return result;
    }
}

// Export utility function for quick moderation
export function quickModerate(
    content: string,
    level: ModerationLevel = ModerationLevel.MODERATE
): ModerationResult {
    const moderator = new NoBadWord(level);
    moderator.importLibrary(badwords as WordEntry[]);
    return moderator.moderate(content);
}