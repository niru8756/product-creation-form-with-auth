import { handleApiError } from "@/lib/api/error-handler";
import { getAuthUser, requireAuth } from "@/lib/api/middleware";
import { successResponse, unauthorizedResponse } from "@/lib/api/response";
import TaxonomyCache from "@/lib/shopify-taxonomy";
import { NextRequest, NextResponse } from "next/server";

const transformJsonSchema = async (data: any) => {
  {
    const schema: any = {
      title: data.name,
      description: `JSON Schema for ${data.name}`,
      type: "object",
      required: [],
      properties: {},
    };

    for (const attr of data.attributes) {
      const propKey = `attributes/${attr.handle}`;
      const enumValues = attr.values.map((v: any) => v.name);
      const enumNames = attr.values.map((v: any) => v.name);

      //   schema.required.push(propKey); // add to required list

      schema.properties[propKey] = {
        title: attr.name,
        type: "string",
        description:
          attr.description || "Please provide the value for the field",
        parentKey: "attributes",
        parentTitle: "Product Attributes for Shopify",
        examples: [attr.name],
        required: false,
        enum: enumValues,
        enumNames: enumNames,
      };
    }

    return schema;
  }
};

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

    const taxonomyCache = TaxonomyCache.getInstance();
    const category = await taxonomyCache.getCategory(type);
    if (!category) {
      throw new Error("Category not found");
    }
    const responseSchema = await transformJsonSchema(category);
    return NextResponse.json(responseSchema);
  } catch (error) {
    return handleApiError(error);
  }
}
