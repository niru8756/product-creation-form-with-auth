import {
  channelDataType,
  DataFileType,
  SingleProductType,
} from "@/type/product-type";
import { ColorVariationType, SizeValueType } from "@/type/variation-type";

type VariantOption = {
  option: {
    data: {
      [key: string]: {
        displayName: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: any;
      };
    };
  };
};

export interface VariationOption {
  label: string;
  value: string;
}

export interface FormattedOption {
  label: string;
  value: string | SizeValueType | ColorVariationType;
}

// type VariantReturnType = SizeValueType[] | ColorVariationType[];

export interface VariantData {
  id?: string;
  option: {
    data: {
      [key: string]: {
        value: SizeValueType | ColorVariationType;
        gender?: string;
        displayName: string;
      };
    };
    type: string;
  };
  channelData: ChannelData[];
  channels?: string[];
  assets: [];
  externalProductId: { type: string; value: string };
  variantId?: string;
}

// interface ConvertedProductData extends SingleProductType {}
type ConvertedProductData = SingleProductType;

interface ProductData {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  subCategoryId: string;
  originCountry: string;
  variants: VariantData[];
  inventoryStrategy?: string;
  inventory?: number;
  storeId?: string;
  assets?: DataFileType[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  // extraData: Record<string, any>;
  brandName?: string;
  manufacturingInfo?: {
    manufacturerOrPackerName: string;
    manufacturerOrPackerAddress: string;
    monthOfManufactureOrPacking: string;
  };
}

interface ChannelData {
  mrp: number;
  price: number;
  onHand?: number;
  channelType: string;
  quantity?: number;
}

const convertVariationDefaultValue = (
  variants: VariantOption[],
  tag: string,
): FormattedOption[] => {
  const options: FormattedOption[] = [];
  const setVAlue = new Set();

  variants.forEach((variant) => {
    const tagData = variant.option?.data?.[tag];
    if (!tagData) return;

    if (tag === "size" && Array.isArray(tagData.value)) {
      tagData.value.forEach((sizeVal: SizeValueType) => {
        if (sizeVal?.displayName && !setVAlue.has(sizeVal.displayName)) {
          setVAlue.add(sizeVal.displayName);
          options.push({
            label: sizeVal.displayName,
            value: sizeVal,
          });
        }
      });
    } else if (tagData.value) {
      const displayName = tagData.displayName || String(tagData.value);
      if (!setVAlue.has(tagData.value)) {
        setVAlue.add(tagData.value);
        options.push({
          label: displayName,
          value: tagData,
        });
      }
    }
  });

  return options;
};

// const convertVariantValues = (
//   varVal: VariantData[],
//   tag: "size" | "color",
// ): VariantReturnType => {
//   const variants: VariantReturnType = [];

//   varVal.forEach((val) => {
//     if (tag === "size") {
//       const sizeValues = val.option.data[tag].value;
//       if (Array.isArray(sizeValues)) {
//         sizeValues.forEach((sizeVal) => {
//           (variants as SizeValueType[]).push(sizeVal as SizeValueType);
//         });
//       }
//     } else {
//       (variants as ColorVariationType[]).push(
//         val.option.data[tag].value as ColorVariationType,
//       );
//     }
//   });
//   return variants;
// };

const channelInventoryData = (variants: VariantData[], channel: string) => {
  const channelData = variants[0]?.channelData.find(
    (data) => data.channelType === channel,
  );

  return {
    quantity: channelData?.onHand || 0,
    price: channelData?.price || 0,
  };
};

const channelDataConverter = (variants: VariantData[]): channelDataType[] => {
  return variants.flatMap((variant) =>
    variant.channelData.map((data) => ({
      channelType: data.channelType,
      price: data.price,
      quantity: data.onHand as number,
      mrp: data.mrp,
    })),
  );
};

const convertChannelData = (channels: string[]) => {
  return channels.map((channel) => {
    if (channel === "AMAZON_IN") {
      return "AMAZON";
    } else {
      return channel;
    }
  });
};

export function flattenNestedObject(
  obj: Record<string, any>,
  nestedKey: string,
) {
  const result = { ...obj };

  if (result[nestedKey] && typeof result[nestedKey] === "object") {
    Object.keys(result[nestedKey]).forEach((key) => {
      result[`${nestedKey}/${key}`] = result[nestedKey][key];
    });

    delete result[nestedKey];
  }

  return result;
}

export const singleProductDataConverter = (
  data: ProductData,
): ConvertedProductData => {
  const variants = data.variants ?? [];

  const firstVariant = variants[0];

    const totalOnHand = firstVariant?.channelData?.reduce(
      (sum, item) => sum + (item.onHand || 0),
      0,
    );

  const firstChannelData = firstVariant?.channelData?.[0] ?? ({} as ChannelData);

  const publishChannelData = convertChannelData(firstVariant?.channels ?? []);
  const sizeVariant = convertVariationDefaultValue(variants, "size");
  const colorVariant = convertVariationDefaultValue(variants, "color");

  const ondcInventoryData = channelInventoryData(variants, "ONDC");
  const defaultInventoryData = channelInventoryData(variants, "DEFAULT");
  const amazonInventoryData = channelInventoryData(variants, "AMAZON_IN");
  const wooCommerceInventoryData = channelInventoryData(
    variants,
    "WOOCOMMERCE",
  );
  const shopifyInventoryData = channelInventoryData(variants, "SHOPIFY");

    const wixInventoryData = channelInventoryData(variants, "WIX");
  const channelData = channelDataConverter(variants);

  const genderExtract = variants.reduce((acc, variant) => {
    return acc || variant.option?.data?.size?.gender || "";
  }, "");

  return {
    ...data,
    gender: genderExtract,
    type: firstVariant?.option?.type ?? "",
    discountedPrice: firstChannelData?.mrp ?? 0,
    productPrice: firstChannelData?.price ?? 0,
    sizeVariant,
    colorVariant,
    variation: [
      ...(sizeVariant.length > 1 ? [{ label: "Size", value: "size" }] : []),
      ...(colorVariant.length > 1 ? [{ label: "Color", value: "color" }] : []),
    ],
    inventory: totalOnHand ?? firstChannelData?.onHand ?? 0,
    heightDimensions: data.productMeasurement?.height ?? "",
    weightDimensions: data.productMeasurement?.weight ?? "",
    widthDimensions: data.productMeasurement?.width ?? "",
    lengthDimensions: data.productMeasurement?.length ?? "",
    publishChannel: publishChannelData,
    ondcInventoryData,
    defaultInventoryData,
    amazonInventoryData,
    wooCommerceInventoryData,
    shopifyInventoryData,
    wixInventoryData,
    channelData,
    eanNumber: firstVariant?.externalProductId?.value ?? "",
    variants: variants.map((variant) => ({
      id: variant.id,
      option: variant.option,
      channelData: variant.channelData.map((data) => ({
        channelType: data.channelType,
        price: data.price ?? 0,
        quantity: data.onHand ?? 0,
        mrp: data.mrp ?? 0,
      })),
      assets: variant.assets,
      externalProductId: variant.externalProductId,
    })),
  };
};
