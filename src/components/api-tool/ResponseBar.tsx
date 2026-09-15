"use client";

import { useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

export interface IExecuteResponse {
  success: boolean;
  status_code: number;
  statusText: string;
  time: number;
  size: number;
  reqheaders: Record<string, any>;
  resheaders: Record<string, any>;
  data: any;
  error: any;
}

type ResponseTab = "Body" | "Headers" | "Cookies";
type BodyFormat =
  | "Pretty"
  | "Raw"
  | "Base64"
  | "Hex"
  | "HTML"
  | "JavaScript"
  | "JSON";

interface ResponsePanelProps {
  data?: IExecuteResponse | null; 
  height?: number | string;
  buttonDropDown: (height: number) => void
}

export const ResponsePanel: React.FC<ResponsePanelProps> = ({
  data = null,
  height = "100%",
  buttonDropDown
}) => {
  const [activeTab, setActiveTab] = useState<ResponseTab>("Body");
  const [bodyFormat, setBodyFormat] = useState<BodyFormat>("Pretty");
  const [collapsed, setCollapsed] = useState(false);

  const hasResponse = data !== null;

  const formatBody = () => {
    if (!hasResponse) return "";

    let content = data!.data ?? data!.error ?? "";

    switch (bodyFormat) {
      case "Raw":
        return typeof content === "string" ? content : JSON.stringify(content);
      case "Pretty":
        try {
          return typeof content === "object"
            ? JSON.stringify(content, null, 2)
            : content;
        } catch {
          return String(content);
        }
      case "Base64":
        try {
          return btoa(
            typeof content === "string" ? content : JSON.stringify(content)
          );
        } catch {
          return String(content);
        }
      case "Hex":
        try {
          const str = typeof content === "string" ? content : JSON.stringify(content);
          return Array.from(str)
            .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
            .join(" ");
        } catch {
          return String(content);
        }
      case "HTML":
      case "JavaScript":
      case "JSON":
        return typeof content === "string" ? content : JSON.stringify(content, null, 2);
      default:
        return String(content);
    }
  };

  const getEditorLanguage = () => {
    switch (bodyFormat) {
      case "HTML":
        return "html";
      case "JavaScript":
        return "javascript";
      case "JSON":
        return "json";
      default:
        return "plaintext";
    }
  };
  return (
  <div
      className="relative flex flex-col text-sm bg-neutral-800 border border-neutral-700 rounded-lg overflow-hidden"
      style={{ height }}
    >
    <button
      onClick={() => {
        buttonDropDown(collapsed ? 400 : 45);
        setCollapsed(!collapsed);
      }}
      className="absolute top-2 right-2 p-1 rounded bg-neutral-700 hover:bg-neutral-600 text-white z-20"
    >
      {collapsed ? <FiChevronDown size={17}/> : <FiChevronUp size={17}/>}
    </button>

      {data ? (
        <>
         
          <div className="flex items-center gap-6 px-4 py-2 border-b border-neutral-700 bg-neutral-900">
            <span className={`font-semibold ${data!.success ? "text-green-400" : "text-red-400"}`}>
              {data!.status_code} {data!.statusText}
            </span>
            <span className="text-neutral-400">Time: {data!.time} ms</span>
            <span className="text-neutral-400">Size: {data!.size} B</span>
          </div>

        
          <div className="flex border-b border-neutral-700 bg-neutral-900">
            {["Body", "Headers", "Cookies"].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 font-medium text-sm transition ${
                  activeTab === tab
                    ? "text-orange-500 border-b-2 border-orange-500 font-bold"
                    : "text-neutral-400 hover:text-orange-400"
                }`}
                onClick={() => setActiveTab(tab as ResponseTab)}
              >
                {tab}
              </button>
            ))}
          </div>

        
          {activeTab === "Body" && (
            <div className="px-4 py-2 border-b border-neutral-700 bg-neutral-900 flex items-center gap-2 text-xs">
              <span className="text-neutral-400">Format:</span>
              <select
                value={bodyFormat}
                onChange={(e) => setBodyFormat(e.target.value as BodyFormat)}
                className="bg-neutral-700 text-white px-2 py-1 rounded focus:outline-none"
              >
                <option value="Pretty">Pretty</option>
                <option value="Raw">Raw</option>
                <option value="Base64">Base64</option>
                <option value="Hex">Hex</option>
                <option value="HTML">HTML</option>
                <option value="JavaScript">JavaScript</option>
                <option value="JSON">JSON</option>
              </select>
            </div>
          )}

        
          <div className="flex-1 overflow-auto p-4 font-mono text-xs">
            {activeTab === "Body" && (
              <MonacoEditor
                height="100%"
                language={getEditorLanguage()}
                value={formatBody()}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  wordWrap: "on",
                  scrollBeyondLastLine: false,
                  fontSize: 13,
                  lineNumbers: "on",
                  wrappingIndent: "indent",
                }}
              />
            )}

            {activeTab === "Headers" && (
              <div className="overflow-auto w-full">
                <table className="w-full text-white text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-700">
                      <th className="px-2 py-1">Header</th>
                      <th className="px-2 py-1">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data!.resheaders || {}).map(([key, value]) => (
                      <tr key={key} className="border-b border-neutral-700 hover:bg-neutral-700">
                        <td className="px-2 py-1">{key}</td>
                        <td className="px-2 py-1">{String(value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "Cookies" && (
              <div className="overflow-auto w-full">
                <table className="w-full text-white text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-700">
                      <th className="px-2 py-1">Cookie</th>
                      <th className="px-2 py-1">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data!.reqheaders?.Cookie || {}).map(([key, value]) => (
                      <tr key={key} className="border-b border-neutral-700 hover:bg-neutral-700">
                        <td className="px-2 py-1">{key}</td>
                        <td className="px-2 py-1">{String(value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
       
        <div className="flex-1 flex flex-col justify-center items-center text-neutral-400 p-4">
          <img
            src="request.webp" 
            alt="No response yet"
            className="w-24 h-24 mb-4 opacity-50"
          />
          <div className="text-sm">Click "Send" to get a response</div>
        </div>
      )}
    </div>
  );
};