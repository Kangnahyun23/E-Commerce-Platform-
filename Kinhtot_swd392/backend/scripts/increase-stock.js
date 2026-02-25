/**
 * Script tăng tồn kho để test thanh toán VNPAY.
 * Chạy: npm run increase-stock   (tăng sản phẩm "Mykita Lite Oval")
 * Hoặc: node scripts/increase-stock.js --all   (tăng mọi sản phẩm có stock < 10)
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const prisma = require('../src/config/prisma');

const TARGET_STOCK = 100;

async function main() {
  const useAll = process.argv.includes('--all');

  if (useAll) {
    const updated = await prisma.product.updateMany({
      where: { stock: { lt: 10 } },
      data: { stock: TARGET_STOCK },
    });
    console.log(`Đã cập nhật tồn kho ${updated.count} sản phẩm (stock < 10) lên ${TARGET_STOCK}.`);
    return;
  }

  const nameFilter = process.argv[2] || 'Mykita Lite Oval';
  const products = await prisma.product.findMany({
    where: { name: { contains: nameFilter, mode: 'insensitive' } },
  });

  if (products.length === 0) {
    console.log(`Không tìm thấy sản phẩm chứa "${nameFilter}". Thử: node scripts/increase-stock.js --all`);
    return;
  }

  for (const p of products) {
    await prisma.product.update({
      where: { id: p.id },
      data: { stock: TARGET_STOCK },
    });
    console.log(`Đã set tồn kho "${p.name}" (id: ${p.id}) = ${TARGET_STOCK}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
