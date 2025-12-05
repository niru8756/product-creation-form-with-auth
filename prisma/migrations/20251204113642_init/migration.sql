-- CreateEnum
CREATE TYPE "channel_type" AS ENUM ('DEFAULT', 'ONDC', 'FLIPKART', 'AMAZON_IN', 'WOOCOMMERCE', 'WIX', 'SHOPIFY');

-- CreateEnum
CREATE TYPE "logistics_provider_type" AS ENUM ('SHIPROCKET');

-- CreateEnum
CREATE TYPE "payment_gateway_provider_type" AS ENUM ('RAZORPAY', 'CASHFREE');

-- CreateEnum
CREATE TYPE "status" AS ENUM ('ENABLED', 'DISABLED');

-- CreateEnum
CREATE TYPE "store_status" AS ENUM ('ACTIVE', 'DELETED', 'SUSPENDED', 'BANNED');

-- CreateEnum
CREATE TYPE "product_status" AS ENUM ('DRAFT', 'ACTIVE', 'DELETED');

-- CreateEnum
CREATE TYPE "asset_type" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "inventory_strategy_type" AS ENUM ('UNIFIED', 'SPLIT');

-- CreateEnum
CREATE TYPE "price_strategy_type" AS ENUM ('UNIFIED', 'SPLIT');

-- CreateEnum
CREATE TYPE "ondc_order_status" AS ENUM ('CREATED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "amazon_order_status" AS ENUM ('PENDING', 'UNSHIPPED', 'WAITING_FOR_PICKUP', 'PICKED_UP', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "flipkart_order_status" AS ENUM ('APPROVED', 'PACKING_IN_PROGRESS', 'PACKED', 'READY_TO_DISPATCH', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_CREATED', 'RETURN_COMPLETED', 'RETURN_CANCELLED');

-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED');

-- CreateEnum
CREATE TYPE "fulfillment_status" AS ENUM ('PENDING', 'PACKING', 'READY_TO_DISPATCH', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURN_INITIATED', 'RETURN_APPROVED', 'RETURN_REJECTED', 'RETURN_PICKED_UP', 'RETURN_DELIVERED');

-- CreateEnum
CREATE TYPE "payment_method" AS ENUM ('COD', 'CVS', 'OTHER');

-- CreateEnum
CREATE TYPE "admin_report_status" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "external_product_id_type" AS ENUM ('EAN', 'UPC', 'GTIN', 'ISBN');

-- CreateEnum
CREATE TYPE "inventory_transaction_type" AS ENUM ('ADD', 'REMOVE', 'ALLOCATION', 'SALE', 'CANCELLATION', 'RELEASE');

-- CreateEnum
CREATE TYPE "channel_status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "User" (
    "id" BIGINT NOT NULL DEFAULT public.next_id(),
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" BIGINT NOT NULL DEFAULT public.next_id(),
    "token" TEXT NOT NULL,
    "userId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_channel_provider" (
    "id" BIGINT NOT NULL DEFAULT public.next_id(),
    "token" "channel_type" NOT NULL,
    "name" TEXT NOT NULL,
    "short_desc" TEXT NOT NULL,
    "long_desc" TEXT NOT NULL,
    "logo_uri" TEXT NOT NULL,
    "info_url" TEXT NOT NULL,
    "integration_url" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_channel_provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logistics_provider" (
    "id" BIGINT NOT NULL DEFAULT public.next_id(),
    "token" "logistics_provider_type" NOT NULL,
    "name" TEXT NOT NULL,
    "short_desc" TEXT NOT NULL,
    "long_desc" TEXT NOT NULL,
    "logo_uri" TEXT NOT NULL,
    "info_url" TEXT NOT NULL,
    "integration_url" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logistics_provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_gateway_provider" (
    "id" BIGINT NOT NULL DEFAULT public.next_id(),
    "token" "payment_gateway_provider_type" NOT NULL,
    "name" TEXT NOT NULL,
    "short_desc" TEXT NOT NULL,
    "long_desc" TEXT NOT NULL,
    "logo_uri" TEXT NOT NULL,
    "info_url" TEXT NOT NULL,
    "integration_url" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_gateway_provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" BIGINT NOT NULL DEFAULT public.next_id(),
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "store_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_category" (
    "id" BIGINT NOT NULL DEFAULT public.next_id(),
    "name" TEXT NOT NULL,
    "category_id" BIGINT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "store_id" BIGINT,
    "metadata" JSONB NOT NULL,
    "attributes" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variant_option_on_sub_category" (
    "id" BIGINT NOT NULL DEFAULT public.next_id(),
    "type_name" TEXT NOT NULL,
    "variant_option_id" BIGINT NOT NULL,
    "store_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "variant_option_on_sub_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variant_option" (
    "id" BIGINT NOT NULL DEFAULT public.next_id(),
    "store_id" BIGINT,
    "name" TEXT NOT NULL,
    "attribute_name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "values" JSONB NOT NULL,
    "editable" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "variant_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_setting" (
    "id" BIGINT NOT NULL DEFAULT public.next_id(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "status" "store_status" NOT NULL DEFAULT 'ACTIVE',
    "image" TEXT,
    "billing_address" JSONB,
    "pickup_address" JSONB,
    "inventory_strategy" "inventory_strategy_type" NOT NULL DEFAULT 'UNIFIED',
    "price_strategy" "price_strategy_type" NOT NULL DEFAULT 'UNIFIED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "enabled_channels" "channel_type"[],
    "selected_sales_channels" "channel_type"[],
    "enabled_payment_gateways" "payment_gateway_provider_type"[],
    "enabled_logistics_providers" "logistics_provider_type"[],
    "metadata" JSONB,

    CONSTRAINT "store_setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset" (
    "store_id" BIGINT NOT NULL,
    "product_id" BIGINT,
    "variant_id" BIGINT,
    "id" BIGINT NOT NULL DEFAULT public.next_id(),
    "type" "asset_type" NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "uri" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "store_id" BIGINT NOT NULL,
    "id" BIGINT NOT NULL DEFAULT public.next_id(),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "product_status" NOT NULL DEFAULT 'DRAFT',
    "hsn_code" TEXT NOT NULL,
    "sub_category_id" BIGINT NOT NULL,
    "category_id" BIGINT NOT NULL,
    "inventory_strategy" "inventory_strategy_type" DEFAULT 'UNIFIED',
    "price_strategy" "price_strategy_type" DEFAULT 'UNIFIED',
    "variation_attribute" TEXT[],
    "brand_name" TEXT NOT NULL,
    "product_measurement" JSONB NOT NULL,
    "manufacturing_info" JSONB NOT NULL,
    "origin_country" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variant" (
    "id" BIGINT NOT NULL DEFAULT public.next_id(),
    "store_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "sku" TEXT NOT NULL,
    "option" JSONB NOT NULL,
    "extraData" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "channels" "channel_type"[],

    CONSTRAINT "variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_product_identifier" (
    "id" BIGINT NOT NULL DEFAULT public.next_id(),
    "variant_id" BIGINT NOT NULL,
    "store_id" BIGINT NOT NULL,
    "type" "external_product_id_type" NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "external_product_identifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item" (
    "order_id" BIGINT NOT NULL,
    "store_id" BIGINT NOT NULL,
    "variant_id" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "order_item_pkey" PRIMARY KEY ("order_id","variant_id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" BIGINT NOT NULL DEFAULT public.next_id(),
    "store_id" BIGINT NOT NULL,
    "customer_id" BIGINT,
    "channel_type" "channel_type" NOT NULL,
    "status" "order_status" NOT NULL DEFAULT 'PENDING',
    "fulfillment_status" "fulfillment_status" NOT NULL DEFAULT 'PENDING',
    "purchase_date" TIMESTAMP(3) NOT NULL,
    "payment_method" "payment_method" NOT NULL,
    "payment_detail" JSONB NOT NULL,
    "buyer_info" JSONB NOT NULL,
    "shipping_detail" JSONB NOT NULL,
    "address" JSONB NOT NULL,
    "package_measurement" JSONB NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "external_order_id" TEXT NOT NULL,
    "external_order_status" TEXT NOT NULL,
    "extra_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_item" (
    "cart_id" BIGINT NOT NULL,
    "store_id" BIGINT NOT NULL,
    "variant_id" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "cart_item_pkey" PRIMARY KEY ("cart_id","variant_id")
);

-- CreateTable
CREATE TABLE "cart" (
    "id" BIGINT NOT NULL DEFAULT public.next_id(),
    "store_id" BIGINT NOT NULL,
    "customer_id" BIGINT NOT NULL,
    "total_amount" INTEGER NOT NULL,

    CONSTRAINT "cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zoho_account" (
    "id" BIGINT NOT NULL DEFAULT public.next_id(),
    "store_id" BIGINT NOT NULL,
    "account_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zoho_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZohoContact" (
    "id" BIGINT NOT NULL DEFAULT public.next_id(),
    "zoho_connect_id" BIGINT NOT NULL,
    "zoho_contact_id" TEXT NOT NULL,
    "zoho_account_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,

    CONSTRAINT "ZohoContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" BIGINT NOT NULL DEFAULT public.next_id(),
    "store_id" BIGINT NOT NULL,
    "variant_id" BIGINT NOT NULL,
    "channel_type" "channel_type" NOT NULL,
    "channel_status" "channel_status" NOT NULL DEFAULT 'ACTIVE',
    "on_hand" INTEGER NOT NULL,
    "allocated" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_transaction" (
    "id" BIGINT NOT NULL DEFAULT public.next_id(),
    "store_id" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "type" "inventory_transaction_type" NOT NULL,
    "inventory_id" BIGINT NOT NULL,
    "metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price" (
    "id" BIGINT NOT NULL DEFAULT public.next_id(),
    "store_id" BIGINT NOT NULL,
    "variant_id" BIGINT NOT NULL,
    "channel_type" "channel_type" NOT NULL,
    "channel_status" "channel_status" NOT NULL DEFAULT 'ACTIVE',
    "mrp" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_update" (
    "id" BIGINT NOT NULL DEFAULT public.next_id(),
    "mrp" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "price_id" BIGINT NOT NULL,
    "store_id" BIGINT NOT NULL,
    "metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_update_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "sales_channel_provider_token_key" ON "sales_channel_provider"("token");

-- CreateIndex
CREATE UNIQUE INDEX "logistics_provider_token_key" ON "logistics_provider"("token");

-- CreateIndex
CREATE UNIQUE INDEX "payment_gateway_provider_token_key" ON "payment_gateway_provider"("token");

-- CreateIndex
CREATE UNIQUE INDEX "category_name_store_id_key" ON "category"("name", "store_id");

-- CreateIndex
CREATE UNIQUE INDEX "sub_category_name_store_id_key" ON "sub_category"("name", "store_id");

-- CreateIndex
CREATE UNIQUE INDEX "variant_option_on_sub_category_type_name_variant_option_id__key" ON "variant_option_on_sub_category"("type_name", "variant_option_id", "store_id");

-- CreateIndex
CREATE UNIQUE INDEX "variant_option_name_store_id_key" ON "variant_option"("name", "store_id");

-- CreateIndex
CREATE UNIQUE INDEX "variant_store_id_sku_key" ON "variant"("store_id", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "external_product_identifier_store_id_type_value_key" ON "external_product_identifier"("store_id", "type", "value");

-- CreateIndex
CREATE UNIQUE INDEX "order_store_id_channel_type_external_order_id_key" ON "order"("store_id", "channel_type", "external_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "cart_store_id_customer_id_key" ON "cart"("store_id", "customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "zoho_account_store_id_key" ON "zoho_account"("store_id");

-- CreateIndex
CREATE UNIQUE INDEX "ZohoContact_email_zoho_account_id_key" ON "ZohoContact"("email", "zoho_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_store_id_channel_type_variant_id_key" ON "inventory"("store_id", "channel_type", "variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "price_store_id_channel_type_variant_id_key" ON "price"("store_id", "channel_type", "variant_id");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_category" ADD CONSTRAINT "sub_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_option_on_sub_category" ADD CONSTRAINT "variant_option_on_sub_category_type_name_store_id_fkey" FOREIGN KEY ("type_name", "store_id") REFERENCES "sub_category"("name", "store_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_option_on_sub_category" ADD CONSTRAINT "variant_option_on_sub_category_variant_option_id_fkey" FOREIGN KEY ("variant_option_id") REFERENCES "variant_option"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset" ADD CONSTRAINT "asset_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset" ADD CONSTRAINT "asset_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant" ADD CONSTRAINT "variant_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_product_identifier" ADD CONSTRAINT "external_product_identifier_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZohoContact" ADD CONSTRAINT "ZohoContact_zoho_connect_id_fkey" FOREIGN KEY ("zoho_connect_id") REFERENCES "zoho_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transaction" ADD CONSTRAINT "inventory_transaction_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_update" ADD CONSTRAINT "price_update_price_id_fkey" FOREIGN KEY ("price_id") REFERENCES "price"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
