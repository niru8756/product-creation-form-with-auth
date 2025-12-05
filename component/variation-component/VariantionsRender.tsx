import { productApi } from "@/lib/axios";
import { cn } from "@/lib/utils";
import { useProductStore } from "@/store/ProductStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import MainVariationcomp from "./MainVariationcomp";
import useVariationStore from "@/store/VariationStore";

function VariantionsRender() {
  const { productTypeName, gender } = useProductStore();
  const { size,color} = useVariationStore()
  const queryClient = useQueryClient();

  const [schema, setSchema] = useState(null);
   const [renderKey, setRenderKey] = useState(0);

  const variantFetch = async () => {
    const { data } = await productApi.get(
      `/option/schema?ptype=${productTypeName}&gender=${gender}`,
    );
    return data;
  };

  const { data, refetch, isSuccess } = useQuery({
    queryKey: ["variants", productTypeName, gender],
    queryFn: () => variantFetch(),
    enabled: Boolean(productTypeName && gender) || Boolean(productTypeName),
    
  });

  useEffect(() => {
    if (isSuccess) {
      setSchema(data);
    }
  }, [isSuccess, data]);

    useEffect(() => {
    if (Array.isArray(size) && size.length === 0 && 
        Array.isArray(color) && color.length === 0) {
      queryClient.invalidateQueries({ queryKey: ["variants"] });
      refetch();
      setRenderKey(prev => prev + 1);
    }
  }, [size, color, queryClient, refetch]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["variants"] });
  }, [queryClient]);

  return (
    <>
      <div key={renderKey}>
        {schema && (
          <div className="flex flex-col">
            <div
              className={cn(
                "md:p-6 p-3 flex flex-col md:gap-5 gap-2.5 border border-Gray-200 bg-white rounded-xl shadow-xs",
              )}
            >
              <div>
                <h3 className="text-Gray-700 md:text-lg text-base font-semibold">
                  Variants
                </h3>

                <div className="mt-2 p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-1">
                  <p className="text-sm text-gray-700 font-medium">
                    All fields are mandatory.
                  </p>
                  <p className="text-sm text-gray-600">
                    Select an option from the list or create your own if
                    isn’t listed.
                  </p>
                </div>
              </div>
              {schema && <MainVariationcomp schema={schema} />}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default VariantionsRender;
