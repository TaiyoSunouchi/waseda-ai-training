import { test, expect } from '@playwright/test'

test.describe('認証フロー', () => {
  test('未認証ユーザーはログインページにリダイレクトされる', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')
  })

  test('ログインページが表示される', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible()
    await expect(page.getByLabel('メールアドレス')).toBeVisible()
    await expect(page.getByLabel('パスワード')).toBeVisible()
  })

  test('無効な認証情報でログインするとエラーが表示される', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('メールアドレス').fill('wrong@example.com')
    await page.getByLabel('パスワード').fill('wrongpassword')
    await page.getByRole('button', { name: 'ログイン' }).click()
    await expect(page.getByText('メールアドレスまたはパスワードが正しくありません')).toBeVisible()
  })

  test('新規登録ページが表示される', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('heading', { name: '新規登録' })).toBeVisible()
  })
})
