import ExcelJS from 'exceljs'

export interface PlanRow {
  day?:       string
  week?:      string
  audience?:  string
  theme?:     string
  platforms?: string
  hook?:      string
  copy?:      string
  cta?:       string
  format?:    string
}

// Map a header cell to one of our known fields by keyword (case-insensitive).
function fieldForHeader(h: string): keyof PlanRow | null {
  const s = h.toLowerCase()
  if (s.includes('hook') || s.includes('headline'))            return 'hook'
  if (s.includes('copy') || s.includes('caption') || s.includes('body')) return 'copy'
  if (s.includes('cta') || s.includes('call to action'))       return 'cta'
  if (s.includes('asset') || s.includes('format'))             return 'format'
  if (s.includes('platform') || s.includes('channel'))         return 'platforms'
  if (s.includes('audience'))                                  return 'audience'
  if (s.includes('theme') || s.includes('pillar'))             return 'theme'
  if (s.includes('week'))                                      return 'week'
  if (s.includes('day') || s.includes('date'))                 return 'day'
  return null
}

const FIELD_ORDER: (keyof PlanRow)[] = ['day', 'week', 'audience', 'theme', 'platforms', 'hook', 'copy', 'cta', 'format']

// Build PlanRows from a 2D grid (array of rows of string cells).
function rowsFromGrid(grid: string[][]): PlanRow[] {
  if (grid.length === 0) return []

  // Find the header row: the row (within the first 10) that maps the most fields.
  let headerIdx = -1
  let headerMap: Record<number, keyof PlanRow> = {}
  let bestScore = 0
  for (let i = 0; i < Math.min(grid.length, 10); i++) {
    const map: Record<number, keyof PlanRow> = {}
    grid[i].forEach((cell, col) => { const f = fieldForHeader(cell); if (f && !Object.values(map).includes(f)) map[col] = f })
    const score = Object.keys(map).length
    if (score > bestScore) { bestScore = score; headerIdx = i; headerMap = map }
  }
  if (headerIdx === -1 || bestScore < 2) return [] // not a recognizable plan grid

  const out: PlanRow[] = []
  for (let i = headerIdx + 1; i < grid.length; i++) {
    const cells = grid[i]
    const row: PlanRow = {}
    let hasContent = false
    for (const [colStr, field] of Object.entries(headerMap)) {
      const v = (cells[Number(colStr)] ?? '').trim()
      if (v) { row[field] = v; hasContent = true }
    }
    // Keep only rows that have at least a hook or copy (a real post)
    if (hasContent && (row.hook || row.copy)) out.push(row)
  }
  return out
}

function cellToString(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  // exceljs rich text / hyperlink / formula result objects
  const o = v as Record<string, unknown>
  if (typeof o.text === 'string') return o.text
  if (typeof o.result === 'string') return o.result
  if (Array.isArray(o.richText)) return (o.richText as { text?: string }[]).map((r) => r.text ?? '').join('')
  return ''
}

async function parseXlsx(buffer: Buffer): Promise<PlanRow[]> {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(buffer as unknown as ArrayBuffer)
  const ws = wb.worksheets[0]
  if (!ws) return []
  const grid: string[][] = []
  ws.eachRow({ includeEmpty: false }, (row) => {
    const values = row.values as unknown[] // 1-indexed; [0] is empty
    grid.push(values.slice(1).map(cellToString))
  })
  return rowsFromGrid(grid)
}

// Minimal RFC-4180 CSV parser (handles quoted fields with commas/newlines).
function parseCsvGrid(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else inQuotes = false
      } else field += c
    } else if (c === '"') inQuotes = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else if (c === '\r') { /* skip */ }
    else field += c
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  return rows
}

export const PLAN_ACCEPT = '.xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv'

/** Parse an uploaded plan file (.xlsx or .csv) into structured rows. */
export async function parsePlan(buffer: Buffer, fileName: string): Promise<PlanRow[]> {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'xlsx') return parseXlsx(buffer)
  if (ext === 'csv')  return rowsFromGrid(parseCsvGrid(buffer.toString('utf8')))
  throw new Error('Unsupported plan format. Use .xlsx or .csv.')
}

/** Build a generation brief string from a plan row. */
export function rowToBrief(row: PlanRow): string {
  return FIELD_ORDER
    .map((f) => {
      if (!row[f]) return null
      const labels: Record<keyof PlanRow, string> = {
        day: 'Day', week: 'Week', audience: 'Audience', theme: 'Theme',
        platforms: 'Platform(s)', hook: 'Hook/Headline', copy: 'Draft copy', cta: 'Call to action', format: 'Asset/Format',
      }
      return `${labels[f]}: ${row[f]}`
    })
    .filter(Boolean)
    .join('\n')
}
