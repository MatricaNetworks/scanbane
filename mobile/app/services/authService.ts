import apiClient from './apiClient';

// Interface for login response
interface User {
  id: number;
  username: string;
  subscriptionTier: string;
  scansUsed: number;
  phoneNumber?: string;
}

// Login with username and password
export async function login(username: string, password: string): Promise<User> {
  const response = await apiClient.post('/login', { username, password });
  return response.data;
}

// Register a new user
export async function register(
  username: string, 
  password: string, 
  phoneNumber?: string
): Promise<User> {
  const response = await apiClient.post('/register', { 
    username, 
    password,
    phoneNumber,
    subscriptionTier: 'free',
    scansUsed: 0
  });
  return response.data;
}

// Request OTP for phone login
export async function requestOtp(phoneNumber: string): Promise<{ message: string; otp?: string }> {
  const response = await apiClient.post('/request-otp', { phoneNumber });
  return response.data;
}

// Verify OTP and login
export async function verifyOtp(phoneNumber: string, otp: string): Promise<User> {
  const response = await apiClient.post('/verify-otp', { phoneNumber, otp });
  return response.data;
}

// Logout user
export async function logout(): Promise<void> {
  await apiClient.post('/logout');
}

// Get current authenticated user
export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get('/user');
  return response.data;
}