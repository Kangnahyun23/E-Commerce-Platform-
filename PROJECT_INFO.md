# Thông tin dự án "Kính Tốt" – Handover Document

Tài liệu này ghi lại toàn bộ thông tin dự án để mang sang môi trường khác làm tiếp.

---

## 1. Tổng quan dự án

- **Tên:** Kính Tốt  
- **Mô tả:** Nền tảng E-commerce chuyên bán mắt kính (B2C + C2C: cửa hàng bán và cá nhân bán hàng cũ).  
- **Mô hình:** B2C (cửa hàng) và C2C (cá nhân bán đồ cũ).

---

## 2. Tech Stack

| Phần | Công nghệ | Ghi chú |
|------|-----------|---------|
| **Frontend** | React, Vite, TailwindCSS, Framer Motion, Lucide React, React Router, Axios | Triển khai mục tiêu: **Netlify** |
| **Backend** | Node.js, Express.js | Triển khai mục tiêu: **Render** |
| **Database** | PostgreSQL (Neon) | Prisma ORM, driver `@prisma/adapter-pg` + `pg` |

---

## 3. Cấu trúc thư mục

```
Kinhtot_swd392/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.js
│   │   ├── controllers/
│   │   │   ├── admin.controller.js
│   │   │   ├── ai.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── category.controller.js
│   │   │   ├── order.controller.js
│   │   │   ├── product.controller.js
│   │   │   └── review.controller.js
│   │   ├── services/
│   │   │   ├── admin.service.js
│   │   │   ├── ai.service.js
│   │   │   ├── auth.service.js
│   │   │   ├── order.service.js
│   │   │   ├── product.service.js
│   │   │   └── review.service.js
│   │   ├── routes/
│   │   │   ├── index.js
│   │   │   ├── admin.routes.js
│   │   │   ├── ai.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── order.routes.js
│   │   │   ├── product.routes.js
│   │   │   └── review.routes.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── role.middleware.js
│   │   │   ├── upload.middleware.js
│   │   │   └── error.middleware.js
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   ├── response.js
│   │   │   └── validators.js
│   │   └── app.js
│   ├── index.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Layout.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Footer.jsx
│   │   │   ├── ui/
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   └── SkeletonLoader.jsx
│   │   │   └── chat/
│   │   │       └── AIChatBox.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── ProductListPage.jsx
│   │   │   ├── ProductDetailPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── CartPage.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── hooks/
│   │   │   └── useScrollPosition.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── data/
│   │   │   └── mockProducts.js
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── style.css
│   └── package.json
└── PROJECT_INFO.md (file này)
```

---

## 4. Database – Prisma Schema (tóm tắt)

- **User:** id, email, password, fullName, phone, avatar, **role** (BUYER | SELLER | STAFF | ADMIN), createdAt  
- **SellerProfile:** userId (unique), shopName, description, kycDocument, kycStatus (PENDING | APPROVED | REJECTED), approvedAt  
- **Category:** id, name, slug, description, image  
- **Product:** sellerId, categoryId, name, slug, description, price, salePrice, images (Json), condition (NEW | LIKE_NEW | USED), **frameMaterial**, **frameShape**, **lensType**, gender, stock, isActive  
- **Order:** buyerId, totalAmount, status (PENDING | CONFIRMED | SHIPPING | DELIVERED | CANCELLED), shippingAddress, phone, note  
- **OrderDetail:** orderId, productId, quantity, price  
- **Review:** userId, productId, rating (1–5), comment  
- **ChatSession / ChatMessage:** AI Stylist chat (userId, role USER/AI, content, productSuggestions Json)

**Enums quan trọng:**  
FrameMaterial: METAL, ACETATE, TITANIUM, PLASTIC, WOOD  
FrameShape: ROUND, OVAL, SQUARE, RECTANGLE, CAT_EYE, AVIATOR  
LensType: SINGLE_VISION, BIFOCAL, PROGRESSIVE, SUNGLASSES, BLUE_LIGHT  

Schema đầy đủ nằm trong `backend/prisma/schema.prisma`.

---

## 5. Phân quyền theo role (Use Case)

| Role | Quyền chính |
|------|-------------|
| **BUYER** | Đặt hàng, xem/hủy đơn mình, gửi review, AI chat, đăng ký/KYC. |
| **SELLER** | CRUD sản phẩm (của mình), upload KYC, xem đơn có sản phẩm mình, cập nhật trạng thái đơn đó. |
| **STAFF** | **Manage Customer** (xem/cập nhật user BUYER), **Manage Seller** (xem/cập nhật user SELLER + SellerProfile), **Manage Products** (CRUD mọi sản phẩm), **Manage Feedback** (xem/xóa review). Xem mọi đơn, cập nhật trạng thái đơn. Không duyệt KYC. |
| **ADMIN** | Duyệt/từ chối KYC, Manage System, View reports; toàn quyền. |

---

## 6. Tài khoản mẫu (seed)

Seed tạo trong `backend/prisma/seed.js`. Chạy `npm run seed` trong thư mục `backend`.

| Vai trò | Email | Mật khẩu |
|--------|--------|----------|
| Customer (người mua) | buyer@kinhtot.vn | buyer123 |
| Seller (người bán) | seller@kinhtot.vn | seller123 |
| Staff | staff@kinhtot.vn | staff123 |
| Admin | admin@kinhtot.vn | admin123 |

Seller mẫu có SellerProfile và KYC **APPROVED**. Seed còn tạo 2 category (Kính râm, Gọng kính) và 3 sản phẩm mẫu.

---

## 7. API Backend (base path: `/api`)

| Nhóm | Method | Endpoint | Mô tả / Phân quyền |
|------|--------|----------|---------------------|
| **Auth** | POST | /auth/register | Đăng ký (public) |
| | POST | /auth/login | Đăng nhập, trả JWT |
| | GET | /auth/me | Thông tin user hiện tại (auth) |
| | POST | /auth/kyc | Upload KYC → PENDING (auth) |
| **Products** | GET | /products | Danh sách (filter: frameShape, frameMaterial, condition, categoryId, search, page, limit) |
| | GET | /products/:slug | Chi tiết sản phẩm |
| | POST | /products | Tạo sản phẩm (SELLER | ADMIN | STAFF); STAFF/ADMIN gửi body.sellerId |
| | PUT | /products/:id | Cập nhật (SELLER chỉ sp của mình; STAFF/ADMIN mọi sp) |
| | DELETE | /products/:id | Xóa/ẩn (tương tự PUT) |
| **Orders** | POST | /orders | Tạo đơn (auth, body: items, shippingAddress, phone, note) |
| | GET | /orders | Đơn của user (auth) |
| | GET | /orders/:id | Chi tiết (buyer: đơn mình; STAFF/ADMIN/SELLER: mọi đơn) |
| | PATCH | /orders/:id/status | Cập nhật trạng thái (BUYER chỉ cancel đơn mình; SELLER/STAFF/ADMIN: mọi trạng thái) |
| **Reviews** | GET | /reviews | List (query: productId, userId, page, limit) |
| | POST | /reviews | Tạo review (auth, BUYER; body: productId, rating, comment) |
| | DELETE | /reviews/:id | Xóa (author hoặc STAFF/ADMIN) |
| **Admin (users)** | GET | /admin/users | Danh sách user (STAFF, ADMIN; query: role, search, page, limit) |
| | GET | /admin/users/:id | Chi tiết user (STAFF, ADMIN) |
| | PATCH | /admin/users/:id | Cập nhật user/SellerProfile (STAFF, ADMIN; đổi role chỉ ADMIN) |
| **AI** | POST | /ai/chat | Chat AI Stylist (body: message); trả answer + suggestedProducts |

Response chuẩn: `{ status, message, data? }`. Lỗi: status 4xx/5xx, message mô tả.

---

## 8. Frontend – Routing

- `/` — HomePage  
- `/products` — ProductListPage (danh sách + filter/sort)  
- `/products/:slug` — ProductDetailPage  
- `/login` — LoginPage  
- `/register` — RegisterPage  
- `/cart` — CartPage  

Layout chung: Navbar + Footer; AIChatBox mở dạng popup/modal.

---

## 9. Biến môi trường

### Backend (`backend/.env`)

- **DATABASE_URL** (bắt buộc): Connection string PostgreSQL (Neon).  
  Dạng: `postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require`  
  Ví dụ Neon: lấy từ dashboard Neon, dùng pooler nếu có.
- **JWT_SECRET** (tùy chọn): Mặc định `kinhtot-secret-change-in-production`. Production nên đổi.
- **JWT_EXPIRES_IN** (tùy chọn): Mặc định `7d`.
- **PORT** (tùy chọn): Mặc định `5000`.
- **UPLOAD_DIR** (tùy chọn): Thư mục upload file, mặc định `uploads`.

### Frontend

- Dev: `vite.config.js` proxy `/api` → `http://localhost:5000`, không cần env.  
- Production: cần cấu hình baseURL API (ví dụ biến môi trường build) nếu backend khác origin.

---

## 10. Chạy dự án (local)

1. **Database:**  
   - Tạo DB PostgreSQL (Neon hoặc local).  
   - Tạo file `backend/.env` với `DATABASE_URL`.

2. **Backend:**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma db push
   npm run seed
   npm run dev
   ```
   Server chạy tại `http://localhost:5000`.

3. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   App chạy tại `http://localhost:5173`, gọi API qua proxy `/api` → backend.

---

## 11. Deploy (gợi ý)

- **Frontend (Netlify):** Build command `npm run build`, publish thư mục `dist`. Cấu hình redirect SPA (netlify.toml) nếu dùng React Router.  
- **Backend (Render):** Khởi chạy `node index.js` hoặc `npm start`. Khai báo env: `DATABASE_URL`, `JWT_SECRET`.  
- **Database:** Đang dùng Neon (PostgreSQL). Connection string lấy từ Neon dashboard; production dùng pooler và bật SSL.

---

## 12. Ghi chú khi làm tiếp

- **Prisma 7:** Backend dùng `@prisma/adapter-pg` + `pg`; file `backend/src/config/prisma.js` và `backend/prisma/seed.js` khởi tạo PrismaClient với adapter. Không dùng `datasource url` trong schema (url lấy từ env trong config).
- **Phân quyền:** Middleware `requireRole(...)` và logic trong từng service (order, product, review, admin) đã áp dụng đúng role STAFF/ADMIN/SELLER/BUYER theo bảng trên.
- **Frontend:** Dùng Tailwind 4 (@tailwindcss/vite), theme off-white + accent vàng; glassmorphism; Framer Motion; Lucide icons. Mock data trong `frontend/src/data/mockProducts.js` dùng khi API lỗi hoặc rỗng.
- **Kế hoạch chi tiết:** Các file plan trong `.cursor/plans/` (roles, frontend premium overhaul, v.v.) mô tả chi tiết tính năng và thay đổi đã làm.

---

*Tài liệu cập nhật theo trạng thái dự án tại thời điểm handover. Khi đổi DB, env hoặc thêm tính năng, nên cập nhật lại PROJECT_INFO.md.*
