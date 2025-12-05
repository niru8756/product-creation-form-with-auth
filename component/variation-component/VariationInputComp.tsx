import { memo, useState } from "react";
import { cn } from "@/lib/utils";

type InputTypes = "number" | "text";

export interface VariationInputCompType {
  value?: string | number | undefined | boolean;
  title?: string;
  rootKey?: string | undefined;
  childKey?: string;
  idx?: number | undefined;
  placeholder?: string | undefined;
  description?: string | undefined;
  type?: InputTypes;
  id?: string | undefined;
  error?: string | undefined;
  parentKeyError?: string;
  OnChange?: (val: Record<string, string>) => void;
}

function VariationInputComp({
  placeholder,
  type,
  id,
  OnChange,
}: VariationInputCompType) {
  const [obj, setObj] = useState<Record<string, string>>({});
  const [changeValue, setChangeValue] = useState("");

  const handleOnChange = (id: string | undefined, value: string) => {
    setChangeValue(value);
    if (id) {
      obj[id] = value;
      setObj({ ...obj });
    }
    if (typeof OnChange === "function") {
      OnChange(obj);
    }
  };

  return (
    <div className="flex flex-col items-start w-full">
      <div
        className={cn(
          "border w-full border-Gray-300 rounded-lg bg-white shadow-shadow-xs py-2 px-3 flex gap-2 focus-within:border-Secondary-Blue-200 focus-within:shadow-ring-brand-shadow-xs items-center",
        )}
      >
        <input
          onChange={(e) => handleOnChange(id, e.target.value)}
          id={id}
          type={type}
          className="border-none w-full placeholder:text-Gray-400 placeholder:text-base focus:outline-none text-Gray-900"
          placeholder={placeholder}
          value={changeValue}
        />
      </div>
    </div>
  );
}

export default memo(VariationInputComp);
