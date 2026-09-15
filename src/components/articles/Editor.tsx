'use client';

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import type { OutputData } from '@editorjs/editorjs';

export interface ArticleEditorRef {
  /**
   * Triggers Editor.js saver and returns the extracted blocks payload.
   */
  handleSave: () => Promise<OutputData>;
  /**
   * Resets or clears the editor canvas.
   */
  clear: () => Promise<void>;
  /**
   * Indicates if Editor.js is mounted and ready.
   */
  isReady: () => boolean;
}

export interface ArticleEditorProps {
  /**
   * Initial block data for editing mode (optional for new articles).
   */
  initialData?: OutputData | { blocks: any[] };
  /**
   * Placeholder string shown on the initial empty block.
   */
  placeholder?: string;
  /**
   * Callback fired on every user keystroke / block modification.
   */
  onChange?: (data: OutputData) => void;
  /**
   * Custom HTML ID for the mounting container.
   */
  holderId?: string;
  /**
   * Toggle read-only mode for previews.
   */
  readOnly?: boolean;
}

export const ArticleEditor = forwardRef<ArticleEditorRef, ArticleEditorProps>(
  (
    {
      initialData,
      placeholder = 'Start writing your technical article, protocol breakdown, or architecture guide...',
      onChange,
      holderId = 'article-editor-canvas',
      readOnly = false,
    },
    ref
  ) => {
    const editorInstanceRef = useRef<any>(null);
    const isReadyRef = useRef<boolean>(false);

    // Initialize Editor.js on client side
     useEffect(() => {
      let editor: any;

      const initEditor = async () => {
        // Dynamically import plugins to prevent Next.js SSR crashes
        const EditorJS = (await import('@editorjs/editorjs')).default;
        const Header = (await import('@editorjs/header')).default;
        const List = (await import('@editorjs/list')).default;
        const Code = (await import('@editorjs/code')).default;
        const Quote = (await import('@editorjs/quote')).default;
        const InlineCode = (await import('@editorjs/inline-code')).default;
        const Table = (await import('@editorjs/table')).default; // Import Table plugin

        if (!editorInstanceRef.current) {
          editor = new EditorJS({
            holder: holderId,
            placeholder,
            readOnly,
            data: initialData && 'blocks' in initialData ? (initialData as OutputData) : undefined,
            tools: {
              header: {
                class: Header as any, // 👈 Cast 'as any' to bypass TS constructor mismatch
                inlineToolbar: true,
                config: {
                  placeholder: 'Enter a section heading...',
                  levels: [1,2,3,4,5,6],
                  defaultLevel: 2,
                },
              },
              list: {
                class: List as any, 
                inlineToolbar: true,
              },
              code: {
                class: Code as any,
              },
              quote: {
                class: Quote as any, 
                inlineToolbar: true,
              },
              inlineCode: InlineCode as any, 
              table: {
                class: Table as any, 
                inlineToolbar: true,
                config: {
                  rows: 2,
                  cols: 2,
                },
              },
            },
            async onChange(api) {
              if (onChange) {
                const savedData = await api.saver.save();
                onChange(savedData);
              }
            },
            onReady() {
              isReadyRef.current = true;
            },
          });

          editorInstanceRef.current = editor;
        }
      };

      initEditor();

      return () => {
        if (
          editorInstanceRef.current &&
          typeof editorInstanceRef.current.destroy === 'function'
        ) {
          try {
            editorInstanceRef.current.destroy();
          } catch {
            // Safe cleanup
          }
          editorInstanceRef.current = null;
          isReadyRef.current = false;
        }
      };
    }, [holderId, placeholder, readOnly, initialData]);

    // Expose methods to parent components via ref
    useImperativeHandle(ref, () => ({
      async handleSave() {
        if (
          editorInstanceRef.current &&
          typeof editorInstanceRef.current.save === 'function'
        ) {
          return await editorInstanceRef.current.save();
        }
        return { blocks: [] };
      },
      async clear() {
        if (
          editorInstanceRef.current &&
          typeof editorInstanceRef.current.clear === 'function'
        ) {
          await editorInstanceRef.current.clear();
        }
      },
      isReady() {
        return isReadyRef.current;
      },
    }));

    return (
      <div className="w-full">
        {/* Visual Differentiation CSS Overrides */}
        <style jsx global>{`
          .codex-editor {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            text-align: left !important;
          }

          .ce-block {
            margin-bottom: 12px !important;
            transition: all 0.15s ease-in-out;
          }

          .ce-block__content,
          .ce-toolbar__content {
            max-width: 100% !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
          }

          /* Alternating Row Card Styling */
          .ce-block:nth-child(even) .ce-block__content {
            background-color: #f8fafc;
            border-radius: 10px;
            padding: 10px 14px;
            border: 1px solid #e2e8f0;
          }

          .ce-block:nth-child(odd) .ce-block__content {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 10px 14px;
            border: 1px solid #edf2f7;
          }

          /* Focused / Active Block Highlight */
          .ce-block--selected .ce-block__content,
          .ce-block:focus-within .ce-block__content {
            border-color: #dc2626 !important;
            box-shadow: 0 0 0 1px #dc262620, 0 4px 6px -1px rgba(0, 0, 0, 0.05) !important;
          }

          /* Headings */
          .ce-header {
            font-weight: 800 !important;
            color: #0f172a !important;
            border-left: 4px solid #dc2626 !important;
            padding-left: 12px !important;
            margin: 4px 0 !important;
          }

          /* Paragraphs */
          .ce-paragraph {
            font-size: 15px !important;
            line-height: 1.75 !important;
            color: #1e293b !important;
          }

          /* Code Block */
          .ce-block .ce-code {
            background-color: #090d16 !important;
            border: 1px solid #1e293b !important;
            border-radius: 12px !important;
            padding: 12px !important;
          }
          .ce-code__textarea {
            background: transparent !important;
            color: #38bdf8 !important;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
            font-size: 13px !important;
            line-height: 1.6 !important;
            padding: 0 !important;
            border: none !important;
          }

          /* Quote Block */
          .ce-block .ce-quote {
            background-color: #eff6ff !important;
            border-left: 4px solid #2563eb !important;
            border-radius: 0 10px 10px 0 !important;
            padding: 12px 16px !important;
            color: #1e3a8a !important;
            font-style: italic;
          }

          /* List Block */
          .ce-block .cdx-list {
            background-color: #f1f5f9 !important;
            border-left: 4px solid #475569 !important;
            border-radius: 0 10px 10px 0 !important;
            padding: 10px 16px !important;
          }

          /* 🚨 Table Block Editor Custom Styles */
          .ce-block .tc-wrap {
            margin: 12px 0 !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 8px !important;
            overflow: hidden !important;
            background-color: #ffffff !important;
          }

          .ce-block .tc-row {
            border-bottom: 1px solid #e2e8f0 !important;
            transition: background-color 0.15s ease-in-out;
          }

          .ce-block .tc-row:hover {
            background-color: #f8fafc !important;
          }

          .ce-block .tc-row:last-child {
            border-bottom: none !important;
          }

          .ce-block .tc-cell {
            border-right: 1px solid #e2e8f0 !important;
            padding: 10px 14px !important;
            font-size: 13px !important;
            font-weight: 500 !important;
            color: #1e293b !important;
            outline: none !important;
          }

          .ce-block .tc-cell:last-child {
            border-right: none !important;
          }

          /* Popover / Inputs High-Visibility Overrides */
          .ce-inline-toolbar,
          .ce-conversion-toolbar,
          .ce-settings,
          .ce-popover {
            color: #000000 !important;
            background-color: #ffffff !important;
            border: 1px solid #cbd5e1 !important;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1) !important;
            border-radius: 12px !important;
          }

          .ce-inline-tool-input,
          .ce-inline-toolbar__input,
          .ce-popover__search input {
            color: #000000 !important;
            background-color: #ffffff !important;
            border: 1px solid #94a3b8 !important;
            padding: 6px 10px !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            border-radius: 8px !important;
          }

          .ce-toolbar__plus,
          .ce-toolbar__settings-btn {
            color: #475569 !important;
            background-color: #f1f5f9 !important;
            border-radius: 8px !important;
            border: 1px solid #e2e8f0 !important;
          }
          .ce-toolbar__plus:hover,
          .ce-toolbar__settings-btn:hover {
            background-color: #fee2e2 !important;
            color: #dc2626 !important;
          }
        `}</style>

        {/* Editor.js Container */}
        <div id={holderId} className="min-h-[450px] text-black" />
      </div>
    );
  }
);

ArticleEditor.displayName = 'ArticleEditor';
export default ArticleEditor;
