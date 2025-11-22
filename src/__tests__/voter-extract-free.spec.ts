import { describe, it, expect } from 'vitest'
import { parseVotersFromText, extractPageMetadata } from '@/app/api/voter-extract-free/analyze-page/route'

const SAMPLE_TEXT = `
Municipal Voter List
Ward Part No. 5 : 12
Ward Part Name. SHIVAJI NAGAR
172/25/001
Age As On: 01-01-2024  Publication Date: 15-05-2024

Sr No: 001
Name: RAM SHARMA
Father/Husband: MOHAN SHARMA
Gender: Male  Age: 45
House No: 123-B
EPIC No: ABC1234567

क्रमांक: 002
नाम: सीता देवी
पिता/पति: रमेश
महिला  वय: 39
घर क्रमांक: 45/2
EPIC No: XYZ9876543
`

describe('OCR Free Parser', () => {
  it('extracts page-level metadata', () => {
    const meta = extractPageMetadata(SAMPLE_TEXT)
    expect(meta.wardPartNo).toBe('5 : 12')
    expect(meta.wardPartName).toBe('SHIVAJI NAGAR')
    expect(meta.acPartInfo).toBe('172/25/001')
    expect(meta.ageAsOn).toBe('01-01-2024')
    expect(meta.publicationDate).toBe('15-05-2024')
  })

  it('parses voters with EPIC, names, and house numbers', () => {
    const meta = extractPageMetadata(SAMPLE_TEXT)
    const voters = parseVotersFromText(SAMPLE_TEXT, meta)
    expect(voters.length).toBe(2)

    const v1 = voters.find(v => v.voterId === 'ABC1234567')!
    expect(v1.name?.toUpperCase()).toContain('RAM SHARMA')
    expect(v1.fatherOrHusbandName?.toUpperCase()).toContain('MOHAN SHARMA')
    expect(v1.gender?.toLowerCase()).toContain('male')
    expect(v1.age).toBe('45')
    expect(v1.houseNumber).toBe('123-B')
    expect((v1 as any).acPartInfo).toBe('172/25/001')
    expect((v1 as any).wardPartNo).toBe('5 : 12')
    expect((v1 as any).wardPartName).toBe('SHIVAJI NAGAR')

    const v2 = voters.find(v => v.voterId === 'XYZ9876543')!
    expect(v2.name).toContain('सीता देवी')
    expect(v2.fatherOrHusbandName).toContain('रमेश')
    expect(v2.gender).toMatch(/महिला|Female|F/)
    expect(v2.age).toBe('39')
    expect(v2.houseNumber).toBe('45/2')
  })
})

