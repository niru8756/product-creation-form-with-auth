import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useProductStore } from "@/store/ProductStore";
import { productApi } from "@/lib/axios";
import { useEffect, useState } from "react";
import { addVariantSchema } from "@/utils/addVariantsJsonSchema";
import MainVariationcomp from "@/component/variation-component/MainVariationcomp";
import LabelComp from "@/ui/LabelComp";
import InputComp from "@/ui/InputComp";
import useVariationStore from "@/store/VariationStore";
import {
  ColorVariationType,
  FlavorVariationType,
  ItemWeightVariationType,
  NumberOfItemsVariationType,
  ScentVariationType,
  Variants,
} from "@/type/variation-type";
import {
  channelDataType,
  CreateAssetType,
  FileAssetType,
} from "@/type/product-type";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ImageUploadSection from "./ImageUploadSection";
import { getStoreId, getToken } from "@/lib/cookies";
import InputCheckbox from "@/ui/InputCheckbox";
import { AxiosError } from "axios";
import { errorToast, successToast } from "@/ui/Toast";
import Image from "next/image";

type AddVarinatModalProps = {
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

type uploadMutationType = {
  file: File;
  signedUrl: string;
};

// Define a type for the channel-specific form values
type ChannelFormValues = {
  [key: `variantPrice-${number}`]: number;
  [key: `variantQuantity-${number}`]: number;
};

// Type for the form values including dynamic channel fields
type VariantFormValues = {
  variantEanNumber: string;
  imageValidation?: string;
  backImageValidation?: string;
  size?: string;
  color?: string;
  numberOfItems?: string;
  scent?: string;
  itemWeight?: string;
  flavor?: string;
} & ChannelFormValues;

const createVariantSchema = (
  discountedPrice: number,
  variations: string[],
  attributes: {
    size: any[];
    color: any[];
    numberOfItems: any[];
    scent: any[];
    itemWeight: any[];
    flavor: any[];
  },
  publishChannels: string[],
  assetsUrl: { url: string; assetId: string }[],
  backImageId: string,
) => {
  const schemaShape: Record<string, z.ZodTypeAny> = {
    variantEanNumber: z
      .string()
      .min(1, { message: "EAN number is required" })
      .refine(
        (val) => {
          if (val === "") return false;
          return /^\d{8}$/.test(val) || /^\d{13}$/.test(val);
        },
        {
          message: "EAN must be 8 or 13 digits",
        },
      ),
    imageValidation: z
      .string()
      .optional()
      .superRefine((_, ctx) => {
        if (assetsUrl.length < 3) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "At least 3 images are required for each variant",
          });
        } else if (!backImageId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please select a back image",
          });
        }
      }),
  };

  // Add direct fields for variations to ensure they appear in the formState.errors
  if (variations.includes("size")) {
    schemaShape["size"] = z
      .string()
      .optional()
      .superRefine((_, ctx) => {
        if (attributes.size.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please select at least one size option",
          });
        }
      });
  }

  if (variations.includes("color")) {
    schemaShape["color"] = z
      .string()
      .optional()
      .superRefine((_, ctx) => {
        if (attributes.color.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please select at least one color option",
          });
        }
      });
  }

  if (variations.includes("numberOfItems")) {
    schemaShape["numberOfItems"] = z
      .string()
      .optional()
      .superRefine((_, ctx) => {
        if (attributes.numberOfItems.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please specify the number of items",
          });
        }
      });
  }

  if (variations.includes("scent")) {
    schemaShape["scent"] = z
      .string()
      .optional()
      .superRefine((_, ctx) => {
        if (attributes.scent.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please select at least one scent option",
          });
        }
      });
  }

  if (variations.includes("itemWeight")) {
    schemaShape["itemWeight"] = z
      .string()
      .optional()
      .superRefine((_, ctx) => {
        if (attributes.itemWeight.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please specify the item weight",
          });
        }
      });
  }

  if (variations.includes("flavor")) {
    schemaShape["flavor"] = z
      .string()
      .optional()
      .superRefine((_, ctx) => {
        if (attributes.flavor.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please select at least one flavor option",
          });
        }
      });
  }

  // Add channel fields
publishChannels.forEach((channel, idx) => {
  // ---- PRICE ----
  schemaShape[`variantPrice-${idx}`] = z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) {
        return undefined; // let number() catch it
      }
      return Number(val);
    },
    z
      .number()
      .refine((val) => val !== undefined && !isNaN(val), {
        message: `Price for ${channel} must be a number`,
      })
      .positive(`Price for ${channel} must be greater than 0`)
      .refine((val) => val < discountedPrice, {
        message: `Price must be less than the discounted price (${discountedPrice})`,
      })
      .refine((val) => val !== undefined, {
        message: `Price for ${channel} is required`,
      }),
  );

  // ---- QUANTITY ----
  schemaShape[`variantQuantity-${idx}`] = z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) {
        return undefined;
      }
      return Number(val);
    },
    z
      .number()
      .refine((val) => val !== undefined && !isNaN(val), {
        message: `Quantity for ${channel} must be a number`,
      })
      .int(`Quantity for ${channel} must be a whole number`)
      .positive(`Quantity for ${channel} must be greater than 0`)
      .refine((val) => val !== undefined, {
        message: `Quantity for ${channel} is required`,
      }),
  );
});


  return z.object(schemaShape) ;
};

function AddVarinatModal({ modalOpen, setModalOpen }: AddVarinatModalProps) {
  const [schema, setSchema] = useState({});
  const [assetsUrl, setAssetsUrl] = useState<
    { url: string; assetId: string }[]
  >([]);
  const [backImageId, setBackImageId] = useState<string>("");
  const [variantion, setVariantion] = useState<string[]>([]);
  const accessToken = getToken();
  const storeId = getStoreId();
  const {
    productTypeName,
    gender,
    discountedPrice,
    publishChannel,
    singleProductData,
    isVariant
  } = useProductStore();
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const {
    color,
    size,
    numberOfItems,
    scent,
    itemWeight,
    flavor,
    // updatedVariants,
    setColorVariationValue,
    setSizeSchemaValue,
    setNumberOfItemsVariationValue,
    setScentVariationValue,
    setItemWeightVaritionValue,
    setFlavorVariationValue,
    // setUpdatedVariants,
    setVariation,
  } = useVariationStore();  

  const variantZodSchema = createVariantSchema(
    Number(discountedPrice || 0),
    variantion,
    {
      size,
      color,
      numberOfItems,
      scent,
      itemWeight,
      flavor,
    },
    publishChannel || [],
    assetsUrl,
    backImageId,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
    reset,
    trigger,
  } = useForm<VariantFormValues>({
    resolver: zodResolver(variantZodSchema) as any,
    defaultValues: {
      variantEanNumber: "",
      imageValidation: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (isSubmitted && variantion.length > 0) {
      const fieldsToValidate: (keyof VariantFormValues)[] = [];

      if (variantion.includes("size")) fieldsToValidate.push("size");
      if (variantion.includes("color")) fieldsToValidate.push("color");
      if (variantion.includes("numberOfItems"))
        fieldsToValidate.push("numberOfItems");
      if (variantion.includes("scent")) fieldsToValidate.push("scent");
      if (variantion.includes("itemWeight"))
        fieldsToValidate.push("itemWeight");
      if (variantion.includes("flavor")) fieldsToValidate.push("flavor");

      if (fieldsToValidate.length > 0) {
        setTimeout(() => {
          trigger(fieldsToValidate);
        }, 0);
      }
    }
  }, [
    size,
    color,
    numberOfItems,
    scent,
    itemWeight,
    flavor,
    variantion,
    trigger,
    isSubmitted,
  ]);

  //  create assets mutation handles

  const createAssetsMutationHandle = useMutation({
    mutationFn: async (payload: CreateAssetType) => {
      const { data } = await productApi.post("/asset", payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "x-store-id": storeId,
        },
      });
      return data;
    },
  });

  // put url in s3 bucket

  const uploadMutation = useMutation({
    mutationFn: async ({ file, signedUrl }: uploadMutationType) => {
      const response = await fetch(signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to upload ${file.name}: ${response.statusText}`,
        );
      }

      return { success: true, fileName: file.name, url: signedUrl };
    },
    retry: 3,
  });

  // get actual asssets url from s3  buckets

  const assetsUrlsListMutation = useMutation({
    mutationFn: async (payload: { assetIds: string[] }) => {
      const { data } = await productApi.post("/asset/all", payload, {
        headers: {
          "x-store-id": storeId,
        },
      });
      return data.data;
    },
    onSuccess: (data) => {
      setAssetsUrl((prevState) => {
        const urlsToAdd = data.map((url: Record<string, string>) => {
          return { url: url.assetUrl, assetId: url.id };
        });

        return [...prevState, ...urlsToAdd];
      });

      setTimeout(() => {
        trigger("imageValidation");
      }, 0);
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError && error.response) {
        errorToast(error.response.data.message);
      } else {
        errorToast("Something went wrong");
      }
    },
  });

  // delete assets mutations
  const deleteAssetMutation = useMutation({
    mutationFn: async (payload: { assetIds: string[] }) => {
      const res = await productApi.delete(`/asset`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "x-store-id": storeId,
        },
        data: payload,
      });
      return res.data;
    },
    onSuccess: (data) => {
      successToast(data.message);
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError && error.response) {
        errorToast(error.response.data.message);
      } else {
        errorToast("Something went wrong");
      }
    },
  });

  // single variant creation mutation handle

  const variantMutationHandle = useMutation({
    mutationFn: async (payload: Variants[]) => {
      const { data } = await productApi.post(
        `/product/${singleProductData.id}/variant`,
        payload,
      );
      return data;
    },
    onSuccess: (data) => {
      successToast(data.message);

      if (typeof setModalOpen === "function") {
        setModalOpen(false);
      }
      resetAllModalState();
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError && error.response) {
        errorToast(error.response.data.message);
      } else {
        errorToast("Something went wrong");
      }
    },
  });

  // fetch schema for variants
  const variantFetch = async () => {
    const { data } = await productApi.get(
      `/option/schema?ptype=${productTypeName}&gender=${gender}`,
    );
    return data;
  };

  const { data, isSuccess } = useQuery({
    queryKey: ["addVariants", productTypeName, gender],
    queryFn: () => variantFetch(),
    enabled: Boolean(productTypeName && gender) || Boolean(productTypeName),
  });

  useEffect(() => {
    if (isSuccess && data) {
      const transformedSchema = addVariantSchema(data, singleProductData.variationAttribute ||[]);
      setSchema(transformedSchema);
      setVariantion(singleProductData.variationAttribute || []);
    }
  }, [isSuccess, data,singleProductData?.variationAttribute]);

  const onSubmit = (formData: VariantFormValues) => {
    const fieldsToValidate: (keyof VariantFormValues)[] = ["imageValidation"];

    if (variantion.includes("size")) fieldsToValidate.push("size");
    if (variantion.includes("color")) fieldsToValidate.push("color");
    if (variantion.includes("numberOfItems"))
      fieldsToValidate.push("numberOfItems");
    if (variantion.includes("scent")) fieldsToValidate.push("scent");
    if (variantion.includes("itemWeight")) fieldsToValidate.push("itemWeight");
    if (variantion.includes("flavor")) fieldsToValidate.push("flavor");

    trigger(fieldsToValidate);
    const assetsIds = assetsUrl.map((asset) => {
      return {
        assetId: asset.assetId,
      };
    });
    const channelData: channelDataType[] =
      publishChannel?.map((chanelData, idx) => {
        return {
          channelType: chanelData,
          price: formData[`variantPrice-${idx}`] as number,
          quantity: formData[`variantQuantity-${idx}`] as number,
          mrp: discountedPrice as number,
        };
      }) || [];

    const variant: Variants = {
      option: {
        type: isVariant ? "custom" : "default",
        data: {
          size: size[0],
          color: color[0],
          itemWeight: itemWeight[0],
          flavor: flavor[0],
          numberOfItems: numberOfItems[0],
          scent: scent[0],
        },
      },
      externalProductId: {
        type: "EAN",
        value: formData.variantEanNumber,
      },
      channelData: channelData,
      variantAssets: assetsIds,
    };

    // const updatedVariantsList = [...updatedVariants, variant];

    // setUpdatedVariants(updatedVariantsList);
    variantMutationHandle.mutateAsync([variant]);
  };

  const imageHandle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files) as File[];

    const fileUploadData: FileAssetType[] = fileArray.map((file, idx) => {
      const fileType = file.type.startsWith("image") ? "IMAGE" : "VIDEO";

      return {
        fileName: file.name,
        fileType: fileType,
        mimeType: file.type,
        fileSize: file.size,
        position: idx,
      };
    });

    const uploadAssetsPayload = {
      assets: fileUploadData,
    };
    try {
      const assetData =
        await createAssetsMutationHandle.mutateAsync(uploadAssetsPayload);
      const uploadPromises = fileArray.map(async (item, idx) => {
        const signedUrl = assetData[idx].signedUrl;
        await uploadMutation.mutateAsync({
          file: item,
          signedUrl: signedUrl,
        });
        return {
          assetId: assetData[idx].id,
          position: idx,
        };
      });

      const assetsUrls = await Promise.all(uploadPromises);
      const getUrlsAssetsId = assetsUrls.map((url) => {
        return url.assetId;
      });

      const getUrlsPayload = {
        assetIds: getUrlsAssetsId,
      };
      assetsUrlsListMutation.mutateAsync(getUrlsPayload);
    } catch (error) {
      console.log("Error uploading assets:", error);
    }
  };  

  // image select handle

  const imageSelectHandle = (id: string, checked: boolean = false) => {
    if (checked) {
      setSelectedAssets((prevState) => {
        return [...prevState, id];
      });
    } else {
      setSelectedAssets((prevState) => {
        return prevState.filter((exitId) => exitId !== id);
      });
    }
  };

  // backimage handle

  const backImageHandle = () => {
    const backImageAsset = assetsUrl.find(
      (asset) => asset.assetId === selectedAssets[0],
    );
    const backImageIndex = assetsUrl.findIndex(
      (asset) => asset.assetId === selectedAssets[0],
    );

    if (backImageAsset && backImageIndex !== -1) {
      setAssetsUrl((prevState) => {
        const arrayWithoutSelected = prevState.filter(
          (_, index) => index !== backImageIndex,
        );

        return [...arrayWithoutSelected, backImageAsset];
      });
    }
    setSelectedAssets([]);
    setBackImageId(backImageAsset?.assetId as string);
    setTimeout(() => {
      trigger("imageValidation");
    }, 0);
  };

  // delete assets handle

  const deleteHandle = () => {
    const deleteAssetPayload = {
      assetIds: selectedAssets,
    };

    deleteAssetMutation
      .mutateAsync(deleteAssetPayload)
      .then(() => {
        const deletingBackImage = selectedAssets.includes(backImageId);

        setAssetsUrl((prevState) =>
          prevState.filter((asset) => !selectedAssets.includes(asset.assetId)),
        );

        setSelectedAssets([]);

        if (deletingBackImage) {
          setBackImageId("");
        }

        setTimeout(() => {
          trigger(["imageValidation"]);
        }, 0);
      })
      .catch((error) => {
        console.log("Error deleting assets:", error);
      });
  };
  // reset all state
  const resetAllModalState = () => {
    reset();

    setAssetsUrl([]);
    setBackImageId("");
    setSelectedAssets([]);

    setColorVariationValue({} as ColorVariationType);
    setSizeSchemaValue({});
    setNumberOfItemsVariationValue({} as NumberOfItemsVariationType);
    setScentVariationValue({} as ScentVariationType);
    setItemWeightVaritionValue({} as ItemWeightVariationType);
    setFlavorVariationValue({} as FlavorVariationType);
    setVariation([]);
  };
  
  return (
    <div>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
          onInteractOutside={() => resetAllModalState()}
          showCloseButton={true}
          className="max-w-[538px] w-full"
        >
          <DialogClose
            className="absolute right-6 top-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            onClick={() => {
              resetAllModalState();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span className="sr-only">Close</span>
          </DialogClose>
          <DialogHeader>
            <DialogTitle>
              <p className="-text-Gray-900 text-lg font-semibold">
                Add Variants
              </p>
            </DialogTitle>
            <DialogDescription>
              <p className="-text-Gray-600 font-normal text-sm">
                You can add any custom variants
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="w-full flex flex-col gap-8 lg:max-h-[470px] max-h-96 pe-8 overflow-auto scrollStyle">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-2"
            >
              {variantion.includes("size") && (
                <input type="hidden" {...register("size")} />
              )}
              {variantion.includes("color") && (
                <input type="hidden" {...register("color")} />
              )}
              {variantion.includes("numberOfItems") && (
                <input type="hidden" {...register("numberOfItems")} />
              )}
              {variantion.includes("scent") && (
                <input type="hidden" {...register("scent")} />
              )}
              {variantion.includes("itemWeight") && (
                <input type="hidden" {...register("itemWeight")} />
              )}
              {variantion.includes("flavor") && (
                <input type="hidden" {...register("flavor")} />
              )}
              {/* variants images  */}
              <div className="flex flex-col gap-2 w-full">
                <LabelComp name="Variant Image" htmlfor="variantImage" />
                <div className="grid grid-cols-7 gap-2 h-full w-full">
                  {assetsUrl.length > 0 &&
                    assetsUrl.map((url, idx) => {
                      return (
                        <div
                          key={idx}
                          className="border flex h-[100px] justify-center items-center rounded-lg shadow-shadow-xs p-1 relative flex-col"
                        >
                          <div className="top-2 left-2 absolute ">
                            <InputCheckbox
                              onChange={imageSelectHandle}
                              value={url.assetId}
                              checked={selectedAssets.includes(url.assetId)}
                            />
                          </div>

                          <Image
                            src={url.url} // URL or local import
                            alt="variantimage"
                            width={80} // set width
                            height={80} // set height to maintain aspect ratio
                            className="h-full"
                          />
                          <div className="flex justify-center">
                            {backImageId === url.assetId && (
                              <button className="absolute py-0.5 bottom-1 px-1 rounded-md text-xs font-medium w-fit border -border-Brand-300 -bg-Brand-50 shadow-shadow-xs -text-Brand-700">
                                Back View
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  {assetsUrl.length < 7 && (
                    <ImageUploadSection
                      variant="small"
                      id="variantImageFile"
                      onChange={imageHandle}
                    />
                  )}
                  <input type="hidden" {...register("imageValidation")} />
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={deleteHandle}
                    disabled={selectedAssets.length == 0}
                    className="bg-Error-600 shadow-xs border-brand-600-orange-p-1 rounded-lg py-1 px-3 text-white font-semibold hover:bg-Error-700 transition-all duration-300 ease-in-out disabled:bg-Gray-100 disabled:text-Gray-400 disabled:border-Gray-200 text-xs"
                  >
                    Delete
                  </button>
                  <button
                    disabled={selectedAssets.length != 1}
                    type="button"
                    className="border border-Brand-300 bg-Brand-50 shadow-xs px-3 py-1 flex justify-center items-center rounded-lg font-semibold disabled:bg-Gray-100 disabled:text-Gray-400 disabled:border-Gray-200 text-Brand-700 text-xs"
                    onClick={backImageHandle}
                  >
                    Mark as back Image
                  </button>
                </div>
                {errors.imageValidation && (
                  <div className="flex gap-3">
                    {errors.imageValidation && (
                      <p className="-text-Error-500 text-sm">
                        {errors.imageValidation.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
              {schema && <MainVariationcomp schema={schema} errors={errors} />}
              <div className="flex flex-col gap-1.5">
                <div className="flex flex-col gap-1.5">
                  <LabelComp name="EAN Number" htmlfor="ean" />
                  <InputComp
                    placeHolder="Enter EAN Number"
                    type="text"
                    name="variantEanNumber"
                    inputid="ean"
                    register={register}
                    error={errors.variantEanNumber}
                  />
                </div>
              </div>
              {publishChannel?.map((_, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <LabelComp
                      name="Quantity"
                      htmlfor={`variantQuantity-${idx}`}
                    />
                    <InputComp
                      placeHolder="0"
                      type="number"
                      name={`variantQuantity-${idx}`}
                      inputid={`variantQuantity-${idx}`}
                      register={register}
                      error={errors[`variantQuantity-${idx}`]}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <LabelComp name="Price" htmlfor={`variantPrice-${idx}`} />
                    <InputComp
                      placeHolder="0.00"
                      type="number"
                      name={`variantPrice-${idx}`}
                      inputid={`variantPrice-${idx}`}
                      register={register}
                      error={errors[`variantPrice-${idx}`]}
                    />
                  </div>
                </div>
              ))}

              <DialogFooter className="justify-normal! w-full! mt-4 sticky bottom-0 left-0 bg-white pt-2">
                <div className="grid grid-cols-2 gap-3 w-full!">
                  <button
                    type="button"
                    onClick={() => {
                      resetAllModalState();
                      reset();
                      if (typeof setModalOpen === "function") {
                        setModalOpen(false);
                      }
                    }}
                    className="px-4 py-2.5 rounded-lg bg-white text-Gray-500 text-[16px] hover:text-Gray-800 border transition-all duration-300 ease-in-out border-Gray-300 hover:bg-transparent shadow-xs focus:text-Gray-800 focus:shadow-ring-gray-shadow-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-lg bg-brand-600-orange-p-1 text-white text-[16px] border border-Gray-300 hover:bg-Brand-700 shadow-xs transition-all duration-300 ease-in-out focus:shadow-ring-brand-shadow-xs disabled:-bg-Gray-100 disabled:-text-Gray-400 disabled:-border-Gray-200"
                  >
                    Submit
                  </button>
                </div>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddVarinatModal;
