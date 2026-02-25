export const mockCategories = [
  {
    id: 'cat-sun',
    name: 'Kính râm',
    slug: 'kinh-ram',
    image:
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1400&q=80',
    productCount: 128,
  },
  {
    id: 'cat-frame',
    name: 'Gọng kính',
    slug: 'gong-kinh',
    image:
      'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=1400&q=80',
    productCount: 94,
  },
];

export const mockProducts = [
  {
    id: 'mock-1',
    name: 'Aster Metal Square',
    slug: 'aster-metal-square',
    description:
      'Gọng kim loại vuông, thiết kế thanh lịch, phù hợp đi làm và gặp khách hàng.',
    price: 1290000,
    salePrice: 1090000,
    condition: 'NEW',
    frameShape: 'SQUARE',
    frameMaterial: 'METAL',
    lensType: 'BLUE_LIGHT',
    gender: 'UNISEX',
    stock: 32,
    categoryId: 'cat-frame',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1577744486770-020adf4f3d6a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1625591339971-4f35f419f2fa?auto=format&fit=crop&w=1200&q=80',
    ],
    createdAt: '2026-02-01T10:20:00.000Z',
  },
  {
    id: 'mock-2',
    name: 'Noir Aviator Titanium',
    slug: 'noir-aviator-titanium',
    description: 'Phong cách phi công cổ điển, gọng titanium siêu nhẹ.',
    price: 1890000,
    salePrice: null,
    condition: 'NEW',
    frameShape: 'AVIATOR',
    frameMaterial: 'TITANIUM',
    lensType: 'SUNGLASSES',
    gender: 'UNISEX',
    stock: 18,
    categoryId: 'cat-sun',
    images: [
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1200&q=80',
    ],
    createdAt: '2026-02-06T14:05:00.000Z',
  },
  {
    id: 'mock-3',
    name: 'Mellow Acetate Round',
    slug: 'mellow-acetate-round',
    description: 'Form tròn mềm mại, gọng acetate hoàn thiện mịn.',
    price: 990000,
    salePrice: 790000,
    condition: 'NEW',
    frameShape: 'ROUND',
    frameMaterial: 'ACETATE',
    lensType: 'SINGLE_VISION',
    gender: 'WOMEN',
    stock: 40,
    categoryId: 'cat-frame',
    images: [
      'https://images.unsplash.com/photo-1516515429572-bf32372f2409?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1615461066159-fea0960485d5?auto=format&fit=crop&w=1200&q=80',
    ],
    createdAt: '2026-02-03T09:00:00.000Z',
  },
  {
    id: 'mock-4',
    name: 'Chrome Rectangle Light',
    slug: 'chrome-rectangle-light',
    description: 'Mẫu chữ nhật tối giản, hợp khuôn mặt tròn và oval.',
    price: 1190000,
    salePrice: null,
    condition: 'LIKE_NEW',
    frameShape: 'RECTANGLE',
    frameMaterial: 'METAL',
    lensType: 'BLUE_LIGHT',
    gender: 'MEN',
    stock: 12,
    categoryId: 'cat-frame',
    images: [
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=1200&q=80',
    ],
    createdAt: '2026-01-29T16:40:00.000Z',
  },
  {
    id: 'mock-5',
    name: 'Amber Cat Eye Luxe',
    slug: 'amber-cat-eye-luxe',
    description: 'Cat-eye nữ tính, tạo điểm nhấn cho phong cách thời trang.',
    price: 1450000,
    salePrice: 1250000,
    condition: 'NEW',
    frameShape: 'CAT_EYE',
    frameMaterial: 'ACETATE',
    lensType: 'SUNGLASSES',
    gender: 'WOMEN',
    stock: 20,
    categoryId: 'cat-sun',
    images: [
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80',
    ],
    createdAt: '2026-02-07T07:15:00.000Z',
  },
  {
    id: 'mock-6',
    name: 'Urban Oval Classic',
    slug: 'urban-oval-classic',
    description: 'Dáng oval cổ điển, cân bằng và dễ phối trang phục.',
    price: 860000,
    salePrice: null,
    condition: 'USED',
    frameShape: 'OVAL',
    frameMaterial: 'PLASTIC',
    lensType: 'SINGLE_VISION',
    gender: 'UNISEX',
    stock: 9,
    categoryId: 'cat-frame',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=1200&q=80',
    ],
    createdAt: '2026-01-25T11:30:00.000Z',
  },
];

export const sortProducts = (products, sortBy = 'newest') => {
  const source = [...products];
  switch (sortBy) {
    case 'price-asc':
      return source.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    case 'price-desc':
      return source.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    case 'name-asc':
      return source.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    case 'newest':
    default:
      return source.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};

export const filterMockProducts = (products, filters = {}) =>
  products.filter((item) => {
    if (filters.frameShape && item.frameShape !== filters.frameShape) return false;
    if (filters.frameMaterial && item.frameMaterial !== filters.frameMaterial) return false;
    if (filters.condition && item.condition !== filters.condition) return false;
    if (filters.categoryId && item.categoryId !== filters.categoryId) return false;
    if (filters.minPrice && (item.salePrice ?? item.price) < Number(filters.minPrice)) return false;
    if (filters.maxPrice && (item.salePrice ?? item.price) > Number(filters.maxPrice)) return false;
    if (filters.search) {
      const keyword = filters.search.toLowerCase();
      const text = `${item.name} ${item.description}`.toLowerCase();
      if (!text.includes(keyword)) return false;
    }
    return true;
  });
