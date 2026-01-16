'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Layout from '@/components/Layout';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Table from '@/components/ui/Table';
import { IRoom } from '@/models/Room';
import { getApiUrl } from '@/lib/utils';
export default function RoomsPage() {
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<IRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    roomNumber: '',
    capacity: '',
    status: 'available' as 'available' | 'maintenance',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch(getApiUrl('/api/rooms'));
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      // Set empty array if API fails
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const url = editingRoom ? getApiUrl(`/api/rooms/${editingRoom._id}`) : getApiUrl('/api/rooms');
      const method = editingRoom ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrors(errorData.error ? { general: errorData.error } : {});
        return;
      }

      await fetchRooms();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving room:', error);
      setErrors({ general: 'Failed to save room' });
    }
  };

  const handleEdit = (room: IRoom) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      capacity: room.capacity.toString(),
      status: room.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (room: IRoom) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      const response = await fetch(getApiUrl(`/api/rooms/${room._id}`), {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchRooms();
      } else {
        alert('Failed to delete room');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Failed to delete room');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRoom(null);
    setFormData({
      roomNumber: '',
      capacity: '',
      status: 'available',
    });
    setErrors({});
  };

  const columns = [
    {
      key: 'roomNumber',
      header: 'Room Number',
    },
    {
      key: 'capacity',
      header: 'Capacity',
    },
    {
      key: 'status',
      header: 'Status',
      render: (room: IRoom) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          room.status === 'available' 
            ? 'bg-green-100 text-black' 
            : room.status === 'maintenance'
            ? 'bg-yellow-100 text-black'
            : 'bg-gray-100 text-black'
        }`}>
          {room.status}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading rooms...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Rooms Management</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </Button>
        </div>

        <div className="bg-white shadow rounded-lg">
          <Table
            data={rooms}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            emptyMessage="No rooms found. Add your first room to get started."
          />
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingRoom ? 'Edit Room' : 'Add New Room'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="text-red-600 text-sm">{errors.general}</div>
            )}
            
            <Input
              label="Room Number"
              value={formData.roomNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, roomNumber: e.target.value })}
              error={errors.roomNumber}
              required
            />
            
            <Input
              label="Capacity"
              type="number"
              min="1"
              max="20"
              value={formData.capacity}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, capacity: e.target.value })}
              error={errors.capacity}
              required
            />
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'available' | 'maintenance' })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingRoom ? 'Update' : 'Create'} Room
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
