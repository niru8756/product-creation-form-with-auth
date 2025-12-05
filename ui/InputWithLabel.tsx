import TooltipComp from "./TooltipComp";
import AlertIcon from "@/assets/icons/AlertCircleIcon";
import {
  FieldError,
  FieldErrorsImpl,
  Merge,
  UseFormRegister,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import React from "react";
import Image from "next/image";

type InputLabel = {
  endSymbol?: string | React.ElementType;
  tooltip?: boolean;
  tooltipText?: string;
  error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined;
  register?: UseFormRegister<any>;
  name: string;
  placeholder: string;
  inputId: string;
  value?: string | number;
  disabled?: boolean;
  rules?: Record<string, any>;
};
function InputWithLabel({
  endSymbol,
  tooltip,
  tooltipText,
  register,
  error,
  value,
  name,
  placeholder,
  inputId,
  disabled,
  rules,
}: InputLabel) {
  return (
    <>
      <div
        className={`-border-Gray-300 ${
          error ? "border-Error-300" : "focusRing"
        } flex justify-between rounded-lg border ${
          disabled ? "bg-Gray-50" : ""
        }`}
      >
        <div
          className={` ${
            error ? "" : "border-e"
          } rounded-s-lg py-2.5 px-3.5 flex items-center justify-between gap-2 w-full border-e`}
        >
          <div className="flex gap-2 w-full">
            <input
              disabled={disabled}
              value={value ?? ""}
              type="number"
              className="input w-full focus-visible:outline-none disabled:bg-Gray-50 disabled:placeholder:bg-Gray-50 disabled:text-Gray-400"
              placeholder={placeholder}
              id={inputId}
              {...(register && register(name, rules))}
              onWheel={(e) => {
                e.preventDefault();
                e.currentTarget.blur();
                return false;
              }}
            />
          </div>
          <div
            className={cn(
              "relative inputSecondSymbol cursor-pointer flex justify-end",
              { "cursor-default": error }
            )}
          >
            {error && <AlertIcon />}
            {!error &&
              endSymbol &&
              (typeof endSymbol === "string" ? (
                <Image
                  src={endSymbol} // local import or URL
                  alt="symbolic-icon"
                  width={24} // specify width
                  height={24} // specify height
                />
              ) : (
                React.createElement(endSymbol)
              ))}
            {!error && tooltip && (
              <TooltipComp tooltipText={tooltipText || "Info Something..."} />
            )}
          </div>
        </div>
        <button
          type="button"
          className="py-2.5 btn px-4 text-Gray-400 border-Gray-300 rounded-e-lg border-s-0 cursor-default font-semibold"
        >
          Qty.
        </button>
      </div>
      {error && (
        <span className="text-Error-500 text-sm">
          {(error as FieldError).message || "Invalid input"}
        </span>
      )}
    </>
  );
}

export default InputWithLabel;
