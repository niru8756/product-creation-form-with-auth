import { cn } from "@/lib/utils";
import { WheelEvent } from "react";
import {
  FieldError,
  FieldErrorsImpl,
  Merge,
  UseFormRegister,
} from "react-hook-form";
import { CategoryType, ProductType } from "@/component/ProductFormDescription";
import SingleSelectItem from "@/ui/SingleSelectItem";

interface SelectCompProps {
  items: CategoryType[] | ProductType[];
  placeHolder: string;
  categoryInput?: boolean;
  inputId: string;
  getValue?: (val: string) => void;
  showMenuItem?: string;
  setShowMenuItem?: React.Dispatch<React.SetStateAction<string>>;
  register?: UseFormRegister<any>;
  error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined;
  name: string;
  value?: string | number;
}

function InputSelect({
  items,
  name,
  placeHolder,
  categoryInput,
  inputId,
  getValue,
  setShowMenuItem,
  showMenuItem,
  value,
  register,
  error,
}: SelectCompProps) {
  const preventWheelChange = (e: WheelEvent<HTMLInputElement>) => {
    // Prevent the input value change
    const target = e.target as HTMLInputElement;
    target.blur();
    // Prevent the page/container scrolling
    // e.stopPropagation();

    // Refocus immediately, on the next tick (after the current function is done)
    setTimeout(() => {
      target.focus();
    }, 0);
  };

  return (
    <div className="relative">
      <div
        className={cn(
          "border border-Gray-300 rounded-lg py-2 px-3 flex items-center justify-between focusRing ",
          { "border-Error-300": error ? true : false },
        )}
      >
        <input
          min={0}
          value={value ?? ""}
          type="number"
          className="input w-full focus-visible:outline-none"
          placeholder={placeHolder}
          id={inputId}
          {...(register && register(name))}
          onWheel={preventWheelChange}
        />
        <SingleSelectItem
          getValue={getValue}
          inputId={inputId}
          items={items}
          categoryInput={categoryInput}
          showMenuItem={showMenuItem}
          setShowMenuItem={setShowMenuItem}
        />
      </div>
      {error && (
        <span className="text-Error-500 text-sm">
          {(error as FieldError).message || "Invalid input"}
        </span>
      )}
    </div>
  );
}

export default InputSelect;
