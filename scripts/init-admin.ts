import { db } from '../src/db';
import { users } from '../src/db/schema';
import { hashPassword } from '../src/utils/auth';
import { eq } from 'drizzle-orm';

async function initAdmin() {
  try {
    // Check if admin exists
    const adminExists = await db.select()
      .from(users)
      .where(eq(users.username, 'admin'))
      .get();

    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await hashPassword('admin123');
    await db.insert(users)
      .values({
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      })
      .run();

    console.log('Admin user created successfully');
    console.log('Username: admin');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    process.exit();
  }
}

initAdmin(); 