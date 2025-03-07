import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const SALT_ROUNDS = 10;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function validateLogin(username: string, password: string) {
  const user = await db.select().from(users).where(eq(users.username, username)).get();
  
  if (!user) {
    return { success: false, message: 'Invalid username or password' };
  }

  // Check if account is locked
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    const remainingTime = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 1000 / 60);
    return { 
      success: false, 
      message: `Account is locked. Try again in ${remainingTime} minutes` 
    };
  }

  // Verify password
  const isValid = await verifyPassword(password, user.password);

  if (!isValid) {
    // Increment failed attempts
    const failedAttempts = (user.failed_attempts || 0) + 1;
    const updates: any = { failed_attempts: failedAttempts };
    
    // Lock account if max attempts exceeded
    if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
      updates.locked_until = new Date(Date.now() + LOCK_TIME);
    }

    await db
      .update(users)
      .set(updates)
      .where(eq(users.id, user.id))
      .run();

    return { 
      success: false, 
      message: 'Invalid username or password' 
    };
  }

  // Reset failed attempts and update last login
  await db
    .update(users)
    .set({ 
      failed_attempts: 0, 
      locked_until: null, 
      last_login: new Date() 
    })
    .where(eq(users.id, user.id))
    .run();

  return { 
    success: true, 
    user: { 
      id: user.id, 
      username: user.username, 
      role: user.role 
    } 
  };
} 