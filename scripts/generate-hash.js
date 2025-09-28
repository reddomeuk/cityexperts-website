// scripts/generate-hash.js
// Usage: node scripts/generate-hash.js YourStrongPassword

import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.log('Usage: node scripts/generate-hash.js YourStrongPassword');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log('\n✅ Password hash generated:');
console.log(hash);
console.log('\n📝 Add this to your .env file:');
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.log('\n🔐 Keep this hash secure and never commit it to version control!');