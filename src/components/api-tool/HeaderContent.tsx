'use client';

import { COMMON_HEADERS, HeaderType } from "@type/ui/api/api.type";
import { FiX } from "react-icons/fi";

export const HeadersContent = ({
  data,
  onChange,
}: {
  data: HeaderType[];
  onChange: (newData: HeaderType[]) => void;
}) => {
  // Shallow copy the array
  const displayData = [...data];

  // Dynamically append empty placeholder row if last row is populated
  if (!data.length || data[data.length - 1].key || data[data.length - 1].value) {
    displayData.push({ key: "", value: "", enabled: true });
  }

  // 🛡️ Safe Immutable Field Update
  const handleChange = (index: number, field: "key" | "value", value: string) => {
    const newData = displayData.map((row, i) => {
      if (i === index) {
        // Deep copy the row object before mutating its fields
        return { ...row, [field]: value };
      }
      return row;
    });

    const cleanedData = newData.filter(
      (row, i) => i < newData.length - 1 || row.key || row.value
    );
    onChange(cleanedData);
  };

  // 🛡️ Safe Immutable Toggle Update
  const handleToggle = (index: number, checked: boolean) => {
    const newData = displayData.map((row, i) => {
      if (i === index) {
        return { ...row, enabled: checked };
      }
      return row;
    });

    onChange(
      newData.filter((row, i) => i < newData.length - 1 || row.key || row.value)
    );
  };

  const handleRemove = (index: number) => {
    const newData = displayData.filter((_, i) => i !== index);
    onChange(
      newData.filter((row, i) => i < newData.length - 1 || row.key || row.value)
    );
  };

  return (
    <div className="w-full mx-auto p-4 bg-gray-900 rounded-md">
      <h2 className="text-white text-lg font-semibold mb-4">Headers</h2>
      <table className="w-full text-white border border-gray-600 table-auto">
        <thead>
          <tr className="border-b border-gray-600">
            <th className="px-3 py-2 border-r border-gray-600 text-left">Key</th>
            <th className="px-3 py-2 border-r border-gray-600 text-left">Value</th>
            <th className="px-3 py-2 border-r border-gray-600 text-center">Enabled</th>
            <th className="px-3 py-2 text-center">Remove</th>
          </tr>
        </thead>
        <tbody>
          {displayData.map((row, i) => (
            <tr
              key={i}
              className={`hover:bg-gray-700 transition-colors ${
                i < displayData.length - 1 ? "border-b border-gray-600" : ""
              }`}
            >
              <td className="px-2 py-1 border-r border-gray-600">
                <input
                  list={`common-headers-${i}`}
                  type="text"
                  className="w-full text-white bg-transparent px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={row.key ?? ""}
                  onChange={(e) => handleChange(i, "key", e.target.value)}
                  placeholder="Select or type custom header"
                />
                <datalist id={`common-headers-${i}`}>
                  {COMMON_HEADERS.map((key) => (
                    <option key={key} value={key} />
                  ))}
                </datalist>
              </td>

              <td className="px-2 py-1 border-r border-gray-600">
                <input
                  type="text"
                  className="w-full text-white bg-transparent px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={row.value ?? ""}
                  onChange={(e) => handleChange(i, "value", e.target.value)}
                  placeholder="Header value"
                />
              </td>

              <td className="px-2 py-1 text-center border-r border-gray-600">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={row.enabled}
                    onChange={(e) => handleToggle(i, e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-12 h-6 bg-black rounded-full border-2 transition-all duration-300 relative border-white ${
                      row.enabled ? "bg-green-200" : "bg-red-200"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 border border-white rounded-full shadow-md transition-all duration-300 ${
                        row.enabled
                          ? "translate-x-6 bg-green-400"
                          : "translate-x-0 bg-red-400"
                      }`}
                    />
                  </div>
                </label>
              </td>

              <td className="px-2 py-1 text-center">
                {i < displayData.length - 1 && (
                  <button
                    onClick={() => handleRemove(i)}
                    className="text-red-500 hover:text-red-400 font-bold transition-colors"
                    title="Remove row"
                  >
                    <FiX size={20} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
