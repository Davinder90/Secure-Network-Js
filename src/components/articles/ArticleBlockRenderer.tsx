// Inside src/components/articles/ArticleBlockRenderer.tsx

import React from 'react';
import { JS_SERVER_PATHS } from '@/src/lib/utils/constants';

interface Block {
  type: string;
  data: {
    text?: string;
    level?: number;
    caption?: string;
    file?: { url: string };
    items?: string[];
    style?: string;
    code?: string;
    service?: string;
    embed?: string;
    content?: string[][]; // 👈 Added for Table blocks (grid array of cells)
    withHeadings?: boolean; // Indicates if first row is a header
  };
}

const resolveBlockImageUrl = (rawUrl?: string): string => {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return '';
  }
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('data:')) {
    return rawUrl;
  }
  const getEndpoint = JS_SERVER_PATHS.GET_IMAGE || '/api/image/get';
  return `${getEndpoint}?filename=${encodeURIComponent(rawUrl.trim())}`;
};

export default function ArticleBlockRenderer({ blocks }: { blocks: Block[] }) {
  if (!blocks || !Array.isArray(blocks)) return null;

  return (
    <div className="space-y-6 text-black leading-relaxed font-normal">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'header': {
            const Level = `h${block.data.level || 2}` as keyof JSX.IntrinsicElements;
            const headingClasses =
              block.data.level === 2
                ? 'text-2xl sm:text-3xl font-black mt-8 mb-3 text-black tracking-tight'
                : 'text-xl sm:text-2xl font-bold mt-6 mb-2 text-black tracking-tight';
            return (
              <Level
                key={index}
                className={headingClasses}
                dangerouslySetInnerHTML={{ __html: block.data.text || '' }}
              />
            );
          }

          case 'paragraph':
            return (
              <p
                key={index}
                className="text-base sm:text-lg text-gray-800 leading-8"
                dangerouslySetInnerHTML={{ __html: block.data.text || '' }}
              />
            );

          case 'image': {
            const resolvedUrl = resolveBlockImageUrl(block.data.file?.url);
            if (!resolvedUrl) return null;
            return (
              <figure key={index} className="my-8">
                <img
                  src={resolvedUrl}
                  alt={block.data.caption || 'Article illustration'}
                  className="w-full rounded-2xl border border-gray-200 object-cover shadow-sm max-h-[500px]"
                  loading="lazy"
                />
                {block.data.caption && (
                  <figcaption className="mt-2 text-center text-xs font-semibold text-gray-500">
                    {block.data.caption}
                  </figcaption>
                )}
              </figure>
            );
          }

          case 'list': {
            const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
            const listClasses =
              block.data.style === 'ordered'
                ? 'list-decimal list-inside space-y-2 text-gray-800 text-base pl-2'
                : 'list-disc list-inside space-y-2 text-gray-800 text-base pl-2';
            
            // Check if items are objects (EditorJS v2.30+ list format) or raw strings
            const items = block.data.items || [];
            return (
              <ListTag key={index} className={listClasses}>
                {items.map((item: any, i) => {
                  const content = typeof item === 'object' && item !== null ? item.content : item;
                  return <li key={i} dangerouslySetInnerHTML={{ __html: content || '' }} />;
                })}
              </ListTag>
            );
          }

          case 'quote':
            return (
              <blockquote
                key={index}
                className="border-l-4 border-red-600 bg-gray-50 py-3 px-5 my-6 rounded-r-xl italic text-gray-800 font-medium text-base sm:text-lg"
              >
                <p dangerouslySetInnerHTML={{ __html: block.data.text || '' }} />
                {block.data.caption && (
                  <cite className="block mt-2 text-xs font-bold text-gray-500 not-italic uppercase tracking-wider">
                    — {block.data.caption}
                  </cite>
                )}
              </blockquote>
            );

          case 'code':
            return (
              <div key={index} className="my-6 overflow-hidden rounded-xl border border-gray-300 bg-black text-gray-100 shadow-md">
                <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-2 text-xs font-mono text-gray-400">
                  <span>Code Snippet</span>
                  <span className="text-[10px] text-red-500 font-bold uppercase">Terminal</span>
                </div>
                <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-6 text-gray-200">
                  <code>{block.data.code}</code>
                </pre>
              </div>
            );

          case 'embed':
            return (
              <div key={index} className="my-8 aspect-video w-full overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                <iframe
                  src={block.data.embed}
                  title={block.data.caption || 'Embedded content'}
                  className="h-full w-full"
                  allowFullScreen
                />
              </div>
            );

          // 🚨 3. New Table Block Renderer
          case 'table': {
            const tableRows = block.data.content || [];
            if (tableRows.length === 0) return null;

            const hasHeadings = block.data.withHeadings;
            const headerRow = hasHeadings ? tableRows[0] : null;
            const bodyRows = hasHeadings ? tableRows.slice(1) : tableRows;

            return (
              <div key={index} className="my-6 w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
                <table className="w-full table-auto text-left text-xs sm:text-sm">
                  {headerRow && (
                    <thead className="bg-gray-100 text-gray-900 border-b border-gray-200">
                      <tr>
                        {headerRow.map((cell, cellIdx) => (
                          <th
                            key={cellIdx}
                            className="px-4 py-3 font-bold"
                            dangerouslySetInnerHTML={{ __html: cell || '' }}
                          />
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody className="divide-y divide-gray-100">
                    {bodyRows.map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className="transition hover:bg-gray-50/50 even:bg-gray-50/20"
                      >
                        {row.map((cell, cellIdx) => (
                          <td
                            key={cellIdx}
                            className="px-4 py-3 font-medium text-gray-800"
                            dangerouslySetInnerHTML={{ __html: cell || '' }}
                          />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}
