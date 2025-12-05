import ImagePlus from "@/assets/images/image-plus.svg";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Variants = "small" | "large" | "extraSmall";
interface ImageUploadSectionProps {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  id?: string;
  variant?: Variants;
  hasError?:boolean
}
function ImageUploadSection({
  onChange,
  disabled = false,
  id = "dropzone-file",
  variant,
  hasError
}: ImageUploadSectionProps) {
  return (
    <div
      className={cn("flex items-center justify-center w-full h-full", {
        "overflow-hidden": variant === "small",
      })}
    >
      <label
        htmlFor={id}
        className={cn(
          "flex flex-col items-center justify-center w-full h-full border border-Gray-400 border-dashed rounded-lg cursor-pointer bg-white px-4 py-10",
          { "px-2 py-2": variant === "small" },
          { "w-10 h-10 px-2 py-2": variant === "extraSmall" },
          { "border-Error-500": hasError }
        )}
      >
        <div className="flex flex-col items-center justify-center gap-1">
          <Image
            src={ImagePlus}
            alt="image-upload-icon"
            className={cn({ "w-4": variant === "small" })}
            width={16}
            height={16}
          />
          {variant !== "extraSmall" && (
            <>
              <p
                className={cn(
                  "text-Brand-700 font-semibold text-sm text-center",
                  {
                    "text-[8px]": variant === "small",
                  }
                )}
              >
                Click here to upload
              </p>
              <p
                className={cn("text-sm font-medium text-Gray-700 text-center", {
                  "text-[6px]": variant === "small",
                })}
              >
                Accepted file format : <br /> PNG or JPG
              </p>
              <p
                className={cn(
                  "text-sm font-medium text-Error-600 text-center",
                  {
                    "text-[6px]": variant === "small",
                  }
                )}
              >
                [ Max 2 MB ]
              </p>
            </>
          )}
        </div>
        <input
          id={id}
          type="file"
          className="hidden cursor-pointer"
          accept="image/png, image/jpeg"
          multiple
          onChange={onChange}
          disabled={disabled}
        />
      </label>
    </div>
  );
}

export default ImageUploadSection;
