# Quick Setup Guide

## 🚀 Getting Started (Frontend Only)

The application is now set up to work with **mock data** so you can see the frontend immediately without needing MongoDB.

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Open Your Browser
Navigate to [http://localhost:3000](http://localhost:3000)

### 3. Explore the Features
- **Dashboard**: Overview of rooms, customers, and bookings
- **Rooms**: Manage karaoke rooms (currently showing mock data)
- **Customers**: Manage customer information (currently showing mock data)  
- **Bookings**: Create and manage bookings (currently showing mock data)

## 📊 Mock Data Included

The app currently displays sample data:
- **3 Rooms**: Room 1, Room 2, VIP Room
- **3 Customers**: John Doe, Jane Smith, Mike Johnson
- **2 Bookings**: Sample bookings for today

## 🔧 Adding MongoDB Later

When you're ready to connect to MongoDB:

1. Create a `.env.local` file:
```
MONGODB_URI=mongodb://localhost:27017/karaoke-management
```

2. Install and start MongoDB locally, or use MongoDB Atlas

3. The app will automatically switch from mock data to real database data

## ✨ Features Working Now

- ✅ Modern, responsive UI
- ✅ Navigation between pages
- ✅ Forms for adding/editing data
- ✅ Data tables with actions
- ✅ Modal dialogs
- ✅ Status indicators
- ✅ Date filtering for bookings
- ✅ Mock data for demonstration

The frontend is fully functional and ready to use!

