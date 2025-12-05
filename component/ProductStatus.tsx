import { useProductStore } from "@/store/ProductStore";
import { ProductListErrorType } from "@/type/product-type";
import { useEffect } from "react";
import InputRadioSelect from "@/ui/InputRadioSelect";
import LabelComp from "@/ui/LabelComp";

function ProductStatus() {
  const {
    setProductStatus,
    productStatus,
    setProductListError,
    productListError,
    singleProductData,
  } = useProductStore();

  useEffect(() => {
    const errorStatus: ProductListErrorType = {
      status: undefined,
    };
    if (productStatus) {
      setProductListError({ ...productListError, ...errorStatus });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productStatus]);

  const handleStatus = (val: string) => {
    console.log("vlll: ", val);
    setProductStatus(val);
  };

  // ===================================== edit data =================================
  useEffect(() => {
    if (
      singleProductData?.status &&
      Object.keys(singleProductData).length > 0
    ) {
      setProductStatus(singleProductData.status);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleProductData?.status]);

  console.log("productStatus: ", productStatus)


  return (
    <div className="bg-white md:p-6 p-3 py-4 rounded-xl border border-Gray-200 shadow-xs flex flex-col md:gap-5 gap-2.5">
      <LabelComp
        name="Product Status"
        htmlfor="status"
        asterisk={true}
        className="md:text-lg text-base font-semibold text-Gray-700"
        errors={productListError && productListError.status}
      />
      <div className="grid grid-cols-2">
        <div>
          <InputRadioSelect
            htmlFor="active"
            inputName="status"
            labelText="Active"
            labelClass="text-base"
            className="gap-4"
            value="ACTIVE"
            OnChange={handleStatus}
            checked={productStatus === "ACTIVE"}
          />
        </div>
        <div>
          <InputRadioSelect
            htmlFor="draft"
            inputName="status"
            labelText="Draft"
            className="gap-4"
            labelClass="text-base"
            value="DRAFT"
            OnChange={handleStatus}
            checked={productStatus === "DRAFT"}
          />
        </div>
      </div>
    </div>
  );
}

export default ProductStatus;
