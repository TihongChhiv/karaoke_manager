import connectDB from './mongodb';
import Room from '@/models/Room';

const initialRooms = [
  { roomNumber: 'Room 1', capacity: 6, status: 'available' },
  { roomNumber: 'Room 2', capacity: 7, status: 'available' },
  { roomNumber: 'Room 3', capacity: 8, status: 'available' },
  { roomNumber: 'Room 4', capacity: 6, status: 'available' },
  { roomNumber: 'Room 5', capacity: 9, status: 'available' },
  { roomNumber: 'Room 6', capacity: 10, status: 'available' },
  { roomNumber: 'Room 7', capacity: 6, status: 'available' },
  { roomNumber: 'Room 8', capacity: 8, status: 'available' },
  { roomNumber: 'Room 9', capacity: 7, status: 'available' },
  { roomNumber: 'VIP Room', capacity: 10, status: 'available' },
];

export async function initializeRooms() {
  try {
    await connectDB();
    
    // Clear existing rooms
    await Room.deleteMany({});
    
    // Insert initial rooms
    await Room.insertMany(initialRooms);
    
    console.log('✅ Rooms initialized successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error initializing rooms:', error);
    return false;
  }
}

