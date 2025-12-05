import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-40 disabled:bg-Gray-300 disabled:!text-Gray-800 disabled:!border-Gray-400 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        secondary2:
          "bg-white rounded-lg border flex justify-center items-center border-Gray-300 shadow-shadow-xs text-sm font-semibold text-Gray-500 hover:bg-Gray-50 hover:text-Gray-700  transition-all duration-300 ease-in-out focus:shadow-ring-gray-shadow-xs focus:bg-white",
        orange:
          "bg-brand-600-orange-p-1 rounded-lg border flex justify-center items-center border-brand-600-orange-p-1 shadow-shadow-xs text-sm font-semibold text-white hover:bg-brand-600-orange-p-1/80   transition-all duration-300 ease-in-out focus:shadow-ring-gray-shadow-xs",
        dark: "bg-[#ffffff1f] text-white shadow-shadow-xs flex justify-center items-center border border-[#d0d5dd1f] hover:bg-[#ffffff1f]/10 transition-all duration-300 ease-in-out focus:border-brand-600-orange-p-1",
        dark2:
          "bg-Gray-900 text-white shadow-shadow-xs flex justify-center items-center border border-Gray-600 hover:bg-Gray-700 transition-all duration-300 ease-in-out focus:border-brand-600-orange-p-1",
        disabled:
          "bg-Gray-100 rounded-lg border flex justify-center items-center border-Gray-200 shadow-shadow-xs text-sm font-semibold text-Gray-400 ",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
