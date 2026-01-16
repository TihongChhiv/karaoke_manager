'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  Building2, 
  LogOut,
  X
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { getCurrentUser, logout } from '@/lib/auth';
import { getApiUrl, getRouterUrl } from '@/lib/utils';
// Removed mock data - using real data from API
import { format } from 'date-fns';

type RoomUI = {_id: string, roomNumber: string, capacity: number, status: string};
type CustomerUI = {_id: string, name: string, phone: string, email: string};
type BookingUI = {
  _id: string,
  customerId: string | CustomerUI,
  roomId: string | RoomUI,
  date: string,
  startTime: string,
  endTime: string,
  status: string
};

const resolveId = (ref: unknown): string => {
  if (!ref) return '';
  if (typeof ref === 'string') return ref;
  if (typeof ref === 'object' && ref !== null && '_id' in (ref as Record<string, unknown>)) {
    const maybeId = (ref as Record<string, unknown>)['_id'];
    return typeof maybeId === 'string' ? maybeId : '';
  }
  return '';
};

export default function UserDashboard() {
  const [user, setUser] = useState<{_id: string, name: string, email: string, role: string} | null>(null);
  const [rooms, setRooms] = useState<RoomUI[]>([]);
  const [bookings, setBookings] = useState<BookingUI[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomUI | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateBookings, setDateBookings] = useState<BookingUI[]>([]);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'user') {
      router.push(getRouterUrl('/login'));
      return;
    }
    const normalizedUser = {
      _id: (currentUser as any)._id ?? (currentUser as any).id ?? '',
      name: (currentUser as any).name ?? '',
      email: (currentUser as any).email ?? '',
      role: (currentUser as any).role ?? 'user',
    };
    setUser(normalizedUser);
    console.log('Current user:', currentUser);
    fetchData();
    fetchAllBookings(); // Also fetch all bookings for My Bookings section
  }, [router]);

  // Fetch bookings when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchBookingsForDate(selectedDate);
    }
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [roomsRes, bookingsRes] = await Promise.all([
        fetch(getApiUrl('/api/rooms')),
        fetch(getApiUrl(`/api/bookings?date=${today}`)),
      ]);
      
      const roomsData = await roomsRes.json();
      const bookingsData = await bookingsRes.json();
      
      // Ensure we always have arrays, even if API returns errors
      setRooms(Array.isArray(roomsData) ? roomsData : []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set empty arrays if API fails
      setRooms([]);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllBookings = async () => {
    try {
      // Fetch all bookings for the user, not just today's
      const response = await fetch(getApiUrl('/api/bookings'));
      const bookingsData = await response.json();
      console.log('Fetched all bookings:', bookingsData);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      setBookings([]);
    }
  };

  const fetchBookingsForDate = async (date: string) => {
    try {
      const response = await fetch(getApiUrl(`/api/bookings?date=${date}`));
      const bookingsData = await response.json();
      setDateBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (error) {
      console.error('Error fetching bookings for date:', error);
      setDateBookings([]);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleRoomClick = (room: RoomUI) => {
    setSelectedRoom(room);
    setSelectedTimeSlot(null);
    setIsBookingModalOpen(true);
  };

  const getAvailableRooms = () => {
    return rooms.filter(room => room.status === 'available'); // Only show available rooms, exclude maintenance
  };

  const getUserBookings = () => {
    const userBookings = bookings.filter(booking => {
      const customerId = resolveId(booking.customerId as unknown);
      const userId = user?._id ?? '';
      console.log('Booking customerId:', customerId, 'User ID:', userId, 'Match:', customerId === userId);
      return customerId === userId && booking.status !== 'cancelled';
    });
    console.log('All bookings:', bookings);
    console.log('User bookings:', userBookings);
    return userBookings;
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 22; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      slots.push({
        id: `${hour}-${hour + 1}`,
        startTime,
        endTime,
        label: `${startTime} - ${endTime}`
      });
    }
    return slots;
  };

  const getBookedTimeSlots = () => {
    const roomBookings = dateBookings.filter(booking => 
      resolveId(booking.roomId as unknown) === selectedRoom?._id &&
      booking.status === 'booked'
    );
    
    return roomBookings.map(booking => {
      const startHour = parseInt(booking.startTime.split(':')[0]);
      return `${startHour}-${startHour + 1}`;
    });
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTimeSlot) {
      alert('Please select a time slot');
      return;
    }
    
    try {
      if (!selectedRoom || !user) {
        alert('Please select a room and ensure you are logged in.');
        return;
      }
      const timeSlot = generateTimeSlots().find(slot => slot.id === selectedTimeSlot);
      if (!timeSlot) {
        alert('Invalid time slot selected');
        return;
      }

      const bookingData = {
        roomId: selectedRoom._id,
        customerId: user._id,
        date: selectedDate,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        status: 'booked',
      };

      console.log('User object:', user);
      console.log('Sending booking data:', bookingData);

      const response = await fetch(getApiUrl('/api/bookings'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        alert(responseData.error || 'Failed to create booking');
        return;
      }

      // Refresh data - fetch all bookings to show in My Bookings
      await fetchAllBookings();
      // Also refresh date bookings to update availability
      await fetchBookingsForDate(selectedDate);
      setIsBookingModalOpen(false);
      setSelectedRoom(null);
      setSelectedTimeSlot(null);
      alert('Room booked successfully!');
    } catch (error: unknown) {
      console.error('Error creating booking:', error);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      alert('Failed to create booking: ' + msg);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      try {
        const response = await fetch(getApiUrl(`/api/bookings/${bookingId}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'cancelled',
          }),
        });

        if (!response.ok) {
          alert('Failed to cancel booking');
          return;
        }

        // Refresh data - fetch all bookings to show updated list
        await fetchAllBookings();
        // Also refresh date bookings to update availability
        await fetchBookingsForDate(selectedDate);
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking');
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (!confirm('Are you sure you want to permanently delete your account? This cannot be undone.')) return;
    try {
      const response = await fetch(getApiUrl(`/api/customers/${user._id}`), {
        method: 'DELETE',
      });
      if (!response.ok) {
        alert('Failed to delete account');
        return;
      }
      logout();
      router.push(getRouterUrl('/login'));
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const availableRooms = getAvailableRooms();
  const userBookings = getUserBookings();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Karaoke Booking</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <Button variant="danger" onClick={handleDeleteAccount}>
                <X className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Date Selection */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center space-x-4">
              <Calendar className="h-5 w-5 text-gray-400" />
              <label className="text-sm font-medium text-gray-700">Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Available Rooms */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Available Rooms</h2>
                  <p className="text-sm text-gray-500 mt-1">Click on a room to book it</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {availableRooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableRooms.map((room) => (
                    <div 
                      key={room._id} 
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all"
                      onClick={() => handleRoomClick(room)}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">{room.roomNumber}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">Capacity: {room.capacity} people</p>
                      <p className="text-xs text-blue-600 mt-2 font-medium">Click to book this room</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Loading rooms...</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Please wait while we load the available rooms.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* My Bookings */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">My Bookings</h2>
            </div>
            <div className="p-6">
              <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
                Debug: Total bookings: {bookings.length}, User bookings: {userBookings.length}
              </div>
              {userBookings.length > 0 ? (
                <div className="space-y-4">
                  {userBookings.map((booking) => (
                    <div key={booking._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {typeof booking.roomId === 'string' 
                              ? 'Room ' + booking.roomId 
                              : booking.roomId?.roomNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(booking.date), 'MMM dd, yyyy')} • {booking.startTime} - {booking.endTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.status === 'booked' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {booking.status}
                        </span>
                        {booking.status === 'booked' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleCancelBooking(booking._id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Book a room to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedRoom(null);
          setSelectedTimeSlot(null);
        }}
        title={`Book ${selectedRoom?.roomNumber || 'Room'}`}
        size="lg"
      >
        <form onSubmit={handleBookingSubmit} className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-blue-800">Selected Room</h3>
            <p className="text-lg font-semibold text-blue-900 mt-1">
              {selectedRoom?.roomNumber || 'No room selected'}
            </p>
            <p className="text-sm text-blue-600">
              Capacity: {selectedRoom?.capacity || 'N/A'} people
            </p>
            <p className="text-sm text-blue-600">
              Date: {format(new Date(selectedDate), 'MMMM dd, yyyy')}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Time Slot</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
              {generateTimeSlots()
                .filter(slot => !getBookedTimeSlots().includes(slot.id))
                .map((slot) => {
                  const isSelected = selectedTimeSlot === slot.id;
                  
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot.id)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold">{slot.startTime}</div>
                        <div className="text-xs opacity-75">to {slot.endTime}</div>
                      </div>
                    </button>
                  );
                })}
            </div>
            {generateTimeSlots().filter(slot => !getBookedTimeSlots().includes(slot.id)).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p>No available time slots for this room today</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={() => setIsBookingModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedTimeSlot}
              className={!selectedTimeSlot ? 'opacity-50 cursor-not-allowed' : ''}
            >
              Book Room
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
