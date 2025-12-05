/* eslint-disable */
// @ts-nocheck
import LabelComp from "./LabelComp";
import SelectComp from "./SelectComp";
import SecondaryButton from "./SecondaryButton";
import MultiSelectComp from "./MultiSelectComp";
import PlusIcon from "../icons/PlusIcon";
import { cn } from "@/lib/utils";
import { Fragment, useEffect, useState } from "react";
import EditIcon from "@/assets/icons/edit-02.svg";
import { useProductStore } from "@/stores/ProductStore";
import { productApi } from "@/lib/axios";
import { successToast } from "./Toast";

export interface OptionType {
  readonly value: string;
  readonly label: string;
  readonly color?: string;
}

const sizeOption: OptionType[] = [
  { value: "s", label: "S" },
  { value: "m", label: "M" },
  { value: "l", label: "L" },
  { value: "xl", label: "XL" },
  { value: "2xl", label: "2XL" },
  { value: "3xl", label: "3XL" },
  { value: "4xl", label: "4XL" },
];

export const colourOptions: OptionType[] = [
  { value: "ocean", label: "Ocean", color: "#00B8D9" },
  { value: "blue", label: "Blue", color: "#0052CC" },
  { value: "purple", label: "Purple", color: "#5243AA" },
  { value: "red", label: "Red", color: "#FF5630" },
  { value: "orange", label: "Orange", color: "#FF8B00" },
  { value: "yellow", label: "Yellow", color: "#FFC400" },
  { value: "green", label: "Green", color: "#36B37E" },
  { value: "forest", label: "Forest", color: "#00875A" },
  { value: "slate", label: "Slate", color: "#253858" },
  { value: "silver", label: "Silver", color: "#666666" },
];

export interface Variant {
  variantName: string | null;
  values: OptionType[];
  id: number;
  amazonPrice?: number;
  flipkartPrice?: number;
}

const variantOptions = [
  {
    id: "size",
    name: "Size",
  },
  {
    id: "color",
    name: "Color",
  },
];

// variants fetch

function ProductVariants() {
  const [variatValues, setVariatValues] = useState<OptionType[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [variantOption, setVariantOption] = useState("");
  const [isOptionEnable, setIsOptionEnable] = useState(true);
  const [variantEnable, setVariantEnable] = useState(false);
  const [showMenuItem, setShowMenuItem] = useState("");
  const [multiValueSelect, setMultiValueSelect] = useState<OptionType[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [option, setoption] = useState<OptionType[]>([]);
  let [id, setid] = useState(0);

  const { productVariant, setProductVariant, productTypeName, gender } =
    useProductStore();

  useEffect(() => {
    if (variantOption === "Size") {
      setoption(sizeOption);
    } else {
      setoption(colourOptions);
    }
  }, [variantOption]);

  const getValueHandle = (val: string) => {
    setVariantOption(val);
  };

  const getMultiValueHandle = (val: OptionType[]) => {
    setVariatValues(val);
  };

  const saveVariantHandle = () => {
    if (editId) {
      const index = variants.findIndex((variant) => variant.id === editId);
      variants.splice(index, 1, {
        variantName: variantOption,
        values: variatValues,
        id: editId,
      });
      setVariants([...variants]);
      setEditId(null);
    } else {
      id++;
      setid(id);
      setVariants([
        ...variants,
        { variantName: variantOption, values: variatValues, id: id },
      ]);
    }
    setIsOptionEnable(false);
    setVariantEnable(true);
    setVariantOption("");
    setMultiValueSelect([]);
    setShowMenuItem("");
  };

  const addOptionHandle = () => {
    setIsOptionEnable(true);
  };
  const editVAriant = (id: number) => {
    const editItem = variants.find((variant) => variant.id === id);
    setIsOptionEnable(true);
    setVariantOption(editItem?.variantName || "");
    setShowMenuItem(editItem?.variantName || "");
    setMultiValueSelect([...(editItem?.values || [])]);
    setEditId(editItem?.id || null);
  };

  useEffect(() => {
    setProductVariant(variants);
  }, [variants]);


  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "p-6 flex flex-col gap-5 border border-Gray-200 bg-white rounded-xl shadow-xs",
          { "rounded-br-none rounded-bl-none border-b-0": variantEnable },
        )}
      >
        <div>
          <h3 className="text-Gray-700 text-lg font-semibold">Variants</h3>
        </div>

        {variantEnable && (
          <div className="flex flex-col gap-5">
            {variants.map((variant, idx) => {
              return (
                <Fragment key={idx}>
                  <div className="flex justify-start items-center gap-2">
                    <div className="text-Gray-700 text-sm font-medium">
                      {variant.variantName}
                    </div>
                    <button onClick={() => editVAriant(variant.id)}>
                      <img src={EditIcon} alt="edit icon" />
                    </button>
                  </div>
                  <div className="flex gap-2 justify-start items-center">
                    {variant.variantName !== "Color" &&
                      variant.values.map((value, idx) => {
                        return (
                          <div
                            key={idx}
                            className="text-sm font-medium text-Gray-700 px-1.5 bg-Gray-100 rounded-sm"
                          >
                            {value.label}
                          </div>
                        );
                      })}
                    {variant.variantName === "Color" &&
                      variant.values.map((value, idx) => {
                        return (
                          <div
                            key={idx}
                            className="border border-Gray-300 bg-white rounded-lg flex gap-2 px-2.5 py-1 items-center"
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: value.color }}
                            ></div>
                            <div className="text-sm text-Gray-700 font-medium">
                              {value.value}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </Fragment>
              );
            })}
          </div>
        )}
        {isOptionEnable && (
          <div className="flex flex-col gap-1.5">
            <LabelComp name="Option" htmlfor="variantopt" />
            <SelectComp
              inputId="variantopt"
              items={variantOptions}
              placeHolder="Select option"
              getValue={getValueHandle}
              setShowMenuItem={setShowMenuItem}
              showMenuItem={showMenuItem}
            />
          </div>
        )}
        {variantOption && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <LabelComp name="value" htmlfor="value" />
              <MultiSelectComp
                name={variantOption}
                placeHolder={`Select ${variantOption}...`}
                getValue={getMultiValueHandle}
                options={option}
                setOption={setoption}
                colorOptionEnable={variantOption}
                multiValueSelect={multiValueSelect}
                setMultiValueSelect={setMultiValueSelect}
              />
            </div>
            <div className="flex justify-end gap-2 items-center">
              <SecondaryButton text={"Discard"} className="py-2 px-3 h-9" />
              <button
                className="py-2 px-3 border border-brand-600-orange-p-1 shadow-xs text-white bg-brand-600-orange-p-1 rounded-lg h-9 flex items-center justify-center hover:bg-Brand-700 focus:bg-brand-600-orange transition-all duration-300 ease-in-out text-sm font-semibold"
                onClick={saveVariantHandle}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
      {variantEnable && (
        <button
          className="flex justify-center items-center py-2.5 gap-1.5 text-Brand-700 text-sm font-semibold bg-Brand-25 rounded-br-xl rounded-bl-xl border border-Gray-200 border-t-0"
          onClick={addOptionHandle}
        >
          <PlusIcon className="text-Brand-700" />
          Add Another Option
        </button>
      )}
    </div>
  );
}

export default ProductVariants;
