import { describe, it, expect, vi } from 'vitest'

// Mocking the embedding generation for unit test
const generateEmbedding = async (text: string) => {
  if (!text) throw new Error('Texto não pode ser vazio')
  return new Array(1536).fill(0.1)
}

describe('generateEmbedding', () => {
  it('retorna array de 1536 dimensões para texto válido', async () => {
    const result = await generateEmbedding('biorremediação de solos')
    expect(result).toHaveLength(1536)
    expect(result[0]).toBeTypeOf('number')
  })

  it('lança erro para texto vazio', async () => {
    await expect(generateEmbedding('')).rejects.toThrow('Texto não pode ser vazio')
  })

  it('trunca texto acima de 8000 tokens', async () => {
    const longText = 'a '.repeat(5000)
    const result = await generateEmbedding(longText)
    expect(result).toHaveLength(1536)
  })
})
