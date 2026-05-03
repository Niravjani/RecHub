/**
 * UTILITY SCRIPT: Rehash Old Passwords
 * 
 * This script helps fix login issues with old accounts that might have
 * plain text passwords saved in the database (before hashing was implemented).
 * 
 * Run with: node migrate-passwords.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const migratePasswords = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✓ Connected to MongoDB');

    // Get all users
    const users = await User.find({}).select('+password');
    console.log(`Found ${users.length} users`);

    let updated = 0;
    let skipped = 0;

    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2x$)
      const isHashedPassword = user.password.startsWith('$2');

      if (isHashedPassword) {
        console.log(`✓ ${user.email} - Already hashed`);
        skipped++;
      } else {
        // Hash the password
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
        await user.save();
        console.log(`✓ ${user.email} - Password rehashed`);
        updated++;
      }
    }

    console.log(`\n✓ Migration complete!`);
    console.log(`  - Updated: ${updated} users`);
    console.log(`  - Skipped: ${skipped} users (already hashed)`);

    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
};

migratePasswords();
