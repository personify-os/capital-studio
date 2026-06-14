/**
 * Server-side text extraction for reference documents.
 *
 * Plain-text formats (txt/md/csv) are read directly; PDF and Word (.docx) are
 * binary and must be parsed here — they cannot be read as text in the browser.
 *
 * Magic-byte validation (never trust the browser-supplied MIME) lives in the
 * route that calls this; this module assumes the buffer is already an allowed type.
 */

export const DOC_EXTENSIONS = ['txt', 'md', 'markdown', 'csv', 'pdf', 'docx'] as const
export type DocExtension = (typeof DOC_EXTENSIONS)[number]

// Human-facing accept attribute for the file input + the MIME types browsers report.
export const DOC_ACCEPT =
  '.txt,.md,.markdown,.csv,.pdf,.docx,' +
  'text/plain,text/markdown,text/csv,application/pdf,' +
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

const PLAIN_TEXT_EXTS = new Set(['txt', 'md', 'markdown', 'csv'])

export function extOf(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() ?? ''
}

/** True if the filename has a supported document extension. */
export function isSupportedDoc(fileName: string): boolean {
  return (DOC_EXTENSIONS as readonly string[]).includes(extOf(fileName))
}

/**
 * Extract plain text from a document buffer.
 * @param maxChars truncates the result (keeps payloads to the model bounded). Default 4000.
 * @returns trimmed extracted text, or '' if nothing could be extracted.
 */
export async function extractText(
  buffer: Buffer,
  fileName: string,
  maxChars = 4000,
): Promise<string> {
  const ext = extOf(fileName)
  let text = ''

  if (PLAIN_TEXT_EXTS.has(ext)) {
    text = buffer.toString('utf8')
  } else if (ext === 'pdf') {
    // pdf-parse v2 is class-based (no default export). It appends "-- N of M --"
    // page markers to the text — strip them so they don't leak into the model.
    const { PDFParse } = await import('pdf-parse')
    const parser = new PDFParse({ data: buffer })
    try {
      const { text: pdfText } = await parser.getText()
      text = pdfText.replace(/^-- \d+ of \d+ --$/gm, '')
    } finally {
      await parser.destroy()
    }
  } else if (ext === 'docx') {
    const mammoth = await import('mammoth')
    const { value } = await mammoth.extractRawText({ buffer })
    text = value
  } else {
    throw new Error(`Unsupported document type: .${ext}`)
  }

  // Collapse runaway whitespace from PDF/DOCX extraction, then bound length.
  return text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, maxChars)
}
