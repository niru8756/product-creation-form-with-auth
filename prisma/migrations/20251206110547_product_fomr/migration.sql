/*
  Warnings:

  - You are about to drop the `ZohoContact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cart` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cart_item` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_item` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `store_setting` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `zoho_account` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ZohoContact" DROP CONSTRAINT "ZohoContact_zoho_connect_id_fkey";

-- DropForeignKey
ALTER TABLE "cart_item" DROP CONSTRAINT "cart_item_cart_id_fkey";

-- DropForeignKey
ALTER TABLE "order_item" DROP CONSTRAINT "order_item_order_id_fkey";

-- AlterTable
ALTER TABLE "RefreshToken" ALTER COLUMN "id" SET DEFAULT public.next_id();

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT public.next_id();

-- AlterTable
ALTER TABLE "asset" ALTER COLUMN "id" SET DEFAULT public.next_id();

-- AlterTable
ALTER TABLE "category" ALTER COLUMN "id" SET DEFAULT public.next_id();

-- AlterTable
ALTER TABLE "external_product_identifier" ALTER COLUMN "id" SET DEFAULT public.next_id();

-- AlterTable
ALTER TABLE "inventory" ALTER COLUMN "id" SET DEFAULT public.next_id();

-- AlterTable
ALTER TABLE "inventory_transaction" ALTER COLUMN "id" SET DEFAULT public.next_id();

-- AlterTable
ALTER TABLE "logistics_provider" ALTER COLUMN "id" SET DEFAULT public.next_id();

-- AlterTable
ALTER TABLE "payment_gateway_provider" ALTER COLUMN "id" SET DEFAULT public.next_id();

-- AlterTable
ALTER TABLE "price" ALTER COLUMN "id" SET DEFAULT public.next_id();

-- AlterTable
ALTER TABLE "price_update" ALTER COLUMN "id" SET DEFAULT public.next_id();

-- AlterTable
ALTER TABLE "product" ALTER COLUMN "id" SET DEFAULT public.next_id();

-- AlterTable
ALTER TABLE "sales_channel_provider" ALTER COLUMN "id" SET DEFAULT public.next_id();

-- AlterTable
ALTER TABLE "sub_category" ALTER COLUMN "id" SET DEFAULT public.next_id();

-- AlterTable
ALTER TABLE "variant" ALTER COLUMN "id" SET DEFAULT public.next_id();

-- AlterTable
ALTER TABLE "variant_option" ALTER COLUMN "id" SET DEFAULT public.next_id();

-- AlterTable
ALTER TABLE "variant_option_on_sub_category" ALTER COLUMN "id" SET DEFAULT public.next_id();

-- DropTable
DROP TABLE "ZohoContact";

-- DropTable
DROP TABLE "cart";

-- DropTable
DROP TABLE "cart_item";

-- DropTable
DROP TABLE "order";

-- DropTable
DROP TABLE "order_item";

-- DropTable
DROP TABLE "store_setting";

-- DropTable
DROP TABLE "zoho_account";

-- CreateTable
CREATE TABLE "store" (
    "id" BIGINT NOT NULL DEFAULT public.next_id(),
    "userId" BIGINT NOT NULL,
    "enabled_channels" "channel_type"[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_attribute" (
    "id" BIGINT NOT NULL DEFAULT public.next_id(),
    "code" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "required" TEXT[],
    "properties" TEXT[],
    "enum_properties" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_attribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_attribute_enum_value" (
    "id" BIGINT NOT NULL DEFAULT public.next_id(),
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "values" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_attribute_enum_value_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "store_userId_key" ON "store"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "category_attribute_code_key" ON "category_attribute"("code");

-- CreateIndex
CREATE UNIQUE INDEX "category_attribute_enum_value_code_name_key" ON "category_attribute_enum_value"("code", "name");
