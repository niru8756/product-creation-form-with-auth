import { useEffect, useRef } from "react";
import useVariationStore from "@/store/VariationStore";
import InputComp from "../ui/InputComp";
import { VariantsDataType } from "@/type/variation-type";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProductStore } from "@/store/ProductStore";
import { api } from "@/lib/axios";

const EanSchema = z.object({}).catchall(
  z
    .string()
    .trim()
    .min(1, { message: "EAN is required" })
    .refine(
      (val) => {
        if (val === "") return false;
        return /^\d{8}$/.test(val) || /^\d{13}$/.test(val);
      },
      {
        message: "EAN must be 8 or 13 digits",
      },
    ),
);

function ProductEanComp() {
  const { variants, updatedVariants, setUpdatedVariants } = useVariationStore();
  const { singleProductData, productListError, setProductListError } =
    useProductStore();

  const activeVariants =
    singleProductData?.variants && singleProductData.variants.length > 0
      ? singleProductData.variants
      : updatedVariants && updatedVariants.length > 0
        ? updatedVariants
        : variants;

  // Form setup
  const {
    register,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
    trigger,
  } = useForm({
    defaultValues:
      activeVariants?.reduce(
        (acc, variant, idx) => {
          acc[`eanNumber-${idx}`] = variant.externalProductId?.value || "";
          return acc;
        },
        {} as Record<string, string>,
      ) || {},
    resolver: zodResolver(EanSchema),
    mode: "all",
    reValidateMode: "onChange",
  });

  const eanValues = watch();

  // Track last validated value and length for each field
  const lastValidatedRef = useRef<
    Map<string, { value: string; timestamp: number }>
  >(new Map());
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // API validation function
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

  // Remove white space from start and end
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name && name.startsWith("eanNumber-")) {
        const currentValue = value[name];
        const trimmedValue = currentValue?.trim();
        if (currentValue && currentValue !== trimmedValue) {
          setValue(name, trimmedValue as string, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [setValue, watch]);

  // API validation for EAN numbers
  useEffect(() => {
    if (!activeVariants?.length) return;
    if (singleProductData?.id) return;

    const cleanupTimers: NodeJS.Timeout[] = [];

    activeVariants.forEach((variant, idx) => {
      const fieldName = `eanNumber-${idx}`;
      const value = eanValues[fieldName];

      // Only proceed if length is 8 or 13
      if (!value || (value.length !== 8 && value.length !== 13)) {
        return;
      }

      // Get last validated info for this field
      const lastValidated = lastValidatedRef.current.get(fieldName);
      const now = Date.now();

      // Skip if we validated this exact value within the last 100ms (prevents duplicate calls from same render)
      if (
        lastValidated &&
        lastValidated.value === value &&
        now - lastValidated.timestamp < 100
      ) {
        return;
      }

      // Clear previous timer for this field
      const existingTimer = timersRef.current.get(fieldName);
      if (existingTimer) {
        clearTimeout(existingTimer);
        timersRef.current.delete(fieldName);
      }

      // Set new debounce timer
      const timer = setTimeout(async () => {
        const data = await fetchEanValidation(value);

        // Mark as validated with timestamp
        lastValidatedRef.current.set(fieldName, {
          value,
          timestamp: Date.now(),
        });

        // If data exists and has a value, it means EAN is already used
        if (data?.data && data?.data?.value) {
          setError(fieldName, {
            type: "manual",
            message: "This EAN number is already used.",
          });
        } else {
          // data is null means EAN is available - clear any errors
          clearErrors(fieldName);
        }

        // Remove timer from map after execution
        timersRef.current.delete(fieldName);
      }, 500); // debounce 500ms

      timersRef.current.set(fieldName, timer);
      cleanupTimers.push(timer);
    });

    return () => {
      // Cleanup all timers on unmount or re-render
      cleanupTimers.forEach((timer) => clearTimeout(timer));
    };
  }, [eanValues, activeVariants?.length]);

  // Error states
const errorEan = Object.values(errors).map((err) =>
  typeof err === "object" && err && "message" in err ? err.message : ""
);

  useEffect(() => {
    if (errorEan.length > 0) {
      const errorEanNumber = {
        eanNumber: "EAN is required",
      };
      setProductListError({ ...productListError, ...errorEanNumber });
    } else {
      const errorEanNumber = {
        eanNumber: undefined,
      };
      setProductListError({ ...productListError, ...errorEanNumber });
    }
  }, [errorEan.length]);

  useEffect(() => {
    if (!activeVariants?.length) return;

    activeVariants.forEach((variant, idx) => {
      setValue(`eanNumber-${idx}`, variant.externalProductId?.value || "");
    });

    const validateAllFields = async () => {
      const fieldNames = activeVariants.map((_, idx) => `eanNumber-${idx}`);
      await trigger(fieldNames, { shouldFocus: false });
    };

    validateAllFields();
  }, [activeVariants?.length]);

  useEffect(() => {
    if (!activeVariants?.length || !Object.keys(eanValues).length) return;

    const eanUpdates = new Map();

    activeVariants.forEach((variant, idx) => {
      const fieldName = `eanNumber-${idx}`;
      const currentValue = variant.externalProductId?.value || "";
      const newValue = eanValues[fieldName];

      if (newValue !== undefined && newValue !== currentValue) {
        const variantId = variant.id || variant.variantId || idx.toString();
        eanUpdates.set(variantId, newValue);
      }
    });

    if (eanUpdates.size === 0) return;

    if (singleProductData?.variants && singleProductData.variants.length > 0) {
      const updatedProductVariants = singleProductData.variants.map(
        (variant, idx) => {
          const variantId = variant.id || variant.variantId || idx.toString();
          if (eanUpdates.has(variantId)) {
            return {
              ...variant,
              externalProductId: {
                type: "EAN",
                value: eanUpdates.get(variantId),
              },
            };
          }
          return variant;
        },
      );

      useProductStore.setState({
        singleProductData: {
          ...singleProductData,
          variants: updatedProductVariants,
        },
      });
    }

    const updatedVariantsNew = (updatedVariants || variants).map(
      (variant, idx) => {
        const variantId = variant.id || variant.variantId || idx.toString();
        if (eanUpdates.has(variantId)) {
          return {
            ...variant,
            externalProductId: {
              type: "EAN",
              value: eanUpdates.get(variantId),
            },
          };
        }
        return variant;
      },
    );

    if (
      JSON.stringify(updatedVariantsNew) !== JSON.stringify(updatedVariants)
    ) {
      if (setUpdatedVariants) {
        setUpdatedVariants(updatedVariantsNew);
      }
      useVariationStore.setState({ variants: updatedVariantsNew });
    }
  }, [eanValues]);

  const variantTitle = (variantData?: VariantsDataType | null) => {
    if (!variantData) return "";

    const attributes = [
      {
        key: "size",
        getValue: () =>
          Array.isArray(variantData.size?.value)
            ? variantData.size?.value[0]?.displayName
            : variantData.size?.displayName,
      },
      {
        key: "color",
        getValue: () => variantData.color?.displayName,
      },
      {
        key: "flavor",
        getValue: () => variantData.flavor?.displayName,
      },
      {
        key: "itemWeight",
        getValue: () => variantData.itemWeight?.displayName,
      },
      {
        key: "numberOfItems",
        getValue: () => variantData.numberOfItems?.displayName,
      },
      {
        key: "scent",
        getValue: () => variantData.scent?.displayName,
      },
    ];

    const validAttributes = attributes
      .map((attr) => attr.getValue())
      .filter(
        (value): value is string =>
          value !== undefined && value !== null && value !== "",
      );

    return `${validAttributes.join("/")}`;
  };

  if (!activeVariants?.length) {
    return null;
  }

  return (
    <div className="p-3 md:p-6 flex flex-col gap-5 border border-Gray-200 bg-white rounded-xl shadow-xs">
      <div className="">
        <h3 className="text-Gray-700 md:text-lg text-base font-semibold">Ean Number</h3>
      </div>
      <div className="border border-gray-200 rounded-xl shadow-sm p-2 pb-0">
        <table className="table-fixed w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-gray-600 text-xs font-medium p-3 gap-1 text-start">
                <div className="flex items-center gap-2">Variant Name</div>
              </th>
              <th className="text-gray-600 text-xs font-medium p-3 gap-1 text-start">
                <div className="flex items-center gap-2">Ean Number</div>
              </th>
            </tr>
          </thead>
          <tbody className="">
            {activeVariants.map((variant, idx) => (
              <tr
                key={variant.id || variant.variantId || idx}
                className="border-b border-gray-200"
              >
                <td className="p-4">
                  <div className="text-sm text-Gray-950">
                    {variant.option?.data && variantTitle(variant.option.data)}
                  </div>
                </td>
                <td className="flex flex-col justify-start p-4 h-20">
                  <InputComp
                    disabled={singleProductData.id ? true : false}
                    className=""
                    placeHolder="Enter EAN"
                    type="text"
                    name={`eanNumber-${idx}`}
                    inputid={`ean-${idx}`}
                    register={register}
                    error={errors[`eanNumber-${idx}`]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductEanComp;
