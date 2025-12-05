import { cn } from "@/lib/helper";

type ButtonType = "submit" | "button";

type SecondaryButtonPropType = {
  text: React.ReactNode;
  className?: string;
  additionalText?: React.ReactNode;
  type?: ButtonType;
  disabled?: boolean;
  OnClick?: () => void;
};
function SecondaryButton({
  text,
  className,
  additionalText,
  type,
  OnClick,
  disabled=false
}: SecondaryButtonPropType) {
  return (
    <button
      type={type}
      onClick={OnClick}
      className={cn(
        "bg-white rounded-lg border flex justify-center items-center border-Gray-300 shadow-shadow-xs text-sm font-semibold text-Gray-500 hover:bg-Gray-50 hover:text-Gray-700  transition-all duration-300 ease-in-out focus:shadow-ring-gray-shadow-xs focus:bg-white",
        disabled && 'bg-gray-100 text-gray-300 hover:bg-gray-100 hover:text-gray-300',
        className,
      )}
      disabled={disabled}
    >
      {text}
      {additionalText}
    </button>
  );
}

export default SecondaryButton;
