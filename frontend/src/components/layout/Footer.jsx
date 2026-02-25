import { Link } from 'react-router-dom';

export default function Footer({ onOpenAIChat }) {
  return (
    <footer className="border-t border-black/10 py-12 px-4 bg-background-alt">
      <div className="max-w-360 mx-auto space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 font-serif text-lg font-semibold tracking-[0.12em] text-primary">
              <svg width="24" height="14" viewBox="0 0 90 42" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <ellipse cx="23" cy="22" rx="15" ry="11" stroke="currentColor" strokeWidth="2" />
                <ellipse cx="67" cy="22" rx="15" ry="11" stroke="currentColor" strokeWidth="2" />
                <path d="M38 22L52 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              KÍNH TỐT
            </div>
            <p className="text-sm text-[#6f6961] leading-relaxed">
              Nền tảng giao dịch kính mắt trực tuyến. Mua mới, mua cũ, tư vấn phong cách dành riêng cho bạn.
            </p>
            <div className="flex items-center gap-2">
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full glass inline-flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 2H17C19.7614 2 22 4.23858 22 7V17C22 19.7614 19.7614 22 17 22H7C4.23858 22 2 19.7614 2 17V7C2 4.23858 4.23858 2 7 2Z" stroke="currentColor" strokeWidth="1.5"/><path d="M16 11.37C16.1234 12.2022 15.9813 13.0524 15.5948 13.8005C15.2082 14.5485 14.5975 15.1575 13.8484 15.5419C13.0994 15.9264 12.2488 16.0663 11.4169 15.9405C10.585 15.8148 9.81313 15.4298 9.21034 14.8409C8.60755 14.252 8.20485 13.4893 8.05922 12.6606C7.91359 11.8318 8.03239 10.9781 8.39895 10.2209C8.7655 9.46379 9.36047 8.84061 10.1036 8.43968C10.8466 8.03875 11.6934 7.87865 12.53 7.98C13.383 8.08306 14.1722 8.45576 14.78 9.04C15.3878 9.62424 15.7916 10.3987 15.93 11.25" stroke="currentColor" strokeWidth="1.5"/><path d="M17.5 6.5H17.51" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </a>
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full glass inline-flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 3H13C11.9391 3 10.9217 3.42143 10.1716 4.17157C9.42143 4.92172 9 5.93913 9 7V9H7V12H9V21H13V12H16L17 9H13V7C13 6.73478 13.1054 6.48043 13.2929 6.29289C13.4804 6.10536 13.7348 6 14 6H17V3H15Z" stroke="currentColor" strokeWidth="1.5"/></svg>
              </a>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[#7f786f] mb-4">Danh mục</p>
            <div className="space-y-3 text-sm text-text-muted">
              <Link to="/" className="block hover:text-primary transition-colors">Trang chủ</Link>
              <Link to="/products" className="block hover:text-primary transition-colors">Tất cả sản phẩm</Link>
              <Link to="/products?categoryId=cat-sun" className="block hover:text-primary transition-colors">Kính râm</Link>
              <Link to="/products?categoryId=cat-frame" className="block hover:text-primary transition-colors">Gọng kính</Link>
              {onOpenAIChat ? (
                <button type="button" onClick={onOpenAIChat} className="block hover:text-primary transition-colors">
                  AI Stylist
                </button>
              ) : null}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[#7f786f] mb-4">Hỗ trợ</p>
            <div className="space-y-3 text-sm text-text-muted">
              <a href="#" className="block hover:text-primary transition-colors">Liên hệ</a>
              <a href="#" className="block hover:text-primary transition-colors">FAQ</a>
              <a href="#" className="block hover:text-primary transition-colors">Chính sách đổi trả</a>
              <a href="#" className="block hover:text-primary transition-colors">Điều khoản sử dụng</a>
              <a href="#" className="block hover:text-primary transition-colors">Chính sách bảo mật</a>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[#7f786f] mb-4">Newsletter</p>
            <p className="text-sm text-[#6f6961] mb-3">Nhận thông tin mẫu kính mới và ưu đãi hàng tuần.</p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Email của bạn"
                className="w-full h-11 rounded-full px-4 glass border border-white/60 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
              <button
                type="button"
                className="w-full h-11 rounded-full bg-primary text-white text-xs uppercase tracking-[0.16em] hover:bg-primary-soft transition-colors"
              >
                Đăng ký
              </button>
            </form>
          </div>
        </div>

        <div className="pt-6 border-t border-black/10 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <span className="text-xs text-[#8a847d]">© {new Date().getFullYear()} Kính Tốt. All rights reserved.</span>
          <div className="flex items-center gap-2">
            {['VISA', 'MOMO', 'ZALOPAY'].map((item) => (
              <span key={item} className="px-3 h-7 rounded-full glass inline-flex items-center text-[11px] tracking-[0.08em] text-primary/85">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
