import { memo, useEffect, useState } from "react";
import SearchIcon from "@/assets/icons/SearchIcon";
import CloseIcon from "@/assets/icons/CloseIcon";

import Select, {
  ClearIndicatorProps,
  components,
  ControlProps,
  DropdownIndicatorProps,
  IndicatorSeparatorProps,
  MultiValue,
  MultiValueRemoveProps,
  StylesConfig,
} from "react-select";
import { PrimitiveValue } from "@/type/json-form-type";
import ChevronDownIcon from "@/assets/icons/ChevronDownIcon";

// Define the Option type
export interface Option {
  value?: PrimitiveValue;
  label?: string | undefined | boolean | number;
  language_tag?: string;
}

// Define the props for the MultiSelect component
interface MultiSelectProps {
  name: string;
  placeHolder: string;
  options?: Option[];
  rootKey: string;
  OnChange: (rootKey: string, value: Option[]) => void;
  error: string;
  defaultValue: Option[] | Option;
  isMutiValue: true | undefined;
  parentKeyError?: string;
}

// Functional component for MultiSelect
function JsonSchemaMultiSelect({
  rootKey,
  parentKeyError,
  isMutiValue,
  OnChange,
  name,
  defaultValue,
  placeHolder,
  options,
  error,
}: MultiSelectProps) {
  const [value, setValue] = useState<MultiValue<Option> | null>(null);

  useEffect(() => {
    if (defaultValue) {
      setValue(Array.isArray(defaultValue) ? defaultValue : [defaultValue]);
    }
  }, [defaultValue]);

  //   change event handle

  const valueChangeHandle = (value: MultiValue<Option>) => {
    const mutableValue = value as Option[];
    setValue(value);
    OnChange(rootKey, mutableValue);
  };

  // Custom Control Component
  const Control = (props: ControlProps<Option, true>) => {
    return (
      <components.Control {...props}>
        <SearchIcon />
        {props.children}
      </components.Control>
    );
  };

  const indicatorSeparatorStyle = {
    display: "none",
  };

  const IndicatorSeparator = (props: IndicatorSeparatorProps<Option, true>) => {
    return <span style={indicatorSeparatorStyle} {...props.innerProps} />;
  };

  const DropdownIndicator = (props: DropdownIndicatorProps<Option, true>) => {
    return (
      <components.DropdownIndicator {...props}>
        <ChevronDownIcon color="#98A2B3" />
      </components.DropdownIndicator>
    );
  };

  // Custom ClearIndicator component (hiding the clear button)
  const ClearIndicator = (props: ClearIndicatorProps<Option, true>) => {
    const {
      children,
      innerProps: { ref, ...restInnerProps },
    } = props;
    return (
      <div {...restInnerProps} ref={ref} style={{ display: "none" }}>
        <div style={{ padding: "0px 5px" }}>{children}</div>
      </div>
    );
  };

  // Custom MultiValueRemove component
  const MultiValueRemove = (props: MultiValueRemoveProps<Option, true>) => {
    return (
      <components.MultiValueRemove {...props}>
        <CloseIcon />
      </components.MultiValueRemove>
    );
  };
  const NoOptionsMessage = () => {
    return (
      <div className="bg-white flex gap-2 justify-between items-center">
        <p className="text-Gray-500 font-medium text-base leading-7 py-2.5 ps-2 pe-2.5">
          No Option Found
        </p>
      </div>
    );
  };

  // Custom styles
  const styles: StylesConfig<Option, true> = {
    control: (css) => ({
      ...css,
      height: "fit",
      boxSizing: "border-box",
      flexWrap: "wrap",
      display: "flex",
      justifyContent: "center",
      alignContent: "center",
      borderRadius: "8px",
    }),
    multiValue: (base) => ({
      ...base,
      border: `1px solid #D0D5DD`,
      display: "flex",
      backgroundColor: "white",
      padding: "1px 4px 1px 4px",
      justifyContent: "center",
      alignContent: "center",
      gap: "3px",
      borderRadius: "6px",
      margin: "0px",
      boxSizing: "content-box",
      flexWrap: "wrap",
      color: "#344054",
      fontWeight: 500,
    }),
    multiValueRemove: (base) => ({
      ...base,
      ":hover": {
        backgroundColor: "transparent",
        color: "#98A2B3",
      },
    }),
    option: (base) => ({
      ...base,
      ":hover": {
        backgroundColor: "#F9FAFB",
      },
      padding: "10px 8px",
      fontSize: "16px",
      fontWeight: "500",
      color: "#101828",
      borderRadius: "6px",
      backgroundColor: "#fff",
    }),
    menu: (base) => ({
      ...base,
      border: "1px solid #D0D5DD",
      borderRadius: "6px",
    }),
    menuList: (base) => ({
      ...base,
      borderRadius: "6px",
      backgroundColor: "white",
      padding: "4px 6px",
      "&::-webkit-scrollbar": {
        width: "8px",
      },
      "&::-webkit-scrollbar-thumb": {
        height: "156px",
        backgroundColor: "#EAECF0",
        borderRadius: "8px",
      },
      "&::-webkit-scrollbar-track": {
        backgroundColor: "transparent",
        width: "160px",
        padding: "4px",
      },
      "&::-webkit-scrollbar-button": {
        display: "none",
      },
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: "16px",
      color: "#101828",
      fontWeight: 400,
    }),
    valueContainer: (base) => ({
      ...base,
      gap: "3px",
      color: "white",
      width: "100%",
    }),
  };

  return (
    <div>
      <Select
        blurInputOnSelect
        menuPlacement="auto"
        minMenuHeight={300}
        className="react-select-container w-full"
        classNames={{
          control: (state) =>
            ` px-[14px] py-[2px] ${
              state.isFocused
                ? "focusSelectRing border !border-[#9FC3CE]"
                : "border !border-[#D0D5DD]"
            }`,
        }}
        placeholder={placeHolder}
        isMulti={isMutiValue}
        isSearchable={true}
        name={name}
        value={value}
        options={options}
        components={{
          Control,
          IndicatorSeparator,
          DropdownIndicator,
          ClearIndicator,
          MultiValueRemove,
          NoOptionsMessage,
        }}
        onChange={valueChangeHandle}
        styles={styles}
      />
      {error && <span className="text-Error-500 text-sm">{error}</span>}
      {parentKeyError && (
        <span className="text-Error-500 text-sm">{parentKeyError}</span>
      )}
    </div>
  );
}

export default memo(JsonSchemaMultiSelect);
