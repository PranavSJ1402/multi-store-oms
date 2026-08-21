import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.orderArchive.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.store.deleteMany();

  console.log('Seeding dummy stores...');
  
  const storesData = [
    { name: 'Gourmet Kitchen', address: '123 Fine Dining Blvd, NY', phone: '+1 555-0101', email: 'contact@gourmetkitchen.com' },
    { name: 'Spicy Wok', address: '456 Asian St, CA', phone: '+1 555-0102', email: 'hello@spicywok.com' },
    { name: 'Daily Roast Coffee', address: '789 Morning Ave, TX', phone: '+1 555-0103', email: 'info@dailyroast.com' },
    { name: 'Sweet Treats Bakery', address: '101 Sugar Lane, FL', phone: '+1 555-0104', email: 'sales@sweettreats.com' },
    { name: 'Burger Haven', address: '202 Fast Food Rd, WA', phone: '+1 555-0105', email: 'hello@burgerhaven.com' },
    { name: 'Taco Fiesta', address: '303 Mexican Blvd, NM', phone: '+1 555-0106', email: 'hola@tacofiesta.com' },
    { name: 'Ocean Catch Seafood', address: '404 Marina Drive, MA', phone: '+1 555-0107', email: 'contact@oceancatch.com' },
  ];

  const createdStores = [];
  const mdLines = [
    '# OMS Mock Data Credentials',
    '',
    '## Super Admin',
    '- **Email**: admin@oms.com',
    `- **Password**: superadmin123`,
    '',
    '## Normal User',
    '- **Email**: user@oms.com',
    `- **Password**: user123`,
    '',
    '## Stores (Store Admins)',
    '| Store Name | Address | Phone | Email | Password |',
    '| --- | --- | --- | --- | --- |'
  ];

  for (const store of storesData) {
    const plainPassword = `pass${Math.random().toString(36).substring(2, 8)}`;
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    
    const createdStore = await prisma.store.create({ 
      data: {
        ...store,
        password: hashedPassword,
      } 
    });
    createdStores.push(createdStore);
    mdLines.push(`| ${store.name} | ${store.address} | ${store.phone} | ${store.email} | ${plainPassword} |`);
  }

  console.log('Seeding dummy products...');
  
  const allProducts = [];
  const randPrice = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);
  const categories = ['Starters', 'Mains', 'Desserts', 'Beverages'];

  for (let i = 0; i < createdStores.length; i++) {
    const storeId = createdStores[i].id;
    const storeName = createdStores[i].name;

    for (let j = 1; j <= 5; j++) {
      allProducts.push({
        storeId,
        name: `${storeName} Signature Item ${j}`,
        price: randPrice(50, 400),
        description: `A delicious offering from ${storeName}. Perfect for any occasion.`,
        category: categories[j % categories.length],
      });
    }
  }

  await prisma.product.createMany({ data: allProducts });

  console.log('Seeding users and generating details.md...');
  
  const superAdminPass = 'superadmin123';
  const superAdminHash = await bcrypt.hash(superAdminPass, 12);
  
  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@oms.com',
      password: superAdminHash,
      role: 'SUPER_ADMIN',
    }
  });

  const userPass = 'user123';
  const userHash = await bcrypt.hash(userPass, 12);
  await prisma.user.create({
    data: {
      name: 'Jane Doe',
      email: 'user@oms.com',
      password: userHash,
      role: 'USER',
    }
  });

  const detailsPath = path.join(__dirname, '..', 'details.md');
  fs.writeFileSync(detailsPath, mdLines.join('\n'));

  console.log(`✅ Seeding completed! Credentials written to ${detailsPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
