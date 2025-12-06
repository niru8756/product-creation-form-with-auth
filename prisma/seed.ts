import { PrismaClient } from "@prisma/client";
import { customAlphabet } from "nanoid";
import * as fs from "node:fs";

const prisma = new PrismaClient();

const alphabet: string =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const idGen = customAlphabet(alphabet, 16);

// const classification: Record<string, string[]> = JSON.parse(
//   fs.readFileSync('./prisma/data/classifications.json', 'utf-8'),
// );

// const attributes: Record<string, string[]> = JSON.parse(
//   fs.readFileSync('./prisma/data/attributes.json', 'utf-8'),
// );

// const activeStates: Record<string, boolean> = JSON.parse(
//   fs.readFileSync('./prisma/data/active_product_types.json', 'utf-8'),
// );

const data: {
  category: string;
  sub_category: string;
  ondc_domain: string;
  ondc_category: string;
  amazon_product_type: string;
  variant_attr: string[];
  shopify: {
    category_id: string;
    category_name: string;
    category_breadcrumb: string;
  };
}[] = JSON.parse(
  fs.readFileSync("./prisma/data/category_mapping.json", "utf8")
);

async function main() {
  const categoryIdMapping = new Map();
  const categories = new Set(data.map((val) => val.category));
  const categoryData: {
    id: bigint;
    active: boolean;
    name: string;
  }[] = [];

  for (const category of categories) {
    const [{ next_id: id }] = await prisma.$queryRaw<{ next_id: bigint }[]>`
  SELECT public.next_id() as next_id`;
    categoryIdMapping.set(category, id);
    // console.log({ id, category });
    categoryData.push({
      id,
      name: category,
      active: true,
    });
  }

  await prisma.category.createMany({
    data: categoryData,
  });

  const subCategoryData = await Promise.all(
    data.map(async (val) => {
      const [{ next_id: id }] = await prisma.$queryRaw<{ next_id: bigint }[]>`
  SELECT public.next_id() as next_id`;
      return {
        id: id,
        name: val.sub_category,
        active: true,
        categoryId: categoryIdMapping.get(val.category),
        metadata: {
          amazon: {
            productType: val.amazon_product_type,
          },
          ondc: {
            domain: val.ondc_domain,
            category: val.ondc_category,
          },
          shopify: {
            categoryId: val.shopify.category_id,
            categoryName: val.shopify.category_name,
            categoryBreadcrumb: val.shopify.category_breadcrumb,
          },
        },
        attributes: val.variant_attr,
      };
    })
  );

  await prisma.subCategory.createMany({
    data: subCategoryData,
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
