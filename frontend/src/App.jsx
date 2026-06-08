/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { useBooks } from './hooks/useBooks';
import { Header } from './components/Header';
import { BookForm } from './components/BookForm';
import { BookStats } from './components/BookStats';
import { BookCard } from './components/BookCard';
import { AuthScreen } from './components/AuthScreen';
import { Search, SlidersHorizontal, Library, X, RefreshCw } from 'lucide-react';

export default function App() {
  const {
    books,
    isLoading,
    currentUser,
    isFirebaseConfigured,
    addBook,
    updateBook,
    deleteBook,
    registerLocalUser,
    loginLocalUser,
    logoutUser
  } = useBooks();

  // Selected editing item state
  const [editingBook, setEditingBook] = useState(null);
  
  // UI filter parameters
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [searchQuery, setSearchQuery] = useState('');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  
  // Open Library state parameters
  const [openLibraryResults, setOpenLibraryResults] = useState([]);
  const [isSearchingOpenLibrary, setIsSearchingOpenLibrary] = useState(false);
  const [autofillBook, setAutofillBook] = useState(null);

  // Auth layout visibility state
  const [showAuthScreen, setShowAuthScreen] = useState(true);

  // Open Library debounced lookup
  useEffect(() => {
    if (!searchQuery.trim()) {
      setOpenLibraryResults([]);
      setIsSearchingOpenLibrary(false);
      return;
    }

    setIsSearchingOpenLibrary(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&limit=5`);
        const data = await response.json();
        
        if (data.docs) {
          const formatted = data.docs.map(doc => {
            let coverUrl = '';
            if (doc.cover_i) {
              coverUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
            }
            return {
              title: doc.title,
              author: doc.author_name ? doc.author_name[0] : 'Unknown Author',
              totalPages: doc.number_of_pages_median || doc.number_of_pages || 100,
              coverUrl: coverUrl
            };
          });
          setOpenLibraryResults(formatted);
        }
      } catch (error) {
        console.error("Open Library Search API error:", error);
      } finally {
        setIsSearchingOpenLibrary(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Auto transition out of Auth screen upon successful account binding
  useEffect(() => {
    if (currentUser) {
      setShowAuthScreen(false);
    }
  }, [currentUser]);

  const handleFormSubmit = (bookData) => {
    if (editingBook) {
      updateBook(editingBook.id, bookData);
      setEditingBook(null);
    } else {
      addBook(bookData);
      setAutofillBook(null);
    }
  };

  const handleEditSelect = (book) => {
    setEditingBook(book);
    setAutofillBook(null);
    // Smooth scroll to top form section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAutofillSelect = (book) => {
    setAutofillBook(book);
    setEditingBook(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter & Sort
  const filteredSortedBooks = useMemo(() => {
    let result = [...books];

    // 1. Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((b) => b.status === statusFilter);
    }

    // 2. Filter by local search query
    if (localSearchQuery.trim()) {
      const q = localSearchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q)
      );
    }

    // 3. Sort
    result.sort((a, b) => {
      if (sortBy === 'updatedAt') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (sortBy === 'progress') {
        const percentA = a.totalPages > 0 ? a.currentPage / a.totalPages : 0;
        const percentB = b.totalPages > 0 ? b.currentPage / b.totalPages : 0;
        return percentB - percentA;
      }
      return 0;
    });

    return result;
  }, [books, statusFilter, localSearchQuery, sortBy]);

  // View switch: Render the immersive portal auth screen if unauthenticated
  if (!currentUser && showAuthScreen) {
    return (
      <AuthScreen
        onLogin={loginLocalUser}
        onRegister={registerLocalUser}
        isFirebaseConfigured={isFirebaseConfigured}
        onGoogleSignIn={async () => {
          const { auth: fbAuth, googleProvider: fbProvider, signInWithPopup: fbSignIn } = await import('./lib/firebase');
          if (!fbAuth || !fbProvider) return;
          try {
            await fbSignIn(fbAuth, fbProvider);
          } catch (e) {
            console.error("Google popup login failure:", e);
          }
        }}
        onSkipToSandbox={() => setShowAuthScreen(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-editorial-paper pb-24 text-editorial-ink antialiased font-serif flex flex-col">
      {/* Dynamic Header */}
      <Header
        currentUser={currentUser}
        isFirebaseConfigured={isFirebaseConfigured}
        onLogout={logoutUser}
        onAuthTrigger={() => setShowAuthScreen(true)}
      />

      <main className="max-w-6xl w-full mx-auto px-6 mt-8 flex-1 flex flex-col gap-8">
        
        {/* Dynamic Bento Box Metrics */}
        <BookStats books={books} />

        {/* Split Layout: Form & Catalog Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Input Form (Takes 4 columns on large screens) */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
            <BookForm
              onSubmit={handleFormSubmit}
              editingBook={editingBook}
              onCancelEdit={() => setEditingBook(null)}
              autofillData={autofillBook}
              onClearAutofill={() => setAutofillBook(null)}
            />
          </div>

          {/* Right Column: Catalog List (Takes remaining 7-8 columns) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            
            {/* Filters and Search Tools */}
            <div className="bg-editorial-bone/45 border border-editorial-ink/20 p-5 space-y-5">
              
              {/* Global search (Open Library) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <label className="text-[10px] font-sans font-black uppercase tracking-wider text-editorial-ink/65">
                    Search Open Library (Global database)
                  </label>
                  <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-editorial-ink/40">
                    Autofills Form
                  </span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-editorial-ink/45" />
                  <input
                    type="text"
                    placeholder="Search global title or author to autofill..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-sm pl-10 pr-4 py-3 bg-white border border-editorial-ink/15 focus:border-editorial-ink outline-none text-editorial-ink rounded-none"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-3.5 text-editorial-ink/45 hover:text-editorial-ink"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Open Library Search Suggestions */}
              {isSearchingOpenLibrary && (
                <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-editorial-ink/40 pl-1 py-1">
                  Searching Open Library Database...
                </div>
              )}

              {openLibraryResults.length > 0 && (
                <div className="bg-white border border-editorial-ink/15 p-4 space-y-3">
                  <span className="font-sans text-[9px] uppercase font-black tracking-widest text-editorial-ink/55 block border-b border-editorial-ink/10 pb-1.5 mb-2">
                    Found on Open Library (Click to Catalog)
                  </span>
                  <div className="divide-y divide-editorial-ink/10">
                    {openLibraryResults.map((result, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => handleAutofillSelect(result)}
                        className="py-2.5 flex gap-3 items-center hover:bg-editorial-bone/40 cursor-pointer transition-colors group"
                      >
                        {result.coverUrl ? (
                          <img src={result.coverUrl} alt={result.title} className="w-8 h-11 object-cover border border-editorial-ink/10 flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-11 bg-editorial-bone border border-editorial-ink/10 flex items-center justify-center flex-shrink-0">
                            <Library className="w-4 h-4 text-editorial-ink/20" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-serif font-black text-xs text-editorial-ink leading-tight group-hover:underline truncate">
                            {result.title}
                          </h4>
                          <p className="font-sans text-[9px] uppercase tracking-wider text-[#1a1a1a]/60 mt-0.5 truncate font-bold">
                            by {result.author}
                          </p>
                        </div>
                        <span className="font-sans text-[8px] uppercase tracking-widest font-black text-editorial-ink/40 group-hover:text-editorial-ink border border-editorial-ink/15 px-2 py-1 shrink-0 transition-colors">
                          Autofill +
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Separator */}
              <div className="border-t border-editorial-ink/10 my-1"></div>

              {/* Local search (User's shelf) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-sans font-black uppercase tracking-wider text-editorial-ink/65 block">
                  Search Your Shelf (Local collection)
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-editorial-ink/45" />
                  <input
                    type="text"
                    placeholder="Search title or author in your collection..."
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                    className="w-full text-sm pl-10 pr-4 py-3 bg-white border border-editorial-ink/15 focus:border-editorial-ink outline-none text-editorial-ink rounded-none"
                  />
                  {localSearchQuery && (
                    <button 
                      onClick={() => setLocalSearchQuery('')}
                      className="absolute right-3.5 top-3.5 text-editorial-ink/45 hover:text-editorial-ink"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filters and Sorters */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
                
                {/* Status chips */}
                <div className="flex flex-wrap gap-1.5">
                  {['all', 'want-to-read', 'reading', 'completed'].map((cf) => (
                    <button
                      key={cf}
                      onClick={() => setStatusFilter(cf)}
                      className={`text-[9px] font-sans font-black uppercase tracking-widest px-3.5 py-1.5 border transition-all ${
                        statusFilter === cf
                          ? 'bg-editorial-ink text-white border-editorial-ink'
                          : 'bg-white text-editorial-ink/50 border-editorial-ink/10 hover:border-editorial-ink/40'
                      }`}
                    >
                      {cf === 'all' 
                        ? 'All' 
                        : cf === 'want-to-read' 
                        ? 'Queue' 
                        : cf === 'reading' 
                        ? 'Reading' 
                        : 'Completed'}
                    </button>
                  ))}
                </div>

                {/* Sorters */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#1a1a1a]/50 shrink-0 inline-flex items-center gap-1">
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>Sort by:</span>
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-[10px] font-sans font-bold uppercase tracking-widest py-1.5 pl-3 pr-8 border border-editorial-ink/15 bg-white cursor-pointer text-editorial-ink focus:outline-none focus:border-editorial-ink rounded-none"
                  >
                    <option value="updatedAt">Last Updated</option>
                    <option value="title">Book Title</option>
                    <option value="rating">Top Rated</option>
                    <option value="progress">Most Progress</option>
                  </select>
                </div>

              </div>

            </div>

            {/* Catalog Grid */}
            {isLoading ? (
              <div id="loading" className="bg-editorial-bone/20 border border-editorial-ink/10 p-16 flex flex-col items-center justify-center text-center">
                <RefreshCw className="w-6 h-6 text-editorial-ink/65 animate-spin mb-4" />
                <p className="font-serif italic text-base text-editorial-ink">Updating bookshelf details...</p>
                <p className="font-sans text-[9px] uppercase tracking-widest text-[#1a1a1a]/40 mt-1.5">Retrieving synced database records</p>
              </div>
            ) : filteredSortedBooks.length > 0 ? (
              <div id="books-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredSortedBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onEdit={handleEditSelect}
                    onDelete={deleteBook}
                    onUpdateProgress={updateBook}
                  />
                ))}
              </div>
            ) : (
              <div id="empty-state" className="bg-white border border-editorial-ink/10 p-16 flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-editorial-bone border border-editorial-ink/10 mb-4 rounded-none">
                  <Library className="w-6 h-6 text-editorial-ink/60" />
                </div>
                <h3 className="font-serif font-black text-xl text-editorial-ink mb-1.5">
                  {localSearchQuery || statusFilter !== 'all' ? "No Matching Book Tracks" : "Your Shelf is Empty"}
                </h3>
                <p className="font-serif italic text-sm text-editorial-ink/60 max-w-sm leading-relaxed">
                  {localSearchQuery || statusFilter !== 'all' 
                    ? "Try adjusting your search keywords, clearing keywords, or switching filtering options above."
                    : "Track your novels, text books, or guides! Log details like ratings, page progress, and study diaries."}
                </p>
                {(localSearchQuery || statusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setLocalSearchQuery('');
                      setStatusFilter('all');
                    }}
                    className="mt-6 text-[10px] font-sans font-bold uppercase tracking-widest bg-editorial-ink text-white hover:bg-editorial-charcoal px-5 py-2.5 transition-colors"
                  >
                    Reset Search & Filters
                  </button>
                )}
              </div>
            )}

          </div>

        </div>

      </main>

      <footer className="mt-20 border-t border-editorial-ink/15 py-8 text-center text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#1a1a1a]/40">
        <p>© READARI DIGITAL ARCHIVE</p>
      </footer>
    </div>
  );
}
