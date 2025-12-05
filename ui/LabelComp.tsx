import { cn } from "@/lib/helper";

type LabelProps = {
  asterisk?: boolean;
  name: string;
  htmlfor: string;
  className?: string;
  errors?: string | null;
};

function LabelComp({ asterisk, name, htmlfor, className, errors }: LabelProps) {
  return (
    <div>
      <label
        htmlFor={htmlfor}
        className={cn(
          "capitalize labelText text-gray-500 md:text-sm text-xs font-medium",
          className,
        )}
      >
        {name}
        {asterisk && (
          <span className={cn({ "text-Error-500": errors })}>*</span>
        )}
      </label>
    </div>
  );
}

export default LabelComp;
