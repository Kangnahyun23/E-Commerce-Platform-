import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Mật khẩu cần tối thiểu 6 ký tự.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
      };
      const res = await api.post('/auth/register', payload);
      const data = res.data?.data || {};
      if (data.token) localStorage.setItem('token', data.token);
      if (data.user) localStorage.setItem('currentUser', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4">
      <div className="max-w-md mx-auto glass-strong rounded-3xl p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.18em] text-[#7f786f] mb-2">Kính Tốt</p>
        <h1 className="font-serif text-3xl mb-6">Tạo tài khoản</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-[0.12em] text-[#7f786f] mb-2" htmlFor="fullName">
              Họ và tên
            </label>
            <input
              id="fullName"
              type="text"
              value={form.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className="w-full h-11 rounded-full px-4 border border-black/10 bg-white/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Nguyễn Văn A"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.12em] text-[#7f786f] mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full h-11 rounded-full px-4 border border-black/10 bg-white/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.12em] text-[#7f786f] mb-2" htmlFor="phone">
              Số điện thoại
            </label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full h-11 rounded-full px-4 border border-black/10 bg-white/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="09xxxxxxxx"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.12em] text-[#7f786f] mb-2" htmlFor="password">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="w-full h-11 rounded-full px-4 border border-black/10 bg-white/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.12em] text-[#7f786f] mb-2" htmlFor="confirmPassword">
              Xác nhận mật khẩu
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className="w-full h-11 rounded-full px-4 border border-black/10 bg-white/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="••••••••"
              required
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-full bg-primary text-white text-xs uppercase tracking-[0.16em] hover:bg-primary-soft transition-colors disabled:opacity-60"
          >
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>

        <p className="mt-5 text-sm text-text-muted">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
