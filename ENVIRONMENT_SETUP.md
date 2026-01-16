# 🔧 Environment Setup Guide

## 📋 **Required Environment Variables**

To connect your Karaoke Management System to MongoDB Atlas, you need to create an environment file.

### **Step 1: Create Environment File**

Create a file named `.env.local` in the root directory of your project :

### **Step 2: File Structure**

Your project structure should look like this:
```
karaoke-management/
├── .env.local          ← Create this file
├── src/
├── package.json
└── ...
```

### **Step 3: Restart Development Server**

After creating the `.env.local` file:

1. Stop the current development server (Ctrl+C)
2. Restart it with: `npm run dev`

### **Step 4: Verify Connection**

Once the server restarts, the application will:
- ✅ Connect to your MongoDB Atlas database
- ✅ Use real data instead of mock data
- ✅ Persist all changes to the database

## 🔐 **Security Notes**

- The `.env.local` file is automatically ignored by Git
- Never commit environment files to version control
- Keep your MongoDB credentials secure

## 🚀 **What This Enables**

With the MongoDB connection configured, your application will:

1. **Real Data Storage**: All rooms, customers, and bookings will be saved to MongoDB
2. **User Registration**: New user accounts will be stored in the database
3. **Persistent Sessions**: User login sessions will be maintained
4. **Data Persistence**: All changes will be saved and available across sessions

## 📱 **Testing the Connection**

After setting up the environment:

1. **Register a new user** → Should be saved to MongoDB
2. **Create a room** → Should appear in the database
3. **Make a booking** → Should be stored permanently
4. **Refresh the page** → Data should persist

## 🔧 **Troubleshooting**

If you encounter connection issues:

1. **Check the connection string** is correct
2. **Verify MongoDB Atlas** allows connections from your IP
3. **Ensure the database user** has proper permissions
4. **Check the network** connection

## 📞 **Support**

If you need help with the MongoDB setup, refer to:
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

**Your Karaoke Management System is now ready to use with real database storage!** 🎤✨

