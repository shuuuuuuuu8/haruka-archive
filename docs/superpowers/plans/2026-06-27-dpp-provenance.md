# 来歴/DPP 信頼性・充足度の改善 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 来歴/DPP の8つの欠点を直し、来歴ページを「成約後も生きる・正直・高精度」にし、堀となる構造化来歴データが実際に埋まるようにする。

**Architecture:** 2リポジトリ。Phase 1 = 買い手側 `haruka-archive`（表示・取得）、Phase 2 = 提供元側 `musubi sozai`（データ投入）。DBマイグレーション無し。来歴IDはプレフィックス（hex）で素材を解決し、`is_available` に関わらず1件取得する。AI解析は既存 OpenAI gpt-4o-mini のまま柄/組成/技法も下書きさせる。

**Tech Stack:** Next.js 16（破壊的変更あり）, TypeScript, Supabase(@supabase/ssr), Zod, OpenAI SDK。

## Global Constraints

- **DBマイグレーション禁止**。変更は表示・jsonb属性（既存）・ID長・AIプロンプト・フォームのみ。
- **Next.js 16**: コード着手前に `node_modules/next/dist/docs/` の該当ガイドを確認（両リポジトリ AGENTS.md）。
- **テスト基盤が無い**（`dev/build/start/lint` のみ）。各タスクの検証は `npm run lint` ＋ `npm run build`（型チェック兼ねる）＋ 実機目視。新規テスト基盤は導入しない（スコープ外）。
- **AIプロバイダ変更禁止**（OpenAI gpt-4o-mini のまま）。
- **ブランチ運用**: 各リポジトリは現在 `main`。実装前に作業ブランチを切る（`feat/dpp-provenance`）。コミットはユーザーの承認時に行う。
- 来歴IDのプレフィックスは hex（UUIDの先頭）。解決はプレフィックス長に依存せず（8桁/12桁両対応）。

---

## 事前準備（両リポジトリ）

- [ ] **Step 0a: 作業ブランチを切る（haruka-archive）**

```bash
git -C "/c/Users/yasyy/haruka-archive" checkout -b feat/dpp-provenance
```

- [ ] **Step 0b: 作業ブランチを切る（musubi sozai）**

```bash
git -C "/c/Users/yasyy/musubi sozai" checkout -b feat/dpp-provenance
```

- [ ] **Step 0c: Next.js 16 のデータ取得/dynamic ルートのガイドを確認**

`musubi sozai` と `haruka-archive` の `node_modules/next/dist/docs/` を開き、App Router の `generateStaticParams` / `dynamicParams` / server components のデータ取得周りに破壊的変更が無いか確認する。

---

# Phase 1 — 買い手側 `haruka-archive`

ファイル責務マップ:
- `src/types/material.ts` — `Material` 型に生フィールド `eraText`/`regionText` を加法追加。
- `src/lib/musubi-materials.ts` — 行→Material変換を `mapRow` に抽出し一覧と単一取得で共有。`fetchMusubiMaterialByProvenanceId` と uuid 範囲ヘルパを新設。来歴IDを12桁化。
- `src/app/m/[id]/page.tsx` — 単一取得へ切替、年代/産地の生データ表示、自己申告注記。

### Task 1: `Material` 型の生フィールド追加 ＋ `mapRow` 抽出 ＋ 来歴ID 12桁化

**Files:**
- Modify: `src/types/material.ts`（`Material` インターフェースに2フィールド追加）
- Modify: `src/lib/musubi-materials.ts:99-174`（`mapRow` 抽出、生フィールド設定、id を12桁に）

**Interfaces:**
- Produces: `Material.eraText?: string`、`Material.regionText?: string`。`mapRow(m: MusubiMaterialRow): Material`（モジュール内 export）。来歴ID = `MSB-` + UUID先頭**12桁**大文字。

- [ ] **Step 1: `Material` 型に生フィールドを追加**

`src/types/material.ts` の `Material` インターフェースに以下2行を追加（`era` の近く）:

```typescript
  /** 提供元が入力した生の年代文字列（例: 「昭和30年代」）。丸めない。来歴ページ用。 */
  eraText?: string
  /** 提供元が入力した生の産地。空なら未設定（「日本」補完しない）。来歴ページ用。 */
  regionText?: string
```

- [ ] **Step 2: 行→Material変換を `mapRow` に抽出**

`src/lib/musubi-materials.ts` の `fetchMusubiMaterials` 内 `.map((m) => { ... })` のコールバック本体を、モジュールスコープの関数 `mapRow` に切り出す。`fetchMusubiMaterials` は `return (data as unknown as MusubiMaterialRow[]).map(mapRow)` にする。

```typescript
export function mapRow(m: MusubiMaterialRow): Material {
  const images = (m.material_images ?? [])
    .slice()
    .sort((a, b) => a.order_index - b.order_index)
  const imageUrls =
    images.length > 0
      ? images.map((img) => getMusubiImageUrl(img.storage_path))
      : ['/placeholder-material.jpg']

  const category = ITEM_CATEGORY_MAP[m.category] ?? 'その他'

  const COLOR_GROUP_VALUES: ColorGroup[] = ['白系', '黒系', '藍系', '赤系', '金系', '茶系', '緑系', '多色', 'その他']
  const colorGroup: ColorGroup = (COLOR_GROUP_VALUES.includes(m.color as ColorGroup) ? m.color : 'その他') as ColorGroup

  return {
    id: `MSB-${m.id.slice(0, 12).toUpperCase()}`,
    sourceId: m.id,
    name: m.name,
    category,
    materialType: fabricLabels[m.fabric_type] ?? '不明',
    color: colorGroup,
    pattern: 'その他' as PatternType,
    origin: m.region ?? '日本',
    era: mapEra(m.era),
    eraText: m.era ?? undefined,
    regionText: m.region ?? undefined,
    supplier: 'MUSUBI素材',
    supplierName: m.supplier_profiles?.display_name ?? undefined,
    attributes: (m.attributes as Material['attributes']) ?? undefined,
    quantity: m.quantity,
    quantityUnit: '点',
    quantitySize: mapQuantitySize(m.quantity),
    priceRange: mapPriceRange(m.price, m.is_negotiable),
    status: 'public',
    recommendedUses: ['アップサイクル', 'アート'],
    story: m.story ?? '',
    characteristics: m.cultural_significance ?? '',
    images: imageUrls,
    tags: [
      categoryLabels[m.category] ?? 'その他',
      fabricLabels[m.fabric_type] ?? '不明',
      'MUSUBI素材',
      ...(m.region ? [m.region] : []),
    ],
    sampleAvailable: false,
    isFeatured: false,
    verifiedFields: ['category', 'materialType'],
    pendingFields: [],
    estimatedFields: [],
    createdAt: m.created_at,
    updatedAt: m.created_at,
  }
}
```

> 注: `id` の `slice(0, 8)` → `slice(0, 12)`、`eraText`/`regionText` の2行が今回の差分。残りは現状の移植。

- [ ] **Step 3: 型チェック・lint**

```bash
cd "/c/Users/yasyy/haruka-archive" && npm run build && npm run lint
```
Expected: 型エラー・lint エラーなし（`mapRow` 未使用警告が出ないこと＝`fetchMusubiMaterials` から参照）。

- [ ] **Step 4: コミット**

```bash
git -C "/c/Users/yasyy/haruka-archive" add src/types/material.ts src/lib/musubi-materials.ts
git -C "/c/Users/yasyy/haruka-archive" commit -m "refactor(provenance): mapRow抽出・生era/region追加・来歴ID12桁化"
```

---

### Task 2: 来歴IDによる単一取得関数（成約後も解決・衝突安全）

**Files:**
- Modify: `src/lib/musubi-materials.ts`（末尾に2関数を追加）

**Interfaces:**
- Consumes: `mapRow`（Task 1）、`createServiceClient`（`@/lib/notify/service-client`・既存）、`MusubiMaterialRow`。
- Produces: `provenanceIdToUuidRange(provId: string): { lower: string; upper: string } | null`、`fetchMusubiMaterialByProvenanceId(provId: string): Promise<Material | null>`。

> **重要（RLS）**: `materials` の RLS `materials_select_available` は anon に `is_available=true` の行しか SELECT させない。買い手サイトの anon クライアント（`musubiSupabase`）では成約済み(is_available=false)の行が返らず「成約後も来歴」が成立しない。よってこの単一取得は **サーバ限定の service-role クライアント `createServiceClient()`（RLSバイパス・既存 `src/lib/notify/service-client.ts`）** を使う。`/m/[id]` はサーバコンポーネント、`musubi-materials.ts` はサーバ専用モジュールであり、service-role キーがブラウザへ出ないこと（`NEXT_PUBLIC_` を付けない・client component から import しない）を保つ。
> **プライバシー上の割り切り**: service-role は availability を問わず全行を返すため、QRプレフィックスを知っていれば「販売停止/下書き」状態の素材の来歴も到達可能。来歴は QR/URL を実質アクセストークンとする公開ページという設計のため許容。将来 draft 状態を導入する場合は別途ガードを足す。

- [ ] **Step 1: hexプレフィックス → uuid範囲ヘルパを追加**

UUID は文字列としての辞書順と `uuid` 型のバイト順が一致するため、プレフィックスを `0` 詰め/`f` 詰めした2つのUUIDで範囲（`gte`/`lte`）を作れる。キャストもマイグレーションも不要。`src/lib/musubi-materials.ts` 末尾に追加:

```typescript
// 32桁hex(ダッシュ無し)を 8-4-4-4-12 のUUID文字列に整形する。
function hexToUuid(hex32: string): string {
  return `${hex32.slice(0, 8)}-${hex32.slice(8, 12)}-${hex32.slice(12, 16)}-${hex32.slice(16, 20)}-${hex32.slice(20, 32)}`
}

// 来歴ID（MSB- + hexプレフィックス）から、materials.id(uuid) の検索範囲を作る。
// 例: "MSB-A1B2C3D4" → lower=a1b2c3d4-0000-...-000000000000, upper=a1b2c3d4-ffff-...-ffffffffffff
export function provenanceIdToUuidRange(
  provId: string,
): { lower: string; upper: string } | null {
  const raw = provId.trim().replace(/^MSB-/i, '').toLowerCase()
  // hexのみ・8〜32桁を許容（8桁=旧QR、12桁=新QR）
  if (!/^[0-9a-f]{8,32}$/.test(raw)) return null
  const lower = hexToUuid((raw + '0'.repeat(32)).slice(0, 32))
  const upper = hexToUuid((raw + 'f'.repeat(32)).slice(0, 32))
  return { lower, upper }
}
```

- [ ] **Step 2: 単一取得関数を追加**

`is_available` フィルタを付けず、範囲に一致する行を最大2件取得。0件→null、1件→`mapRow`、2件以上→曖昧なので null（誤表示を避ける）。RLSをバイパスするためサーバ限定の `createServiceClient()` を使う。まずファイル冒頭の import に追加:

```typescript
import { createServiceClient } from '@/lib/notify/service-client'
```

`src/lib/musubi-materials.ts` 末尾に追加:

```typescript
export async function fetchMusubiMaterialByProvenanceId(
  provId: string,
): Promise<Material | null> {
  const range = provenanceIdToUuidRange(provId)
  if (!range) return null
  if (!process.env.MUSUBI_SERVICE_ROLE_KEY) return null
  try {
    // service-role（サーバ限定・RLSバイパス）。成約済みでも来歴を解決するため。
    const { data, error } = await createServiceClient()
      .from('materials')
      // 成約済み(is_available=false)でも来歴は表示する＝is_availableフィルタを付けない
      .select(
        `
        id, name, category, fabric_type, condition, color,
        quantity, price, is_negotiable, story,
        cultural_significance, era, region, created_at, attributes,
        material_images(storage_path, is_primary, order_index),
        supplier_profiles(display_name)
      `,
      )
      .gte('id', range.lower)
      .lte('id', range.upper)
      .limit(2)

    if (error || !data || data.length === 0) return null
    if (data.length > 1) {
      // プレフィックス衝突。当てずっぽうで別素材を見せない安全側。
      console.warn(`[provenance] ambiguous prefix for ${provId} (${data.length} matches)`)
      return null
    }
    return mapRow(data[0] as unknown as MusubiMaterialRow)
  } catch {
    return null
  }
}
```

- [ ] **Step 3: 型チェック・lint**

```bash
cd "/c/Users/yasyy/haruka-archive" && npm run build && npm run lint
```
Expected: エラーなし。

- [ ] **Step 4: 範囲ヘルパの手動サニティチェック**

一時スクリプトで境界を確認（確認後に削除）:

```bash
cd "/c/Users/yasyy/haruka-archive" && node -e "
function hexToUuid(h){return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20,32)}
function range(p){p=p.replace(/^MSB-/i,'').toLowerCase();const lower=hexToUuid((p+'0'.repeat(32)).slice(0,32));const upper=hexToUuid((p+'f'.repeat(32)).slice(0,32));return {lower,upper}}
console.log(range('MSB-A1B2C3D4'));
console.log(range('MSB-A1B2C3D4E5F6'));
"
```
Expected: 8桁は `a1b2c3d4-0000-0000-0000-000000000000` 〜 `a1b2c3d4-ffff-ffff-ffff-ffffffffffff`、12桁は `a1b2c3d4-e5f6-0000-...` 〜 `a1b2c3d4-e5f6-ffff-...`。

- [ ] **Step 5: コミット**

```bash
git -C "/c/Users/yasyy/haruka-archive" add src/lib/musubi-materials.ts
git -C "/c/Users/yasyy/haruka-archive" commit -m "feat(provenance): 来歴IDで成約後も解決する単一取得（衝突安全）"
```

---

### Task 3: 来歴ページを単一取得へ切替・年代/産地の生データ表示・自己申告注記

**Files:**
- Modify: `src/app/m/[id]/page.tsx`

**Interfaces:**
- Consumes: `fetchMusubiMaterialByProvenanceId`（Task 2）、`Material.eraText`/`Material.regionText`（Task 1）。

- [ ] **Step 1: import を差し替え**

`src/app/m/[id]/page.tsx:6` の
```typescript
import { getAllMaterials } from '@/lib/get-materials'
```
を
```typescript
import { getAllMaterials } from '@/lib/get-materials'
import { fetchMusubiMaterialByProvenanceId } from '@/lib/musubi-materials'
```
にする（`getAllMaterials` は `generateStaticParams` で引き続き使用）。

- [ ] **Step 2: `generateMetadata` を単一取得へ**

`generateMetadata` 内の
```typescript
  const materials = await getAllMaterials()
  const m = materials.find((x) => x.id === id)
```
を
```typescript
  const m = await fetchMusubiMaterialByProvenanceId(id)
```
に置換。

- [ ] **Step 3: `ProvenancePage` 本体を単一取得へ**

`ProvenancePage` 内の
```typescript
  const materials = await getAllMaterials()
  const m = materials.find((x) => x.id === id)
  if (!m) notFound()
```
を
```typescript
  const m = await fetchMusubiMaterialByProvenanceId(id)
  if (!m) notFound()
```
に置換。`generateStaticParams` は変更しない（在庫ありをSSG、成約済みは `dynamicParams=true` でオンデマンド）。

- [ ] **Step 4: 年代を生データ表示にする**

`page.tsx:47` の
```typescript
  const era = m.era && m.era !== '不明' ? m.era : undefined
```
を
```typescript
  // 来歴ページは丸めない生の年代を優先（例「昭和30年代」）。無ければ粗い列挙を補助的に。
  const era = m.eraText?.trim() || (m.era && m.era !== '不明' ? m.era : undefined)
```
にする。

- [ ] **Step 5: 産地を「日本」断定しない表示にする**

`page.tsx:83` の
```typescript
          <Fact label="産地" value={m.origin} />
```
を
```typescript
          <Fact label="産地" value={m.regionText} />
```
にする（`regionText` 未設定なら `Fact` が行ごと出さない＝推定の断定を回避）。

- [ ] **Step 6: 自己申告の注記を追加**

`page.tsx` の来歴ファクト `<dl>...</dl>`（`{/* 来歴ファクト */}` のブロック）の直後に以下を挿入:

```tsx
        {/* 出所の明示（優良誤認を避ける・検証済みを詐称しない） */}
        <p className="mt-3 text-[11px] leading-6" style={{ color: 'var(--text-muted)', opacity: 0.8 }}>
          ※ 上記は提供元による申告にもとづく情報です（第三者による検証ではありません）。
        </p>
```

- [ ] **Step 7: 型チェック・lint**

```bash
cd "/c/Users/yasyy/haruka-archive" && npm run build && npm run lint
```
Expected: エラーなし。

- [ ] **Step 8: 実機目視確認**

**前提**: haruka-archive の `.env.local` に `MUSUBI_SERVICE_ROLE_KEY` が設定されていること。**未設定だと全来歴ページが404になる**（単一取得が null を返すため）。まず確認:

```bash
cd "/c/Users/yasyy/haruka-archive" && grep -q MUSUBI_SERVICE_ROLE_KEY .env.local && echo OK || echo "MISSING: 来歴ページが404になる。.env.localに追加が必要"
```

```bash
cd "/c/Users/yasyy/haruka-archive" && npm run dev
```
ブラウザで既存素材の `/m/MSB-XXXXXXXX`（8桁の旧URL）と `/m/MSB-XXXXXXXXXXXX`（12桁）両方が開くこと、年代が生データで出ること、産地が空の素材で「日本」行が出ないこと、自己申告注記が出ることを確認。対象素材を Supabase で一時的に `is_available=false` にし、来歴ページが**404にならず生きる**ことを確認（確認後に戻す）。

- [ ] **Step 9: コミット**

```bash
git -C "/c/Users/yasyy/haruka-archive" add src/app/m/[id]/page.tsx
git -C "/c/Users/yasyy/haruka-archive" commit -m "feat(provenance): 成約後も表示・年代/産地を正直に・自己申告注記"
```

---

# Phase 2 — 提供元側 `musubi sozai`

ファイル責務マップ:
- `src/types/ai.ts` — AI解析結果に柄/組成/技法を加法追加。
- `src/app/api/analyze-material/route.ts` — プロンプトに3項目追加。
- `src/components/supplier/MaterialForm.tsx` — 3項目を controlled 化＋AI自動入力＋来歴`<details>`自動展開＋AiBadge、derived_products 入力UI。
- `src/app/(dashboard)/materials/new/actions.ts` — derived_products を安全パースして attributes へ。
- `src/components/supplier/QrCodeBox.tsx` — 来歴ID 12桁化。

### Task 4: AI解析の型・プロンプトに 柄/組成/技法 を追加

**Files:**
- Modify: `src/types/ai.ts`
- Modify: `src/app/api/analyze-material/route.ts:12-26`

**Interfaces:**
- Produces: `MaterialAnalysis.pattern?`、`.composition?`、`.technique?`（`string | null`）。

- [ ] **Step 1: 型に3項目を追加**

`src/types/ai.ts` の `MaterialAnalysis` に追加:

```typescript
  pattern?: string | null
  composition?: string | null
  technique?: string | null
```

- [ ] **Step 2: プロンプトに3項目を追加**

`src/app/api/analyze-material/route.ts` の `PROMPT` の JSON、`"cultural_significance"` の行の後に以下を追加（直前行の末尾カンマを忘れない）:

```
  "pattern": "視認できる柄・文様（例: 花柄、縞、青海波）またはnull",
  "composition": "推定できる繊維組成（例: 正絹100%、綿80%麻20%）。確証がなければnull",
  "technique": "視認できる染め・織りの技法（例: 友禅、絣、西陣織）またはnull"
```

`max_tokens: 1000` は据え置き（3項目増でも十分）。

- [ ] **Step 3: 型チェック・lint**

```bash
cd "/c/Users/yasyy/musubi sozai" && npm run build && npm run lint
```
Expected: エラーなし。

- [ ] **Step 4: コミット**

```bash
git -C "/c/Users/yasyy/musubi sozai" add src/types/ai.ts "src/app/api/analyze-material/route.ts"
git -C "/c/Users/yasyy/musubi sozai" commit -m "feat(ai): 柄/組成/技法も画像から下書きする"
```

---

### Task 5: 登録フォームで 柄/組成/技法 を controlled 化＋AI自動入力＋自動展開

**Files:**
- Modify: `src/components/supplier/MaterialForm.tsx`

**Interfaces:**
- Consumes: `MaterialAnalysis.pattern/composition/technique`（Task 4）。
- Produces: 来歴属性3項目が AI で自動入力され、AI入力時に来歴 `<details>` が自動展開される。`maker` は手入力のまま。

- [ ] **Step 1: `FieldKey` と初期 `Fields` に3項目を追加**

`MaterialForm.tsx` の `FieldKey` 型（`:152` 付近）に `| 'pattern' | 'composition' | 'technique'` を追加。`useState<Fields>` 初期化の `empty` オブジェクト（`:186` 付近）と、下書き削除ボタンの `setFields({...})`（`:313` 付近）の両方に `pattern: '', composition: '', technique: ''` を追加。

- [ ] **Step 2: 来歴`<details>`の開閉を state 化**

`MaterialForm` 関数内の state 群に追加:

```typescript
  const [provenanceOpen, setProvenanceOpen] = useState(false)
```

- [ ] **Step 3: `handleAnalysis` で3項目を自動入力＋展開**

`handleAnalysis`（`:241` 付近）の `next` 構築に追加（`cultural_significance` の後）:

```typescript
    if (data.pattern) next.pattern = data.pattern
    if (data.composition) next.composition = data.composition
    if (data.technique) next.technique = data.technique
```

`setAnalysisStatus('done')` の直前に、いずれか埋まったら来歴を開く:

```typescript
    if (data.pattern || data.composition || data.technique) setProvenanceOpen(true)
```

- [ ] **Step 4: 来歴`<details>`を controlled 入力に置換**

`MaterialForm.tsx` の来歴ブロック（`{/* 来歴・DPP情報 ... */}` の `<details className="group ...">`）を以下に置換。`open`/`onToggle` で state 連動、3項目を controlled＋AiBadge にし、`maker` は据え置き:

```tsx
          {/* 来歴・DPP情報（任意・QRの履歴ページに表示） */}
          <details
            className="group rounded-lg border border-border bg-muted/30"
            open={provenanceOpen}
            onToggle={(e) => setProvenanceOpen((e.currentTarget as HTMLDetailsElement).open)}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-4">
              <div>
                <p className="text-sm font-medium">来歴・履歴の情報（任意）</p>
                <p className="text-xs text-muted-foreground">
                  柄・組成・技法・職人など。QRの履歴ページに表示されます。後からでもOK。
                </p>
              </div>
              <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <div className="grid gap-4 px-4 pb-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="pattern" className="flex items-center gap-2">
                  柄・文様 <AiBadge show={aiFilledFields.has('pattern')} />
                </Label>
                <Input id="pattern" name="pattern" placeholder="例: 花柄、縞、青海波"
                  value={fields.pattern} onChange={(e) => updateField('pattern', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="composition" className="flex items-center gap-2">
                  組成 <AiBadge show={aiFilledFields.has('composition')} />
                </Label>
                <Input id="composition" name="composition" placeholder="例: 正絹100%"
                  value={fields.composition} onChange={(e) => updateField('composition', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="technique" className="flex items-center gap-2">
                  技法 <AiBadge show={aiFilledFields.has('technique')} />
                </Label>
                <Input id="technique" name="technique" placeholder="例: 友禅、西陣織"
                  value={fields.technique} onChange={(e) => updateField('technique', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maker">職人・工房</Label>
                <Input id="maker" name="maker" placeholder="例: ◯◯織元" />
              </div>
            </div>
          </details>
```

- [ ] **Step 5: 型チェック・lint**

```bash
cd "/c/Users/yasyy/musubi sozai" && npm run build && npm run lint
```
Expected: エラーなし。

- [ ] **Step 6: コミット**

```bash
git -C "/c/Users/yasyy/musubi sozai" add src/components/supplier/MaterialForm.tsx
git -C "/c/Users/yasyy/musubi sozai" commit -m "feat(form): 柄/組成/技法をAI自動入力・来歴を自動展開"
```

---

### Task 6: derived_products（この素材から生まれた製品）入力UI＋保存

**Files:**
- Modify: `src/components/supplier/MaterialForm.tsx`
- Modify: `src/app/(dashboard)/materials/new/actions.ts:131-137`

**Interfaces:**
- Consumes: `buildTextileAttributes(values, derived)` の第2引数（`src/lib/catalog.ts` で対応済み、`DerivedProduct = { name: string; count?: number; note?: string }`）。
- Produces: hidden input `derived_products`（JSON配列文字列）。

- [ ] **Step 1: フォームに derived_products の state を追加**

`MaterialForm.tsx` の state 群に追加:

```typescript
  const [derived, setDerived] = useState<{ name: string; count: string; note: string }[]>([])
```

- [ ] **Step 2: 来歴`<details>`内に入力リストを追加**

Task 5 で置換した `<details>` の `<div className="grid ...">` の**直後**（`</div>` の前、職人欄の後）に、フル幅のリストUIを追加:

```tsx
            <div className="px-4 pb-4">
              <p className="text-sm font-medium">この素材から生まれた製品（任意）</p>
              <p className="mb-2 text-xs text-muted-foreground">この反物から作られた製品があれば。来歴ページに表示されます。</p>
              <div className="space-y-2">
                {derived.map((d, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2">
                    <Input className="min-w-40 flex-1" placeholder="製品名（例: がま口財布）"
                      value={d.name}
                      onChange={(e) => setDerived((p) => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                    <Input className="w-24" type="number" min={0} placeholder="数量"
                      value={d.count}
                      onChange={(e) => setDerived((p) => p.map((x, j) => j === i ? { ...x, count: e.target.value } : x))} />
                    <Input className="min-w-32 flex-1" placeholder="備考（任意）"
                      value={d.note}
                      onChange={(e) => setDerived((p) => p.map((x, j) => j === i ? { ...x, note: e.target.value } : x))} />
                    <button type="button" aria-label="削除"
                      onClick={() => setDerived((p) => p.filter((_, j) => j !== i))}
                      className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
                  </div>
                ))}
              </div>
              <button type="button"
                onClick={() => setDerived((p) => [...p, { name: '', count: '', note: '' }])}
                className="mt-2 text-sm text-primary underline underline-offset-4 hover:opacity-70">
                ＋ 製品を追加
              </button>
            </div>
```

- [ ] **Step 3: 送信用 hidden input を追加**

`<form action={formAction} ...>` 直下の hidden 群（`<input type="hidden" name="id" .../>` の近く）に追加。空 name の行は送信前に除外:

```tsx
      <input
        type="hidden"
        name="derived_products"
        value={JSON.stringify(
          derived
            .filter((d) => d.name.trim())
            .map((d) => ({
              name: d.name.trim(),
              count: d.count.trim() ? Number(d.count) : undefined,
              note: d.note.trim() || undefined,
            })),
        )}
      />
```

- [ ] **Step 4: actions.ts で derived_products をパースして attributes へ**

`src/app/(dashboard)/materials/new/actions.ts` の attributes 構築（`:131-137`）を以下に置換:

```typescript
  // 4. 来歴/DPP属性（attributes jsonb）を組み立てる
  let derived: { name: string; count?: number; note?: string }[] = []
  const derivedRaw = formData.get('derived_products')
  if (typeof derivedRaw === 'string' && derivedRaw.trim()) {
    try {
      const parsed = JSON.parse(derivedRaw)
      if (Array.isArray(parsed)) {
        derived = parsed
          .filter((d): d is { name: string; count?: number; note?: string } =>
            d && typeof d.name === 'string' && d.name.trim().length > 0)
          .map((d) => ({
            name: d.name.trim(),
            count: typeof d.count === 'number' && Number.isFinite(d.count) ? d.count : undefined,
            note: typeof d.note === 'string' && d.note.trim() ? d.note.trim() : undefined,
          }))
      }
    } catch {
      // 破損時は無視して登録は続行
    }
  }

  const attributes = buildTextileAttributes(
    {
      pattern: formData.get('pattern')?.toString(),
      composition: formData.get('composition')?.toString(),
      technique: formData.get('technique')?.toString(),
      maker: formData.get('maker')?.toString(),
    },
    derived,
  )
```

- [ ] **Step 5: 型チェック・lint**

```bash
cd "/c/Users/yasyy/musubi sozai" && npm run build && npm run lint
```
Expected: エラーなし。

- [ ] **Step 6: 実機目視確認**

```bash
cd "/c/Users/yasyy/musubi sozai" && npm run dev
```
写真付きで素材登録 → AI が柄/組成/技法を埋めて来歴が自動展開すること、製品を1件追加して登録できることを確認。登録後、haruka-archive の `/m/[id]` で「この素材から生まれた製品」が出ることを確認。

- [ ] **Step 7: コミット**

```bash
git -C "/c/Users/yasyy/musubi sozai" add src/components/supplier/MaterialForm.tsx "src/app/(dashboard)/materials/new/actions.ts"
git -C "/c/Users/yasyy/musubi sozai" commit -m "feat(form): この素材から生まれた製品の入力UIと保存"
```

---

### Task 7: 来歴ID（QR）を12桁化

**Files:**
- Modify: `src/components/supplier/QrCodeBox.tsx:11-14`

**Interfaces:**
- Produces: QR/URL の来歴ID = `MSB-` + UUID先頭**12桁**大文字（haruka の `mapRow` と一致）。

- [ ] **Step 1: `toProvenanceId` を12桁に**

`src/components/supplier/QrCodeBox.tsx` の
```typescript
function toProvenanceId(uuid: string) {
  return `MSB-${uuid.slice(0, 8).toUpperCase()}`
}
```
を
```typescript
function toProvenanceId(uuid: string) {
  // 先頭12桁で衝突を実質回避（買い手側の解決はプレフィックス長非依存で旧8桁QRも有効）
  return `MSB-${uuid.slice(0, 12).toUpperCase()}`
}
```
にする。

- [ ] **Step 2: 型チェック・lint**

```bash
cd "/c/Users/yasyy/musubi sozai" && npm run build && npm run lint
```
Expected: エラーなし。

- [ ] **Step 3: 実機目視確認**

`npm run dev` で素材詳細の QR ボックスの URL が `…/m/MSB-XXXXXXXXXXXX`（12桁）になり、その URL が haruka-archive 側で開けることを確認。

- [ ] **Step 4: コミット**

```bash
git -C "/c/Users/yasyy/musubi sozai" add src/components/supplier/QrCodeBox.tsx
git -C "/c/Users/yasyy/musubi sozai" commit -m "feat(qr): 来歴IDを12桁化（衝突回避・旧QR後方互換）"
```

---

## 完了後

- [ ] Phase 1（haruka-archive）と Phase 2（musubi sozai）の作業ブランチを、ユーザー確認の上でそれぞれデプロイ/マージ。
- [ ] デプロイ後、本番で「成約済み素材の来歴ページが生きる」「新規登録で AI が柄/組成/技法を埋める」を実機で最終確認。

## 検証マッピング（spec → タスク）

| spec の欠点 | 対応タスク |
| --- | --- |
| 1 売れたら消える | Task 2, 3 |
| 2 堀データが埋まらない | Task 4, 5 |
| 3 derived_products 入力UI無し | Task 6 |
| 4 自己申告/検証の区別 | Task 3(Step 6) |
| 5 年代精度 | Task 1, 3(Step 4) |
| 6 産地断定 | Task 1, 3(Step 5) |
| 7 ID衝突 | Task 2, 7 |
| 8 全件取得 | Task 2, 3 |
