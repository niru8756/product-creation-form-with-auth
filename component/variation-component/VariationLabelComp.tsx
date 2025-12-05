import { memo } from "react";

interface VariationLabelCompPropType {
  value: string | undefined;
  htmlFor?: string;
  requiredError?: string;
  count?: number;
  asterisk?: boolean;
}

function VariationLabelComp({
  htmlFor,
  value,
  // requiredError,
  count,
  asterisk=false,
}: VariationLabelCompPropType) {
  return (
    <div className="flex gap-1 py-1">
      <label
        htmlFor={htmlFor}
        className="text-Gray-500 text-sm font-medium pb-1.5"
      >
        {value}
         {asterisk && (
          <span className="text-Gray-500 text-sm">*</span>
        )}
      </label>
      {(count as number) > 0 && (
        <span className="text-Gray-700 text-xs font-medium border border-Gray-200 bg-Gray-50 px-4 py-0.5 rounded-2xl flex items-center justify-center">
          +{count}
        </span>
      )}
    </div>
  );
}

export default memo(VariationLabelComp);
