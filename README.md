# Karaoke Management System

## Project Description

This is a comprehensive Karaoke Management System built with Next.js, React, and MongoDB. The system provides a complete solution for managing karaoke room bookings, customer information, and administrative tasks.

### Features

#### For Users
- **Room Booking**: Users can browse available karaoke rooms and book time slots
- **Booking Management**: View, modify, and cancel existing bookings
- **User Dashboard**: Personalized dashboard showing booking history and upcoming reservations

#### For Administrators
- **Admin Dashboard**: Comprehensive overview of system statistics and daily operations
- **Room Management**: Add, edit, and remove karaoke rooms with capacity and status tracking
- **Customer Management**: Manage customer information and booking history
- **Booking Management**: View all bookings, update status, and handle cancellations
- **Real-time Updates**: Live booking status and room availability

#### System Features
- **Authentication System**: Secure login/registration for both users and administrators
- **Database Integration**: MongoDB for persistent data storage
- **Responsive Design**: Modern UI that works on desktop and mobile devices
- **Real-time Data**: Live updates for booking status and room availability
- **Date-based Booking**: Select specific dates and time slots for reservations

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Custom JWT-based authentication
- **Icons**: Lucide React

### Getting Started

1. **Prerequisites**
   - Node.js 18+ 
   - MongoDB database

2. **Installation**
   ```bash
   cd karaoke-management
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Configure MongoDB connection string

4. **Running the Application**
   ```bash
   npm run dev
   ```
   
   The application will be available at: `http://localhost:3000/app/karaoke-management`

5. **Initial Setup**
   - Visit the setup page to initialize default rooms
   - Create admin account for system management
   - Register user accounts for booking functionality

### Project Structure
```
karaoke-management/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── admin/          # Admin dashboard
│   │   ├── user/           # User dashboard
│   │   ├── api/            # API routes
│   │   └── ...
│   ├── components/         # Reusable UI components
│   ├── lib/               # Utility functions and configurations
│   └── models/            # Database models
├── public/                # Static assets
└── docs/                  # Documentation files
```

### API Endpoints
- `/api/auth/*` - Authentication endpoints
- `/api/rooms/*` - Room management
- `/api/customers/*` - Customer management  
- `/api/bookings/*` - Booking management
- `/api/init-rooms` - Database initialization

### Data Models
`Rooms: Manage karaoke rooms`
- Manage karaoke rooms Key fields: id, roomNumber, capacity, status ('available' | 'maintenance')
- CRUD: Create room, list/get rooms, update room (number/capacity/status), delete room
    
`Users(customer/admin)`
- Key fields: id, name, email, phone, role ('user' | 'admin'), password (hashed)
- CRUD: Register/create user, list/get users, update profile, delete account

`Bookings: Manage room reservations`
- Key fields: id, roomId, customerId, date, startTime, endTime, status ('booked' | 'completed' | 'cancelled')
- CRUD: Create booking, list/get bookings (with filters), update status/times, delete booking

 we did say our Data Models were gonna be User/Admins/Booking before however user and admin kinda fall under the same category
 If ajarn is okay with the previous Data Models then we go with that but if not then we can use the given Data Model :) :)

### Contributing
This project was developed as part of a web development course assignment. The system demonstrates full-stack development capabilities with modern web technologies.


