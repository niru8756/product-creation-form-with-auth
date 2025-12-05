import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { convertUskDataToAmzData } from "@/utils/convertUskDataToAmzData";
import { Minus, Plus } from "lucide-react";
import JsonSchemaLabelComp from "./JsonSchemaLabelComp";
import JsonSchemaInputComp from "./JsonSchemaInputComp";
import JsonSchemaSelectComp from "./JsonSchemaSelectComp";
import { convertDataToAmz } from "@/utils/dataConverter";
import {
  JsonFormsProps,
  PrimitiveValue,
  SchemaProperty,
  SchemaValue,
  UskData,
} from "@/type/json-form-type";
import JsonSchemaMultiSelect, { Option } from "./JsonSchemaMultiSelect";
import { Button } from "@/ui/Button";
import { successToast } from "@/ui/Toast";
import { Buffer } from "buffer";


const JsonForms: React.FC<JsonFormsProps> = ({
  data,
  schema,
  setData,
  onValidate,
  fieldErrors,
  loadFieldError,
  onRequiredValidate,
  enumSchemaKeyValuePair,
  setOpen,
  setIsSave
}) => {
  window.Buffer = Buffer;
  const [traverseSchemaValue, setTraverseSchemaValue] = useState<
    Record<string, PrimitiveValue>
  >({});
  const [initialTraverseSchemaState, setInitialTraverseSchemaState] = useState<
    Record<string, PrimitiveValue>
  >({});
  const [normalSchemaValue, setNormalSchemaValue] = useState<
    Record<string, Array<Record<string, PrimitiveValue>>>
  >({});
  const [multiSelectSchemaValue, setMultiSelectSchemaValue] = useState<
    Record<string, Option[]>
  >({});
  const [initialMultiValue, setinitialMultiValue] = useState<
    Record<string, Option[] | Option>
  >({});
  const [languaTagValue, setLanguaTagValue] = useState({});
  const [initialNormalSchemaState, setInitialNormalSchemaState] = useState<
    Record<string, Array<Record<string, PrimitiveValue>>>
  >({});
  const [arrayInputCounts, setArrayInputCounts] = useState<{
    [key: string]: number;
  }>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const optionsRef = useRef<
    | {
        [key: string]: {
          label: string | boolean | undefined;
          value: string | boolean;
        }[];
      }
    | undefined
  >(undefined);

  const collectHiddenInputValues = () => {
    const collectedValues: Record<string, string> = {};

    Object.entries(inputRefs.current).forEach(([key, ref]) => {
      if (ref) {
        collectedValues[key] = ref.value || "";
      }
    });

    setLanguaTagValue({ ...collectedValues });
  };

  useEffect(() => {
    collectHiddenInputValues();
  }, []);

  useEffect(() => {
    Object.entries(data).map(([key, value]) => {
      if (typeof value === "object") {
        setNormalSchemaValue((prevState: any) => {
          return { ...prevState, [key]: value };
        });
        setInitialNormalSchemaState((prevState: any) => {
          return { ...prevState, [key]: value };
        });
      } else {
        setTraverseSchemaValue((prevState: any) => {
          return { ...prevState, [key]: value };
        });
        setInitialTraverseSchemaState((prevState: any) => {
          return { ...prevState, [key]: value };
        });
      }
    });
  }, []);

  useEffect(() => {
    Object.entries(normalSchemaValue).map(([key, value]) => {
      setArrayInputCounts((prevState) => {
        return { ...prevState, [key]: value.length };
      });

      if (key in enumSchemaKeyValuePair) {
        let array: Option[] = [];
        initialNormalSchemaState[key].forEach((normalSchemaObj) => {
          let obj = {};
          Object.entries(normalSchemaObj).map(([propKey, propValue]) => {
            if (propKey !== "language_tag") {
              delete normalSchemaObj.language_tag;
              obj = {
                ...normalSchemaObj,
                label: enumSchemaKeyValuePair[key][propValue as string],
              };
            }
          });

          array.push(obj);
        });
        setinitialMultiValue((prevState) => ({
          ...prevState,
          [key]: array,
        }));
      }
    });
  }, [initialNormalSchemaState]);

  useEffect(() => {
    Object.entries(initialTraverseSchemaState).map(([key, value]) => {
      if (key in enumSchemaKeyValuePair) {
        setinitialMultiValue((prevState: Record<string, Option | Option[]>) => {
          return {
            ...prevState,
            [key]: {
              value: value,
              label: enumSchemaKeyValuePair[key][value as string],
            },
          };
        });
      }
    });
  }, [initialTraverseSchemaState]);

  const getValueTraverseSchema = useCallback(
    (_: string, key: string, value: PrimitiveValue) => {
      setTraverseSchemaValue((prevState) => ({
        ...prevState,
        [key]: value,
      }));
    },
    [traverseSchemaValue],
  );
  const getSingleSelectSchemaValue = useCallback(
    (_: string, key: string, value: PrimitiveValue) => {
      setTraverseSchemaValue((prevState) => ({
        ...prevState,
        [key]: value,
      }));
      const result = convertDataToAmz({ ...traverseSchemaValue, [key]: value });
      onRequiredValidate && onRequiredValidate(result);
    },
    [traverseSchemaValue],
  );

  const getValueNormalSchema = useCallback(
    (
      rootKey: string,
      childKey: string,
      value: PrimitiveValue,
      idx?: number,
    ) => {
      setNormalSchemaValue((prevState) => {
        const currentRootKeyArray = prevState[rootKey] || [];

        const updatedRootKeyArray = [...currentRootKeyArray];

        if (idx !== undefined) {
          updatedRootKeyArray[idx - 1] = {
            ...updatedRootKeyArray[idx - 1],
            [childKey]: value,
            language_tag: "en_IN",
          };
        } else {
          updatedRootKeyArray.push({
            [childKey]: value,
            language_tag: "en_IN",
          });
        }

        return {
          ...prevState,
          [rootKey]: updatedRootKeyArray,
        };
      });
    },
    [normalSchemaValue],
  );

  const getMultiSelectValue = useCallback(
    (key: string, optionValue: Option[] | Option) => {
      const valueArray: Option[] = [];

      if (Array.isArray(optionValue)) {
        if (optionValue.length > 0) {
          optionValue.forEach((schemaVal) => {
            Object.entries(schemaVal).map(([propKey, propValue]) => {
              if (propKey !== "label" && propKey !== "language_tag") {
                valueArray.push({
                  [propKey]: propValue,
                  language_tag: "en_IN",
                });
              }
            });
          });
          setMultiSelectSchemaValue((prevState) => ({
            ...prevState,
            [key]: valueArray,
          }));
        }
      } else {
        const value = optionValue.value;
        if (value !== undefined) {
          setTraverseSchemaValue((prevState) => ({
            ...prevState,
            [key]: value,
          }));
        }
      }
    },
    [multiSelectSchemaValue],
  );

  const getValidationTraverseSchema = () => {
    const validationData = {
      ...traverseSchemaValue,
      ...normalSchemaValue,
    } as UskData;
    const result = convertDataToAmz(validationData);
    onRequiredValidate && onRequiredValidate(result);
  };

  const getValidationNormalSchema = () => {
    const validationData = {
      ...traverseSchemaValue,
      ...normalSchemaValue,
    } as UskData;
    const result = convertDataToAmz(validationData);
    onRequiredValidate && onRequiredValidate(result);
  };

  const addInputHandle = (key: string, maxItem: number) => {
    setNormalSchemaValue((prevState) => {
      const currentRootArray = prevState[key];
      if (currentRootArray) {
        return {
          ...prevState,
          [key]: [...currentRootArray, {}],
        };
      }
      return prevState;
    });

    setArrayInputCounts((prevState) => {
      const currentCount = prevState[key] || 1;
      if (currentCount < maxItem) {
        return { ...prevState, [key]: currentCount + 1 };
      }
      return prevState;
    });
  };

  const removeInput = (key: string) => {
    setNormalSchemaValue((prevState) => {
      const currentRootArray = prevState[key] || [];
      if (currentRootArray.length > 0) {
        return {
          ...prevState,
          [key]: currentRootArray.slice(0, -1),
        };
      }
      return prevState;
    });

    setArrayInputCounts((prevState) => {
      const currentCount = prevState[key] || 1;
      if (currentCount > 1) {
        return { ...prevState, [key]: currentCount - 1 };
      }
      return prevState;
    });
  };

  const handleSubmit = () => {
    const combinedData: Record<string, SchemaValue> = {
      ...normalSchemaValue,
      ...multiSelectSchemaValue,
      ...traverseSchemaValue,
      ...languaTagValue,
    };
    onRequiredValidate && onRequiredValidate(combinedData);

    const result = convertUskDataToAmzData(combinedData, schema);
    onValidate && onValidate(result);
    setIsSave && setIsSave(true)
    setTimeout(() => {
      setData(result);
      successToast("Data saved");
    }, 800);
  };

  const handleCancle = () => {
    setData({});
    setTimeout(() => {
      setOpen && setOpen(false);
    }, 800);
  };

  if (schema.properties) {
    const groupedProperties = Object.entries(schema.properties).reduce<
      Record<string, Array<{ key: string; value: SchemaProperty }>>
    >((acc, [key, value]) => {
      const parentKey = value.parentKey || "default";
      if (!acc[parentKey]) acc[parentKey] = [];
      acc[parentKey].push({ key, value });
      return acc;
    }, {});

    return (
      <>
        <div className="grid md:grid-cols-3 grid-cols-1 gap-4 p-0.5">
          {Object.entries(groupedProperties).map(([parentKey, properties]) => (
            <Fragment key={parentKey}>
              {properties.map(({ key, value }) => {
                if (!value.parentKey) {
                  if (value.items?.properties) {
                    const currentCount = arrayInputCounts[key] || 1;
                    return Object.entries(value.items.properties).map(
                      ([propKey, propValue]) => {
                        if (
                          propKey !== "marketplace_id" &&
                          propKey !== "language_tag"
                        ) {
                          if (propValue.type === "string") {
                            if (propValue.enum) {
                              if (!optionsRef.current) {
                                optionsRef.current = {};
                              }

                              if (!optionsRef.current[key]) {
                                const options: {
                                  label: string | boolean | undefined;
                                  value: string | boolean;
                                }[] = propValue.enum.map((enumValue, idx) => ({
                                  label: propValue.enumNames?.[idx],
                                  value: enumValue,
                                }));
                                optionsRef.current[key] = options;
                              }

                              return (
                                <div
                                  key={propKey}
                                  className="flex flex-col w-full gap-1.5 h-full"
                                >
                                  <JsonSchemaLabelComp
                                    htmlFor={key}
                                    value={value.title}
                                    requiredError={loadFieldError[key]}
                                    description={value.description}
                                  />
                                  <JsonSchemaMultiSelect
                                    defaultValue={initialMultiValue[key]}
                                    error={fieldErrors[key]}
                                    OnChange={getMultiSelectValue}
                                    rootKey={key}
                                    options={optionsRef.current[key]}
                                    name={key}
                                    placeHolder="Select options"
                                    isMutiValue={true}
                                  />
                                </div>
                              );
                            }
                            return (
                              <div
                                key={propKey}
                                className="flex flex-col w-full justify-start h-full gap-1.5"
                              >
                                <div className="flex justify-between">
                                  <JsonSchemaLabelComp
                                    value={propValue.title}
                                    htmlFor={key}
                                    description={value.description}
                                    requiredError={loadFieldError[key]}
                                  />
                                  {value.maxUniqueItems &&
                                    value.maxUniqueItems > 1 && (
                                      <div className="flex items-center gap-4">
                                        <div onClick={() => removeInput(key)}>
                                          <Minus />
                                        </div>
                                        <div
                                          onClick={() =>
                                            addInputHandle(
                                              key,
                                              value.maxUniqueItems || 1,
                                            )
                                          }
                                        >
                                          <Plus />
                                        </div>
                                      </div>
                                    )}
                                </div>
                                {[...Array(currentCount)].map((_, idx) => {
                                  const currentInput =
                                    normalSchemaValue[key]?.[idx] || {};
                                  return (
                                    <JsonSchemaInputComp
                                      value={currentInput[propKey] || ""}
                                      OnBlur={getValidationNormalSchema}
                                      type="text"
                                      key={`${propKey}-${idx}`}
                                      placeholder={propValue.examples?.[0]}
                                      OnChange={getValueNormalSchema}
                                      rootKey={key}
                                      childKey={propKey}
                                      idx={idx + 1}
                                      id={key}
                                      error={fieldErrors[key]}
                                    />
                                  );
                                })}
                              </div>
                            );
                          }
                        }
                        return null;
                      },
                    );
                  }
                }

                if (value.type === "string") {
                  if (value.title) {
                    if (value.enum) {
                      if (!optionsRef.current) {
                        optionsRef.current = {};
                      }

                      if (!optionsRef.current[key]) {
                        const options: {
                          label: string | boolean | undefined;
                          value: string | boolean;
                        }[] = value.enum.map((enumValue, idx) => ({
                          label: value.enumNames?.[idx],
                          value: enumValue,
                        }));
                        optionsRef.current[key] = options;
                      }

                      return (
                        <div
                          key={key}
                          className="flex flex-col w-full h-full gap-1.5"
                        >
                          <JsonSchemaLabelComp
                            htmlFor={key}
                            description={value.description}
                            value={value.title}
                            requiredError={
                              value.parentKey && loadFieldError[value.parentKey]
                            }
                          />
                          <JsonSchemaMultiSelect
                            defaultValue={initialMultiValue[key]}
                            error={fieldErrors[key]}
                            OnChange={getMultiSelectValue}
                            rootKey={key}
                            options={optionsRef.current[key]}
                            name={key}
                            placeHolder="Select options"
                            isMutiValue={undefined}
                          />
                        </div>
                      );
                    }

                    return (
                      <div
                        key={key}
                        className="flex flex-col w-full gap-1.5 h-full"
                      >
                        <JsonSchemaLabelComp
                          htmlFor={key}
                          value={value.title}
                          description={value.description}
                          requiredError={
                            value.parentKey && loadFieldError[value.parentKey]
                          }
                        />

                        <JsonSchemaInputComp
                          value={traverseSchemaValue[key]}
                          OnBlur={getValidationTraverseSchema}
                          type="text"
                          placeholder={value.examples?.[0]}
                          id={key}
                          childKey={key}
                          OnChange={getValueTraverseSchema}
                          error={fieldErrors[key]}
                          parentKeyError={
                            value.parentKey && fieldErrors[value.parentKey]
                          }
                        />
                      </div>
                    );
                  } else {
                    return (
                      <input
                        readOnly
                        hidden
                        type="text"
                        value={
                          typeof value?.default === "boolean"
                            ? value.default.toString()
                            : value?.default
                        }
                        key={key}
                        id={key}
                        className="border border-black"
                        ref={(el) => {
                          inputRefs.current[key] = el;
                        }}
                      />
                    );
                  }
                } else if (
                  value.type === "number" ||
                  value.type === "integer"
                ) {
                  return (
                    <div key={key} className="flex flex-col w-full gap-1.5">
                      <JsonSchemaLabelComp
                        description={value.description}
                        htmlFor={key}
                        value={value.title}
                        requiredError={
                          value.parentKey && loadFieldError[value.parentKey]
                        }
                      />

                      <JsonSchemaInputComp
                        value={traverseSchemaValue[key]}
                        type="number"
                        OnBlur={getValidationTraverseSchema}
                        id={key}
                        placeholder={value.examples?.[0]}
                        childKey={key}
                        error={fieldErrors[key]}
                        parentKeyError={
                          value.parentKey && fieldErrors[value.parentKey]
                        }
                        OnChange={getValueTraverseSchema}
                      />
                    </div>
                  );
                } else if (value.type === "boolean") {
                  const enumOptions = value.enum
                    ? Object.fromEntries(
                        value.enum.map((enumValue, idx) => [
                          enumValue,
                          value.enumNames?.[idx] || enumValue,
                        ]),
                      )
                    : {};

                  return (
                    <div key={key}>
                      <JsonSchemaSelectComp
                        value={traverseSchemaValue[key]}
                        requiredError={
                          value.parentKey && loadFieldError[value.parentKey]
                        }
                        id={key}
                        options={enumOptions}
                        description={value.description}
                        title={value.title}
                        OnChange={getSingleSelectSchemaValue}
                        childKey={key}
                        error={fieldErrors[key]}
                        parentKeyError={
                          value.parentKey && fieldErrors[value.parentKey]
                        }
                      />
                    </div>
                  );
                }
                return null;
              })}
            </Fragment>
          ))}
        </div>
        <div className="flex gap-2 items-center sticky bottom-0 md:pt-8 pt-2 bg-Gray-25">
          <Button
            onClick={handleCancle}
            type="button"
            className="w-44 px-4 py-2.5 rounded-lg bg-white text-Gray-500 text-[16px] hover:text-Gray-800 border transition-all duration-300 ease-in-out border-Gray-300 hover:bg-transparent shadow-xs focus:text-Gray-800 focus:shadow-ring-gray-shadow-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="w-44 px-4 py-2.5 rounded-lg bg-brand-600-orange-p-1 text-white text-[16px] border border-Gray-300 hover:bg-Brand-700 shadow-xs transition-all duration-300 ease-in-out focus:shadow-ring-brand-shadow-xs"
          >
            Save
          </Button>
        </div>
      </>
    );
  }

  return null;
};

export default JsonForms;
