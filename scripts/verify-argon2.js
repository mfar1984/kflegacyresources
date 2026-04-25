const argon2 = require('argon2');

const hash = '$argon2id$v=19$m=65536,t=3,p=4$MvPVJCv6QoLx4Icw7ksquA$Rs7/1LgCJx3fDaDA1vKSkzBK2zaCV4V1atiZWXhlnN0';
const password = 'S0m3b0dy!984';

(async () => {
  try {
    const ok = await argon2.verify(hash, password);
    console.log('verify result:', ok);
  } catch (e) {
    console.error('verify error:', e);
    process.exit(1);
  }
})();


