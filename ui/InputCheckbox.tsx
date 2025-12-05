import { cn } from "@/lib/utils";

type InputCheckboxPropType = {
  inputId?: string;
  checked?: boolean;
  onChange?: (val: string, checked?: boolean) => void;
  value?: string;
  disabled?:boolean
};

function InputCheckbox({
  inputId,
  checked,
  onChange,
  value,
  disabled
}: InputCheckboxPropType) {
  return (
    <div className="inline-flex items-center">
      <label className={cn("flex items-center cursor-pointer relative",{"cursor-not-allowed":disabled})}>
        <input
          type="checkbox"
          className="peer h-[18px] w-[18px] transition-all appearance-none rounded  border border-Gray-300 bg-white checked:bg-brand-600-orange-p-1 checked:border-brand-600-orange-p-1 cursor-pointer disabled:opacity-80"
          id={inputId}
          checked={checked}
          onChange={(e) =>
            onChange && onChange(e.target.value, e.target.checked)
          }
          disabled={disabled}
          value={value}
        />
        <span className={cn("absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2")}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M10 3L4.5 8.5L2 6"
              stroke="white"
              strokeWidth="1.6666"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </label>
    </div>
  );
}

export default InputCheckbox;
