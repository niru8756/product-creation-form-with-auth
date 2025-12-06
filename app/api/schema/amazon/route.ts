import { handleApiError } from "@/lib/api/error-handler";
import { getAuthUser, requireAuth } from "@/lib/api/middleware";
import { unauthorizedResponse } from "@/lib/api/response";
import { env } from "@/lib/env";
import { SecretManagerService } from "@/lib/secret-manager";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const refreshToken = async (
  storeId: string,
  refresh_token: string,
  secretManager: SecretManagerService
) => {
  try {
    const queryString = `grant_type=refresh_token&refresh_token=${refresh_token}&client_id=${env.AMAZON_LWA_CLIENT_ID}&client_secret=${env.AMAZON_LWA_CLIENT_SECRET}`;

    const response = await axios.post(
      `https://api.amazon.com/auth/o2/token`,
      queryString,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const data: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      token_type: string;
    } = response.data;

    const res = await secretManager.update(`amazon-oauth-tokens/${storeId}`, {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: data.token_type,
      expiry: new Date(Date.now() + data.expires_in * 1000).getTime(),
    });

    if (!res.success) {
      throw new Error("Failed to refresh OAuth tokens");
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expiry: data.expires_in,
      token_type: data.token_type,
    };
  } catch (error) {
    throw error;
  }
};

const getActiveSecret = async () => {
  const secretManager = new SecretManagerService({
    url: env.VAULT_URL,
    secretKey: env.VAULT_SECRET_KEY,
  });
  const vault = await secretManager.findOne(
    `amazon-oauth-tokens/${env.UNISOUK_STORE_ID}`
  );
  let data: {
    access_token: string;
    refresh_token: string;
    expiry: number;
    token_type: string;
  } = vault.data.data.data;

  if (data.expiry <= Date.now()) {
    const response = await refreshToken(
      env.UNISOUK_STORE_ID,
      data.refresh_token,
      secretManager
    );
    data = response;
  }
  return data;
};

const AmzGetProductTypeDefinition = async (
  productType: string,
  marketPlaceId: string,
  accessToken: string
) => {
  const queryString = `definitions/2020-09-01/productTypes/${productType}?marketplaceIds=${marketPlaceId}`;

  try {
    const { data } = await axios.get(
      `${env.AMAZON_SP_API_URL}/${queryString}`,
      {
        headers: {
          "content-type": "application/json",
          "x-amz-access-token": accessToken,
        },
      }
    );

    return data;
  } catch (error: any) {
    throw new Error(
      `Failed to get product type definition for ${productType}: ${error?.message}`
    );
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

    const secret = await getActiveSecret();
    const result = await AmzGetProductTypeDefinition(
      type,
      env.AMAZON_MARKETPLACE_ID,
      secret.access_token
    );
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
