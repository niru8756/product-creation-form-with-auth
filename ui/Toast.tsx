/* eslint-disable react-refresh/only-export-components */

import { CircleAlertIcon, CircleCheckBigIcon, CrossIcon } from "lucide-react";
import { FC } from "react";
import { toast, ToastOptions } from "react-toastify";

// const MAX_TOASTS = 3;
// Track active toast IDs
const activeToastIds: string[] = [];

const showToast = (
  component: React.ReactNode,
  options: ToastOptions & { type?: "success" | "error" },
): void => {
  // Remove oldest toast if limit reached
  // if (activeToastIds.length >= MAX_TOASTS) {
  //   const oldestToastId = activeToastIds.shift();
  //   if (oldestToastId) toast.dismiss(oldestToastId);
  // }

  // Show the toast with appropriate styling based on type
  const toastId = toast(component, {
    ...options,
    className: `${options.type || ""}-toast`, // Add class for custom styling
  });

  activeToastIds.push(toastId as string);
};

const AlertIcon = () => {
  return (
    <div className="relative w-9 h-9 flex items-center justify-center">
      <div className="absolute w-9 h-9 rounded-full border-2 border-brand-600-orange-p-1/30 bg-War1ning-100/40 "></div>
      <div className="absolute w-8 h-8 rounded-full border-2 border-Gray-100 bg-War1ning-100/40 "></div>
      <div className="absolute w-7 h-7 rounded-full border-2 border-brand-600-orange-p-1/30 bg-Warni1ng-100/50 "></div>

      {/* Icon */}
      <div className="absolute w-5 h-5 bg-Warning-100 rounded-full flex items-center justify-center text-white">
        {/* <span className="text-sm font-bold">!</span> */}
        <CircleAlertIcon
          className="w-6 h-6 text-brand-600-orange-p-1"
          strokeWidth={1.5}
        />
      </div>
    </div>
  );
};

interface ToastMsgProps {
  message: string;
  message2?: string;
  closeToast?: () => void; // Function to close the toast
  toastProps?: ToastMsgProps;
  onRetry?: () => void; // function to retry or perform some action
}

type ToastErrorType = {
  title: string;
  subtitle?: string;
  retry?: () => void; // this function will be executed if provided when the user clicks on error message
};

const ErrorMsg: FC<ToastMsgProps> = ({
  message = "Something went wrong",
  message2 = "",
  closeToast,
  onRetry,
}) => (
  <div
    className="flex bg-white shadow-lg rounded-lg p-4 pl-6 min-w-[280px] max-w-[500px] font-[poppins]"
    // onClick={(e)=>e.stopPropagation()}
  >
    <AlertIcon />
    <div className="ml-6 grow overflow-hidden flex flex-col justify-center items-start">
      <p className="font-semibold text-gray-800 line-clamp-2">{message}</p>
      {message2 != "" ? (
        <button
          onClick={onRetry}
          className="text-Brand-700 font-semibold hover:underline mt-1 "
        >
          {message2}
        </button>
      ) : null}
    </div>
    <button
      onClick={closeToast}
      className="ml-4 text-gray-400 hover:text-gray-600"
    >
      <CrossIcon className="text-Gray-400 600 w-6 h-6 cursor-pointer" />
    </button>
  </div>
);

const SuccessMsg: FC<ToastMsgProps> = ({
  message = "",
  message2 = "",
  closeToast,
}) => (
  <div
    className="flex bg-white shadow-lg rounded-lg p-4 min-w-[340px] max-w-[500px] font-[poppins]"
    // onClick={(e)=>e.stopPropagation()}
  >
    <CircleCheckBigIcon className="text-Success-500 w-9 h-9" />
    <div className="ml-4 grow overflow-hidden flex flex-col justify-center items-start">
      <p className=" text-Gray-900 font-semibold text-sm line-clamp-2">
        {message}
      </p>
      {message2 != "" ? (
        <p className="text-Gray-600 text-sm mt-1">{message2}</p>
      ) : null}
    </div>
    <button
      onClick={closeToast}
      className="ml-4 text-gray-400 hover:text-gray-600 flex items-start "
    >
      <CrossIcon className="text-Gray-400 600 w-5 h-5 cursor-pointer" />
    </button>
  </div>
);

export const errorToast = (message: string, message2?: string): void => {
  showToast(<ErrorMsg message={message} message2={message2} />, {
    toastId: message,
    // className: "bg-transparent",
  });
};

// this toast uses different arguments
export const toastError = ({
  title,
  subtitle,
  retry,
}: ToastErrorType): void => {
  showToast(<ErrorMsg message={title} message2={subtitle} onRetry={retry} />, {
    toastId: title,
    // className: "bg-transparent",
  });
};

export const successToast = (message: string, message2?: string): void => {
  showToast(<SuccessMsg message={message} message2={message2} />, {
    toastId: message,
    // className: "bg-transparent",
  });
};
