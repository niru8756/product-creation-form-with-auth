/* eslint-disable */
// @ts-nocheck
import { useEffect, useState } from "react";
import InputSelect from "@/ui/InputSelect";
import LabelComp from "@/ui/LabelComp";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProductStore } from "@/store/ProductStore";
import {
  UnitValue,
  PackageDimensionType,
  Packagedetails,
} from "@/types/productTypes";

type WeightUnit = "KG" | "GM" | "MG" | "OZ" | "LB" | "T";
type WeightValue =
  | "kilograms"
  | "grams"
  | "milligrams"
  | "ounces"
  | "pounds"
  | "tons";
type DimensionUnit = "CM" | "MT" | "IN" | "FT" | "MI";
type DimensionValue = "centimeters" | "meters" | "inches" | "feet" | "miles";

type WeightUnitType = {
  id: WeightValue;
  name: WeightUnit;
};

type DimensionUnitType = {
  id: DimensionValue;
  name: DimensionUnit;
};

type PackageDetailsType = {
  weight: number;
  length: number;
  width: number;
  height: number;
};

const PackegDimensionSchema = z
  .string()
  .transform((val) => parseFloat(val))
  .refine((val) => !isNaN(val), { message: "Must be a valid number." });

const PackageDetailSchema = z.object({
  weight: PackegDimensionSchema.refine((val) => val > 0, {
    message: "Weight must be greater than zero.",
  }),
  length: PackegDimensionSchema.refine((val) => val > 0, {
    message: "Length must be greater than zero.",
  }),
  width: PackegDimensionSchema.refine((val) => val > 0, {
    message: "Width must be greater than zero.",
  }),
  height: PackegDimensionSchema.refine((val) => val > 0, {
    message: "Height must be greater than zero.",
  }),
});

function ProductPackage() {
  const {
    setPackageDetails,
    productListError,
    setProductListError,
    singleProductData,
    weight,
    setWeight,
    length,
    setLength,
    width,
    setWidth,
    height,
    setHeight,
  } = useProductStore();
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PackageDetailsType>({
    resolver: zodResolver(PackageDetailSchema),
    mode: "onChange",
    defaultValues: {
      weight: singleProductData.weightDimensions?.value || "",
      length: singleProductData.lengthDimensions?.value || "",
      width: singleProductData.widthDimensions?.value || "",
      height: singleProductData.heightDimensions?.value || "",
    },
  });
  const weightItems: WeightUnitType[] = [
    { id: "kilograms", name: "KG" },
    { id: "grams", name: "GM" },
    { id: "milligrams", name: "MG" },
    { id: "ounces", name: "OZ" },
    { id: "pounds", name: "LB" },
    { id: "tons", name: "T" },
  ];
  const lengthItems: DimensionUnitType[] = [
    { id: "centimeters", name: "CM" },
    { id: "meters", name: "MT" },
    { id: "inches", name: "IN" },
    { id: "feet", name: "FT" },
    { id: "miles", name: "MI" },
  ];
  // const [weight, setWeight] = useState('')
  const [weightMenulist, setWeightMenulist] = useState("KG");
  const [lengthMenulist, setLengthMenulist] = useState("CM");
  const [widthMenulist, setWidthMenulist] = useState("CM");
  const [heightMenulist, setHeightMenulist] = useState("CM");

  const [weightUnit, setWeightUnit] = useState("kilograms");
  const [lengthUnit, setlengthUnit] = useState("centimeters");
  const [widthUnit, setwidthUnit] = useState("centimeters");
  const [heightUnit, setheightUnit] = useState("centimeters");

  const weightUnitHandle = (unit: string) => {
    setWeightUnit(unit);
  };
  const lengthUnitHandle = (unit: string) => {
    setlengthUnit(unit);
  };
  const widthUnitHandle = (unit: string) => {
    setwidthUnit(unit);
  };
  const heightUnitHandle = (unit: string) => {
    setheightUnit(unit);
  };

  useEffect(() => {
    setWeight(watch("weight"));
  }, [watch("weight")]);

  useEffect(() => {
    setLength(watch("length"));
  }, [watch("length")]);

  useEffect(() => {
    setWidth(watch("width"));
  }, [watch("width")]);

  useEffect(() => {
    setHeight(watch("height"));
  }, [watch("height")]);

  useEffect(() => {
    const weightValue: UnitValue = {
      unit: weightUnit,
      value: Number(errors.weight === undefined ? weight : 0),
    };
    const lengthValue: UnitValue = {
      unit: lengthUnit,
      value: Number(errors.length === undefined ? length : 0),
    };
    const widthValue: UnitValue = {
      unit: widthUnit,
      value: Number(errors.width === undefined ? width : 0),
    };
    const heightValue: UnitValue = {
      unit: heightUnit,
      value: Number(errors.height === undefined ? height : 0),
    };
    const packageDetailsObj: Packagedetails = {
      dimensions: {
        weight: weightValue,
        length: lengthValue,
        width: widthValue,
        height: heightValue,
      } as PackageDimensionType,
    };

    setPackageDetails(packageDetailsObj);
  }, [
    weight,
    length,
    width,
    height,
    weightUnit,
    lengthUnit,
    widthUnit,
    heightUnit,
  ]);

  // errors sets
  useEffect(() => {
    const errorHeights = {
      height: errors.height?.message,
    };
    setProductListError({ ...productListError, ...errorHeights });
  }, [errors.height]);

  useEffect(() => {
    const errorWeight = {
      weight: errors.weight?.message,
    };
    setProductListError({ ...productListError, ...errorWeight });
  }, [errors.weight]);

  useEffect(() => {
    const errorLength = {
      length: errors.length?.message,
    };
    setProductListError({ ...productListError, ...errorLength });
  }, [errors.length]);

  useEffect(() => {
    const errorWidth = {
      width: errors.width?.message,
    };
    setProductListError({ ...productListError, ...errorWidth });
  }, [errors.width]);

  //  ============================== single product data ==============================
  useEffect(() => {
    if (
      singleProductData.heightDimensions ||
      singleProductData.widthDimensions ||
      singleProductData.weightDimensions ||
      (singleProductData.lengthDimensions &&
        Object.keys(singleProductData).length > 0)
    ) {
      // Set the form values using setValue from react-hook-form
      setValue("height", singleProductData.heightDimensions?.value);
      setValue("width", singleProductData.widthDimensions?.value);
      setValue("weight", singleProductData.weightDimensions?.value);
      setValue("length", singleProductData.lengthDimensions?.value);

      // Set the units

      const matchedWeigthUnit = weightItems.find((weightUnit) => {
        return weightUnit.id === singleProductData.weightDimensions?.unit;
      });

      const matchedLengthUnit = lengthItems.find((lengthUnit) => {
        return lengthUnit.id === singleProductData.lengthDimensions?.unit;
      });
      const matchedWidthUnit = lengthItems.find((widthUnit) => {
        return widthUnit.id === singleProductData.widthDimensions?.unit;
      });
      const matchedHeightUnit = lengthItems.find((heightUnit) => {
        return heightUnit.id === singleProductData.heightDimensions?.unit;
      });
      if (matchedWeigthUnit) {
        setWeightMenulist(matchedWeigthUnit.name);
        setWeightUnit(singleProductData.weightDimensions?.unit);
      }
      if (matchedLengthUnit) {
        setLengthMenulist(matchedLengthUnit.name);
        setlengthUnit(singleProductData.lengthDimensions?.unit);
      }
      if (matchedWidthUnit) {
        setWidthMenulist(matchedWidthUnit.name);
        setwidthUnit(singleProductData.widthDimensions?.unit);
      }
      if (matchedHeightUnit) {
        setHeightMenulist(matchedHeightUnit.name);
        setheightUnit(singleProductData.heightDimensions?.unit);
      }
    }
  }, [
    singleProductData.heightDimensions,
    singleProductData.widthDimensions,
    singleProductData.weightDimensions,
    singleProductData.lengthDimensions,
  ]);

  return (
    <div className="md:p-6 p-3 flex flex-col md:gap-5 gap-2.5 border border-Gray-200 bg-white rounded-xl shadow-xs">
      <div className="">
        <h3 className="text-Gray-700 md:text-lg text-base font-semibold">Package</h3>
      </div>
      <div className="grid md:grid-cols-4 grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <LabelComp
            name="Weight"
            htmlfor="weight"
            asterisk={true}
            errors={productListError && productListError.weight}
          />
          <InputSelect
            inputId="weight"
            items={weightItems}
            placeHolder="0"
            getValue={weightUnitHandle}
            categoryInput={true}
            register={register}
            error={errors.weight}
            showMenuItem={weightMenulist}
            setShowMenuItem={setWeightMenulist}
            value={weight as number}
            name="weight"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <LabelComp
            name="Length"
            htmlfor="length"
            asterisk={true}
            errors={productListError && productListError.length}
          />
          <InputSelect
            inputId="length"
            items={lengthItems}
            getValue={lengthUnitHandle}
            placeHolder="0"
            categoryInput={true}
            showMenuItem={lengthMenulist}
            setShowMenuItem={setLengthMenulist}
            register={register}
            error={errors.length}
            name="length"
            value={length as number}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <LabelComp
            name="Width"
            htmlfor="width"
            asterisk={true}
            errors={productListError && productListError.width}
          />
          <InputSelect
            inputId="width"
            items={lengthItems}
            placeHolder="0"
            getValue={widthUnitHandle}
            categoryInput={true}
            showMenuItem={widthMenulist}
            setShowMenuItem={setWidthMenulist}
            register={register}
            error={errors.width}
            name="width"
            value={width as number}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <LabelComp
            name="Height"
            htmlfor="height"
            asterisk={true}
            errors={productListError && productListError.height}
          />
          <InputSelect
            inputId="height"
            items={lengthItems}
            placeHolder="0"
            getValue={heightUnitHandle}
            categoryInput={true}
            showMenuItem={heightMenulist}
            setShowMenuItem={setHeightMenulist}
            register={register}
            error={errors.height}
            name="height"
            value={height as number}
          />
        </div>
      </div>
    </div>
  );
}

export default ProductPackage;
