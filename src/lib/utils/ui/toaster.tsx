import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";

export const toastOptions = {
  duration: 4000,

  style: {
    borderRadius: "6px",
    background: "#ffffff",
    color: "#1f2937",
    fontSize: "15px",
    fontWeight: 500,
    padding: "16px 18px",
    minWidth: "380px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.12)",
    border: "1px solid #e5e7eb",
  },

  success: {
    duration: 3500,

    icon: (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500">
        <CheckCircleIcon className="h-6 w-6 text-white" />
      </div>
    ),

    className: "toast-success",

    style: {
      borderBottom: "4px solid #22c55e",
    },
  },

  error: {
    duration: 5000,

    icon: (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500">
        <XCircleIcon className="h-6 w-6 text-white" />
      </div>
    ),

    className: "toast-error",

    style: {
      borderBottom: "4px solid #ef4444",
    },
  },

  warning: {
    duration: 4500,

    icon: (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400">
        <ExclamationTriangleIcon className="h-6 w-6 text-white" />
      </div>
    ),

    className: "toast-warning",

    style: {
      borderBottom: "4px solid #eab308",
    },
  },

  info: {
    duration: 4000,

    icon: (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500">
        <InformationCircleIcon className="h-6 w-6 text-white" />
      </div>
    ),

    className: "toast-info",

    style: {
      borderBottom: "4px solid #3b9ed0",
    },
  },
};
