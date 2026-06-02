import { NextResponse } from "next/server";
import { getUserTransactionHistory } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userIdParam = url.searchParams.get('userId');
    const limitParam = url.searchParams.get('limit');
    const userId = userIdParam ? Number(userIdParam) : undefined;
    const limit = limitParam ? Number(limitParam) : 5;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId query param required' }, { status: 400 });
    }

    const res = await getUserTransactionHistory(userId, limit);
    if (!res || !res.success) {
      return NextResponse.json({ success: false, error: res?.error || 'Failed to load user history' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: res.data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
