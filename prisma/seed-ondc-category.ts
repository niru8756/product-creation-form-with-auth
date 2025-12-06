import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
const prisma = new PrismaClient();

const RET12 = JSON.parse(fs.readFileSync("./data/RET12.json", "utf8"));
const RET13 = JSON.parse(fs.readFileSync("./data/RET13.json", "utf8"));
const RET16 = JSON.parse(fs.readFileSync("./data/RET16.json", "utf8"));

const RET10 = JSON.parse(fs.readFileSync("./data/RET10.json", "utf8"));
const RET14 = JSON.parse(fs.readFileSync("./data/RET14.json", "utf8"));
const RET15 = JSON.parse(fs.readFileSync("./data/RET15.json", "utf8"));
const RET18 = JSON.parse(fs.readFileSync("./data/RET18.json", "utf8"));

const enumValues: {
  [key: string]: string[];
} = JSON.parse(fs.readFileSync("./data/enum_values.json", "utf8"));

async function seedEnumValues() {
  const values: {
    code: string;
    name: string;
    values: string[];
  }[] = [];
  for (const [key, _values] of Object.entries(enumValues)) {
    const map = new Map();
    for (const value of _values) {
      const token = value.split("|")[0];
      const val = value.split("|")[1];
      if (map.has(token)) {
        map.get(token).push(val);
      } else {
        map.set(token, [val]);
      }
    }

    for (const token of map.keys()) {
      values.push({
        code: token,
        name: key,
        values: map.get(token),
      });
    }
  }

  await prisma.categoryAttributeEnumValue.createMany({
    data: values,
    skipDuplicates: true,
  });
}
async function main() {
  const values: {
    code: string;
    domain: string;
    name: string;
    required: string[];
    properties: string[];
    enumProperties: string[];
  }[] = [];

  for (const category of Object.keys(RET12)) {
    const categoryData = RET12[category];
    const value = {
      code: category,
      domain: "RET12",
      name: categoryData.category,
      required: categoryData.required,
      properties: categoryData.properties,
      enumProperties: categoryData.enum_properties,
    };
    values.push(value);
  }

  for (const category of Object.keys(RET13)) {
    const categoryData = RET13[category];
    const value = {
      code: category,
      domain: "RET13",
      name: categoryData.category,
      required: categoryData.required,
      properties: categoryData.properties,
      enumProperties: categoryData.enum_properties,
    };
    values.push(value);
  }

  for (const category of Object.keys(RET16)) {
    const categoryData = RET16[category];
    const value = {
      code: category,
      domain: "RET16",
      name: categoryData.category,
      required: categoryData.required,
      properties: categoryData.properties,
      enumProperties: categoryData.enum_properties,
    };
    values.push(value);
  }

  for (const category of Object.keys(RET10)) {
    const categoryData = RET10[category];
    const value = {
      code: category,
      domain: "RET10",
      name: categoryData.category,
      required: categoryData.required,
      properties: categoryData.properties,
      enumProperties: categoryData.enum_properties,
    };
    values.push(value);
  }

  for (const category of Object.keys(RET14)) {
    const categoryData = RET14[category];
    const value = {
      code: category,
      domain: "RET14",
      name: categoryData.category,
      required: categoryData.required,
      properties: categoryData.properties,
      enumProperties: categoryData.enum_properties,
    };
    values.push(value);
  }

  for (const category of Object.keys(RET15)) {
    const categoryData = RET15[category];
    const value = {
      code: category,
      domain: "RET15",
      name: categoryData.category,
      required: categoryData.required,
      properties: categoryData.properties,
      enumProperties: categoryData.enum_properties,
    };
    values.push(value);
  }

  for (const category of Object.keys(RET18)) {
    const categoryData = RET18[category];
    const value = {
      code: category,
      domain: "RET18",
      name: categoryData.category,
      required: categoryData.required,
      properties: categoryData.properties,
      enumProperties: categoryData.enum_properties,
    };
    values.push(value);
  }

  //   console.log(values);
  //   Create category fields
  await prisma.categoryAttribute.createMany({
    data: values,
    skipDuplicates: true,
  });
  await seedEnumValues();
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
