import { memo, useEffect, useRef } from "react";
import HelpIcon from "@/assets/icons/HelpCircle";
import tippy from "tippy.js";

interface JsonSchemaLabelCompPropType {
  value: string | undefined;
  htmlFor: string;
  requiredError?: string;
  description?: string;
  count?: number;
}

function JsonSchemaLabelComp({
  htmlFor,
  value,
  requiredError,
  description,
}: JsonSchemaLabelCompPropType) {
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (tooltipRef.current && description) {
      tippy(tooltipRef.current, {
        theme: "unsktooltip",
        content: description,
        arrow: true,
        placement: "bottom",
      });
    }
  }, [description]);

  return (
    <div className="flex gap-1.5 items-center">
      <div>
        <label htmlFor={htmlFor} className="text-Gray-500 text-sm font-medium">
          {value}
        </label>
        {requiredError && <span className="text-Error-500">*</span>}
      </div>
      {description && (
        <div
          ref={tooltipRef}
          className="relative w-fit cursor-pointer flex justify-end"
        >
          {/* <img src={HelpIcon} alt="info-icon" /> */}
          <HelpIcon />
        </div>
      )}
    </div>
  );
}

export default memo(JsonSchemaLabelComp);
