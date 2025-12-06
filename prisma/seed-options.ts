import { seedOptions } from "@/lib/api/misc";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (tx) => {
    const data = await seedOptions(tx);

    await tx.variantOption.createMany({
      data: data.variantOption,
    });

    await tx.variantOptionOnSubCategory.createMany({
      data: data.relationData,
    });
  });
}

// main()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });

// to run this file
// npx ts-node -r tsconfig-paths/register prisma/seed-options.ts
