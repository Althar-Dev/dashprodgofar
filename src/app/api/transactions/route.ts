import { NextResponse } from "next/server";
import { getAllTransactions } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const botIdParam = url.searchParams.get('botId');
    const botId = botIdParam ? Number(botIdParam) : undefined;
    if (!botId) return NextResponse.json({ success: false, error: 'botId query param required' }, { status: 400 });
    const res = await getAllTransactions(botId);
    if (!res || !res.success) return NextResponse.json({ success: false, error: res?.error || 'Failed to load transactions' }, { status: 500 });
    return NextResponse.json({ success: true, data: res.data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
