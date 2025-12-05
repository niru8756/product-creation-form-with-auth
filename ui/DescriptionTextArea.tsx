import { cn } from "@/lib/helper";
import {
  FieldError,
  FieldErrorsImpl,
  Merge,
  UseFormRegister,
} from "react-hook-form";

type DescriptionTextType = {
  error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined;
  disabled?: boolean;
  register?: UseFormRegister<any>;
  value?: string;
  placeholder?: string;
  name?: string;
  className?: string;
};

function DescriptionTextArea({
  error,
  disabled,
  register,
  value,
  placeholder,
  name,
  className
}: DescriptionTextType) {
  const errorMessage = error ? (error as FieldError).message : undefined;

  return (
    <div>
      <textarea
      disabled={disabled}
        placeholder={placeholder}
        value={value}
        {...(register && register(name ? name : "description"))}
        className={cn(
          "border border-Gray-300 rounded-lg px-3 py-2 flex items-center justify-between w-full gap-2 focus-visible:outline-none focus:border-Secondary-Blue-200 focus:shadow-ring-brand-shadow-xs resize-none h-44 scrollStyle",className,
          { "border-Error-300": error ? true : false },
          { "bg-Gray-50 text-Gray-400": disabled },
        )}
        id="description"
      ></textarea>
      {errorMessage && (
        <span className="text-Error-500 text-sm">
          {errorMessage || "Invalid input"}
        </span>
      )}
    </div>
  );
}

export default DescriptionTextArea;
