'use client';

import React from 'react';
import { JS_SERVER_PATHS } from '@/src/lib/utils/constants';

interface Block {
  type: string;
  data: {
    text?: string;
    level?: number;
    caption?: string;
    file?: { url: string };
    items?: string[] | { content: string }[];
    style?: string;
    code?: string;
    service?: string;
    embed?: string;
    content?: string[][];
    withHeadings?: boolean;
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
    <div className="prose prose-slate max-w-none text-slate-900 font-sans leading-relaxed tracking-normal">
      {/* 🛡️ CSS Overrides for Inline tags, Links, and Inline Codes */}
      <style jsx global>{`
        /* Inline Code Highlights */
        .inline-code, 
        code:not(pre code) {
          background-color: #f1f5f9 !important;
          color: #ef4444 !important; /* Crimson Red */
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
          font-size: 14px !important;
          font-weight: 700 !important;
          padding: 3px 6px !important;
          border-radius: 6px !important;
          border: 1px solid #e2e8f0 !important;
        }

        /* Inline Anchors / Links */
        .prose-slate a {
          color: #2563eb !important; /* Cobalt Blue */
          text-decoration: underline !important;
          text-decoration-color: #2563eb40 !important;
          font-weight: 600 !important;
          transition: all 0.15s ease-in-out !important;
        }
        .prose-slate a:hover {
          color: #dc2626 !important; /* Red hover */
          text-decoration-color: #dc2626 !important;
        }

        /* Bold and Emphasis */
        .prose-slate strong {
          color: #0f172a !important; /* Deep black */
          font-weight: 800 !important;
        }
        .prose-slate em {
          color: #334155 !important;
          font-style: italic !important;
        }
      `}</style>

      <div className="space-y-7">
        {blocks.map((block, index) => {
          switch (block.type) {
            
            /* 1. TYPOGRAPHIC HEADINGS (Precise sizing per Level) */
            case 'header': {
              const level = block.data.level || 2;
              const text = block.data.text || '';
              
              switch (level) {
                case 1:
                  return (
                    <h1
                      key={index}
                      className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 mt-12 mb-5 border-b border-slate-200 pb-3 leading-tight"
                      dangerouslySetInnerHTML={{ __html: text }}
                    />
                  );
                case 2:
                  return (
                    <h2
                      key={index}
                      className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-10 mb-4 border-b border-slate-100 pb-2 leading-snug"
                      dangerouslySetInnerHTML={{ __html: text }}
                    />
                  );
                case 3:
                  return (
                    <h3
                      key={index}
                      className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-8 mb-3 leading-snug"
                      dangerouslySetInnerHTML={{ __html: text }}
                    />
                  );
                case 4:
                  return (
                    <h4
                      key={index}
                      className="text-lg sm:text-xl font-bold tracking-normal text-slate-800 mt-6 mb-2"
                      dangerouslySetInnerHTML={{ __html: text }}
                    />
                  );
                case 5:
                  return (
                    <h5
                      key={index}
                      className="text-base sm:text-lg font-bold tracking-normal text-slate-700 mt-5 mb-1.5 uppercase"
                      dangerouslySetInnerHTML={{ __html: text }}
                    />
                  );
                case 6:
                  return (
                    <h6
                      key={index}
                      className="text-sm sm:text-base font-bold tracking-wide text-slate-600 mt-4 mb-1 uppercase italic"
                      dangerouslySetInnerHTML={{ __html: text }}
                    />
                  );
                default:
                  return (
                    <h2
                      key={index}
                      className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-10 mb-4 leading-snug"
                      dangerouslySetInnerHTML={{ __html: text }}
                    />
                  );
              }
            }

            /* 2. PARAGRAPHS */
            case 'paragraph': {
              const text = block.data.text || '';
              if (text === '&nbsp;' || !text.trim()) return <div key={index} className="h-4" />;
              return (
                <p
                  key={index}
                  className="text-base sm:text-[17px] text-slate-800 leading-8 tracking-normal"
                  dangerouslySetInnerHTML={{ __html: text }}
                />
              );
            }

            /* 3. IMAGES */
            case 'image': {
              const resolvedUrl = resolveBlockImageUrl(block.data.file?.url);
              if (!resolvedUrl) return null;
              return (
                <figure key={index} className="my-10 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                  <img
                    src={resolvedUrl}
                    alt={block.data.caption || 'Article illustration'}
                    className="w-full object-cover max-h-[550px] block animate-fadeIn"
                    loading="lazy"
                  />
                  {block.data.caption && (
                    <figcaption className="bg-white border-t border-slate-100 py-3 px-4 text-center text-xs font-semibold text-slate-500 italic">
                      {block.data.caption}
                    </figcaption>
                  )}
                </figure>
              );
            }

            /* 4. LISTS (BULLETED & ORDERED) */
            case 'list': {
              const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
              const listClasses =
                block.data.style === 'ordered'
                  ? 'list-decimal pl-6 space-y-3 text-slate-800 text-base sm:text-[17px] leading-8'
                  : 'list-disc pl-6 space-y-3 text-slate-800 text-base sm:text-[17px] leading-8';

              const items = block.data.items || [];
              return (
                <ListTag key={index} className={listClasses}>
                  {items.map((item: any, i) => {
                    const content = typeof item === 'object' && item !== null ? item.content : item;
                    return (
                      <li
                        key={i}
                        className="marker:text-red-600 pl-1"
                        dangerouslySetInnerHTML={{ __html: content || '' }}
                      />
                    );
                  })}
                </ListTag>
              );
            }

            /* 5. BLOCKQUOTES */
            case 'quote':
              return (
                <blockquote
                  key={index}
                  className="border-l-4 border-red-600 bg-slate-50/70 py-4 px-6 my-8 rounded-r-2xl italic text-slate-800 font-medium text-base sm:text-lg shadow-sm"
                >
                  <p dangerouslySetInnerHTML={{ __html: block.data.text || '' }} className="leading-relaxed" />
                  {block.data.caption && (
                    <cite className="block mt-2 text-xs font-bold text-slate-500 not-italic uppercase tracking-widest">
                      — {block.data.caption}
                    </cite>
                  )}
                </blockquote>
              );

            /* 6. CODE BLOCKS (TERMINAL CONSOLE STYLE) */
            case 'code':
              return (
                <div key={index} className="my-8 overflow-hidden rounded-xl border border-slate-200 bg-slate-950 text-slate-100 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-850 bg-slate-900 px-4 py-2.5 text-[11px] font-mono font-bold tracking-wider text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                    </span>
                    <span className="uppercase text-slate-500">Terminal</span>
                  </div>
                  <pre className="p-5 overflow-x-auto text-xs sm:text-sm font-mono leading-7 text-sky-400 bg-slate-950">
                    <code>{block.data.code}</code>
                  </pre>
                </div>
              );

            /* 7. IFRAME EMBEDS */
            case 'embed':
              return (
                <div key={index} className="my-10 aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                  <iframe
                    src={block.data.embed}
                    title={block.data.caption || 'Embedded content'}
                    className="h-full w-full"
                    allowFullScreen
                  />
                </div>
              );

            /* 8. DATA TABLES */
            case 'table': {
              const tableRows = block.data.content || [];
              if (tableRows.length === 0) return null;

              const hasHeadings = block.data.withHeadings;
              const headerRow = hasHeadings ? tableRows[0] : null;
              const bodyRows = hasHeadings ? tableRows.slice(1) : tableRows;

              return (
                <div key={index} className="my-8 w-full overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
                  <table className="w-full table-auto text-left text-sm">
                    {headerRow && (
                      <thead className="bg-slate-50 text-slate-900 border-b border-slate-200 font-bold uppercase tracking-wider text-xs">
                        <tr>
                          {headerRow.map((cell, cellIdx) => (
                            <th
                              key={cellIdx}
                              className="px-5 py-3.5 font-bold border-r border-slate-100 last:border-none"
                              dangerouslySetInnerHTML={{ __html: cell || '' }}
                            />
                          ))}
                        </tr>
                      </thead>
                    )}
                    <tbody className="divide-y divide-slate-100 text-slate-800 font-medium text-xs sm:text-sm">
                      {bodyRows.map((row, rowIdx) => (
                        <tr
                          key={rowIdx}
                          className="transition hover:bg-slate-50/40 even:bg-slate-50/10"
                        >
                          {row.map((cell, cellIdx) => (
                            <td
                              key={cellIdx}
                              className="px-5 py-3.5 border-r border-slate-100 last:border-none"
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
    </div>
  );
}
