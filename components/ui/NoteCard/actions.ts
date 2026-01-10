class TextInputHandler {
    private maxChars: number;
    private onContentChange?: (content: string) => void;

    constructor(
        maxChars: number,
        onContentChange?: (content: string) => void
    ) {
        this.maxChars = maxChars;
        this.onContentChange = onContentChange;
    }

    /**
     * Limits word length by inserting hyphens every 20 characters in long words
     */
    private limitWordLength(text: string): string {
        return text.split(/(\s+)/).map(word => {
            // Preserve whitespace
            if (/^\s+$/.test(word)) return word;

            // Split by existing hyphens to preserve them
            const segments = word.split('-');

            // Process each segment independently
            const processedSegments = segments.map(segment => {
                // Only break segments that are longer than 20 chars
                if (segment.length > 20) {
                    const chunks = [];
                    for (let i = 0; i < segment.length; i += 20) {
                        chunks.push(segment.slice(i, i + 20));
                    }
                    return chunks.join('-');
                }
                return segment;
            });

            // Rejoin with original hyphens
            return processedSegments.join('-');
        }).join('');
    }

    /**
     * Limits total character count to maxChars
     */
    private limitChars(text: string): string {
        if (text.length > this.maxChars) {
            return text.substring(0, this.maxChars);
        }
        return text;
    }

    /**
     * Handles textarea change events with word and character limiting
     */
    public handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const target = e.target;
        const cursorPosition = target.selectionStart;
        let newText = target.value;

        // Apply word length limiting
        newText = this.limitWordLength(newText);

        // Apply character limiting
        newText = this.limitChars(newText);

        // Only update if the text changed after limiting
        if (newText !== target.value) {
            target.value = newText;
            // Try to restore cursor position, but cap at text length
            const newCursorPos = Math.min(cursorPosition, newText.length);
            target.selectionStart = target.selectionEnd = newCursorPos;
        }

        if (this.onContentChange) {
            this.onContentChange(newText);
        }
    };

    /**
     * Handles paste events with word and character limiting
     */
    public handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>): void => {
        e.preventDefault();
        let text = e.clipboardData.getData('text/plain');

        // Apply word length limiting
        text = this.limitWordLength(text);

        // Get current cursor position and existing text
        const target = e.currentTarget;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const currentText = target.value;

        // Construct new text with paste
        const beforeCursor = currentText.substring(0, start);
        const afterCursor = currentText.substring(end);
        let newText = beforeCursor + text + afterCursor;

        // Apply character limiting
        newText = this.limitChars(newText);

        // Set value
        target.value = newText;

        // Set cursor position after pasted content
        const newCursorPos = Math.min(beforeCursor.length + text.length, newText.length);
        target.selectionStart = target.selectionEnd = newCursorPos;

        // Trigger change event
        if (this.onContentChange) {
            this.onContentChange(newText);
        }
    };

    /**
     * Updates the maxChars limit
     */
    public setMaxChars(maxChars: number): void {
        this.maxChars = maxChars;
    }

    /**
     * Updates the callback function
     */
    public setOnContentChange(callback: (content: string) => void): void {
        this.onContentChange = callback;
    }
}

class NewlineTrimmer {
    /**
     * Trims all newlines without text, allowing max one newline before text
     * 
     * Examples:
     * "\n\n\nHello" -> "\nHello"
     * "Hello\n\n\nWorld" -> "Hello\nWorld"
     * "\n\n" -> ""
     * "Hello\n\nWorld\n\n\nTest" -> "Hello\nWorld\nTest"
     */
    public trim(text: string): string {
        // Remove leading newlines (keep max 1)
        text = text.replace(/^\n+/, (match) => match.length > 0 ? '\n' : '');

        // Remove trailing newlines
        text = text.replace(/\n+$/, '');

        // Replace multiple consecutive newlines with single newline
        text = text.replace(/\n{2,}/g, '\n');

        return text;
    }

    /**
     * Alternative implementation that's more explicit about "text"
     * Treats any non-whitespace character as text
     */
    public trimStrict(text: string): string {
        // Split by newlines
        const lines = text.split('\n');
        const result: string[] = [];
        let lastWasEmpty = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const hasContent = line.trim().length > 0;

            if (hasContent) {
                // If last was empty and we have content, add one newline separator
                if (lastWasEmpty && result.length > 0) {
                    result.push('');
                }
                result.push(line);
                lastWasEmpty = false;
            } else {
                // Empty line
                lastWasEmpty = true;
            }
        }

        return result.join('\n');
    }

    /**
     * Process textarea input with newline trimming
     */
    public processInput(input: string): string {
        return this.trim(input);
    }
}

export { TextInputHandler, NewlineTrimmer };