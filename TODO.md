# TODO - Rà soát & hoàn thiện quên mật khẩu

## Phần 1: Rà soát luồng + refactor tối thiểu

- [ ] Kiểm tra route/middleware của quên mật khẩu: `/forgot-password`, `/otp`, `/reset-password`.
- [x] Đọc `routes/client/auth.route.ts`.
- [x] Đọc `controllers/client/auth.controller.ts`.
- [x] Đọc `models/user.model.ts`.
- [x] Đọc `models/forgot-password.model.ts`.
- [x] Đọc `helpers/sendMail.ts`.
- [x] Đọc `views/client/pages/auth/forgot-password.pug`, `otp-password.pug`, `reset-password.pug`.
- [x] Đọc `validations/clients/auth.validation.ts`.
- [x] Đọc `middlewares/clients/auth.middleware.ts`.
- [x] Refactor tối thiểu để tránh crash/logic thừa trong `postOtpPassword`.

## Phần 2: Giao diện quên mật khẩu

- [ ] Đồng bộ UI (dark theme + glassmorphism) cho `forgot-password`, `otp-password`, `reset-password`.

## Phần 3: CSS đồng bộ các module (Pagination/Search/Filter/Bulk Actions...)

- [ ] Kiểm tra CSS admin (Dashboard/Topics/Songs/Singers/Accounts) và đồng bộ style chung.
- [ ] Tránh tạo style mới hoàn toàn khác; không đổi màu/layout đã thống nhất.

## Xong

- [ ] Tổng hợp danh sách route/controller/optimization/files CSS/mixins đã chỉnh.
