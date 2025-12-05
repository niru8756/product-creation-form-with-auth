import { useEffect } from "react";
import InputCheckbox from "@/ui/InputCheckbox";
import LabelComp from "@/ui/LabelComp";
import PublishChannelDataGrid from "./PublishChannelDataGrid";
// import SplitInventoryDataTable from "./SplitInventoryDataTable";
import { useProductStore } from "@/store/ProductStore";
import useVariationStore from "@/store/VariationStore";
import { channelDataType } from "@/type/product-type";
import { Variants } from "@/type/variation-type";
import { cn } from "@/lib/utils";
import ProductEanComp from "./ProductEanComp";

function ChannelPublishing() {
  const {
    inventoryStrategy,
    setPublishChannel,
    setChannelData,
    channelData,
    publishChannel,
    isVariant,
    discountedPrice,
    productPrice,
    productListError,
    productInventory,
    singleProductData,
    enabledChannels,
  } = useProductStore();
  const { setVariants } = useVariationStore();

  useEffect(() => {
    setVariants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelData]);

  // Update channel data when inventory or price changes
  useEffect(() => {
    if (
      publishChannel &&
      publishChannel.length > 0 &&
      inventoryStrategy === "UNIFIED"
    ) {
      publishChannel.forEach((channel: string) => {
        // Find existing channel data to preserve price
        const existingChannelData = channelData?.find(
          (data) => data.channelType === channel,
        );
        const channelDataObj: channelDataType = {
          channelType: channel,
          // Use existing price if available, otherwise use productPrice
          price: existingChannelData?.price ?? (productPrice as number),
          quantity: Math.floor(Number(productInventory || 0) / 2),
          mrp: discountedPrice as number,
        };

        setChannelData(null, channel);
        setChannelData(channelDataObj);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productInventory, discountedPrice, publishChannel]);

  const toggleCheckbox = (val: string, checked: boolean = false) => {
    setPublishChannel(val, checked);

    if (checked) {
      // Add the channelData when checked
      const channelDataObj: channelDataType = {
        channelType: val,
        price: productPrice as number,
        quantity: productInventory as number,
        mrp: discountedPrice as number,
      };
      setChannelData(channelDataObj);
    } else {
      // Remove the channelData when unchecked
      setChannelData(null, val);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="p-3 md:p-6 flex flex-col gap-5 border border-Gray-200 bg-white rounded-xl shadow-xs">
        <div className="">
          <h3 className="text-Gray-700 md:text-lg text-base font-semibold">
            Publishing Channels
            <span
              className={cn({
                "text-Error-500": productListError?.channelPublishing,
              })}
            >
              *
            </span>
          </h3>
        </div>
        <div className="flex flex-col gap-5">
          <div className="grid md:grid-cols-3 grid-cols-2 gap-2 justify-center items-center">
            {enabledChannels.includes("ONDC") && (
              <div className="flex gap-2.5 items-center">
                <InputCheckbox
                  inputId="ondc"
                  value="ONDC"
                  onChange={toggleCheckbox}
                  checked={publishChannel?.includes("ONDC")}
                />
                <LabelComp
                  htmlfor="ondc"
                  name="ONDC"
                  className="text-Gray-700"
                />
              </div>
            )}
            {enabledChannels.includes("DEFAULT") && (
              <div className="flex gap-2.5 items-center">
                <InputCheckbox
                  inputId="deafult"
                  value="DEFAULT"
                  onChange={toggleCheckbox}
                  checked={publishChannel?.includes("DEFAULT")}
                />
                <LabelComp
                  htmlfor="deafult"
                  name="Default"
                  className="text-Gray-700"
                />
              </div>
            )}
            {enabledChannels.includes("AMAZON_IN") && (
              <div className="flex gap-2.5 items-center">
                <InputCheckbox
                  inputId="amazon"
                  value="AMAZON"
                  onChange={toggleCheckbox}
                  checked={publishChannel?.includes("AMAZON")}
                />
                <LabelComp
                  htmlfor="amazon"
                  name="Amazon"
                  className="text-Gray-700"
                />
              </div>
            )}
            {enabledChannels.includes("WOOCOMMERCE") && (
              <div className="flex gap-2.5 items-center">
                <InputCheckbox
                  inputId="woocommerce"
                  value="WOOCOMMERCE"
                  onChange={toggleCheckbox}
                  checked={publishChannel?.includes("WOOCOMMERCE")}
                />
                <LabelComp
                  htmlfor="woocommerce"
                  name="WOO-COMMERCE"
                  className="text-Gray-700"
                />
              </div>
            )}
            {enabledChannels.includes("SHOPIFY") && (
              <div className="flex gap-2.5 items-center">
                <InputCheckbox
                  inputId="shopify"
                  value="SHOPIFY"
                  onChange={toggleCheckbox}
                  checked={publishChannel?.includes("SHOPIFY")}
                />
                <LabelComp
                  htmlfor="shopify"
                  name="SHOPIFY"
                  className="text-Gray-700"
                />
              </div>
            )}

            {enabledChannels.includes("WIX") && (
              <div className="flex gap-2.5 items-center">
                <InputCheckbox
                  inputId="wix"
                  value="WIX"
                  onChange={toggleCheckbox}
                  checked={publishChannel?.includes("WIX")}
                />
                <LabelComp
                  htmlfor="wix"
                  name="WIX"
                  className="text-Gray-700"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {
        isVariant
          ? publishChannel &&
            publishChannel.length > 0 && (
              <>
                {/* products variant ean number */}
                <ProductEanComp />
                <PublishChannelDataGrid
                  channelList={publishChannel}
                  initialVariants={
                    singleProductData &&
                    (singleProductData.variants as unknown as Variants[])
                  }
                />
              </>
            )
          : null
        // publishChannel &&
        //   publishChannel.length > 0 && (
        //     <SplitInventoryDataTable channelList={publishChannel} />
        //   )
      }
    </div>
  );
}

export default ChannelPublishing;
