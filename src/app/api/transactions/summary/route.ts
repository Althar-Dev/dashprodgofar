import { NextResponse } from "next/server";
import { calculateTotalRevenue, calculateTotalPcs, calculateTotalTransactions } from '@/lib/database';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const botIdParam = url.searchParams.get('botId');
    const botId = botIdParam ? Number(botIdParam) : undefined;
    if (!botId) return NextResponse.json({ success: false, error: 'botId query param required' }, { status: 400 });

    const [totalRevenue, totalPcs, totalTransactions] = await Promise.all([
      calculateTotalRevenue(botId),
      calculateTotalPcs(botId),
      calculateTotalTransactions(botId)
    ]);

    return NextResponse.json({ success: true, data: { totalRevenue, totalPcs, totalTransactions } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
