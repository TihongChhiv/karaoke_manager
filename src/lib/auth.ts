// Simple authentication system for demo purposes
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  phone?: string;
}

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@karaoke.com',
    role: 'admin',
    phone: '+1234567890'
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    phone: '+1234567890'
  },
  {
    id: '3',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    phone: '+0987654321'
  }
];

export function registerUser(userData: Omit<User, 'id' | 'role'>): User | null {
  // Check if user already exists
  const existingUser = mockUsers.find(u => u.email === userData.email);
  if (existingUser) {
    return null; // User already exists
  }

  // Create new user
  const newUser: User = {
    id: Date.now().toString(),
    ...userData,
    role: 'user'
  };

  // Add to mock users (in real app, this would be saved to database)
  mockUsers.push(newUser);
  
  return newUser;
}

export function login(email: string, password: string): User | null {
  // Simple demo login - in real app, this would check against a database
  const user = mockUsers.find(u => u.email === email);
  if (user && password === 'password') {
    return user;
  }
  return null;
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
}

export function setCurrentUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('currentUser', JSON.stringify(user));
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('currentUser');
}
