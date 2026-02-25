const fs = require('fs');

const seedFile = 'e:/Kinhtot_swd392/backend/prisma/seed.js';
let seedContent = fs.readFileSync(seedFile, 'utf8');

// 1. Divide prices by 10 in seed.js
seedContent = seedContent.replace(/price:\s*'(\d+)'/g, (match, p1) => `price: '${Math.floor(parseInt(p1) / 10)}'`);
seedContent = seedContent.replace(/salePrice:\s*'(\d+)'/g, (match, p1) => `salePrice: '${Math.floor(parseInt(p1) / 10)}'`);

// 2. Make upsert ACTUALLY update the price
// Currently it is `update: {},`
// We should replace it with `update: { price: 'X', salePrice: 'Y' }` but since we dynamically change prices,
// the easiest robust way is to delete all products first.
if (!seedContent.includes('await prisma.product.deleteMany({});')) {
    seedContent = seedContent.replace(
        '// --- Re-seed products using high-quality Unsplash images ---',
        '// --- Re-seed products using high-quality Unsplash images ---\n  await prisma.product.deleteMany({});'
    );
}

// 3. Add 4 more USED products at the end before console.log
if (!seedContent.includes('mock-used-1')) {
    const newProducts = `
  await prisma.product.create({
    data: {
      sellerId: seller.id,
      categoryId: cat1.id,
      name: 'Retro Round Classic (Cũ)',
      slug: 'mock-used-1',
      description: 'Kính râm gọng tròn cổ điển, tròng xanh sẫm. Tình trạng còn khá mới.',
      price: '150000',
      salePrice: '90000',
      images: images.img11,
      condition: 'USED',
      frameMaterial: 'METAL',
      frameShape: 'ROUND',
      lensType: 'SUNGLASSES',
      gender: 'UNISEX',
      stock: 1,
      isActive: true,
    }
  });

  await prisma.product.create({
    data: {
      sellerId: seller.id,
      categoryId: cat2.id,
      name: 'Titanium Rectangle Frame (Cũ)',
      slug: 'mock-used-2',
      description: 'Gọng titan xám nhạt cực nhẹ, tình trạng gần như mới hoàn toàn.',
      price: '250000',
      salePrice: '120000',
      images: images.img12,
      condition: 'LIKE_NEW',
      frameMaterial: 'TITANIUM',
      frameShape: 'RECTANGLE',
      lensType: 'SINGLE_VISION',
      gender: 'MEN',
      stock: 1,
      isActive: true,
    }
  });

  await prisma.product.create({
    data: {
      sellerId: seller.id,
      categoryId: cat1.id,
      name: 'Vintage Cat-Eye Shades (Cũ)',
      slug: 'mock-used-3',
      description: 'Kính dáng mắt mèo phong cách thập niên 90, tròng màu hổ phách.',
      price: '180000',
      salePrice: '85000',
      images: images.img13,
      condition: 'USED',
      frameMaterial: 'PLASTIC',
      frameShape: 'CAT_EYE',
      lensType: 'SUNGLASSES',
      gender: 'WOMEN',
      stock: 1,
      isActive: true,
    }
  });

  await prisma.product.create({
    data: {
      sellerId: seller.id,
      categoryId: cat2.id,
      name: 'Half-Rim Business (Cũ)',
      slug: 'mock-used-4',
      description: 'Gọng nửa viền dùng cho dân văn phòng. Gọng còn rất cứng cáp.',
      price: '120000',
      salePrice: null,
      images: images.img14,
      condition: 'USED',
      frameMaterial: 'METAL',
      frameShape: 'SQUARE',
      lensType: 'SINGLE_VISION',
      gender: 'MEN',
      stock: 1,
      isActive: true,
    }
  });
`;
    seedContent = seedContent.replace('console.log(\'Created 13 realistic sample products\');', newProducts + '\n  console.log(\'Created sample products including used items\');');
}
fs.writeFileSync(seedFile, seedContent);

// Modify mockProducts.js
const mockFile = 'e:/Kinhtot_swd392/frontend/src/data/mockProducts.js';
let mockContent = fs.readFileSync(mockFile, 'utf8');
mockContent = mockContent.replace(/price:\s*(\d+)/g, (match, p1) => {
    if (parseInt(p1) < 1000) return match;
    return `price: ${Math.floor(parseInt(p1) / 10)}`;
});
mockContent = mockContent.replace(/salePrice:\s*(\d+)/g, (match, p1) => {
    if (parseInt(p1) < 1000) return match;
    return `salePrice: ${Math.floor(parseInt(p1) / 10)}`;
});
if (!mockContent.includes('mock-used-new-1')) {
    const newMockProducts = `,
  {
    id: 'mock-used-new-1',
    name: 'Retro Round Classic (Cũ)',
    slug: 'retro-round-classic-cu',
    description: 'Kính râm gọng tròn cổ điển, tròng xanh sẫm. Tình trạng còn khá mới.',
    price: 150000,
    salePrice: 90000,
    condition: 'USED',
    frameShape: 'ROUND',
    frameMaterial: 'METAL',
    lensType: 'SUNGLASSES',
    gender: 'UNISEX',
    stock: 1,
    categoryId: 'cat-sun',
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80'],
    createdAt: '2026-02-08T10:20:00.000Z',
  },
  {
    id: 'mock-used-new-2',
    name: 'Titanium Rectangle Frame (Cũ)',
    slug: 'titan-rectangle-cu',
    description: 'Gọng titan xám nhạt cực nhẹ, tình trạng gần như mới hoàn toàn.',
    price: 250000,
    salePrice: 120000,
    condition: 'LIKE_NEW',
    frameShape: 'RECTANGLE',
    frameMaterial: 'TITANIUM',
    lensType: 'SINGLE_VISION',
    gender: 'MEN',
    stock: 1,
    categoryId: 'cat-frame',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80'],
    createdAt: '2026-02-05T14:05:00.000Z',
  }
];`;
    mockContent = mockContent.replace('];\n\nexport const sortProducts =', newMockProducts + '\n\nexport const sortProducts =');
}
fs.writeFileSync(mockFile, mockContent);

// Fix Footer.jsx
const footerFile = 'e:/Kinhtot_swd392/frontend/src/components/layout/Footer.jsx';
let footerContent = fs.readFileSync(footerFile, 'utf8');
footerContent = footerContent.replace(
    'Nền tảng B2C & C2C chuyên về kính mắt. Mua mới, mua cũ, tư vấn AI theo phong cách của bạn.',
    'Nền tảng giao dịch kính mắt trực tuyến. Mua mới, mua cũ, tư vấn phong cách dành riêng cho bạn.'
);
fs.writeFileSync(footerFile, footerContent);

console.log('Successfully updated seed.js, mockProducts.js, and Footer.jsx');
