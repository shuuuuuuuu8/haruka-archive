// 本番スモークテスト（読み取り専用・依存ゼロ）
// 使い方: node scripts/smoke.mjs
// クリティカルな動線が生きているかだけを最速で確認する。

const BASE = process.env.SMOKE_BASE_URL ?? 'https://www.musubi-sozaibank.com'

let failed = 0

async function check(name, fn) {
  try {
    await fn()
    console.log(`✅ ${name}`)
  } catch (e) {
    failed++
    console.error(`❌ ${name}: ${e.message}`)
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

await check('トップページが表示される', async () => {
  const res = await fetch(`${BASE}/`)
  assert(res.status === 200, `status ${res.status}`)
  const html = await res.text()
  assert(html.includes('結'), 'サイト名が見当たらない')
})

await check('素材一覧が未ログインで表示される', async () => {
  const res = await fetch(`${BASE}/materials`)
  assert(res.status === 200, `status ${res.status}`)
  const html = await res.text()
  assert(html.includes('素材'), '一覧の中身が見当たらない')
})

await check('来歴ページ: 存在しないIDは404（500ではない）', async () => {
  const res = await fetch(`${BASE}/m/ffffffffffff`)
  assert(res.status === 404, `status ${res.status}（500はコード破損の疑い）`)
})

await check('通知API: 不正なシークレットは401で拒否', async () => {
  const res = await fetch(`${BASE}/api/notify-message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-webhook-secret': 'smoke-test-wrong' },
    body: '{}',
  })
  assert(res.status === 401, `status ${res.status}（401以外＝シークレット照合が壊れている）`)
})

await check('画像なし素材のプレースホルダーが配信される', async () => {
  const res = await fetch(`${BASE}/placeholder-material.svg`)
  assert(res.status === 200, `status ${res.status}`)
})

if (failed > 0) {
  console.error(`\n${failed} 件失敗`)
  process.exit(1)
}
console.log('\nすべて合格')
