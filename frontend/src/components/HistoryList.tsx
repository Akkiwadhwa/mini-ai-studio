import React from 'react';

type Item = {
  id: number;
  imageUrl: string;
  prompt: string;
  style: string;
  createdAt: string;
  status: string;
};

type Props = {
  items: Item[];
  onSelect: (item: Item) => void;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

export default function HistoryList({ items, onSelect }: Props) {
  if (!items.length) {
    return (
      <div className="glass-panel flex flex-col items-center justify-center gap-3 rounded-3xl p-6 text-center text-sm text-slate-400">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/60 text-slate-300">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 6v6l3.5 2.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
        <p className="font-medium text-slate-200">Start creating</p>
        <p className="max-w-[13rem] text-xs">
          Your last five generations will appear here so you can quickly revisit and refine them.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3" role="list" aria-label="Recent generations">
      {items.map(item => (
        <li key={item.id}>
          <button
            onClick={() => onSelect(item)}
            className="group glass-panel flex w-full items-center gap-4 overflow-hidden rounded-3xl p-3 text-left transition hover:border-indigo-300/40 hover:bg-slate-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            role="listitem"
          >
            <span className="relative block h-14 w-14 overflow-hidden rounded-2xl ring-1 ring-white/10">
              <img
                src={item.imageUrl}
                alt={`Generated ${item.style} design`}
                className="h-full w-full object-cover transition group-hover:scale-105"
              />
            </span>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-100">{item.style}</span>
                <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-200">
                  {item.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-1">{item.prompt}</p>
              <time className="block text-[11px] font-medium text-slate-500">{formatDate(item.createdAt)}</time>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
