import { memo, useEffect, useState } from "react";
import CloseIcon from "@/assets/icons/CloseIcon";
import Select, {
  ClearIndicatorProps,
  components,
  ControlProps,
  DropdownIndicatorProps,
  IndicatorSeparatorProps,
  MenuProps,
  MultiValue,
  MultiValueRemoveProps,
  OptionProps,
  StylesConfig,
} from "react-select";
import CheckIcon from "@/assets/icons/CheckIcon";
import {
  ColorVariationType,
  OnSelect,
  SizeValueType,
} from "@/type/variation-type";
import SearchIcon from "@/assets/icons/SearchIcon";
import ChevronDownIcon from "@/assets/icons/ChevronDownIcon";
import PlusIcon from "@/assets/icons/PlusIcon";
import { FormatOptions } from "date-fns";

export interface OptionVariantType {
  label: string;
  value: string;
}

// Define the props for the MultiSelect component
interface MultiSelectProps<T> {
  name?: string;
  placeHolder?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
  noOption?: boolean;
  setModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  OnSelect?: OnSelect<T>;
  isMulti?: boolean;
  OnChange?: (val: Record<string, string>) => void;
  modalOpen?: boolean;
  defaultValue?: FormatOptions[];
}

// Functional component for MultiSelect
function MultiSelectVariation({
  options,
  placeHolder,
  OnChange,
  noOption,
  setModalOpen,
  modalOpen,
  defaultValue,
  OnSelect,
  name,
  isMulti,
}: MultiSelectProps<SizeValueType | ColorVariationType>) {
  const [value, setValue] = useState<
    OptionVariantType | MultiValue<OptionVariantType> | null
  >(null);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue as any);
    }
  }, [defaultValue]);

  useEffect(() => {
    if (!modalOpen) {
      setMenuIsOpen(false);
    }
  }, [modalOpen]);

  useEffect(() => {
    if (!isMulti && Array.isArray(value)) {
      setValue(value[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMulti]);

  // Reorder options to place selected ones on top

  const reorderedOptions = options.sort(
    (a: OptionVariantType, b: OptionVariantType) => {
      const isSelectedA = Array.isArray(value)
        ? value.some((v) => v.value === a.value)
        : (value as OptionVariantType)?.value === a.value;

      const isSelectedB = Array.isArray(value)
        ? value.some((v) => v.value === b.value)
        : (value as OptionVariantType)?.value === b.value;
      return +isSelectedB - +isSelectedA;
    },
  );
  //   change event handle

  const handleSelectChange = (value: OptionVariantType) => {
    setValue(value);
    if (Array.isArray(value)) {
      if (OnSelect) {
        OnSelect(value);
      }
    } else {
      if (OnSelect) {
        OnSelect(value.value as SizeValueType | ColorVariationType);
      }
      if (OnChange) {
        const obj: Record<string, string> = {};
        if (name) {
          obj[name] = value.value;
        }
        OnChange(obj);
      }
    }
  };

  // Custom Control Component
const Control = (props: ControlProps<OptionVariantType, true>) => {
  const newProps = {
    ...props,
    innerProps: {
      ...props.innerProps,
      onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        setMenuIsOpen(true);
        setIsFocused(true);

        // preserve original react-select events
        props.innerProps?.onMouseDown?.(e);
      },
      onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => {
        e.stopPropagation();
        setMenuIsOpen(true);
        setIsFocused(true);

        props.innerProps?.onTouchStart?.(e);
      }
    }
  };

  return (
    <components.Control {...newProps}>
      <SearchIcon color="#667085" />
      {props.children}
    </components.Control>
  );
};


  const indicatorSeparatorStyle = {
    display: "none",
  };

  const IndicatorSeparator = (
    props: IndicatorSeparatorProps<OptionVariantType, true>,
  ) => {
    return <span style={indicatorSeparatorStyle} {...props.innerProps} />;
  };

  const DropdownIndicator = (
    props: DropdownIndicatorProps<OptionVariantType, true>,
  ) => {
    return (
      <components.DropdownIndicator {...props}>
        {/* <img src={ChevronDownIcon} alt="chevron-down-icon" /> */}
        <ChevronDownIcon color="black" />
      </components.DropdownIndicator>
    );
  };

  // Custom ClearIndicator component (hiding the clear button)
  const ClearIndicator = (
    props: ClearIndicatorProps<OptionVariantType, true>,
  ) => {
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

  const Menu = (props: MenuProps<OptionVariantType, true>) => {
     const newProps = {
    ...props,
    innerProps: {
      ...props.innerProps,
      onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        setMenuIsOpen(true);
        setIsFocused(true);

        // preserve original react-select events
        props.innerProps?.onMouseDown?.(e);
      },
      onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => {
        e.stopPropagation();
        setMenuIsOpen(true);
        setIsFocused(true);

        props.innerProps?.onTouchStart?.(e);
      }
    }
  };
    return (
      <>
        <components.Menu {...{...newProps}}>
          {props.children}
          {noOption && (
            <div
              className="text-Brand-700 text-sm font-semibold flex justify-center items-center gap-1.5 bg-Brand-25 rounded-b-lg py-2.5 cursor-pointer"
              onClick={() => setModalOpen?.(true)}
            >
              {/* <img src={PlusIcon} alt="plus-icon" /> */}
              <PlusIcon />
              Add Another Option
            </div>
          )}
        </components.Menu>
      </>
    );
  };

  // Custom MultiValueRemove component
  const MultiValueRemove = (
    props: MultiValueRemoveProps<OptionVariantType, true>,
  ) => {
    return (
      <components.MultiValueRemove {...props}>
        {/* <img src={CloseIcon} alt="x-close-icon" /> */}
        <CloseIcon />
      </components.MultiValueRemove>
    );
  };
  const NoOptionsMessage = () => {
    return (
      <div className="bg-white flex gap-2 justify-between items-center">
        <p className="text-Gray-500 font-medium text-base leading-7 py-2.5 ps-2 pe-2.5">
          No option found
        </p>
      </div>
    );
  };

  const Option = (props: OptionProps<OptionVariantType, true>) => {
    return (
      <components.Option {...props}>
        <div className="flex items-center w-full justify-between">
          {props.children}
          {props.isSelected && <CheckIcon />}
        </div>
      </components.Option>
    );
  };

  // Custom styles
  const styles: StylesConfig<OptionVariantType, true> = {
    control: (css) => ({
      ...css,
      height: "fit",
      boxSizing: "border-box",
      flexWrap: "wrap",
      display: "flex",
      justifyContent: "center",
      alignContent: "center",
      borderRadius: "8px",
      border: isFocused ? "1px solid #9FC3CE !important" : "1px solid #D0D5DD",
      boxShadow: isFocused
        ? "0px 1px 2px 0px #bfd7df,0px 0px 0px 4px rgba(191, 215, 223, 0.24)"
        : "",
      ":hover": {
        borderColor: "#D0D5DD",
      },
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
    option: (base, state) => ({
      ...base,
      ":hover": {
        backgroundColor: "#F9FAFB",
      },
      padding: "10px 8px",
      fontSize: "16px",
      fontWeight: "500",
      color: "#101828",
      borderRadius: "6px",
      backgroundColor: state.isSelected ? "#F9FAFB" : "#fff",
    }),
    menu: (base) => ({
      ...base,
      border: "1px solid #D0D5DD",
      borderRadius: "6px",
      marginBottom: "30px !important",
    }),
    menuList: (base) => ({
      ...base,
      borderRadius: "6px",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
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
      width: "100%",
    }),
  };

  return (
    <div>
      <Select
        menuIsOpen={menuIsOpen}
        menuPlacement="auto"
        minMenuHeight={300}
        onMenuOpen={() => {
          setMenuIsOpen(true);
          setIsFocused(true);
        }}
        onMenuClose={() => {
          setMenuIsOpen(false);
          setIsFocused(false);
        }}
        blurInputOnSelect
        className="react-select-container w-full"
        classNames={{
          control: () =>
            ` px-[14px] py-[4px] 
          ${
            ""
            // state.isFocused
            //   ? "focusSelectRing border !border-[#9FC3CE]"
            //   : "border !border-[#D0D5DD]"
          }
            `,
        }}
        hideSelectedOptions={false}
        placeholder={placeHolder}
        isMulti={isMulti ? isMulti : undefined}
        isSearchable={true}
        value={value}
        options={reorderedOptions}
        onChange={handleSelectChange as unknown as undefined}
        components={{
          Control,
          IndicatorSeparator,
          DropdownIndicator,
          ClearIndicator,
          MultiValueRemove,
          NoOptionsMessage,
          Menu,
          Option,
        }}
        styles={styles}
      />
    </div>
  );
}

export default memo(MultiSelectVariation);
