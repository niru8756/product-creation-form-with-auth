import Tooltip from "@/assets/icons/TooltipIcon";
import { cn } from "@/lib/helper";

function TooltipComp({
  tooltipText,
  className,
}: {
  tooltipText: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-80 text-center absolute top-full left-1/2 -translate-x-1/2 tooltipShow hidden z-10",
        className,
      )}
    >
      <div className="flex justify-center -m-[1.5px]">
        {/* <img src={Tooltip} className="text-center" alt="tooltip-icon" /> */}
        <Tooltip />
      </div>
      <div className="px-3 py-2 rounded-lg bg-Gray-900 text-white text-start tooltip inline-flex text-xs font-semibold">
        {tooltipText}
      </div>
    </div>
  );
}

export default TooltipComp;
