import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  _id: string;
  roomNumber: string;
  capacity: number;
  status: 'available' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>({
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['available', 'maintenance'],
    default: 'available'
  }
}, {
  timestamps: true
});

export default mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);
