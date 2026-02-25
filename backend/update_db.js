require('dotenv').config({ path: 'e:/Kinhtot_swd392/backend/.env' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({
    connectionString,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 300_000,
});
const prisma = new PrismaClient({ adapter });

async function main() {
    const products = await prisma.product.findMany();
    for (const product of products) {
        const newPrice = Math.floor(parseInt(product.price) / 10).toString();
        const newSalePrice = product.salePrice ? Math.floor(parseInt(product.salePrice) / 10).toString() : null;
        await prisma.product.update({
            where: { id: product.id },
            data: {
                price: newPrice,
                salePrice: newSalePrice,
            }
        });
    }
    console.log('Successfully updated all existing product prices');

    const seller = await prisma.user.findFirst({ where: { email: 'seller@kinhtot.vn' } });
    const cat1 = await prisma.category.findFirst({ where: { slug: 'kinh-ram' } });
    const cat2 = await prisma.category.findFirst({ where: { slug: 'gong-kinh' } });

    const newProducts = [
        {
            sellerId: seller.id,
            categoryId: cat1.id,
            name: 'Retro Round Classic (Cũ)',
            slug: 'retro-round-classic-cu',
            description: 'Kính râm gọng tròn cổ điển, tròng xanh sẫm. Tình trạng còn khá mới.',
            price: '150000',
            salePrice: '90000',
            images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80'],
            condition: 'USED',
            frameMaterial: 'METAL',
            frameShape: 'ROUND',
            lensType: 'SUNGLASSES',
            gender: 'UNISEX',
            stock: 1,
            isActive: true,
        },
        {
            sellerId: seller.id,
            categoryId: cat2.id,
            name: 'Titanium Rectangle Frame (Cũ)',
            slug: 'titan-rectangle-cu',
            description: 'Gọng titan xám nhạt cực nhẹ, tình trạng gần như mới hoàn toàn.',
            price: '250000',
            salePrice: '120000',
            images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80'],
            condition: 'LIKE_NEW',
            frameMaterial: 'TITANIUM',
            frameShape: 'RECTANGLE',
            lensType: 'SINGLE_VISION',
            gender: 'MEN',
            stock: 1,
            isActive: true,
        },
        {
            sellerId: seller.id,
            categoryId: cat1.id,
            name: 'Vintage Cat-Eye Shades (Cũ)',
            slug: 'vintage-cat-eye-cu',
            description: 'Kính dáng mắt mèo phong cách thập niên 90, tròng màu hổ phách.',
            price: '180000',
            salePrice: '85000',
            images: ['https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=1200&q=80'],
            condition: 'USED',
            frameMaterial: 'PLASTIC',
            frameShape: 'CAT_EYE',
            lensType: 'SUNGLASSES',
            gender: 'WOMEN',
            stock: 1,
            isActive: true,
        },
        {
            sellerId: seller.id,
            categoryId: cat2.id,
            name: 'Half-Rim Business (Cũ)',
            slug: 'half-rim-business-cu',
            description: 'Gọng nửa viền dùng cho dân văn phòng. Gọng còn rất cứng cáp.',
            price: '120000',
            salePrice: null,
            images: ['https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=1200&q=80'],
            condition: 'USED',
            frameMaterial: 'METAL',
            frameShape: 'SQUARE',
            lensType: 'SINGLE_VISION',
            gender: 'MEN',
            stock: 1,
            isActive: true,
        }
    ];

    for (const p of newProducts) {
        await prisma.product.upsert({
            where: { slug: p.slug },
            update: {},
            create: p
        });
    }
    console.log('Successfully inserted new used glasses');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
