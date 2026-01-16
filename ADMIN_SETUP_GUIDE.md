# 🔐 Admin User Setup Guide

## 🚀 **New Admin Registration System**

Your Karaoke Management System now has a complete admin registration system that integrates with MongoDB!

### **📋 What's New:**

1. **Admin Registration Page**: `/admin-register` - Create admin accounts
2. **MongoDB Integration**: All users are stored in the database
3. **Secure Authentication**: Password hashing and validation
4. **Role-based Access**: Separate admin and user accounts

## 🔧 **Setup Instructions**

### **Step 1: Install Required Dependencies**

Run this command to install password hashing:
```bash
npm install bcryptjs @types/bcryptjs
```

### **Step 2: Create Your First Admin Account**

1. **Navigate to**: `http://localhost:3000/admin-register`
2. **Fill out the form**:
   - Full Name: Your name
   - Email: Your admin email
   - Phone: Your phone number
   - Password: Secure password (min 6 characters)
   - Confirm Password: Same password
   - **Admin Key**: `admin123` (default key)

3. **Click "Create Admin Account"**

### **Step 3: Login as Admin**

1. **Go to**: `http://localhost:3000/login`
2. **Use your admin credentials** to login
3. **You'll be redirected** to the admin dashboard

## 🎯 **Admin Features**

### **What Admins Can Do:**
- ✅ **Full System Access**: Manage all aspects of the system
- ✅ **User Management**: View all registered users
- ✅ **Booking Control**: Cancel any user's booking
- ✅ **Room Management**: Add, edit, delete rooms
- ✅ **Customer Management**: Manage customer information
- ✅ **Statistics**: View system-wide statistics
- ✅ **Date Filtering**: Filter bookings by date

### **Admin Dashboard Features:**
- **Real-time Statistics**: Total rooms, customers, bookings
- **Today's Bookings**: All bookings for selected date
- **Booking Management**: Complete or cancel bookings
- **Quick Actions**: Direct access to management pages

## 👥 **User vs Admin Accounts**

### **Regular Users** (`/register`):
- Can book rooms
- Can view their own bookings
- Can cancel their own bookings
- Limited access to system

### **Admin Users** (`/admin-register`):
- Full system access
- Can manage all bookings
- Can cancel any user's booking
- Can manage rooms and customers
- Access to all system features

## 🔐 **Security Features**

### **Password Security:**
- Passwords are hashed using bcrypt
- Minimum 6 character requirement
- Secure password storage in MongoDB

### **Admin Key Protection:**
- Admin registration requires a special key
- Default key: `admin123`
- You can change this in the code if needed

### **Role-based Access:**
- Users can only access their own data
- Admins have full system access
- Automatic redirects based on user role

## 📱 **How to Use**

### **For New Admins:**
1. Go to `/admin-register`
2. Fill out the form with admin key `admin123`
3. Login with your new credentials
4. Access full admin dashboard

### **For Regular Users:**
1. Go to `/register`
2. Create a user account
3. Login and book rooms
4. Manage their own bookings

## 🔄 **Database Integration**

### **MongoDB Collections:**
- **Users**: Stores all user accounts (admin and regular)
- **Rooms**: Karaoke room information
- **Customers**: Customer information
- **Bookings**: All booking records

### **User Schema:**
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  role: 'admin' | 'user',
  createdAt: Date,
  updatedAt: Date
}
```

## 🛠 **Customization**

### **Change Admin Key:**
Edit `/src/app/admin-register/page.tsx`:
```javascript
if (formData.adminKey !== 'your-new-key') {
  setError('Invalid admin key');
  return;
}
```

### **Add More Admin Features:**
- User management interface
- System settings
- Reports and analytics
- Email notifications

## 🚀 **Ready to Use!**

Your admin system is now fully functional with MongoDB integration! 

**Next Steps:**
1. Install bcryptjs: `npm install bcryptjs @types/bcryptjs`
2. Create your first admin account
3. Start managing your karaoke business!

---

**Your Karaoke Management System now has complete admin functionality!** 🎤✨

