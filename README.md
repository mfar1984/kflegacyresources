# ANSAR TECHNOLOGIES SDN. BHD.

Website rasmi untuk ANSAR TECHNOLOGIES SDN. BHD. - penyedia penyelesaian IT yang komprehensif di Malaysia.

## Maklumat Syarikat

**ANSAR TECHNOLOGIES SDN. BHD.**  
Nombor Pendaftaran: 940482-W / 201101012342

**Alamat:**  
B2-1-34, TINGKAT 1, JALAN PINGGIRAN 1/3  
TAMAN PINGGIRAN PUTRA,  
43300 SERI KEMBANGAN  
SELANGOR, MALAYSIA

**Hubungi Kami:**
- Tel: 03-8959 0530 / 03-8959 0539
- Email: support@ansartechnologies.my

## Struktur Menu

Website ini mengandungi menu-menu berikut:

1. **Home** - Halaman utama dengan hero section, about us, vision/mission/value, dan services
2. **About**
   - About Us
   - Our Mission
   - Our Vision
   - Our Value
3. **Services**
   - Network
   - Security
   - System & Storage
4. **Product**
5. **Portfolio**
6. **Career**
7. **Contact Us**

## Teknologi

Website ini dibina menggunakan:
- Next.js 15.5.4
- React 19.1.0
- TypeScript
- Bootstrap 5
- Tailwind CSS 4

## Development

### Prerequisites

- Node.js 18+ dan npm

### Installation

```bash
# Install dependencies
npm install
```

### Running Locally

```bash
# Development mode
npm run dev

## KPI Module (MVP)

The KPI Management module introduces admin and employee workflows for Key Performance Indicators.

### Database
- See `database/create_kpi_management.sql` for tables: `kpi_periods`, `kpi_templates`, `kpi_assignments`, `kpi_updates`, `kpi_reviews` and seeded permissions.

### Permissions (Admin)
- Templates: `kpi_templates_view/create/edit/delete`
- Periods: `kpi_periods_view/create/edit/close`
- Assignments: `kpi_assignments_view/create/edit/delete`
- Reviews: `kpi_reviews_view/approve/reject`

### APIs
- Admin
  - GET/POST/PUT `/api/admin/kpi/periods`
  - GET/POST/PUT/DELETE `/api/admin/kpi/templates`
  - GET/POST/PUT/DELETE `/api/admin/kpi/assignments`
  - POST `/api/admin/kpi/reviews`
- Employee
  - GET `/api/employee/kpi` (list assignments)
  - POST `/api/employee/kpi/update` (FormData: evidence upload)
  - POST `/api/employee/kpi/submit` (submit all for a period)

### UI
- Admin Sidebar → Human Resources → KPI: Templates, Periods, Assignments, Reviews
- Employee Sidebar → My KPIs

### Scoring
- Number/Percent: `score_item = MIN(actual/target, 1) * 100`
- Boolean: `actual ? 100 : 0`
- Overall: `SUM(score_item * weight) / SUM(weight)`

### LNPT Extensions
- Dual-reviewers (PPP/PPK/HR) and mid/final phases on reviews.
- Optional competencies rubric (weighted) blended with KPI 70/30.
- Grade bands map final score to grade and KPI bonus (fixed/percent).
- On period close, results are saved to `kpi_employee_results` and KPI bonus can be included in payroll processing.

### CSV (Assignments)
- Bulk CSV import stub: use `employee_id,template_code,target_value,weight`. Implement importer per business rules.

### Operations (Migrations & Seeds)
- Apply `database/create_kpi_management.sql` to create all KPI tables and seed default competencies and grade bands.
- KPI Results CSV export: `/api/admin/kpi/results-export?hash=...&period_id=...`
- KPI Assignments CSV import: POST `/api/admin/kpi/assignments-import?hash=...` with form-data: `file` (CSV), `period_id`.

```

Buka [http://localhost:3000](http://localhost:3000) dalam browser anda.

### Build untuk Production

```bash
# Build
npm run build

# Start production server
npm start
```

## Struktur Folder

```
ANSARTECHNOLOGIES/
├── public/
│   └── assets/
│       ├── css/          # CSS files
│       ├── js/           # JavaScript files
│       ├── vendor/       # Third-party libraries
│       └── img/          # Images (tambah logo di sini)
├── src/
│   ├── app/
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   └── globals.css   # Global styles
│   └── components/
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── Topbar.tsx
│       ├── Menu.tsx
│       ├── About.tsx
│       ├── Services.tsx
│       └── VisionMissionValue.tsx
└── package.json
```

## Notes Penting

### Logo

Sila tambah fail logo di lokasi berikut:
- `/public/assets/img/logo.png` - Logo untuk header
- `/public/assets/img/footerlogo.png` - Logo untuk footer
- `/public/assets/img/hero-img.png` - Hero image untuk home page

### Design

Website ini menggunakan design yang sama dengan kf-next:
- Topbar dengan date/time dan contact info
- Navbar dengan dropdown menu
- Hero section dengan call-to-action
- About, Vision, Mission, Value sections
- Services section
- Footer dengan company details

## Deployment

Website ini boleh di-deploy ke mana-mana platform hosting yang support Next.js seperti:
- Vercel (recommended)
- Netlify
- cPanel dengan Node.js support

## License

© 2025 ANSAR TECHNOLOGIES SDN. BHD. All Rights Reserved.

