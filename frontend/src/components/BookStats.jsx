import React from 'react';

export const BookStats = ({ books }) => {
  const totalCount = books.length;
  const completedCount = books.filter(b => b.status === 'completed').length;
  const readingCount = books.filter(b => b.status === 'reading').length;
  const wantToReadCount = books.filter(b => b.status === 'want-to-read').length;

  const totalPagesRead = books.reduce((acc, b) => acc + (Number(b.currentPage) || 0), 0);

  const ratedBooks = books.filter(b => Number(b.rating) > 0);
  const averageRating = ratedBooks.length > 0 
    ? (ratedBooks.reduce((acc, b) => acc + Number(b.rating), 0) / ratedBooks.length).toFixed(1)
    : "0.0";

  // Percentage complete
  const totalPagesSum = books.reduce((acc, b) => acc + (Number(b.totalPages) || 0), 0);
  const overallProgressPercentage = totalPagesSum > 0 
    ? Math.round((totalPagesRead / totalPagesSum) * 100) 
    : 0;

  return (
    <div id="stats-dashboard" className="grid grid-cols-2 lg:grid-cols-5 gap-0 border border-editorial-ink/20 bg-editorial-bone/40 divide-x divide-y lg:divide-y-0 divide-editorial-ink/15 mb-6">
      
      {/* Total Shelf */}
      <div className="p-5 flex flex-col justify-between">
        <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-editorial-ink/65">
          Total Shelf
        </span>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-serif font-black text-editorial-ink leading-none">
            {totalCount}
          </span>
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#1a1a1a]/40">
            vols.
          </span>
        </div>
      </div>

      {/* In Progress */}
      <div className="p-5 flex flex-col justify-between">
        <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-editorial-ink/65">
          Reading
        </span>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-serif font-black text-editorial-ink leading-none">
            {readingCount}
          </span>
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#1a1a1a]/40 animate-pulse">
            active
          </span>
        </div>
      </div>

      {/* Completed */}
      <div className="p-5 flex flex-col justify-between">
        <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-editorial-ink/65">
          Completed
        </span>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-serif font-black text-editorial-ink leading-none">
            {completedCount}
          </span>
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-emerald-700/80">
            read
          </span>
        </div>
      </div>

      {/* Total Pages Read */}
      <div className="p-5 flex flex-col justify-between">
        <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-editorial-ink/65">
          Pages Logged
        </span>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-2xl font-serif font-black text-editorial-ink leading-none truncate block max-w-[140px]">
            {totalPagesRead.toLocaleString()}
          </span>
          <span className="text-[9px] font-sans font-bold uppercase tracking-tighter text-[#1a1a1a]/40">
            pgs
          </span>
        </div>
      </div>

      {/* Average rating */}
      <div className="p-5 flex flex-col justify-between col-span-2 lg:col-span-1">
        <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-editorial-ink/65">
          Avg Rating
        </span>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-3xl font-serif font-black text-editorial-ink leading-none">
            {averageRating}
          </span>
          <span className="text-[10px] font-sans font-bold uppercase tracking-tight text-editorial-ink/40">
            / 5.0 ★
          </span>
        </div>
      </div>

    </div>
  );
};
