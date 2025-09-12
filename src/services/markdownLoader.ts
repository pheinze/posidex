import { marked } from 'marked';
import { locale } from '../locales/i18n';
import { get } from 'svelte/store';

/**
 * Represents the processed content of an instruction file.
 */
interface InstructionContent {
    /** The HTML content, converted from Markdown. */
    html: string;
    /** The title extracted from the first H1 tag of the Markdown file. */
    title: string;
}

/**
 * Loads and parses a specific instruction file based on the current locale.
 * It dynamically imports the raw Markdown content, converts it to HTML,
 * and extracts the main title.
 * @param name - The name of the instruction set to load ('dashboard', 'journal', 'changelog', 'guide').
 * @returns A Promise that resolves to an object containing the HTML content and title.
 */
export async function loadInstruction(name: 'dashboard' | 'journal' | 'changelog' | 'guide'): Promise<InstructionContent> {
    const currentLocale = get(locale);
    const filePath = `/instructions/${name}.${currentLocale}.md`;

    try {
        // Dynamically import the markdown file content
        // Vite/SvelteKit handles this import.meta.glob for static assets
        const modules = import.meta.glob('/src/instructions/*.md', { query: '?raw', import: 'default' });
        const modulePath = `/src${filePath}`;
        
        if (!modules[modulePath]) {
            throw new Error(`Markdown file not found: ${modulePath}`);
        }

        const markdownContent = await modules[modulePath]() as string;
        const htmlContent = await marked(markdownContent);

        // Extract title from the first line (assuming it's an H1)
        const firstLine = markdownContent.split('\n')[0];
        const titleMatch = firstLine.match(/^#\s*(.*)/);
        const title = titleMatch ? titleMatch[1] : '';

        return { html: htmlContent, title: title };

    } catch (error) {
        console.error(`Failed to load or parse markdown for ${name} in ${currentLocale}:`, error);
        return { html: `<p>Error loading instructions.</p>`, title: 'Error' };
    }
}