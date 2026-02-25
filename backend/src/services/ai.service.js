const prisma = require('../config/prisma');

const FRAME_SHAPE_KEYWORDS = {
  ROUND: ['tròn', 'tron', 'round', 'tròn trĩnh'],
  OVAL: ['oval', 'bầu dục', 'bau duc'],
  SQUARE: ['vuông', 'vuong', 'square', 'góc vuông', 'goc vuong'],
  RECTANGLE: ['chữ nhật', 'chu nhat', 'rectangle', 'hình chữ nhật', 'hinh chu nhat'],
  CAT_EYE: ['mèo', 'meo', 'cat eye', 'cateye'],
  AVIATOR: ['aviator', 'phi công', 'phi cong', 'pilot'],
};

function mockAnalyzeQuestion(question) {
  const q = (question || '').toLowerCase();
  const shapes = [];
  for (const [shape, keywords] of Object.entries(FRAME_SHAPE_KEYWORDS)) {
    if (keywords.some((kw) => q.includes(kw))) shapes.push(shape);
  }
  if (shapes.length === 0) {
    shapes.push('ROUND', 'OVAL', 'SQUARE', 'RECTANGLE', 'CAT_EYE', 'AVIATOR');
  }
  return shapes;
}

function mockAnswer(question, shapes) {
  const shapeNames = {
    ROUND: 'tròn',
    OVAL: 'oval',
    SQUARE: 'vuông',
    RECTANGLE: 'chữ nhật',
    CAT_EYE: 'mắt mèo',
    AVIATOR: 'aviator',
  };
  const names = [...new Set(shapes)].map((s) => shapeNames[s] || s).join(', ');
  return `Dựa trên câu hỏi của bạn, chúng tôi gợi ý các kiểu gọng: ${names}. Dưới đây là một số sản phẩm phù hợp từ Kính Tốt.`;
}

async function chat(question, userId = null) {
  const frameShapes = mockAnalyzeQuestion(question);
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      frameShape: frameShapes.length ? { in: frameShapes } : undefined,
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
    },
    take: 6,
    orderBy: { createdAt: 'desc' },
  });

  const answer = mockAnswer(question, frameShapes);

  const suggestedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    salePrice: p.salePrice ? Number(p.salePrice) : null,
    images: p.images,
    frameShape: p.frameShape,
    frameMaterial: p.frameMaterial,
    category: p.category,
  }));

  if (userId) {
    let session = await prisma.chatSession.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (!session) {
      session = await prisma.chatSession.create({
        data: { userId, title: 'AI Stylist' },
      });
    }
    await prisma.chatMessage.createMany({
      data: [
        { sessionId: session.id, role: 'USER', content: question },
        {
          sessionId: session.id,
          role: 'AI',
          content: answer,
          productSuggestions: suggestedProducts,
        },
      ],
    });
  }

  return { answer, suggestedProducts };
}

module.exports = { chat, mockAnalyzeQuestion };
