import { useEffect, useRef } from "react";

import {
  AddOptionPayloadType,
  ColorVariationType,
  ItemWeightVariationType,
  SizeValueType,
} from "@/type/variation-type";
import SizePropComp from "./SizePropComp";
import ColorPropComp from "./ColorPropComp";
import WeightPropComp from "./WeightPropComp";
import VariationPropComp from "./VariationPropComp";
import ScentPropComp from "./ScentPropComp";
import FlavorPropComp from "./FlavorPropComp";
import NumberOfItemsPropComp from "./NumberOfItemsPropComp";
import { useMutation } from "@tanstack/react-query";
import { productApi } from "@/lib/axios";
import { useProductStore } from "@/store/ProductStore";
// import useVariationStore from "@/stores/variationStore";
import { getStoreId } from "@/lib/cookies";
import useVariationStore from "@/store/VariationStore";
import { AxiosError } from "axios";
import { errorToast, successToast } from "@/ui/Toast";
const storeId = getStoreId();

interface MainVariationcompType {
  schema: any;
  errors?: any;
}
//  add option in variants

export const addOptionsHandleMutation = (onSuccessRefetchData: () => void) =>
  useMutation({
    mutationFn: async (payload: AddOptionPayloadType) => {
      const { data } = await productApi.post("/option", payload, {
        headers: {
          "x-store-id": storeId,
        },
      });
      return data;
    },
    onSuccess: (data) => {
      onSuccessRefetchData();
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

function MainVariationcomp({ schema, errors = {} }: MainVariationcompType) {
  const { isVariant } = useProductStore();
  const { setVariation } = useVariationStore();

  const optionsRef = useRef<{
    [key: string]: {
      label: SizeValueType | ColorVariationType | ItemWeightVariationType;
      value: SizeValueType | ColorVariationType | ItemWeightVariationType;
    }[];
  }>({});

  useEffect(() => {
    if (!isVariant) {
      setVariation([]);
    }
  }, [isVariant]);

  return (
    <div>
      {Object.entries(schema.properties).map(([rootKey, rootValue]) => {
        if (rootKey === "variation" && isVariant) {
          return (
            <>
              <VariationPropComp
                schemaValue={rootValue as Record<string, unknown>}
                key={rootKey}
                optionsRef={optionsRef}
                mainKey={rootKey}
              />
            </>
          );
        } else if (rootKey === "size") {
          return (
            <>
              <SizePropComp
                schemaValue={rootValue as Record<string, unknown>}
                key={rootKey}
                optionsRef={optionsRef}
                mainKey={rootKey}
              />
              {errors && errors[rootKey] && (
                <p className="text-Error-500 text-sm">
                  {errors[rootKey].message}
                </p>
              )}
            </>
          );
        } else if (rootKey === "color") {
          return (
            <>
              <ColorPropComp
                schemaValue={rootValue as Record<string, unknown>}
                key={rootKey}
                optionsRef={optionsRef}
                mainKey={rootKey}
              />
              {errors && errors[rootKey] && (
                <p className="text-Error-500 text-sm">
                  {errors[rootKey].message}
                </p>
              )}
            </>
          );
        } else if (rootKey === "itemWeight") {
          return (
            <>
              <WeightPropComp
                schemaValue={rootValue as Record<string, unknown>}
                key={rootKey}
                optionsRef={optionsRef}
                mainKey={rootKey}
              />
              {errors && errors[rootKey] && (
                <p className="text-Error-500 text-sm">
                  {errors[rootKey].message}
                </p>
              )}
            </>
          );
        } else if (rootKey === "scent") {
          return (
            <>
              <ScentPropComp
                schemaValue={rootValue as Record<string, unknown>}
                key={rootKey}
                optionsRef={optionsRef}
                mainKey={rootKey}
              />
              {errors && errors[rootKey] && (
                <p className="text-Error-500 text-sm">
                  {errors[rootKey].message}
                </p>
              )}
            </>
          );
        } else if (rootKey === "flavor") {
          return (
            <>
              <FlavorPropComp
                schemaValue={rootValue as Record<string, unknown>}
                key={rootKey}
                optionsRef={optionsRef}
                mainKey={rootKey}
              />
              {errors && errors[rootKey] && (
                <p className="text-Error-500 text-sm">
                  {errors[rootKey].message}
                </p>
              )}
            </>
          );
        } else if (rootKey === "numberOfItems") {
          return (
            <>
              <NumberOfItemsPropComp
                schemaValue={rootValue as Record<string, unknown>}
                key={rootKey}
                optionsRef={optionsRef}
                mainKey={rootKey}
              />
              {errors && errors[rootKey] && (
                <p className="text-Error-500 text-sm">
                  {errors[rootKey].message}
                </p>
              )}
            </>
          );
        }
      })}
    </div>
  );
}

export default MainVariationcomp;
