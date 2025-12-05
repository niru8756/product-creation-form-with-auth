/* eslint-disable */
// @ts-nocheck
import { useForm } from "react-hook-form";
import InputComp from "@/ui/InputComp";
import LabelComp from "@/ui/LabelComp";
import RupeeIcon from "@/assets/icons/RupeeTcon";
import InfoIcon from "@/assets/icons/InfoIcon";
import InputCheckbox from "@/ui/InputCheckbox";
import { z, ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useProductStore } from "@/store/ProductStore";
import { api } from "@/lib/axios";

type ProductPriceType = {
  price: number;
  compareprice: number;
  hsnCode?: string;
  eanNumber?: string;
};

const NumberSchema = z
  .union([
    z.string().transform((val) => {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }),
    z.number(),
  ])
  .refine((val) => val !== undefined && val > 0, {
    message: "Must be a valid number greater than zero.",
  });

const PriceSchema: ZodType<ProductPriceType> = z
  .object({
    price: NumberSchema,
    compareprice: NumberSchema,
    hsnCode: z.string().min(1, { message: "HSN Code is required" }),
    eanNumber: z
      .string()
      .min(1, { message: "EAN Number is required" })
      .refine(
        (val) => {
          if (val === "") return false;
          return /^\d{8}$/.test(val) || /^\d{13}$/.test(val);
        },
        {
          message: "EAN must be 8 or 13 digits",
        },
      ),
  })
  .superRefine((data, ctx) => {
    if (data.price >= data.compareprice) {
      ctx.addIssue({
        code: "custom",
        path: ["price"],
        message: "Price must be less than compare price.",
      });
    }
  });

function ProductPricing() {
  const {
    register,
    watch,
    trigger,
    setValue,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<ProductPriceType>({
    resolver: zodResolver(PriceSchema),
    mode: "onChange",
    defaultValues: {
      price: undefined,
      compareprice: undefined,
      hsnCode: "",
      eanNumber: "",
    },
  });
  const {
    ondcPrice,
    defaultPrice,
    setOndcPrice,
    setDefaultPrice,
    productPrice,
    discountedPrice,
    setProductPrice,
    isPriceSameAllChannel,
    setPriceSameAllChannel,
    setDiscountedPrice,
    hsnCode,
    setHsnCode,
    productListError,
    setProductListError,
    singleProductData,
    setEanNumberCode,
    eanNumberCode,
    isVariant,
  } = useProductStore();

  // check EAN is valid or not

  const fetchEanValidation = async (value: string) => {
    try {
      const { data } = await api.get(
        `/product/external-product-identifier?type=EAN&value=${value}`,
      );
      return data;
    } catch (error) {
      console.log(error);
    }
  };

  const price = Number(watch("price"));
  const productDiscountedPrice = Number(watch("compareprice"));
  const hsnCodeValue = errors.hsnCode === undefined ? watch("hsnCode") : "";
  const eanNumberValue =
    errors.eanNumber === undefined ? watch("eanNumber") : "";

  useEffect(() => {
    setOndcPrice(price);
    setDefaultPrice(price);
    setProductPrice(price);
  }, [price]);

  useEffect(() => {
    if (price || discountedPrice) {
      trigger(["price", "compareprice"]);
    }
  }, [price, productDiscountedPrice, trigger]);

  useEffect(() => {
    setHsnCode(hsnCodeValue as string);
  }, [hsnCodeValue]);

  useEffect(() => {
    setEanNumberCode(eanNumberValue as string);
  }, [eanNumberValue]);

  useEffect(() => {
    setDiscountedPrice(productDiscountedPrice);
  }, [productDiscountedPrice]);

  //   remove white space from start and end

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "hsnCode" || name === "eanNumber") {
        const currentValue = value[name];
        const trimmedValue = currentValue?.trim();
        if (currentValue && currentValue !== trimmedValue) {
          setValue(name, trimmedValue, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [setValue, watch]);

  useEffect(() => {
    const errorPrice = {
      productPriceError: errors.price?.message,
    };

    setProductListError({ ...productListError, ...errorPrice });
  }, [errors.price]);

  useEffect(() => {
    const errorComparePrice = {
      discountedPrice: errors.compareprice?.message,
    };

    setProductListError({ ...productListError, ...errorComparePrice });
  }, [errors.compareprice]);

  useEffect(() => {
    const errorHsnCode = {
      hsnCode: errors.hsnCode?.message,
    };

    setProductListError({ ...productListError, ...errorHsnCode });
  }, [errors.hsnCode]);

  useEffect(() => {
    const errorEanNumber = {
      eanNumber: errors.eanNumber?.message,
    };

    setProductListError({ ...productListError, ...errorEanNumber });
  }, [errors.eanNumber]);

  const samePriceHandle = (val: string, checked?: boolean) => {
    if (checked) {
      setPriceSameAllChannel(true);
    } else {
      setPriceSameAllChannel(false);
    }
  };

  useEffect(() => {
    if (isPriceSameAllChannel) {
      setOndcPrice(price);
      setDefaultPrice(price);
    } else {
      setOndcPrice(ondcPrice);
      setDefaultPrice(defaultPrice);
    }
  }, [isPriceSameAllChannel]);

useEffect(() => {
  if (
    !singleProductData?.id && 
    (eanNumberValue?.length === 8 || eanNumberValue?.length === 13)
  ) {
    const timer = setTimeout(async () => {
      const data = await fetchEanValidation(eanNumberValue);

      if (data?.data?.value) {
        setError("eanNumber", {
          type: "manual",
          message: "This EAN number is already used.",
        });
      } else if (data?.data === null) {
        clearErrors("eanNumber");
      }
    }, 500);

    return () => clearTimeout(timer);
  }
}, [eanNumberValue, setError, clearErrors, singleProductData?.id]);


  // ================================ edit single product data ==========================
  // Fix the useEffect that sets form values from singleProductData
  useEffect(() => {
    if (singleProductData && Object.keys(singleProductData).length > 0) {
      setProductPrice(singleProductData.productPrice);
      setDiscountedPrice(singleProductData.discountedPrice);
      setHsnCode(singleProductData.hsnCode);
      setEanNumberCode(singleProductData.eanNumber);
      // Convert numbers to strings when setting form values
      setValue("compareprice", String(singleProductData.discountedPrice));
      setValue("hsnCode", singleProductData.hsnCode);
      setValue("price", String(singleProductData.productPrice));
      setValue("eanNumber", singleProductData.eanNumber);
    }
  }, [
    singleProductData.discountedPrice,
    singleProductData.productPrice,
    singleProductData.hsnCode,
    singleProductData.eanNumber,
    setValue,
  ]);

  return (
    <div className="md:p-6 p-3 flex flex-col md:gap-5 gap-2.5 border border-Gray-200 bg-white rounded-xl shadow-xs">
      <div className="">
        <h3 className="text-Gray-700 md:text-lg text-base font-semibold">Pricing</h3>
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <LabelComp
            name="Price"
            htmlfor="price"
            asterisk={true}
            errors={productListError && productListError.productPriceError}
          />
          <InputComp
            placeHolder="0.00"
            type="number"
            name="price"
            inputid="price"
            register={register}
            StartIcon={<RupeeIcon />}
            error={errors.price}
            // value={productPrice as string}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <LabelComp
            name="Compare at Price"
            htmlfor="compareprice"
            asterisk={true}
            errors={productListError && productListError.discountedPrice}
          />
          <InputComp
            placeHolder="0.00"
            type="number"
            name="compareprice"
            inputid="compareprice"
            register={register}
            StartIcon={<RupeeIcon/>}
            EndIcon={<InfoIcon />}
            tooltip={true}
            error={errors.compareprice}
            tooltipText="Shows the original price to highlight discounts on the current selling price."
            // value={discountedPrice as string}
          />
        </div>
      </div>
      <div className="flex gap-2.5">
        <InputCheckbox
          inputId="samePrice"
          value="samePrice"
          onChange={samePriceHandle}
        />
        <LabelComp
          htmlfor="samePrice"
          name="Use the same pricing across all sales channels"
          className="text-Gray-700"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-col gap-1.5">
          <LabelComp
            name="HSN Code"
            htmlfor="hsn"
            asterisk={true}
            errors={productListError && productListError.hsnCode}
          />
          <InputComp
            placeHolder="Enter HSN code"
            type="text"
            name="hsnCode"
            inputid="hsn"
            register={register}
            error={errors.hsnCode}
            // value={hsnCode as string}
          />
        </div>
        <p className="md:text-sm text-xs text-Gray-600">
          Product pricing will be inclusive of taxes but you would need HSN
          code.
        </p>
      </div>
      {/* ean number */}
      {!isVariant && (
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-col gap-1.5">
            <LabelComp
              name="EAN Number"
              htmlfor="ean"
              asterisk={true}
              errors={productListError && productListError.eanNumber}
            />
            <InputComp
              placeHolder="Enter EAN Number"
              type="text"
              name="eanNumber"
              inputid="ean"
              register={register}
              error={errors.eanNumber}
              disabled={singleProductData.id ? true : false}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductPricing;
