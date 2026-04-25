KF Legacy Resources - Next.js migration

Getting Started

1) Install deps (already installed):
```bash
npm install
```

2) Run dev server:
```bash
npm run dev
```

Open http://localhost:3000

Notes

- Static assets and vendor libs are under `public/assets` copied from the original site.
- Global layout includes Topbar, Header (with Menu), and Footer components.
- Admin login route: `/admin/login`.
- Placeholder pages exist for `/barcode-rfid`, `/network`, `/security`, `/system-storage`, `/other-services`.

Next steps

- Migrate each HTML section into React components under `src/components` and compose into pages.
- Replace inline anchors with Next.js routes where appropriate.
