import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function GET() {
  const key = process.env.OPENAI_API_KEY
  if (!key || !key.startsWith('sk-')) {
    return NextResponse.json({ ok: false, where: 'env', msg: 'OPENAI_API_KEY fehlt oder hat falsches Format' }, { status: 500 })
  }
  try {
    const client = new OpenAI({ apiKey: key })
    const r = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Sag nur: ping' }],
    })
    const text = r.choices[0]?.message?.content ?? ''
    return NextResponse.json({ ok: true, text })
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string; response?: { data?: unknown } } | undefined
    const statusCode = err?.status ?? 500
    return NextResponse.json(
      { ok: false, where: 'request', status: statusCode, msg: err?.message, details: err?.response?.data },
      { status: statusCode }
    )
  }
}
