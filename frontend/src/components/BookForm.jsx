import React, { useState, useEffect } from 'react';
import { Plus, Check, Star, AlertCircle, Image as ImageIcon, Trash2, Upload } from 'lucide-react';

export const BookForm = ({
  onSubmit,
  editingBook,
  onCancelEdit,
  autofillData,
  onClearAutofill
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState('want-to-read');
  const [rating, setRating] = useState(0);
  const [currentPage, setCurrentPage] = useState('0');
  const [totalPages, setTotalPages] = useState('100');
  const [review, setReview] = useState('');
  const [notes, setNotes] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [currentChapter, setCurrentChapter] = useState('');
  const [error, setError] = useState(null);
  const [quickAddVal, setQuickAddVal] = useState('');

  // Load editing book or autofilled details
  useEffect(() => {
    if (editingBook) {
      setTitle(editingBook.title);
      setAuthor(editingBook.author);
      setStatus(editingBook.status);
      setRating(editingBook.rating);
      setCurrentPage(editingBook.currentPage.toString());
      setTotalPages((editingBook.totalPages || 100).toString());
      setReview(editingBook.review || '');
      setNotes(editingBook.notes || '');
      setCoverImage(editingBook.coverImage || '');
      setCurrentChapter(editingBook.currentChapter || '');
      setError(null);
    } else if (autofillData) {
      setTitle(autofillData.title);
      setAuthor(autofillData.author);
      setStatus('want-to-read');
      setRating(0);
      setCurrentPage('0');
      setTotalPages(autofillData.totalPages.toString());
      setReview('');
      setNotes('');
      setCoverImage(autofillData.coverUrl || '');
      setCurrentChapter('');
      setError(null);
    } else {
      resetForm();
    }
  }, [editingBook, autofillData]);

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setStatus('want-to-read');
    setRating(0);
    setCurrentPage('0');
    setTotalPages('100');
    setReview('');
    setNotes('');
    setCoverImage('');
    setCurrentChapter('');
    setError(null);
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    if (newStatus === 'completed') {
      setCurrentPage(totalPages === '' ? '100' : totalPages.toString());
    } else if (newStatus === 'want-to-read') {
      setCurrentPage('0');
    } else if (newStatus === 'reading') {
      const current = currentPage === '' ? 0 : parseInt(currentPage.toString(), 10);
      const total = totalPages === '' ? 100 : parseInt(totalPages.toString(), 10);
      const pageVal = (current === 0 || current === total) ? (current === total ? Math.max(total - 1, 0) : 1) : current;
      setCurrentPage(pageVal.toString());
    }
  };

  const handleCurrentPageChange = (valStr) => {
    if (valStr === '') {
      setCurrentPage('');
      setStatus('want-to-read');
      return;
    }
    
    let cleaned = valStr.replace(/^0+/, '');
    if (cleaned === '') cleaned = '0';
    
    const val = parseInt(cleaned, 10);
    if (isNaN(val) || val < 0) return;
    
    let finalVal = val;
    if (totalPages !== '') {
      const total = parseInt(totalPages.toString(), 10);
      if (!isNaN(total) && val > total) {
        finalVal = total;
      }
    }
    
    setCurrentPage(finalVal.toString());
    
    if (totalPages !== '') {
      const total = parseInt(totalPages.toString(), 10);
      if (!isNaN(total)) {
        if (finalVal === total) {
          setStatus('completed');
        } else if (finalVal === 0) {
          setStatus('want-to-read');
        } else {
          setStatus('reading');
        }
      }
    } else {
      if (finalVal === 0) {
        setStatus('want-to-read');
      } else {
        setStatus('reading');
      }
    }
  };

  const handleTotalPagesChange = (valStr) => {
    if (valStr === '') {
      setTotalPages('');
      return;
    }
    
    let cleaned = valStr.replace(/^0+/, '');
    if (cleaned === '') cleaned = '0';
    
    const val = parseInt(cleaned, 10);
    if (isNaN(val) || val < 0) return;
    setTotalPages(val.toString());
    
    let activePage = currentPage === '' ? 0 : parseInt(currentPage.toString(), 10);
    if (currentPage !== '' && activePage > val) {
      setCurrentPage(val.toString());
      activePage = val;
    }
    
    if (currentPage !== '') {
      if (activePage === val) {
        setStatus('completed');
      } else if (activePage === 0) {
        setStatus('want-to-read');
      } else {
        setStatus('reading');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    const cleanTitle = title.trim();
    const cleanAuthor = author.trim();
    const pageRead = currentPage === '' ? 0 : parseInt(currentPage.toString(), 10);
    const pageTotal = totalPages === '' ? 100 : parseInt(totalPages.toString(), 10);

    if (!cleanTitle) {
      setError("Please specify the book title.");
      return;
    }
    if (!cleanAuthor) {
      setError("Please specify the author's name.");
      return;
    }
    if (cleanTitle.length > 300) {
      setError("Title is too long (maximum 300 characters).");
      return;
    }
    if (cleanAuthor.length > 300) {
      setError("Author is too long (maximum 300 characters).");
      return;
    }
    if (pageRead < 0 || pageTotal < 1) {
      setError("Page counts must be positive integers.");
      return;
    }
    if (pageRead > pageTotal) {
      setError("Current page read cannot exceed the total book pages.");
      return;
    }
    if (rating < 0 || rating > 5) {
      setError("Rating must be between 0 and 5.");
      return;
    }
    if (review.length > 10000) {
      setError("Review exceeds the 10,000 character limit.");
      return;
    }
    if (notes.length > 10000) {
      setError("Notes exceed the 10,000 character limit.");
      return;
    }
    const cleanChapter = currentChapter.trim();
    if (cleanChapter.length > 200) {
      setError("Current chapter is too long (maximum 200 characters).");
      return;
    }

    onSubmit({
      title: cleanTitle,
      author: cleanAuthor,
      status,
      rating,
      currentPage: pageRead,
      totalPages: pageTotal,
      review: review.trim(),
      notes: notes.trim(),
      coverImage,
      currentChapter: cleanChapter
    });

    if (!editingBook) {
      resetForm();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("Image file is too large (maximum 10MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 240;
        const maxH = 360;
        let width = img.width;
        let height = img.height;

        if (width > maxW || height > maxH) {
          const ratio = Math.min(maxW / width, maxH / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCoverImage(dataUrl);
        setError(null);
      };
      img.onerror = () => {
        setError("Invalid image file format.");
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      setError("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div id="book-form-card" className="bg-editorial-bone/35 border border-editorial-ink/20 p-6 transition-all">
      <div className="flex items-baseline justify-between border-b border-editorial-ink/25 pb-4 mb-5">
        <h2 className="font-serif font-black text-2xl uppercase tracking-tight text-editorial-ink flex items-center gap-2">
          <span>{editingBook ? "Edit Record" : "New Volume"}</span>
        </h2>
        {(editingBook || autofillData) && (
          <button 
            type="button"
            onClick={() => {
              if (editingBook && onCancelEdit) onCancelEdit();
              if (autofillData && onClearAutofill) onClearAutofill();
            }}
            className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#1a1a1a]/55 hover:text-editorial-ink"
          >
            Cancel [X]
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-rose-50 border border-rose-200/60 p-3.5 flex items-start gap-2 text-xs text-rose-900 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title & Author */}
        <div className="space-y-4">
          <div>
            <label className="font-sans text-[10px] uppercase font-black tracking-widest text-editorial-ink/75 block mb-1.5">
              Book Title <span className="text-rose-700">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Crime and Punishment"
              className="w-full text-sm font-serif px-3.5 py-2.5 bg-white border border-editorial-ink/20 focus:border-editorial-ink outline-none text-editorial-ink transition-all rounded-none font-medium"
            />
          </div>
          <div>
            <label className="font-sans text-[10px] uppercase font-black tracking-widest text-editorial-ink/75 block mb-1.5">
              Author Name <span className="text-rose-700">*</span>
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g., Fyodor Dostoevsky"
              className="w-full text-sm font-serif px-3.5 py-2.5 bg-white border border-editorial-ink/20 focus:border-editorial-ink outline-none text-editorial-ink transition-all rounded-none font-medium"
            />
          </div>
          <div>
            <label className="font-sans text-[10px] uppercase font-black tracking-widest text-editorial-ink/75 block mb-1.5">
              Book Cover Image
            </label>
            <div className="flex gap-4 items-start bg-white border border-editorial-ink/10 p-3">
              <div className="w-20 h-28 bg-editorial-bone border border-editorial-ink/20 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm relative">
                {coverImage ? (
                  <img src={coverImage} alt="Book cover preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center p-2 text-center">
                    <ImageIcon className="w-5 h-5 text-editorial-ink/20 mb-1" />
                    <span className="font-sans text-[7px] uppercase tracking-wider text-editorial-ink/35 font-bold">No Cover</span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="relative">
                  <input
                    type="file"
                    id="cover-image-input"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="cover-image-input"
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-editorial-ink hover:bg-editorial-charcoal text-white font-sans text-[9px] uppercase tracking-widest font-black transition-colors cursor-pointer"
                  >
                    <Upload className="w-3 h-3 text-white" />
                    <span>{coverImage ? 'Change Cover' : 'Upload Cover'}</span>
                  </label>
                </div>
                {coverImage && (
                  <button
                    type="button"
                    onClick={() => setCoverImage('')}
                    className="inline-flex items-center gap-1 text-rose-700 hover:text-rose-900 font-sans text-[9px] uppercase tracking-widest font-black bg-transparent border-0 cursor-pointer pt-1"
                  >
                    <Trash2 className="w-3 h-3 text-rose-700" />
                    <span>Remove Cover</span>
                  </button>
                )}
                <p className="text-[8px] font-sans font-bold uppercase tracking-wider text-editorial-ink/40 leading-normal">
                  AUTO-COMPRESSED FOR OPTIMAL STORAGE SHELF PERFORMANCE.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status selection */}
        <div>
          <label className="font-sans text-[10px] uppercase font-black tracking-widest text-editorial-ink/75 block mb-2">
            Reading Status
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {['want-to-read', 'reading', 'completed'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => handleStatusChange(st)}
                className={`text-[9px] font-sans font-bold py-2.5 px-2 text-center uppercase tracking-widest border transition-all ${
                  status === st
                    ? 'bg-editorial-ink text-editorial-paper border-editorial-ink'
                    : 'bg-white text-editorial-ink/50 border-editorial-ink/10 hover:border-editorial-ink/40'
                }`}
              >
                {st === 'want-to-read' ? 'Queue' : st === 'reading' ? 'Active' : 'Read'}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Tracking Pages */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-sans text-[10px] uppercase font-black tracking-widest text-editorial-ink/75 block mb-1.5">
              Pages Read
            </label>
            <input
              type="number"
              value={currentPage}
              onChange={(e) => handleCurrentPageChange(e.target.value)}
              placeholder="0"
              min="0"
              max={totalPages !== '' ? totalPages : undefined}
              className="w-full text-sm font-serif px-3.5 py-2.5 bg-white disabled:bg-editorial-bone disabled:text-[#1a1a1a]/40 border border-editorial-ink/20 focus:border-editorial-ink outline-none text-editorial-ink transition-all rounded-none font-medium"
            />
            {/* Quick Increment and custom offset */}
            <div className="mt-2 space-y-2">
              <div className="flex flex-wrap gap-1">
                {[5, 10, 25, 50].map((inc) => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => {
                      const current = currentPage === '' ? 0 : parseInt(currentPage, 10);
                      const total = totalPages === '' ? 100 : parseInt(totalPages, 10);
                      const next = Math.min(current + inc, total);
                      handleCurrentPageChange(next.toString());
                    }}
                    className="text-[8px] font-sans font-bold bg-white text-editorial-ink border border-editorial-ink/15 hover:border-editorial-ink px-1.5 py-0.5 transition-all cursor-pointer"
                  >
                    +{inc}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="+ Pages"
                  value={quickAddVal}
                  onChange={(e) => setQuickAddVal(e.target.value)}
                  min="1"
                  className="text-[9px] font-serif px-1.5 py-0.5 bg-white border border-editorial-ink/20 focus:border-editorial-ink outline-none text-editorial-ink rounded-none w-14"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = parseInt(quickAddVal, 10);
                      if (!isNaN(val) && val > 0) {
                        const current = currentPage === '' ? 0 : parseInt(currentPage, 10);
                        const total = totalPages === '' ? 100 : parseInt(totalPages, 10);
                        const next = Math.min(current + val, total);
                        handleCurrentPageChange(next.toString());
                        setQuickAddVal('');
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = parseInt(quickAddVal, 10);
                    if (!isNaN(val) && val > 0) {
                      const current = currentPage === '' ? 0 : parseInt(currentPage, 10);
                      const total = totalPages === '' ? 100 : parseInt(totalPages, 10);
                      const next = Math.min(current + val, total);
                      handleCurrentPageChange(next.toString());
                      setQuickAddVal('');
                    }
                  }}
                  className="text-[8px] font-sans font-black bg-editorial-ink/10 hover:bg-editorial-ink hover:text-white text-editorial-ink px-1.5 py-0.5 border border-editorial-ink/15 transition-all uppercase tracking-wider cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="font-sans text-[10px] uppercase font-black tracking-widest text-editorial-ink/75 block mb-1.5">
              Total Pages
            </label>
            <input
              type="number"
              value={totalPages}
              onChange={(e) => handleTotalPagesChange(e.target.value)}
              placeholder="300"
              min="1"
              className="w-full text-sm font-serif px-3.5 py-2.5 bg-white border border-editorial-ink/20 focus:border-editorial-ink outline-none text-editorial-ink transition-all rounded-none font-medium"
            />
          </div>
        </div>

        {/* Current Chapter Input */}
        <div>
          <label className="font-sans text-[10px] uppercase font-black tracking-widest text-editorial-ink/75 block mb-1.5">
            Current Chapter
          </label>
          <input
            type="text"
            value={currentChapter}
            onChange={(e) => setCurrentChapter(e.target.value)}
            placeholder="e.g., Chapter 5 or Prologue"
            className="w-full text-sm font-serif px-3.5 py-2.5 bg-white disabled:bg-editorial-bone disabled:text-[#1a1a1a]/40 border border-editorial-ink/20 focus:border-editorial-ink outline-none text-editorial-ink transition-all rounded-none font-medium"
          />
        </div>

        {/* Rating Stars */}
        <div>
          <label className="font-sans text-[10px] uppercase font-black tracking-widest text-editorial-ink/75 block mb-1">
            Star Rating
          </label>
          <div className="flex items-center gap-1.5 py-1.5">
            {[1, 2, 3, 4, 5].map((starValue) => (
              <button
                key={starValue}
                type="button"
                onClick={() => setRating(starValue === rating ? 0 : starValue)}
                className="transition-transform active:scale-110 focus:outline-none"
              >
                <Star
                  className={`w-5.5 h-5.5 stroke-[1.5] transition-colors ${
                    starValue <= rating 
                      ? 'fill-editorial-ink text-editorial-ink' 
                      : 'text-editorial-ink/10 hover:text-editorial-ink/60'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-editorial-ink/60 ml-2 bg-white border border-editorial-ink/10 px-1.5 py-0.5">
                {rating} / 5
              </span>
            )}
          </div>
        </div>

        {/* Short Review & Quotes/Notes */}
        <div>
          <label className="font-sans text-[10px] uppercase font-black tracking-widest text-editorial-ink/75 block mb-1.5">
            Review thoughts
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="A compelling modern landscape..."
            rows={3}
            className="w-full text-sm font-serif px-3.5 py-2.5 bg-white border border-editorial-ink/20 focus:border-editorial-ink outline-none text-editorial-ink transition-all rounded-none resize-none"
          />
        </div>

        <div>
          <label className="font-sans text-[10px] uppercase font-black tracking-widest text-editorial-ink/75 block mb-1.5">
            Study Diaries & Citations
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Extract favorite passages..."
            rows={2}
            className="w-full text-sm font-serif px-3.5 py-2.5 bg-white border border-editorial-ink/20 focus:border-editorial-ink outline-none text-editorial-ink transition-all rounded-none resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 py-4 bg-editorial-ink hover:bg-editorial-charcoal text-white font-sans text-xs uppercase tracking-[0.25em] font-black transition-colors"
        >
          {editingBook ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span>Update Chronicle</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Add Archive Entry</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
};
