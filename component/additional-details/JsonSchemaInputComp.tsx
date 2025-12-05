import AlertCircleIcon from "@/assets/icons/AlertCircleIcon";
import { memo } from "react";
import { cn } from "@/lib/utils";

type InputTypes = "number" | "text";

export interface JsonShemaInputType {
  value?: string | number | undefined | boolean;
  title?: string;
  rootKey?: string | undefined;
  childKey?: string;
  idx?: number | undefined;
  placeholder?: string | undefined;
  type?: InputTypes;
  id: string | undefined;
  OnChange: (
    rootKey: string,
    childKey: string,
    value: string | boolean,
    idx?: number,
  ) => void;
  OnBlur?: () => void;
  error: string | undefined;
  parentKeyError?: string;
}

function JsonSchemaInputComp({
  placeholder,
  type,
  OnChange,
  rootKey,
  childKey,
  value,
  idx,
  id,
  error,
  parentKeyError,
  OnBlur,
}: JsonShemaInputType) {

  return (
    <div className="flex flex-col items-start w-full h-full">
      <div
        className={cn(
          "border w-full border-Gray-300 rounded-lg bg-white shadow-shadow-xs py-2 px-3 flex gap-2 focus-within:border-Secondary-Blue-200 focus-within:shadow-ring-brand-shadow-xs items-center",
          { "mt-1": idx },
          { "border-Error-300": error || parentKeyError },
        )}
      >
        <input
          onBlur={() => {
            OnBlur && OnBlur();
          }}
          id={id}
          type={type}
          className="border-none w-full placeholder:text-Gray-400 placeholder:text-base focus:outline-none text-Gray-900"
          placeholder={placeholder}
          value={typeof value === "boolean" ? String(value) : value}
          onChange={(e) =>
            OnChange(rootKey ?? "", childKey ?? "", e.target.value, idx)
          }
        />
        {error || parentKeyError ? (
          // <img src={AlertIcon} alt="alert-icon" />
          <AlertCircleIcon />
        ) : (
          ""
        )}
      </div>
      {error && <span className="text-Error-500 text-sm">{error}</span>}
      {parentKeyError && (
        <span className="text-Error-500 text-sm">{parentKeyError}</span>
      )}
    </div>
  );
}

export default memo(JsonSchemaInputComp);
