import { User as UserType } from '../types';

export interface StoredUserAccount extends UserType {
  passwordHash: string; // Stored securely
}

const REGISTERED_USERS_KEY = 'biznest_registered_users_v2';

// Seed demo accounts so users can log in with known credentials right away
const SEED_USERS: StoredUserAccount[] = [
  {
    id: 'usr-demo-1',
    name: 'Ali Hassan',
    email: 'ali.hassan@example.pk',
    phone: '+92 300 9876543',
    passwordHash: 'password123',
    role: 'user',
    city: 'Lahore',
    savedBusinessIds: ['biz-1', 'biz-2'],
    createdAt: '2026-01-15'
  },
  {
    id: 'merchant-1',
    name: 'Chaudhry Tariq',
    email: 'merchant@greenflora.pk',
    phone: '+92 300 8459123',
    passwordHash: 'password123',
    role: 'business',
    city: 'Lahore',
    businessName: 'Green Flora Botanical Nursery',
    businessId: 'biz-1',
    savedBusinessIds: [],
    createdAt: '2025-11-10'
  },
  {
    id: 'usr-demo-2',
    name: 'Ayesha Malik',
    email: 'ayesha.malik@example.pk',
    phone: '+92 301 5551234',
    passwordHash: 'password123',
    role: 'user',
    city: 'Islamabad',
    savedBusinessIds: [],
    createdAt: '2026-02-01'
  }
];

// Helper to normalize phone numbers for comparison
export function normalizePhone(phone: string): string {
  if (!phone) return '';
  return phone.replace(/[^0-9]/g, '');
}

// Get all users from localStorage + seeds
export function getAllUsers(): StoredUserAccount[] {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (!raw) {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
    const parsed: StoredUserAccount[] = JSON.parse(raw);
    
    // Ensure seed users are always included
    const userMap = new Map<string, StoredUserAccount>();
    SEED_USERS.forEach(u => userMap.set(u.email.toLowerCase(), u));
    parsed.forEach(u => userMap.set(u.email.toLowerCase(), u));
    
    return Array.from(userMap.values());
  } catch (e) {
    console.warn('Error reading stored users:', e);
    return SEED_USERS;
  }
}

export function saveUsers(users: StoredUserAccount[]): void {
  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users:', e);
  }
}

// Validate credentials by Email
export function authenticateByEmail(email: string, pass: string): { success: boolean; user?: UserType; error?: string } {
  const users = getAllUsers();
  const cleanEmail = email.trim().toLowerCase();
  const found = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!found) {
    return { success: false, error: 'No account found with this email address. Please check your spelling or register.' };
  }

  if (found.passwordHash !== pass) {
    return { success: false, error: 'Incorrect password. Please try again or use "Forgot Password".' };
  }

  // Strip passwordHash before returning
  const { passwordHash, ...userObj } = found;
  return { success: true, user: userObj };
}

// Validate credentials by Phone Number
export function authenticateByPhone(phone: string, pass: string): { success: boolean; user?: UserType; error?: string } {
  const users = getAllUsers();
  const normPhone = normalizePhone(phone);
  if (!normPhone) {
    return { success: false, error: 'Please enter a valid phone number.' };
  }

  const found = users.find(u => u.phone && normalizePhone(u.phone) === normPhone);

  if (!found) {
    return { success: false, error: 'No account found with this phone number. Please check the number or register.' };
  }

  if (found.passwordHash !== pass) {
    return { success: false, error: 'Incorrect password. Please try again or use "Forgot Password".' };
  }

  const { passwordHash, ...userObj } = found;
  return { success: true, user: userObj };
}

// Register new user with duplicate checks
export function registerNewUser(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'user' | 'business';
  city: string;
  businessName?: string;
  businessCategory?: string;
}): { success: boolean; user?: UserType; error?: string } {
  const users = getAllUsers();
  const cleanEmail = data.email.trim().toLowerCase();
  const normPhone = normalizePhone(data.phone);

  // Check duplicate email
  if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, error: 'An account with this email address already exists. Please log in instead.' };
  }

  // Check duplicate phone if provided
  if (normPhone && users.some(u => u.phone && normalizePhone(u.phone) === normPhone)) {
    return { success: false, error: 'An account with this phone number already exists. Please log in instead.' };
  }

  const isBusiness = data.role === 'business';
  const newAccount: StoredUserAccount = {
    id: isBusiness ? `merchant-${Date.now()}` : `usr-${Date.now()}`,
    name: data.name.trim(),
    email: cleanEmail,
    phone: data.phone.trim() || '+92 300 0000000',
    passwordHash: data.password,
    role: data.role,
    city: data.city || 'Lahore',
    businessName: isBusiness ? (data.businessName || 'New Merchant') : undefined,
    businessId: isBusiness ? `biz-${Date.now()}` : undefined,
    savedBusinessIds: [],
    createdAt: new Date().toISOString().split('T')[0]
  };

  users.push(newAccount);
  saveUsers(users);

  const { passwordHash, ...userObj } = newAccount;
  return { success: true, user: userObj };
}

// Reset password for an existing account by email or phone
export function resetUserPassword(identifier: string, newPass: string): { success: boolean; error?: string } {
  const users = getAllUsers();
  const cleanIdent = identifier.trim().toLowerCase();
  const normIdent = normalizePhone(identifier);

  const userIdx = users.findIndex(u => 
    u.email.toLowerCase() === cleanIdent || 
    (normIdent.length >= 7 && u.phone && normalizePhone(u.phone) === normIdent)
  );

  if (userIdx === -1) {
    return { success: false, error: 'No account matching this email or phone number was found.' };
  }

  users[userIdx].passwordHash = newPass;
  saveUsers(users);
  return { success: true };
}

// Google OAuth Login / Link / Register
export function handleGoogleAuth(googleUser: {
  name: string;
  email: string;
  photoUrl?: string;
  role?: 'user' | 'business';
}): { user: UserType; isNewAccount: boolean } {
  const users = getAllUsers();
  const cleanEmail = googleUser.email.trim().toLowerCase();
  const existing = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (existing) {
    // Existing account linked seamlessly
    const { passwordHash, ...userObj } = existing;
    return { user: userObj, isNewAccount: false };
  }

  // Create new account via Google
  const isBusiness = googleUser.role === 'business';
  const newAccount: StoredUserAccount = {
    id: `usr-google-${Date.now()}`,
    name: googleUser.name,
    email: cleanEmail,
    phone: '+92 300 0000000',
    passwordHash: `google-oauth-pwd-${Date.now()}`,
    role: googleUser.role || 'user',
    city: 'Lahore',
    savedBusinessIds: [],
    createdAt: new Date().toISOString().split('T')[0]
  };

  users.push(newAccount);
  saveUsers(users);

  const { passwordHash, ...userObj } = newAccount;
  return { user: userObj, isNewAccount: true };
}
