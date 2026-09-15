import * as monaco from "monaco-editor";
import MonacoEditor from "@monaco-editor/react";
import { useEffect } from "react";
import { TBody } from "@type/ui/api/api.type";
import { IApi } from "@/src/models/api.model";
import { ApiDocumentWithOptionalId } from "@/src/app/api-tools/page";

export default function MyEditor({
  data,
  updates,
}: {
  data: IApi;
  updates: (updates: Partial<ApiDocumentWithOptionalId>) => void;
}) {

  const updateContent = (content: string) => {
    updates({
      apiData: {
      ...data,
      body: {
        ...(data.body as TBody),
        content,
      },
    }});
  };

  const getEditorLanguage = () => {
    if (data?.body?.type === "graphql") return "graphql";

    if (data?.body?.type === "raw") {
      switch (data?.body?.rawType) {
        case "JSON":
          return "json";
        case "JavaScript":
          return "javascript";
        case "HTML":
          return "html";
        case "XML":
          return "xml";
        case "Text":
        default:
          return "plaintext";
      }
    }

    return "plaintext";
  };

  useEffect(() => {
    monaco.editor.defineTheme("custom-dark-inline", {
      base: "vs-dark",
      inherit: true,
      rules: [{ token: "", foreground: "FFFFFF", background: "000000" }],
      colors: {
        "editor.background": "#000000",
        "editor.foreground": "#FFFFFF",
        "editorCursor.foreground": "#FFFFFF",
        "editorLineNumber.foreground": "#888888",
        "editor.selectionBackground": "#555555", 
        "editor.inactiveSelectionBackground": "#333333"
      },
    });
  }, []);

  const wrapperStyle: React.CSSProperties = {
    border: "1px solid #555",
    overflow: "hidden",
    transition: "all 0.2s ease",
  };

  return (
   <div className="flex flex-col w-full h-full rounded-lg border border-gray-700 overflow-hidden">
  <MonacoEditor
    height="100%"
    language={getEditorLanguage()}
    value={data?.body?.content as string || ""}
    onChange={(val) => updateContent(val || "")}
    theme="custom-dark-inline"
    options={{
      minimap: { enabled: false },
      fontSize: 14,
      automaticLayout: true,
      wordWrap: "on",
      scrollbar: { vertical: "auto" },
      padding: { top: 12, bottom: 12 },
    }}
  />
</div>
  );
}