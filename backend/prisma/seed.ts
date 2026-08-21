import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash password for users
  const passwordHash = await bcrypt.hash('password123', 10);

  console.log('Creating users...');
  // Create SUPER_ADMIN
  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@system.com',
      password: passwordHash,
      role: 'SUPER_ADMIN',
    },
  });

  // Create Consumer User
  const consumer = await prisma.user.create({
    data: {
      name: 'Test Consumer',
      email: 'user@test.com',
      password: passwordHash,
      role: 'USER',
    },
  });

  console.log('Creating stores and menus...');
  const storeNames = [
    'Pizza Paradise',
    'Burger Barn',
    'Sushi Central',
    'Taco Fiesta',
    'Healthy Greens',
    'Coffee Corner',
    'Steakhouse Grill',
    'Indian Spice Route',
  ];

  for (const name of storeNames) {
    // Create Store
    const store = await prisma.store.create({
      data: {
        name,
        email: `${name.toLowerCase().replace(/ /g, '')}@store.com`,
        password: passwordHash,
        address: `123 ${name} Street, Food City`,
        phone: '555-123-4567',
      },
    });

    // Create STORE_ADMIN
    await prisma.user.create({
      data: {
        name: `${name} Admin`,
        email: `admin@${name.toLowerCase().replace(/ /g, '')}.com`,
        password: passwordHash,
        role: 'STORE_ADMIN',
      },
    });

    // Create 12 Menu Items
    const products = [];
    for (let i = 1; i <= 12; i++) {
      const product = await prisma.product.create({
        data: {
          storeId: store.id,
          name: `${name} Item ${i}`,
          price: Math.floor(Math.random() * 400) + 100,
          description: `Delicious signature item from ${name}`,
          category: i % 3 === 0 ? 'Beverages' : 'Mains',
        },
      });
      products.push(product);
    }

    console.log(`Creating orders for ${name}...`);
    // Create 4 orders for the store
    for (let i = 1; i <= 4; i++) {
      // Pick 2 random items
      const item1 = products[Math.floor(Math.random() * products.length)];
      const item2 = products[Math.floor(Math.random() * products.length)];
      
      const qty1 = Math.floor(Math.random() * 3) + 1;
      const qty2 = Math.floor(Math.random() * 2) + 1;
      
      const total = (item1.price * qty1) + (item2.price * qty2);
      
      const statuses = ['PLACED', 'PREPARING', 'READY', 'DELIVERED', 'COMPLETED'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      await prisma.order.create({
        data: {
          storeId: store.id,
          userId: consumer.id,
          totalAmount: total,
          status: status,
          items: [
            { item_id: item1.id, qty: qty1 },
            { item_id: item2.id, qty: qty2 }
          ],
        },
      });
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
