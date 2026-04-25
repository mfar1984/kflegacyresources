Login error: ReferenceError: ensureAdminSeed is not defined
    at handler (src\pages\api\auth\login.ts:25:5)
  23 |
  24 |   try {
> 25 |     await ensureAdminSeed(ADMIN_USERNAME, ADMIN_PASSWORD);
     |     ^
  26 |
  27 |     const { username, password } = req.body as { username?: string; password?: string };
  28 |     const normalizedUsername = (username || '').trim().toLowerCase();
 POST /api/auth/login 500 in 646ms (next.js: 22ms, proxy.ts: 51ms, application-code: 573ms)
