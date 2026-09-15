import { FiX } from "react-icons/fi";

import MyEditor from "./EditorTool";

import { IApi } from "@/src/models/api.model";
import { ApiDocumentWithOptionalId } from "@/src/app/api-tools/page";
import { METHODS_WITHOUT_BODY} from "@utils/ui/api/ApiTools.constants";
import { BODY_TYPES, Raw_Body, RawBodyType, TBody} from "@type/ui/api/api.type"
import { Row, FormDataRow} from "@interfaces/api-tool/apiTool.interface"

interface UrlEncodedTableProps {
  data: Row[];
  url: string;
  onChangeQuery: (newData: Row[]) => void;
  onChangeUrl: (url: string) => void;
}

export const UrlEncodedTable: React.FC<UrlEncodedTableProps> = ({ data, onChangeQuery, url, onChangeUrl }) => {
  const displayData = [...data];

  if (data.length === 0 || data[data.length - 1].key || data[data.length - 1].value) {
    displayData.push({ key: "", value: "", enabled: true });
  }

  const handleChange = (index: number, field: "key" | "value", value: string) => {
    // query data 
    const newData = displayData.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
    const cleanedData = newData.filter((row, i) => i < newData.length - 1 || row.key || row.value);
    onChangeQuery(cleanedData);
    // url 
    const params = new URLSearchParams();
    cleanedData.forEach(({ key, value }) => {
      if (key) params.append(key, value);
    });
    const newUrl = `${url.split('?')[0]}?${params.toString()}`;
    onChangeUrl(newUrl)
  };

  const handleToggle = (index: number, checked: boolean) => {
    const newData = displayData.map((item, i) =>
        i === index ? { ...item, enabled: checked } : item
    );
    onChangeQuery(newData.filter((row, i) => i < newData.length - 1 || row.key || row.value));
  };

  const handleRemove = (index: number) => {
    const newData = displayData.filter((_, i) => i !== index);
    onChangeQuery(newData.filter((row, i) => i < newData.length - 1 || row.key || row.value));
  };

  return (
    <table className="text-white border-collapse table-auto mx-1 mt-2">
      <thead>
        <tr className="border-b border-gray-600">
          <th className="px-2 py-2 border border-gray-600 text-left">Key</th>
          <th className="px-2 py-2 border border-gray-600 text-left">Value</th>
          <th className="px-2 py-2 border border-gray-600 text-center">Enabled</th>
          <th className="px-2 py-2 border border-gray-600 text-center">Remove</th>
        </tr>
      </thead>
      <tbody>
        {displayData.map((row, i) => (
          <tr
            key={i}
            className={`border border-gray-700 hover:bg-gray-800 transition-colors`}
          >
            <td className="border-r border-gray-700">
              <input
                type="text"
                className="bg-black text-white px-2 py-1 rounded w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={row.key ?? ""}
                onChange={(e) => handleChange(i, "key", e.target.value)}
              />
            </td>
            <td className="border-r border-gray-700">
              <input
                type="text"
                className="bg-black text-white px-2 py-1 rounded w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={row.value ?? ""}
                onChange={(e) => handleChange(i, "value", e.target.value)}
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
                    className={`w-12 h-6 bg-black rounded-full border-2 transition-all duration-300 relative border-white ${row.enabled ? 'bg-green-200' : 'bg-red-200'}`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 border border-white rounded-full shadow-md transition-all duration-300 ${
                        row.enabled ? "translate-x-6 bg-green-400" : "translate-x-0 bg-red-400"
                      }`}
                    />
                  </div>
                </label>
              </td>
            <td className="px-2 py-1 text-center">
              {i < displayData.length - 1 && ( 
                <button
                  onClick={() => handleRemove(i)}
                  className="text-gray-300 hover:text-red-400 font-bold transition-colors"
                  title="Remove row"
                >
                 <FiX size={18} />
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const BodyUrlEncodedTable: React.FC<{
  data: Row[];
  onChange: (newData: Row[]) => void;
}> = ({ data, onChange }) => {
  const displayData = [...data];

  if (data.length === 0 || data[data.length - 1].key || data[data.length - 1].value) {
    displayData.push({ key: "", value: "", enabled: true });
  }

  const handleChange = (index: number, field: "key" | "value", value: string) => {
    // query data 
    const newData = displayData.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
    const cleanedData = newData.filter((row, i) => i < newData.length - 1 || row.key || row.value);
    onChange(cleanedData);
  };

  const handleToggle = (index: number, checked: boolean) => {
    const newData = displayData.map((item, i) =>
        i === index ? { ...item, enabled: checked } : item
    );
    onChange(newData.filter((row, i) => i < newData.length - 1 || row.key || row.value));
  };

  const handleRemove = (index: number) => {
    const newData = displayData.filter((_, i) => i !== index);
    onChange(newData.filter((row, i) => i < newData.length - 1 || row.key || row.value));
  };

  return (
    <table className="text-white border-collapse table-auto mx-1 mt-2">
      <thead>
        <tr className="border-b border-gray-600">
          <th className="px-2 py-2 border border-gray-600 text-left">Key</th>
          <th className="px-2 py-2 border border-gray-600 text-left">Value</th>
          <th className="px-2 py-2 border border-gray-600 text-center">Enabled</th>
          <th className="px-2 py-2 border border-gray-600 text-center">Remove</th>
        </tr>
      </thead>
      <tbody>
        {displayData.map((row, i) => (
          <tr
            key={i}
            className={`border border-gray-700 hover:bg-gray-800 transition-colors`}
          >
            <td className="border-r border-gray-700">
              <input
                type="text"
                className="bg-black text-white px-2 py-1 rounded w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={row.key ?? ""}
                onChange={(e) => handleChange(i, "key", e.target.value)}
              />
            </td>
            <td className="border-r border-gray-700">
              <input
                type="text"
                className="bg-black text-white px-2 py-1 rounded w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={row.value ?? ""}
                onChange={(e) => handleChange(i, "value", e.target.value)}
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
                    className={`w-12 h-6 bg-black rounded-full border-2 transition-all duration-300 relative border-white ${row.enabled ? 'bg-green-200' : 'bg-red-200'}`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 border border-white rounded-full shadow-md transition-all duration-300 ${
                        row.enabled ? "translate-x-6 bg-green-400" : "translate-x-0 bg-red-400"
                      }`}
                    />
                  </div>
                </label>
              </td>
            <td className="px-2 py-1 text-center">
              {i < displayData.length - 1 && ( 
                <button
                  onClick={() => handleRemove(i)}
                  className="text-gray-300 hover:text-red-400 font-bold transition-colors"
                  title="Remove row"
                >
                 <FiX size={18} />
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};


interface FormDataTableProps {
  data: FormDataRow[];
  onChange: (newData: FormDataRow[]) => void;
}

// form-data
export const FormDataTable: React.FC<FormDataTableProps> = ({ data, onChange }) => {
  const displayData = [...data];

  if (
    data.length === 0 ||
    data[data.length - 1].key ||
    data[data.length - 1].value
  ) {
    displayData.push({
      key: "",
      value: "",
      type: "text",
      description: "",
      enabled: true,
    });
  }

  const handleChange = (
    index: number,
    field: keyof FormDataRow,
    value: any
  ) => {
    const newData = [...displayData];
    newData[index] = { ...newData[index], [field]: value };

    const cleanedData = newData.filter(
      (row, i) =>
        i < newData.length - 1 || row.key || row.value
    );
    onChange(cleanedData);
  };

  const handleRemoveRow = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    onChange(newData);
  };

  return (
    <div className="flex flex-col gap-4 mt-5">
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full text-white border-collapse">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-4 py-3 border border-gray-700 text-left">Key</th>
              <th className="px-4 py-3 border border-gray-700 text-left">Value</th>
              <th className="px-4 py-3 border border-gray-700 text-left">Type</th>
              <th className="px-4 py-3 border border-gray-700 text-left">Description</th>
              <th className="px-4 py-3 border border-gray-700 text-center">Enabled</th>
              <th className="px-4 py-3 border border-gray-700 text-center w-16"></th>
            </tr>
          </thead>

          <tbody>
            {displayData.map((row, i) => {
              const isLastEmptyRow = i === displayData.length - 1;

              return (
                <tr
                  key={i}
                  className="hover:bg-gray-900 transition-colors"
                >
                  <td className="border border-gray-700 px-1">
                    <input
                      type="text"
                      value={row.key}
                      onChange={(e) =>
                        handleChange(i, "key", e.target.value)
                      }
                      className="bg-black text-white px-3 py-2 rounded w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>

                  <td className="border border-gray-700 px-1">
                    <input
                      type={row.type === "file" ? "file" : "text"}
                      value={row.type === "text" ? row.value : ''}
                      onChange={(e) =>
                        handleChange(
                          i,
                          "value",
                          row.type === "file"
                            ? e.target.files?.[0]
                            : e.target.value
                        )
                      }
                      className="bg-black text-white px-3 py-2 rounded w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>

                  <td className="border border-gray-700 px-1">
                    <select
                      value={row.type}
                      onChange={(e) =>
                        handleChange(
                          i,
                          "type",
                          e.target.value as "text" | "file"
                        )
                      }
                      className="bg-black text-white px-3 py-2 rounded w-full focus:outline-none"
                    >
                      <option value="text">text</option>
                      <option value="file">file</option>
                    </select>
                  </td>

                  <td className="border border-gray-700 px-1">
                    <input
                      type="text"
                      value={row.description || ""}
                      onChange={(e) =>
                        handleChange(i, "description", e.target.value)
                      }
                      className="bg-black text-white px-3 py-2 rounded w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>

                  <td className="px-2 py-1 text-center border-r border-gray-600">
                        <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={row.enabled}
                            onChange={(e) => handleChange(i, "enabled", e.target.checked)}
                            className="sr-only"
                        />
                        <div
                            className={`w-12 h-6 bg-black rounded-full border-2 transition-all duration-300 relative border-white ${row.enabled ? 'bg-green-200' : 'bg-red-200'}`}
                        >
                            <div
                            className={`absolute top-0.5 left-0.5 w-5 h-5 border border-white rounded-full shadow-md transition-all duration-300 ${
                                row.enabled ? "translate-x-6 bg-green-400" : "translate-x-0 bg-red-400"
                            }`}
                            />
                        </div>
                        </label>
                    </td>

                  <td className="border border-gray-700 px-3 py-2 text-center">
                    {!isLastEmptyRow && (
                      <button
                        onClick={() => handleRemoveRow(i)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <FiX size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const BodyContent = ({
  data,
  updates,
}: {
  data: IApi,
  updates: (updates: Partial<ApiDocumentWithOptionalId>) => void;
}) => {
  const setBodyType = (type: TBody["type"] | "none") => {
    if (METHODS_WITHOUT_BODY.includes(data.method)) {
      updates({apiData: { ...data, body: { type: "none", content: null }}});
      return;
    }

    updates({apiData: {
      ...data,
      body: {
        type,
        rawType: type === "raw" ? data.body?.rawType || "Text" : undefined,
        content: data.body?.content || null,
      },
    }});
  };

  const setRawType = (rawType: RawBodyType) => {
    updates({
      apiData: {
        ...data,
        body: {
          ...(data.body as TBody),
          rawType,
        },
      },
    });
  };

  return (
   <div className="flex flex-col gap-4 text-white flex-1 min-h-0 overflow-hidden">
      <div className="flex gap-4 items-center flex-wrap">
        {BODY_TYPES.map((type) => (
          <label
            key={type}
            className={`flex items-center gap-2 px-3 py-1 rounded cursor-pointer text-sm
              ${METHODS_WITHOUT_BODY.includes(data.method) ? "opacity-50 cursor-not-allowed" : "hover:bg-neutral-700"}
            `}
          >
            <input
              type="radio"
              name="bodyType"
              value={type}
              checked={data.body?.type === type}
              disabled={METHODS_WITHOUT_BODY.includes(data.method)}
              onChange={() => setBodyType(type)}
              className="accent-blue-500"
            />
            {type}
          </label>
        ))}

        {data.body?.type === "raw" && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-400">Raw Type:</span>
            <select
              value={data.body?.rawType || "Text"}
              onChange={(e) => setRawType(e.target.value as RawBodyType)}
              className="bg-neutral-800 border border-neutral-600 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Raw_Body.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {data.body?.type === "none" && (
        <div className="text-neutral-400 text-sm text-center mt-60">
          This request does not have a body.
        </div>
      )}

      {["raw", "graphql"].includes(data.body?.type || "") && (
        <MyEditor data={data} updates={updates} />
      )}

      {data?.body?.type === "x-www-form-urlencoded" ? (
        <BodyUrlEncodedTable
          data={data?.body.urlEncoded || []}
          onChange={(newData) =>
            updates({apiData: { ...data, body: { ...(data.body as TBody), urlEncoded: newData }}})
          }
        />
      ) : data?.body?.type === "form-data" ? (
        <FormDataTable
          data={data?.body.formData || []}
          onChange={(newData) =>
            updates({apiData: { ...data, body: { ...(data.body as TBody), formData: newData }}})
          }
        />
      ) : null}
    </div>
  );
};
