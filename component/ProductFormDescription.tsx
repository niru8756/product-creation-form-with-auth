import InputComp from "@/ui/InputComp";
import LabelComp from "@/ui/LabelComp";
import { useForm } from "react-hook-form";
// import InfoIcon from "@/assets/icons/help-circle.svg";
// import SelectComp from "@/components/ui/SelectComp";
// import DescriptionTextEditor from "./DescriptionTextEditor";
import { Countries } from "@/constant";
import { productApi } from "@/lib/axios";
import { useProductStore } from "@/store/ProductStore";
import { ProductListErrorType } from "@/type/product-type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { z, ZodType } from "zod";
import DescriptionTextArea from "@/ui/DescriptionTextArea";
import InputRadioSelect from "@/ui/InputRadioSelect";
import SelectBox from "@/ui/SelectBox";
import MultiSelectComp, { Option } from "@/ui/MultiSelexctComp";
import useSpaceControl from "@/hooks/useSpaceControl";

type ProductDescription = z.infer<typeof ProductDescriptionSchema>;

type ProductDescriptionPropType = {
  setVariationEnabler: React.Dispatch<React.SetStateAction<boolean>>;
  isGenderEnable?: string;
  setIsGenderEnable?: React.Dispatch<React.SetStateAction<string>>;
};

export type ONDCMetadata = {
  domain: string;
  category: string;
};

type AmazonMetadata = {
  productType: string;
};

export type ShopifyMatadata={
  categoryId:string
  categoryName:string
  categoryBreadcrumb:string
}

export type ProductTypeMetaDataType = {
  ondc: ONDCMetadata;
  amazon: AmazonMetadata;
  shopify:ShopifyMatadata
};

export type ProductType = {
  id: string;
  name: string;
  metadata?: ProductTypeMetaDataType;
};
export type CategoryType = {
  value: string;
  label: string;
};

type CategoryResponseType = {
  id: string;
  name: string;
  subCategories: ProductType[];
};

const ProductDescriptionSchema = z.object({
  title: z.string().min(1, { message: "Product name is required" }),
  sku: z.string().min(1, { message: "Sku is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  brand: z.string().min(1, { message: "Brand is required" }),
});


// category fetch

const categoryFetch = async () => {
  const { data } = await productApi.get("/api/category");
  return data;
};

function ProductFormDescription({
  setVariationEnabler,
  isGenderEnable,
  setIsGenderEnable,
}: ProductDescriptionPropType) {
  const [category, setCategory] = useState<Option>();
  const [categoryItems, setCategoryItems] = useState<CategoryType[]>([]);
  // const [productType, setProductType] = useState<string>("");
  const [, setCountry] = useState<string>("");
  const [isProductTypeEnable, setIsProductTypeEnable] =
    useState<boolean>(false);
  const [productTypeItems, setProductTypeItems] = useState<CategoryType[]>([]);
  const [productTypeEmpty, setProductTypeEmpty] = useState<null | Option>(null);

  const { data, isSuccess } = useQuery({
    queryKey: ["category"],
    queryFn: categoryFetch,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
    gcTime: 30 * 60 * 1000,
  });

  useEffect(() => {
    if (isSuccess) {
      const categoryList = data.data.map((ctgr: CategoryResponseType) => {
        return {
          label: ctgr.name,
          value: ctgr.id,
        };
      });
      setCategoryItems(categoryList);
    }
  }, [isSuccess, data]);

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductDescription>({
    resolver: zodResolver(ProductDescriptionSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      brand: "",
    },
  });


  const {
    gender,
    setGender,
    setTitle,
    setCategoryValue,
    countryOfOrigin,
    categoryValue,
    variantHandle,
    setCountryOfOrigin,
    productTypeValue,
    setProductTypeName,
    setDescription,
    setProductListError,
    productListError,
    setProductTypeValue,
    setONDCMetadata,
    setShopifyMetadata,
    singleProductData,
    setBrandName,
    setAmazonMetadata,
  } = useProductStore();

  

  const titleName = watch("title");
  const descriptionvalue = watch("description");
  const brandName = watch("brand");

  useSpaceControl(titleName, setValue, "title");
  useSpaceControl(descriptionvalue, setValue, "description");
  useSpaceControl(brandName, setValue, "brand");

  useEffect(() => {
    setTitle(titleName.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleName]);

  useEffect(() => {
    setDescription(descriptionvalue?.trim() as string);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [descriptionvalue]);

  useEffect(() => {
    setBrandName(brandName?.trim() as string);
  }, [brandName]);

const categorySelectHandle = (val: Option | Option[] | null) => {
  const singleVal = Array.isArray(val) ? val[0] : val;
  
  setCategoryValue(singleVal?.value as string);
  data.data.map((proType: CategoryResponseType) => {
    if (
      proType.id === singleVal?.value &&
      typeof setIsGenderEnable === "function"
    ) {
      setIsGenderEnable(proType.name);
      if (Array.isArray(proType.subCategories)) {
        const subcategoryList = proType.subCategories.map((sbctgr) => {
          return {
            label: sbctgr.name,
            value: sbctgr.id,
          };
        });
        setProductTypeItems(subcategoryList);
      }
    }
  });

  if (singleVal) {
    setIsProductTypeEnable(true);
  } else {
    setIsProductTypeEnable(false);
  }
  setProductTypeValue("");
  setProductTypeEmpty(null);
  variantHandle(false);
  setVariationEnabler(false);
};

const productTypeHandle = (val: Option | Option[] | null) => {
  const singleVal = Array.isArray(val) ? val[0] : val;
  
  setProductTypeValue(singleVal?.value as string);
  setProductTypeEmpty(singleVal);
};

  useEffect(() => {
    const errorBrandName: ProductListErrorType = {
      brand: errors?.brand?.message,
    };

    setProductListError({ ...productListError, ...errorBrandName });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors.brand]);

  useEffect(() => {
    const errorTitle: ProductListErrorType = {
      title: errors?.title?.message,
    };

    setProductListError({ ...productListError, ...errorTitle });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors.title]);

  useEffect(() => {
    const errorCategory: ProductListErrorType = {
      category: undefined,
    };
    if (categoryValue) {
      setProductListError({ ...productListError, ...errorCategory });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryValue]);

  useEffect(() => {
    const errorProductTypeError: ProductListErrorType = {
      productType: undefined,
    };
    if (productTypeValue) {
      setProductListError({ ...productListError, ...errorProductTypeError });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productTypeValue]);

  useEffect(() => {
    const errorCountry: ProductListErrorType = {
      countryOfOriginerrs: undefined,
    };
    if (countryOfOrigin) {
      setProductListError({ ...productListError, ...errorCountry });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryOfOrigin]);

  useEffect(() => {
    if (gender === "") {
      setGender(gender);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gender]);

  // handle gender selection
  const handleGenderSelect = (val: string) => {
    setGender(val);
  };

  // product type name extract

  useEffect(() => {
    if (productTypeItems.length > 0) {
      data.data.forEach((ctgr: CategoryResponseType) => {
        ctgr.subCategories.forEach((productType: ProductType) => {
          if (productType.id === productTypeValue) {
            setProductTypeName(productType.name);
            if (productType.metadata) {
              setONDCMetadata(productType.metadata.ondc);
              setAmazonMetadata(productType.metadata.amazon);
              setShopifyMetadata(productType.metadata.shopify)
            }
          }
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productTypeValue, productTypeItems]);

  // country change handle
  // const countryHandle = (val: Option | null) => {
  //   if (val) {
  //     setCountryOfOrigin(val.value);
  //     setCountry(val);
  //   } else {
  //     setCountryOfOrigin(null);
  //   }
  // };

  // ================================ edit product data ================================

  useEffect(() => {
    data?.data?.forEach((proType: CategoryResponseType) => {
      if (proType.id === singleProductData?.categoryId) {
        if (Array.isArray(proType.subCategories)) {
          const subcategoriesList = proType.subCategories.map((sbctgr) => ({
            label: sbctgr.name,
            value: sbctgr.id,
          }));

          setProductTypeItems(subcategoriesList);
          const matchedProductType = subcategoriesList.find(
            (productSubCat) =>
              singleProductData?.subCategoryId === productSubCat.value,
          );
          if (matchedProductType) {
            // setProductType(matchedProductType.name);
            setProductTypeEmpty(matchedProductType);
            setProductTypeValue(singleProductData.subCategoryId);
          }
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    categoryItems,
    singleProductData?.categoryId,
    singleProductData?.subCategoryId,
    data,
  ]);

  useEffect(() => {
    if (singleProductData && Object.keys(singleProductData).length > 0) {
      setIsProductTypeEnable(!!singleProductData.subCategoryId);

      if (singleProductData.gender) {
        setGender(singleProductData.gender);
      }

      setTitle(singleProductData.title);
      setDescription(singleProductData.description);
      setBrandName(singleProductData.brandName as string);

      // Convert numbers to strings when setting form values
      setValue("title", singleProductData.title);
      setValue("description", singleProductData.description);
      setValue("brand", singleProductData.brandName as string);

      const matchedCategory = categoryItems.find(
        (category) => singleProductData.categoryId === category.value,
      );

      if (matchedCategory) {
        setCategory(matchedCategory);
        setCategoryValue(singleProductData.categoryId);
        if (singleProductData.gender) {
          setIsGenderEnable?.(matchedCategory.label);
        } else {
          setIsGenderEnable?.("");
        }
      }

      const matchedCountry = Countries.find(
        (c) => singleProductData.originCountry === c.id,
      );
      if (matchedCountry) {
        setCountry(matchedCountry.name);
        setCountryOfOrigin(singleProductData.originCountry);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleProductData, categoryItems]);
  

  return (
    <div className="md:p-6 p-3 flex flex-col md:gap-5 gap-2.5 border border-Gray-200 bg-white rounded-xl shadow-shadow-xs">
      <div className="">
        <h3 className="text-Gray-700 md:text-lg text-base font-semibold">Description</h3>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <LabelComp
            name="Product Name"
            htmlfor="name"
            asterisk={true}
            errors={productListError && productListError.title}
          />
          <InputComp
            placeHolder="Enter product name"
            type="text"
            name="title"
            inputid="name"
            register={register}
            error={errors.title}
            // value={title as string}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <LabelComp
            name="Product Description"
            htmlfor="description"
            asterisk={true}
            errors={productListError && productListError.description}
          />
          {/* <DescriptionTextEditor /> */}
          <DescriptionTextArea
            register={register}
            error={errors.description}
            // value={description as string}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <LabelComp
            name="Brand Name"
            htmlfor="brandName"
            asterisk={true}
            errors={productListError && productListError.brand}
          />
          <InputComp
            placeHolder="Enter Brand name"
            type="text"
            name="brand"
            inputid="brandName"
            register={register}
            error={errors.brand}
            disabled={singleProductData.id ? true : false}
            // value={brand as string}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <LabelComp
            name="Category"
            htmlfor="category"
            asterisk={true}
            errors={productListError && productListError.category}
          />
          {/* <SelectComp
            getValue={categorySelectHandle}
            inputId={"category"}
            items={categoryItems}
            placeHolder="Enter Category"
            showMenuItem={category}
            setShowMenuItem={setCategory}
            disabled={singleProductData.id ? true : false}
          /> */}
          <MultiSelectComp
            placeHolder="Enter Category"
            name="category"
            options={categoryItems}
            getValue={categorySelectHandle}
            disabled={singleProductData.id ? true : false}
            selectedValue={category}
          />
        </div>
        {isProductTypeEnable && (
          <div className="flex flex-col gap-1.5">
            <LabelComp
              name="Product Type"
              htmlfor="productType"
              asterisk={true}
              errors={productListError && productListError.productType}
            />
            {/* <SelectComp
              getValue={productTypeHandle}
              inputId={"productType"}
              items={productTypeItems}
              placeHolder="Enter product type"
              showMenuItem={productType}
              setShowMenuItem={setProductType}
              disabled={singleProductData.id ? true : false}
            /> */}
            <MultiSelectComp
              placeHolder="Enter product type"
              name="productType"
              options={productTypeItems}
              getValue={productTypeHandle}
              selectedValue={productTypeEmpty}
              disabled={singleProductData.id ? true : false}
            />
          </div>
        )}
        {/* gender */}
        {isGenderEnable === "Footwear" || isGenderEnable === "Fashion" ? (
          <div className="flex flex-col gap-1.5">
            <LabelComp
              name="Gender"
              htmlfor="gender"
              asterisk={true}
              errors={productListError && productListError.gender}
            />
            <div className="flex gap-5">
              <div>
                <InputRadioSelect
                  htmlFor="male"
                  inputName="gender"
                  labelText="Male"
                  labelClass="text-gray-500 text-base"
                  className="!"
                  value="male"
                  OnChange={handleGenderSelect}
                  checked={gender === "male"}
                  disabled={singleProductData.id ? true : false}
                />
              </div>
              <div>
                <InputRadioSelect
                  htmlFor="female"
                  inputName="gender"
                  labelText="Female"
                  className="text-gray-500"
                  labelClass="text-gray-500 text-base"
                  value="female"
                  OnChange={handleGenderSelect}
                  checked={gender === "female"}
                  disabled={singleProductData.id ? true : false}
                />
              </div>
              <div>
                <InputRadioSelect
                  htmlFor="kid's"
                  inputName="gender"
                  labelText="Kid's"
                  className="text-gray-500"
                  labelClass="text-gray-500 text-base"
                  value="kid's"
                  OnChange={handleGenderSelect}
                  checked={gender === "kid's"}
                  disabled={singleProductData.id ? true : false}
                />
              </div>
            </div>
          </div>
        ) : null}
        {/* skus */}
        {/* <div className="flex flex-col gap-1.5">
          <LabelComp name="sku" htmlfor="sku" />
          <InputComp
            placeHolder="Enter SKU if applicable"
            type="text"
            name="sku"
            inputid="sku"
            register={register}
            error={errors.sku}
            endSymbol={InfoIcon}
            tooltipText="Sku id's"
            tooltip={true}
            value={sku as string}
          />
        </div> */}
        <div className="flex flex-col gap-1.5">
          <LabelComp
            name="Country Of Origin"
            htmlfor="countryOrigin"
            asterisk={true}
            errors={productListError && productListError.countryOfOriginerrs}
          />
          <SelectBox
            value={countryOfOrigin ?? ""}
            onValueChange={setCountryOfOrigin}
            items={Countries}
            placeHolder="Select a country"
          />
        </div>
      </div>
    </div>
  );
}

export default ProductFormDescription;
