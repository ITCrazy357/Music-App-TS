# TODO - Nâng cấp hệ thống Comment (Songs Detail)

## Phase A - UX không reload + mới nhất lên đầu

- [x] Create comment không reload (AJAX + append DOM)
- [ ] Đảm bảo khi tạo comment xong: comment mới chèn lên đầu danh sách (hoặc sắp theo sort đang chọn).

## Phase B - Sửa comment (owner-only, AJAX)

- [ ] Model: thêm `edited: boolean`, `editedAt: Date`
- [ ] Route: `PATCH /comments/edit/:idComment`
- [ ] Controller: kiểm tra `deleted=false`, kiểm quyền `comment.userId === res.locals.user.id`
- [ ] Update Mongo: set `content`, `edited=true`, `editedAt=now`
- [ ] Trả JSON comment sau khi update (populate `userId`)
- [ ] View: hiển thị `[Sửa] [Xóa]` cho comment thuộc user đang đăng nhập
- [ ] View: UI mode edit (textarea + Save/Cancel)
- [ ] JS: fetch edit, cập nhật nội dung ngay + hiển thị nhãn “(đã chỉnh sửa)”

## Phase C - Xóa comment (owner-only, soft delete)

- [ ] Route: `DELETE /comments/delete/:idComment`
- [ ] Controller: kiểm quyền owner + set `deleted=true`, `deletedAt=now`
- [ ] Trả JSON success
- [ ] View: modal confirm xóa
- [ ] JS: fetch delete, remove DOM ngay
- [ ] Không xóa comment của người khác

## Phase D - Đồng bộ UI/DOM sau create/edit/delete

- [ ] JS: bind lại like/dislike cho comment mới/đã edit (hoặc implement event delegation)

## Phase E - Admin module (nếu có sẵn)

- [ ] Rà soát routes/controllers/views admin cho comment
- [ ] Bổ sung/chuẩn hoá: xem + xoá vi phạm + tìm kiếm/lọc không reload
