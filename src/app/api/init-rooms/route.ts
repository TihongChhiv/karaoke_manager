import { NextResponse } from 'next/server';
import { initializeRooms } from '@/lib/initRooms';

export async function POST() {
  try {
    const success = await initializeRooms();
    
    if (success) {
      return NextResponse.json({ message: 'Rooms initialized successfully' });
    } else {
      return NextResponse.json(
        { error: 'Failed to initialize rooms' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error initializing rooms:', error);
    return NextResponse.json(
      { error: 'Failed to initialize rooms' },
      { status: 500 }
    );
  }
}

