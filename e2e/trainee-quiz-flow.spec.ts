import { test, expect } from '@playwright/test'

// 注意: このテストは有効なテストアカウントが必要です
// 環境変数 TEST_TRAINEE_EMAIL, TEST_TRAINEE_PASSWORD を設定してください

test.describe('研修者クイズフロー', () => {
  test.skip(!process.env.TEST_TRAINEE_EMAIL, 'テストアカウントが設定されていません')

  test.beforeEach(async ({ page }) => {
    // ログイン
    await page.goto('/login')
    await page.getByLabel('メールアドレス').fill(process.env.TEST_TRAINEE_EMAIL!)
    await page.getByLabel('パスワード').fill(process.env.TEST_TRAINEE_PASSWORD!)
    await page.getByRole('button', { name: 'ログイン' }).click()
    await expect(page).toHaveURL('/dashboard')
  })

  test('ダッシュボードでコース一覧が表示される', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'コース一覧' })).toBeVisible()
  })

  test('管理者パネルへのアクセスが拒否される', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page).toHaveURL('/dashboard')
  })
})
