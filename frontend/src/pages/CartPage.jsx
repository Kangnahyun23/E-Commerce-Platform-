import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';

export default function CartPage() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cart');
      const parsed = raw ? JSON.parse(raw) : [];
      setCart(Array.isArray(parsed) ? parsed : []);
    } catch {
      setCart([]);
    }
  }, []);

  const syncCart = (next) => {
    setCart(next);
    localStorage.setItem('cart', JSON.stringify(next));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const changeQty = (id, delta) => {
    const next = cart
      .map((item) => (item.id === id ? { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) } : item))
      .filter(Boolean);
    syncCart(next);
  };

  const removeItem = (id) => {
    const next = cart.filter((item) => item.id !== id);
    syncCart(next);
  };

  const total = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const price = Number(item.salePrice ?? item.price ?? 0);
        return sum + price * (Number(item.quantity) || 1);
      }, 0),
    [cart]
  );

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-310 mx-auto">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#7f786f] mb-5">
          <Link to="/" className="hover:text-primary">Trang chủ</Link>
          <span>/</span>
          <span className="text-primary">Giỏ hàng</span>
        </div>
        <h1 className="font-serif text-3xl md:text-5xl mb-8">Giỏ hàng</h1>

        {!cart.length ? (
          <div className="glass-strong rounded-3xl p-8 text-center">
            <p className="text-text-muted mb-4">Giỏ hàng của bạn đang trống.</p>
            <Link to="/products" className="inline-flex px-6 py-3 rounded-full bg-primary text-white text-xs uppercase tracking-[0.16em]">
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-4">
              {cart.map((item) => {
                const image = Array.isArray(item.images) ? item.images[0] : item.images;
                const price = Number(item.salePrice ?? item.price ?? 0);
                const qty = Number(item.quantity) || 1;
                return (
                  <div key={item.id} className="glass rounded-2xl p-4 flex gap-4">
                    <img
                      src={image || 'https://placehold.co/300x220?text=Kinh+Tot'}
                      alt={item.name}
                      className="w-24 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-accent mt-1">{new Intl.NumberFormat('vi-VN').format(price)} đ</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-full border border-black/15 bg-white/70">
                          <button type="button" className="w-8 h-8 inline-flex items-center justify-center" onClick={() => changeQty(item.id, -1)}>
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm">{qty}</span>
                          <button type="button" className="w-8 h-8 inline-flex items-center justify-center" onClick={() => changeQty(item.id, 1)}>
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="glass-strong rounded-2xl p-5 h-fit sticky top-24">
              <p className="text-xs uppercase tracking-[0.16em] text-[#7f786f]">Tạm tính</p>
              <p className="font-serif text-3xl mt-2">{new Intl.NumberFormat('vi-VN').format(total)} đ</p>
              <Link
                to="/checkout"
                className="mt-5 block w-full h-11 rounded-full bg-primary text-white text-xs uppercase tracking-[0.16em] hover:bg-primary-soft transition-colors text-center leading-[2.75rem]"
              >
                Tiến hành thanh toán
              </Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
