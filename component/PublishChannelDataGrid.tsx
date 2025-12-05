import { Fragment, useCallback, useEffect, useState } from "react";
import SelectComp from "@/ui/SelectComp";
import SecondaryButton from "@/ui/SecondaryButton";
import InfoIcon from "@/assets/icons/InfoIcon";
import InputCheckbox from "@/ui/InputCheckbox";
import ChevronDownIcon from "@/assets/icons/ChevronDownIcon";
import TooltipComp from "@/ui/TooltipComp";
import { useProductStore } from "@/store/ProductStore";
import {
  ColorVariationType,
  DataItem,
  FlavorVariationType,
  ItemWeightVariationType,
  NumberOfItemsVariationType,
  ScentVariationType,
  VariantAsset,
  Variants,
} from "@/type/variation-type";
import useVariationStore from "@/store/VariationStore";
import ImageUploadSection from "./ImageUploadSection";
import { Dialog } from "@/components/ui/dialog";
import ImageListedModal from "@/ui/ImageListedModal";
import { DataFileType, ProductListErrorType } from "@/type/product-type";
import { cn } from "@/lib/utils";
import TrashIcon from "@/assets/icons/TrashIcon";
import PlusIcon from "@/assets/icons/PlusIcon";
import AddVarinatModal from "./AddVarinatModal";
import { productApi } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { PRODUCT_MAPPED_ARRRIBUTES } from "@/constant";
import Image from "next/image";

type InputErrorType = {
  quantity?: string;
  ondcPrice?: string;
  amazonPrice?: string;
  defaultPrice?: string;
  wooCommercePrice?: string;
  wooCommerceQuantity?: string;
  shopifyPrice?: string;
  shopifyQuantity?: string;
  wixPrice?: string;
  wixQuantity?: string;
  ondcQuantity?: string;
  amazonQuantity?: string;
  defaultQuantity?: string;
  assets?: string;
};

type AttributeKey =
  | "size"
  | "color"
  | "flavor"
  | "scent"
  | "numberOfItems"
  | "itemWeight";

type RowErrorsType = Record<number, InputErrorType>;

type RowPriceType = {
  ondcPrice?: number;
  defaultPrice: number;
  amazonPrice?: number;
  wooCommercePrice?: number;
  shopifyPrice?: number;
  wixPrice?: number;
  size: string;
  color: string;
};

type VariantAssetType = {
  assetId: string;
};

type ChannelQuantityType = {
  ondc?: number;
  default?: number;
  amazon?: number;
  wooCommerce?: number;
  shopify?: number;
  wix?: number;
};

type PublishChannelTableType = {
  channelList: string[];
  initialVariants?: Variants[];
};

export type RowAssetsMapType = {
  [key: number]: {
    assetData: DataFileType[];
    assets: AssetMapType[];
  };
};

type AssetMapType = {
  id: string;
  src: string;
  type: "IMAGE" | "VIDEO";
};

type ChannelDataType = {
  channelType:
    | "ONDC"
    | "DEFAULT"
    | "AMAZON_IN"
    | "WOOCOMMERCE"
    | "SHOPIFY"
    | "WIX";
  mrp: number;
  price: number;
  quantity: number;
};

function PublishChannelDataGrid({
  channelList,
  initialVariants,
}: PublishChannelTableType) {
  const [selectedGroupVariant, setSelectedGroupVariant] =
    useState<string>("Size");
  const [filterType, setFilterType] = useState<AttributeKey>("size");
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>({});
  const [rowId, setRowId] = useState<number | undefined>();
  const [rowPrices, setRowPrices] = useState<Record<number, RowPriceType>>({});
  const [data, setData] = useState<DataItem[]>([]);
  const [AddVarinatModalOpen, setAddVarinatModalOpen] = useState(false);

  const variantStore = useVariationStore();
  const {
    color,
    size,
    setColorVariationValue,
    setNumberOfItemsVariationValue,
    setSizeSchemaValue,
    setScentVariationValue,
    setItemWeightVaritionValue,
    setFlavorVariationValue,
    setVariation,
  } = useVariationStore();
  const productStore = useProductStore();
  const productPrice = productStore.productPrice;
  const isPriceSameAllChannel = productStore.isPriceSameAllChannel;
  const variants = variantStore.variants;
  const updatedVariants = variantStore.updatedVariants;
  const setUpdatedVariants = variantStore.setUpdatedVariants;
  const {
    discountedPrice,
    inventoryStrategy,
    productListError,
    setProductListError,
    setPublishChannel,
    variantHandle,
    productTypeName,
    gender
  } = useProductStore();
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<DataFileType[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [rowAssetsMap, setRowAssetsMap] = useState<RowAssetsMapType>({});
  const [rowChannelQuantities, setRowChannelQuantities] = useState<
    Record<number, ChannelQuantityType>
  >({});
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState<{
    id: number;
    assetData: DataFileType[];
  } | null>(null);
  const [rowErrors, setRowErrors] = useState<RowErrorsType>({});
  const [initialExpansionDone, setInitialExpansionDone] = useState(false);

  const variantFetch = async () => {
    const { data } = await productApi.get(
      `/option/schema?ptype=${productTypeName}&gender=${gender}`,
    );
    return data;
  };

  const { data: variantData } = useQuery({
    queryKey: ["variants", productTypeName, gender],
    queryFn: () => variantFetch(),
    enabled: Boolean(productTypeName),
  });

  // Add this effect to preserve quantities when price flag or EAN number changes
  useEffect(() => {
    // Only run if we already have data and quantities
    if (data.length > 0 && Object.keys(rowChannelQuantities).length > 0) {
      // Create a new quantities object based on current values
      const preservedQuantities = { ...rowChannelQuantities };

      // Update rowChannelQuantities with preserved values
      setRowChannelQuantities(preservedQuantities);

      // Also update the data array to preserve the main quantity values
      setData((prevData) =>
        prevData.map((item) => {
          // Preserve the existing quantity
          const existingQuantity = item.quantity || 0;
          return {
            ...item,
            quantity: existingQuantity,
          };
        }),
      );
    }
  }, [isPriceSameAllChannel, productPrice]);

  useEffect(() => {
    if (Object.keys(rowErrors).length == 0) {
      const errorPublishingChannel: ProductListErrorType = {
        channelPublishing: undefined,
      };
      setProductListError({ ...productListError, ...errorPublishingChannel });
      // delete productListError?.channelPublishing;
    } else {
      const errorPublishingChannel: ProductListErrorType = {
        channelPublishing: "Channel data is required",
      };
      setProductListError({ ...productListError, ...errorPublishingChannel });
    }
  }, [rowErrors]);

  const groupedData: Record<string, DataItem[]> = filterType
    ? data.reduce<Record<string, DataItem[]>>((acc, item) => {
        const key = String(item[filterType]);

        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {})
    : {};

  const validateInput = (
    itemId: number,
    field: keyof InputErrorType,
    value: number | undefined,
  ) => {
    setRowErrors((prev) => {
      const currentErrors = { ...prev };

      if (!currentErrors[itemId]) {
        currentErrors[itemId] = {};
      }

      // Check if value is empty, undefined, null, or zero
      if (value === undefined || value === null || value === 0) {
        currentErrors[itemId][field] = "This field is required";
      }
      // Check if value is greater than discountedPrice
      else if (
        typeof value === "number" &&
        typeof discountedPrice === "number" &&
        discountedPrice !== null &&
        value > discountedPrice
      ) {
        currentErrors[itemId][field] =
          "Value must be less than or equal to the discounted price";
      } else {
        // Clear error if valid
        delete currentErrors[itemId][field];

        // Remove the entire item entry if no errors left
        if (Object.keys(currentErrors[itemId]).length === 0) {
          delete currentErrors[itemId];
        }
      }

      return currentErrors;
    });

    // Update product list error state for form validation
    // const hasErrors = Object.keys(rowErrors).length > 0;
  };

  const transformInitialVariants = useCallback(() => {
    if (!initialVariants || initialVariants.length === 0) return [];

    return initialVariants.map((variant, index) => {
      // Extract size information
      const sizeValue = variant.option.data?.size;
      let size = "";
      if (sizeValue && Array.isArray(sizeValue.value)) {
        size = sizeValue.value[0].displayName || "";
      }

      // Extract color information
      const colorValue = variant.option.data?.color;
      const color = colorValue?.displayName || "";

      // Extract channel data
      let ondcPrice = 0;
      let defaultPrice = 0;
      let amazonPrice = 0;
      let ondcQuantity = 0;
      let defaultQuantity = 0;
      let amazonQuantity = 0;
      let wooCommerceQuantity = 0;
      let wooCommercePrice = 0;
      let shopifyPrice = 0;
      let shopifyQuantity = 0;
      let wixPrice = 0;
      let wixQuantity = 0;

      variant.channelData?.forEach((channel) => {
        if (channel.channelType === "ONDC") {
          ondcPrice = channel.price || 0;
          ondcQuantity = channel.quantity || 0;
        } else if (channel.channelType === "DEFAULT") {
          defaultPrice = channel.price || 0;
          defaultQuantity = channel.quantity || 0;
        } else if (channel.channelType === "AMAZON_IN") {
          amazonPrice = channel.price || 0;
          amazonQuantity = channel.quantity || 0;
        } else if (channel.channelType === "WOOCOMMERCE") {
          wooCommercePrice = channel.price || 0;
          wooCommerceQuantity = channel.quantity || 0;
        } else if (channel.channelType === "SHOPIFY") {
          shopifyPrice = channel.price || 0;
          shopifyQuantity = channel.quantity || 0;
        } else if (channel.channelType === "WIX") {
          wixPrice = channel.price || 0;
          wixQuantity = channel.quantity || 0;
        }
      });

      // Calculate total quantity based on inventory strategy
      const quantity =
        inventoryStrategy === "UNIFIED"
          ? Math.max(
              ondcQuantity,
              defaultQuantity,
              amazonQuantity,
              wooCommerceQuantity,
              shopifyQuantity,
              wixQuantity,
            ) * channelList.length
          : ondcQuantity +
            defaultQuantity +
            amazonQuantity +
            wooCommerceQuantity +
            shopifyQuantity +
            wixQuantity;

      // Check if variant has assets or variantAssets and extract assetIds
      let assetIds: string[] = [];

      if (variant.assets && variant.assets.length > 0) {
        // Use assets array
        assetIds = variant.assets.map((asset) => asset.id);
      } else if (variant.variantAssets && variant.variantAssets.length > 0) {
        // Use variantAssets array
        assetIds = variant.variantAssets.map((asset) => asset.assetId);
      }

      return {
        id: index + 1,
        size,
        color,
        ondcPrice,
        defaultPrice,
        amazonPrice,
        wooCommercePrice,
        shopifyPrice,
        wixPrice,
        quantity,
        variantIndex: index, // Store the original index for mapping back
        assetIds,
      } as DataItem;
    });
  }, [initialVariants, inventoryStrategy, channelList]);

  // Half quantity for unified inventory strategy
  const calculateHalfQuantity = (originalQuantity: number) => {
    return Math.ceil(originalQuantity / channelList.length);
  };

  // Initialize data from initial variants or from store
  useEffect(() => {
    if (initialVariants && initialVariants.length > 0 && !initialDataLoaded) {
      // Use initialVariants if available
      const transformedData = transformInitialVariants();
      setData(transformedData);

      // Initialize row prices
      const initialPrices: Record<number, RowPriceType> = {};
      // console.log(initialPrices);

      transformedData.forEach((item) => {
        initialPrices[item.id] = {
          ondcPrice: isPriceSameAllChannel
            ? (productPrice as number) || 0
            : item.ondcPrice || 0,
          defaultPrice: isPriceSameAllChannel
            ? (productPrice as number) || 0
            : item.defaultPrice || 0,
          amazonPrice: isPriceSameAllChannel
            ? (productPrice as number) || 0
            : item.amazonPrice || 0,
          wooCommercePrice: isPriceSameAllChannel
            ? (productPrice as number) || 0
            : item.wooCommercePrice || 0,
          shopifyPrice: isPriceSameAllChannel
            ? (productPrice as number) || 0
            : item.shopifyPrice || 0,
          wixPrice: isPriceSameAllChannel
            ? (productPrice as number) || 0
            : item.wixPrice || 0,
          size: item.size || "",
          color: item.color || "",
        };
      });
      setRowPrices(initialPrices);

      // Initialize row quantities
      const initialQuantities: Record<number, ChannelQuantityType> = {};
      transformedData.forEach((item) => {
        const variantIndex = item.variantIndex;
        if (variantIndex !== undefined && initialVariants[variantIndex]) {
          const variantItem = initialVariants[variantIndex];
          if (inventoryStrategy === "UNIFIED") {
            const halfQty = calculateHalfQuantity(item.quantity as number);
            initialQuantities[item.id] = {
              ondc: halfQty,
              default: halfQty,
              amazon: halfQty,
              wooCommerce: halfQty,
              shopify: halfQty,
              wix: halfQty,
            };
          } else {
            // For SPLIT, explicitly get from channel data
            const ondcChannel = variantItem.channelData?.find(
              (c) => c.channelType === "ONDC",
            );
            const defaultChannel = variantItem.channelData?.find(
              (c) => c.channelType === "DEFAULT",
            );
            const amazonChannel = variantItem.channelData?.find(
              (c) => c.channelType === "AMAZON",
            );

            const wooCommerceChannel = variantItem.channelData?.find(
              (c) => c.channelType === "WOOCOMMERCE",
            );
            const shopifyChannel = variantItem.channelData?.find(
              (c) => c.channelType === "SHOPIFY",
            );
            const wixChannel = variantItem.channelData?.find(
              (c) => c.channelType === "WIX",
            );

            initialQuantities[item.id] = {
              ondc: ondcChannel?.quantity || 0,
              default: defaultChannel?.quantity || 0,
              amazon: amazonChannel?.quantity || 0,
              wooCommerce: wooCommerceChannel?.quantity || 0,
              shopify: shopifyChannel?.quantity || 0,
              wix: wixChannel?.quantity || 0,
            };
          }
        }
      });
      setRowChannelQuantities(initialQuantities);

      // Initialize row assets map with actual URLs from initialVariants
      const initialAssetsMap: RowAssetsMapType = {};
      let firstRowWithAssets: number | null = null;
      let firstRowAssetData: DataFileType[] = [];

      transformedData.forEach((item) => {
        const variantItem = initialVariants[item.variantIndex as number];

        // Convert 'assets' to 'variantAssets' format while preserving the full asset info
        if (variantItem.assets && variantItem.assets.length > 0) {
          // Create asset data from the assets structure
          const assetData = variantItem.assets.map((asset: VariantAsset) => {
            return {
              id: asset.id,
              assetUrl: asset.assetUrl,
              fileType: asset.metadata?.mimeType?.includes("video")
                ? "VIDEO"
                : "IMAGE",
              metadata: asset.metadata || { mimeType: "image/jpeg" },
            };
          }) as unknown as DataFileType[];

          initialAssetsMap[item.id] = {
            assetData: assetData,
            assets: variantItem.assets.map((asset: VariantAsset) => ({
              id: asset.id,
              src: asset.assetUrl,
              type: asset.metadata?.mimeType?.includes("video")
                ? "VIDEO"
                : "IMAGE",
            })),
          };

          // Track the first row with assets
          if (firstRowWithAssets === null && assetData.length > 0) {
            firstRowWithAssets = item.id;
            firstRowAssetData = assetData;
          }
        } else {
          initialAssetsMap[item.id] = { assetData: [], assets: [] };
        }
      });
      setRowAssetsMap(initialAssetsMap);

      // Pre-initialize selectedRowData with the first row that has assets
      if (firstRowWithAssets !== null) {
        setSelectedRowId(firstRowWithAssets);
        setSelectedRowData({
          id: firstRowWithAssets,
          assetData: firstRowAssetData,
        });
        setAssets(firstRowAssetData);
      }

      // Convert initialVariants to use variantAssets format
      const formattedVariants = initialVariants.map((variant) => {
        // Deep copy the variant without the assets property
        const { assets, id, ...restVariant } = { ...variant };
        const newVariant = { ...restVariant };
        newVariant.variantId = id;

        // Convert assets array to variantAssets array if it exists
        if (assets && assets.length > 0) {
          newVariant.variantAssets = assets.map((asset) => ({
            assetId: asset.id,
          }));
        } else if (!newVariant.variantAssets) {
          newVariant.variantAssets = [];
        }

        // Ensure externalProductId is preserved
        if (variant.externalProductId) {
          newVariant.externalProductId = { ...variant.externalProductId };
        }

        return newVariant;
      });

      // Mark initialization as complete
      setInitialDataLoaded(true);

      // Set initial variants in the store with formatted assets

      setUpdatedVariants(formattedVariants);
    } else if (!initialDataLoaded) {
      const initialData = variantStore.channelPublishData();

      // If inventory strategy is unified, set half quantity for each item
      const modifiedData = initialData.map((item) => ({
        ...item,
        quantity:
          inventoryStrategy === "UNIFIED"
            ? calculateHalfQuantity(item.quantity as number)
            : item.quantity,
      }));

      setData(modifiedData);

      const initialPrices: Record<number, RowPriceType> = {};

      modifiedData.forEach((item) => {
        initialPrices[item.id] = {
          ondcPrice: isPriceSameAllChannel
            ? (productPrice as number) || 0
            : item.ondcPrice || 0,
          defaultPrice: isPriceSameAllChannel
            ? (productPrice as number) || 0
            : item.defaultPrice || 0,
          amazonPrice: isPriceSameAllChannel
            ? (productPrice as number) || 0
            : item.amazonPrice || (productPrice as number) || 0,
          wooCommercePrice: isPriceSameAllChannel
            ? (productPrice as number) || 0
            : item.wooCommercePrice || (productPrice as number) || 0,
          shopifyPrice: isPriceSameAllChannel
            ? (productPrice as number) || 0
            : item.shopifyPrice || (productPrice as number) || 0,
          wixPrice: isPriceSameAllChannel
            ? (productPrice as number) || 0
            : item.wixPrice || (productPrice as number) || 0,
          size: item.size || "",
          color: item.color || "",
        };
      });
      setRowPrices(initialPrices);

      validateAllInputs();

      // We'll initialize quantities in a separate effect to match original behavior
      // setInitialDataLoaded(true);
      setUpdatedVariants(variants);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialVariants,
    initialDataLoaded,
    transformInitialVariants,
    inventoryStrategy,
    variantStore.channelPublishData,
    variants,
    setUpdatedVariants,
    size,
    color,
  ]);

  // When using store data, set quantities based on data values
  useEffect(() => {
    if (
      !initialVariants &&
      data.length > 0 &&
      Object.keys(rowChannelQuantities).length === 0
    ) {
      const initialQuantities: Record<number, ChannelQuantityType> = {};
      data.forEach((item) => {
        if (inventoryStrategy === "UNIFIED") {
          const halfQty = calculateHalfQuantity(item.quantity as number);
          initialQuantities[item.id] = {
            ondc: halfQty,
            default: halfQty,
            amazon: halfQty,
            wooCommerce: halfQty,
            shopify: halfQty,
            wix: halfQty,
          };
        } else {
          initialQuantities[item.id] = {
            ondc: item.quantity,
            default: item.quantity,
            amazon: item.quantity,
            wooCommerce: item.quantity,
            shopify: item.quantity,
            wix: item.quantity,
          };
        }
      });
      setRowChannelQuantities(initialQuantities);
    }
  }, [data, inventoryStrategy, initialVariants, rowChannelQuantities]);

  useEffect(() => {
    if (selectedRowId) {
      variantChannelData(selectedRowId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowAssetsMap, selectedRowId]);

  // ============================== handle price individual rows ====================

  const handlePriceChange = (
    itemId: number,
    channel: "ondc" | "default" | "amazon" | "wooCommerce" | "shopify" | "wix",
    value: number,
  ): void => {
    const currentItem = data.find((item) => item.id === itemId);

    if (!currentItem) return;

    setRowPrices((prev: Record<number, RowPriceType>) => {
      const currentPrice = prev[itemId] || {
        ondcPrice: 0,
        defaultPrice: 0,
        amazonPrice: 0,
        wooCommercePrice: 0,
        shopifyPrice: 0,
        wixPrice: 0,
        size: currentItem.size,
        color: currentItem.color,
      };

      // Use a proper mapping to set the correct price field based on channel
      const priceField =
        channel === "ondc"
          ? "ondcPrice"
          : channel === "default"
            ? "defaultPrice"
            : channel === "wooCommerce"
              ? "wooCommercePrice"
              : channel === "shopify"
                ? "shopifyPrice"
                : channel === "wix"
                  ? "wixPrice"
                  : "amazonPrice";

      return {
        ...prev,
        [itemId]: {
          ...currentPrice,
          [priceField]: value,
        },
      };
    });

    setRowChannelQuantities((prev) => {
      const currentQuantities = prev[itemId] || {
        ondc:
          inventoryStrategy === "UNIFIED"
            ? calculateHalfQuantity(currentItem.quantity as number)
            : currentItem.quantity,

        default:
          inventoryStrategy === "UNIFIED"
            ? calculateHalfQuantity(currentItem.quantity as number)
            : currentItem.quantity,

        // Add amazon here too
        amazon:
          inventoryStrategy === "UNIFIED"
            ? calculateHalfQuantity(currentItem.quantity as number)
            : currentItem.quantity,

        // Add woocommerce here too
        wooCommerce:
          inventoryStrategy === "UNIFIED"
            ? calculateHalfQuantity(currentItem.quantity as number)
            : currentItem.quantity,

        // Add shopify here too
        shopify:
          inventoryStrategy === "UNIFIED"
            ? calculateHalfQuantity(currentItem.quantity as number)
            : currentItem.quantity,

        // Add wix here too
        wix:
          inventoryStrategy === "UNIFIED"
            ? calculateHalfQuantity(currentItem.quantity as number)
            : currentItem.quantity,
      };

      return {
        ...prev,
        [itemId]: currentQuantities,
      };
    });

    // Update validation for all channel types
    validateInput(
      itemId,
      channel === "ondc"
        ? "ondcPrice"
        : channel === "default"
          ? "defaultPrice"
          : channel === "wooCommerce"
            ? "wooCommercePrice"
            : channel === "shopify"
              ? "shopifyPrice"
              : channel === "wix"
                ? "wixPrice"
                : "amazonPrice",
      value,
    );

    setRowId(itemId);
  };

  // Add a handler for quantity changes
  // Update handleQuantityChange function to properly validate Amazon quantity
  const handleQuantityChange = (
    itemId: number,
    channel: "ondc" | "default" | "amazon" | "wooCommerce" | "shopify" | "wix",
    value: number,
  ) => {
    setRowChannelQuantities((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [channel]: value,
      },
    }));

    // Fix validation for quantity - change this part
    validateInput(
      itemId,
      channel === "ondc"
        ? "ondcQuantity"
        : channel === "default"
          ? "defaultQuantity"
          : channel === "wooCommerce"
            ? "wooCommerceQuantity"
            : channel === "shopify"
              ? "shopifyQuantity"
              : channel === "wix"
                ? "wixQuantity"
                : "amazonQuantity",
      value,
    );

    setRowId(itemId);
  };

  // Update the function that handles total quantity changes to include Amazon
  const handleTotalQuantityChange = (itemId: number, newValue: number) => {
    // Update the data array with new quantity
    setData((prevData) =>
      prevData.map((item) =>
        item.id === itemId ? { ...item, quantity: newValue } : item,
      ),
    );

    // If in unified inventory mode, split the quantity equally
    if (inventoryStrategy === "UNIFIED") {
      const halfQuantity = calculateHalfQuantity(newValue);
      setRowChannelQuantities((prev) => ({
        ...prev,
        [itemId]: {
          ondc: halfQuantity,
          default: halfQuantity,
          amazon: halfQuantity,
          wooCommerce: halfQuantity,
          shopify: halfQuantity,
          wix: halfQuantity,
        },
      }));
    }

    // Add validation for quantity
    validateInput(itemId, "quantity", newValue);

    // Set the rowId to trigger variant update
    setRowId(itemId);
  };

  // Add this effect to keep assets synchronized between state variables
  // Modify the existing effect to add more robust logging and handling
  useEffect(() => {
    if (selectedRowData && selectedRowId) {
      // Ensure currentAssets has a fallback
      const currentAssets = selectedRowData.assetData || [];

      setRowAssetsMap((prev) => {
        // Create a deep copy to avoid mutation
        const newMap = { ...prev };

        // Ensure the current row has an entry
        if (!newMap[selectedRowData.id]) {
          newMap[selectedRowData.id] = {
            assetData: [],
            assets: [],
          };
        }

        // Update the entry for the current row
        newMap[selectedRowData.id] = {
          assetData: currentAssets,
          assets: currentAssets.map((asset) => ({
            id: asset.id.toString(),
            src: asset.assetUrl || "",
            type: asset.fileType || "IMAGE",
          })),
        };

        return newMap;
      });

      // Always update assets state
      setAssets(currentAssets);
    } else {
    }
  }, [selectedRowData, selectedRowId]);

  // Modify handleRowImageClick to ensure proper synchronization
  const handleRowImageClick = (rowId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    // Get current row assets with fallbacks for empty values
    const currentRowData = rowAssetsMap[rowId] || { assetData: [], assets: [] };
    const assetData = currentRowData.assetData || [];

    // Update both selected row states
    setSelectedRowId(rowId);
    setSelectedRowData({
      id: rowId,
      assetData: assetData,
    });

    // Update shared assets state
    setAssets(assetData);

    // Open the modal
    setOpen(true);
  };

  // Modified onChange function to handle per-variant assets
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    // Ensure we have a selected row
    if (!selectedRowData) {
      return;
    }

    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files) as File[];

    // Get existing assets with fallback
    const existingAssets = selectedRowData.assetData || [];

    // Find the highest existing ID to ensure new IDs don't conflict
    const highestExistingId =
      existingAssets.length > 0
        ? Math.max(
            ...existingAssets.map((asset) =>
              typeof asset.id === "string"
                ? parseInt(asset.id)
                : Number(asset.id),
            ),
          )
        : 0;

    // Create new asset data with guaranteed unique IDs
    const newData = fileArray.map((file, index) => {
      const fileType = file.type.startsWith("image") ? "IMAGE" : "VIDEO";
      const url = URL.createObjectURL(file);
      // Ensure we start from the next available ID
      const newId = (highestExistingId + index + 1).toString();

      return {
        id: newId,
        assetUrl: url,
        file: file,
        fileType,
        metadata: {
          mimeType: file.type,
        },
      } as DataFileType;
    });

    // Combine existing and new assets
    const updatedAssetData = [...existingAssets, ...newData];

    // Update all states synchronously to ensure consistency

    // 1. Update selectedRowData first
    setSelectedRowData({
      id: selectedRowData.id,
      assetData: updatedAssetData,
    });

    // 2. Update rowAssetsMap
    setRowAssetsMap((prev) => {
      return {
        ...prev,
        [selectedRowData.id]: {
          assetData: updatedAssetData,
          assets: updatedAssetData.map((asset) => ({
            id: asset.id.toString(),
            src: asset.assetUrl || "",
            type: asset.fileType as "IMAGE" | "VIDEO",
          })),
        },
      };
    });

    // 3. Update assets state
    setAssets(updatedAssetData);

    // 4. Clear asset error for this row since assets are now added
    setRowErrors((prev) => {
      if (!prev[selectedRowData.id]) return prev;

      const updatedErrors = { ...prev };
      delete updatedErrors[selectedRowData.id].assets;

      // Remove the entire item entry if no errors left
      if (Object.keys(updatedErrors[selectedRowData.id]).length === 0) {
        delete updatedErrors[selectedRowData.id];
      }

      return updatedErrors;
    });

    // 5. Trigger variant update with slight delay to ensure state updates complete
    setTimeout(() => {
      setRowId(selectedRowData.id);
    }, 0);
  };

  // Render function for variant image
  const renderRowImage = (rowId: number) => {
    const rowAssets = rowAssetsMap[rowId]?.assetData || [];
    const hasError = !!rowErrors[rowId]?.assets;

    return (
      <div className="flex flex-col items-center">
        <div
          className={`!w-10 !h-10 flex justify-center items-center`}
          onClick={(e) => handleRowImageClick(rowId, e)}
        >
          {rowAssets.length > 0 && rowAssets[0].assetUrl ? (
            <div className="flex items-center justify-center w-10 h-10">
              <div className="relative w-full h-full rounded-lg overflow-hidden">
                <Image
                  src={rowAssets[0].assetUrl} // URL or local import
                  alt=""
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
          ) : (
            <ImageUploadSection
              hasError={hasError}
              disabled
              variant="extraSmall"
            />
          )}
        </div>
        {/* {hasError && <ErrorMessage message={rowErrors[rowId].assets} />} */}
      </div>
    );
  };

  //variantChannelData

  const variantChannelData = useCallback(
    (id: number) => {
      const currentItem = data.find((item) => item.id === id);
      if (!currentItem) return updatedVariants;

      // Make a deep copy to avoid mutation
      const updatedVariantsCopy = [...updatedVariants];

      // First, update the MRP in all variants' channel data
      updatedVariantsCopy.forEach((variant) => {
        if (variant.channelData && variant.channelData.length > 0) {
          variant.channelData = variant.channelData.map((channel) => ({
            ...channel,
            mrp: discountedPrice as number,
          }));
        }
      });

      // For initialVariants case
      if (initialVariants && initialVariants.length > 0) {
        // Find the current item's variant index if it exists
        const variantIndex =
          currentItem.variantIndex !== undefined
            ? currentItem.variantIndex
            : updatedVariantsCopy.findIndex((v) => {
                const vSizeValue = v.option.data?.size;
                let vSize = "";
                if (vSizeValue && Array.isArray(vSizeValue.value)) {
                  vSize = vSizeValue.value[0].displayName || "";
                }

                const vColorValue = v.option.data?.color;
                const vColor = vColorValue?.displayName || "";

                return (
                  vSize === currentItem.size && vColor === currentItem.color
                );
              });

        if (variantIndex !== -1) {
          const currentRowObj = rowPrices[id];
          // Build channel data list only for the current row
          const channelDataList: ChannelDataType[] = [];
          if (channelList.includes("ONDC")) {
            const priceToUse = isPriceSameAllChannel
              ? productPrice
              : currentRowObj?.ondcPrice;
            if (priceToUse !== undefined && priceToUse !== null) {
              channelDataList.push({
                channelType: "ONDC",
                mrp: discountedPrice as number,
                price: priceToUse as number,
                quantity: rowChannelQuantities[id]?.ondc ?? 0,
              });
            }
          }
          if (channelList.includes("DEFAULT")) {
            const priceToUse = isPriceSameAllChannel
              ? productPrice
              : currentRowObj?.defaultPrice;
            if (priceToUse !== undefined && priceToUse !== null) {
              channelDataList.push({
                channelType: "DEFAULT",
                mrp: discountedPrice as number,
                price: priceToUse as number,
                quantity: rowChannelQuantities[id]?.default ?? 0,
              });
            }
          }
          // Add Amazon channel data
          if (channelList.includes("AMAZON")) {
            const priceToUse = isPriceSameAllChannel
              ? productPrice
              : currentRowObj?.amazonPrice;
            if (priceToUse !== undefined && priceToUse !== null) {
              channelDataList.push({
                channelType: "AMAZON_IN",
                mrp: discountedPrice as number,
                price: priceToUse as number,
                quantity: rowChannelQuantities[id]?.amazon ?? 0,
              });
            }
          }

          // Add woo-commerce channel data
          if (channelList.includes("WOOCOMMERCE")) {
            const priceToUse = isPriceSameAllChannel
              ? productPrice
              : currentRowObj?.wooCommercePrice;
            if (priceToUse !== undefined && priceToUse !== null) {
              channelDataList.push({
                channelType: "WOOCOMMERCE", // You might need to define this channel type in your types
                mrp: discountedPrice as number,
                price: priceToUse as number,
                quantity: rowChannelQuantities[id]?.wooCommerce ?? 0,
              });
            }
          }

          // Add shopify channel data
          if (channelList.includes("SHOPIFY")) {
            const priceToUse = isPriceSameAllChannel
              ? productPrice
              : currentRowObj?.shopifyPrice;
            if (priceToUse !== undefined && priceToUse !== null) {
              channelDataList.push({
                channelType: "SHOPIFY", // You might need to define this channel type in your types
                mrp: discountedPrice as number,
                price: priceToUse as number,
                quantity: rowChannelQuantities[id]?.shopify ?? 0,
              });
            }
          }

          // Add wix channel data
          if (channelList.includes("WIX")) {
            const priceToUse = isPriceSameAllChannel
              ? productPrice
              : currentRowObj?.wixPrice;
            if (priceToUse !== undefined && priceToUse !== null) {
              channelDataList.push({
                channelType: "WIX", // You might need to define this channel type in your types
                mrp: discountedPrice as number,
                price: priceToUse as number,
                quantity: rowChannelQuantities[id]?.wix ?? 0,
              });
            }
          }

          // Handle variant assets for current row - convert to variantAssets format
          let variantAssets: VariantAssetType[] = [];
          const rowData = rowAssetsMap[id];
          if (rowData) {
            if (rowData.assets && rowData.assets.length > 0) {
              variantAssets = rowData.assets.map((asset) => ({
                assetId: asset.id,
              }));
            } else if (rowData.assetData && rowData.assetData.length > 0) {
              variantAssets = rowData.assetData.map((asset) => ({
                assetId: asset.id.toString(),
              }));
            }
          }

          // Get the original externalProductId if available
          const originalVariant = initialVariants[variantIndex];
          const externalProductId = originalVariant.externalProductId;

          // Update the specific variant at the index, preserving externalProductId
          updatedVariantsCopy[variantIndex] = {
            ...updatedVariantsCopy[variantIndex],
            channelData: channelDataList,
            variantAssets: variantAssets,
            externalProductId: externalProductId, // Preserve the externalProductId
          };
        }

        // Compare with existing variants to see if we need to update
        const variantsChanged =
          JSON.stringify(updatedVariantsCopy) !==
          JSON.stringify(updatedVariants);

        if (variantsChanged) {
          setUpdatedVariants(updatedVariantsCopy.filter(Boolean));
        }

        return updatedVariantsCopy.filter(Boolean);
      } else {
        // For non-initialVariants case (original implementation)
        const variantsOnDataTable = updatedVariantsCopy.map((variant) => {
          const sizeValue = variant.option.data?.size;
          let sizeName;
          if (sizeValue && Array.isArray(sizeValue.value)) {
            sizeName = sizeValue.value[0].displayName;
          }
          const colorName = variant.option.data?.color?.displayName;

          const currentRowObj = rowPrices[id];

          // Check if this is the current row we're updating
          const isCurrentRow =
            colorName === currentRowObj?.color &&
            sizeName === currentRowObj?.size;

          // Preserve the externalProductId regardless of whether it's the current row
          const externalProductId = variant.externalProductId;

          // If it's not the current row, return the variant with updated MRP only
          if (!isCurrentRow) {
            if (variant.channelData && variant.channelData.length > 0) {
              return {
                ...variant,
                channelData: variant.channelData.map((channel) => ({
                  ...channel,
                  mrp: discountedPrice as number,
                })),
                externalProductId, // Preserve the externalProductId
              };
            }
            return {
              ...variant,
              externalProductId, // Preserve the externalProductId
            };
          }

          // Build channel data list only for the current row
          const channelDataList: ChannelDataType[] = [];
          if (channelList.includes("ONDC")) {
            const priceToUse = isPriceSameAllChannel
              ? productPrice
              : currentRowObj?.ondcPrice;
            if (priceToUse !== undefined && priceToUse !== null) {
              channelDataList.push({
                channelType: "ONDC",
                mrp: discountedPrice as number,
                price: priceToUse as number,
                quantity: rowChannelQuantities[id]?.ondc ?? 0,
              });
            }
          }
          if (channelList.includes("DEFAULT")) {
            const priceToUse = isPriceSameAllChannel
              ? productPrice
              : currentRowObj?.defaultPrice;
            if (priceToUse !== undefined && priceToUse !== null) {
              channelDataList.push({
                channelType: "DEFAULT",
                mrp: discountedPrice as number,
                price: priceToUse as number,
                quantity: rowChannelQuantities[id]?.default ?? 0,
              });
            }
          }
          // Add Amazon channel data
          if (channelList.includes("AMAZON")) {
            const priceToUse = isPriceSameAllChannel
              ? productPrice
              : currentRowObj?.amazonPrice;
            if (priceToUse !== undefined && priceToUse !== null) {
              channelDataList.push({
                channelType: "AMAZON_IN",
                mrp: discountedPrice as number,
                price: priceToUse as number,
                quantity: rowChannelQuantities[id]?.amazon ?? 0,
              });
            }
          }

          // Add woo-commerce channel data
          if (channelList.includes("WOOCOMMERCE")) {
            const priceToUse = isPriceSameAllChannel
              ? productPrice
              : currentRowObj?.wooCommercePrice;
            if (priceToUse !== undefined && priceToUse !== null) {
              channelDataList.push({
                channelType: "WOOCOMMERCE",
                mrp: discountedPrice as number,
                price: priceToUse as number,
                quantity: rowChannelQuantities[id]?.wooCommerce ?? 0,
              });
            }
          }

          // Add shopify channel data
          if (channelList.includes("SHOPIFY")) {
            const priceToUse = isPriceSameAllChannel
              ? productPrice
              : currentRowObj?.shopifyPrice;
            if (priceToUse !== undefined && priceToUse !== null) {
              channelDataList.push({
                channelType: "SHOPIFY",
                mrp: discountedPrice as number,
                price: priceToUse as number,
                quantity: rowChannelQuantities[id]?.shopify ?? 0,
              });
            }
          }

          // Add shopify channel data
          if (channelList.includes("WIX")) {
            const priceToUse = isPriceSameAllChannel
              ? productPrice
              : currentRowObj?.wixPrice;
            if (priceToUse !== undefined && priceToUse !== null) {
              channelDataList.push({
                channelType: "WIX",
                mrp: discountedPrice as number,
                price: priceToUse as number,
                quantity: rowChannelQuantities[id]?.wix ?? 0,
              });
            }
          }

          // Handle variant assets for current row only
          let variantAssets: VariantAssetType[] = [];
          const rowData = rowAssetsMap[id];
          if (rowData) {
            if (rowData.assets && rowData.assets.length > 0) {
              variantAssets = rowData.assets.map((asset) => ({
                assetId: asset.id,
              }));
            } else if (rowData.assetData && rowData.assetData.length > 0) {
              variantAssets = rowData.assetData.map((asset) => ({
                assetId: asset.id.toString(),
              }));
            }
          }

          // Return updated variant for current row with preserved externalProductId
          return {
            option: variant.option,
            channelData: channelDataList,
            variantAssets: variantAssets,
            externalProductId, // Preserve the externalProductId
          } as Variants;
        });

        // Compare with existing variants to see if we need to update
        const variantsChanged =
          JSON.stringify(variantsOnDataTable) !==
          JSON.stringify(updatedVariants);

        if (variantsChanged) {
          setUpdatedVariants(variantsOnDataTable.filter(Boolean));
        }

        return variantsOnDataTable.filter(Boolean);
      }
    },
    [
      updatedVariants,
      data,
      rowPrices,
      rowChannelQuantities,
      discountedPrice,
      rowAssetsMap,
      initialVariants,
      setUpdatedVariants,
    ],
  );

  useEffect(() => {
    // Only update when we have a specific rowId and not during modal open
    if (rowId && !open) {
      variantChannelData(rowId);
    }
  }, [rowId, variantChannelData, open]);

  // Add a separate initialization effect for rowAssetsMap
  useEffect(() => {
    if (data.length > 0 && !initialVariants) {
      setRowAssetsMap((prev) => {
        // Check if we need to update
        let needsUpdate = false;
        const newMap = { ...prev };

        data.forEach((item) => {
          if (!newMap[item.id]) {
            newMap[item.id] = {
              assetData: [],
              assets: [],
            };
            needsUpdate = true;
          }
        });

        // Only return new object if something changed
        return needsUpdate ? newMap : prev;
      });
    }
  }, [data, initialVariants]);

  // Add this effect to handle asset updates when modal closes
  useEffect(() => {
    if (selectedRowId !== null && open === false) {
      // When modal closes, validate assets and update the affected row
      validateAssets(selectedRowId);
      setRowId(selectedRowId);
    }
  }, [open, selectedRowId]);

  useEffect(() => {
    if (rowId) {
      variantChannelData(rowId);
    }
  }, [
    rowPrices,
    rowAssetsMap,
    rowChannelQuantities,
    variantChannelData,
    rowId,
  ]);

  const validateAllInputs = () => {
    let hasErrors = false;
    const newErrors: RowErrorsType = {};

    data.forEach((item) => {
      if (!newErrors[item.id]) {
        newErrors[item.id] = {};
      }

      // Validate main quantity
      // if (!item.quantity || item.quantity === 0) {
      //   newErrors[item.id].quantity = "This field is required";
      //   hasErrors = true;
      // }

      // Validate ONDC price
      if (channelList.includes("ONDC")) {
        // This is where the issue is - it needs to use productPrice when isPriceSameAllChannel is true
        const ondcPrice = isPriceSameAllChannel
          ? productPrice
          : rowPrices[item.id]?.ondcPrice;

        // Check if ONDC price is missing or zero
        if (ondcPrice === undefined || ondcPrice === null || ondcPrice === 0) {
          newErrors[item.id].ondcPrice = "This field is required";
          hasErrors = true;
        }
        // Check if ONDC price is greater than discounted price
        else if (
          typeof ondcPrice === "number" &&
          typeof discountedPrice === "number" &&
          discountedPrice !== null &&
          ondcPrice > discountedPrice
        ) {
          newErrors[item.id].ondcPrice =
            "Price must be less than or equal to the discounted price";
          hasErrors = true;
        }
      }

      // Validate DEFAULT price
      if (channelList.includes("DEFAULT")) {
        const defaultPrice = isPriceSameAllChannel
          ? productPrice
          : rowPrices[item.id]?.defaultPrice;

        // Check if DEFAULT price is missing or zero
        if (
          defaultPrice === undefined ||
          defaultPrice === null ||
          defaultPrice === 0
        ) {
          newErrors[item.id].defaultPrice = "This field is required";
          hasErrors = true;
        }
        // Check if DEFAULT price is greater than discounted price
        else if (
          typeof defaultPrice === "number" &&
          typeof discountedPrice === "number" &&
          discountedPrice !== null &&
          defaultPrice > discountedPrice
        ) {
          newErrors[item.id].defaultPrice =
            "Price must be less than or equal to the discounted price";
          hasErrors = true;
        }
      }

      // Validate AMAZON price
      if (channelList.includes("AMAZON")) {
        const amazonPrice = isPriceSameAllChannel
          ? productPrice
          : rowPrices[item.id]?.amazonPrice;

        // Check if AMAZON price is missing or zero
        if (
          amazonPrice === undefined ||
          amazonPrice === null ||
          amazonPrice === 0
        ) {
          newErrors[item.id].amazonPrice = "This field is required";
          hasErrors = true;
        }
        // Check if AMAZON price is greater than discounted price
        else if (
          typeof amazonPrice === "number" &&
          typeof discountedPrice === "number" &&
          discountedPrice !== null &&
          amazonPrice > discountedPrice
        ) {
          newErrors[item.id].amazonPrice =
            "Price must be less than or equal to the discounted price";
          hasErrors = true;
        }
      }

      // Validate woo-commerce price
      if (channelList.includes("WOOCOMMERCE")) {
        const wooCommercePrice = isPriceSameAllChannel
          ? productPrice
          : rowPrices[item.id]?.wooCommercePrice;

        // Check if woocommerce price is missing or zero
        if (
          wooCommercePrice === undefined ||
          wooCommercePrice === null ||
          wooCommercePrice === 0
        ) {
          newErrors[item.id].wooCommercePrice = "This field is required";
          hasErrors = true;
        }
        // Check if woocommerce price is greater than discounted price
        else if (
          typeof wooCommercePrice === "number" &&
          typeof discountedPrice === "number" &&
          discountedPrice !== null &&
          wooCommercePrice > discountedPrice
        ) {
          newErrors[item.id].wooCommercePrice =
            "Price must be less than or equal to the discounted price";
          hasErrors = true;
        }
      }

      // Validate shopify price
      if (channelList.includes("SHOPIFY")) {
        const shopifyPrice = isPriceSameAllChannel
          ? productPrice
          : rowPrices[item.id]?.shopifyPrice;

        // Check if shopify price is missing or zero
        if (
          shopifyPrice === undefined ||
          shopifyPrice === null ||
          shopifyPrice === 0
        ) {
          newErrors[item.id].shopifyPrice = "This field is required";
          hasErrors = true;
        }
        // Check if shopify price is greater than discounted price
        else if (
          typeof shopifyPrice === "number" &&
          typeof discountedPrice === "number" &&
          discountedPrice !== null &&
          shopifyPrice > discountedPrice
        ) {
          newErrors[item.id].shopifyPrice =
            "Price must be less than or equal to the discounted price";
          hasErrors = true;
        }
      }

      // Validate wix price
      if (channelList.includes("WIX")) {
        const wixPrice = isPriceSameAllChannel
          ? productPrice
          : rowPrices[item.id]?.wixPrice;

        // Check if wix price is missing or zero
        if (wixPrice === undefined || wixPrice === null || wixPrice === 0) {
          newErrors[item.id].wixPrice = "This field is required";
          hasErrors = true;
        }
        // Check if wix price is greater than discounted price
        else if (
          typeof wixPrice === "number" &&
          typeof discountedPrice === "number" &&
          discountedPrice !== null &&
          wixPrice > discountedPrice
        ) {
          newErrors[item.id].wixPrice =
            "Price must be less than or equal to the discounted price";
          hasErrors = true;
        }
      }

      // Validate main quantity in UNIFIED mode
      if (inventoryStrategy === "UNIFIED") {
        if (!item.quantity || item.quantity === 0) {
          newErrors[item.id].quantity = "This field is required";
          hasErrors = true;
        }
      }

      // Validate channel quantities in SPLIT mode
      if (inventoryStrategy === "SPLIT") {
        const ondcQuantity = rowChannelQuantities[item.id]?.ondc;
        if (
          channelList.includes("ONDC") &&
          (ondcQuantity === undefined ||
            ondcQuantity === null ||
            ondcQuantity === 0)
        ) {
          newErrors[item.id].ondcQuantity = "This field is required";
          hasErrors = true;
        }

        const defaultQuantity = rowChannelQuantities[item.id]?.default;
        if (
          channelList.includes("DEFAULT") &&
          (defaultQuantity === undefined ||
            defaultQuantity === null ||
            defaultQuantity === 0)
        ) {
          newErrors[item.id].defaultQuantity = "This field is required";
          hasErrors = true;
        }

        // Added for Amazon
        const amazonQuantity = rowChannelQuantities[item.id]?.amazon;
        if (
          channelList.includes("AMAZON") &&
          (amazonQuantity === undefined ||
            amazonQuantity === null ||
            amazonQuantity === 0)
        ) {
          newErrors[item.id].amazonQuantity = "This field is required";
          hasErrors = true;
        }

        // Added for woo-commerce
        const wooCommerceQuantity = rowChannelQuantities[item.id]?.wooCommerce;
        if (
          channelList.includes("WOOCOMMERCE") &&
          (wooCommerceQuantity === undefined ||
            wooCommerceQuantity === null ||
            wooCommerceQuantity === 0)
        ) {
          newErrors[item.id].wooCommerceQuantity = "This field is required";
          hasErrors = true;
        }

        // Added for shopify
        const shopifyQuantity = rowChannelQuantities[item.id]?.shopify;
        if (
          channelList.includes("SHOPIFY") &&
          (shopifyQuantity === undefined ||
            shopifyQuantity === null ||
            shopifyQuantity === 0)
        ) {
          newErrors[item.id].shopifyQuantity = "This field is required";
          hasErrors = true;
        }

        // Added for wix
        const wixQuantity = rowChannelQuantities[item.id]?.wix;
        if (
          channelList.includes("WIX") &&
          (wixQuantity === undefined ||
            wixQuantity === null ||
            wixQuantity === 0)
        ) {
          newErrors[item.id].wixQuantity = "This field is required";
          hasErrors = true;
        }
      }

      // Validate assets - check if the row has any assets
      const rowAssets = rowAssetsMap[item.id]?.assetData || [];
      if (rowAssets.length === 0) {
        newErrors[item.id].assets = "Image is required";
        hasErrors = true;
      }

      // Remove empty error objects
      if (Object.keys(newErrors[item.id]).length === 0) {
        delete newErrors[item.id];
      }
    });

    setRowErrors(newErrors);
    return !hasErrors;
  };

  const validateAssets = (itemId: number) => {
    const rowAssets = rowAssetsMap[itemId]?.assetData || [];

    setRowErrors((prev) => {
      const currentErrors = { ...prev };

      if (!currentErrors[itemId]) {
        currentErrors[itemId] = {};
      }

      if (rowAssets.length === 0) {
        currentErrors[itemId].assets = "Image is required";
      } else {
        // Clear error if valid
        delete currentErrors[itemId].assets;

        // Remove the entire item entry if no errors left
        if (Object.keys(currentErrors[itemId]).length === 0) {
          delete currentErrors[itemId];
        }
      }

      return currentErrors;
    });

    // Update product list error state for form validation
    setTimeout(() => {
      // const hasErrors = Object.keys(rowErrors).length > 0;
    }, 0);
  };

  useEffect(() => {
    if (data.length > 0) {
      validateAllInputs();
    }
  }, [
    initialDataLoaded,
    discountedPrice,
    productPrice,
    data,
    rowPrices,
    rowChannelQuantities,
    rowAssetsMap,
    inventoryStrategy,
    channelList,
  ]);

  // Create an error message component to display below inputs
  // const ErrorMessage = ({ message }: { message?: string }) => {
  //   if (!message) return null;

  //   return <div className="text-red-500 text-xs mt-1">{message}</div>;
  // };

  const toggleRowExpansion = (key: string) => {
    setExpandedRows((prev) =>
      prev.includes(key) ? prev.filter((row) => row !== key) : [...prev, key],
    );
  };

  const toggleRowSelection = (itemId: number) => {
    setSelectedRows((prev) => {
      const newSelection = { ...prev, [itemId]: !prev[itemId] };
      logSelectedIds(newSelection);
      return newSelection;
    });
  };

  const logSelectedIds = (selection: Record<number, boolean>) => {
    const selectedIds = Object.keys(selection).filter((id) => selection[+id]);
    console.log(selectedIds);
  };

  const toggleSelectAll = () => {
    const allSelected =
      Object.values(selectedRows).length === data.length &&
      Object.values(selectedRows).every(Boolean);
    const newSelection: Record<number, boolean> = {};
    data.forEach((item) => {
      newSelection[item.id] = !allSelected;
    });
    setSelectedRows(newSelection);
    logSelectedIds(newSelection);
  };

  const allRowsSelected =
    data.length > 0 &&
    Object.keys(selectedRows).length === data.length &&
    Object.values(selectedRows).every(Boolean);

  const deleteSelectedRows = () => {
    const selectedIds = Object.keys(selectedRows)
      .filter((id) => selectedRows[+id])
      .map(Number);

    if (selectedIds.length === 0) return;
    const updatedData = data.filter((item) => !selectedIds.includes(item.id));

    setData(updatedData);

    const variantIndicesToRemove = new Set();

    selectedIds.forEach((rowId) => {
      const item = data.find((item) => item.id === rowId);

      if (item && item.variantIndex !== undefined) {
        variantIndicesToRemove.add(item.variantIndex);
      } else {
        const selectedItem = data.find((item) => item.id === rowId);

        if (selectedItem) {
          const variantIndex = updatedVariants.findIndex((variant) => {
            const sizeValue = variant.option.data?.size;
            let sizeName = "";
            if (sizeValue && Array.isArray(sizeValue.value)) {
              sizeName = sizeValue.value[0].displayName || "";
            }

            const colorName = variant.option.data?.color?.displayName || "";

            return (
              colorName === selectedItem.color && sizeName === selectedItem.size
            );
          });

          if (variantIndex !== -1) {
            variantIndicesToRemove.add(variantIndex);
          }
        }
      }
    });

    const updatedVariantsArray = updatedVariants.filter(
      (_, index) => !variantIndicesToRemove.has(index),
    );

    setUpdatedVariants(updatedVariantsArray);

    setSelectedRows({});
    if (updatedData.length === 0) {
      setPublishChannel(null, false);
      setColorVariationValue({} as ColorVariationType);
      setSizeSchemaValue({});
      setNumberOfItemsVariationValue({} as NumberOfItemsVariationType);
      setScentVariationValue({} as ScentVariationType);
      setItemWeightVaritionValue({} as ItemWeightVariationType);
      setFlavorVariationValue({} as FlavorVariationType);
      setVariation([]);
      variantHandle(false);
    }
  };

  useEffect(() => {
    // Only run this once when data is loaded
    if (data.length > 0 && !initialExpansionDone) {
      // Get all unique group keys based on the current filterType
      const allGroupKeys = Array.from(
        new Set(
          data.map((item) => (filterType === "size" ? item.size : item.color)),
        ),
      );

      // Set all rows to be expanded by default
      setExpandedRows(allGroupKeys as string[]);

      // Mark initial expansion as done
      setInitialExpansionDone(true);
    }
  }, [data, filterType, initialExpansionDone]);

  const groupedAttribute: string[] =
    variantData?.required?.filter((v: string) => v !== "variation") ?? [];

  const groupOption =
    groupedAttribute?.map((attr) => ({
      id: attr,
      name: PRODUCT_MAPPED_ARRRIBUTES[attr] ?? attr,
    })) ?? [];

  const getDisplayForGroup = (
    items: DataItem[],
    filterType: AttributeKey,
  ): string => {
    const uniqueValues = Array.from(
      new Set(items.map((item) => item[filterType])),
    );

    return uniqueValues.join(", ");
  };

  const getOtherAttributes = (items: DataItem[], filterType: AttributeKey) => {
    const otherAttrs = groupedAttribute.filter((attr) => attr !== filterType);
    const allValues: string[] = [];

    items.forEach((item) => {
      otherAttrs.forEach((attr) => {
        const val = item[attr as keyof DataItem];
        if (val !== undefined && val !== null && val !== "") {
          allValues.push(String(val).trim());
        }
      });
    });

    return allValues.join(" / ");
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <p className="text-xs text-gray-600 font-medium">Group by</p>
          <SelectComp
            inputId="category"
            items={groupOption}
            placeHolder="None"
            getValue={(val) => {
              if (!val) return;
              const value = val.toLowerCase() as AttributeKey;
              setFilterType(value);
            }}
            showMenuItem={selectedGroupVariant}
            setShowMenuItem={setSelectedGroupVariant}
            className="w-[72px] text-xs"
          />
        </div>
        <div className="flex gap-2">
          {initialDataLoaded ? (
            <div
              className="flex items-center gap-2"
              onClick={() => setAddVarinatModalOpen(true)}
            >
              <SecondaryButton
                type="button"
                text={<PlusIcon />}
                className="w-8 h-8 p-1.5 text-gray-700"
              />
            </div>
          ) : (
            <div
              className="flex items-center gap-2"
              onClick={deleteSelectedRows}
            >
              <SecondaryButton
                type="button"
                text={<TrashIcon color="#D92D20" />}
                className="w-8 h-8 p-1.5 text-gray-700"
              />
            </div>
          )}
        </div>
      </div>
      <div className="max-h-[414px] border border-gray-200 bg-white rounded-xl shadow-sm min-w-full overflow-auto scrollStyle">
        <table className="table-auto w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="text-gray-600 text-xs font-medium p-3 gap-3 text-start">
                <div className="flex items-center gap-3">
                  <InputCheckbox
                    onChange={toggleSelectAll}
                    checked={allRowsSelected}
                  />
                  Variant
                </div>
              </th>
              <th className="text-gray-600 text-xs font-medium p-3 gap-1 text-start">
                <div className="flex items-center gap-2">
                  Quantity
                  <div className="relative inputSecondSymbol">
                    <InfoIcon />
                    <TooltipComp
                      tooltipText="You can’t change individual quantity as inventory management is unified at the moment."
                      className="min-w-64!"
                    />
                  </div>
                </div>
              </th>

              {channelList.includes("ONDC") && (
                <th className="text-gray-600 text-xs font-medium p-3 gap-1 text-start">
                  Ondc
                </th>
              )}
              {channelList.includes("DEFAULT") && (
                <th className="text-gray-600 text-xs font-medium p-3 gap-1 text-start">
                  Default
                </th>
              )}
              {channelList.includes("AMAZON") && (
                <th className="text-gray-600 text-xs font-medium p-3 gap-1 text-start">
                  Amazon
                </th>
              )}
              {channelList.includes("WOOCOMMERCE") && (
                <th className="text-gray-600 text-xs font-medium p-3 gap-1 text-start">
                  Woo-Commerce
                </th>
              )}
              {channelList.includes("SHOPIFY") && (
                <th className="text-gray-600 text-xs font-medium p-3 gap-1 text-start">
                  Shopify
                </th>
              )}
              {channelList.includes("WIX") && (
                <th className="text-gray-600 text-xs font-medium p-3 gap-1 text-start">
                  Wix
                </th>
              )}
            </tr>
            {/* split inventory table head row  */}
            {inventoryStrategy === "SPLIT" && (
              <tr>
                <th></th>
                <th></th>
                {channelList.includes("ONDC") && (
                  <th className=" text-gray-600 text-xs font-medium p-3 text-start ">
                    <div className="flex gap-3">
                      <div>Qty.</div>
                      <div className="px-2">(₹) Price</div>
                    </div>
                  </th>
                )}
                {channelList.includes("DEFAULT") && (
                  <th className=" text-gray-600 text-xs font-medium p-3 text-start">
                    <div className="flex gap-3">
                      <div>Qty.</div>
                      <div className="px-2">(₹) Price</div>
                    </div>
                  </th>
                )}
                {channelList.includes("AMAZON") && (
                  <th className=" text-gray-600 text-xs font-medium p-3 text-start">
                    <div className="flex gap-3">
                      <div>Qty.</div>
                      <div className="px-2">(₹) Price</div>
                    </div>
                  </th>
                )}
                {channelList.includes("WOOCOMMERCE") && (
                  <th className=" text-gray-600 text-xs font-medium p-3 text-start">
                    <div className="flex gap-3">
                      <div>Qty.</div>
                      <div className="px-2">(₹) Price</div>
                    </div>
                  </th>
                )}
                {channelList.includes("SHOPIFY") && (
                  <th className=" text-gray-600 text-xs font-medium p-3 text-start">
                    <div className="flex gap-3">
                      <div>Qty.</div>
                      <div className="px-2">(₹) Price</div>
                    </div>
                  </th>
                )}
                {channelList.includes("WIX") && (
                  <th className=" text-gray-600 text-xs font-medium p-3 text-start">
                    <div className="flex gap-3">
                      <div>Qty.</div>
                      <div className="px-2">(₹) Price</div>
                    </div>
                  </th>
                )}
              </tr>
            )}
          </thead>
          <tbody>
            {Object.keys(groupedData).map((groupKey) => {
              return (
                <Fragment key={groupKey}>
                  <tr className="h-[72px] border-b border-gray-200">
                    <td className="flex items-center gap-3 px-2 py-4 w-fit">
                      <div>
                        <InputCheckbox
                          onChange={() => {
                            const allSelected = groupedData[groupKey].every(
                              (item) => selectedRows[item.id],
                            );
                            const updatedSelection = { ...selectedRows };
                            groupedData[groupKey].forEach((item) => {
                              updatedSelection[item.id] = !allSelected;
                            });
                            setSelectedRows(updatedSelection);
                            logSelectedIds(updatedSelection);
                          }}
                          checked={groupedData[groupKey].every(
                            (item) => selectedRows[item.id],
                          )}
                        />
                      </div>
                      <div className="flex flex-col gap-0.5 cursor-pointer">
                        <p className="text-gray-900 text-sm">{getDisplayForGroup(groupedData[groupKey], filterType)}</p>
                        <div
                          className="text-xs text-gray-600 flex items-center gap-1 "
                          onClick={() => toggleRowExpansion(groupKey)}
                        >
                          {getOtherAttributes(groupedData[groupKey], filterType)}
                          <div className="ml-auto">
                            <ChevronDownIcon
                              className={`transform transition-transform duration-300 ${expandedRows.includes(groupKey) ? "rotate-180" : ""}`}
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-Gray-400 p-4">
                      <div className="p-2">
                        {groupedData[groupKey].reduce((acc, item) => {
                          if (inventoryStrategy === "SPLIT") {
                            // For split inventory, sum up both channel quantities
                            const ondcQty =
                              rowChannelQuantities[item.id]?.ondc ??
                              item.quantity;
                            const defaultQty =
                              rowChannelQuantities[item.id]?.default ??
                              item.quantity;
                            const amazonQty =
                              rowChannelQuantities[item.id]?.amazon ??
                              item.quantity;
                            const wooCommerceQty =
                              rowChannelQuantities[item.id]?.wooCommerce ??
                              item.quantity;
                            const shopifyQty =
                              rowChannelQuantities[item.id]?.shopify ??
                              item.quantity;
                            const wixQty =
                              rowChannelQuantities[item.id]?.wix ??
                              item.quantity;
                            return (
                              acc +
                              Number(ondcQty || 0) +
                              Number(defaultQty || 0) +
                              Number(amazonQty || 0) +
                              Number(wooCommerceQty || 0) +
                              Number(shopifyQty || 0) +
                              Number(wixQty || 0)
                            );
                          } else {
                            // For non-split inventory, use the original quantity
                            return acc + (item.quantity || 0);
                          }
                        }, 0)}
                      </div>
                    </td>
                    {channelList.includes("ONDC") && (
                      <td
                        className={cn({
                          "py-2 px-4": inventoryStrategy === "SPLIT",
                        })}
                      >
                        <div className="flex gap-3">
                          {inventoryStrategy === "SPLIT" && (
                            <div className="p-2 text-sm text-gray-400">
                              {/* Sum up all ONDC quantities for this group */}
                              {groupedData[groupKey].reduce((acc, item) => {
                                const ondcQty =
                                  rowChannelQuantities[item.id]?.ondc ??
                                  item.quantity;
                                return acc + Number(ondcQty || 0);
                              }, 0)}
                            </div>
                          )}
                          <div className="p-2 w-[120px] text-sm text-gray-400">
                            ₹{" "}
                            {isPriceSameAllChannel
                              ? productPrice
                              : Math.min(
                                  ...groupedData[groupKey].map(
                                    (item) =>
                                      (rowPrices[item.id]?.ondcPrice ||
                                        0) as number,
                                  ),
                                )}
                            {!isPriceSameAllChannel &&
                              groupedData[groupKey].length > 1 && (
                                <>
                                  {" "}
                                  - ₹{" "}
                                  {Math.max(
                                    ...groupedData[groupKey].map(
                                      (item) =>
                                        (rowPrices[item.id]?.ondcPrice ||
                                          0) as number,
                                    ),
                                  )}
                                </>
                              )}
                          </div>
                        </div>
                      </td>
                    )}

                    {channelList.includes("DEFAULT") && (
                      <td
                        className={cn({
                          "py-2 px-4": inventoryStrategy === "SPLIT",
                        })}
                      >
                        <div className="flex gap-3">
                          {inventoryStrategy === "SPLIT" && (
                            <div className="p-2 text-sm text-gray-400">
                              {/* Sum up all Default quantities for this group */}
                              {groupedData[groupKey].reduce((acc, item) => {
                                const defaultQty =
                                  rowChannelQuantities[item.id]?.default ??
                                  item.quantity;
                                return acc + Number(defaultQty || 0);
                              }, 0)}
                            </div>
                          )}
                          <div className="p-2 w-[120px] text-sm text-gray-400">
                            ₹{" "}
                            {isPriceSameAllChannel
                              ? productPrice
                              : Math.min(
                                  ...groupedData[groupKey].map(
                                    (item) =>
                                      (rowPrices[item.id]?.defaultPrice ||
                                        0) as number,
                                  ),
                                )}
                            {!isPriceSameAllChannel &&
                              groupedData[groupKey].length > 1 && (
                                <>
                                  {" "}
                                  - ₹{" "}
                                  {Math.max(
                                    ...groupedData[groupKey].map(
                                      (item) =>
                                        (rowPrices[item.id]?.defaultPrice ||
                                          0) as number,
                                    ),
                                  )}
                                </>
                              )}
                          </div>
                        </div>
                      </td>
                    )}
                    {channelList.includes("AMAZON") && (
                      <td
                        className={cn({
                          "py-2 px-4": inventoryStrategy === "SPLIT",
                        })}
                      >
                        <div className="flex gap-3">
                          {inventoryStrategy === "SPLIT" && (
                            <div className="p-2 text-sm text-gray-400">
                              {/* Sum up all Default quantities for this group */}
                              {groupedData[groupKey].reduce((acc, item) => {
                                const amazonQty =
                                  rowChannelQuantities[item.id]?.amazon ??
                                  item.quantity;
                                return acc + Number(amazonQty || 0);
                              }, 0)}
                            </div>
                          )}
                          <div className="p-2 w-[120px] text-sm text-gray-400">
                            ₹{" "}
                            {isPriceSameAllChannel
                              ? productPrice
                              : Math.min(
                                  ...groupedData[groupKey].map(
                                    (item) =>
                                      (rowPrices[item.id]?.amazonPrice ||
                                        0) as number,
                                  ),
                                )}
                            {!isPriceSameAllChannel &&
                              groupedData[groupKey].length > 1 && (
                                <>
                                  {" "}
                                  - ₹{" "}
                                  {Math.max(
                                    ...groupedData[groupKey].map(
                                      (item) =>
                                        (rowPrices[item.id]?.amazonPrice ||
                                          0) as number,
                                    ),
                                  )}
                                </>
                              )}
                          </div>
                        </div>
                      </td>
                    )}
                    {channelList.includes("WOOCOMMERCE") && (
                      <td
                        className={cn({
                          "py-2 px-4": inventoryStrategy === "SPLIT",
                        })}
                      >
                        <div className="flex gap-3">
                          {inventoryStrategy === "SPLIT" && (
                            <div className="p-2 text-sm text-gray-400">
                              {/* Sum up all Default quantities for this group */}
                              {groupedData[groupKey].reduce((acc, item) => {
                                const wooCommerceQty =
                                  rowChannelQuantities[item.id]?.wooCommerce ??
                                  item.quantity;
                                return acc + Number(wooCommerceQty || 0);
                              }, 0)}
                            </div>
                          )}
                          <div className="p-2 w-[120px] text-sm text-gray-400">
                            ₹{" "}
                            {isPriceSameAllChannel
                              ? productPrice
                              : Math.min(
                                  ...groupedData[groupKey].map(
                                    (item) =>
                                      (rowPrices[item.id]?.wooCommercePrice ||
                                        0) as number,
                                  ),
                                )}
                            {!isPriceSameAllChannel &&
                              groupedData[groupKey].length > 1 && (
                                <>
                                  {" "}
                                  - ₹{" "}
                                  {Math.max(
                                    ...groupedData[groupKey].map(
                                      (item) =>
                                        (rowPrices[item.id]?.wooCommercePrice ||
                                          0) as number,
                                    ),
                                  )}
                                </>
                              )}
                          </div>
                        </div>
                      </td>
                    )}
                    {channelList.includes("SHOPIFY") && (
                      <td
                        className={cn({
                          "py-2 px-4": inventoryStrategy === "SPLIT",
                        })}
                      >
                        <div className="flex gap-3">
                          {inventoryStrategy === "SPLIT" && (
                            <div className="p-2 text-sm text-gray-400">
                              {/* Sum up all Default quantities for this group */}
                              {groupedData[groupKey].reduce((acc, item) => {
                                const shopifyQty =
                                  rowChannelQuantities[item.id]?.shopify ??
                                  item.quantity;
                                return acc + Number(shopifyQty || 0);
                              }, 0)}
                            </div>
                          )}
                          <div className="p-2 w-[120px] text-sm text-gray-400">
                            ₹{" "}
                            {isPriceSameAllChannel
                              ? productPrice
                              : Math.min(
                                  ...groupedData[groupKey].map(
                                    (item) =>
                                      (rowPrices[item.id]?.shopifyPrice ||
                                        0) as number,
                                  ),
                                )}
                            {!isPriceSameAllChannel &&
                              groupedData[groupKey].length > 1 && (
                                <>
                                  {" "}
                                  - ₹{" "}
                                  {Math.max(
                                    ...groupedData[groupKey].map(
                                      (item) =>
                                        (rowPrices[item.id]?.shopifyPrice ||
                                          0) as number,
                                    ),
                                  )}
                                </>
                              )}
                          </div>
                        </div>
                      </td>
                    )}
                    {channelList.includes("WIX") && (
                      <td
                        className={cn({
                          "py-2 px-4": inventoryStrategy === "SPLIT",
                        })}
                      >
                        <div className="flex gap-3">
                          {inventoryStrategy === "SPLIT" && (
                            <div className="p-2 text-sm text-gray-400">
                              {/* Sum up all Default quantities for this group */}
                              {groupedData[groupKey].reduce((acc, item) => {
                                const wixQty =
                                  rowChannelQuantities[item.id]?.wix ??
                                  item.quantity;
                                return acc + Number(wixQty || 0);
                              }, 0)}
                            </div>
                          )}
                          <div className="p-2 w-[120px] text-sm text-gray-400">
                            ₹{" "}
                            {isPriceSameAllChannel
                              ? productPrice
                              : Math.min(
                                  ...groupedData[groupKey].map(
                                    (item) =>
                                      (rowPrices[item.id]?.wixPrice ||
                                        0) as number,
                                  ),
                                )}
                            {!isPriceSameAllChannel &&
                              groupedData[groupKey].length > 1 && (
                                <>
                                  {" "}
                                  - ₹{" "}
                                  {Math.max(
                                    ...groupedData[groupKey].map(
                                      (item) =>
                                        (rowPrices[item.id]?.wixPrice ||
                                          0) as number,
                                    ),
                                  )}
                                </>
                              )}
                          </div>
                        </div>
                      </td>
                    )}
                  </tr>
                  {expandedRows.includes(groupKey) &&
                    groupedData[groupKey].map((item) => (
                      <tr
                        key={item.id}
                        className="h-[72px] border-b border-gray-200"
                      >
                        <td className="flex items-center gap-3 px-2 py-4 ps-5 w-fit">
                          <div>
                            <InputCheckbox
                              checked={!!selectedRows[item.id]}
                              onChange={() => toggleRowSelection(item.id)}
                            />
                          </div>
                          {renderRowImage(item.id)}
                          <div className="flex flex-col gap-0.5">
                            <p className="text-gray-900 text-sm">
                              {item.size}{" "}
                            </p>
                            <div className="text-xs text-gray-600 flex items-center gap-1 ">
                              {item.color || item.flavor || item.scent || item.numberOfItems || item.itemWeight }
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-4 ">
                          <input
                            type="text"
                            disabled={inventoryStrategy === "SPLIT"}
                            className={cn(
                              "w-[74px] border border-gray-300 rounded-lg focus:outline-none p-2 text-gray-500",
                              {
                                "border-Error-300":
                                  rowErrors[item.id]?.quantity &&
                                  inventoryStrategy === "UNIFIED",
                              },
                            )}
                            value={
                              inventoryStrategy === "SPLIT"
                                ? Number(
                                    rowChannelQuantities[item.id]?.ondc || 0,
                                  ) +
                                  Number(
                                    rowChannelQuantities[item.id]?.default || 0,
                                  ) +
                                  Number(
                                    rowChannelQuantities[item.id]?.amazon || 0,
                                  ) +
                                  Number(
                                    rowChannelQuantities[item.id]
                                      ?.wooCommerce || 0,
                                  ) +
                                  Number(
                                    rowChannelQuantities[item.id]?.shopify || 0,
                                  ) +
                                  Number(
                                    rowChannelQuantities[item.id]?.wix || 0,
                                  )
                                : item.quantity
                            }
                            onChange={(e) => {
                              const newValue = Number(e.target.value);
                              if (!isNaN(newValue) && newValue >= 0) {
                                handleTotalQuantityChange(item.id, newValue);
                              }
                            }}
                          />
                          {/* <ErrorMessage message={rowErrors[item.id]?.quantity} /> */}
                        </td>
                        {channelList.includes("ONDC") && (
                          <td
                            className={cn({
                              "py-2 px-4": inventoryStrategy === "SPLIT",
                            })}
                          >
                            <div className="flex gap-2">
                              {inventoryStrategy === "SPLIT" && (
                                <div className="w-[50px]">
                                  <input
                                    type="text"
                                    className={cn(
                                      "w-[50px] border border-Gray-300 rounded-lg focus:outline-none p-2 text-Gray-500",
                                      {
                                        "border-Error-300":
                                          rowErrors[item.id]?.ondcQuantity,
                                      },
                                    )}
                                    value={
                                      rowChannelQuantities[item.id]?.ondc ??
                                      item.quantity
                                    }
                                    onChange={(e) =>
                                      handleQuantityChange(
                                        item.id,
                                        "ondc",
                                        Number(e.target.value),
                                      )
                                    }
                                  />
                                  {/* <ErrorMessage
                                    message={rowErrors[item.id]?.ondcQuantity}
                                  /> */}
                                </div>
                              )}
                              <div className="w-[100px]">
                                <input
                                  type="text"
                                  disabled={isPriceSameAllChannel}
                                  className={cn(
                                    "w-24 border border-Gray-300 rounded-lg focus:outline-none p-2 text-Gray-500",
                                    {
                                      "border-Error-300":
                                        rowErrors[item.id]?.ondcPrice,
                                    },
                                  )}
                                  value={
                                    isPriceSameAllChannel
                                      ? (productPrice as number)
                                      : (rowPrices[item.id]
                                          ?.ondcPrice as number) || 0
                                  }
                                  placeholder="0"
                                  onChange={(e) =>
                                    handlePriceChange(
                                      item.id,
                                      "ondc",
                                      Number(e.target.value),
                                    )
                                  }
                                />
                                {/* <ErrorMessage
                                  message={rowErrors[item.id]?.ondcPrice}
                                /> */}
                              </div>
                            </div>
                          </td>
                        )}

                        {channelList.includes("DEFAULT") && (
                          <td
                            className={cn({
                              "py-2 px-4": inventoryStrategy === "SPLIT",
                            })}
                          >
                            <div className="flex gap-2">
                              {inventoryStrategy === "SPLIT" && (
                                <div className="w-[50px]">
                                  <input
                                    type="text"
                                    className={cn(
                                      "w-[50px] border border-Gray-300 rounded-lg focus:outline-none p-2 text-Gray-500",
                                      {
                                        "border-Error-300":
                                          rowErrors[item.id]?.defaultQuantity,
                                      },
                                    )}
                                    value={
                                      rowChannelQuantities[item.id]?.default ??
                                      item.quantity
                                    }
                                    onChange={(e) =>
                                      handleQuantityChange(
                                        item.id,
                                        "default",
                                        Number(e.target.value),
                                      )
                                    }
                                  />
                                  {/* <ErrorMessage
                                    message={
                                      rowErrors[item.id]?.defaultQuantity
                                    }
                                  /> */}
                                </div>
                              )}
                              <div className="w-[100px]">
                                <input
                                  disabled={isPriceSameAllChannel}
                                  type="text"
                                  className={cn(
                                    "w-24 border border-Gray-300 rounded-lg focus:outline-none p-2 text-Gray-500",
                                    {
                                      "border-Error-300":
                                        rowErrors[item.id]?.defaultPrice,
                                    },
                                  )}
                                  value={
                                    isPriceSameAllChannel
                                      ? (productPrice as number)
                                      : (rowPrices[item.id]
                                          ?.defaultPrice as number) || 0
                                  }
                                  placeholder="0"
                                  onChange={(e) =>
                                    handlePriceChange(
                                      item.id,
                                      "default",
                                      Number(e.target.value),
                                    )
                                  }
                                />
                                {/* <ErrorMessage
                                  message={rowErrors[item.id]?.defaultPrice}
                                /> */}
                              </div>
                            </div>
                          </td>
                        )}
                        {channelList.includes("AMAZON") && (
                          <td
                            className={cn({
                              "py-2 px-4": inventoryStrategy === "SPLIT",
                            })}
                          >
                            <div className="flex gap-2">
                              {inventoryStrategy === "SPLIT" && (
                                <div className="w-[50px]">
                                  <input
                                    type="text"
                                    className={cn(
                                      "w-[50px] border border-Gray-300 rounded-lg focus:outline-none p-2 text-Gray-500",
                                      {
                                        "border-Error-300":
                                          rowErrors[item.id]?.amazonQuantity,
                                      },
                                    )}
                                    value={
                                      rowChannelQuantities[item.id]?.amazon ??
                                      item.quantity
                                    }
                                    onChange={(e) =>
                                      handleQuantityChange(
                                        item.id,
                                        "amazon",
                                        Number(e.target.value),
                                      )
                                    }
                                  />
                                  {/* <ErrorMessage
                                    message={
                                      rowErrors[item.id]?.defaultQuantity
                                    }
                                  /> */}
                                </div>
                              )}
                              <div className="w-[100px]">
                                <input
                                  disabled={isPriceSameAllChannel}
                                  type="text"
                                  className={cn(
                                    "w-24 border border-Gray-300 rounded-lg focus:outline-none p-2 text-Gray-500",
                                    {
                                      "border-Error-300":
                                        rowErrors[item.id]?.amazonPrice,
                                    },
                                  )}
                                  value={
                                    isPriceSameAllChannel
                                      ? (productPrice as number)
                                      : (rowPrices[item.id]
                                          ?.amazonPrice as number) || 0
                                  }
                                  placeholder="0"
                                  onChange={(e) =>
                                    handlePriceChange(
                                      item.id,
                                      "amazon",
                                      Number(e.target.value),
                                    )
                                  }
                                />
                                {/* <ErrorMessage
                                  message={rowErrors[item.id]?.amazonPrice}
                                /> */}
                              </div>
                            </div>
                          </td>
                        )}
                        {channelList.includes("WOOCOMMERCE") && (
                          <td
                            className={cn({
                              "py-2 px-4": inventoryStrategy === "SPLIT",
                            })}
                          >
                            <div className="flex gap-2">
                              {inventoryStrategy === "SPLIT" && (
                                <div className="w-[50px]">
                                  <input
                                    type="text"
                                    className={cn(
                                      "w-[50px] border border-Gray-300 rounded-lg focus:outline-none p-2 text-Gray-500",
                                      {
                                        "border-Error-300":
                                          rowErrors[item.id]
                                            ?.wooCommerceQuantity,
                                      },
                                    )}
                                    value={
                                      rowChannelQuantities[item.id]
                                        ?.wooCommerce ?? item.quantity
                                    }
                                    onChange={(e) =>
                                      handleQuantityChange(
                                        item.id,
                                        "wooCommerce",
                                        Number(e.target.value),
                                      )
                                    }
                                  />
                                  {/* <ErrorMessage
                                    message={
                                      rowErrors[item.id]?.defaultQuantity
                                    }
                                  /> */}
                                </div>
                              )}
                              <div className="w-[100px]">
                                <input
                                  disabled={isPriceSameAllChannel}
                                  type="text"
                                  className={cn(
                                    "w-24 border border-Gray-300 rounded-lg focus:outline-none p-2 text-Gray-500",
                                    {
                                      "border-Error-300":
                                        rowErrors[item.id]?.wooCommercePrice,
                                    },
                                  )}
                                  value={
                                    isPriceSameAllChannel
                                      ? (productPrice as number)
                                      : (rowPrices[item.id]
                                          ?.wooCommercePrice as number) || 0
                                  }
                                  placeholder="0"
                                  onChange={(e) =>
                                    handlePriceChange(
                                      item.id,
                                      "wooCommerce",
                                      Number(e.target.value),
                                    )
                                  }
                                />
                                {/* <ErrorMessage
                                  message={rowErrors[item.id]?.amazonPrice}
                                /> */}
                              </div>
                            </div>
                          </td>
                        )}
                        {channelList.includes("SHOPIFY") && (
                          <td
                            className={cn({
                              "py-2 px-4": inventoryStrategy === "SPLIT",
                            })}
                          >
                            <div className="flex gap-2">
                              {inventoryStrategy === "SPLIT" && (
                                <div className="w-[50px]">
                                  <input
                                    type="text"
                                    className={cn(
                                      "w-[50px] border border-Gray-300 rounded-lg focus:outline-none p-2 text-Gray-500",
                                      {
                                        "border-Error-300":
                                          rowErrors[item.id]?.shopifyQuantity,
                                      },
                                    )}
                                    value={
                                      rowChannelQuantities[item.id]?.shopify ??
                                      item.quantity
                                    }
                                    onChange={(e) =>
                                      handleQuantityChange(
                                        item.id,
                                        "shopify",
                                        Number(e.target.value),
                                      )
                                    }
                                  />
                                  {/* <ErrorMessage
                                    message={
                                      rowErrors[item.id]?.defaultQuantity
                                    }
                                  /> */}
                                </div>
                              )}
                              <div className="w-[100px]">
                                <input
                                  disabled={isPriceSameAllChannel}
                                  type="text"
                                  className={cn(
                                    "w-24 border border-Gray-300 rounded-lg focus:outline-none p-2 text-Gray-500",
                                    {
                                      "border-Error-300":
                                        rowErrors[item.id]?.shopifyPrice,
                                    },
                                  )}
                                  value={
                                    isPriceSameAllChannel
                                      ? (productPrice as number)
                                      : (rowPrices[item.id]
                                          ?.shopifyPrice as number) || 0
                                  }
                                  placeholder="0"
                                  onChange={(e) =>
                                    handlePriceChange(
                                      item.id,
                                      "shopify",
                                      Number(e.target.value),
                                    )
                                  }
                                />
                                {/* <ErrorMessage
                                  message={rowErrors[item.id]?.amazonPrice}
                                /> */}
                              </div>
                            </div>
                          </td>
                        )}
                        {channelList.includes("WIX") && (
                          <td
                            className={cn({
                              "py-2 px-4": inventoryStrategy === "SPLIT",
                            })}
                          >
                            <div className="flex gap-2">
                              {inventoryStrategy === "SPLIT" && (
                                <div className="w-[50px]">
                                  <input
                                    type="text"
                                    className={cn(
                                      "w-[50px] border border-Gray-300 rounded-lg focus:outline-none p-2 text-Gray-500",
                                      {
                                        "border-Error-300":
                                          rowErrors[item.id]?.wixQuantity,
                                      },
                                    )}
                                    value={
                                      rowChannelQuantities[item.id]?.wix ??
                                      item.quantity
                                    }
                                    onChange={(e) =>
                                      handleQuantityChange(
                                        item.id,
                                        "wix",
                                        Number(e.target.value),
                                      )
                                    }
                                  />
                                  {/* <ErrorMessage
                                    message={
                                      rowErrors[item.id]?.defaultQuantity
                                    }
                                  /> */}
                                </div>
                              )}
                              <div className="w-[100px]">
                                <input
                                  disabled={isPriceSameAllChannel}
                                  type="text"
                                  className={cn(
                                    "w-24 border border-Gray-300 rounded-lg focus:outline-none p-2 text-Gray-500",
                                    {
                                      "border-Error-300":
                                        rowErrors[item.id]?.wixPrice,
                                    },
                                  )}
                                  value={
                                    isPriceSameAllChannel
                                      ? (productPrice as number)
                                      : (rowPrices[item.id]
                                          ?.wixPrice as number) || 0
                                  }
                                  placeholder="0"
                                  onChange={(e) =>
                                    handlePriceChange(
                                      item.id,
                                      "wix",
                                      Number(e.target.value),
                                    )
                                  }
                                />
                                {/* <ErrorMessage
                                  message={rowErrors[item.id]?.amazonPrice}
                                /> */}
                              </div>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Modal with row-specific data */}
      <Dialog open={open} onOpenChange={setOpen}>
        {selectedRowData && (
          <ImageListedModal
            data={selectedRowData.assetData}
            setData={(newData) => {
              if (typeof newData === "function") {
                // Handle when newData is a filter function
                setSelectedRowData((prev) => {
                  if (!prev) return null;

                  const updatedAssetData = newData(prev.assetData);
                  // Also update the rowAssetsMap to keep states in sync
                  setRowAssetsMap((prevMap) => ({
                    ...prevMap,
                    [prev.id]: {
                      ...prevMap[prev.id],
                      assetData: updatedAssetData,
                    },
                  }));

                  return {
                    ...prev,
                    assetData: updatedAssetData,
                  };
                });
              } else {
                // Handle when newData is an array
                setSelectedRowData((prev) =>
                  prev
                    ? {
                        ...prev,
                        assetData: Array.isArray(newData) ? newData : [],
                      }
                    : null,
                );

                // Update rowAssetsMap for array data as well

                if (selectedRowData) {
                  setRowAssetsMap((prev) => ({
                    ...prev,
                    [selectedRowData.id]: {
                      ...prev[selectedRowData.id],
                      assetData: Array.isArray(newData) ? newData : [],
                    },
                  }));
                }
              }
            }}
            onChange={onChange}
            toggleOpen={() => setOpen(false)}
            setAssets={setAssets}
            assets={assets || []}
            selectedRowId={selectedRowData.id}
            setRowAssetsMap={setRowAssetsMap}
          />
        )}
      </Dialog>
      <AddVarinatModal
        modalOpen={AddVarinatModalOpen}
        setModalOpen={setAddVarinatModalOpen}
      />
    </div>
  );
}

export default PublishChannelDataGrid;
