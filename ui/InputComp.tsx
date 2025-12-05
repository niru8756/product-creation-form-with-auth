import AlertIcon from "@/assets/icons/AlertCircleIcon";
import {
  FieldError,
  FieldErrorsImpl,
  FieldValues,
  Merge,
  Path,
  UseFormRegister,
} from "react-hook-form";
import TooltipComp from "./TooltipComp";
import { WheelEvent } from "react";
import { cn } from "@/lib/helper";
import Image from "next/image";

type InputType = "text" | "password" | "email" | "number";

type InputProps<TFieldValues extends FieldValues = FieldValues> = {
  startSymbol?: string;
  StartIcon?: React.ReactElement;
  endSymbol?: string;
  EndIcon?: React.ReactNode;
  placeHolder: string;
  tooltip?: boolean;
  tooltipText?: string;
  type: InputType;
  name: Path<TFieldValues>;
  inputid: string;
  register?: UseFormRegister<TFieldValues>;
  error?:
    | FieldError
    | Merge<FieldError, FieldErrorsImpl<TFieldValues>>
    | undefined;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  maxLength?: number;
  readOnly?: boolean;
  value?: string | number | null;
  autoFocus?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules?: Record<string, any>;
};
const InputComp = <TFieldValues extends FieldValues = FieldValues>({
  startSymbol,
  StartIcon,
  endSymbol,
  EndIcon,
  placeHolder,
  tooltip,
  tooltipText,
  type,
  name,
  inputid,
  register,
  error,
  disabled,
  className,
  inputClassName,
  maxLength,
  readOnly,
  value,
  rules,
  autoFocus = false,
}: InputProps<TFieldValues>) => {
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
    <>
      <div
        className={cn(
          "border border-Gray-300 rounded-lg px-3 py-2  flex items-center justify-between w-full gap-2 focusRing ",
          { "border-Error-300": error ? true : false },
          { "bg-Gray-50": disabled },
          className
        )}
      >
        <div className="flex items-center gap-2 w-full">
          {startSymbol ? (
            <Image
              src={startSymbol}
              alt="symbolic-icon"
              width={24}
              height={24}
            />
          ) : StartIcon ? (
            StartIcon
          ) : null}
          <input
            min={0}
            disabled={disabled}
            type={type}
            className={cn(
              "bg-transparent placeholder:bg-transparent input w-full border-none focus:outline-none text-Gray-900 disabled:bg-Gray-50 disabled:text-Gray-400 disabled:placeholder:bg-Gray-50",
              inputClassName
            )}
            placeholder={placeHolder}
            id={inputid}
            {...(register && register(name, rules))}
            maxLength={maxLength}
            readOnly={readOnly}
            autoFocus={autoFocus}
            value={value as string}
            {...(type == "number" && { onWheel: preventWheelChange })}
          />
        </div>
        <div
          className={cn(
            "relative inputSecondSymbol cursor-pointer flex justify-end",
            { "cursor-default": error }
          )}
        >
          {error && <AlertIcon />}
          {EndIcon && !error ? EndIcon : null}

          {endSymbol && !error && (
            <Image
              src={endSymbol} // local import or URL
              alt="symbolic-icon"
              width={24} // specify width
              height={24} // specify height
            />
          )}
          {!error && tooltip && (
            <TooltipComp tooltipText={tooltipText || "Info Something..."} />
          )}
        </div>
      </div>
      {error && (
        <span className="text-Error-500 text-sm">
          {(error as FieldError).message || "Invalid input"}
        </span>
      )}
    </>
  );
};

export default InputComp;
