import { cn } from "@/lib/utils";
import SingleSelectItem from "./SingleSelectItem";
import {
  FieldError,
  FieldErrorsImpl,
  Merge,
  UseFormRegister,
} from "react-hook-form";
import { memo } from "react";
import { CategoryType, ProductType } from "@/component/ProductFormDescription";

type SelectCompType = {
  inputId: string;
  items: CategoryType[] | ProductType[];
  placeHolder: string;
  getValue?: (val: string) => void;
  showMenuItem?: string;
  setShowMenuItem?: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
  register?: UseFormRegister<any>;
  error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined;
  disabled?: boolean;
};

function SelectComp({
  inputId,
  items,
  placeHolder,
  getValue,
  setShowMenuItem,
  showMenuItem,
  className,
  disabled
}: SelectCompType) {
  
  return (
    <>
      <div
        className={cn(
          "relative border rounded-lg py-2 px-3 flex items-center border-Gray-300 justify-between focusRing",
          { "bg-Gray-50": disabled },
          className,
        )}
      >
        <SingleSelectItem
        disabled={disabled}
          inputId={inputId}
          select={true}
          items={items}
          placeHolder={placeHolder}
          getValue={getValue}
          showMenuItem={showMenuItem}
          setShowMenuItem={setShowMenuItem}
        />
      </div>
    </>
  );
}

export default memo(SelectComp);
