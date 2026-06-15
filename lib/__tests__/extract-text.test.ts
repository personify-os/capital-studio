import { describe, it, expect } from 'vitest'
import { extOf, isSupportedDoc, extractText } from '@/lib/extract-text'

describe('extOf', () => {
  it('returns the lowercased extension', () => {
    expect(extOf('Report.PDF')).toBe('pdf')
    expect(extOf('notes.txt')).toBe('txt')
    expect(extOf('archive.tar.gz')).toBe('gz')
  })
})

describe('isSupportedDoc', () => {
  it('accepts supported document types', () => {
    expect(isSupportedDoc('a.pdf')).toBe(true)
    expect(isSupportedDoc('a.docx')).toBe(true)
    expect(isSupportedDoc('a.md')).toBe(true)
    expect(isSupportedDoc('a.csv')).toBe(true)
  })
  it('rejects unsupported types', () => {
    expect(isSupportedDoc('a.exe')).toBe(false)
    expect(isSupportedDoc('a.jpg')).toBe(false)
  })
})

describe('extractText (plain text)', () => {
  it('extracts and bounds plain text', async () => {
    const out = await extractText(Buffer.from('Hello   world\n\n\n\nfoo', 'utf8'), 'a.txt')
    expect(out).toBe('Hello world\n\nfoo')
  })
  it('truncates to maxChars', async () => {
    const out = await extractText(Buffer.from('a'.repeat(100), 'utf8'), 'a.txt', 10)
    expect(out.length).toBe(10)
  })
})
