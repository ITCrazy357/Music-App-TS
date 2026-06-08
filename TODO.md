# TODO - Admin Dashboard

## Plan triển khai

- [x] Bước A: Đọc dashboard hiện tại + model fields liên quan (Song/Topic/Singer/User/Role).

- [ ] Bước B: Cập nhật `controllers/admin/dashboard.controller.ts` để lấy thống kê thật từ MongoDB (countDocuments/aggregate), không hard-code.

- [ ] Bước C: Cập nhật `views/admin/pages/dashboard/index.pug`:
  - Thay toàn bộ số cứng bằng biến từ controller.
  - Thêm phần Deleted/Active/Inactive theo status/deleted.
  - Thêm danh sách Bài hát mới nhất, Chủ đề mới nhất.
  - Thêm thống kê tương tác (Top listen / Top like) nếu data tồn tại.
  - Thêm Activity gần đây theo createdBy/updatedBy.
  - (Nếu có vùng chart trong dashboard hiện tại thì render dữ liệu thật; nếu không thì bỏ qua.)
- [ ] Bước D: Kiểm tra build/run (npm test hoặc npm run dev tùy dự án).
- [ ] Bước E: Liệt kê thống kê đã render, query đã dùng, file đã sửa, và trích code thay đổi.
