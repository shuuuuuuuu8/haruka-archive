# 来歴/DPP 信頼性・充足度の改善 — 設計 (Design)

- 日付: 2026-06-27
- 対象: 結 素材バンクの来歴/DPP（買い手側 `haruka-archive` ＋ 提供元側 `musubi sozai`）
- 進め方: フェーズ分割（案1）。Phase 1 = 買い手側の表示、Phase 2 = 提供元側のデータ投入。
- 北極星整合: 「構造化された来歴データ＝堀」「ブランドが *検証済み価値＋来歴* に払う」「優良誤認を避ける」から逆算。

## 背景 / 現状診断

来歴/DPP の全フローを読んだ上で確認した欠点（優先度順）:

1. **🔴 売れた瞬間に来歴ページが消える。** `/m/[id]` は `getAllMaterials()`（`is_available=true` のみ）→ `.find()`。成約で `is_available=false` になると来歴ページが 404。DPP/パスポートは *製品になって人の手に渡った後* にこそ QR が読まれるのに、一番価値が出る瞬間にページが死ぬ。DPP の根本矛盾。
2. **🟠 堀データがまず埋まらない。** 堀になる属性（柄/組成/技法/職人）は登録フォームで折りたたみ `<details>` の中かつ AI 下書きの対象外。実運用ではほぼ空のまま。
3. **🟠 `derived_products`（この素材から生まれた製品）に入力UIが無い。** カタログ定義と表示はあるのに新規登録フォームに入力欄が無く、永久に空＝死に機能。
4. **🟡 全ファクトが「検証済みの事実」のように並ぶ。** 実際は提供元の自己申告。自己申告と検証の区別が無く、信頼の格を上げられず優良誤認リスク。
5. **🟡 年代の精度が消える。** 提供元が「昭和30年代」と入れても `mapEra` が「昭和」に丸め、パスポートはその丸めた値を表示。
6. **🟡 産地が空でも「日本」と断定表示**（`origin = region ?? '日本'`）。推定を事実として見せている。
7. **🟢 来歴IDが UUID 先頭8桁のみ**（`MSB-XXXXXXXX`）。件数増で先頭8桁衝突 → QR が別素材の来歴に解決し得る。
8. **🟢 `/m/[id]` が毎回 全素材を取得して `.find()`。** 件数増で非効率。

すべて **DBマイグレーション不要**（jsonb属性は既存、表示・ID長・AIプロンプトの範囲）。

## 横断的前提

- DBマイグレーション無し。`materials.attributes(jsonb)` は既存。変更は表示・ID長・AIプロンプト・フォームのみ。
- Next.js 16（破壊的変更あり）。コード着手前に `node_modules/next/dist/docs/` の該当ガイドを確認する（両リポジトリ AGENTS.md 準拠）。
- AI解析は既存の OpenAI `gpt-4o-mini` のまま。プロバイダ変更はスコープ外。
- コミット/プッシュはユーザーが明示した時のみ。

---

## Phase 1 — 買い手側 `haruka-archive`：来歴ページを「成約後も生きる・正直・高精度」に

### 1. 単一取得関数で成約後も表示（欠点 1 + 8、欠点 7 の解決ロジック）

**新規関数** `fetchMusubiMaterialByProvenanceId(provId: string): Promise<Material | null>` を `src/lib/musubi-materials.ts` に追加。

- 入力 `MSB-XXXXXXXX…` から hex プレフィックスを抽出（`MSB-` を除去、小文字化）。最低 8 文字を要求、不正な形式は `null`。
- クエリ: `materials` をプレフィックス一致で取得、**`is_available` フィルタは付けない**（成約済みでも解決）。`limit(2)`。
- **RLS 制約（重要）**: `materials_select_available` は anon に `is_available=true` の行しか SELECT させない。よってこの単一取得は **サーバ限定の service-role クライアント `createServiceClient()`（既存 `src/lib/notify/service-client.ts`・RLSバイパス）** を使う。`/m/[id]` はサーバコンポーネントのため鍵はブラウザに出ない。DBマイグレーション（RLS変更）は不要。`MUSUBI_SERVICE_ROLE_KEY` 未設定環境では全来歴ページが 404 になる点に注意。
- プレフィックス→uuid検索は **uuid範囲（`gte`/`lt`相当）** で行う（uuidの辞書順＝バイト順を利用、キャスト不要）。`id::text ILIKE` は PostgREST が uuid 列で受け付けない可能性があるため不採用。
- 結果分岐:
  - 0 件 → `null`（呼び出し側で `notFound()`）。
  - 1 件 → `mapRow` で `Material` に変換して返す。
  - 2 件以上 → **曖昧なので `null`＋`console.warn`**（誤った素材を絶対に表示しない安全側。プレフィックス衝突時は当てずっぽうで表示しない）。
- 既存の「行 → `Material`」変換ロジックを `mapRow(row: MusubiMaterialRow): Material` ヘルパに抽出し、`fetchMusubiMaterials`（一覧）と新関数で共有する。一覧側の挙動は変えない。
- **要検証（plan 段階）**: PostgREST が `uuid` 列に対し `.ilike('id', 'prefix%')` を直接サポートするか。効かない場合のフォールバック候補: (a) DB に `id` テキストプレフィックスの SQL 関数/ビューを用意、(b) uuid の範囲比較（`gte`/`lt`）でプレフィックス範囲を表現、(c) RPC。**マイグレーション無し**の制約を優先し、まず (b) クライアント側で uuid 範囲を組み立てる方式を試す。

**`src/app/m/[id]/page.tsx`**:

- `ProvenancePage` と `generateMetadata` の両方で、`getAllMaterials()` + `.find()` をやめ `fetchMusubiMaterialByProvenanceId(id)` を使う。→ 「全件取得」(8) と「売れたら 404」(1) を同時に解消。
- `generateStaticParams` は従来通り「在庫あり」を SSG（`getAllMaterials()` 利用のまま）。`dynamicParams = true` が既にあるため、成約済み素材はオンデマンドで描画される。変更不要。

### 2. 年代・産地を生データで正直に（欠点 5 + 6）

**`src/types/material.ts`**: `Material` に生フィールドを追加。
- `eraText?: string` — 提供元が入力した生の年代文字列（例: 「昭和30年代」）。
- `regionText?: string` — 提供元が入力した生の産地（空なら未設定）。

**`src/lib/musubi-materials.ts`（`mapRow`）**:
- `eraText: m.era ?? undefined`（丸めない）。既存の `era: mapEra(m.era)`（粗い列挙）は一覧・絞り込み用に**そのまま残す**。
- `regionText: m.region ?? undefined`。既存の `origin`（`m.region ?? '日本'`）も一覧表示互換のため残す。

**`src/app/m/[id]/page.tsx`**:
- 年代: `eraText` を表示（無ければ行を出さない）。粗い `era` は使わない。
- 産地: `regionText` がある時だけ表示。空なら「日本」と断定しない（行を出さない）。

### 3. 自己申告/検証の区別（欠点 4）

**`src/app/m/[id]/page.tsx`**:
- ファクト一覧（`<dl>`）の直前または直後に、既存「環境への配慮」の免責と同じ控えめなトーンで一文を追加:
  > ※ 以下の情報は提供元による申告にもとづきます（第三者による検証ではありません）。
- データモデル変更なし。"検証済み" を詐称しない。`verifiedFields` の作り込みは行わない（YAGNI）。

---

## Phase 2 — 提供元側 `musubi sozai`：堀データが実際に埋まる

### 4. AI が堀フィールドも下書き（欠点 2）

**`src/types/ai.ts`**: `MaterialAnalysis` に追加。
- `pattern?: string | null` — 視認できる柄・文様。
- `composition?: string | null` — 推定可能なら繊維組成。
- `technique?: string | null` — 視認できる染め/織りの技法。
- **`maker`（職人・工房）は追加しない** — 特定の工房名を AI が捏造するのを避け、手入力のまま。

**`src/app/api/analyze-material/route.ts`**: `PROMPT` の JSON に上記 3 項目を追加。
- 各項目の指示: 柄=画像から見える文様、組成=画像/生地から推定できる範囲、技法=見える染め/織りの技法。**不明な場合は null**。

**`src/components/supplier/MaterialForm.tsx`**:
- `FieldKey` / `Fields` に `pattern` `composition` `technique` を追加。3 項目を controlled 入力にする（現状は `<details>` 内の uncontrolled）。
- `handleAnalysis` で AI 結果を 3 項目にマッピングし、`aiFilledFields` に追加。各入力に `AiBadge`。
- AI がいずれかを埋めたら来歴 `<details>` を **自動展開**（`open` 状態を state 化）。
- `maker` は従来通り uncontrolled の手入力欄のまま。
- 保存は既に `actions.ts` が `formData.get('pattern'|'composition'|'technique')` を読むため、**保存側の変更は不要**。

### 5. derived_products 入力UI（欠点 3）

**`src/components/supplier/MaterialForm.tsx`**:
- 来歴 `<details>` 内に「この素材から生まれた製品」リストを追加。各行 = 製品名（必須）＋数量（任意・数値）＋備考（任意）。行の追加/削除ができる。
- 送信時に hidden input `derived_products` に JSON 配列文字列でシリアライズ（`[{name, count?, note?}]`）。

**`src/app/(dashboard)/materials/new/actions.ts`**:
- `formData.get('derived_products')` を安全に JSON パース（失敗時は空配列）。`name` が空の行は捨てる。
- `buildTextileAttributes(values, derived)` の **第 2 引数**（既に対応済み）に渡す。
- 買い手側 `/m/[id]` の「この素材から生まれた製品」表示は既存のまま動く。

### 6. 来歴IDを衝突しにくく（欠点 7）

- **`src/components/supplier/QrCodeBox.tsx`（musubi）** の `toProvenanceId`: プレフィックスを **8 → 12 桁 hex** に延長（`MSB-` + 先頭12桁大文字）。
- **`src/lib/musubi-materials.ts`（haruka）** の `mapRow`: 一覧カードのリンク用 `id` も同じく `MSB-` + 先頭12桁に揃える。
- Phase 1 の解決関数はプレフィックス一致（`ILIKE 'prefix%'`）なので、**既に印刷済みの 8 桁 QR も引き続き解決**できる（後方互換）。新規 ID は現実的な件数規模で衝突しない。

---

## コンポーネント境界（まとめ）

| 変更点 | リポジトリ | ファイル | 種別 |
| --- | --- | --- | --- |
| 単一取得関数 + `mapRow` 抽出 | haruka-archive | `src/lib/musubi-materials.ts` | 新関数/リファクタ |
| 来歴ページの取得切替・表示 | haruka-archive | `src/app/m/[id]/page.tsx` | 変更 |
| 生フィールド追加 | haruka-archive | `src/types/material.ts` | 加法 |
| AI 解析の型 | musubi sozai | `src/types/ai.ts` | 加法 |
| AI プロンプト | musubi sozai | `src/app/api/analyze-material/route.ts` | 変更 |
| 登録フォーム（AI/derived/展開） | musubi sozai | `src/components/supplier/MaterialForm.tsx` | 変更 |
| derived_products 保存 | musubi sozai | `src/app/(dashboard)/materials/new/actions.ts` | 変更 |
| 来歴ID長 | musubi sozai | `src/components/supplier/QrCodeBox.tsx` | 変更 |

## エラーハンドリング / エッジケース

- **プレフィックス曖昧**（>1件）: 当てずっぽうで表示せず `notFound()`。`console.warn` で観測。
- **不正な provId**: `MSB-` 形式でない/8文字未満 → `null` → `notFound()`。
- **AI のハルシネーション**（組成/技法を誤推定）: プロンプトで「不明は null」、UI は `AiBadge` ＋「確認して直してください」既存文言で人間レビューを促す。`composition` は `fabric_type`（列挙）と重複し得るが、組成はより精密な自由記述として共存（表示は `composition || materialType`）。
- **derived_products JSON 破損**: パース失敗時は空配列にフォールバック（登録自体は成功させる）。
- **成約済み素材の SSG**: `generateStaticParams` には含まれないが `dynamicParams=true` でオンデマンド描画。

## テスト / 検証

- **Phase 1**: 既知の素材で `/m/[id]` を開く。対象素材を `is_available=false` にしても来歴ページが生きること、年代が生データ（例「昭和30年代」）で出ること、産地が空なら行が消えること、自己申告の注記が出ることを実機確認。
- **Phase 2**: 写真付きで素材登録 → AI が柄/組成/技法を下書きし `<details>` が自動展開すること、derived_products を入力 → 来歴ページに「この素材から生まれた製品」が出ることを実機確認。新規登録の QR が 12 桁になり、古い 8 桁 URL も解決することを確認。

## スコープ外 (YAGNI)

- `verifiedFields` の本格的な検証フラグ運用。
- 一括登録フォーム（`BulkMaterialForm`）への来歴 AI/derived 連携（速度優先のUIのため）。
- AI プロバイダ変更、DPP の ISO/LCA 定量値、ブロックチェーン。
- DB マイグレーション。
