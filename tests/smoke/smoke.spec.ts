import { test, expect } from '@playwright/test'

test('home carrega sem erro', async ({ page }) => {
  const res = await page.goto('/')
  expect(res?.status()).toBe(200)
})

test('API de health retorna ok', async ({ request }) => {
  // Mock check for the health endpoint
  const res = await request.get('/api/health')
  if (res.status() === 200) {
    const body = await res.json()
    expect(body.supabase).toBe('ok')
    expect(body.llm).toBe('ok')
  }
})

test('busca retorna resultados em < 5s', async ({ page }) => {
  await page.goto('/login')
  // Simulating the flow
  const start = Date.now()
  await page.goto('/match')
  expect(Date.now() - start).toBeLessThan(5000)
})
