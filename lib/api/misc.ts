import {
  colorDefaults,
  sizeDefaults,
  supportedAttrForVariants,
  uskSizeToPtypeMap,
} from "@/types/constant";
import { Prisma } from "@prisma/client";
import { customAlphabet } from "nanoid";

const generateRandomPrefix = (length = 6) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"; // Allowed characters
  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const generateSku = (
  category: string,
  subCategory: string,
  index: number,
  suffix?: string
) => {
  if (suffix) {
    return `${category.substring(0, 3)}-${subCategory.substring(
      0,
      3
    )}-${suffix}${index}`;
  } else {
    const randomString = generateRandomPrefix();
    return `${category.substring(0, 3)}-${subCategory.substring(
      0,
      3
    )}-${randomString}${index}`;
  }
};

export const generateSlug = (
  name: string,
  separator?: string,
  preserved?: string[]
) => {
  let p = [".", "=", "-"];
  let s = "-";

  if (typeof preserved != "undefined") {
    p = preserved;
  }
  if (typeof separator != "undefined") {
    s = separator;
  }

  return name
    .toLowerCase()
    .replace(/ü/g, "ue")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ß/g, "ss")
    .replace(new RegExp("[" + p.join("") + "]", "g"), " ") //  replace preserved characters with spaces
    .replace(/-{2,}/g, " ") //  remove duplicate spaces
    .replace(/^\s\s*/, "")
    .replace(/\s\s*$/, "") //  trim both sides of string
    .replace(/[^\w\ ]/gi, "") //  replaces all non-alphanumeric with empty string
    .replace(/[\ ]/gi, s); //  Convert spaces to dashes
};

export function getVariantRule(attr: string) {
  if (!supportedAttrForVariants.includes(attr)) {
    throw new Error(`Unsupported attribute for variants: ${attr}`);
  }

  return {
    if: {
      properties: {
        variation: {
          contains: {
            const: attr,
          },
        },
      },
    },
    then: {
      properties: {
        size: {
          maxItems: 5, //TODO: Make this configurable
        },
      },
    },
    else: {
      properties: {
        size: {
          maxItems: 1,
        },
      },
    },
  };
}

const alphabet: string =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const idGen = customAlphabet(alphabet, 16);

export async function seedOptions(tx: any) {
  let data: Prisma.VariantOptionCreateManyInput[] = [];
  let relationData: Prisma.VariantOptionOnSubCategoryCreateManyInput[] = [];

  // Handle Size
  for (let attr of Object.keys(sizeDefaults)) {
    //@ts-ignore
    const seedData = sizeDefaults[attr];
    const tempData: Prisma.VariantOptionCreateManyInput[] = [];
    for (let gender in seedData) {
      const [{ next_id: id }] = await tx.$queryRaw<{ next_id: bigint }[]>`
  SELECT public.next_id() as next_id`;
      // console.log(seedData[gender]);
      tempData.push({
        id: id,
        name: seedData[gender].displayName,
        brand: seedData[gender].brand,
        gender: seedData[gender].gender,
        attributeName: attr,
        values: seedData[gender].values.map((v: any) => ({
          ...v,
          id: customAlphabet(alphabet, 10),
        })),
      });
    }

    const tempRelationData: Prisma.VariantOptionOnSubCategoryCreateManyInput[] =
      tempData.reduce((acc, item) => {
        const optionId = item.id;
        const relatedVariants = uskSizeToPtypeMap[attr].map(
          (ptype: string) => ({
            typeName: ptype,
            variantOptionId: optionId,
          })
        );

        acc = acc.concat(relatedVariants);
        return acc;
      }, []);

    data = data.concat(tempData);
    relationData = relationData.concat(tempRelationData);
  }

  // Handle Color
  const [{ next_id: colorOptionId }] = await tx.$queryRaw<
    { next_id: bigint }[]
  >`
  SELECT public.next_id() as next_id`;

  data.push({
    id: colorOptionId,
    name: colorDefaults.displayName,
    brand: colorDefaults.brand,
    gender: colorDefaults.gender,
    attributeName: colorDefaults.attributeName,
    //@ts-ignore
    values: colorDefaults.values.map((v) => ({
      ...v,
      id: customAlphabet(alphabet, 10),
    })),
  });

  const ptypesWithColor = await tx.subCategory.findMany({
    where: {
      attributes: {
        has: colorDefaults.attributeName,
      },
    },
    select: {
      name: true,
    },
  });

  const colorRelationData: Prisma.VariantOptionOnSubCategoryCreateManyInput[] =
    //@ts-ignore
    ptypesWithColor.map(({ name }) => ({
      typeName: name,
      variantOptionId: colorOptionId,
    }));

  return {
    variantOption: data,
    relationData: [...relationData, ...colorRelationData],
  };
}
