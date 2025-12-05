import { cn } from "@/lib/helper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CategoryType ={
  name: string;
  id: string
}

type ProductType={
   name: string;
  id: string
}

interface SelectBoxProps {
  items: CategoryType[] | ProductType[];
  placeHolder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

const SelectBox = ({
  value,
  onValueChange,
  disabled,
  items,
  placeHolder = "Select a State",
}: SelectBoxProps) => {
  const error = "";
  return (
    <Select
      value={value ?? ""}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <div className="flex flex-col items-center gap-4">
        <SelectTrigger
          className={cn(
            "w-full h-11 select-focus-ring data-placeholder:text-Gray-400 text-base disabled:cursor-default disabled:opacity-100",
            error != "" && "border-Error-300",
          )}
        >
          <SelectValue placeholder={placeHolder} />
        </SelectTrigger>
      </div>
      <SelectContent>
        {Array.isArray(items) &&
          items.map((item) => (
            <SelectItem value={item.id} key={item.id}>
              {item.name}
            </SelectItem>
          ))}
      </SelectContent>
      {error && error != "" && (
        <div className="text-Error-500 text-sm mt-1">
          {error || "Invalid input"}
        </div>
      )}
    </Select>
  );
};

export default SelectBox;
