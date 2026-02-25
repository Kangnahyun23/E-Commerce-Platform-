import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function formatDate(value) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString('vi-VN');
}

function currency(value) {
  const amount = Number(value || 0);
  return `${new Intl.NumberFormat('vi-VN').format(amount)} đ`;
}

function PageShell({ title, subtitle, children }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-10">
        <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Xin chào {user?.fullName || 'bạn'}</p>
        <h1 className="font-serif text-3xl md:text-5xl text-primary mt-2">{title}</h1>
        <p className="text-text-muted mt-3">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-text-muted">{label}</p>
      <p className="font-serif text-3xl mt-2 text-primary">{value}</p>
    </div>
  );
}

function EmptyState({ text }) {
  return <p className="text-text-muted text-sm">{text}</p>;
}

function MessageBox({ type = 'info', text }) {
  if (!text) return null;
  const style = type === 'error'
    ? 'text-red-700 bg-red-50 border-red-200'
    : type === 'success'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : 'text-primary bg-white/70 border-black/10';

  return <p className={`text-sm border rounded-xl px-3 py-2 ${style}`}>{text}</p>;
}

function SectionCard({ title, children, action }) {
  return (
    <div className="glass-strong rounded-3xl p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="font-serif text-2xl text-primary">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function DataTable({ columns, rows }) {
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-190 text-sm">
        <thead>
          <tr className="text-left border-b border-black/10 text-text-muted uppercase tracking-[0.08em] text-xs">
            {columns.map((column) => (
              <th key={column} className="py-3 pr-3">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>
  );
}

export function BuyerDashboardPage() {
  return (
    <PageShell title="Trang Buyer" subtitle="Theo dõi đơn hàng, hồ sơ cá nhân và đánh giá sản phẩm.">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/account/orders" className="glass rounded-2xl p-5 hover:bg-white/80 transition-colors">
          <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Buyer</p>
          <p className="font-serif text-2xl mt-2 text-primary">Đơn hàng của tôi</p>
        </Link>
        <Link to="/account/reviews" className="glass rounded-2xl p-5 hover:bg-white/80 transition-colors">
          <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Buyer</p>
          <p className="font-serif text-2xl mt-2 text-primary">Đánh giá của tôi</p>
        </Link>
        <Link to="/account/profile" className="glass rounded-2xl p-5 hover:bg-white/80 transition-colors">
          <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Buyer</p>
          <p className="font-serif text-2xl mt-2 text-primary">Hồ sơ tài khoản</p>
        </Link>
      </div>
    </PageShell>
  );
}

export function BuyerOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/orders');
        setOrders(response.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải đơn hàng.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((item) => item.status === 'PENDING').length;

  return (
    <PageShell title="Đơn hàng của Buyer" subtitle="Theo dõi trạng thái và tổng giá trị đơn hàng của bạn.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <StatCard label="Tổng đơn" value={totalOrders} />
        <StatCard label="Đang chờ" value={pendingOrders} />
      </div>

      <SectionCard title="Danh sách đơn hàng">
        {loading ? <EmptyState text="Đang tải dữ liệu..." /> : null}
        {error ? <MessageBox type="error" text={error} /> : null}
        {!loading && !error && orders.length === 0 ? <EmptyState text="Bạn chưa có đơn hàng nào." /> : null}
        {!loading && !error && orders.length > 0 ? (
          <DataTable
            columns={['Mã đơn', 'Ngày tạo', 'Trạng thái', 'Tổng tiền', 'Chi tiết']}
            rows={orders.map((order) => (
              <tr key={order.id} className="border-b border-black/5">
                <td className="py-3 pr-3">{order.id.slice(0, 10)}...</td>
                <td className="py-3 pr-3">{formatDate(order.createdAt)}</td>
                <td className="py-3 pr-3">{order.status}</td>
                <td className="py-3 pr-3">{currency(order.totalAmount)}</td>
                <td className="py-3 pr-3">{order.details?.length || 0} sản phẩm</td>
              </tr>
            ))}
          />
        ) : null}
      </SectionCard>
    </PageShell>
  );
}

export function BuyerReviewsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/reviews', { params: { userId: user.id, limit: 100 } });
        setReviews(response.data?.data?.items || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải đánh giá.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  return (
    <PageShell title="Đánh giá của Buyer" subtitle="Tổng hợp các review bạn đã gửi.">
      <SectionCard title="Danh sách đánh giá">
        {loading ? <EmptyState text="Đang tải dữ liệu..." /> : null}
        {error ? <MessageBox type="error" text={error} /> : null}
        {!loading && !error && reviews.length === 0 ? <EmptyState text="Bạn chưa gửi đánh giá nào." /> : null}
        {!loading && !error && reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-black/10 bg-white/60 p-4">
                <p className="font-medium text-primary">{review.product?.name || 'Sản phẩm'}</p>
                <p className="text-sm text-text-muted mt-1">Rating: {review.rating}/5</p>
                <p className="text-sm mt-2">{review.comment || 'Không có nhận xét'}</p>
                <p className="text-xs text-text-muted mt-2">{formatDate(review.createdAt)}</p>
              </div>
            ))}
          </div>
        ) : null}
      </SectionCard>
    </PageShell>
  );
}

export function BuyerProfilePage() {
  const { user } = useAuth();

  return (
    <PageShell title="Hồ sơ Buyer" subtitle="Thông tin phiên đăng nhập hiện tại của bạn.">
      <SectionCard title="Thông tin tài khoản">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl border border-black/10 bg-white/60 p-4"><p className="text-text-muted">Họ tên</p><p className="mt-1">{user?.fullName || '--'}</p></div>
          <div className="rounded-xl border border-black/10 bg-white/60 p-4"><p className="text-text-muted">Email</p><p className="mt-1">{user?.email || '--'}</p></div>
          <div className="rounded-xl border border-black/10 bg-white/60 p-4"><p className="text-text-muted">Số điện thoại</p><p className="mt-1">{user?.phone || '--'}</p></div>
          <div className="rounded-xl border border-black/10 bg-white/60 p-4"><p className="text-text-muted">Role</p><p className="mt-1">{user?.role || '--'}</p></div>
        </div>
      </SectionCard>
    </PageShell>
  );
}

export function SellerDashboardPage() {
  return (
    <PageShell title="Seller Dashboard" subtitle="Quản lý sản phẩm, đơn hàng và trạng thái KYC của người bán.">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/seller/products" className="glass rounded-2xl p-5 hover:bg-white/80 transition-colors"><p className="text-xs uppercase tracking-[0.16em] text-text-muted">Seller</p><p className="font-serif text-2xl mt-2 text-primary">Sản phẩm của tôi</p></Link>
        <Link to="/seller/orders" className="glass rounded-2xl p-5 hover:bg-white/80 transition-colors"><p className="text-xs uppercase tracking-[0.16em] text-text-muted">Seller</p><p className="font-serif text-2xl mt-2 text-primary">Quản lý đơn hàng</p></Link>
        <Link to="/seller/kyc" className="glass rounded-2xl p-5 hover:bg-white/80 transition-colors"><p className="text-xs uppercase tracking-[0.16em] text-text-muted">Seller</p><p className="font-serif text-2xl mt-2 text-primary">KYC Seller</p></Link>
      </div>
    </PageShell>
  );
}

export function SellerProductsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState('');
  const [createError, setCreateError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    description: '',
    price: '',
    salePrice: '',
    stock: '0',
    condition: 'NEW',
  });

  const categoryOptions = useMemo(() => {
    const map = new Map();
    products.forEach((item) => {
      if (!item?.category?.id) return;
      map.set(item.category.id, item.category.name || item.category.id);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  useEffect(() => {
    if (categoryOptions.length === 0) return;
    setForm((prev) => {
      if (prev.categoryId) return prev;
      return { ...prev, categoryId: categoryOptions[0].id };
    });
  }, [categoryOptions]);

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/products', { params: { limit: 100 } });
      const allItems = response.data?.data?.items || [];
      setProducts(allItems.filter((item) => item.seller?.id === user?.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách sản phẩm.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    loadProducts();
  }, [user?.id]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa sản phẩm.');
    }
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    setCreating(true);
    setCreateError('');
    setCreateMessage('');

    try {
      if (!imageFile) {
        throw new Error('Vui lòng chọn ảnh sản phẩm trước khi tạo.');
      }
      if (!form.categoryId) {
        throw new Error('Thiếu categoryId. Hãy chọn hoặc nhập categoryId hợp lệ.');
      }

      const formData = new FormData();
      formData.append('image', imageFile);

      const uploadRes = await api.post('/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const imageUrl = uploadRes.data?.data?.url;
      if (!imageUrl) {
        throw new Error('Upload ảnh thất bại: không nhận được URL từ Cloudinary.');
      }

      await api.post('/products', {
        name: form.name,
        categoryId: form.categoryId,
        description: form.description || null,
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : null,
        stock: Number(form.stock || 0),
        condition: form.condition,
        images: [imageUrl],
      });

      setCreateMessage('Tạo sản phẩm thành công. Ảnh đã upload lên Cloudinary.');
      setImageFile(null);
      setForm((prev) => ({
        ...prev,
        name: '',
        description: '',
        price: '',
        salePrice: '',
        stock: '0',
        condition: 'NEW',
      }));
      await loadProducts();
    } catch (err) {
      setCreateError(err.response?.data?.message || err.message || 'Không thể tạo sản phẩm.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <PageShell title="Sản phẩm của Seller" subtitle="Danh sách sản phẩm hiện tại thuộc cửa hàng của bạn.">
      <div className="mb-4">
        <Link
          to="/seller"
          className="inline-flex items-center h-9 px-4 rounded-full border border-black/20 text-xs uppercase tracking-[0.12em] hover:bg-white/70 transition-colors"
        >
          Quay lại Seller Dashboard
        </Link>
      </div>

      <SectionCard title="Tạo sản phẩm mới (Cloudinary Upload)">
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Tên sản phẩm"
              className="h-11 rounded-xl border border-black/10 px-4 bg-white/70"
              required
            />
            {categoryOptions.length > 0 ? (
              <select
                value={form.categoryId}
                onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                className="h-11 rounded-xl border border-black/10 px-3 bg-white/70"
                required
              >
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            ) : (
              <input
                value={form.categoryId}
                onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                placeholder="Category ID"
                className="h-11 rounded-xl border border-black/10 px-4 bg-white/70"
                required
              />
            )}
          </div>

          <textarea
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Mô tả sản phẩm"
            className="w-full min-h-24 rounded-xl border border-black/10 px-4 py-3 bg-white/70"
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
              placeholder="Giá"
              className="h-11 rounded-xl border border-black/10 px-4 bg-white/70"
              required
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.salePrice}
              onChange={(event) => setForm((prev) => ({ ...prev, salePrice: event.target.value }))}
              placeholder="Giá khuyến mãi"
              className="h-11 rounded-xl border border-black/10 px-4 bg-white/70"
            />
            <input
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
              placeholder="Tồn kho"
              className="h-11 rounded-xl border border-black/10 px-4 bg-white/70"
              required
            />
            <select
              value={form.condition}
              onChange={(event) => setForm((prev) => ({ ...prev, condition: event.target.value }))}
              className="h-11 rounded-xl border border-black/10 px-3 bg-white/70"
            >
              <option value="NEW">NEW</option>
              <option value="LIKE_NEW">LIKE_NEW</option>
              <option value="USED">USED</option>
            </select>
          </div>

          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setImageFile(event.target.files?.[0] || null)}
              className="w-full h-11 rounded-xl border border-black/10 px-3 bg-white/70"
              required
            />
            <p className="text-xs text-text-muted mt-2">Ảnh sẽ được upload lên Cloudinary (free tier), sau đó lưu URL vào DB.</p>
          </div>

          {createError ? <MessageBox type="error" text={createError} /> : null}
          {createMessage ? <MessageBox type="success" text={createMessage} /> : null}

          <button
            type="submit"
            disabled={creating}
            className="h-11 px-5 rounded-xl bg-primary text-white text-xs uppercase tracking-[0.12em] disabled:opacity-60"
          >
            {creating ? 'Đang tạo...' : 'Tạo sản phẩm'}
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Danh sách sản phẩm" action={<button type="button" onClick={loadProducts} className="h-9 px-4 rounded-full border border-black/20 text-xs uppercase tracking-[0.12em]">Refresh</button>}>
        {loading ? <EmptyState text="Đang tải dữ liệu..." /> : null}
        {error ? <MessageBox type="error" text={error} /> : null}
        {!loading && !error && products.length === 0 ? <EmptyState text="Bạn chưa có sản phẩm nào đang active." /> : null}
        {!loading && !error && products.length > 0 ? (
          <DataTable
            columns={['Tên', 'Giá', 'Kho', 'Danh mục', 'Thao tác']}
            rows={products.map((product) => (
              <tr key={product.id} className="border-b border-black/5">
                <td className="py-3 pr-3">{product.name}</td>
                <td className="py-3 pr-3">{currency(product.salePrice ?? product.price)}</td>
                <td className="py-3 pr-3">{product.stock}</td>
                <td className="py-3 pr-3">{product.category?.name || '--'}</td>
                <td className="py-3 pr-3">
                  <button type="button" onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-700 text-xs uppercase tracking-widest">Xóa</button>
                </td>
              </tr>
            ))}
          />
        ) : null}
      </SectionCard>
    </PageShell>
  );
}

function ManageOrdersPage({ title, subtitle, backPath, backLabel }) {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [listError, setListError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, limit: 10 });
  const [orderId, setOrderId] = useState('');
  const [status, setStatus] = useState('CONFIRMED');
  const [statusFilter, setStatusFilter] = useState('');
  const [order, setOrder] = useState(null);

  const loadOrders = async (nextPage = page, nextOrderId = '') => {
    setLoading(true);
    setListError('');
    try {
      const response = await api.get('/orders/manage', {
        params: {
          limit: meta.limit,
          page: nextPage,
          status: statusFilter || undefined,
          orderId: nextOrderId || undefined,
          search: search || undefined,
        },
      });
      const payload = response.data?.data || {};
      setOrders(payload.items || []);
      setMeta({
        total: payload.total || 0,
        totalPages: payload.totalPages || 1,
        limit: payload.limit || meta.limit,
      });
      setPage(payload.page || nextPage);
    } catch (err) {
      setListError(err.response?.data?.message || 'Không thể tải danh sách đơn hàng.');
      setOrders([]);
      setMeta((prev) => ({ ...prev, total: 0, totalPages: 1 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    loadOrders(1);
  }, [statusFilter]);

  const lookupOrder = async () => {
    if (!orderId) {
      setListError('Vui lòng nhập Order ID để tra cứu.');
      return;
    }
    setListError('');
    setOrder(null);
    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data?.data || null);
      setStatus(response.data?.data?.status || 'CONFIRMED');
      await loadOrders(1, orderId);
    } catch (err) {
      setListError(err.response?.data?.message || 'Không thể tải đơn hàng theo ID.');
    }
  };

  const updateStatus = async () => {
    if (!order?.id) return;
    try {
      await api.patch(`/orders/${order.id}/status`, { status });
      await lookupOrder();
      setListError('Cập nhật trạng thái thành công.');
      await loadOrders(page);
    } catch (err) {
      setListError(err.response?.data?.message || 'Không thể cập nhật trạng thái.');
    }
  };

  const viewOrderDetail = async (selectedOrder) => {
    setOrderId(selectedOrder.id);
    setListError('');
    try {
      const response = await api.get(`/orders/${selectedOrder.id}`);
      const detail = response.data?.data || selectedOrder;
      setOrder(detail);
      setStatus(detail.status || 'CONFIRMED');
    } catch (err) {
      setOrder(selectedOrder);
      setStatus(selectedOrder.status || 'CONFIRMED');
      setListError(err.response?.data?.message || 'Không thể tải chi tiết order.');
    }
  };

  const applySearch = () => {
    setPage(1);
    loadOrders(1);
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setOrderId('');
    setOrder(null);
    setPage(1);
    setListError('');
    setTimeout(() => loadOrders(1), 0);
  };

  return (
    <PageShell title={title} subtitle={subtitle}>
      {backPath ? (
        <div className="mb-4">
          <Link
            to={backPath}
            className="inline-flex items-center h-9 px-4 rounded-full border border-black/20 text-xs uppercase tracking-[0.12em] hover:bg-white/70 transition-colors"
          >
            {backLabel || 'Quay lại'}
          </Link>
        </div>
      ) : null}

      <SectionCard
        title="Danh sách đơn hàng"
        action={<button type="button" onClick={() => loadOrders(page)} className="h-9 px-4 rounded-full border border-black/20 text-xs uppercase tracking-[0.12em]">Refresh</button>}
      >
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto_auto_auto] gap-3 mb-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo order ID / buyer / email / phone"
            className="h-10 rounded-xl border border-black/10 px-3 bg-white/70"
          />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-xl border border-black/10 px-3 bg-white/70">
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="SHIPPING">SHIPPING</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          <button type="button" onClick={applySearch} className="h-10 px-4 rounded-xl bg-primary text-white text-xs uppercase tracking-[0.12em]">Tìm</button>
          <button type="button" onClick={resetFilters} className="h-10 px-4 rounded-xl border border-black/20 text-xs uppercase tracking-[0.12em]">Reset</button>
        </div>
        {loading ? <EmptyState text="Đang tải dữ liệu..." /> : null}
        {listError ? <MessageBox type={listError.includes('thành công') ? 'success' : 'error'} text={listError} /> : null}
        {!loading && !listError && orders.length === 0 ? <EmptyState text="Không có đơn hàng phù hợp điều kiện lọc." /> : null}
        {!loading && orders.length > 0 ? (
          <DataTable
            columns={['Mã đơn', 'Buyer', 'Ngày tạo', 'Trạng thái', 'Tổng tiền', 'Thao tác']}
            rows={orders.map((item) => (
              <tr key={item.id} className="border-b border-black/5">
                <td className="py-3 pr-3">{item.id.slice(0, 10)}...</td>
                <td className="py-3 pr-3">{item.buyer?.fullName || '--'}</td>
                <td className="py-3 pr-3">{formatDate(item.createdAt)}</td>
                <td className="py-3 pr-3">{item.status}</td>
                <td className="py-3 pr-3">{currency(item.totalAmount)}</td>
                <td className="py-3 pr-3">
                  <button type="button" onClick={() => viewOrderDetail(item)} className="text-xs uppercase tracking-[0.12em] text-primary hover:text-accent">
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
          />
        ) : null}
        {!loading && meta.totalPages > 1 ? (
          <div className="flex items-center justify-between mt-4 gap-3">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">
              Trang {page}/{meta.totalPages} • Tổng {meta.total} đơn
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => loadOrders(page - 1)}
                className="h-9 px-3 rounded-full border border-black/20 text-xs uppercase tracking-[0.12em] disabled:opacity-40"
              >
                Trước
              </button>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => loadOrders(page + 1)}
                className="h-9 px-3 rounded-full border border-black/20 text-xs uppercase tracking-[0.12em] disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        ) : null}
      </SectionCard>

      <SectionCard title="Tra cứu theo Order ID">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
          <input value={orderId} onChange={(event) => setOrderId(event.target.value)} placeholder="Nhập Order ID" className="h-11 rounded-xl border border-black/10 px-4 bg-white/70" />
          <button type="button" onClick={lookupOrder} className="h-11 px-5 rounded-xl bg-primary text-white text-xs uppercase tracking-[0.14em]">Tra cứu</button>
        </div>
        {order ? (
          <div className="mt-4 rounded-xl border border-black/10 bg-white/60 p-4 space-y-3">
            <p><span className="text-text-muted">Mã đơn:</span> {order.id}</p>
            <p><span className="text-text-muted">Buyer:</span> {order.buyer?.fullName || '--'} ({order.buyer?.email || '--'})</p>
            <p><span className="text-text-muted">Trạng thái hiện tại:</span> {order.status}</p>
            <p><span className="text-text-muted">Địa chỉ:</span> {order.shippingAddress || '--'}</p>
            <p><span className="text-text-muted">Số điện thoại:</span> {order.phone || '--'}</p>
            <p><span className="text-text-muted">Tổng tiền:</span> {currency(order.totalAmount)}</p>
            {order.details?.length ? (
              <div className="rounded-xl border border-black/10 bg-white/70 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-text-muted mb-2">Sản phẩm trong đơn</p>
                <div className="space-y-2">
                  {order.details.map((detail) => (
                    <div key={detail.id || `${detail.productId}-${detail.quantity}`} className="flex items-center justify-between gap-3 text-sm">
                      <p className="text-primary">{detail.product?.name || detail.productId}</p>
                      <p className="text-text-muted">x{detail.quantity} • {currency(detail.price)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-3">
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-xl border border-black/10 px-3 bg-white/70">
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="SHIPPING">SHIPPING</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
              <button type="button" onClick={updateStatus} className="h-10 px-4 rounded-xl border border-black/20 text-xs uppercase tracking-[0.12em]">Cập nhật trạng thái</button>
            </div>
          </div>
        ) : null}
      </SectionCard>
    </PageShell>
  );
}

export function SellerOrdersPage() {
  return (
    <ManageOrdersPage
      title="Đơn hàng Seller"
      subtitle="Xem danh sách đơn hàng thuộc sản phẩm của bạn, đồng thời tra cứu theo Order ID."
      backPath="/seller"
      backLabel="Quay lại Seller Dashboard"
    />
  );
}

export function SellerKycPage() {
  const [form, setForm] = useState({ shopName: '', description: '' });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const submitKyc = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const data = new FormData();
      data.append('shopName', form.shopName);
      data.append('description', form.description);
      if (file) data.append('kycDocument', file);
      const response = await api.post('/auth/kyc', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(response.data?.message || 'Gửi KYC thành công.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Không thể gửi KYC.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell title="KYC Seller" subtitle="Gửi hồ sơ xác minh và theo dõi trạng thái duyệt.">
      <div className="mb-4">
        <Link
          to="/seller"
          className="inline-flex items-center h-9 px-4 rounded-full border border-black/20 text-xs uppercase tracking-[0.12em] hover:bg-white/70 transition-colors"
        >
          Quay lại Seller Dashboard
        </Link>
      </div>

      <SectionCard title="Nộp hồ sơ KYC">
        <form onSubmit={submitKyc} className="space-y-4">
          <input value={form.shopName} onChange={(event) => setForm((prev) => ({ ...prev, shopName: event.target.value }))} placeholder="Tên cửa hàng" className="w-full h-11 rounded-xl border border-black/10 px-4 bg-white/70" required />
          <textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Mô tả cửa hàng" className="w-full min-h-28 rounded-xl border border-black/10 px-4 py-3 bg-white/70" />
          <input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} className="w-full h-11 rounded-xl border border-black/10 px-3 bg-white/70" />
          <button type="submit" disabled={saving} className="h-11 px-5 rounded-xl bg-primary text-white text-xs uppercase tracking-[0.14em] disabled:opacity-60">{saving ? 'Đang gửi...' : 'Gửi KYC'}</button>
        </form>
        <MessageBox type={message.includes('thành công') ? 'success' : 'info'} text={message} />
      </SectionCard>
    </PageShell>
  );
}

export function StaffDashboardPage() {
  return (
    <PageShell title="Staff Dashboard" subtitle="Vận hành hệ thống: khách hàng, seller, sản phẩm, feedback và đơn hàng.">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/staff/customers" className="glass rounded-2xl p-5 hover:bg-white/80 transition-colors"><p className="text-xs uppercase tracking-[0.16em] text-text-muted">Staff</p><p className="font-serif text-2xl mt-2 text-primary">Manage Customer</p></Link>
        <Link to="/staff/sellers" className="glass rounded-2xl p-5 hover:bg-white/80 transition-colors"><p className="text-xs uppercase tracking-[0.16em] text-text-muted">Staff</p><p className="font-serif text-2xl mt-2 text-primary">Manage Seller</p></Link>
        <Link to="/staff/products" className="glass rounded-2xl p-5 hover:bg-white/80 transition-colors"><p className="text-xs uppercase tracking-[0.16em] text-text-muted">Staff</p><p className="font-serif text-2xl mt-2 text-primary">Manage Products</p></Link>
        <Link to="/staff/reviews" className="glass rounded-2xl p-5 hover:bg-white/80 transition-colors"><p className="text-xs uppercase tracking-[0.16em] text-text-muted">Staff</p><p className="font-serif text-2xl mt-2 text-primary">Manage Feedback</p></Link>
        <Link to="/staff/orders" className="glass rounded-2xl p-5 hover:bg-white/80 transition-colors"><p className="text-xs uppercase tracking-[0.16em] text-text-muted">Staff</p><p className="font-serif text-2xl mt-2 text-primary">Manage Orders</p></Link>
      </div>
    </PageShell>
  );
}

function UsersListPage({ title, subtitle, roleFilter }) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/users', { params: { role: roleFilter, limit: 100 } });
      setUsers(response.data?.data?.items || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  return (
    <PageShell title={title} subtitle={subtitle}>
      <SectionCard title="Danh sách người dùng" action={<button type="button" onClick={loadUsers} className="h-9 px-4 rounded-full border border-black/20 text-xs uppercase tracking-[0.12em]">Refresh</button>}>
        {loading ? <EmptyState text="Đang tải dữ liệu..." /> : null}
        {error ? <MessageBox type="error" text={error} /> : null}
        {!loading && !error && users.length === 0 ? <EmptyState text="Không có dữ liệu người dùng." /> : null}
        {!loading && !error && users.length > 0 ? (
          <DataTable
            columns={['Họ tên', 'Email', 'SĐT', 'Role', 'KYC']}
            rows={users.map((item) => (
              <tr key={item.id} className="border-b border-black/5">
                <td className="py-3 pr-3">{item.fullName}</td>
                <td className="py-3 pr-3">{item.email}</td>
                <td className="py-3 pr-3">{item.phone || '--'}</td>
                <td className="py-3 pr-3">{item.role}</td>
                <td className="py-3 pr-3">{item.sellerProfile?.kycStatus || '--'}</td>
              </tr>
            ))}
          />
        ) : null}
      </SectionCard>
    </PageShell>
  );
}

export function StaffCustomersPage() {
  return <UsersListPage title="Manage Customer" subtitle="Theo dõi danh sách khách hàng BUYER." roleFilter="BUYER" />;
}

export function StaffSellersPage() {
  return <UsersListPage title="Manage Seller" subtitle="Theo dõi danh sách SELLER và trạng thái KYC." roleFilter="SELLER" />;
}

export function StaffProductsPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/products', { params: { limit: 100 } });
      setProducts(response.data?.data?.items || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách sản phẩm.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa sản phẩm.');
    }
  };

  return (
    <PageShell title="Manage Products" subtitle="Quản lý toàn bộ sản phẩm active trên hệ thống.">
      <SectionCard title="Danh sách sản phẩm" action={<button type="button" onClick={loadProducts} className="h-9 px-4 rounded-full border border-black/20 text-xs uppercase tracking-[0.12em]">Refresh</button>}>
        {loading ? <EmptyState text="Đang tải dữ liệu..." /> : null}
        {error ? <MessageBox type="error" text={error} /> : null}
        {!loading && !error && products.length === 0 ? <EmptyState text="Không có sản phẩm." /> : null}
        {!loading && !error && products.length > 0 ? (
          <DataTable
            columns={['Tên', 'Seller', 'Giá', 'Kho', 'Thao tác']}
            rows={products.map((item) => (
              <tr key={item.id} className="border-b border-black/5">
                <td className="py-3 pr-3">{item.name}</td>
                <td className="py-3 pr-3">{item.seller?.fullName || '--'}</td>
                <td className="py-3 pr-3">{currency(item.salePrice ?? item.price)}</td>
                <td className="py-3 pr-3">{item.stock}</td>
                <td className="py-3 pr-3"><button type="button" onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-700 text-xs uppercase tracking-widest">Xóa</button></td>
              </tr>
            ))}
          />
        ) : null}
      </SectionCard>
    </PageShell>
  );
}

export function StaffReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');

  const loadReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/reviews', { params: { limit: 100 } });
      setReviews(response.data?.data?.items || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách đánh giá.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/reviews/${id}`);
      await loadReviews();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa đánh giá.');
    }
  };

  return (
    <PageShell title="Manage Feedback" subtitle="Quản lý review và phản hồi từ khách hàng.">
      <SectionCard title="Danh sách đánh giá" action={<button type="button" onClick={loadReviews} className="h-9 px-4 rounded-full border border-black/20 text-xs uppercase tracking-[0.12em]">Refresh</button>}>
        {loading ? <EmptyState text="Đang tải dữ liệu..." /> : null}
        {error ? <MessageBox type="error" text={error} /> : null}
        {!loading && !error && reviews.length === 0 ? <EmptyState text="Không có review." /> : null}
        {!loading && !error && reviews.length > 0 ? (
          <DataTable
            columns={['User', 'Product', 'Rating', 'Comment', 'Thao tác']}
            rows={reviews.map((item) => (
              <tr key={item.id} className="border-b border-black/5">
                <td className="py-3 pr-3">{item.user?.fullName || '--'}</td>
                <td className="py-3 pr-3">{item.product?.name || '--'}</td>
                <td className="py-3 pr-3">{item.rating}/5</td>
                <td className="py-3 pr-3">{item.comment || '--'}</td>
                <td className="py-3 pr-3"><button type="button" onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-700 text-xs uppercase tracking-widest">Xóa</button></td>
              </tr>
            ))}
          />
        ) : null}
      </SectionCard>
    </PageShell>
  );
}

export function StaffOrdersPage() {
  return (
    <ManageOrdersPage
      title="Manage Orders"
      subtitle="Xem đầy đủ danh sách order toàn hệ thống, lọc trạng thái và tra cứu theo ID."
      backPath="/staff"
      backLabel="Quay lại Staff Dashboard"
    />
  );
}

export function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [u, p, r] = await Promise.all([
          api.get('/admin/users', { params: { limit: 100 } }),
          api.get('/products', { params: { limit: 100 } }),
          api.get('/reviews', { params: { limit: 100 } }),
        ]);
        setUsers(u.data?.data?.items || []);
        setProducts(p.data?.data?.items || []);
        setReviews(r.data?.data?.items || []);
      } catch {
        setUsers([]);
        setProducts([]);
        setReviews([]);
      }
    };
    load();
  }, []);

  const pendingKyc = useMemo(() => users.filter((item) => item.sellerProfile?.kycStatus === 'PENDING').length, [users]);

  return (
    <PageShell title="Admin Dashboard" subtitle="Bảng tổng quan số liệu chính của hệ thống.">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Users" value={users.length} />
        <StatCard label="Products" value={products.length} />
        <StatCard label="Reviews" value={reviews.length} />
        <StatCard label="KYC Pending" value={pendingKyc} />
      </div>
    </PageShell>
  );
}

export function AdminKycPage() {
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState([]);
  const [message, setMessage] = useState('');

  const loadSellers = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await api.get('/admin/users', { params: { role: 'SELLER', limit: 100 } });
      setSellers(response.data?.data?.items || []);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Không thể tải danh sách seller.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellers();
  }, []);

  const updateKyc = async (userId, currentProfile, nextStatus) => {
    setMessage('');
    try {
      await api.patch(`/admin/users/${userId}`, {
        sellerProfile: {
          shopName: currentProfile?.shopName || 'Cửa hàng',
          description: currentProfile?.description || '',
          kycDocument: currentProfile?.kycDocument || null,
          kycStatus: nextStatus,
        },
      });
      setMessage(`Cập nhật KYC thành công: ${nextStatus}`);
      await loadSellers();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Không thể cập nhật KYC.');
    }
  };

  return (
    <PageShell title="Duyệt KYC" subtitle="Phê duyệt hoặc từ chối hồ sơ KYC của seller.">
      <SectionCard title="Seller cần duyệt" action={<button type="button" onClick={loadSellers} className="h-9 px-4 rounded-full border border-black/20 text-xs uppercase tracking-[0.12em]">Refresh</button>}>
        {loading ? <EmptyState text="Đang tải dữ liệu..." /> : null}
        {!loading && sellers.length === 0 ? <EmptyState text="Không có seller nào." /> : null}
        {message ? <MessageBox type={message.includes('thành công') ? 'success' : 'error'} text={message} /> : null}
        {!loading && sellers.length > 0 ? (
          <DataTable
            columns={['Seller', 'Email', 'Shop', 'KYC', 'Thao tác']}
            rows={sellers.map((item) => (
              <tr key={item.id} className="border-b border-black/5">
                <td className="py-3 pr-3">{item.fullName}</td>
                <td className="py-3 pr-3">{item.email}</td>
                <td className="py-3 pr-3">{item.sellerProfile?.shopName || '--'}</td>
                <td className="py-3 pr-3">{item.sellerProfile?.kycStatus || 'PENDING'}</td>
                <td className="py-3 pr-3">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => updateKyc(item.id, item.sellerProfile, 'APPROVED')} className="h-8 px-3 rounded-full border border-emerald-300 text-emerald-700 text-xs">Approve</button>
                    <button type="button" onClick={() => updateKyc(item.id, item.sellerProfile, 'REJECTED')} className="h-8 px-3 rounded-full border border-red-300 text-red-700 text-xs">Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          />
        ) : null}
      </SectionCard>
    </PageShell>
  );
}

export function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await api.get('/admin/users', { params: { limit: 100 } });
      setUsers(response.data?.data?.items || []);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Không thể tải danh sách users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateRole = async (userId, nextRole) => {
    setMessage('');
    try {
      await api.patch(`/admin/users/${userId}`, { role: nextRole });
      setMessage('Cập nhật role thành công.');
      await loadUsers();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Không thể cập nhật role.');
    }
  };

  return (
    <PageShell title="User Management" subtitle="Quản lý tài khoản và phân quyền hệ thống.">
      <SectionCard title="Danh sách người dùng" action={<button type="button" onClick={loadUsers} className="h-9 px-4 rounded-full border border-black/20 text-xs uppercase tracking-[0.12em]">Refresh</button>}>
        {loading ? <EmptyState text="Đang tải dữ liệu..." /> : null}
        {message ? <MessageBox type={message.includes('thành công') ? 'success' : 'error'} text={message} /> : null}
        {!loading && users.length > 0 ? (
          <DataTable
            columns={['Họ tên', 'Email', 'Role', 'Đổi role']}
            rows={users.map((item) => (
              <tr key={item.id} className="border-b border-black/5">
                <td className="py-3 pr-3">{item.fullName}</td>
                <td className="py-3 pr-3">{item.email}</td>
                <td className="py-3 pr-3">{item.role}</td>
                <td className="py-3 pr-3">
                  <select
                    value={item.role}
                    onChange={(event) => updateRole(item.id, event.target.value)}
                    className="h-9 rounded-xl border border-black/10 px-3 bg-white/70"
                  >
                    <option value="BUYER">BUYER</option>
                    <option value="SELLER">SELLER</option>
                    <option value="STAFF">STAFF</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
              </tr>
            ))}
          />
        ) : null}
      </SectionCard>
    </PageShell>
  );
}

export function AdminReportsPage() {
  const [data, setData] = useState({ users: 0, products: 0, reviews: 0, pendingKyc: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, productsRes, reviewsRes] = await Promise.all([
          api.get('/admin/users', { params: { limit: 100 } }),
          api.get('/products', { params: { limit: 100 } }),
          api.get('/reviews', { params: { limit: 100 } }),
        ]);
        const users = usersRes.data?.data?.items || [];
        setData({
          users: users.length,
          products: productsRes.data?.data?.items?.length || 0,
          reviews: reviewsRes.data?.data?.items?.length || 0,
          pendingKyc: users.filter((item) => item.sellerProfile?.kycStatus === 'PENDING').length,
        });
      } catch {
        setData({ users: 0, products: 0, reviews: 0, pendingKyc: 0 });
      }
    };
    load();
  }, []);

  return (
    <PageShell title="Reports" subtitle="Báo cáo tổng hợp nhanh từ dữ liệu hệ thống hiện có.">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Users" value={data.users} />
        <StatCard label="Products" value={data.products} />
        <StatCard label="Reviews" value={data.reviews} />
        <StatCard label="KYC Pending" value={data.pendingKyc} />
      </div>
    </PageShell>
  );
}

export function AdminSystemPage() {
  return (
    <PageShell title="Manage System" subtitle="Tổng quan kỹ thuật và trạng thái module quản trị.">
      <SectionCard title="System notes">
        <div className="space-y-2 text-sm text-text-muted">
          <p>- Frontend đã có guard theo role và giữ phiên đăng nhập qua /auth/me.</p>
          <p>- Module Staff/Admin đã kết nối API users/products/reviews.</p>
          <p>- Quản lý order tổng hiện chưa có endpoint list-all từ backend, đang hỗ trợ tra cứu theo order ID.</p>
        </div>
      </SectionCard>
    </PageShell>
  );
}

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-xl mx-auto glass-strong rounded-3xl p-8">
        <p className="text-xs uppercase tracking-[0.16em] text-text-muted">403</p>
        <h1 className="font-serif text-4xl mt-2">Không có quyền truy cập</h1>
        <p className="text-text-muted mt-4">Bạn không có quyền truy cập vào trang này theo role hiện tại.</p>
        <Link to="/" className="inline-flex items-center justify-center mt-6 h-11 px-6 rounded-full bg-primary text-white text-xs uppercase tracking-[0.16em]">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
