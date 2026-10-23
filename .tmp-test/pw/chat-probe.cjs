const { chromium } = require('playwright-core')
const EXEC = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'

async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: EXEC })
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.goto('http://localhost:5173/chat', { timeout: 15000 })
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500)
  const info = await page.evaluate(() => {
    const ta = document.querySelector('textarea')
    if (!ta) return { found: false }
    const parent = ta.parentElement
    const r = ta.getBoundingClientRect()
    const pr = parent.getBoundingClientRect()
    const cs = getComputedStyle(ta)
    const pcs = getComputedStyle(parent)
    return {
      textarea: {
        rect: { w: Math.round(r.width), h: Math.round(r.height) },
        computed: { width: cs.width, height: cs.height, fieldSizing: cs.fieldSizing, rows: ta.rows, padding: cs.padding },
      },
      parentDiv: {
        rect: { w: Math.round(pr.width), h: Math.round(pr.height) },
        computed: { width: pcs.width, height: pcs.height, boxSizing: pcs.boxSizing },
      },
    }
  })
  console.log(JSON.stringify(info, null, 2))
  await page.screenshot({ path: '/Users/amh/react-info-agg/.tmp-test/chat.png' })
  await browser.close()
}
main().catch((e) => { console.error('ERR:', e.message); process.exit(1) })
