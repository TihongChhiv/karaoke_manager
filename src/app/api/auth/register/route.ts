import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const { name, email, phone, password, role = 'user' } = body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create new user
    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
    });
    
    await user.save();
    
    // Return user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    };
    
    return NextResponse.json(userResponse, { status: 201 });
  } catch (err: unknown) {
    console.error('Error registering user:', err);
    // FIX: Type-safe error narrowing (avoid `error.message` on `unknown`)
    const message = err instanceof Error ? err.message : 'Failed to register user';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
