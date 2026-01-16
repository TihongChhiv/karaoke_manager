import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// GET /api/customers - Get all customers (users with role 'user')
export async function GET() {
  try {
    await connectDB();
    const customers = await User.find({ role: 'user' })
      .select('name email phone createdAt')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(customers);
  } catch (err: unknown) {                     // FIX: type to unknown
    console.error('Error fetching customers:', err);
    const message = err instanceof Error ? err.message : 'Failed to fetch customers'; // FIX: narrow
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/customers - Create a new customer
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const customer = new User({
      ...body,
      role: 'user'
    });
    await customer.save();
    
    return NextResponse.json(customer, { status: 201 });
  } catch (err: unknown) {                     // FIX: keep as unknown
    console.error('Error creating customer:', err);
    const message = err instanceof Error ? err.message : 'Failed to create customer'; // FIX: narrow
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
