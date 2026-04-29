import { describe, it, expect } from 'vitest'

const formatZapMatch = (data: any) => {
  const { titulo, org, score, link, email } = data
  let msg = `*NIT UFV Match*\nNovo match: ${titulo} com ${org}\nScore: ${score}%\nLink: ${link}`
  return msg
}

describe('formatZapMatch', () => {
  it('formata mensagem com score > 85% corretamente', () => {
    const msg = formatZapMatch({ titulo: 'Nano X', org: 'Beta Corp', score: 92, link: 'https://a.co/1' })
    expect(msg).toContain('*NIT UFV Match*')
    expect(msg).toContain('92%')
    expect(msg).toContain('https://a.co/1')
  })

  it('não envia e-mails ou CPFs na mensagem', () => {
    const msg = formatZapMatch({ titulo: 'T', org: 'O', score: 90, link: 'https://x.co', email: 'secreto@ufv.br' })
    expect(msg).not.toContain('secreto@ufv.br')
  })
})
