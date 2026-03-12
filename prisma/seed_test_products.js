const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed: Adding 15 test products...');

  // Helper to find category by slug
  const getCatId = async (slug) => {
    const cat = await prisma.category.findUnique({ where: { slug } });
    if (!cat) throw new Error(`Category with slug "${slug}" not found. Please run main seed first.`);
    return cat.id;
  };

  const carId = await getCatId('car-accessories');
  const mobileId = await getCatId('mobile-accessories');
  const personalId = await getCatId('personal-care');
  const groomingId = await getCatId('grooming');
  const watchId = await getCatId('watches');
  const gadgetId = await getCatId('gadgets');

  const products = [
    // Car Accessories (3)
    {
      name: 'Car Backseat Organizer',
      slug: 'car-backseat-organizer',
      description: 'Multi-pocket backseat organizer with tablet holder for kids and long trips.',
      price: 899,
      discount: 25,
      stock: 45,
      categoryId: carId,
      isHotDeal: true,
      images: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
      isReturnable: true
    },
    {
      name: 'LED Interior Car Lights',
      slug: 'led-interior-car-lights',
      description: 'RGB LED strip lights for car floor with remote control and music sync.',
      price: 1299,
      discount: 50,
      stock: 30,
      categoryId: carId,
      isHotDeal: false,
      images: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800',
      isReturnable: true
    },
    {
      name: 'Digital Tire Pressure Gauge',
      slug: 'digital-tire-pressure-gauge',
      description: 'High precision digital tire pressure gauge with backlit LCD.',
      price: 450,
      discount: 10,
      stock: 100,
      categoryId: carId,
      isHotDeal: false,
      images: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800',
      isReturnable: false
    },

    // Mobile Accessories (3)
    {
      name: 'Braided Fast Charging Cable',
      slug: 'braided-fast-charging-cable',
      description: 'Durable nylon braided USB-C cable supporting 65W fast charging.',
      price: 299,
      discount: 30,
      stock: 200,
      categoryId: mobileId,
      isHotDeal: true,
      images: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800',
      isReturnable: true
    },
    {
      name: 'Flexible Phone Tripod',
      slug: 'flexible-phone-tripod',
      description: 'Octopus style flexible tripod for phone and action cams with Bluetooth remote.',
      price: 750,
      discount: 40,
      stock: 60,
      categoryId: mobileId,
      isHotDeal: false,
      images: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=800',
      isReturnable: true
    },
    {
      name: 'Magnetic MagSafe Wallet',
      slug: 'magsafe-wallet',
      description: 'Leather magnetic wallet for iPhone 12/13/14 series, holds up to 3 cards.',
      price: 1499,
      discount: 60,
      stock: 25,
      categoryId: mobileId,
      isHotDeal: true,
      images: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=800',
      isReturnable: true
    },

    // Personal Care (2)
    {
      name: 'Electric Neck Massager',
      slug: 'electric-neck-massager',
      description: 'Portable neck massager with heat function for stress and pain relief.',
      price: 2499,
      discount: 35,
      stock: 15,
      categoryId: personalId,
      isHotDeal: true,
      images: 'https://images.unsplash.com/photo-1544161515-4af6b1d462c2?w=800',
      isReturnable: false
    },
    {
      name: 'Ionic Hair Dryer',
      slug: 'ionic-hair-dryer',
      description: 'Professional grade ionic hair dryer with 3 heat settings and cool shot.',
      price: 3200,
      discount: 20,
      stock: 40,
      categoryId: personalId,
      isHotDeal: false,
      images: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800',
      isReturnable: true
    },

    // Grooming (2)
    {
      name: 'Cordless Beard Trimmer',
      slug: 'cordless-beard-trimmer',
      description: 'Precision cordless beard trimmer with 10 length settings and stainless steel blades.',
      price: 1899,
      discount: 15,
      stock: 55,
      categoryId: groomingId,
      isHotDeal: false,
      images: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
      isReturnable: true
    },
    {
      name: 'Premium Beard Oil',
      slug: 'premium-beard-oil',
      description: 'Natural sandalwood scented beard oil for growth and softness.',
      price: 599,
      discount: 5,
      stock: 120,
      categoryId: groomingId,
      isHotDeal: false,
      images: 'https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?w=800',
      isReturnable: false
    },

    // Watches (3)
    {
      name: 'Classic Leather Analog',
      slug: 'classic-leather-analog',
      description: 'Elegant analog watch with genuine brown leather strap and white dial.',
      price: 4500,
      discount: 40,
      stock: 20,
      categoryId: watchId,
      isHotDeal: true,
      images: 'https://images.unsplash.com/photo-1524592091214-8c97af7c4a31?w=800',
      isReturnable: true
    },
    {
      name: 'Sports Digital Watch',
      slug: 'sports-digital-watch',
      description: 'Water resistant rugged digital watch with stopwatch and backlight.',
      price: 1200,
      discount: 10,
      stock: 80,
      categoryId: watchId,
      isHotDeal: false,
      images: 'https://images.unsplash.com/photo-1544117518-30df578096a4?w=800',
      isReturnable: true
    },
    {
      name: 'Minimalist Mesh Watch',
      slug: 'minimalist-mesh-watch',
      description: 'Ultra-thin minimalist watch with black steel mesh strap.',
      price: 2800,
      discount: 25,
      stock: 35,
      categoryId: watchId,
      isHotDeal: false,
      images: 'https://images.unsplash.com/photo-1508685096489-7df30fb047a0?w=800',
      isReturnable: true
    },

    // Gadgets (2)
    {
      name: 'Mini Bluetooth Speaker',
      slug: 'mini-bluetooth-speaker',
      description: 'Palm-sized portable Bluetooth speaker with surprisingly deep bass.',
      price: 999,
      discount: 45,
      stock: 75,
      categoryId: gadgetId,
      isHotDeal: true,
      images: 'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=800',
      isReturnable: true
    },
    {
      name: '4K Action Camera',
      slug: '4k-action-camera',
      description: 'Waterproof action camera with 4K resolution and mounting accessories.',
      price: 5500,
      discount: 30,
      stock: 25,
      categoryId: gadgetId,
      isHotDeal: true,
      images: 'https://images.unsplash.com/photo-1526170315873-3a91e3ef338a?w=800',
      isReturnable: true
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...p },
      create: p,
    });
    console.log(`Added/Updated: ${p.name}`);
  }

  console.log('Seed completed: 15 products added!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
