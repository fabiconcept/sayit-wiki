/**
 * Word Library Module
 * 
 * @module core/library
 * @description Comprehensive word library for content moderation with severity classifications
 * 
 * @remarks
 * This library is expandable and should be customized based on your specific needs.
 * The default library provides a foundation that can be extended using:
 * - {@link ProfanityGuard.addWord}
 * - {@link ProfanityGuard.addWords}
 * - {@link ProfanityGuard.importLibrary}
 */

import { WordEntry, WordSeverity } from "./type";
import data from "./words.json"

/**
 * Complete word library with severity classifications and alternatives
 * 
 * @const {Array<Object>} all_bad_words
 * @property {string} word - The base word to moderate
 * @property {WordSeverity} severity - Severity classification (mild, moderate, severe, wtf)
 * @property {string[]} alternatives - Suggested replacement words for structure preservation
 * @property {string[]} [variants] - Common obfuscated variations (handled automatically by pattern matching)
 * 
 */

const library: WordEntry[] = data.map(w => ({
    ...w,
    severity: w.severity as WordSeverity
}))

/**
 * Filtered array of MILD severity words
 * 
 * @const {Array<Object>} mild_bad_words
 * @description Contains only words classified as MILD severity
 * 
 */
const mild_bad_words = library.filter(word => word.severity === WordSeverity.MILD);

/**
 * Filtered array of MODERATE severity words
 * 
 * @const {Array<Object>} moderate_bad_words
 * @description Contains only words classified as MODERATE severity
 * 
 */
const moderate_bad_words = library.filter(word => word.severity === WordSeverity.MODERATE);

/**
 * Filtered array of SEVERE severity words
 * 
 * @const {Array<Object>} severe_bad_words
 * @description Contains only words classified as SEVERE severity
 * 
 */
const severe_bad_words = library.filter(word => word.severity === WordSeverity.SEVERE);

/**
 * Filtered array of WTF severity words
 * 
 * @const {Array<Object>} wtf_bad_words
 * @description Contains only words classified as WTF (absolutely not) severity 
 * 
 */
const wtf_bad_words = library.filter(word => word.severity === WordSeverity.WTF);

// Named exports for filtered libraries
export { mild_bad_words, moderate_bad_words, severe_bad_words, wtf_bad_words };

/**
 * Complete unfiltered word library
 * 
 * @alias all_bad_words
 * @description Exports the complete library with all severity levels
 */
export { library as all_bad_words };