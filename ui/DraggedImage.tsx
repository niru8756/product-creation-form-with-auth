import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import DotsGridIcon from "@/assets/icons/DotGridIcon";
import InputCheckbox from "./InputCheckbox";
import { useEffect, useRef } from "react";
import tippy from "tippy.js";
import Image from "next/image";

function DraggedImage({
  id,
  image,
  // fileType,
  backImageId,
  imageSelectHandle,
  checked,
}: {
  backImageId: number;
  id: number;
  image: string;
  fileType: "IMAGE" | "VIDEO";
  imageSelectHandle: (position: string) => void;
  checked: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };  

  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (tooltipRef.current) {
      tippy(tooltipRef.current, {
        theme: "unsktooltip",
        content: "Drag & Switch Positions",
        arrow: true,
        placement: "bottom",
      });
    }
  }, []);

  return (
    <div className="relative">
      <div
        className="w-full h-[158px] touch-none actionBtn"
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={style}
      >
        <div className="top-2 left-2 absolute z-10">
          <InputCheckbox
            onChange={imageSelectHandle}
            value={id.toString()}
            checked={checked}
          />
        </div>
        <Image
          src={image} // can be a static import or URL string
          alt="image"
          className="rounded-lg object-cover"
          fill // makes the image cover the parent container
          style={{ objectFit: "cover" }} // fallback for object-cover
        />
        <div
          ref={tooltipRef}
          className="shadow-xs absolute top-2 right-2 bg-white border border-Gray-300 rounded-lg p-2 h-9 actionMenu hidden inputSecondSymbol"
        >
          <DotsGridIcon />
        </div>
        <div className="flex justify-center">
          {id === backImageId && (
            <button className="absolute py-[3px] bottom-[13px] px-2 rounded-md text-xs font-medium w-fit border border-Brand-300 bg-Brand-50 shadow-shadow-xs text-Brand-700">
              Back View
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DraggedImage;
