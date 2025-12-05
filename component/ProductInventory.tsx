import { useForm } from "react-hook-form";
import LabelComp from "@/ui/LabelComp";
import InputWithLabel from "@/ui/InputWithLabel";
import { z, ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProductStore } from "@/store/ProductStore";
import { useEffect } from "react";
import InfoIcon from "@/assets/icons/InfoIcon";

type InventoryType = {
  inventory: string ;
};

const InventorySchema = z.object({
  inventory: z
    .string()
    .min(1, "Inventory is required.")
    .refine((val) => {
      const parsedVal = Number(val);
      return Number.isInteger(parsedVal) && parsedVal > 0;
    }, "Must be a valid integer greater than zero."),
});

function ProductInventory() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InventoryType>({
    resolver: zodResolver(InventorySchema),
    mode: "onChange",
    defaultValues:{
      inventory: ""
    }
  });

  const {
    productInventory,
    setProductInventory,
    productListError,
    setProductListError,
    singleProductData,
    isVariant,
  } = useProductStore();

  const inventoryValue =
    errors.inventory === undefined ? Number(watch("inventory")) : 0;

  useEffect(() => {
    if (!errors.inventory) {
      setProductInventory(inventoryValue);
    }
  }, [inventoryValue]);

  useEffect(() => {
    const errorInventory = {
      productInventoryErrsMsg: errors.inventory?.message,
    };

    setProductListError({ ...productListError, ...errorInventory });
  }, [errors.inventory]);


  useEffect(() => {
    if (singleProductData && Object.keys(singleProductData).length > 0 && !isVariant) {
      setValue("inventory", String(singleProductData.inventory));
      setProductInventory(singleProductData.inventory as number);
    }
  }, [singleProductData.inventory, setProductInventory,setValue]);

  return (
    <div className="md:p-6 p-3 flex flex-col md:gap-5 gap-2.5 border border-Gray-200 bg-white rounded-xl shadow-xs">
      <div>
        <h3 className="text-Gray-700 md:text-lg text-base font-semibold">Inventory</h3>
      </div>
      <div className="flex flex-col gap-1.5">
        <LabelComp
          name="Total Inventory"
          htmlfor="inventory"
          asterisk={true}
          errors={productListError && productListError.productInventoryErrsMsg}
        />
        <InputWithLabel
          name="inventory"
          register={register}
          placeholder="0"
          inputId={"inventory"}
          error={errors.inventory}
          value={productInventory as number}
          endSymbol={InfoIcon}
          tooltip={true}
          tooltipText="You have opted for unified inventory, whatever quantity you add here will be published throughout on all channels & varients."
        />
      </div>
    </div>
  );
}

export default ProductInventory;
