import React, { useState, useEffect } from 'react';
import { Star, Edit2, Trash2, ChevronDown, ChevronUp, Check, Play, BookOpen, Quote, FileText } from 'lucide-react';

export const BookCard = ({
  book,
  onEdit,
  onDelete,
  onUpdateProgress
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [quickPageInput, setQuickPageInput] = useState('');
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editTitle, setEditTitle] = useState(book.title);
  const [editTotalPages, setEditTotalPages] = useState(book.totalPages.toString());
  const [editCurrentPage, setEditCurrentPage] = useState(book.currentPage.toString());
  const [editRating, setEditRating] = useState(book.rating);
  const [editReview, setEditReview] = useState(book.review || '');
  const [editNotes, setEditNotes] = useState(book.notes || '');

  useEffect(() => {
    setEditTitle(book.title);
    setEditTotalPages(book.totalPages.toString());
    setEditCurrentPage(book.currentPage.toString());
    setEditRating(book.rating);
    setEditReview(book.review || '');
    setEditNotes(book.notes || '');
  }, [book]);

  const progressPercent = book.totalPages > 0 
    ? Math.min(Math.round((book.currentPage / book.totalPages) * 100), 100)
    : 0;

  const handleStartReading = () => {
    onUpdateProgress(book.id, { status: 'reading', currentPage: 0 });
  };

  const handleQuickPageAdd = (amount) => {
    const currentPages = Number(book.currentPage) || 0;
    const totalPages = Number(book.totalPages) || 0;
    const nextPages = Math.min(currentPages + amount, totalPages);
    const updates = { currentPage: nextPages };
    if (nextPages >= totalPages) {
      updates.status = 'completed';
    } else if (book.status === 'want-to-read') {
      updates.status = 'reading';
    }
    onUpdateProgress(book.id, updates);
  };

  const handleMarkCompleted = () => {
    onUpdateProgress(book.id, { 
      status: 'completed', 
      currentPage: Number(book.totalPages) || 0 
    });
  };

  const handleSaveQuickPage = (e) => {
    e.preventDefault();
    const input = quickPageInput.trim();
    if (!input) return;

    const isRelativeAdd = input.startsWith('+');
    const isRelativeSub = input.startsWith('-');
    
    // Parse the number part (ignoring sign and any spaces)
    const numPart = input.replace(/^[+-]\s*/, '');
    const val = parseInt(numPart, 10);
    
    if (isNaN(val) || val < 0) return;

    let nextPages = Number(book.currentPage) || 0;
    const totalPages = Number(book.totalPages) || 0;
    if (isRelativeAdd) {
      nextPages = Math.min(nextPages + val, totalPages);
    } else if (isRelativeSub) {
      nextPages = Math.max(nextPages - val, 0);
    } else {
      nextPages = Math.min(val, totalPages);
    }
    
    const updates = { currentPage: nextPages };
    if (nextPages >= totalPages) {
      updates.status = 'completed';
    } else if (nextPages === 0) {
      updates.status = 'want-to-read';
    } else {
      updates.status = 'reading';
    }
    
    onUpdateProgress(book.id, updates);
    setQuickPageInput('');
  };

  const handleSaveInfo = (e) => {
    e.preventDefault();
    const titleTrimmed = editTitle.trim();
    if (!titleTrimmed) return;

    const currentPagesParsed = parseInt(editCurrentPage, 10);
    const totalPagesParsed = parseInt(editTotalPages, 10);

    if (isNaN(currentPagesParsed) || currentPagesParsed < 0) return;
    if (isNaN(totalPagesParsed) || totalPagesParsed < 1) return;

    const finalCurrentPage = Math.min(currentPagesParsed, totalPagesParsed);

    let nextStatus = book.status;
    if (finalCurrentPage >= totalPagesParsed) {
      nextStatus = 'completed';
    } else if (finalCurrentPage === 0) {
      nextStatus = 'want-to-read';
    } else if (book.status === 'completed' || book.status === 'want-to-read') {
      nextStatus = 'reading';
    }

    onUpdateProgress(book.id, {
      title: titleTrimmed,
      currentPage: finalCurrentPage,
      totalPages: totalPagesParsed,
      status: nextStatus,
      rating: editRating,
      review: editReview.trim(),
      notes: editNotes.trim()
    });

    setIsEditingInfo(false);
  };

  const handleDeleteConfirm = () => {
    if (isDeleting) {
      onDelete(book.id);
    } else {
      setIsDeleting(true);
      setTimeout(() => setIsDeleting(false), 4000); // Reset confirm state after 4s
    }
  };

  return (
    <div id={`book-card-${book.id}`} className="bg-white border border-editorial-ink/20 p-6 flex flex-col justify-between transition-all hover:border-editorial-ink/55 h-full relative">
      {isEditingInfo ? (
        <form onSubmit={handleSaveInfo} className="space-y-3 h-full flex flex-col justify-between overflow-y-auto max-h-[450px] pr-1">
          <div className="space-y-3">
            <span className="font-sans text-[9px] uppercase font-black tracking-widest text-editorial-ink/55 block border-b border-editorial-ink/10 pb-1.5">
              Quick Edit Volume
            </span>
            <div>
              <label className="font-sans text-[8px] uppercase font-black tracking-widest text-editorial-ink/65 block mb-1">
                Book Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-xs font-serif px-2 py-1.5 bg-white border border-editorial-ink/20 focus:border-editorial-ink outline-none text-editorial-ink rounded-none font-medium"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-sans text-[8px] uppercase font-black tracking-widest text-editorial-ink/65 block mb-1">
                  Pages Read
                </label>
                <input
                  type="number"
                  value={editCurrentPage}
                  onChange={(e) => setEditCurrentPage(e.target.value)}
                  min="0"
                  className="w-full text-xs font-serif px-2 py-1.5 bg-white border border-editorial-ink/20 focus:border-editorial-ink outline-none text-editorial-ink rounded-none font-medium"
                  required
                />
              </div>
              <div>
                <label className="font-sans text-[8px] uppercase font-black tracking-widest text-editorial-ink/65 block mb-1">
                  Total Pages
                </label>
                <input
                  type="number"
                  value={editTotalPages}
                  onChange={(e) => setEditTotalPages(e.target.value)}
                  min="1"
                  className="w-full text-xs font-serif px-2 py-1.5 bg-white border border-editorial-ink/20 focus:border-editorial-ink outline-none text-editorial-ink rounded-none font-medium"
                  required
                />
              </div>
            </div>
            
            {/* Star Rating Select */}
            <div>
              <label className="font-sans text-[8px] uppercase font-black tracking-widest text-editorial-ink/65 block mb-1">
                Star Rating
              </label>
              <div className="flex items-center gap-1.5 py-1">
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setEditRating(starValue === editRating ? 0 : starValue)}
                    className="transition-transform active:scale-110 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 stroke-[1.5] transition-colors ${
                        starValue <= editRating 
                          ? 'fill-editorial-ink text-editorial-ink' 
                          : 'text-editorial-ink/10 hover:text-editorial-ink/60'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review Thoughts */}
            <div>
              <label className="font-sans text-[8px] uppercase font-black tracking-widest text-editorial-ink/65 block mb-1">
                Review thoughts
              </label>
              <textarea
                value={editReview}
                onChange={(e) => setEditReview(e.target.value)}
                placeholder="A compelling modern landscape..."
                rows={2}
                className="w-full text-xs font-serif px-2 py-1.5 bg-white border border-editorial-ink/20 focus:border-editorial-ink outline-none text-editorial-ink rounded-none resize-none font-medium"
              />
            </div>

            {/* Study Diaries & Citations */}
            <div>
              <label className="font-sans text-[8px] uppercase font-black tracking-widest text-editorial-ink/65 block mb-1">
                Study Diaries & Citations
              </label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Extract favorite passages..."
                rows={2}
                className="w-full text-xs font-serif px-2 py-1.5 bg-white border border-editorial-ink/20 focus:border-editorial-ink outline-none text-editorial-ink rounded-none resize-none font-medium"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-editorial-ink/10 mt-auto">
            <button
              type="button"
              onClick={() => {
                setIsEditingInfo(false);
                onEdit(book);
              }}
              className="text-[9px] font-sans font-bold text-editorial-ink/50 hover:text-editorial-ink px-2.5 py-1 mr-auto transition-all uppercase cursor-pointer"
            >
              Full Edit
            </button>
            <button
              type="button"
              onClick={() => setIsEditingInfo(false)}
              className="text-[9px] font-sans font-bold bg-white text-editorial-ink border border-editorial-ink/15 hover:border-editorial-ink px-2.5 py-1 transition-all cursor-pointer uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-[9px] font-sans font-black bg-editorial-ink hover:bg-editorial-charcoal text-white px-3 py-1.5 transition-all uppercase tracking-wider cursor-pointer"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        <>
          <div>
        {/* Card Header & Cover Grid */}
        <div className="flex gap-4 mb-4">
          {/* Cover Image Block */}
          <div 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-20 h-28 bg-editorial-bone border border-editorial-ink/15 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm relative group cursor-pointer hover:border-editorial-ink/40 transition-colors"
          >
            {book.coverImage ? (
              <img 
                src={book.coverImage} 
                alt={book.title} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-2 text-center">
                <BookOpen className="w-5 h-5 text-editorial-ink/25 mb-1" />
                <span className="font-sans text-[7px] uppercase tracking-wider text-editorial-ink/35 font-bold">No Cover</span>
              </div>
            )}
          </div>

          {/* Book Metadata & Badges */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div>
              <h3 
                className="font-serif font-black text-lg text-editorial-ink leading-tight cursor-pointer hover:underline line-clamp-2" 
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {book.title}
              </h3>
              <p className="font-sans text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a]/60 mt-1.5 truncate">
                by {book.author}
              </p>
            </div>

            <div className="mt-2">
              <span className={`text-[9px] font-sans font-bold px-2.5 py-1 uppercase tracking-widest border shrink-0 ${
                book.status === 'completed'
                  ? 'bg-editorial-ink text-white border-editorial-ink'
                  : book.status === 'reading'
                  ? 'bg-editorial-bone text-editorial-ink border-editorial-ink/20'
                  : 'bg-white text-editorial-ink/50 border-editorial-ink/10'
              }`}>
                {book.status === 'completed' ? 'Read' : book.status === 'reading' ? 'Reading' : 'Queue'}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Star Rating preview */}
        <div className="flex items-center gap-0.5 mb-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-3.5 h-3.5 ${
                s <= book.rating 
                  ? 'fill-editorial-ink text-editorial-ink' 
                  : 'text-editorial-ink/10'
              }`}
            />
          ))}
          {book.rating === 0 && (
            <span className="text-[9px] font-sans uppercase tracking-widest text-editorial-ink/40 font-bold ml-1">Unrated</span>
          )}
        </div>

        {/* Progress bar tracking panel */}
        <div className="bg-editorial-bone/40 border border-editorial-ink/10 p-4 mb-4">
          <div className="flex items-baseline justify-between text-[10px] uppercase tracking-widest font-bold text-editorial-ink/60 mb-2">
            <span>Reading Progress</span>
            <span className="font-serif font-bold text-editorial-ink text-xs">{progressPercent}%</span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full h-[3px] bg-editorial-ink/10 overflow-hidden mb-3">
            <div 
              className="h-full bg-editorial-ink transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-sans font-bold uppercase tracking-wide text-editorial-ink/70">
            <span>
              Page {Number(book.currentPage).toLocaleString()} <span className="opacity-55">/</span> {Number(book.totalPages).toLocaleString()}
              {book.currentChapter && (
                <span className="normal-case font-serif italic text-editorial-ink/60 font-medium ml-1.5">
                  • {book.currentChapter}
                </span>
              )}
            </span>
            <span>
              {(Number(book.totalPages) - Number(book.currentPage)).toLocaleString()} left
            </span>
          </div>

          {/* Quick inline status-dependent tracking actions */}
          <div className="mt-3.5 pt-3 border-t border-editorial-ink/10 flex flex-wrap gap-1.5 items-center">
            {book.status === 'want-to-read' && (
              <button
                onClick={handleStartReading}
                className="w-full py-2 bg-editorial-ink text-white hover:bg-editorial-charcoal font-sans text-[10px] uppercase tracking-widest font-black transition-colors animate-fade-in"
              >
                Start Reading
              </button>
            )}

            {book.status === 'reading' && (
              <div className="flex flex-col gap-2.5 w-full">
                <div className="flex items-center gap-1.5 w-full">
                  <button
                    onClick={() => handleQuickPageAdd(10)}
                    className="text-[9px] font-sans font-bold bg-white text-editorial-ink border border-editorial-ink/15 hover:border-editorial-ink px-2.5 py-1 transition-all cursor-pointer"
                  >
                    +10 pages
                  </button>
                  <button
                    onClick={() => handleQuickPageAdd(50)}
                    className="text-[9px] font-sans font-bold bg-white text-editorial-ink border border-editorial-ink/15 hover:border-editorial-ink px-2.5 py-1 transition-all cursor-pointer"
                  >
                    +50 pages
                  </button>
                  <button
                    onClick={handleMarkCompleted}
                    className="text-[9px] font-sans font-bold bg-editorial-ink text-white hover:bg-editorial-charcoal px-3 py-1.5 ml-auto transition-all uppercase tracking-wider cursor-pointer"
                  >
                    Finished
                  </button>
                </div>
                
                <form onSubmit={handleSaveQuickPage} className="flex items-center gap-1.5 border-t border-editorial-ink/10 pt-2.5 w-full">
                  <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-editorial-ink/60 mr-0.5">
                    Page:
                  </span>
                  <input
                    type="text"
                    value={quickPageInput}
                    onChange={(e) => setQuickPageInput(e.target.value)}
                    placeholder={`${book.currentPage} (e.g. +15 or 120)`}
                    className="text-[10px] font-serif px-2 py-1 bg-white border border-editorial-ink/20 focus:border-editorial-ink outline-none text-editorial-ink rounded-none flex-1 min-w-0"
                  />
                  <button
                    type="submit"
                    className="text-[9px] font-sans font-black bg-editorial-ink hover:bg-editorial-charcoal hover:text-white text-editorial-ink px-2.5 py-1 transition-all uppercase tracking-widest cursor-pointer border border-editorial-ink/20"
                  >
                    Save
                  </button>
                </form>
              </div>
            )}

            {book.status === 'completed' && (
              <div className="flex flex-col gap-2.5 w-full">
                <div className="flex items-center gap-1.5 w-full">
                  <span className="text-[9px] font-sans font-black uppercase tracking-widest text-[#1a1a1a]/55">
                    ✓ Completed log
                  </span>
                  <button
                    onClick={() => {
                      const targetPage = Math.max((book.totalPages || 100) - 1, 0);
                      onUpdateProgress(book.id, {
                        status: targetPage > 0 ? 'reading' : 'want-to-read',
                        currentPage: targetPage
                      });
                    }}
                    className="text-[9px] font-sans font-bold bg-white text-editorial-ink border border-editorial-ink/15 hover:border-editorial-ink px-2 py-0.5 ml-auto transition-all cursor-pointer uppercase tracking-wider"
                  >
                    Mark Unread
                  </button>
                </div>
                
                <form onSubmit={handleSaveQuickPage} className="flex items-center gap-1.5 border-t border-editorial-ink/10 pt-2.5 w-full">
                  <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-editorial-ink/60 mr-0.5">
                    Page:
                  </span>
                  <input
                    type="text"
                    value={quickPageInput}
                    onChange={(e) => setQuickPageInput(e.target.value)}
                    placeholder={`${book.currentPage} (e.g. -10 or 250)`}
                    className="text-[10px] font-serif px-2 py-1 bg-white border border-editorial-ink/20 focus:border-editorial-ink outline-none text-editorial-ink rounded-none flex-1 min-w-0"
                  />
                  <button
                    type="submit"
                    className="text-[9px] font-sans font-black bg-editorial-ink hover:bg-editorial-charcoal hover:text-white text-editorial-ink px-2.5 py-1 transition-all uppercase tracking-widest cursor-pointer border border-editorial-ink/20"
                  >
                    Save
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Expandable Notes & Study Guides */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-editorial-ink/15 space-y-3.5 text-xs text-editorial-ink">
            {book.review ? (
              <div className="border-l-2 border-editorial-ink pl-4 py-1">
                <span className="font-sans text-[9px] uppercase font-black tracking-widest text-editorial-ink/55 block mb-1">
                  Review Highlight
                </span>
                <p className="italic font-serif text-editorial-ink/90 leading-relaxed text-[13px]">“{book.review}”</p>
              </div>
            ) : null}

            {book.notes ? (
              <div className="bg-editorial-bone/50 p-3 border border-editorial-ink/10">
                <span className="font-sans text-[9px] uppercase font-black tracking-widest text-editorial-ink/55 block mb-1">
                  Study Diaries & Citations
                </span>
                <p className="font-serif text-editorial-ink/80 leading-relaxed whitespace-pre-wrap">{book.notes}</p>
              </div>
            ) : null}

            {!book.review && !book.notes && (
              <p className="text-[#1a1a1a]/45 italic font-medium py-1.5 text-center font-serif">
                No logs or study notes configured for this volume.
              </p>
            )}

            <div className="flex justify-end text-[9px] font-sans font-bold uppercase tracking-widest text-[#1a1a1a]/40">
              <span>Catalogued {new Date(book.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Controls Footer */}
      <div className="mt-5 pt-3.5 border-t border-editorial-ink/15 flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="font-sans text-[10px] uppercase tracking-widest font-black text-editorial-ink/75 hover:text-editorial-ink inline-flex items-center gap-1"
        >
          {isExpanded ? (
            <span>Collapse Ledger [-]</span>
          ) : (
            <span>Open Ledger ({book.review ? 1 : 0 + (book.notes ? 1 : 0)}) [+]</span>
          )}
        </button>

        <div className="flex items-center gap-3">
          {/* Edit Button */}
          <button
            onClick={() => {
              setIsEditingInfo(!isEditingInfo);
              setEditTitle(book.title);
              setEditTotalPages(book.totalPages.toString());
              setEditCurrentPage(book.currentPage.toString());
              setEditRating(book.rating);
              setEditReview(book.review || '');
              setEditNotes(book.notes || '');
            }}
            className={`transition-colors p-1 ${isEditingInfo ? 'text-editorial-ink' : 'text-editorial-ink/40 hover:text-editorial-ink'}`}
            title="Quick edit volume details"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDeleteConfirm}
            className={`transition-all text-[9px] font-sans font-bold uppercase tracking-wider ${
              isDeleting 
                ? 'bg-rose-700 text-white px-2 py-0.5' 
                : 'text-editorial-ink/40 hover:text-rose-700'
            }`}
            title="Delete from shelf"
          >
            {isDeleting ? 'Sure?' : 'Delete'}
          </button>
        </div>
      </div>
      </>
      )}
    </div>
  );
};
