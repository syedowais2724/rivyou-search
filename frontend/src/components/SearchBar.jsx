import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader } from 'lucide-react';

const SearchBar = ({ onSearch, initialValue = '', loading = false }) => {
  const [query, setQuery] = useState(initialValue);
  const isFirstRender = useRef(true);

  // Sync with initial value from URL
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Debounce search query
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const handler = setTimeout(() => {
      onSearch(query);
    }, 400); // 400ms debounce as requested

    return () => {
      clearTimeout(handler);
    };
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        {/* Search Icon */}
        <Search className="absolute left-5 w-5 h-5 text-textmuted" />

        {/* Input Field */}
        <input
          type="text"
          aria-label="Search products"
          placeholder="Search for category, tag, or keyword..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-14 pr-12 py-4 bg-white border border-[#EEF2FF] rounded-full focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-[#1A1040] font-medium shadow-md shadow-primary/5 placeholder-textmuted text-base transition-all"
        />

        {/* Action icons (clear/loading spinner) */}
        <div className="absolute right-5 flex items-center gap-2">
          {loading ? (
            <Loader className="w-5 h-5 text-primary animate-spin" />
          ) : (
            query && (
              <button
                onClick={handleClear}
                className="p-1 rounded-full hover:bg-surface text-textmuted hover:text-textprimary transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
