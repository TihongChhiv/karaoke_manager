'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Users, 
  Calendar, 
  Clock,
  Mic,
  LogOut,
  X
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { getCurrentUser, logout, type User as AuthUser } from '@/lib/auth';
import { getApiUrl, getPageUrl } from '@/lib/utils';
// Removed mock data - using real data from API
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [rooms, setRooms] = useState<{_id: string, roomNumber: string, capacity: number, status: string}[]>([]);
  const [customers, setCustomers] = useState<{_id: string, name: string, email: string, phone: string}[]>([]);
  const [bookings, setBookings] = useState<{_id: string, customerId: {_id: string, name: string, phone: string, email: string}, roomId: {_id: string, roomNumber: string, capacity: number, status: string}, date: string, startTime: string, endTime: string, status: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const router = useRouter();

  // Refresh bookings when date changes
  const fetchBookingsForDate = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl(`/api/bookings?date=${selectedDate}`));
      const bookingsData = await response.json();
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (_error) {
      console.error('Error fetching bookings for date:', _error);
      setBookings([]);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (user) {
      fetchBookingsForDate();
    }
  }, [selectedDate, user, fetchBookingsForDate]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [roomsRes, customersRes, bookingsRes] = await Promise.all([
        fetch(getApiUrl('/api/rooms')),
        fetch(getApiUrl('/api/customers')),
        fetch(getApiUrl(`/api/bookings?date=${today}`)),
      ]);
      
      const roomsData = await roomsRes.json();
      const customersData = await customersRes.json();
      const bookingsData = await bookingsRes.json();
      
      // Ensure we always have arrays, even if API returns errors
      setRooms(Array.isArray(roomsData) ? roomsData : []);
      setCustomers(Array.isArray(customersData) ? customersData : []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set empty arrays if API fails
      setRooms([]);
      setCustomers([]);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // (wrapped above with useCallback)

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getStats = () => {
    const totalRooms = rooms.length;
    const availableRooms = rooms.filter(room => room.status === 'available').length;
    const occupiedRooms = totalRooms - availableRooms;
    const totalCustomers = customers.length;
    const todayBookings = bookings.filter(booking => 
      new Date(booking.date).toDateString() === new Date(selectedDate).toDateString()
    );
    const activeBookings = todayBookings.filter(booking => booking.status === 'booked').length;

    return {
      totalRooms,
      availableRooms,
      occupiedRooms,
      totalCustomers,
      todayBookings: todayBookings.length,
      activeBookings,
    };
  };

  const getTodayBookings = () => {
    return bookings
      .filter(booking => 
        new Date(booking.date).toDateString() === new Date(selectedDate).toDateString()
      )
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
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

        // Update only the specific booking in state
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking._id === bookingId 
              ? { ...booking, status: 'cancelled' }
              : booking
          )
        );
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking');
      }
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    try {
      const response = await fetch(getApiUrl(`/api/bookings/${bookingId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed',
        }),
      });

      if (!response.ok) {
        alert('Failed to complete booking');
        return;
      }

      // Update only the specific booking in state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: 'completed' }
            : booking
        )
      );
    } catch (error) {
      console.error('Error completing booking:', error);
      alert('Failed to complete booking');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (!confirm('Are you sure you want to permanently delete your admin account? This cannot be undone.')) return;
    try {
      const userId = (user as any)._id ?? (user as any).id;
      const response = await fetch(getApiUrl(`/api/customers/${userId}`), {
        method: 'DELETE',
      });
      if (!response.ok) {
        alert('Failed to delete account');
        return;
      }
      logout();
      router.push('/login');
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

  const stats = getStats();
  const todayBookings = getTodayBookings();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Mic className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
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
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Rooms
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalRooms}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="text-green-600 font-medium">
                    {stats.availableRooms} available
                  </span>
                  <span className="text-gray-500"> • </span>
                  <span className="text-red-600 font-medium">
                    {stats.occupiedRooms} occupied
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Customers
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalCustomers}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {'Today\'s'} Bookings
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.todayBookings}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="text-blue-600 font-medium">
                    {stats.activeBookings} active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Bookings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Bookings for {format(new Date(selectedDate), 'MMMM dd, yyyy')}
              </h2>
            </div>
            <div className="p-6">
              {todayBookings.length > 0 ? (
                <div className="space-y-4">
                  {todayBookings.map((booking) => (
                    <div key={booking._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.customerId?.name || 'Unknown Customer'} - {booking.roomId?.roomNumber || 'Unknown Room'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.startTime} - {booking.endTime}
                          </p>
                          <p className="text-xs text-gray-400">
                            {booking.customerId?.phone || 'N/A'} • {booking.customerId?.email || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.status === 'booked' 
                            ? 'bg-blue-100 text-blue-800'
                            : booking.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                        {booking.status === 'booked' && (
                          <div className="flex space-x-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleCompleteBooking(booking._id)}
                            >
                              Complete
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleCancelBooking(booking._id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings today</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No bookings scheduled for {format(new Date(selectedDate), 'MMMM dd, yyyy')}.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <a
                  href={getPageUrl("/rooms")}
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-300 hover:border-gray-400"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                      <Building2 className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Manage Rooms
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Add, edit, or remove karaoke rooms
                    </p>
                  </div>
                </a>

                <a
                  href={getPageUrl("/customers")}
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-300 hover:border-gray-400"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                      <Users className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Manage Customers
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Add, edit, or remove customer information
                    </p>
                  </div>
                </a>

                <a
                  href={getPageUrl("/bookings")}
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-300 hover:border-gray-400"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                      <Calendar className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Manage Bookings
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Create, edit, or cancel bookings
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
