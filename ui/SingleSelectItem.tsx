/* eslint-disable */
// @ts-nocheck
import { memo, useEffect, useRef, useState } from "react";
import ChevronDownIcon from "@/assets/icons/ChevronDownIcon";
import { cn } from "@/lib/utils";
import {
  FieldError,
  FieldErrorsImpl,
  Merge,
  UseFormRegister,
} from "react-hook-form";
import { CategoryType, ProductType } from "./ProductFormDescription";

type SingleSelectItemProps = {
  items: CategoryType[] | ProductType[];
  select?: boolean;
  categoryInput?: boolean;
  inputId: string;
  placeHolder?: string;
  getValue?: (val: string) => void;
  showMenuItem?: string;
  setShowMenuItem?: React.Dispatch<React.SetStateAction<string>>;
  register?: UseFormRegister<any>;
  error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined;
  value?: string;
  disabled?:boolean
};

function SingleSelectItem({
  items,
  select,
  inputId,
  placeHolder,
  getValue,
  showMenuItem,
  setShowMenuItem,
  disabled
}: SingleSelectItemProps) {
  const [menuItem, setMenuItem] = useState<boolean>(false);
  const selectRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (
        selectRef.current &&
        !selectRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setMenuItem(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const menuItemHandle = (key: string) => {
    if (setShowMenuItem) {
      items.map((item) => {
        if (key === item.id) {
          setShowMenuItem(item.name);
        }
      });
    }
    setMenuItem(false);

    if (getValue) {
      getValue(key);
    }
  };

  const showItemHandle = () => {
    setMenuItem((prev) => !prev);
  };

  return (
    <>
      <div
        ref={triggerRef}
        className={`flex ${select ? "w-full" : "w-14"} justify-between items-center ${disabled ?"bg-Gray-50":""}`}
        onClick={showItemHandle}
      >
        <input
          disabled={disabled}
          type="text"
          id={inputId}
          className={cn(
            "placeholder:bg-white input w-full border-none focus:outline-none text-Gray-900 disabled:bg-Gray-50 disabled:placeholder:bg-Gray-50 disabled:text-Gray-400 cursor-pointer",
          )}
          value={showMenuItem}
          placeholder={placeHolder}
          readOnly
        />
        <ChevronDownIcon color={disabled?"":"black"} />
      </div>

      {menuItem && (
        <ul
          ref={selectRef}
          className="z-20 absolute w-full mt-1 top-full py-1 px-1.5 flex flex-col gap-1 bg-white border border-Gray-200 rounded-lg shadow-[0_1px_1px_0_rgba(16,24,40,0.05)] left-0 max-h-[250px] overflow-y-auto scrollStyle"
        >
          {items.map((item, i) => (
            <li
              className={`py-2.5px px-2 options rounded-md hover:bg-Gray-50 cursor-pointer ${
                item.id === showMenuItem ? "bg-Gray-50" : ""
              }`}
              key={i}
              onClick={() => menuItemHandle(item.id)}
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default memo(SingleSelectItem);
