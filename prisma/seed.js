const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedAdmin = await bcrypt.hash('admin123', 12);
  const hashedUser = await bcrypt.hash('user123', 12);

  await prisma.admin.upsert({
    where: { email: 'admin@dealstore.com' },
    update: {},
    create: {
      email: 'admin@dealstore.com',
      password: hashedAdmin,
      name: 'Admin',
    },
  });

  const categories = [
    { name: 'Car Accessories', slug: 'car-accessories' },
    { name: 'Mobile Accessories', slug: 'mobile-accessories' },
    { name: 'Personal Care', slug: 'personal-care' },
    { name: 'Grooming', slug: 'grooming' },
    { name: 'Watches', slug: 'watches' },
    { name: 'Gadgets', slug: 'gadgets' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const carCat = await prisma.category.findUnique({ where: { slug: 'car-accessories' } });
  const mobileCat = await prisma.category.findUnique({ where: { slug: 'mobile-accessories' } });
  const watchCat = await prisma.category.findUnique({ where: { slug: 'watches' } });

  const products = [
    { name: 'Car Phone Holder', slug: 'car-phone-holder', description: 'Universal car phone holder with 360° rotation', price: 299, discount: 40, stock: 50, categoryId: carCat.id, isHotDeal: true, images: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=400', isReturnable: true },
    { name: 'Wireless Earbuds', slug: 'wireless-earbuds', description: 'Bluetooth 5.0 wireless earbuds with 20hr battery', price: 999, discount: 50, stock: 100, categoryId: mobileCat.id, isHotDeal: true, images: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400', isReturnable: true },
    { name: 'Smart Watch', slug: 'smart-watch', description: 'Fitness tracker with heart rate & sleep monitoring', price: 1999, discount: 35, stock: 30, categoryId: watchCat.id, isHotDeal: false, images: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', isReturnable: false },
    { name: 'Power Bank 10000mAh', slug: 'power-bank', description: 'Fast charging power bank with dual USB', price: 499, discount: 45, stock: 80, categoryId: mobileCat.id, isHotDeal: true, images: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400', isReturnable: true },
    { name: 'Car Charger Dual Port', slug: 'car-charger', description: 'Dual port car charger with QC 3.0', price: 199, discount: 30, stock: 60, categoryId: carCat.id, isHotDeal: false, images: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400', isReturnable: false },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  await prisma.setting.upsert({ where: { key: 'cod_enabled' }, update: {}, create: { key: 'cod_enabled', value: 'true' } });
  await prisma.setting.upsert({ where: { key: 'delivery_charge' }, update: {}, create: { key: 'delivery_charge', value: '49' } });
  await prisma.setting.upsert({ where: { key: 'whatsapp_number' }, update: {}, create: { key: 'whatsapp_number', value: '919876543210' } });

  const reviews = [
    { name: 'Rahul K.', image: 'https://i.pravatar.cc/100?img=1', rating: 5, comment: 'Amazing deal! Product exactly as described.' },
    { name: 'Priya S.', image: 'https://i.pravatar.cc/100?img=5', rating: 5, comment: 'Fast delivery. Will order again!' },
    { name: 'Amit M.', image: 'https://i.pravatar.cc/100?img=12', rating: 4, comment: 'Good quality at great price.' },
  ];

  for (const r of reviews) {
    await prisma.review.create({ data: r });
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
