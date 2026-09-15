'use client';
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import React, { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Checkbox_Container_Record_Categories, Input_Container_Fields, Select_Container_Fields } from "@/src/lib/type/ui/inputFields/inputcomponent.types";
ChartJS.register(ArcElement, Tooltip, Legend);

export const MiniHeader = ({ name }: { name: string }) => {
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-8xl items-center justify-start px-6 py-5 sm:px-8 sm:py-6 lg:px-10">
        <h1 className="text-4xl font-semibold text-gray-800 sm:text-xl lg:text-3xl">
          {name.toUpperCase()}
        </h1>
      </div>
    </header>
  );
};


export const InputContainer = ({
  fields,
  onChange,
}: {
  fields: Input_Container_Fields;
  onChange: (value: string) => void;
}) => {
  const [isValid, setIsValid] = useState(true);

  const handleChange = (value: string) => {
    onChange(value);

    if (fields.regex) {
      const regex = new RegExp(fields.regex);
      setIsValid(regex.test(value));
    }
  };

  return (
    <div
      className={`flex flex-col gap-2 w-full p-3 rounded-md 
                  border ${isValid ? "border-gray-300" : "border-red-500"}`}
    >
      <label
        htmlFor={fields.name}
        className="text-sm font-medium text-gray-700"
      >
        {fields.name}
      </label>

      <input
        id={fields.name}
        type={fields.type}
        value={fields.value}
        placeholder={fields.placeholder}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full rounded-md border border-gray-200 px-3 py-2
                   text-sm text-gray-900 placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   focus:border-blue-500 transition"
      />

      {fields.caption && (
        <p className="text-xs text-gray-500">{fields.caption}</p>
      )}
    </div>
  );
};

export const SelectContainer = ({
  fields,
  onChange,
}: {
  fields: Select_Container_Fields;
  onChange: (value: string) => void;
}) => {

  return (
    <div
      className={`flex flex-col gap-2 w-full p-3 rounded-md 
                  border border-gray-300 `}
    >
      <label
        htmlFor={fields.name}
        className="text-sm font-medium text-gray-700"
      >
        {fields.name}
      </label>

      <select
        id={fields.name}
        name={fields.name}
        value={fields.defaultValue}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-200 bg-white px-3 py-2
                   text-sm text-gray-900
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   focus:border-blue-500 transition"
      >
        {fields.items.map((item, index) => (
          <option key={index} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
};



export const CheckboxContainer = ({
  fields,
  onChange,
}: {
  fields: Checkbox_Container_Record_Categories;
  onChange: (selected: string[]) => void;
}) => {

  const handleFilter = (items: string[], item: string) => {
    return items.filter((i) => i !== item)
  }

  const handleToggle = (item: string) => {
    let selectedItem = fields.selectedItems.includes(item);
    let newSelected: string[];
    if (selectedItem && item != "ALL" ) {
      newSelected = handleFilter(fields.selectedItems, item);
      newSelected = handleFilter(newSelected, "ALL");
    } else if(!selectedItem && item != "ALL"){
      newSelected = [...fields.selectedItems, item];
    }
    else{
      newSelected = fields.items
    }
    onChange(newSelected);
  };

  return (
    <div className="flex flex-col gap-2 w-full p-3 rounded-md border border-gray-300">
      <label className="text-sm font-medium text-gray-700">{fields.name}</label>

      <div className="flex flex-col gap-1 mt-1">
        {fields.items.map((item, index) => item == "PTR" ? null : (
          <label key={index} className="inline-flex items-center space-x-2">
            <input
              type="checkbox"
              checked={fields.selectedItems.includes(item)}
              onChange={() => handleToggle(item)}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-gray-900 text-sm">{item}</span>
          </label>
        ))}
      </div>

      {fields.caption && (
        <p className="text-xs text-gray-500 mt-1">{fields.caption}</p>
      )}
    </div>
  );
};

export const OperateButton = ({loading, handleClick, name, loadingName}: {loading: boolean, name: string, loadingName: string, handleClick: (event: React.MouseEvent<HTMLButtonElement>) => void}) => {
  return  <button
            className={`w-full flex items-center justify-center gap-2
                        ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-black'}
                           text-white py-3 rounded-lg transition text-sm font-semibold`}
                            onClick={handleClick}
                        disabled={loading}>
                        {loading ? (
                        <svg className="h-5 w-5 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 10-8 8z"
                                        ></path>
                                    </svg>                        
                                ) : (
                                    <MagnifyingGlassIcon className="h-5 w-5" />
                                )}
                                {loading ? loadingName  : name}
                    </button>
}


export const PingCircularPie = ({ received, lost }: {received: number, lost: number}) => {
  const total = received + lost;
  const successPercentage = total
    ? Math.round((received / total) * 100)
    : 0;

  const data = {
    labels: ["Received", "Lost"],
    datasets: [
      {
        data: [received, lost],
        backgroundColor: ["#22c55e", "#ef4444"],
        borderWidth: 0,
        cutout: "70%", 
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const value = ctx.raw;
            const percentage = total
              ? ((value / total) * 100).toFixed(1)
              : 0;
            return `${ctx.label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="relative w-48 h-48">
      <Doughnut data={data} options={options} />

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold text-gray-800">
          {successPercentage}%
        </span>
        <span className="text-xs text-gray-500">
          Success
        </span>
      </div>
    </div>
  );
};
