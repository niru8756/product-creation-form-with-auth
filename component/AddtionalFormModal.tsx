import React, { useEffect, useRef, useState } from "react";
import DynamicFormsRenderComp from "./additional-details/DynamicFormsRenderComp";
import CloseIcon from "@/assets/icons/CloseIcon";
import { useProductStore } from "@/store/ProductStore";
import { amazonSchemaApi, api, ondcApi, shopifyApi } from "@/lib/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { errorToast } from "../ui/Toast";
import { cn } from "@/lib/utils";
import { getStoreId } from "@/lib/cookies";
import OndcDynamicFormRender from "./additional-details/OndcDynamicFormRender";
import { flattenNestedObject } from "@/utils/singleProductDataConverter";
import { convertAmzDataToUskData } from "@/utils/convertUskDataToAmzData";
import ShopifyDynamicFormRender from "./additional-details/ShopifyDynamicFormRender";
import { Buffer } from "buffer";

type AddtionalFormModalType = {
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
};

function AddtionalFormModal({ open, setOpen }: AddtionalFormModalType) {
  const popUpRef = useRef<HTMLDivElement>(null);
  const { ondcMetadata, publishChannel, amazonMetadata,shopifyMetadata } = useProductStore();
  const [ondcSchemaData, setOndcSchemaData] = useState<any | null>(null);
  const [amazonSchemaData, setamazonSchemaData] = useState<any | null>(null);
  const [shopifySchemaData, setshopifySchemaData] = useState<any | null>(null);
  const [active, setactive] = useState(0);
  const [activeTab, setActiveTab] = useState(publishChannel?.[0]);
  const [resourceUrl, setResourceUrl] = useState<string | null>(null);
  const {
    ondcExtraData,
    singleProductData,
    amazonExtraData,
    shopifyExtraData,
  } = useProductStore();
  const [ondcInitialData, setOndcInitialData] = useState({});
  const [amazonInitialData, setAmazonInitialData] = useState({});
  const [shopifyInitialData, setShopifyInitialData] = useState({});
  const [isCreationMode, setIsCreationMode] = useState(false);
  const [channelTabs, setChannelTabs] = useState<string[]>([]);
  const [amazonDataProcessed, setAmazonDataProcessed] = useState(false);
  const [ondcDataProcessed, setOndcDataProcessed] = useState(false);
  const [shopifyDataProcessed, setShopifyDataProcessed] = useState(false);
  const [processingKey, setProcessingKey] = useState(0);
  window.Buffer = Buffer;

  const queryClient = useQueryClient();

  useEffect(() => {
    if (publishChannel) {
      if (publishChannel.length > 1 && publishChannel[0] === "DEFAULT") {
        setActiveTab(publishChannel[1]);
      } else {
        setActiveTab(publishChannel[0]);
      }
    }
  }, [publishChannel]);

  useEffect(() => {
    if (publishChannel) {
      const channelList = publishChannel.filter((ch, idx) => {
        if (ch === "DEFAULT") return null;
        return ch;
      });
      setChannelTabs(channelList);
    }
  }, [publishChannel]);

  useEffect(() => {
    const isCreating = Object.keys(singleProductData).length === 0;
    setIsCreationMode(isCreating);
  }, [singleProductData]);

  // ondc

  const ondcSchemaFetch = async () => {
    if (!ondcMetadata?.domain || !ondcMetadata?.category) {
      throw new Error("Domain or category is missing");
    }
    const { data } = await ondcApi.get(
      `/schema?type=${ondcMetadata?.category}`,
    );
    return data;
  };

  const {
    data: ondcData,
    isSuccess: ondcSuccess,
    isError: ondcIsError,
    error: ondcError,
  } = useQuery({
    queryKey: [
      "ondcSchema",
      ondcMetadata?.domain,
      ondcMetadata?.category,
      activeTab,
    ],
    queryFn: ondcSchemaFetch,
    enabled: activeTab === "ONDC",
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });  

  // shopify
  const shopifySchemaFetch = async () => {
    const { data } = await shopifyApi.get(
      `/ecom/shopify/category/attributes?categoryId=${shopifyMetadata?.categoryId}`,
      {
        headers: { "x-store-id": getStoreId() },
      },
    );
    return data;
  };

  const {
    data: shopifyData,
    isSuccess: shopifyIsSuccess,
    isError: shopifyIsError,
    error: shopifyError,
  } = useQuery({
    queryKey: ["shopifySchema"],
    queryFn: shopifySchemaFetch,
    enabled: activeTab === "SHOPIFY",
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  console.log(shopifyData);
  

  //  amazon

  const amazonSchemaFetch = async () => {
    if (!amazonMetadata?.productType) {
      throw new Error("Product type is missing");
    }
    const { data } = await api.get(`/ptype/${amazonMetadata?.productType}`, {
      headers: { "x-store-id": getStoreId() },
    });
    return data;
  };

  const {
    data: amazonData,
    isSuccess: amazonSuccess,
    isError: amazonIsError,
    error: amazonError,
  } = useQuery({
    queryKey: ["amazonSchema", amazonMetadata?.productType, activeTab],
    queryFn: amazonSchemaFetch,
    enabled: activeTab === "AMAZON",
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const fetchResourceData = async (resourceUrl: string) => {
    if (!resourceUrl) {
      throw new Error("Resource URL is missing");
    }
    const { data } = await amazonSchemaApi.get(resourceUrl, {
      withCredentials: false,
    });
    return data;
  };

  useEffect(() => {
    if (amazonSuccess && amazonData && amazonData.schema?.link?.resource) {
      setResourceUrl(amazonData.schema.link.resource);
    }
  }, [amazonData, amazonSuccess]);

  const {
    data: resourceData,
    isSuccess: resourceSuccess,
    isError: resourceIsError,
    error: resourceError,
  } = useQuery({
    queryKey: ["amazonSchemaResource", resourceUrl],
    queryFn: () => fetchResourceData(resourceUrl as string),
    enabled: !!resourceUrl && activeTab === "AMAZON",
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (activeTab === "ONDC" && ondcSuccess && ondcData) {
      setOndcSchemaData(ondcData);
      setOpen && setOpen(true);
    }

    if (activeTab === "SHOPIFY" && shopifyIsSuccess && shopifyData) {
      setshopifySchemaData(shopifyData);
    }

    if (activeTab === "AMAZON" && resourceSuccess && resourceData) {
      setamazonSchemaData(resourceData);
    }
  }, [
    activeTab,
    ondcSuccess,
    ondcData,
    amazonSuccess,
    amazonData,
    resourceSuccess,
    resourceData,
    resourceUrl,
    setOpen,
    shopifyIsSuccess,
    shopifyData,
  ]);

  useEffect(() => {
    if (ondcIsError && ondcError) {
      if (ondcError instanceof AxiosError && ondcError.response) {
        errorToast(ondcError.response.data.message);
      } else {
        errorToast("Something went wrong with ONDC data");
      }
    }
  }, [ondcIsError, ondcError]);

  useEffect(() => {
    if (shopifyIsError && shopifyError) {
      if (shopifyError instanceof AxiosError && shopifyError.response) {
        errorToast(shopifyError.response.data.message);
      } else {
        errorToast("Something went wrong with Shopify data");
      }
    }
  }, [shopifyIsError, shopifyError]);

  useEffect(() => {
    if (amazonIsError && amazonError) {
      if (amazonError instanceof AxiosError && amazonError.response) {
        errorToast(amazonError.response.data.message);
      } else {
        errorToast("Something went wrong with Amazon data");
      }
    }
  }, [amazonIsError, amazonError]);

  useEffect(() => {
    if (resourceIsError && resourceError) {
      if (resourceError instanceof AxiosError && resourceError.response) {
        errorToast(
          resourceError.response.data.message ||
            "Failed to fetch resource data",
        );
      } else {
        errorToast("Something went wrong while fetching resource data");
      }
    }
  }, [resourceIsError, resourceError]);

  useEffect(() => {
    const handleCloseOutsideModal = (e: MouseEvent) => {
      if (popUpRef.current && !popUpRef.current.contains(e.target as Node)) {
        setOpen && setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleCloseOutsideModal);
    return () => {
      document.removeEventListener("mousedown", handleCloseOutsideModal);
    };
  }, [popUpRef, setOpen]);

  const activateTabHandle = (idx: number, tab: string) => {
    setactive(idx);
    const upperCaseTab = tab.toLocaleUpperCase();
    setActiveTab(upperCaseTab);

    // Reset states when switching tabs
    if (upperCaseTab === "AMAZON") {
      queryClient.removeQueries({ queryKey: ["amazonSchema"] });
      queryClient.removeQueries({ queryKey: ["amazonSchemaResource"] });
      setamazonSchemaData(null);
      setResourceUrl(null);
      setAmazonInitialData({});
      setAmazonDataProcessed(false);
    } else if (upperCaseTab === "ONDC") {
      queryClient.removeQueries({ queryKey: ["ondcSchema"] });
      setOndcSchemaData(null);
      setOndcInitialData({});
      setOndcDataProcessed(false);
    } else if (upperCaseTab === "SHOPIFY") {
      queryClient.removeQueries({ queryKey: ["shopifySchema"] });
      setshopifySchemaData(null);
      setShopifyInitialData({});
      setShopifyDataProcessed(false);
    }

    // Increment processing key to force re-processing
    setProcessingKey((prev) => prev + 1);
  };

  useEffect(() => {
    // console.log("Data processing effect triggered", {
    //   activeTab,
    //   processingKey,
    //   ondcSchemaData: !!ondcSchemaData,
    //   amazonSchemaData: !!amazonSchemaData,
    //   ondcExtraData: Object.keys(ondcExtraData || {}).length,
    //   amazonExtraData: Object.keys(amazonExtraData || {}).length,
    //   singleProductData: Object.keys(singleProductData).length,
    // });

    if (activeTab === "ONDC" && ondcSchemaData) {
      // ONDC processing with persistence
      let sourceData = null;

      if (ondcExtraData && Object.keys(ondcExtraData).length > 0) {
        sourceData = ondcExtraData;
      } else if (
        Object.keys(singleProductData).length > 0 &&
        singleProductData.extraData?.ondc
      ) {
        sourceData = singleProductData.extraData.ondc;
      }

      if (sourceData) {
        try {
          const flattenedData = flattenNestedObject(sourceData, "attributes");
          // console.log("ONDC data processed:", flattenedData);
          setOndcInitialData(flattenedData);
        } catch (error) {
          // console.error("Error processing ONDC data:", error);
          setOndcInitialData({});
        }
      } else {
        // console.log("No ONDC source data found, setting empty initial data");
        setOndcInitialData({});
      }

      setOndcDataProcessed(true);
    } else if (activeTab === "AMAZON" && amazonSchemaData) {
      // AMAZON processing
      let sourceData = null;

      if (amazonExtraData && Object.keys(amazonExtraData).length > 0) {
        sourceData = amazonExtraData;
      } else if (
        Object.keys(singleProductData).length > 0 &&
        singleProductData.extraData?.amazon
      ) {
        sourceData = singleProductData.extraData.amazon;
      }

      if (sourceData) {
        try {
          const convertedData = convertAmzDataToUskData(
            sourceData,
            amazonSchemaData,
          );
          // console.log("Amazon data processed:", convertedData);
          setAmazonInitialData(convertedData);
        } catch (error) {
          // console.error("Error converting Amazon data:", error);
          setAmazonInitialData({});
        }
      } else {
        // console.log("No Amazon source data found, setting empty initial data");
        setAmazonInitialData({});
      }

      setAmazonDataProcessed(true);
    } else if (activeTab === "SHOPIFY" && shopifyData) {
      // shopify processing with persistence
      let sourceData = null;

      if (shopifyExtraData && Object.keys(shopifyExtraData).length > 0) {
        sourceData = shopifyExtraData;
      } else if (
        Object.keys(singleProductData).length > 0 &&
        singleProductData.extraData?.shopify
      ) {
        sourceData = singleProductData.extraData.shopify;
      }

      if (sourceData) {
        try {
          const flattenedData = flattenNestedObject(sourceData, "attributes");
          // console.log("SHOPIFY data processed:", flattenedData);
          setShopifyInitialData(flattenedData);
          flattenedData;
        } catch (error) {
          // console.error("Error processing ONDC data:", error);
          setShopifyInitialData({});
        }
      } else {
        // console.log("No SHOPIFY source data found, setting empty initial data");
        setShopifyInitialData({});
      }

      setShopifyDataProcessed(true);
    }
  }, [
    activeTab,
    ondcSchemaData,
    amazonSchemaData,
    ondcExtraData,
    amazonExtraData,
    singleProductData,
    processingKey,
    shopifyData,
  ]);

  const shouldShowAmazonForm = () => {
    return activeTab === "AMAZON" && amazonSchemaData && amazonDataProcessed;
  };

  const shouldShowOndcForm = () => {
    return activeTab === "ONDC" && ondcSchemaData && ondcDataProcessed;
  };

  const shouldShowShopifyForm = () => {
    return activeTab === "SHOPIFY" && shopifySchemaData && shopifyDataProcessed;
  };

  const shouldShowLoading = () => {
    if (activeTab === "AMAZON")
      return !amazonSchemaData || !amazonDataProcessed;
    if (activeTab === "ONDC") return !ondcSchemaData || !ondcDataProcessed;
    if (activeTab === "SHOPIFY")
      return !shopifySchemaData || !shopifyDataProcessed;
    return false;
  };

  // console.log('amazon',amazonExtraData);
  // console.log("ondc",ondcExtraData);

  return (
    <>
      {open && (
        <div className="fixed top-0 flex w-full h-screen bg-Gray-950 bg-opacity-70 backdrop-blur-sm z-40 left-0 justify-center items-center py-9 px-8">
          <div
            ref={popUpRef}
            className="bg-Gray-25 w-full h-full rounded-lg p-3 md:p-6 flex flex-col justify-between md:gap-8 gap-2"
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <p className="text-Gray-950 md:text-xl text-base font-semibold">
                  {isCreationMode
                    ? "Add additional details to list your product"
                    : "Edit additional details of your product"}
                </p>
                <p className="md:text-sm text-xs text-Gray-500">
                  Enhance your product listing with essential details.
                </p>
              </div>
              <div
                onClick={() => setOpen && setOpen(false)}
                className="cursor-pointer"
              >
                {/* <img src={CloseIcon} alt="close-icon" className="h-5 w-5" /> */}
                <CloseIcon />
              </div>
            </div>

            <div className="rounded-lg shadow-shadow-xs flex w-fit">
              {channelTabs?.map((tab, idx) => {
                if (tab === "DEFAULT" || tab === "WOOCOMMERCE" || tab === "WIX") return null;
                return (
                  <button
                    type="button"
                    onClick={() => activateTabHandle(idx, tab)}
                    key={idx}
                    className={cn(
                      "bg-white border border-Gray-300 text-Gray-700 text-sm font-semibold px-4 py-2",
                      {
                        "rounded-l-lg": idx === 0,
                        "rounded-r-lg": idx === channelTabs.length - 1,
                        "border-x": idx !== 0 && idx !== channelTabs.length - 1,
                        "bg-Brand-25 text-brand-600-orange-p-1":
                          idx === active,
                      },
                    )}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col justify-between h-full pe-2 overflow-auto scrollStyle">
              {shouldShowLoading() && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-lg text-Gray-500">
                    {activeTab === "AMAZON"
                      ? !amazonSchemaData
                        ? "Loading Amazon schema..."
                        : "Processing Amazon data..."
                      : activeTab === "SHOPIFY"
                        ? !shopifySchemaData
                          ? "Loading Shopify schema..."
                          : "Processing Shopify data..."
                        : !ondcSchemaData
                          ? "Loading ONDC schema..."
                          : "Processing ONDC data..."}
                  </p>
                </div>
              )}

              {shouldShowOndcForm() && (
                <OndcDynamicFormRender
                  Schema={ondcSchemaData}
                  initialData={ondcInitialData}
                  setOpen={setOpen}
                />
              )}

              {shouldShowShopifyForm() && (
                <ShopifyDynamicFormRender
                  Schema={shopifySchemaData}
                  initialData={shopifyInitialData}
                  setOpen={setOpen}
                />
              )}

              {shouldShowAmazonForm() && (
                <DynamicFormsRenderComp
                  Schema={amazonSchemaData}
                  initialData={amazonInitialData}
                  setOpen={setOpen}
                  activeTab={activeTab}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AddtionalFormModal;
