const prisma = require('../config/prisma');
const { getTrafficStats } = require('./analytics.service');

/** Slug ứng với 6 card danh mục trên homepage (theo thứ tự). */
const HOME_CATEGORY_SLUGS = ['kinh-ram', 'gong-kinh', 'trong-kinh', 'phu-kien'];

/**
 * Lấy thống kê cho trang chủ: tổng SP, tổng KH, % đánh giá tích cực, số SP theo danh mục/kính cũ/chống ánh sáng xanh.
 */
async function getHomeStats() {
  const baseProductWhere = { isActive: true };

  const [
    totalProducts,
    totalCustomers,
    reviewStats,
    categoryCounts,
    usedCount,
    blueLightCount,
    categoriesMeta,
  ] = await Promise.all([
    prisma.product.count({ where: baseProductWhere }),
    prisma.user.count({ where: { role: 'BUYER' } }),
    Promise.all([
      prisma.review.count(),
      prisma.review.count({ where: { rating: { gte: 4 } } }),
    ]).then(([total, positive]) => ({ total, positive })),
    prisma.product.groupBy({
      by: ['categoryId'],
      where: baseProductWhere,
      _count: { id: true },
    }),
    prisma.product.count({ where: { ...baseProductWhere, condition: 'USED' } }),
    prisma.product.count({ where: { ...baseProductWhere, lensType: 'BLUE_LIGHT' } }),
    prisma.category.findMany({
      where: { slug: { in: HOME_CATEGORY_SLUGS } },
      select: { id: true, slug: true, name: true },
    }),
  ]);

  const categoryById = new Map(categoriesMeta.map((c) => [c.id, c]));
  const countBySlug = new Map();
  for (const row of categoryCounts) {
    const cat = categoryById.get(row.categoryId);
    if (cat) countBySlug.set(cat.slug, row._count.id);
  }

  const categories = HOME_CATEGORY_SLUGS.map((slug) => {
    const meta = categoriesMeta.find((c) => c.slug === slug);
    return {
      slug,
      name: meta?.name ?? slug,
      count: countBySlug.get(slug) ?? 0,
    };
  });

  const totalReviews = reviewStats.total;
  const positiveReviewPercent =
    totalReviews > 0 ? Math.round((reviewStats.positive / totalReviews) * 100) : 0;

  return {
    totalProducts,
    totalCustomers,
    positiveReviewPercent,
    categories,
    usedCount,
    blueLightCount,
  };
}

/**
 * Lấy KPIs tổng quan cho Admin Dashboard trong 1 call duy nhất.
 * @param {{ startDate?: string|null, endDate?: string|null }} options
 */
async function getAdminStats({ startDate, endDate } = {}) {
  // Build date boundaries for the selected period
  const now = new Date();
  const fromDate = startDate
    ? new Date(`${startDate}T00:00:00`)
    : (() => { const d = new Date(now); d.setDate(d.getDate() - 6); d.setHours(0, 0, 0, 0); return d; })();
  const toDate = endDate
    ? new Date(`${endDate}T23:59:59`)
    : (() => { const d = new Date(now); d.setHours(23, 59, 59, 999); return d; })();

  const dateFilter = { gte: fromDate, lte: toDate };
  const diffDays = Math.max(1, Math.round((toDate - fromDate) / 86_400_000) + 1);

  const [
    totalRevenueAgg,
    gmvAndFeesAgg,
    orderGroups,
    pendingWithdrawals,
    userGroups,
    recentOrders,
    topSellerGroups,
    trendOrders,
    userTrendRows,
    topProductGroups,
    lowStockRaw,
  ] = await Promise.all([
    // Doanh thu tiền hàng (seller): đơn DELIVERED — không gồm ship/COD
    prisma.order.aggregate({
      where: { status: 'DELIVERED', createdAt: dateFilter },
      _sum: { itemsAmount: true },
    }),
    // GMV + breakdown: đơn không hủy (buyer trả = totalAmount)
    prisma.order.aggregate({
      where: { status: { not: 'CANCELLED' }, createdAt: dateFilter },
      _sum: {
        totalAmount: true,
        itemsAmount: true,
        shippingFee: true,
        shippingDiscount: true,
        codFee: true,
      },
    }),
    // Số đơn theo trạng thái trong khoảng
    prisma.order.groupBy({
      by: ['status'],
      where: { createdAt: dateFilter },
      _count: { id: true },
    }),
    // Yêu cầu rút tiền đang chờ (luôn là số hiện tại, không lọc ngày)
    prisma.withdrawalRequest.count({ where: { status: 'PENDING' } }),
    // Số user theo role (luôn là tổng cộng)
    prisma.user.groupBy({ by: ['role'], _count: { id: true } }),
    // 6 đơn gần nhất trong khoảng
    prisma.order.findMany({
      where: { createdAt: dateFilter },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        status: true,
        totalAmount: true,
        itemsAmount: true,
        createdAt: true,
        buyer: { select: { fullName: true, email: true } },
      },
    }),
    // Top sellers trong khoảng
    prisma.order.groupBy({
      by: ['sellerId'],
      where: { status: 'DELIVERED', createdAt: dateFilter },
      _sum: { itemsAmount: true },
      _count: { id: true },
      orderBy: { _sum: { itemsAmount: 'desc' } },
      take: 5,
    }),
    // Revenue trend trong khoảng
    prisma.order.findMany({
      where: { createdAt: dateFilter },
      select: { createdAt: true, totalAmount: true, itemsAmount: true, status: true },
      orderBy: { createdAt: 'asc' },
    }),
    // User growth trend trong khoảng
    prisma.user.findMany({
      where: { createdAt: dateFilter },
      select: { createdAt: true, role: true },
      orderBy: { createdAt: 'asc' },
    }),
    // Top 5 products by quantity sold trong khoảng
    prisma.orderDetail.groupBy({
      by: ['productId'],
      where: { order: { status: 'DELIVERED', createdAt: dateFilter } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
    // Sản phẩm sắp hết hàng (luôn là tồn kho hiện tại)
    prisma.product.findMany({
      where: { stock: { lte: 5 }, isActive: true },
      select: {
        id: true, name: true, stock: true,
        seller: { select: { fullName: true, email: true } },
      },
      orderBy: { stock: 'asc' },
      take: 10,
    }),
  ]);

  const orderCountByStatus = {};
  for (const g of orderGroups) orderCountByStatus[g.status] = g._count.id;

  const userCountByRole = {};
  for (const g of userGroups) userCountByRole[g.role] = g._count.id;

  // Resolve seller names
  const sellerIds = topSellerGroups.map((g) => g.sellerId).filter(Boolean);
  const sellers = sellerIds.length
    ? await prisma.user.findMany({
        where: { id: { in: sellerIds } },
        select: { id: true, fullName: true, email: true },
      })
    : [];
  const sellerMap = new Map(sellers.map((s) => [s.id, s]));
  const topSellers = topSellerGroups.map((g) => ({
    sellerId: g.sellerId,
    sellerName: sellerMap.get(g.sellerId)?.fullName || sellerMap.get(g.sellerId)?.email || g.sellerId,
    revenue: Number(g._sum?.itemsAmount ?? 0),
    orderCount: g._count.id,
  }));

  // Build revenue trend for the selected range (fill all days)
  const trendMap = new Map();
  for (let i = 0; i < diffDays; i++) {
    const d = new Date(fromDate);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    trendMap.set(key, { date: key, revenue: 0, gmv: 0 });
  }
  for (const o of trendOrders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    if (trendMap.has(key)) {
      const cur = trendMap.get(key);
      if (o.status !== 'CANCELLED') cur.gmv += Number(o.totalAmount);
      if (o.status === 'DELIVERED') cur.revenue += Number(o.itemsAmount ?? o.totalAmount);
    }
  }
  const revenueTrend = Array.from(trendMap.values());

  // Build user growth trend for the selected range
  const userTrendMap = new Map();
  for (let i = 0; i < diffDays; i++) {
    const d = new Date(fromDate);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    userTrendMap.set(key, { date: key, newUsers: 0, newSellers: 0 });
  }
  for (const u of userTrendRows) {
    const key = u.createdAt.toISOString().slice(0, 10);
    if (userTrendMap.has(key)) {
      const cur = userTrendMap.get(key);
      cur.newUsers += 1;
      if (u.role === 'SELLER') cur.newSellers += 1;
    }
  }
  const userGrowthTrend = Array.from(userTrendMap.values());

  // Resolve top product names
  const productIds = topProductGroups.map((g) => g.productId).filter(Boolean);
  const products = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true },
      })
    : [];
  const productMap = new Map(products.map((p) => [p.id, p]));
  const topProducts = topProductGroups.map((g) => ({
    productId: g.productId,
    productName: productMap.get(g.productId)?.name || g.productId,
    quantitySold: g._sum?.quantity ?? 0,
  }));

  const lowStockProducts = lowStockRaw.map((p) => ({
    id: p.id,
    name: p.name,
    stock: p.stock,
    sellerName: p.seller?.fullName || p.seller?.email || '--',
  }));

  const sumGmv = gmvAndFeesAgg._sum;
  const shippingCollected =
    Number(sumGmv?.shippingFee ?? 0) - Number(sumGmv?.shippingDiscount ?? 0);

  return {
    totalRevenue: Number(totalRevenueAgg._sum?.itemsAmount ?? 0),
    totalGmv: Number(sumGmv?.totalAmount ?? 0),
    itemRevenueNonCancelled: Number(sumGmv?.itemsAmount ?? 0),
    shippingCollected,
    codFeeCollected: Number(sumGmv?.codFee ?? 0),
    orderCounts: {
      total: Object.values(orderCountByStatus).reduce((a, b) => a + b, 0),
      pending: orderCountByStatus.PENDING ?? 0,
      confirmed: orderCountByStatus.CONFIRMED ?? 0,
      shipping: orderCountByStatus.SHIPPING ?? 0,
      delivered: orderCountByStatus.DELIVERED ?? 0,
      cancelled: orderCountByStatus.CANCELLED ?? 0,
    },
    pendingWithdrawals,
    userCounts: {
      total: Object.values(userCountByRole).reduce((a, b) => a + b, 0),
      buyers: userCountByRole.BUYER ?? 0,
      sellers: userCountByRole.SELLER ?? 0,
      staff: userCountByRole.STAFF ?? 0,
      admins: userCountByRole.ADMIN ?? 0,
    },
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      status: o.status,
      totalAmount: Number(o.totalAmount),
      itemsAmount: Number(o.itemsAmount ?? o.totalAmount),
      createdAt: o.createdAt,
      buyerName: o.buyer?.fullName || o.buyer?.email || '--',
    })),
    topSellers,
    revenueTrend,
    userGrowthTrend,
    topProducts,
    lowStockProducts,
  };
}

const SELLER_RANGE_DAYS = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

const SELLER_STATUS_ORDER = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDateInTimeZone(value, timeZone) {
  const date = value instanceof Date ? value : new Date(value);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timeZone || 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const year = parts.find((item) => item.type === 'year')?.value;
  const month = parts.find((item) => item.type === 'month')?.value;
  const day = parts.find((item) => item.type === 'day')?.value;
  if (!year || !month || !day) return date.toISOString().slice(0, 10);
  return `${year}-${month}-${day}`;
}

function resolveSellerPeriod(range = '30d') {
  const normalizedRange = Object.prototype.hasOwnProperty.call(SELLER_RANGE_DAYS, range) ? range : '30d';
  const days = SELLER_RANGE_DAYS[normalizedRange];
  const toDate = new Date();
  toDate.setHours(23, 59, 59, 999);
  const fromDate = new Date(toDate);
  fromDate.setDate(fromDate.getDate() - (days - 1));
  fromDate.setHours(0, 0, 0, 0);
  return { range: normalizedRange, days, fromDate, toDate };
}

function getSellerOrderScope(sellerId) {
  return {
    OR: [
      { sellerId },
      { sellerId: null, details: { some: { product: { sellerId } } } },
    ],
  };
}

function getEmptyStatusCounts() {
  return {
    PENDING: 0,
    CONFIRMED: 0,
    SHIPPING: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };
}

function calculateDeltaPercent(current, previous) {
  const currentNumber = toNumber(current);
  const previousNumber = toNumber(previous);
  if (Math.abs(previousNumber) < 0.000001) return null;
  return Number((((currentNumber - previousNumber) / Math.abs(previousNumber)) * 100).toFixed(2));
}

async function getSellerSummaryForPeriod(sellerId, dateFilter) {
  const sellerScope = getSellerOrderScope(sellerId);
  const [revenueAgg, statusGroups] = await Promise.all([
    prisma.order.aggregate({
      where: { ...sellerScope, status: 'DELIVERED', createdAt: dateFilter },
      _sum: { totalAmount: true },
    }),
    prisma.order.groupBy({
      by: ['status'],
      where: { ...sellerScope, createdAt: dateFilter },
      _count: { id: true },
    }),
  ]);

  const statusCounts = getEmptyStatusCounts();
  for (const row of statusGroups) {
    statusCounts[row.status] = row._count.id;
  }

  const totalOrders = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
  const completedOrders = statusCounts.DELIVERED;
  const processingOrders = statusCounts.PENDING + statusCounts.CONFIRMED + statusCounts.SHIPPING;
  const cancelledOrders = statusCounts.CANCELLED;
  const revenue = toNumber(revenueAgg._sum?.totalAmount ?? 0);
  const cancelRate = totalOrders > 0 ? Number(((cancelledOrders / totalOrders) * 100).toFixed(2)) : 0;
  const aov = completedOrders > 0 ? Number((revenue / completedOrders).toFixed(2)) : 0;

  return {
    revenue,
    completedOrders,
    processingOrders,
    cancelledOrders,
    totalOrders,
    cancelRate,
    aov,
    statusCounts,
  };
}

async function getSellerStats({ sellerId, range = '30d', tz = 'Asia/Ho_Chi_Minh' } = {}) {
  if (!sellerId) {
    throw Object.assign(new Error('Missing seller id for seller dashboard stats'), { statusCode: 400 });
  }

  const period = resolveSellerPeriod(range);
  const timeZone = String(tz || 'Asia/Ho_Chi_Minh').trim() || 'Asia/Ho_Chi_Minh';
  const dateFilter = { gte: period.fromDate, lte: period.toDate };

  const previousToDate = new Date(period.fromDate);
  previousToDate.setMilliseconds(previousToDate.getMilliseconds() - 1);
  previousToDate.setHours(23, 59, 59, 999);

  const previousFromDate = new Date(period.fromDate);
  previousFromDate.setDate(previousFromDate.getDate() - period.days);
  previousFromDate.setHours(0, 0, 0, 0);

  const previousDateFilter = { gte: previousFromDate, lte: previousToDate };
  const sellerScope = getSellerOrderScope(sellerId);
  const periodFromText = formatDateInTimeZone(period.fromDate, timeZone);
  const periodToText = formatDateInTimeZone(period.toDate, timeZone);

  const [
    summary,
    previousSummary,
    ordersInRange,
    recentOrders,
    deliveredDetails,
    lowStock,
    trafficStats,
  ] = await Promise.all([
    getSellerSummaryForPeriod(sellerId, dateFilter),
    getSellerSummaryForPeriod(sellerId, previousDateFilter),
    prisma.order.findMany({
      where: { ...sellerScope, createdAt: dateFilter },
      select: { createdAt: true, status: true, totalAmount: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.order.findMany({
      where: { ...sellerScope, createdAt: dateFilter },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        buyer: { select: { fullName: true, email: true } },
      },
    }),
    prisma.orderDetail.findMany({
      where: {
        product: { sellerId },
        order: { status: 'DELIVERED', createdAt: dateFilter },
      },
      select: {
        productId: true,
        quantity: true,
        price: true,
        product: { select: { name: true } },
      },
    }),
    prisma.product.findMany({
      where: { sellerId, isActive: true, stock: { lte: 5 } },
      select: { id: true, name: true, stock: true },
      orderBy: { stock: 'asc' },
      take: 5,
    }),
    getTrafficStats({ from: periodFromText, to: periodToText }),
  ]);

  const seriesMap = new Map();
  for (let offset = 0; offset < period.days; offset += 1) {
    const d = new Date(period.fromDate);
    d.setDate(d.getDate() + offset);
    const key = formatDateInTimeZone(d, timeZone);
    seriesMap.set(key, {
      date: key,
      revenue: 0,
      totalOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
    });
  }

  for (const order of ordersInRange) {
    const key = formatDateInTimeZone(order.createdAt, timeZone);
    if (!seriesMap.has(key)) continue;
    const row = seriesMap.get(key);
    row.totalOrders += 1;
    if (order.status === 'DELIVERED') {
      row.completedOrders += 1;
      row.revenue += toNumber(order.totalAmount);
    }
    if (order.status === 'CANCELLED') row.cancelledOrders += 1;
  }

  const topProductMap = new Map();
  for (const detail of deliveredDetails) {
    const productId = detail.productId;
    const quantity = toNumber(detail.quantity);
    const revenue = toNumber(detail.price) * quantity;
    if (!topProductMap.has(productId)) {
      topProductMap.set(productId, {
        productId,
        productName: detail.product?.name || productId,
        quantitySold: 0,
        revenue: 0,
      });
    }
    const current = topProductMap.get(productId);
    current.quantitySold += quantity;
    current.revenue += revenue;
  }

  const topProducts = Array.from(topProductMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((item) => ({
      ...item,
      revenue: Number(item.revenue.toFixed(2)),
    }));

  const trafficSeriesMap = new Map();
  for (const row of seriesMap.values()) {
    trafficSeriesMap.set(row.date, {
      date: row.date,
      visits: 0,
      uniqueVisitors: 0,
      pageViews: 0,
    });
  }

  for (const row of trafficStats.series || []) {
    const key = String(row?.date || '');
    if (!key) continue;
    if (!trafficSeriesMap.has(key)) {
      trafficSeriesMap.set(key, {
        date: key,
        visits: 0,
        uniqueVisitors: 0,
        pageViews: 0,
      });
    }
    const current = trafficSeriesMap.get(key);
    current.visits += toNumber(row?.visits);
    current.uniqueVisitors += toNumber(row?.uniqueVisitors);
    current.pageViews += toNumber(row?.pageViews);
  }

  return {
    range: period.range,
    timezone: timeZone,
    period: {
      from: periodFromText,
      to: periodToText,
      days: period.days,
    },
    summary: {
      revenue: summary.revenue,
      completedOrders: summary.completedOrders,
      processingOrders: summary.processingOrders,
      cancelledOrders: summary.cancelledOrders,
      totalOrders: summary.totalOrders,
      cancelRate: summary.cancelRate,
      aov: summary.aov,
      visits: toNumber(trafficStats.visits),
      uniqueVisitors: toNumber(trafficStats.uniqueVisitors),
      pageViews: toNumber(trafficStats.pageViews),
    },
    previousSummary: {
      revenue: previousSummary.revenue,
      completedOrders: previousSummary.completedOrders,
      processingOrders: previousSummary.processingOrders,
      cancelledOrders: previousSummary.cancelledOrders,
      totalOrders: previousSummary.totalOrders,
      cancelRate: previousSummary.cancelRate,
      aov: previousSummary.aov,
    },
    delta: {
      revenue: calculateDeltaPercent(summary.revenue, previousSummary.revenue),
      completedOrders: calculateDeltaPercent(summary.completedOrders, previousSummary.completedOrders),
      processingOrders: calculateDeltaPercent(summary.processingOrders, previousSummary.processingOrders),
      cancelRate: calculateDeltaPercent(summary.cancelRate, previousSummary.cancelRate),
      aov: calculateDeltaPercent(summary.aov, previousSummary.aov),
      visits: null,
      uniqueVisitors: null,
      pageViews: null,
    },
    series: {
      revenue: Array.from(seriesMap.values()),
      traffic: Array.from(trafficSeriesMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
    },
    distribution: {
      orderStatus: SELLER_STATUS_ORDER.map((status) => ({
        status,
        count: summary.statusCounts[status] ?? 0,
      })),
    },
    traffic: {
      status: trafficStats.status,
      provider: trafficStats.provider,
      visits: toNumber(trafficStats.visits),
      uniqueVisitors: toNumber(trafficStats.uniqueVisitors),
      pageViews: toNumber(trafficStats.pageViews),
      series: Array.from(trafficSeriesMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
      message: trafficStats.message || null,
    },
    topProducts,
    lowStock: lowStock.map((item) => ({
      id: item.id,
      name: item.name,
      stock: item.stock,
    })),
    recentOrders: recentOrders.map((item) => ({
      id: item.id,
      status: item.status,
      totalAmount: toNumber(item.totalAmount),
      createdAt: item.createdAt,
      buyerName: item.buyer?.fullName || item.buyer?.email || '--',
    })),
  };
}

module.exports = { getHomeStats, getAdminStats, getSellerStats };
