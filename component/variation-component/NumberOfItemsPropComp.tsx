import useVariationStore from "@/store/VariationStore";
import {
  AddOptionPayloadType,
  NumberOfItemsVariationType,
  OnSelect,
  VariationSchemaType,
} from "@/type/variation-type";
import { useEffect, useState } from "react";
import { VariationRenderForm } from "./VariationRenderForm";
import { useProductStore } from "@/store/ProductStore";
import { useQueryClient } from "@tanstack/react-query";
import { addOptionsHandleMutation } from "./MainVariationcomp";

function NumberOfItemsPropComp<T extends NumberOfItemsVariationType>({
  schemaValue,
  mainKey,
  optionsRef,
}: VariationSchemaType<T>) {
  const [numberOfOItemsModal, setNumberOfOItemsModal] = useState(false);
  const [isMulti, setIsMulti] = useState<boolean | undefined>(undefined);
  const {
    variation,
    numberOfItems,
    setNumberOfItemsVariationValue,
    setVariants,
    variants,
  } = useVariationStore();
  const [addNumberOfItemsObj, setAddNumberOfItemsObj] =
    useState<NumberOfItemsVariationType>({});
  const { productTypeName } = useProductStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (variation && variation.includes("numberOfItems")) {
      setIsMulti(true);
    } else if (numberOfItems.length > 1) {
      setNumberOfItemsVariationValue(numberOfItems[0]);
      setIsMulti(false);
    } else {
      setIsMulti(false);
    }
  }, [variation, variants]);

  const addNumberOfItems = (val: Record<string, string>) => {
    setAddNumberOfItemsObj((prev) => {
      const updated = { ...prev, ...val };
      return updated;
    });
  };

  // ADD OPTION IN VARIANTS

  const onSuccessRefetchData = () => {
    queryClient.invalidateQueries({ queryKey: ["variants"] });
    setNumberOfOItemsModal(false);
  };
  const { mutate } = addOptionsHandleMutation(onSuccessRefetchData);

  const hanldeAddNumberOfItems = () => {
    const isItemExist = numberOfItems.some(
      (item) => item.value === addNumberOfItemsObj.displayName,
    );

    if (isItemExist) {
      return;
    }
    const newNumberOfItemsVariants = {
      displayName: addNumberOfItemsObj.displayName,
      value: addNumberOfItemsObj.value,
    };

    const payload: AddOptionPayloadType = {
      subCategory: productTypeName ?? "",
      attributeName: mainKey,
      value: newNumberOfItemsVariants,
    };

    // api call options cretae

    mutate(payload);
    // setNumberOfItemsVariationValue(newFlavorVariants);
    setVariants();
  };

  const handleOnselect: OnSelect<NumberOfItemsVariationType> = (value) => {
    setNumberOfItemsVariationValue(value);
    setVariants();
  };

  return (
    <div>
      {Object.entries(schemaValue).map(([rootKey, rootValue]) => {
        return (
          <VariationRenderForm
            AddOption={hanldeAddNumberOfItems}
            OnChange={addNumberOfItems}
            value={rootValue}
            rootKey={rootKey}
            isMulti={isMulti as undefined}
            key={rootKey}
            title={schemaValue.title}
            optionsRef={optionsRef}
            mainKey={mainKey}
            modalOpen={numberOfOItemsModal}
            setModalOpen={setNumberOfOItemsModal}
            OnSelect={handleOnselect}
            count={numberOfItems.length}
          />
        );
      })}
    </div>
  );
}

export default NumberOfItemsPropComp;
