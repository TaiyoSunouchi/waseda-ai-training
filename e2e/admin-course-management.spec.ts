import { test, expect } from '@playwright/test'

test.describe('管理者コース管理', () => {
  test.skip(!process.env.TEST_ADMIN_EMAIL, '管理者テストアカウントが設定されていません')

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('メールアドレス').fill(process.env.TEST_ADMIN_EMAIL!)
    await page.getByLabel('パスワード').fill(process.env.TEST_ADMIN_PASSWORD!)
    await page.getByRole('button', { name: 'ログイン' }).click()
    await expect(page).toHaveURL('/admin/dashboard')
  })

  test('管理者ダッシュボードが表示される', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'コース管理' })).toBeVisible()
  })

  test('新しいコースを作成できる', async ({ page }) => {
    await page.getByRole('link', { name: '+ 新しいコース' }).click()
    await page.getByLabel('タイトル').fill('テストコース')
    await page.getByRole('button', { name: '作成する' }).click()
    await expect(page).toHaveURL('/admin/dashboard')
    await expect(page.getByText('テストコース')).toBeVisible()
  })
})
