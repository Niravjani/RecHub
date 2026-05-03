# Admin Setup Guide

## Method 1: Using Seed Script (Recommended) ✅

### Step 1: Customize Admin Credentials
Edit `Backend/seed-admin.js` and change these lines:

```javascript
const adminEmail = 'admin@recruitment.com';     // Change this email
const adminPassword = 'admin99';            // Change to strong password
const adminName = 'Admin User';                 // Change name if desired
```

**Security Tip:** Use a strong password with:
- At least 8 characters
- Mix of uppercase and lowercase letters
- Numbers and special characters
- Example: `SecureAdmin@2024!`

### Step 2: Run the Seed Script
Open terminal in `Backend` folder and run:

```bash
node seed-admin.js
```

### Step 3: Expected Output
```
Connected to MongoDB
✅ Admin user created successfully!
📧 Email: admin@recruitment.com
🔐 Password: admin123456
```

---

## Method 2: Manual Setup via MongoDB Compass/CLI

### Option A: MongoDB Compass (GUI)
1. Open MongoDB Compass
2. Navigate to your database → `users` collection
3. Click "INSERT DOCUMENT"
4. Paste this document:

```json
{
  "_id": { "$oid": "new_objectid_here" },
  "name": "Admin User",
  "email": "admin@recruitment.com",
  "password": "$2a$10$...", // This needs to be hashed!
  "role": "admin",
  "phone": "",
  "profile": {},
  "company": {},
  "createdAt": { "$date": "2024-04-07" },
  "updatedAt": { "$date": "2024-04-07" },
  "__v": 0
}
```

⚠️ **Problem:** Password needs to be hashed (bcrypt). Use seed script instead!

### Option B: MongoDB CLI
```bash
mongosh
use recruitmentdb
db.users.insertOne({
  name: "Admin User",
  email: "admin@recruitment.com",
  password: "hashed_password_here", // Still needs hashing!
  role: "admin"
})
```

⚠️ Same issue - password needs bcrypt hashing.

---

## Method 3: Register via App + Update Role

### Step 1: Register Normally
1. Go to `http://localhost:5173/register`
2. Fill in registration form with admin details
3. Select "Candidate" role (required for registration)
4. Click "Register"

### Step 2: Update Role to Admin
After getting admin user ID, make this API call:

```bash
curl -X PATCH http://localhost:5000/api/admin/users/{USER_ID}/role \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"role":"admin"}'
```

Or use the Admin Panel once you have another admin account.

---

## ✅ How to Login as Admin

### After Creating Admin User:

1. **Start Frontend:**
   ```bash
   cd Frontend
   npm run dev
   ```

2. **Navigate to Login:**
   - Go to `http://localhost:5173/login` (or click "Features" → "Login")

3. **Enter Admin Credentials:**
   - Email: `admin@recruitment.com` (or your custom email)
   - Password: `admin123456` (or your custom password)

4. **Access Admin Panel:**
   - After login, go to `http://localhost:5173/admin/dashboard`
   - You'll see the full admin dashboard with:
     - 📊 Dashboard with statistics
     - 👥 User Management
     - 💼 Job Management
     - 📋 Application Monitoring

---

## 🔄 Change Admin Password

### Option 1: Via Profile Page
1. Login as admin
2. Navigate to `/profile`
3. Update password (if you add this feature)

### Option 2: Via database directly (MongoDB)

**Find and update:**
```javascript
// In MongoDB Compass or mongosh:
db.users.updateOne(
  { email: "admin@recruitment.com" },
  { $set: { "password": "new_hashed_password" } }
)
```

---

## ⚠️ Security Best Practices

1. **Change Default Password** - Don't use `admin123456` in production
2. **Use Strong Passwords** - Mix of uppercase, lowercase, numbers, special chars
3. **Store Credentials Securely** - Don't commit to Git
4. **Backup Admin Access** - Have multiple admin accounts
5. **Environment Variables** - Store in `.env` file

---

## Troubleshooting

### ❌ "Admin user already exists"
**Solution:** 
- Delete from database first: `db.users.deleteOne({ email: "admin@recruitment.com" })`
- Or modify the seed script to use a different email

### ❌ "Cannot connect to MongoDB"
**Solution:**
- Ensure MongoDB is running
- Check `.env` file has correct `MONGODB_URI`
- Verify database name is correct

### ❌ "Admin can't access admin routes"
**Solution:**
- Verify role is `admin` in database: 
  ```javascript
  db.users.findOne({ email: "admin@recruitment.com" })
  ```
- Restart the frontend app

### ❌ "Login says invalid credentials"
**Solution:**
- Verify email and password are correct
- Check that user role is `admin`
- Password is case-sensitive

---

## Quick Start Commands

```bash
# Navigate to backend
cd Backend

# Run seed script to create admin
node seed-admin.js

# Start backend server
node server.js

# In another terminal, start frontend
cd ../Frontend
npm run dev

# Admin panel available at:
# http://localhost:5173/login (login as admin)
# http://localhost:5173/admin/dashboard (after login)
```

---

## Default Admin Credentials (After Running Seed Script)

| Field | Value |
|-------|-------|
| Email | admin@recruitment.com |
| Password | admin123456 |
| Role | admin |

**⚠️ Change these immediately after first login!**
