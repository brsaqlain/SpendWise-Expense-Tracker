/* Headless smoke test of the SpendWise main user journey using puppeteer-core + local Chrome */
import puppeteer from 'puppeteer-core'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE = 'http://localhost:4173'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let failures = 0
const ok = (cond, label) => {
  console.log((cond ? '  PASS' : '  FAIL') + ' — ' + label)
  if (!cond) failures++
}
const text = async () => page.evaluate(() => document.body.innerText)

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-first-run', '--window-size=420,860', '--disable-gpu'],
  defaultViewport: { width: 400, height: 840 },
})
const page = await browser.newPage()
page.on('pageerror', (e) => { console.log('  PAGE ERROR:', e.message); failures++ })

await page.goto(BASE, { waitUntil: 'networkidle0' })

/* Screen 1: Splash */
await sleep(400)
ok((await text()).includes('Understand your money'), 'Splash shows tagline')

/* Screen 2: Onboarding — walk the carousel */
await sleep(2600)
await page.waitForFunction(() => document.body.innerText.includes('Track every rupee'), { timeout: 8000 })
ok((await text()).includes('Next — Understand your money'), 'Onboarding slide 1 with primary CTA')
await page.evaluate(() => {
  ;[...document.querySelectorAll('button')].find((b) => b.innerText.startsWith('Next'))?.click()
})
await sleep(500)
ok((await text()).includes('Budgets that stick'), 'Onboarding slide 2 reached')
await page.evaluate(() => {
  ;[...document.querySelectorAll('button')].find((b) => b.innerText.startsWith('Next'))?.click()
})
await sleep(500)
ok((await text()).includes('Get Started'), 'Onboarding slide 3 shows Get Started')
await page.evaluate(() => {
  ;[...document.querySelectorAll('button')].find((b) => b.innerText.includes('Get Started'))?.click()
})
await page.waitForFunction(() => document.body.innerText.includes('Recent transactions'), { timeout: 8000 })
ok(true, 'Get Started navigates to dashboard')

/* Screen 3: Dashboard */
await page.waitForFunction(() => document.body.innerText.includes('Recent transactions'), { timeout: 8000 })
await sleep(500)
const dash = await text()
ok(dash.includes('Good'), 'Greeting shown')
const balMatch = dash.match(/Total balance this month[\s\S]*?₹([\d,]+)/)
ok(balMatch, 'Balance displayed (₹' + balMatch?.[1] + ')')
const beforeBalance = balMatch ? Number(balMatch[1].replace(/,/g, '')) : 0
const dashSvgs = await page.evaluate(() => document.querySelectorAll('svg').length)
ok(dash.includes('Recent transactions') && dash.includes('Monthly spending overview') && dashSvgs >= 2, `Chart + recent list render (${dashSvgs} svgs)`)
let beforeExpense = await page.evaluate(() => {
  const d = JSON.parse(localStorage.getItem('spendwise.v1'))
  return d.transactions.filter((t) => t.date.startsWith(d.transactions[0].date.slice(0, 7)) && t.type === 'expense').reduce((a, t) => a + t.amount, 0)
})

/* Savings reachable by click from dashboard */
await page.evaluate(() => {
  ;(document.querySelector('a[href="#/savings"]'))?.click()
})
await page.waitForFunction(() => document.body.innerText.includes('Savings Goals'), { timeout: 6000 })
ok((await text()).includes('Goal achieved!') || (await text()).includes('of'), 'Savings opens via dashboard card')
await page.goBack()
await sleep(500)

/* Add expense journey */
await page.click('.btn-fab')
await page.waitForFunction(() => document.body.innerText.includes('Add Transaction'))
await sleep(300)
ok((await text()).includes('Payment method'), 'Add screen shows payment methods')
await page.click('.screen input[type=number]')
await page.type('.screen input[type=number]', '500')
await page.type('.screen input[placeholder*="Mess dinner"]', 'Viva demo dinner')
await sleep(150)
const firstCat = await page.$$('.screen [aria-pressed]')
await firstCat[0].click()
await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find((b) => b.innerText.includes('Save Transaction'))
  btn?.click()
})
await page.waitForFunction(() => document.body.innerText.includes('Confirm transaction'))
ok(true, 'Validation passed, confirmation dialog opened')
await page.evaluate(() => {
  const btn = [...document.querySelectorAll('.modal button')].find((b) => b.innerText.includes('save it'))
  btn?.click()
})
await page.waitForFunction(() => document.body.innerText.includes('Recent transactions'), { timeout: 8000 })
await sleep(900)
const after = await text()
const afterBal = Number((after.match(/Total balance this month[\s\S]*?₹([\d,]+)/) || [])[1]?.replace(/,/g, '') || 0)
ok(afterBal === beforeBalance - 500, `Balance updated after expense (${beforeBalance} -> ${afterBal})`)
ok(after.includes('Viva demo dinner'), 'New transaction appears in recent list')
const afterExpense = await page.evaluate(() => {
  const d = JSON.parse(localStorage.getItem('spendwise.v1'))
  return d.transactions.filter((t) => t.date.startsWith(d.transactions[0].date.slice(0, 7)) && t.type === 'expense').reduce((a, t) => a + t.amount, 0)
})
ok(afterExpense === beforeExpense + 500, `Month expense total updated (${beforeExpense} -> ${afterExpense})`)

/* Transaction detail + edit */
await page.evaluate(() => {
  const row = [...document.querySelectorAll('.row-item')].find((b) => b.innerText.includes('Viva demo dinner'))
  row?.click()
})
await page.waitForFunction(() => document.body.innerText.includes('Payment method'))
await sleep(300)
ok((await text()).includes('Transaction Details'), 'Detail screen opens')
await page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) => x.innerText.includes('Edit'))
  b?.click()
})
try {
  await page.waitForFunction(() => document.body.innerText.includes('Edit Transaction'), { timeout: 6000 })
} catch {
  console.log('  EDIT NAV DEBUG: url=', page.url(), ' text=', (await page.evaluate(() => document.body.innerText.slice(0, 160))).replace(/\n/g, ' | '))
  throw new Error('edit navigation stalled')
}
await page.evaluate(() => {
  const inp = document.querySelector('input[type=number]')
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  setter.call(inp, '600')
  inp.dispatchEvent(new Event('input', { bubbles: true }))
})
await page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) => x.innerText.includes('Save Transaction'))
  b?.click()
})
try {
  await page.waitForFunction(() => document.body.innerText.includes('Yes, save it'), { timeout: 6000 })
} catch {
  throw new Error('edit confirm stalled')
}
await page.evaluate(() => {
  const b = [...document.querySelectorAll('.modal button')].find((x) => x.innerText.includes('save it'))
  b?.click()
})
await sleep(1200)
const updated = await page.evaluate(() => JSON.parse(localStorage.getItem('spendwise.v1')).transactions.find((t) => t.title === 'Viva demo dinner').amount)
ok(updated === 600, `Edit persisted (amount now ${updated})`)

/* Transactions list: search + tabs */
await page.goto(BASE + '/#/transactions', { waitUntil: 'networkidle0' })
await sleep(400)
await page.type('input[aria-label="Search transactions"]', 'Viva demo')
await sleep(400)
ok((await text()).includes('Viva demo dinner'), 'Search finds transaction')
emptyCheck: {
  await page.evaluate(() => {
    const inp = document.querySelector('input[aria-label="Search transactions"]')
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    setter.call(inp, 'zzzz-no-match')
    inp.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await sleep(400)
  const t = await text()
  ok(t.includes('No transactions found'), 'Empty state on no match')
}

/* Budgets */
await page.goto(BASE + '/#/budgets', { waitUntil: 'networkidle0' })
await sleep(600)
const budgetText = await text()
ok(budgetText.includes('Monthly budget'), 'Budget summary renders')
ok(budgetText.includes('Food'), 'Category budgets render')
if (budgetText.includes('exceeded')) console.log('  PASS — exceeded-budget warning visible')

/* Analytics */
await page.goto(BASE + '/#/analytics', { waitUntil: 'networkidle0' })
await sleep(600)
const an = await text()
ok(an.includes('Expense breakdown by category'), 'Donut section renders')
ok(an.includes('Income vs expenses'), 'Bar chart section renders')
ok(an.includes('Insights'), 'Insights render')
const svgCount = await page.evaluate(() => document.querySelectorAll('svg').length)
ok(svgCount >= 3, `Charts rendered (${svgCount} svg elements)`)

/* Savings */
await page.goto(BASE + '/#/savings', { waitUntil: 'networkidle0' })
await sleep(400)
const sav = await text()
ok(sav.includes('Emergency Fund') || sav.includes('MacBook'), 'Goals render')
ok(sav.includes('Goal achieved!'), 'Achieved state visible')
await page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) => x.innerText.includes('Add money'))
  b?.click()
})
await page.waitForFunction(() => document.body.innerText.includes('Add to savings'))
await page.type('.modal input[type=number]', '1000')
await page.evaluate(() => {
  const b = [...document.querySelectorAll('.modal button')].find((x) => x.innerText.includes('Add money'))
  b?.click()
})
await sleep(600)
const sav2 = await page.evaluate(() => JSON.parse(localStorage.getItem('spendwise.v1')).goals[0].saved)
ok(sav2 > 34200, `Goal savings updated (${sav2})`)

/* Profile + dark mode */
await page.goto(BASE + '/#/profile', { waitUntil: 'networkidle0' })
await sleep(400)
ok((await text()).includes('Dark mode'), 'Settings list renders')
await page.evaluate(() => {
  const b = [...document.querySelectorAll('[role="button"], button')].find((x) => x.innerText.trim().startsWith('Dark mode'))
  b?.click()
})
await sleep(400)
const theme = await page.evaluate(() => document.documentElement.dataset.theme)
ok(theme === 'dark', 'Dark mode toggled')
ok((await text()).includes('Logout'), 'Logout button present')

/* Bottom nav works */
await page.click('.bottom-nav a:nth-child(1)')
await sleep(400)
ok((await text()).includes('Recent transactions'), 'Bottom nav returns Home')

const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2)
ok(noOverflow, 'No horizontal overflow at mobile viewport')

console.log('----')
console.log(failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED')
await browser.close()
process.exit(failures === 0 ? 0 : 1)
