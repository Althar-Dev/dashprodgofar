import { NextResponse } from "next/server";
import { getAllUsers, deleteUser, editUser } from '@/lib/database';

export async function GET() {
  try {
    const res = await getAllUsers();
    if (!res || !res.success) return NextResponse.json({ success: false, error: res?.error || 'Failed to load users' }, { status: 500 });
    return NextResponse.json({ success: true, data: res.data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const idParam = url.searchParams.get('id');
    if (!idParam) return NextResponse.json({ success: false, error: 'id query param required' }, { status: 400 });
    const userId = Number(idParam);
    const res = await deleteUser(userId);
    return NextResponse.json(res);
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const userId = Number(body.id);
    if (!userId) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    const updates = {
      ...(typeof body.name === 'string' && body.name.trim().length ? { name: body.name.trim() } : {}),
      ...(typeof body.role === 'string' && body.role.trim().length ? { role: body.role.trim() } : {}),
      ...(typeof body.balance === 'number' ? { balance: body.balance } : {}),
      ...(typeof body.banned === 'boolean' ? { banned: body.banned } : {}),
    };

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'No update fields provided' }, { status: 400 });
    }

    const res = await editUser(userId, updates);
    return NextResponse.json(res);
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
