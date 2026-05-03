const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/database');

dotenv.config();

const seedTestRecruiters = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB');

    // Test recruiters to create
    const testRecruiters = [
      {
        name: 'Sarah Johnson',
        email: 'sarah@techcorp.com',
        password: 'Test@123456',
        role: 'recruiter',
        company: {
          name: 'Tech Corp',
          website: 'https://techcorp.com',
          industry: 'Technology',
          size: '500-1000',
        },
      },
      {
        name: 'Michael Chen',
        email: 'michael@financeplus.com',
        password: 'Test@123456',
        role: 'recruiter',
        company: {
          name: 'Finance Plus',
          website: 'https://financeplus.com',
          industry: 'Finance',
          size: '200-500',
        },
      },
      {
        name: 'Emma Wilson',
        email: 'emma@healthcare.com',
        password: 'Test@123456',
        role: 'recruiter',
        company: {
          name: 'Healthcare Solutions',
          website: 'https://healthcare.com',
          industry: 'Healthcare',
          size: '100-200',
        },
      },
    ];

    let created = 0;
    let skipped = 0;

    for (const recruiterData of testRecruiters) {
      const existingRecruiter = await User.findOne({ email: recruiterData.email });
      
      if (existingRecruiter) {
        console.log(`⏭️  Skipped (already exists): ${recruiterData.email}`);
        skipped++;
      } else {
        const recruiter = await User.create(recruiterData);
        console.log(`✅ Created: ${recruiterData.name} (${recruiterData.email})`);
        console.log(`   Status: PENDING APPROVAL ⏳`);
        console.log(`   Password: ${recruiterData.password}`);
        created++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Created: ${created} new recruiters`);
    console.log(`Skipped: ${skipped} (already exist)`);
    console.log('\n📋 Next Steps:');
    console.log('1. Go to Admin Panel: http://localhost:5173/admin/recruiter-approvals');
    console.log('2. See the pending recruiters listed');
    console.log('3. Click "Review" and approve/reject them');
    console.log('\n🔐 Test Recruiter Credentials:');
    
    testRecruiters.forEach((rec) => {
      console.log(`   Email: ${rec.email}`);
      console.log(`   Password: ${rec.password}`);
      console.log(`   Company: ${rec.company.name}`);
      console.log('   ---');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test recruiters:', error.message);
    process.exit(1);
  }
};

seedTestRecruiters();