'use client';

import React, { useState } from 'react';
import { Mic, Database } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getApiUrl, getPageUrl } from '@/lib/utils';

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const initializeRooms = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(getApiUrl('/api/init-rooms'), {
        method: 'POST',
      });

      if (response.ok) {
        setMessage('✅ Rooms initialized successfully! 10 rooms have been created in the database.');
      } else {
        setMessage('❌ Failed to initialize rooms. Please check your MongoDB connection.');
      }
    } catch (error) {
      setMessage('❌ Error initializing rooms. Please check your MongoDB connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Mic className="h-12 w-12 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Karaoke Manager</h1>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Database Setup
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Initialize your karaoke rooms in the database
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="text-center">
              <Database className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                Initialize Rooms
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                This will create 10 karaoke rooms in your database with capacities from 6-10 people.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-blue-800">Rooms to be created:</h4>
              <ul className="text-xs text-blue-600 mt-2 list-disc list-inside space-y-1">
                <li>Room 1-4: 6-8 people capacity</li>
                <li>Room 5-6: 9-10 people capacity</li>
                <li>Room 7-9: 6-8 people capacity</li>
                <li>VIP Room: 10 people capacity</li>
              </ul>
            </div>

            {message && (
              <div className={`p-4 rounded-md text-sm ${
                message.includes('✅') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <div>
              <Button
                onClick={initializeRooms}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Initializing...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Initialize Rooms
                  </>
                )}
              </Button>
            </div>

            <div className="text-center">
              <a
                href={getPageUrl("/login")}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Go to Login Page
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

