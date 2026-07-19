import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getAllMaterials } from '@/lib/get-materials'
import type { Material } from '@/types/material'

// このルートは動的（ビルド時に事前評価しない）
export const dynamic = 'force-dynamic'

type ChatMessage = { role: 'user' | 'assistant'; content: string }

// AIに渡す素材の要約（トークン節約のため必要な項目だけに絞る）
function condense(m: Material) {
  return {
    id: m.id,
    name: m.name,
    category: m.category,
    materialType: m.materialType,
    color: m.color,
    pattern: m.pattern,
    origin: m.origin,
    era: m.era,
    price: m.priceRange,
    quantity: `${m.quantity}${m.quantityUnit}`,
    uses: m.recommendedUses,
    tags: m.tags,
    story: m.story ? m.story.slice(0, 120) : '',
  }
}

function systemPrompt(catalog: string): string {
  return `あなたは「結」のやさしい素材コンシェルジュです。日本の伝統工芸の未活用素材（着物・帯・反物など）を探すお客様の相談に乗ります。

【あなたの役割】
- お客様の「作りたいもの」「好みの色・雰囲気・用途」を聞き取り、下記の在庫リストの中から最適な素材を提案します。
- 提案は必ず下記リストの id の中からのみ選びます。リストに無いものを創作してはいけません。
- 該当しそうな素材が無い場合は、無理に勧めず、条件を聞き返すか「遙への相談」を案内します。
- 提案は多くても4点まで。それぞれ「なぜおすすめか」を一言添えます。
- 価格は「応相談」のものが多いため、断定的な金額は言いません。
- 口調はていねいで温かく、専門用語は避けます。

【在庫リスト（JSON）】
${catalog}

【出力形式】必ず次のJSON形式のみで返答してください:
{
  "reply": "お客様への返答メッセージ（やさしい日本語。提案がある場合は概要も）",
  "recommendations": [
    { "id": "リスト内のid", "reason": "おすすめする理由（30字程度）" }
  ]
}
提案が無い場合は recommendations を空配列にしてください。`
}

export async function POST(req: NextRequest) {
  let body: { messages?: ChatMessage[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'リクエストの形式が正しくありません' }, { status: 400 })
  }

  const messages = body.messages
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'メッセージがありません' }, { status: 400 })
  }

  // APIキーが無い場合は実行時に丁寧なエラーを返す（ビルドはクラッシュさせない）
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI相談は現在準備中です。お手数ですが直接ご相談ください。' },
      { status: 503 }
    )
  }
  const openai = new OpenAI({ apiKey })

  // 会話履歴をサーバ側で軽く制限（直近12件）
  const history = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-12)
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 2000) }))

  const materials = await getAllMaterials()
  const catalog = JSON.stringify(materials.slice(0, 100).map(condense))

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt(catalog) },
        ...history,
      ],
      max_tokens: 800,
      temperature: 0.4,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      return NextResponse.json({ error: 'AIから応答がありませんでした' }, { status: 502 })
    }

    const parsed = JSON.parse(content) as {
      reply?: string
      recommendations?: { id: string; reason: string }[]
    }

    // AIが返したidが実在するものだけに絞る（ハルシネーション対策）
    const validIds = new Set(materials.map((m) => m.id))
    const recommendations = (parsed.recommendations ?? []).filter((r) =>
      validIds.has(r.id)
    )

    return NextResponse.json({
      reply: parsed.reply ?? '',
      recommendations,
    })
  } catch {
    return NextResponse.json(
      { error: 'AIの応答に失敗しました。しばらくしてから再度お試しください' },
      { status: 502 }
    )
  }
}
