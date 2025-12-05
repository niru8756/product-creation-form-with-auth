import SearchIcon from "@/assets/icons/SearchIcon";
import CloseIcon from "@/assets/icons/CloseIcon";
import CheckIcon from "@/assets/icons/CheckIcon";

import Select, {
  components,
  ControlProps,
  DropdownIndicatorProps,
  IndicatorSeparatorProps,
  SingleValue,
  MultiValue,
  OptionProps,
  StylesConfig,
  ClearIndicatorProps,
  MultiValueRemoveProps,
  ValueContainerProps,
} from "react-select";
import ChevronDownIcon from "@/assets/icons/ChevronDownIcon";
import { cn } from "@/lib/utils";

// Define the Option type
export interface Option {
  value: string;
  label: string;
}

// Define the props for the Select component
interface SelectProps {
  name: string;
  placeHolder: string;
  options: Option[];
  getValue?: (val: Option | Option[] | null) => void;
  selectedValue?: Option | Option[] | null;
  searchIcon?: boolean;
  disabled?: boolean;
  isMulti?: boolean;
  isError?: boolean;
  onInputChange?: (inputValue: string, actionMeta: { action: string }) => void;
}

// Functional component for Select
function SelectComp({
  name,
  placeHolder,
  options,
  getValue,
  selectedValue,
  disabled = false,
  searchIcon = false,
  isMulti = false,
  isError = false,
  onInputChange,
}: SelectProps) {
  const isSearchable = true;
  const isLoading = false;
  const isRtl = false;

  // Custom Control Component
  const Control = (props: ControlProps<Option, boolean>) => {
    return (
      <components.Control {...props}>
        {searchIcon && <SearchIcon />}
        {props.children}
      </components.Control>
    );
  };

  const indicatorSeparatorStyle = {
    display: "none",
  };

  const IndicatorSeparator = (
    props: IndicatorSeparatorProps<Option, boolean>,
  ) => {
    return <span style={indicatorSeparatorStyle} {...props.innerProps} />;
  };

  const DropdownIndicator = (
    props: DropdownIndicatorProps<Option, boolean>,
  ) => {
    return (
      <components.DropdownIndicator {...props} className="p-0!">
        <ChevronDownIcon color={cn({ black: !disabled, gray: disabled })} />
      </components.DropdownIndicator>
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

  const OptionComponent = (props: OptionProps<Option, boolean>) => {
    return (
      <components.Option {...props}>
        <div className="flex items-center w-full justify-between">
          <p className="text-nowrap">{props.children}</p>
          {props.isSelected && <CheckIcon />}
        </div>
      </components.Option>
    );
  };

  // Custom ClearIndicator component (hiding the clear button)
  const ClearIndicator = (props: ClearIndicatorProps<Option, boolean>) => {
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
  const MultiValueRemove = (props: MultiValueRemoveProps<Option, boolean>) => {
    return (
      <components.MultiValueRemove {...props}>
        {/* <img src={CloseIcon} alt="x-close-icon" /> */}
        <CloseIcon />
      </components.MultiValueRemove>
    );
  };

  // Custom ValueContainer to prevent opening menu when scrolling
  const ValueContainer = (props: ValueContainerProps<Option, boolean>) => {
    const handleMouseDown = (e: React.MouseEvent) => {
      const target = e.currentTarget as HTMLElement;
      const { clientX, clientY } = e;
      const { offsetWidth, offsetHeight, scrollHeight, scrollWidth } = target;

      const isScrollbarClick =
        (scrollWidth > offsetWidth && clientY > target.clientHeight - 16) ||
        (scrollHeight > offsetHeight && clientX > target.clientWidth - 16);

      if (isScrollbarClick) {
        e.stopPropagation();
        e.preventDefault();
        return;
      }
    };

    return (
      <components.ValueContainer
        {...props}
        innerProps={{
          ...props.innerProps,
          onMouseDown: (e) => {
            handleMouseDown(e);
            if (props.innerProps?.onMouseDown) {
              const target = e.currentTarget as HTMLElement;
              const { clientX, clientY } = e;
              const { offsetWidth, offsetHeight, scrollHeight, scrollWidth } =
                target;
              const isScrollbarClick =
                (scrollWidth > offsetWidth &&
                  clientY > target.clientHeight - 16) ||
                (scrollHeight > offsetHeight &&
                  clientX > target.clientWidth - 16);

              if (!isScrollbarClick) {
                props.innerProps.onMouseDown(e);
              }
            }
          },
        }}
      >
        {props.children}
      </components.ValueContainer>
    );
  };

  // Custom styles
  const styles: StylesConfig<Option, boolean> = {
    control: (css) => ({
      ...css,
      height: "46px",
      boxSizing: "border-box",
      display: "flex",
      justifyContent: "center",
      alignContent: "center",
      borderRadius: "8px",
      width: "100%",
    }),
    multiValue: (base) => ({
      ...base,
      flex: "0 0 auto", // chips won't shrink
      border: "1px solid #D0D5DD",
      display: "flex",
      backgroundColor: "white",
      padding: "1px 4px",
      justifyContent: "center",
      alignContent: "center",
      gap: "3px",
      borderRadius: "6px",
      margin: "0px",
      boxSizing: "content-box",
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
      padding: "10px 8px",
      fontSize: "16px",
      fontWeight: "500",
      color: "#101828",
      borderRadius: "6px",
      backgroundColor: state.isFocused
        ? "#F9FAFB"
        : state.isSelected
          ? "#F9FAFB"
          : "#fff",
      ":hover": {
        backgroundColor: "#F9FAFB",
      },
      cursor: "pointer",
      transition: "background-color 0.15s ease",
    }),
    menu: (base) => ({
      ...base,
      border: "1px solid #D0D5DD",
      borderRadius: "6px",
      zIndex: "30",
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
      color: "#98A2B3",
      fontWeight: 400,
    }),
    valueContainer: (base) => ({
      ...base,
      gap: "3px",
      width: "100%",
      overflowX: "auto",
      flexWrap: "nowrap",
      whiteSpace: "nowrap",
      // scrollbarWidth: "thin",
      msOverflowStyle: "none",
      "::-webkit-scrollbar": {
        height: "7px",
        width: "7px",
      },
      "::-webkit-scrollbar-thumb": {
        backgroundColor: "#EAECF0",
        borderRadius: "3px",
      },
      "::-webkit-scrollbar-track": {
        backgroundColor: "transparent",
      },
      "::-webkit-scrollbar-button": {
        display: "none",
        width: 0,
        height: 0,
      },
    }),
  };

  // Change handler that works for both single and multi select
  const changeHandle = (val: SingleValue<Option> | MultiValue<Option>) => {
    if (getValue) {
      if (isMulti) {
        getValue(val as Option[] | null);
      } else {
        getValue(val as Option | null);
      }
    }
  };

  return (
    <Select
      isDisabled={disabled}
      menuPlacement="auto"
      minMenuHeight={300}
      className="react-select-container w-full"
      classNames={{
        control: (state) =>
          `border !border-[#D0D5DD] pe-[12px] py-[8px] ${
            state.isFocused ? "focusSelectRing" : ""
          } ${searchIcon && "ps-[12px]"} ${state.isDisabled && "!bg-Gray-50 disabled:!text-Gray-400"} ${isError && "!border-Error-300"}`,
      }}
      isMulti={isMulti}
      blurInputOnSelect={true}
      value={selectedValue}
      placeholder={placeHolder}
      isLoading={isLoading}
      isRtl={isRtl}
      isSearchable={isSearchable}
      hideSelectedOptions={false}
      name={name}
      options={options}
      onChange={changeHandle}
      captureMenuScroll={false} 
      closeMenuOnSelect={!isMulti}
      onInputChange={(value, actionMeta) => {
        if (onInputChange) {
          onInputChange(value, actionMeta);
        }
      }}
      components={{
        Control,
        IndicatorSeparator,
        DropdownIndicator,
        NoOptionsMessage,
        Option: OptionComponent,
        ClearIndicator,
        MultiValueRemove,
        ValueContainer,
      }}
      styles={styles}
    />
  );
}

export default SelectComp;
