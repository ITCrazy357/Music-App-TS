# TODO_ADS.md — Ads Management (Admin + Client)

## Step 1 — Models (MongoDB)

- [x] Create `models/ad.model.ts` (Ad schema per spec)
- [x] Create `models/adClick.model.ts` (AdClick schema for spam prevention)
- [x] Create `models/adView.model.ts` for view de-dup refresh control

## Step 2 — Admin module (Ads CRUD + Trash + Detail)

- [x] Create `controllers/admin/ad.controller.ts`
  - [x] List with pagination/search/filter
  - [x] Create, Edit, Detail
  - [x] Soft delete to Trash, Restore, Delete permanent
- [x] Create `routes/admin/ad.route.ts` (mount CRUD endpoints + requirePermission)

- [ ] Create views:
  - [ ] `views/admin/pages/ads/index.pug`
  - [ ] `views/admin/pages/ads/create.pug`
  - [ ] `views/admin/pages/ads/edit.pug`
  - [ ] `views/admin/pages/ads/detail.pug`
  - [ ] `views/admin/pages/ads/trash.pug`

## Step 3 — Admin navigation + permissions

- [x] Update `views/admin/partials/sider.pug` add Ads menu with permission checks
- [x] Define permission keys for role UI (ads_view/ads_create/ads_edit/ads_delete/ads_statistics)

## Step 4 — Client render Ads in positions

- [ ] Find current client layouts/partials for Home/Sidebar/Footer/Song Detail
- [ ] Implement ad fetching helper (filter active + !draft + within date range + sponsor priority)
- [ ] Render Ads in:
  - [ ] Home Banner Top
  - [ ] Song Detail Banner Song Detail
  - [ ] Sidebar
  - [ ] Footer

## Step 5 — Click tracking + spam click prevention

- [ ] Add client endpoint route to receive ad click tracking
- [ ] Implement logic:
  - [ ] increment clickCount only once per (ad + userId/IP) per window
  - [ ] save AdClick log
- [ ] Update `public/js/script.js` to send click tracking on ad click

## Step 6 — View tracking

- [ ] Implement view tracking when ad is rendered (increment viewCount)
- [ ] If using `AdView`: deduplicate per (ad + userId/IP) per window

## Step 7 — Admin Ads Dashboard/Statistics

- [ ] Implement statistics (total, running, draft, expired, total click, total view, CTR)
- [ ] Create admin statistics view (optional tab or section in index)

## Step 8 — Verification

- [ ] Manual test in admin: CRUD + status/draft/date rules
- [ ] Manual test in client: render + click tracking + spam prevention
- [ ] Validate CTR calculation
