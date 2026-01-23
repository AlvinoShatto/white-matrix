import bcrypt from 'bcryptjs';
import pool from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function setupAdmin() {
  try {
    console.log('🔧 Setting up admin user...');

    const email = process.env.ADMIN_USERNAME || 'alvinopshatto@gmail.com';
    const plainPassword = process.env.ADMIN_PASSWORD || 'alvino1234';
    const name = 'Admin User';

    // Hash the password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Check if columns exist and add them if needed
    console.log('📋 Checking database schema...');
    try {
      const [columns] = await pool.execute(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users'"
      );
      const columnNames = columns.map(col => col.COLUMN_NAME);
      
      if (!columnNames.includes('password')) {
        console.log('➕ Adding password column to users table...');
        await pool.execute('ALTER TABLE users ADD COLUMN password VARCHAR(255)');
      }
      
      if (!columnNames.includes('is_admin')) {
        console.log('➕ Adding is_admin column to users table...');
        await pool.execute('ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE');
      }
    } catch (error) {
      console.error('⚠️ Could not check schema:', error.message);
    }

    // Check if admin user already exists
    console.log('🔍 Checking for existing admin user...');
    const [existingUsers] = await pool.execute(
      'SELECT id, email FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      console.log('✏️ Admin user exists, updating password...');
      await pool.execute(
        'UPDATE users SET password = ?, is_admin = true WHERE email = ?',
        [hashedPassword, email]
      );
      console.log('✅ Admin password updated successfully!');
    } else {
      console.log('➕ Creating new admin user...');
      await pool.execute(
        'INSERT INTO users (email, password, name, is_admin) VALUES (?, ?, ?, true)',
        [email, hashedPassword, name]
      );
      console.log('✅ Admin user created successfully!');
    }

    console.log('\n📊 Admin Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${plainPassword}`);
    console.log('\n⚠️  Make sure to change these credentials in production!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up admin user:', error.message);
    process.exit(1);
  }
}

setupAdmin();
