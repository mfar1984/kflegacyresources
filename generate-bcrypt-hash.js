// Generate bcrypt hash for admin password
const bcrypt = require('bcryptjs');

const password = 'S0m3b0dy!984';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    process.exit(1);
  }
  
  console.log('\n=== BCRYPT HASH GENERATED ===');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\n=== SQL UPDATE COMMAND ===');
  console.log(`UPDATE admins SET password_hash = '${hash}' WHERE username = 'administrator@root';`);
  console.log('\n');
});
