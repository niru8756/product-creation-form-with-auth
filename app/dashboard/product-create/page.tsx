"use client"

import ProductErrorReport, {
  VerificationError,
} from "@/component/ProductErrorReport";
import AdditionalDetails from "@/component/AdditionalDetails";
import ChannelPublishing from "@/component/ChannelPublishing";
import ChannelPublishingBasics from "@/component/ChannelPublishingBasics";
import ImageList from "@/ui/ImageList";
import LabelComp from "@/ui/LabelComp";
import ProductFormDescription from "@/component/ProductFormDescription";
import ProductInventory from "@/component/ProductInventory";
import ProductManufacturing from "@/component/ProductManufacturing";
// import ProductManufacturing from "@/components/ui/ProductManufacturing";
import ProductPackage from "@/component/ProductPackage";
import ProductPricing from "@/component/ProductPricing";
import ProductStatus from "@/component/ProductStatus";
import SecondaryButton from "@/ui/SecondaryButton";
import SwitchToggleButton from "@/ui/SwitchToggleButton";
import { errorToast, successToast } from "@/ui/Toast";
import VariantionsRender from "@/component/variation-component/VariantionsRender";
import { api, productApi } from "@/lib/axios";
import { getStoreId } from "@/lib/cookies";
import { fetchStoreDetails } from "@/lib/getApis";
import { cn } from "@/lib/utils";
import { useProductStore } from "@/store/ProductStore";
import useVariationStore from "@/store/VariationStore";
import {
  DataFileType,
  ProductListErrorType,
  ProductPayloadType,
  SingleProductType,
} from "@/type/product-type";
import {
  ColorVariationType,
  FlavorVariationType,
  ItemWeightVariationType,
  NumberOfItemsVariationType,
  ScentVariationType,
} from "@/type/variation-type";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AlertCircle, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


function ProductForm() {
  const [submitBtnDisable, setSubmitBtnDisable] = useState<boolean>(true);
  const [variationEnabler, setVariationEnabler] = useState(false);
  const [assets, setAssets] = useState<DataFileType[]>([]);
  const [isGenderEnable, setIsGenderEnable] = useState<string>("");
  const [showProductErrorReport, setShowProductErrorReport] =
    useState<boolean>(false);
  const [isErrorAccordionOpen, setIsErrorAccordionOpen] = useState(
    showProductErrorReport,
  );
  const [errorProductData, setErrorProductData] = useState<VerificationError[]>(
    [],
  );
  const [isReviewClicked, setIsReviewClicked] = useState<boolean>(false);
  // const navigate = useNavigate();
  const router = useRouter();
  const storeId = getStoreId();

  const {
    variantHandle,
    productAssets,
    isVariant,
    title,
    description,
    setTitle,
    setSingleProductData,
    setDescription,
    setCategoryValue,
    setSku,
    setCountryOfOrigin,
    setProductAssets,
    setPackageDetails,
    setWeight,
    setGender,
    setLength,
    setWidth,
    setHeight,
    setProductPrice,
    setDiscountedPrice,
    setHsnCode,
    setProductInventory,
    setPublishChannel,
    setChannelData,
    setProductStatus,
    setProductTypeValue,
    setManufactureAddress,
    setManufactureMonth,
    setManufactureName,
    setEnabledChannels,
    setBrandName,
    setEanNumberCode,
    setOndcExtraData,
    setAmazonExtraData,
    amazonExtraData,
    shopifyExtraData,
    setShopifyExtraData,
    eanNumberCode,
    publishChannel,
    setinventoryStrategy,
    setProductTypeName,
    productTypeValue,
    productStatus,
    // enabledChannels,
    countryOfOrigin,
    categoryValue,
    packageDetails,
    gender,
    productPrice,
    inventoryStrategy,
    discountedPrice,
    hsnCode,
    productInventory,
    setProductListError,
    setPriceSameAllChannel,
    productListError,
    singleProductData,
    ondcExtraData,
    manufactureAddress,
    manufactureMonth,
    manufactureName,
    brand,
  } = useProductStore();

  // variation store
  const {
    updatedVariants,
    setColorVariationValue,
    setSizeSchemaValue,
    setNumberOfItemsVariationValue,
    setScentVariationValue,
    setItemWeightVaritionValue,
    setFlavorVariationValue,
    setVariation,
    variation,
  } = useVariationStore();  

  // submit handle async function
  const submitHandleMutation = useMutation({
    mutationFn: async (payload: ProductPayloadType) => {
      const { data } = await productApi.post("/product", payload, {
        headers: {
          "x-store-id": storeId,
        },
      });
      return data;
    },
    onSuccess: (data) => {
      successToast(data.message || "Product created");
      discardHandle();
      // navigate({
      //   from: "/product/product_create",
      //   to: "/product",
      // });
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError && error.response) {
        errorToast(error.response.data.message);
      } else {
        errorToast("Something went wrong");
      }
    },
  });

  // get store for ennabled channels
  const { data: storeData } = useQuery({
    queryKey: ["storeDetails"],
    queryFn: fetchStoreDetails,
    retry: 0,
  });

  useEffect(() => {
    if (storeData) {
      setEnabledChannels(storeData.enabledChannels);
      setinventoryStrategy(storeData.inventoryStrategy);
    }
  }, [storeData]);

  // update mutation when edit the product
  const updateMutationHandle = useMutation({
    mutationFn: async ({
      payload,
      id,
    }: {
      payload: ProductPayloadType;
      id: string;
    }) => {
      const { data } = await productApi.patch("/product/" + id, payload, {
        headers: {
          "x-store-id": storeId,
        },
      });
      return data;
    },
    onSuccess: (data) => {
      successToast(data.message || "Product updated");
      discardHandle();
      // navigate({
      //   from: "/product/product_create",
      //   to: "/product",
      // });
      setSingleProductData({} as SingleProductType);
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError && error.response) {
        errorToast(error.response.data.message);
      } else {
        errorToast("Something went wrong");
      }
    },
  });
  // gsap scroll events
  gsap.registerPlugin(ScrollTrigger);

  useEffect(() => {
    const animation = gsap.to(".leftSidePanel", {
      scrollTrigger: {
        trigger: ".leftSidePanel",
        start: "top 170",
        end: "200 center",
        pin: ".rightSidePanel",
        pinSpacing: false,
      },
    });

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, []);

  // reload page inventory set
  useEffect(() => {
    if (!inventoryStrategy) {
      storeData && setinventoryStrategy(storeData.inventoryStrategy as string);
    }

    return () => {
      discardHandle(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // set the initial errors
  useEffect(() => {
    const errors: ProductListErrorType = {};

    if (!title) {
      errors.title = "Title is required!";
    }
    if (!brand) {
      errors.brand = "Brand is required!";
    }
    if (!description) {
      errors.description = "Description is required!";
    }
    if (!countryOfOrigin) {
      errors.countryOfOriginerrs = "Country of origin is required!";
    }
    if (!packageDetails?.dimensions.height.value) {
      errors.height = "Height is required!";
    }
    if (!packageDetails?.dimensions.length.value) {
      errors.length = "Length is required!";
    }
    if (!packageDetails?.dimensions.weight.value) {
      errors.weight = "Weight is required!";
    }
    if (!packageDetails?.dimensions.width.value) {
      errors.width = "Width is required!";
    }
    if (!productPrice) {
      errors.productPriceError = "Product price is required!";
    }
    if (!discountedPrice) {
      errors.discountedPrice = "Discounted price is required!";
    }
    if (!hsnCode) {
      errors.hsnCode = "Hsn Code is required!";
    }
    if (!eanNumberCode && !isVariant) {
      errors.eanNumber = "Ean Number is required!";
    } else {
      errors.eanNumber = undefined;
    }
    if (!isVariant && inventoryStrategy !== "SPLIT") {
      if (!productInventory) {
        errors.productInventoryErrsMsg = "Inventory is required!";
      }
    } else {
      errors.productInventoryErrsMsg = undefined;
    }
    if (!categoryValue) {
      errors.category = "Category is required!";
    }
    if (!productTypeValue) {
      errors.productType = "Product type is required!";
    }
    if (!productStatus) {
      errors.status = "Status is required!";
    }
    if (productAssets?.length == 0 || !productAssets) {
      errors.productImage = "Product image is required!";
    } else {
      delete errors.productImage;
    }
    if (isGenderEnable === "Footwear" || isGenderEnable === "Fashion") {
      if (!gender) {
        errors.gender = "Gender is required!";
      }
    }
    if (!publishChannel || (publishChannel && publishChannel.length <= 0)) {
      errors.channelPublishing = "Channel publishing is required!";
    }
    if (!manufactureName) {
      errors.manufactureName = "Manufacture name is required";
    }
    if (!manufactureAddress) {
      errors.manufactureAddress = "Manufacture address is required";
    }
    if (!manufactureMonth) {
      errors.manufactureMonth = "Manufacture month is required";
    }

    setProductListError(errors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    title,
    inventoryStrategy,
    isVariant,
    description,
    isGenderEnable,
    countryOfOrigin,
    productPrice,
    discountedPrice,
    gender,
    productStatus,
    hsnCode,
    productInventory,
    productAssets,
    categoryValue,
    eanNumberCode,
    productTypeValue,
    packageDetails?.dimensions.width.value,
    packageDetails?.dimensions.weight.value,
    packageDetails?.dimensions.length.value,
    packageDetails?.dimensions.height.value,
    manufactureAddress,
    manufactureAddress,
    manufactureMonth,
    brand,
    publishChannel,
  ]);

  // enebale and disable save  button according to errors
  useEffect(() => {
    if (productListError) {
      const errorValues = Object.values(productListError).flat();

      if (
        errorValues.length === 0 ||
        errorValues.every((error) => error === "" || error === undefined)
      ) {
        setSubmitBtnDisable(false);
      } else {
        setSubmitBtnDisable(true);
      }
    } else {
      setSubmitBtnDisable(false);
    }
  }, [productListError]);

  useEffect(() => {
    const errorProductImage: ProductListErrorType = {
      productImage: undefined,
    };
    if (productAssets && productAssets?.length > 0) {
      setProductListError({ ...productListError, ...errorProductImage });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productAssets]);

  useEffect(() => {
    if (gender && productTypeValue) {
      setVariationEnabler(true);
    } else if (productTypeValue) {
      setVariationEnabler(true);
    } else {
      setVariationEnabler(false);
    }
  }, [gender, productTypeValue]);

  const enabledChannels = [] as any;

  // TODO: handle error state
  const handleCheckProductValidation = async () => {
    if (!singleProductData?.id) {
      return errorToast("Missing Product Id");
    }

    try {
      const channelsToCall = (enabledChannels || []).filter(
        (channel: "ONDC" | "AMAZON_IN" | "WIX" | "WOOCOMMERCE" | "SHOPIFY") =>
          channel === "ONDC" || channel === "AMAZON_IN",
      );

      if (!channelsToCall.length) {
        return errorToast("No supported channels enabled.");
      }

      const perChannelRequests = channelsToCall.map(
        (channel: "ONDC" | "AMAZON_IN") => {
          const productId = singleProductData.id;

          switch (channel) {
            case "AMAZON_IN":
              return api.get(`/amazon/product/issues`, {
                params: { productIds: productId },
              });

            case "ONDC":
              return api.get(`/ondc/product/issues`, {
                params: { productIds: productId },
              });

            default:
              return Promise.resolve(null);
          }
        },
      );

      const results = await Promise.allSettled(perChannelRequests);

      const issues: { channel: string; data: any[] }[] = [];
      const errors: { channel: string; error: any }[] = [];

      results.forEach((res, idx) => {
        const channel = channelsToCall[idx];

        if (res.status === "fulfilled") {
          const data = res.value?.data?.data ?? [];
          issues.push({ channel, data });
        } else {
          errors.push({ channel, error: res.reason });
        }
      });

      // ---- Handle Fulfilled Issues ----
      const allIssuesFlattened = issues.flatMap((i) => i.data);

      if (!allIssuesFlattened.length) {
        setIsReviewClicked(true);
        console.log("isReviewClicked: ", isReviewClicked);
        successToast("No issues found for this product.");
      } else {
        setShowProductErrorReport(true);
        setErrorProductData(allIssuesFlattened);
      }

      // ---- Handle Channel-specific Errors ----
      errors.forEach((err) => {
        const msg =
          err.error?.response?.data?.message ||
          err.error?.message ||
          "Unknown error";
        errorToast(`${err.channel} Error: ${msg}`);
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        return successToast(error.response?.data?.message);
      }

      console.error("Failed to fetch product issues:", error);
      errorToast(
        error?.response?.data?.message ||
          "Something went wrong while fetching product issues.",
      );
    }
  };

  // submit the final payload

  const submitHandle = async () => {
    const payload = {
      title: title ?? "",
      brandName: brand ?? "",
      manufacturingInfo: {
        manufacturerOrPackerName: manufactureName || "",
        manufacturerOrPackerAddress: manufactureAddress || "",
        monthOfManufactureOrPacking: manufactureMonth || "",
      },
      description: description ?? "",
      inventoryStrategy: inventoryStrategy ?? "",
      priceStrategy: inventoryStrategy ?? "",
      hsnCode: hsnCode ?? "",
      categoryId: categoryValue ?? "",
      subCategoryId: productTypeValue ?? "",
      packageDetails,
      originCountry: countryOfOrigin ?? "",
      status: productStatus ?? "",
      variantionAttributes: variation,
      extraData: {
        ondc: ondcExtraData,
        amazon: amazonExtraData,
        shopify: shopifyExtraData,
      },
      variants: updatedVariants,
      productAssets: productAssets ?? [],
    };

    if (singleProductData.id) {
      payload.variantionAttributes = singleProductData.variationAttribute || [];

      updateMutationHandle.mutate({
        payload: payload,
        id: singleProductData.id,
      });
    } else {
      submitHandleMutation.mutate(payload);
    }
  };

  // discard button for clear all the form state

  const discardHandle = (nav: boolean = true) => {
    setTitle("");
    setDescription("");
    setCategoryValue("");
    setSku("");
    setCountryOfOrigin("");
    setProductPrice("");
    setDiscountedPrice("");
    setHsnCode("");
    setProductInventory("");
    setPublishChannel(null);
    setChannelData(null);
    setPackageDetails(null);
    setWeight("");
    setLength("");
    setWidth("");
    setProductStatus("");
    setHeight("");
    setProductTypeValue("");
    setProductAssets([]);
    setAssets([]);
    setGender(null);
    setProductTypeName("");
    setPriceSameAllChannel(false);
    setEanNumberCode("");
    variantHandle(false);
    setManufactureAddress("");
    setManufactureName("");
    setManufactureMonth("");
    setSingleProductData({} as SingleProductType);
    setBrandName("");
    setColorVariationValue({} as ColorVariationType);
    setSizeSchemaValue({});
    setNumberOfItemsVariationValue({} as NumberOfItemsVariationType);
    setScentVariationValue({} as ScentVariationType);
    setItemWeightVaritionValue({} as ItemWeightVariationType);
    setFlavorVariationValue({} as FlavorVariationType);
    setVariation([]);
    setOndcExtraData({});
    setAmazonExtraData({});
    setShopifyExtraData({});
    if (nav) router.push("/product");
  };

  // ============================== edit single product===========================

  useEffect(() => {
    if (singleProductData.type === "custom") {
      variantHandle(true);
    }
  }, [singleProductData.type]);

  return (
    <form>
      <div className="bg-[#FCFCFD] pb-7">
        {/* heading */}
        <div className="flex flex-col items-start md:z-30 z-10 sticky sm:top-0 top-[52px] bg-[#FCFCFD] py-12">
          <div className="flex justify-between items-start w-full mt-1">
            <div className="flex flex-col gap-1">
              <h1 className="text-[#101828] md:text-3xl text-lg font-semibold">
                {singleProductData.id ? "Edit" : "Add"} Product
              </h1>
              <p className="text-sm hidden md:block -text-Gray-500">
                Get your product listed easily by providing the details below.
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              <SecondaryButton
                text="Discard"
                className="px-3 py-2 w-fit"
                type="button"
                OnClick={discardHandle}
              />
              {singleProductData?.id && (
                <SecondaryButton
                  text="Review"
                  className="px-3 py-2 w-fit"
                  type="button"
                  OnClick={handleCheckProductValidation}
                />
              )}
              <button
                type="button"
                onClick={submitHandle}
                disabled={submitBtnDisable}
                className="px-4 py-2 bg-[#F75A27] rounded-lg border -border-brand-600-orange-p-1 shadow-shadow-xs text-sm font-semibold text-white hover:-bg-Brand-700 focus:-bg-brand-600-orange-p-1 transition-all duration-300 ease-in-out disabled:-bg-Gray-100 disabled:-text-Gray-400 disabled:-border-Gray-200"
              >
                {singleProductData.id ? "Update" : "Save"}
              </button>
            </div>
          </div>
          <div className="w-full mt-2">
            {/* Error Accordion - Full Width */}
            {showProductErrorReport && (
              <div className="bg-gradient-to-r from-Error-50 to-Error-25 rounded-lg border -border-Error-300 overflow-hidden">
                <div
                  onClick={() => setIsErrorAccordionOpen(!isErrorAccordionOpen)}
                  className="w-full flex items-center justify-between px-6 py-4 cursor-pointer transition-colors duration-200 hover:bg-Error-100/30"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg -bg-Error-100">
                      <AlertCircle size={18} className="-text-Error-600" />
                    </div>
                    <div className="text-left">
                      <span className="block font-semibold -text-Error-700">
                        Product Verification Errors
                      </span>
                      <span className="block text-xs -text-Error-600 mt-0.5">
                        Please fix the issues below before publishing
                      </span>
                    </div>
                    <span className="ml-auto mr-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full -bg-Error-200 -text-Error-700 text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full -bg-Error-600"></span>
                      {errorProductData?.length
                        ? `${errorProductData.length} ${errorProductData.length === 1 ? "issue" : "issues"}`
                        : null}{" "}
                    </span>
                  </div>
                  <ChevronDown
                    size={22}
                    className={cn(
                      "-text-Error-600 transition-transform duration-300 flex-shrink-0",
                      isErrorAccordionOpen && "rotate-180",
                    )}
                  />
                </div>

                {isErrorAccordionOpen && (
                  <>
                    <div className="border-t -border-Error-300" />
                    <div className="bg-white px-6 py-5 animate-in fade-in slide-in-from-top-4 duration-200">
                      <ProductErrorReport errorProductData={errorProductData} />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/*prduct add form*/}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_minmax(0,1.2fr)] gap-5">
          {/* Show images first on mobile, second on desktop */}
          <div className="md:hidden flex flex-col gap-2">
            <div className="bg-white md:p-6 p-3 rounded-xl border -border-Gray-200 shadow-shadow-xs">
              <div className="flex flex-col gap-5">
                <LabelComp
                  name="Product Images"
                  htmlfor="status"
                  asterisk={true}
                  className="text-lg font-semibold -text-Gray-700"
                  errors={productListError && productListError.productImage}
                />
                <div>
                  <ImageList assets={assets} setAssets={setAssets} />
                </div>
              </div>
            </div>
            {/* product status section */}
            <ProductStatus />
          </div>
          {/* left form section */}
          <div className="flex gap-5 flex-col leftSidePanel">
            {/* description */}
            <ProductFormDescription
              setVariationEnabler={setVariationEnabler}
              isGenderEnable={isGenderEnable}
              setIsGenderEnable={setIsGenderEnable}
            />
            {/* Manufatuting */}
            <ProductManufacturing />
            {/* packaging details */}
            <ProductPackage />
            {/* pricing details */}
            <ProductPricing />
            {/* enable variants sections */}
            {variationEnabler && !singleProductData.id && (
              <div className="flex items-center gap-2">
                <SwitchToggleButton
                  inputId="variants"
                  checked={isVariant}
                  onChange={variantHandle}
                />
                <LabelComp
                  name="Do this product have variants like size, colour, etc?"
                  htmlfor="variants"
                />
              </div>
            )}
            {/* Product Inventory */}
            {!isVariant && inventoryStrategy !== "SPLIT" && (
              <ProductInventory />
            )}
            {/* alert quantity */}
            {/* <AlertQuantity /> */}
            {/* Variants */}
            {/* {isVariant && <ProductVariants />} */}
            {variationEnabler && !singleProductData.id && <VariantionsRender />}

            {/* publishing channels */}
            {isVariant ? <ChannelPublishing /> : <ChannelPublishingBasics />}
            {/* additional details enable */}
            <AdditionalDetails />
          </div>
          {/* right image section */}
          <div className="hidden md:flex flex-col gap-2 rightSidePanel h-full max-h-[calc(100vh-200px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="bg-white md:p-6 p-3 rounded-xl border -border-Gray-200 shadow-shadow-xs">
              <div className="flex flex-col md:gap-5 gap-2.5">
                {/* <h2 className="text-lg font-semibold -text-Gray-700">
                  Product Images
                </h2> */}
                <LabelComp
                  name="Product Images"
                  htmlfor="status"
                  asterisk={true}
                  className="md:text-lg font-semibold -text-Gray-700"
                  errors={productListError && productListError.productImage}
                />
                <div>
                  <ImageList assets={assets} setAssets={setAssets} />
                </div>
              </div>
            </div>
            {/* product status section */}
            <ProductStatus />
          </div>
        </div>
      </div>
    </form>
  );
}

export default ProductForm;
