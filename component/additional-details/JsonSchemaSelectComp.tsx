import { useEffect, useRef, useState } from "react";
import { JsonShemaInputType } from "./JsonSchemaInputComp";
import HelpIcon from "@/assets/icons/HelpCircle";
import { cn } from "@/lib/utils";
import tippy from "tippy.js";
import ChevronDownIcon from "@/assets/icons/ChevronDownIcon";

interface JsonSchemaSelectCompPorpsType extends JsonShemaInputType {
  options: Record<string, string>;
  requiredError: string | undefined;
  description?: string;
}

function JsonSchemaSelectComp({
  OnBlur,
  error,
  childKey,
  parentKeyError,
  title,
  description,
  options,
  value,
  OnChange,
  requiredError,
  rootKey,
}: JsonSchemaSelectCompPorpsType) {
  const [focusDiv, setFocusDiv] = useState(false);
  const [, setSelectedOption] = useState(value);
  const divRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (divRef.current && !divRef.current.contains(e.target as Node)) {
        setFocusDiv(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
  }, [divRef]);

  const focusDivHandle = () => {
    setFocusDiv(!focusDiv);
  };

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

  const selectOptionHandle = (option: string) => {
    let processedOption: string | boolean = option;
    if (option === "true" || option === "false") {
      processedOption = option === "true";
      setSelectedOption(processedOption);
    } else {
      setSelectedOption(option);
    }

    setFocusDiv(false);
    OnChange(rootKey ?? "", childKey ?? "", processedOption);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1.5 items-center">
        <div>
          <label
            onClick={() => setFocusDiv(!focusDiv)}
            className="text-Gray-500 text-sm font-medium"
          >
            {title}
          </label>
          {requiredError && <span className="text-Error-500">*</span>}
        </div>
        <div
          ref={tooltipRef}
          className="relative w-fit inputSecondSymbol cursor-pointer flex justify-end"
        >
          {/* <img src={HelpIcon} alt="info-icon" /> */}
          <HelpIcon />
        </div>
      </div>
      <div className="relative w-full" ref={divRef}>
        <div
          className={cn(
            "border border-Gray-300 rounded-lg bg-white shadow-xs py-2 px-3 flex gap-2 items-center",
            {
              "border-Secondary-Blue-200 shadow-ring-brand-shadow-xs":
                focusDiv,
            },
            { "border-Error-300": error || parentKeyError },
          )}
          onClick={focusDivHandle}
        >
          <div className="w-full text-Gray-500 font-medium">
            {options[String(value)] ? options[String(value)] : "Select option"}
          </div>
          <div className="relative w-fit inputSecondSymbol cursor-pointer flex justify-end">
            <ChevronDownIcon color="#98A2B3" />
          </div>
        </div>
        {focusDiv && (
          <ul className="absolute top-full bg-white w-full mt-1 rounded-lg py-1 px-1.5 border border-Gray-200 shadow-lg flex flex-col gap-1 overflow-auto max-h-[300px] scrollStyle z-10">
            {Object.entries(options).map(([key, Value], idx) => {
              return (
                <li
                  className="py-2.5 px-2 bg-white hover:bg-Gray-50 rounded-md transition-all duration-300 ease-in-out cursor-pointer font-medium text-Gray-500"
                  key={idx}
                  onClick={() => {
                    selectOptionHandle(key);
                    if (OnBlur) OnBlur();
                  }}
                >
                  {Value}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {error && <span className="-text-Error-500 text-sm">{error}</span>}
      {parentKeyError && (
        <span className="-text-Error-500 text-sm">{parentKeyError}</span>
      )}
    </div>
  );
}

export default JsonSchemaSelectComp;
