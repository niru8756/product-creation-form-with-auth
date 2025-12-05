import { useEffect } from "react";
import InputComp from "@/ui/InputComp";
import LabelComp from "@/ui/LabelComp";
import SingleDatePicker from "@/ui/SingleDatePicker";
import { z, ZodType } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProductStore } from "@/store/ProductStore";
import { ProductListErrorType } from "@/type/product-type";
import useSpaceControl from "@/hooks/useSpaceControl";

type ManufacturingType = {
  manufactureName: string;
  manufactureAddress: string;
  manufactureMonth?: string;
};

const ProductManufacturingShema = z.object({
  manufactureName: z
    .string()
    .min(1, { message: "Manufacture name is required" }),
  manufactureAddress: z
    .string()
    .min(1, { message: "Manufacture address is required" }),
  manufactureMonth: z.string().optional(),
});

function ProductManufacturing() {
  const {
    setManufactureAddress,
    setManufactureMonth,
    setManufactureName,
    productListError,
    setProductListError,
    manufactureAddress,
    manufactureMonth,
    manufactureName,
    singleProductData,
  } = useProductStore();
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ManufacturingType>({
    resolver: zodResolver(ProductManufacturingShema),
    mode: "onChange",
    defaultValues: {
      manufactureName:
        singleProductData?.manufacturingInfo?.manufacturerOrPackerName || "",
      manufactureAddress:
        singleProductData.manufacturingInfo?.manufacturerOrPackerAddress || "",
      manufactureMonth:
        singleProductData.manufacturingInfo?.monthOfManufactureOrPacking || "",
    },
  });

  const name = watch("manufactureName");
  const address = watch("manufactureAddress");
  const month = watch("manufactureMonth");

   // remove white space from start and end

  useSpaceControl(name, setValue, "manufactureName");
  useSpaceControl(address, setValue, "manufactureAddress");

  useEffect(() => {
    setManufactureName(name.trim());
  }, [name]);

  useEffect(() => {
    setManufactureAddress(address.trim());
  }, [address]);

  useEffect(() => {
    setManufactureMonth(month as string);
  }, [month]);


  useEffect(() => {
    const errorManufactureName: ProductListErrorType = {
      manufactureName: errors.manufactureName?.message,
    };

    setProductListError({ ...productListError, ...errorManufactureName });
  }, [errors.manufactureName, manufactureName]);

  useEffect(() => {
    const errorManufactureAddress: ProductListErrorType = {
      manufactureAddress: errors.manufactureAddress?.message,
    };

    setProductListError({ ...productListError, ...errorManufactureAddress });
  }, [errors.manufactureAddress, manufactureAddress]);

  useEffect(() => {
    const errorManufactureMonth: ProductListErrorType = {
      manufactureMonth: errors.manufactureMonth?.message,
    };

    setProductListError({ ...productListError, ...errorManufactureMonth });
  }, [errors.manufactureMonth, manufactureMonth]);

  const setDateValue = (date: Date | undefined | string) => {
    setManufactureMonth(date as string);
  };
  // ================================ edit product data ================================
  useEffect(() => {
    if (
      Object.keys(singleProductData).length > 0 &&
      singleProductData.manufacturingInfo
    ) {
      setValue(
        "manufactureName",
        singleProductData.manufacturingInfo.manufacturerOrPackerName,
      );
      setValue(
        "manufactureAddress",
        singleProductData.manufacturingInfo.manufacturerOrPackerAddress,
      );
      setValue(
        "manufactureMonth",
        singleProductData.manufacturingInfo.monthOfManufactureOrPacking,
      );

      setManufactureAddress(
        singleProductData.manufacturingInfo.manufacturerOrPackerAddress,
      );
      setManufactureMonth(
        singleProductData.manufacturingInfo.monthOfManufactureOrPacking,
      );
      setManufactureName(
        singleProductData.manufacturingInfo.manufacturerOrPackerName,
      );
    }
  }, [
    singleProductData.manufacturingInfo,
    setManufactureAddress,
    setManufactureMonth,
    setManufactureName,
  ]);

  return (
    <div className="md:p-6 p-3 flex flex-col md:gap-5 gap-2.5 border border-Gray-200 bg-white rounded-xl shadow-xs">
      <div className="">
        <h3 className="text-Gray-700 md:text-lg text-base font-semibold">Manufacturing</h3>
      </div>
      <div className="flex flex-col gap-1.5">
        <LabelComp
          name="Manufacturer Name"
          htmlfor="manufactureName"
          asterisk={true}
          errors={productListError && productListError.manufactureName}
        />
        <InputComp
          placeHolder="Enter manufacturer name"
          type="text"
          name="manufactureName"
          inputid="manufactureName"
          register={register}
          error={errors.manufactureName}
          // value={manufactureName as string}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <LabelComp
          name="Manufacturer Address"
          htmlfor="manufactureAddress"
          asterisk={true}
          errors={productListError && productListError.manufactureAddress}
        />
        <InputComp
          placeHolder="Enter manufacturer address"
          type="text"
          name="manufactureAddress"
          inputid="manufactureAddress"
          register={register}
          error={errors.manufactureAddress}
          // value={manufactureAddress as string}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <LabelComp
          name="Manufacturing Month Of Year"
          htmlfor="manufactureMonth"
          asterisk={true}
          errors={productListError && productListError.manufactureMonth}
        />
        <SingleDatePicker
          setDateValue={setDateValue}
          monthYearOnly={true}
          initialDate={
            singleProductData?.manufacturingInfo?.monthOfManufactureOrPacking
          }
        />
      </div>
    </div>
  );
}

export default ProductManufacturing;
