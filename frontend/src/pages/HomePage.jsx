import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import ProductCard from '../components/ui/ProductCard';
import api from '../services/api';
import { mockCategories, mockProducts } from '../data/mockProducts';

export default function HomePage() {
  const heroRef = useRef(null);
  const featuredRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const imageY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  const [featured, setFeatured] = useState([]);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    api.get('/products?limit=8')
      .then((res) => {
        const data = res.data?.data?.items || [];
        if (!data.length) {
          setFeatured(mockProducts.slice(0, 6));
          setIsFallback(true);
          return;
        }
        setFeatured(data);
        setIsFallback(false);
      })
      .catch(() => {
        setFeatured(mockProducts.slice(0, 6));
        setIsFallback(true);
      });
  }, []);

  const scrollFeatured = (dir = 1) => {
    if (!featuredRef.current) return;
    featuredRef.current.scrollBy({ left: dir * 360, behavior: 'smooth' });
  };

  const openAI = () => {
    window.dispatchEvent(new CustomEvent('open-ai-chat'));
  };

  const ticker = 'KÍNH RÂM  •  GỌNG KÍNH  •  KÍNH CẬN  •  KÍNH THỜI TRANG  •  AI STYLIST  •  ';

  return (
    <div className="bg-background">
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden bg-background-alt pt-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_24%,rgba(201,169,110,0.2),transparent_44%)]" aria-hidden />
        <div className="absolute -top-20 right-[12%] w-56 h-56 rounded-full glass animate-float hidden lg:block" aria-hidden />
        <div className="absolute bottom-12 left-[8%] w-36 h-36 rounded-full glass animate-float hidden lg:block" aria-hidden />
        <motion.div style={{ y }} className="absolute inset-0 flex items-center">
          <div className="max-w-360 mx-auto w-full px-4 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <motion.div style={{ opacity }} className="lg:col-span-6 space-y-6">
              <p className="text-xs uppercase tracking-[0.24em] text-[#7f786f]">Premium Eyewear Marketplace</p>
              <h1 className="font-serif text-[54px] sm:text-7xl md:text-8xl lg:text-[128px] font-semibold text-primary tracking-tight leading-[0.88]">
                KÍNH
                <br />
                TỐT
              </h1>
              <div className="h-px w-24 bg-black/20" />
              <p className="max-w-xl text-[#6f6961] text-base md:text-lg">
                Nơi hội tụ các mẫu kính mới chính hãng và kính cũ tuyển chọn. Mua nhanh như Shopee, giao diện tối giản như Apple.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.2em] bg-primary text-white hover:bg-primary-soft transition-colors rounded-full"
                >
                  Khám phá bộ sưu tập
                </Link>
                <button
                  type="button"
                  onClick={openAI}
                  className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-[0.18em] rounded-full glass hover:bg-white/80 transition-colors"
                >
                  <Sparkles size={14} />
                  Hỏi AI Stylist
                </button>
              </div>
            </motion.div>
            <motion.div style={{ imageY }} className="lg:col-span-6 relative">
              <div className="aspect-4/5 md:aspect-5/4 rounded-4xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.15)]">
                <img
                  src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1600&q=80"
                  alt="Kính cao cấp"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 glass-strong rounded-2xl px-4 py-3 text-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-[#7f786f]">Đánh giá trung bình</p>
                <p className="font-serif text-2xl">4.9/5</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section className="overflow-hidden py-6 border-y border-black/5 bg-white/55">
        <motion.div
          className="whitespace-nowrap text-2xl md:text-4xl font-serif text-primary/35 tracking-[0.14em]"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
        >
          <span>{ticker.repeat(3)}</span>
        </motion.div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="font-serif text-3xl md:text-5xl font-semibold text-primary">
                Sản phẩm nổi bật
              </h2>
              <div className="w-16 h-0.5 bg-accent mt-3" />
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => scrollFeatured(-1)} className="w-10 h-10 rounded-full glass hover:bg-white/75 transition-colors">
                <ArrowLeft size={16} className="mx-auto" />
              </button>
              <button type="button" onClick={() => scrollFeatured(1)} className="w-10 h-10 rounded-full glass hover:bg-white/75 transition-colors">
                <ArrowRight size={16} className="mx-auto" />
              </button>
            </div>
          </div>
          {isFallback ? (
            <p className="text-xs uppercase tracking-[0.14em] text-[#7f786f] mb-4">Đang dùng dữ liệu demo</p>
          ) : null}
          <div ref={featuredRef} className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:-mx-6 md:px-6">
            <div className="flex gap-6 md:gap-8 pb-4 snap-x snap-mandatory min-w-0">
              {featured.map((item) => (
                <div
                  key={item.id}
                  className="shrink-0 w-70 sm:w-80 snap-start"
                >
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background-alt">
        <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-10">
          <h3 className="font-serif text-3xl md:text-5xl font-semibold text-primary mb-10">Danh mục</h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            <Link
              to={`/products?categoryId=${mockCategories[0].id}`}
              className="block md:col-span-7 aspect-5/4 md:aspect-16/11 overflow-hidden rounded-4xl group relative"
            >
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url('${mockCategories[0].image}')` }}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/10 to-transparent" />
              <div className="absolute left-6 right-6 bottom-6 flex items-end justify-between">
                <span className="font-serif text-2xl md:text-4xl font-semibold text-white">{mockCategories[0].name}</span>
                <span className="glass px-3 py-1 rounded-full text-xs uppercase tracking-[0.14em] text-primary">
                  {mockCategories[0].productCount} SP
                </span>
              </div>
            </Link>
            <Link
              to={`/products?categoryId=${mockCategories[1].id}`}
              className="block md:col-span-5 aspect-5/4 md:aspect-4/5 overflow-hidden rounded-4xl group md:translate-y-14 relative"
            >
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url('${mockCategories[1].image}')` }}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/10 to-transparent" />
              <div className="absolute left-6 right-6 bottom-6 flex items-end justify-between">
                <span className="font-serif text-2xl md:text-4xl font-semibold text-white">{mockCategories[1].name}</span>
                <span className="glass px-3 py-1 rounded-full text-xs uppercase tracking-[0.14em] text-primary">
                  {mockCategories[1].productCount} SP
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-310 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-[#7f786f]">Sản phẩm</p>
              <p className="font-serif text-4xl mt-2">10,000+</p>
            </div>
            <div className="glass rounded-2xl p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-[#7f786f]">Khách hàng</p>
              <p className="font-serif text-4xl mt-2">48,500+</p>
            </div>
            <div className="glass rounded-2xl p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-[#7f786f]">Đánh giá tích cực</p>
              <p className="font-serif text-4xl mt-2">97%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-310 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-strong rounded-4xl p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#7f786f] mb-2">AI Stylist</p>
              <h3 className="font-serif text-3xl md:text-4xl">Không biết chọn kính nào phù hợp?</h3>
              <p className="text-[#6f6961] mt-3">Đặt câu hỏi về khuôn mặt, phong cách và ngân sách để nhận gợi ý ngay.</p>
            </div>
            <button
              type="button"
              onClick={openAI}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-primary text-white text-xs uppercase tracking-[0.18em] hover:bg-primary-soft transition-colors"
            >
              <Sparkles size={14} />
              Mở AI Stylist
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
