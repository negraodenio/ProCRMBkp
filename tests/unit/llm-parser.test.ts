import { describe, it, expect } from 'vitest'

const parseMatchResponse = (raw: string) => {
  if (raw.includes('Não encontrei')) return []
  const matches = []
  const regex = /(\d+)\.\s+(.+?)\s+·\s+(.+?)\s+·\s+(\d+)%/g
  let match
  while ((match = regex.exec(raw)) !== null) {
    matches.push({ name: match[2], score: parseInt(match[4]) })
  }
  return matches
}

describe('parseMatchResponse', () => {
  it('extrai lista de matches do texto do LLM', () => {
    const raw = `1. Empresa Alpha · Agronegócio · 89% ...`
    const matches = parseMatchResponse(raw)
    expect(matches).toHaveLength(1)
    expect(matches[0].score).toBe(89)
  })

  it('retorna array vazio se LLM não encontrou matches', () => {
    const raw = 'Não encontrei pesquisas suficientemente próximas.'
    expect(parseMatchResponse(raw)).toEqual([])
  })
})
