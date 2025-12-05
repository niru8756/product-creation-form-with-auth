import { useEffect, useState } from "react";
import AddtionalFormModal from "./AddtionalFormModal";
import { cn } from "@/lib/utils";
import { useProductStore } from "@/store/ProductStore";

function AdditionalDetails() {
  const [open, setOpen] = useState(false);
  const { categoryValue, productTypeValue,publishChannel } = useProductStore();
  const [isEnable, setIsEnable] = useState(true);

  useEffect(() => {
    if (categoryValue && productTypeValue && (publishChannel?.includes("ONDC") || publishChannel?.includes("AMAZON") || publishChannel?.includes("SHOPIFY"))) {
      setIsEnable(false);
  }
  }, [categoryValue, productTypeValue,publishChannel]);
  

  return (
   <div className="p-3 bg-Gray-50 border border-Gray-100 rounded-lg grid md:grid-cols-3 gap-3 md:justify-items-end w-full">
  <p className="md:text-sm text-xs text-Gray-600 md:col-span-2">
    We need some additional information to list this product on the selected
    sales channel, kindly fill in all details.
  </p>
  
  <div className="w-full md:w-fit">
    <button
      disabled={isEnable}
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        "w-full bg-white rounded-lg border flex gap-1 justify-center items-center border-Gray-300 shadow-shadow-xs text-sm font-semibold text-Gray-500 hover:bg-Gray-50 hover:text-Gray-700 transition-all duration-300 ease-in-out focus:shadow-ring-gray-shadow-xs focus:bg-white px-3 py-2 h-9",
      )}
    >
      Add details
    </button>
  </div>
  
  {open && <AddtionalFormModal open={open} setOpen={setOpen} />}
</div>
  );
}

export default AdditionalDetails;
