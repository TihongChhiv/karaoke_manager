import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';

// GET /api/rooms - Get all rooms
export async function GET() {
  try {
    await connectDB();
    let rooms = await Room.find().sort({ roomNumber: 1 });
    
    // If no rooms exist, create default rooms
    if (rooms.length === 0) {
      console.log('No rooms found, creating default rooms...');
      const defaultRooms = [];
      for (let i = 1; i <= 10; i++) {
        defaultRooms.push({
          roomNumber: `Room ${i}`,
          capacity: Math.floor(Math.random() * 5) + 6, // 6-10 people
          status: 'available'
        });
      }
      
      await Room.insertMany(defaultRooms);
      rooms = await Room.find().sort({ roomNumber: 1 });
      console.log(`Created ${rooms.length} default rooms`);
    }
    
    return NextResponse.json(rooms);
  } catch (err: unknown) { // FIX: type to unknown
    console.error('Error fetching rooms:', err);
    const message = err instanceof Error ? err.message : 'Failed to fetch rooms'; // FIX: narrow
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/rooms - Create a new room
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const room = new Room(body);
    await room.save();
    
    return NextResponse.json(room, { status: 201 });
  } catch (err: unknown) { // FIX: keep unknown + narrow
    console.error('Error creating room:', err);
    const message = err instanceof Error ? err.message : 'Failed to create room'; // FIX: narrow
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
