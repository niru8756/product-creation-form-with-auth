import { useEffect, useState } from "react";
import MultiSelectVariation from "./MultiSelectVariation";

import VariationInputComp from "./VariationInputComp";
import {
  ColorVariationType,
  ItemWeightVariationType,
  SizeValueType,
  VariationFormType,
} from "@/type/variation-type";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import VariationLabelComp from "../variation-component/VariationLabelComp";
import { FormatOptions } from "date-fns";

export const VariationRenderForm = ({
  value,
  title,
  OnChange,
  optionsRef,
  mainKey,
  OnSelect,
  noOption,
  modalOpen,
  setModalOpen,
  rootKey,
  isMulti,
  AddOption,
  count,
  defaultValue,
}: VariationFormType<
  SizeValueType | ColorVariationType | ItemWeightVariationType
>) => {
  const [optionEnable, setOptionEnable] = useState<boolean>(false);

  useEffect(() => {
    if (value.oneOf) {
      setOptionEnable(true);
    }
  }, [value]);

  // Track changes to value.enum and update optionsRef.current
  useEffect(() => {
    if (optionsRef && value.enum && optionsRef.current && title) {
      if (!optionsRef.current) {
        optionsRef.current = {};
      }

      // If options for this title do not exist, calculate and set them
      if (!optionsRef.current[title] && value.enum) {

        const options: {
          label: SizeValueType | ColorVariationType | ItemWeightVariationType;
          value: SizeValueType | ColorVariationType | ItemWeightVariationType;
        }[] = value.enum.map((enumValue: string | boolean, idx: number) => {
          return {
            label: value.enumNames?.[idx],
            value: enumValue,
          };
        });

        // Update optionsRef with the new options for the title
        optionsRef.current[title as string] = options;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.enum, title, optionsRef]);

  if (value.oneOf) {
    return (
      <div className="my-2" key={rootKey}>
        {/*  eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {value.oneOf.map((option: any, idx: number) => {
          if (option.type === "object") {
            return (
              <>
                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                  <DialogContent className="max-w-[538px] w-full">
                    <DialogHeader>
                      <DialogTitle>
                        <p className="text-Gray-900 text-lg font-semibold">
                          Add Custom option
                        </p>
                      </DialogTitle>
                      <DialogDescription>
                        <p className="text-Gray-600 font-normal text-sm">
                          You can add your custom option
                        </p>
                      </DialogDescription>
                    </DialogHeader>
                    <div
                      key={`${rootKey}-oneOf-${idx}`}
                      className="flex flex-col"
                    >
                      {
                        <VariationRenderForm
                          OnChange={OnChange}
                          value={option}
                          key={`${rootKey}-oneOf-${idx}`}
                          title={title}
                          optionsRef={optionsRef}
                          mainKey={mainKey}
                          count={count}
                        />
                      }
                    </div>
                    <DialogFooter className="justify-normal! w-full!">
                      <div className="grid grid-cols-2 gap-3 w-full!">
                        <button
                          onClick={() => {
                            if (typeof setModalOpen === "function") {
                              setModalOpen(false);
                            }
                          }}
                          className="px-4 py-2.5 rounded-lg bg-white text-Gray-500text-[16px] hover:text-Gray-800 border transition-all duration-300 ease-in-out border-Gray-300 hover:bg-transparent shadow-xs focus:text-Gray-800 focus:shadow-ring-gray-shadow-xs"
                        >
                          Cancel
                        </button>
                        <button
                          className="px-4 py-2.5 rounded-lg bg-brand-600-orange-p-1 text-white text-[16px] border border-Gray-300 hover:bg-Brand-700 shadow-xs transition-all duration-300 ease-in-out focus:shadow-ring-brand-shadow-xsdisabled:bg-Gray-100 disabled:text-Gray-400 disabled:border-Gray-200"
                          onClick={AddOption}
                        >
                          Submit
                        </button>
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            );
          }

          return (
            <div
              key={`${rootKey}-oneOf-${idx}`}
              // className="my-2 border border-gray-300 p-2"
            >
              {
                <VariationRenderForm
                  defaultValue={defaultValue && defaultValue}
                  value={option}
                  key={`${rootKey}-oneOf-${idx}`}
                  title={title}
                  optionsRef={optionsRef}
                  mainKey={mainKey}
                  noOption={optionEnable}
                  setModalOpen={setModalOpen}
                  isMulti={isMulti}
                  OnSelect={OnSelect}
                  count={count}
                  modalOpen={modalOpen}
                />
              }
            </div>
          );
        })}
      </div>
    );
  }

  if (value.type === "string" && value.enum) {
    if (optionsRef && title) {
      if (optionsRef.current === undefined) {
        optionsRef.current = {};
      }

      const options: {
        label: SizeValueType | ColorVariationType | ItemWeightVariationType;
        value: SizeValueType | ColorVariationType | ItemWeightVariationType;
      }[] = value.enum.map((enumValue: string | boolean, idx: number) => {
        return {
          label: value.enumNames?.[idx],
          value: enumValue,
        };
      });

      optionsRef.current[title as string] = options;
    }
    return (
      <div className="my-1" key={rootKey}>
        <VariationLabelComp
          htmlFor={rootKey as string}
          value={title}
          count={count}
          asterisk={true}
        />
        <MultiSelectVariation
          defaultValue={
            defaultValue ? (defaultValue as FormatOptions[]) : undefined
          }
          OnChange={OnChange}
          OnSelect={OnSelect}
          name={title}
          isMulti={isMulti}
          options={optionsRef?.current?.[title as string] || []}
          placeHolder="Select Option"
          noOption={noOption}
          setModalOpen={setModalOpen}
          modalOpen={modalOpen}
        />
      </div>
    );
  }

  if (value.type === "string" && !value.enum) {
    return (
      <div className="my-1" key={rootKey}>
        <VariationLabelComp value={title} htmlFor={rootKey as string} />
        <VariationInputComp
          type="text"
          id={rootKey}
          placeholder="Enter"
          OnChange={OnChange}
        />
      </div>
    );
  }

  if (value.type === "number") {
    return (
      <div className="my-1" key={rootKey}>
        <VariationLabelComp htmlFor={rootKey as string} value={title} />
        <VariationInputComp
          type="number"
          id={rootKey}
          placeholder="Enter"
          OnChange={OnChange}
        />
      </div>
    );
  }

  if (value.type === "object") {
    return (
      <div className="my-2 p-2 bg-white" key={rootKey}>
        <label>{title}</label>
        {Object.entries(value.properties).map(([nestedKey, nestedValue]) => {
          return (
            <VariationRenderForm
              defaultValue={defaultValue && defaultValue}
              OnChange={OnChange}
              value={nestedValue}
              key={nestedKey}
              rootKey={nestedKey}
              title={nestedKey}
              optionsRef={optionsRef}
              mainKey={mainKey}
              noOption={false}
              count={count}
              modalOpen={modalOpen}
              setModalOpen={setModalOpen}
            />
          );
        })}
      </div>
    );
  }

  if (value.type === "array") {

    return (
      <div className="my-2 p-2 border border-gray-300" key={rootKey}>
        <VariationLabelComp htmlFor={rootKey as string} value={title} asterisk={true} />
        {value.items && (
          <VariationRenderForm
            value={value.items}
            rootKey={rootKey}
            title={value.title}
            noOption={false}
          />
        )}
      </div>
    );
  }

  return null;
};
