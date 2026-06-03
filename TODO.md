# TODO - Music-App-TS (Quản lý Topics/Songs + Trash + Bulk + UI)

## Phase 1: Khảo sát & chốt scope

- [x] Xác minh Topics đã có controller/route/views cho CRUD + trash + restore + delete vĩnh viễn + change-status.
- [x] Xác minh Songs routes đã có đủ nhưng controller chỉ có `index`.
- [x] Xác minh views admin cho Songs (create/edit/detail/trash) đang **chưa tồn tại**.
- [x] Xác minh JS admin `public/admin/js/script.js` xử lý change-status/delete/restore/delete-permanent theo form `?_method=`.
- [x] Xác minh upload cloudinary: middleware upload gán `req.body.avatar` và `req.body.audio`; helper trả về `secure_url`.

## Phase 2: Triển khai Songs module (bắt buộc)

- [ ] Tạo/hoàn thiện `controllers/admin/song.controller.ts`:
  - [ ] (sẽ bắt đầu ngay) kiểm tra các field cần render: singerId/topicId/status/lyrics/listen/audio/avatar

  - [ ] create + createPost (slug, xử lý singer/topic/status, avatar/audio)
  - [ ] edit + editPatch
  - [ ] detail
  - [ ] changeStatus
  - [ ] deleteItem (soft)
  - [ ] trash
  - [ ] restore
  - [ ] deletePermanent

- [ ] Tạo views:
  - [ ] `views/admin/pages/songs/create.pug`
  - [ ] `views/admin/pages/songs/edit.pug`
  - [ ] `views/admin/pages/songs/detail.pug`
  - [ ] `views/admin/pages/songs/trash.pug`
- [ ] Bổ sung phần giao diện form đúng layout/selector hiện có (button-change-status/button-delete...)

## Phase 3: Bulk delete theo checkbox-multi (cần làm luôn)

- [ ] Xác định markup checkbox trong index topics/songs (có input checkbox hay chưa)
- [ ] Thêm endpoint bulk delete:
  - [ ] Topics bulk delete (soft)
  - [ ] Songs bulk delete (soft)
- [ ] Thêm UI nút Xóa nhiều + confirm
- [ ] Thêm logic JS bulk delete nếu cần

## Phase 4: Trash

- [ ] Đảm bảo luồng Topics: soft delete → trash → restore → quay lại list.
- [ ] Đảm bảo luồng Songs: soft delete → trash → restore → quay lại list.
- [ ] Đảm bảo luồng xóa vĩnh viễn: xóa khỏi DB.

## Phase 5: Backend validation + flash message

- [ ] Áp dụng validation hiện có (nếu có validations cho topic/song)
- [ ] Chuẩn hóa error/success theo connect-flash của project.

## Phase 6: UI/UX + CSS

- [ ] Bổ sung CSS cho các trang Songs (card/table/form/empty state/buttons)
- [ ] Đồng bộ thêm style cho Trash/Songs nếu thiếu

## Phase 7: Kiểm tra cuối

- [ ] CRUD Topics end-to-end
- [ ] CRUD Songs end-to-end
- [ ] Trash Topics/Songs end-to-end
