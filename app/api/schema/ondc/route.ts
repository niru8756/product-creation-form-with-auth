import { handleApiError } from "@/lib/api/error-handler";
import { getAuthUser, requireAuth } from "@/lib/api/middleware";
import { successResponse, unauthorizedResponse } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAuth(request);
    if (authError) return unauthorizedResponse();

    const user = await getAuthUser(request);
    if (!user || !user.id) {
      return unauthorizedResponse();
    }
    const type = request.nextUrl.searchParams.get("type");

    if (!type) {
      return Response.json(
        { error: "Query param 'type' is required" },
        { status: 400 }
      );
    }

    const categoryFields = await prisma.categoryAttribute.findUnique({
      where: {
        code: type,
      },
    });

    if (!categoryFields) {
      throw new Error("Category fields not found");
    }

    const enumValues = await prisma.categoryAttributeEnumValue.findMany({
      where: {
        code: {
          in: ["COMMON", type],
        },
        name: {
          in: categoryFields.enumProperties,
        },
      },
    });

    const schema: {
      title: string;
      description: string;
      type: string;
      required: string[];
      properties: {
        [key: string]: {
          title: string;
          type: string;
          description: string;
          enum?: string[];
          enumNames?: string[];
        };
      };
    } = {
      title: categoryFields.name,
      description: `JSON Schema for ${categoryFields.name}`,
      type: "object",
      required: categoryFields.required,
      properties: {},
    };

    for (const field of categoryFields.properties) {
      const title = field[0].toUpperCase() + field.slice(1);

      const fieldSchema: {
        title: string;
        type: string;
        parentKey: string;
        parentTitle: string;
        description: string;
        enum?: string[];
        examples: string[];
        enumNames?: string[];
        required: boolean;
      } = {
        title: title.replace("_", " "),
        type: "string",
        description: "Please provide the value for the field",
        parentKey: "attributes",
        parentTitle: "Product Attributes for ONDC",
        examples: [title.replace("_", " ")],
        required: categoryFields.required.includes(field),
      };

      if (categoryFields.enumProperties.includes(field)) {
        fieldSchema.enum = enumValues
          .filter((item) => item.name === field)
          .map((item) => item.values)
          .flat();
        fieldSchema.enumNames = fieldSchema.enum.map(
          (item: string) => item[0].toUpperCase() + item.slice(1)
        );
      }

      schema.properties[`attributes/${field}`] = fieldSchema;
    }

    return NextResponse.json(schema);
  } catch (error) {
    return handleApiError(error);
  }
}
