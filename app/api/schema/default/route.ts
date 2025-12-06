import { handleApiError } from "@/lib/api/error-handler";
import { getAuthUser, requireAuth } from "@/lib/api/middleware";
import { getVariantRule } from "@/lib/api/misc";
import { unauthorizedResponse } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";
import { VariantAttributeType } from "@/types/api";
import { ptypeToUskSizeMap } from "@/types/constant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAuth(request);
    if (authError) return unauthorizedResponse();

    const user = await getAuthUser(request);
    if (!user || !user.id) {
      return unauthorizedResponse();
    }
    const ptype = request.nextUrl.searchParams.get("type");
    if (!ptype) {
      return Response.json(
        { error: "Query param 'type' is required" },
        { status: 400 }
      );
    }
    const gender = request.nextUrl.searchParams.get("gender");
    const brand = request.nextUrl.searchParams.get("brand");

    const brandValue = brand ? brand : "default";
    const genderValues = gender ? [gender, "N/A"] : ["N/A"];

    const subCategory = await prisma.subCategory.findFirst({
      where: {
        name: ptype,
        storeId: null,
      },
      select: {
        attributes: true,
        active: true,
        id: true,
      },
    });

    if (!subCategory) {
      throw new Error("Sub Category not found");
    }

    if (!subCategory.active) {
      throw new Error("Sub Category is inactive");
    }

    const attributes = subCategory.attributes as VariantAttributeType[];

    const allOf = attributes.reduce((acc: any[], attr) => {
      acc.push(getVariantRule(attr));
      return acc;
    }, []);

    const res = (
      await prisma.variantOptionOnSubCategory.findMany({
        //@ts-ignore
        relationLoadStrategy: "join",
        where: {
          typeName: ptype,
          storeId: null,
          variantOption: {
            storeId: null,
            brand: brandValue,
            gender: {
              in: genderValues,
            },
            attributeName: {
              in: attributes.map((attr) => {
                if (attr === "size") {
                  return ptypeToUskSizeMap[ptype] || "size";
                }

                return attr;
              }),
            },
          },
        },
        select: {
          variantOption: true,
        },
      })
    ).reduce((acc: any[], { variantOption }) => {
      acc.push(variantOption);
      return acc;
    }, []);

    const schema = {
      $id: subCategory.id,
      $comment: `UniSouk product variant type definition for ${ptype} sub category`,
      type: "object",
      required: ["variation", ...attributes],
    };

    const variationProp = {
      title: "Variation",
      description: "Variation of the product",
      minItems: 0,
      maxItems: 2,
      type: "array",
      items: {
        type: "string",
        enum: attributes,
        enumNames: attributes.map(
          (attr) => attr.charAt(0).toUpperCase() + attr.slice(1)
        ),
      },
    };

    const otherProps = attributes.reduce((acc: any, attr) => {
      const conversion = ptypeToUskSizeMap[ptype];

      if (conversion && attr === "size") {
        const attribute = res.filter(
          (variant) => variant.attributeName === conversion
        )[0];

        const values = [];

        if (attribute && attribute.values.length > 0) {
          values.push(...attribute.values);
        } else {
          //TODO: Think of a way to handle size options without size attribute values being present in DB.
          throw new Error("No size options found for sub category");
        }

        acc[attr] = {
          title: attribute.name,
          description: `${conversion} for ${attribute.gender}`,
          type: "array",
          minItems: 1,
          items: {
            type: "string",
            enum: values.map((value) => ({
              ...value,
            })),
            enumNames: values.map((value) => value.displayName),
          },
        };
      } else {
        switch (attr) {
          case "size": {
            const attribute = res.filter(
              (variant) => variant.attributeName === attr
            )[0];

            const oneOf: any[] = [
              {
                type: "object",
                required: ["displayName", "value"],
                properties: {
                  displayName: {
                    title: "Size Display Name",
                    description: "",
                    hidden: true,
                    type: "string",
                  },
                  value: {
                    title: "Size Value",
                    description: "",
                    type: "string",
                  },
                },
                additionalProperties: false,
              },
            ];

            if (attribute && attribute.values.length > 0) {
              oneOf.push({
                type: "string",
                enum: attribute.values,
                enumNames: attribute.values.map(
                  (value: any) => value.displayName
                ),
              });
            } else {
              oneOf.push({
                type: "string",
                enum: [],
                enumNames: [],
              });
            }

            acc[attr] = {
              title: "Size",
              description: "Provide the size of the item",
              type: "array",
              minItems: 1,
              items: {
                type: "string",
                oneOf: oneOf,
              },
            };
            break;
          }
          case "color": {
            const attribute = res.filter(
              (variant) => variant.attributeName === attr
            )[0];

            const oneOf: any[] = [
              {
                type: "object",
                required: ["displayName", "value", "hexCode"],
                properties: {
                  displayName: {
                    title: "Color Display Name",
                    description: "",
                    hidden: true,
                    type: "string",
                  },
                  value: {
                    title: "Color",
                    description: "",
                    type: "string",
                  },
                  hexCode: {
                    title: "Hexadecimal Code",
                    description: "",
                    type: "string",
                    // pattern: '^#(?:[0-9a-fA-F]{3}){1,2}$', //TODO: Check this pattern with actual regex
                  },
                },
                additionalProperties: false,
              },
            ];

            if (attribute && attribute.values.length > 0) {
              oneOf.push({
                type: "string",
                enum: attribute.values,
                enumNames: attribute.values.map(
                  (value: any) => value.displayName
                ),
              });
            } else {
              oneOf.push({
                type: "string",
                enum: [],
                enumNames: [],
              });
            }

            acc[attr] = {
              title: "Color",
              description: "Provide the color of the item",
              type: "array",
              minItems: 1,
              items: {
                type: "string",
                oneOf: oneOf,
              },
            };
            break;
          }
          case "flavor": {
            const attribute = res.filter(
              (variant) => variant.attributeName === attr
            )[0];

            const oneOf: any[] = [
              {
                type: "object",
                required: ["displayName", "value"],
                properties: {
                  displayName: {
                    title: "Flavor Display Name",
                    description: "",
                    hidden: true,
                    type: "string",
                  },
                  value: {
                    title: "Flavor",
                    description: "",
                    type: "string",
                  },
                },
              },
            ];

            if (attribute && attribute.values.length > 0) {
              oneOf.push({
                type: "string",
                enum: attribute.values,
                enumNames: attribute.values.map(
                  (value: any) => value.displayName
                ),
              });
            } else {
              oneOf.push({
                type: "string",
                enum: [],
                enumNames: [],
              });
            }

            acc[attr] = {
              title: "Flavor",
              description: "Provide the flavor of the item",
              type: "array",
              minItems: 1,
              items: {
                type: "string",
                oneOf: oneOf,
              },
            };

            break;
          }
          case "numberOfItems": {
            const attribute = res.filter(
              (variant) => variant.attributeName === attr
            )[0];

            const oneOf: any[] = [
              {
                type: "object",
                required: ["displayName", "value"],
                properties: {
                  displayName: {
                    title: "Number of Items Display Name",
                    description: "",
                    hidden: true,
                    type: "string",
                  },
                  value: {
                    title: "Number of Items",
                    description: "",
                    type: "string",
                  },
                },
              },
            ];

            if (attribute && attribute.values.length > 0) {
              oneOf.push({
                type: "string",
                enum: attribute.values,
                enumNames: attribute.values.map(
                  (value: any) => value.displayName
                ),
              });
            } else {
              oneOf.push({
                type: "string",
                enum: [],
                enumNames: [],
              });
            }

            acc[attr] = {
              title: "Number of Items",
              description: "Provide the Number of items",
              type: "array",
              minItems: 1,
              items: {
                type: "string",
                oneOf: oneOf,
              },
            };
            break;
          }
          case "itemWeight": {
            const attribute = res.filter(
              (variant) => variant.attributeName === attr
            )[0];

            const oneOf: any[] = [
              {
                type: "object",
                required: ["displayName", "value", "unit"],
                properties: {
                  displayName: {
                    title: "Item Weight Display Name",
                    description: "",
                    hidden: true,
                    type: "string",
                  },
                  value: {
                    title: "Item Weight Value",
                    description: "",
                    type: "string",
                  },
                  unit: {
                    title: "Unit of Measurement",
                    description: "",
                    type: "string",
                    enum: ["kg", "g", "lb"],
                    enumNames: ["Kilograms", "Grams", "Pounds"],
                  },
                },
              },
            ];

            if (attribute && attribute.values.length > 0) {
              oneOf.push({
                type: "string",
                enum: attribute.values,
                enumNames: attribute.values.map(
                  (value: any) => value.displayName
                ),
              });
            } else {
              oneOf.push({
                type: "string",
                enum: [],
                enumNames: [],
              });
            }

            acc[attr] = {
              title: "Item Weight",
              description: "Provide the weight of the item",
              type: "array",
              minItems: 1,
              items: {
                type: "string",
                oneOf: oneOf,
              },
            };
            break;
          }
          case "scent": {
            const attribute = res.filter(
              (variant) => variant.attributeName === attr
            )[0];

            const oneOf: any[] = [
              {
                type: "object",
                required: ["displayName", "value"],
                properties: {
                  displayName: {
                    title: "Scent Display Name",
                    description: "",
                    hidden: true,
                    type: "string",
                  },
                  value: {
                    title: "Scent Value",
                    description: "",
                    type: "string",
                  },
                },
              },
            ];

            if (attribute && attribute.values.length > 0) {
              oneOf.push({
                type: "string",
                enum: attribute.values,
                enumNames: attribute.values.map(
                  (value: any) => value.displayName
                ),
              });
            } else {
              oneOf.push({
                type: "string",
                enum: [],
                enumNames: [],
              });
            }

            acc[attr] = {
              title: "Scent",
              description: "Provide the scent of the item",
              type: "array",
              minItems: 1,
              items: {
                type: "string",
                oneOf: oneOf,
              },
            };
            break;
          }
          default: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _exhaustiveCheck: never = attr;
            break;
          }
        }
      }

      return acc;
    }, {});

    return NextResponse.json({
      ...schema,
      properties: {
        variation: variationProp,
        ...otherProps,
      },
      allOf: allOf,
      additionalProperties: false,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
