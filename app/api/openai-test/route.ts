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
  } catch (e: any) {
    return NextResponse.json({ ok: false, where: 'request', status: e?.status || 500, msg: e?.message, details: e?.response?.data }, { status: e?.status || 500 })
  }
}
