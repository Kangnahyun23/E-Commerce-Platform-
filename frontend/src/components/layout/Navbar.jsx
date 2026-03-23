import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  User,
  Menu,
  X,
  MessageCircle,
  Scale,
  ChevronDown,
  Settings,
  LogOut,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import { getCompareIds } from '../../pages/ComparePage';
import { useAuth } from '../../context/AuthContext';
import { getRoleHomePath } from '../../utils/auth';

function getUserInitial(user) {
  const source = String(user?.fullName || user?.email || 'U').trim();
  return source ? source.charAt(0).toUpperCase() : 'U';
}

function AvatarBadge({ user, sizeClass = 'h-8 w-8', textClass = 'text-xs' }) {
  const avatarUrl = String(user?.avatar || '').trim();
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [avatarUrl]);

  const shouldShowImage = Boolean(avatarUrl) && !imageFailed;

  return (
    <span
      className={`inline-flex ${sizeClass} shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/80 overflow-hidden`}
      aria-hidden
    >
      {shouldShowImage ? (
        <img
          src={avatarUrl}
          alt={user?.fullName || 'Avatar'}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className={`font-semibold text-primary ${textClass}`}>{getUserInitial(user)}</span>
      )}
    </span>
  );
}

export default function Navbar({ onOpenAIChat }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, role, user, logout } = useAuth();
  const scrollY = useScrollPosition();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [compareCount, setCompareCount] = useState(() => getCompareIds().length);
  const profileMenuRef = useRef(null);

  const isScrolled = scrollY > 20;
  const accountPath = isAuthenticated ? (role === 'BUYER' ? '/account' : getRoleHomePath(role)) : '/login';
  const displayName = user?.fullName || user?.email || 'Tài khoản';

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    setMenuOpen(false);
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    setMenuOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen && !profileMenuOpen) return;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setProfileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen, profileMenuOpen]);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const closeOnOutsideClick = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', closeOnOutsideClick);
    return () => window.removeEventListener('mousedown', closeOnOutsideClick);
  }, [profileMenuOpen]);

  useEffect(() => {
    const syncCartCount = () => {
      try {
        const raw = localStorage.getItem('cart');
        if (!raw) return setCartCount(0);
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const total = parsed.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
          setCartCount(total);
          return;
        }
      } catch {
        setCartCount(0);
      }
      return setCartCount(0);
    };
    syncCartCount();
    window.addEventListener('storage', syncCartCount);
    window.addEventListener('cart-updated', syncCartCount);
    return () => {
      window.removeEventListener('storage', syncCartCount);
      window.removeEventListener('cart-updated', syncCartCount);
    };
  }, []);

  useEffect(() => {
    const syncCompareCount = () => setCompareCount(getCompareIds().length);
    syncCompareCount();
    window.addEventListener('compare-updated', syncCompareCount);
    return () => window.removeEventListener('compare-updated', syncCompareCount);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass border-b border-black/5' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-360 mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="inline-flex items-center gap-2 font-serif text-xl md:text-2xl font-semibold tracking-[0.14em] text-primary">
            <svg width="24" height="14" viewBox="0 0 90 42" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <ellipse cx="23" cy="22" rx="15" ry="11" stroke="currentColor" strokeWidth="2" />
              <ellipse cx="67" cy="22" rx="15" ry="11" stroke="currentColor" strokeWidth="2" />
              <path d="M38 22L52 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            KÍNH TỐT
          </Link>

          <div className="hidden md:flex items-center gap-5">
            <Link to="/products" className="text-xs uppercase tracking-[0.22em] text-primary/80 hover:text-accent transition-colors shrink-0">
              Sản phẩm
            </Link>
            <Link to="/cart" className="relative p-2 text-primary/80 hover:text-accent transition-colors" aria-label="Giỏ hàng">
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartCount > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[10px] leading-4 text-white bg-primary text-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              ) : null}
            </Link>
            {compareCount >= 2 ? (
              <Link to="/compare" className="relative p-2 text-primary/80 hover:text-accent transition-colors" aria-label="So sánh sản phẩm">
                <Scale size={20} strokeWidth={1.5} />
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[10px] leading-4 text-white bg-primary text-center">
                  {compareCount}
                </span>
              </Link>
            ) : null}
            <button type="button" onClick={onOpenAIChat} className="p-2 text-primary/80 hover:text-accent transition-colors" aria-label="AI Stylist">
              <MessageCircle size={20} strokeWidth={1.5} />
            </button>

            {isAuthenticated ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  className="h-10 max-w-[260px] pl-1 pr-3 rounded-full border border-black/15 bg-white/65 hover:bg-white/80 transition-colors inline-flex items-center gap-2"
                  aria-label="Mở menu tài khoản"
                >
                  <AvatarBadge user={user} sizeClass="h-8 w-8" textClass="text-[11px]" />
                  <span className="text-xs font-medium text-primary truncate max-w-38">{displayName}</span>
                  <ChevronDown size={16} className={`text-primary/70 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileMenuOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 mt-2 w-52 glass-strong border border-black/10 rounded-2xl p-2 shadow-[0_18px_36px_rgba(0,0,0,0.12)]"
                    >
                      <Link
                        to={accountPath}
                        onClick={() => setProfileMenuOpen(false)}
                        className="h-10 px-3 rounded-xl hover:bg-white/70 transition-colors text-sm text-primary flex items-center gap-2"
                      >
                        <User size={16} />
                        Tài khoản
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setProfileMenuOpen(false)}
                        className="h-10 px-3 rounded-xl hover:bg-white/70 transition-colors text-sm text-primary flex items-center gap-2"
                      >
                        <Settings size={16} />
                        Cài đặt
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full h-10 px-3 rounded-xl hover:bg-white/70 transition-colors text-sm text-red-600 flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        Đăng xuất
                      </button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="h-10 px-4 rounded-full border border-black/20 text-xs uppercase tracking-[0.14em] hover:bg-white/70 transition-colors inline-flex items-center gap-2"
              >
                <User size={16} />
                Đăng nhập
              </Link>
            )}
          </div>

          <button
            type="button"
            className="md:hidden p-2 text-primary/90"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.24 }}
              className="md:hidden py-4 border-t border-black/10 glass rounded-2xl mb-4"
            >
              <div className="flex flex-col gap-4 px-4">
                {isAuthenticated ? (
                  <div className="rounded-2xl border border-black/10 bg-white/60 p-3 flex items-center gap-3">
                    <AvatarBadge user={user} sizeClass="h-10 w-10" />
                    <div className="min-w-0">
                      <p className="text-sm text-primary font-medium truncate">{displayName}</p>
                      <p className="text-xs text-text-muted truncate">{user?.email || ''}</p>
                    </div>
                  </div>
                ) : null}

                <Link to="/products" className="text-sm uppercase tracking-[0.18em] text-primary/85 hover:text-accent" onClick={() => setMenuOpen(false)}>
                  Sản phẩm
                </Link>
                <Link to="/cart" className="text-sm uppercase tracking-[0.18em] text-primary/85 hover:text-accent" onClick={() => setMenuOpen(false)}>
                  Giỏ hàng
                </Link>
                {compareCount >= 2 ? (
                  <Link to="/compare" className="text-sm uppercase tracking-[0.18em] text-primary/85 hover:text-accent" onClick={() => setMenuOpen(false)}>
                    So sánh ({compareCount})
                  </Link>
                ) : null}
                <button type="button" onClick={() => { setMenuOpen(false); onOpenAIChat?.(); }} className="text-left text-sm uppercase tracking-[0.18em] text-primary/85 hover:text-accent">
                  AI Stylist
                </button>

                {isAuthenticated ? (
                  <>
                    <Link to={accountPath} className="text-sm uppercase tracking-[0.18em] text-primary/85 hover:text-accent" onClick={() => setMenuOpen(false)}>
                      Tài khoản
                    </Link>
                    <Link to="/settings" className="text-sm uppercase tracking-[0.18em] text-primary/85 hover:text-accent" onClick={() => setMenuOpen(false)}>
                      Cài đặt
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="text-left text-sm uppercase tracking-[0.18em] text-red-600 hover:text-red-700"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="text-sm uppercase tracking-[0.18em] text-primary/85 hover:text-accent" onClick={() => setMenuOpen(false)}>
                    Đăng nhập
                  </Link>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </nav>
    </header>
  );
}
