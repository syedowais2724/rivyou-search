import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import SearchBar from '../components/SearchBar.jsx';
import CategoryFilter from '../components/CategoryFilter.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Pagination from '../components/Pagination.jsx';
import SearchHistoryDrawer from '../components/SearchHistoryDrawer.jsx';
import { Search as SearchIcon, LogOut, History, AlertTriangle, Layers, User } from 'lucide-react';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [suggestedQuery, setSuggestedQuery] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Sync params from URL
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page')) || 1;
  const categoryFilter = searchParams.get('category') || '';

  // Get current user info
  useEffect(() => {
    const savedUser = localStorage.getItem('rivyou_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const fetchResults = useCallback(async (searchQuery, currentPage, currentCategory) => {
    if (!searchQuery) {
      setResults([]);
      setTotalResults(0);
      setTotalPages(1);
      setSuggestedQuery(null);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get('/api/products/search', {
        params: {
          q: searchQuery,
          page: currentPage,
          limit: 20,
          category_filter: currentCategory || undefined
        }
      });
      setResults(response.data.results);
      setTotalResults(response.data.total_results);
      setTotalPages(response.data.total_pages);
      setSuggestedQuery(response.data.suggested_query);
    } catch (err) {
      console.error("Failed to fetch search results:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Run search query whenever q, page or category changes in URL
  useEffect(() => {
    fetchResults(query, page, categoryFilter);
  }, [query, page, categoryFilter, fetchResults]);

  // Handle new search query (reset page to 1)
  const handleSearch = useCallback((newQuery) => {
    const params = {};
    if (newQuery) {
      params.q = newQuery;
      params.page = '1';
      if (categoryFilter) {
        params.category = categoryFilter;
      }
    }
    setSearchParams(params);
  }, [categoryFilter, setSearchParams]);

  // Handle category change (reset page to 1)
  const handleCategoryChange = useCallback((newCategory) => {
    const params = {};
    if (query) {
      params.q = query;
      params.page = '1';
    }
    if (newCategory) {
      params.category = newCategory;
    }
    setSearchParams(params);
  }, [query, setSearchParams]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    const params = { q: query, page: String(newPage) };
    if (categoryFilter) {
      params.category = categoryFilter;
    }
    setSearchParams(params);
  }, [query, categoryFilter, setSearchParams]);

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('rivyou_refresh');
      if (refresh) {
        await api.post('/api/auth/logout', { refresh });
      }
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem('rivyou_token');
      localStorage.removeItem('rivyou_refresh');
      localStorage.removeItem('rivyou_user');
      window.location.href = '/auth';
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4FF] pb-16 font-sans">
      
      {/* Top Navbar */}
      <nav className="bg-white border-b border-[#EEF2FF] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleSearch('')}>
            <div className="w-9 h-9 rounded-lg bg-[#5B4FE8] flex items-center justify-center shadow-md shadow-primary/20">
              <SearchIcon className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <span className="font-heading text-xl font-bold tracking-tight text-[#1A1040]">Rivyou</span>
          </div>

          {/* Nav Controls */}
          <div className="flex items-center gap-4">
            {/* User Profile Avatar */}
            {user && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-[#EEF2FF]">
                <User className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-[#1A1040]">{user.username}</span>
              </div>
            )}

            {/* History drawer button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2.5 rounded-xl border border-[#EEF2FF] text-textprimary hover:bg-[#EEF2FF]/50 transition-all flex items-center gap-1.5 text-xs font-bold"
              title="Search logs & Analytics"
            >
              <History className="w-4 h-4 text-primary" />
              <span className="hidden sm:inline">Discovery Logs</span>
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl border border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 transition-all flex items-center gap-1.5 text-xs font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Search Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Centered Heading */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="font-heading text-3xl font-extrabold text-[#1A1040] sm:text-4xl tracking-tight">
            Find Your Match
          </h2>
          <p className="text-textmuted mt-2.5 text-sm">
            Search with typo-tolerance to matching category contexts, tags and exact specifications.
          </p>
        </div>

        {/* Search Input Bar */}
        <SearchBar onSearch={handleSearch} initialValue={query} loading={loading} />

        {/* Category Filter Options */}
        {query && (
          <CategoryFilter activeCategory={categoryFilter} onCategoryChange={handleCategoryChange} />
        )}

        {/* Typo Correction Display */}
        {query && suggestedQuery && (
          <div className="max-w-2xl mx-auto mb-6 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2 text-xs text-blue-700">
            <AlertTriangle className="w-4 h-4 text-blue-500 shrink-0" />
            <span>
              Showing results for <span className="font-bold underline cursor-pointer" onClick={() => handleSearch(suggestedQuery)}>{suggestedQuery}</span> instead of <span className="font-semibold italic text-textmuted">"{query}"</span>.
            </span>
          </div>
        )}

        {/* Search Results Display Area */}
        {!query ? (
          /* Empty Search Dashboard State */
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg shadow-primary/5 mx-auto mb-6">
              <SearchIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-heading text-xl font-bold text-[#1A1040]">Search Portal Active</h3>
            <p className="text-textmuted text-sm mt-2">
              Type above to discover matching smartphones, chargers, or protective cases.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button onClick={() => handleSearch('smartphone')} className="px-3 py-1.5 rounded-lg bg-white border border-[#EEF2FF] text-xs font-semibold text-[#5B4FE8] hover:border-primary/50 transition-all">"smartphne"</button>
              <button onClick={() => handleSearch('charger')} className="px-3 py-1.5 rounded-lg bg-white border border-[#EEF2FF] text-xs font-semibold text-[#5B4FE8] hover:border-primary/50 transition-all">"charger"</button>
              <button onClick={() => handleSearch('protective')} className="px-3 py-1.5 rounded-lg bg-white border border-[#EEF2FF] text-xs font-semibold text-[#5B4FE8] hover:border-primary/50 transition-all">"protective"</button>
            </div>
          </div>
        ) : loading ? (
          /* Card Loading Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-[#EEF2FF] rounded-2xl p-6 space-y-4">
                <div className="flex justify-between">
                  <div className="w-20 h-4 rounded bg-[#EEF2FF] shimmer"></div>
                  <div className="w-24 h-5 rounded-full bg-[#EEF2FF] shimmer"></div>
                </div>
                <div className="w-3/4 h-6 rounded bg-[#EEF2FF] shimmer"></div>
                <div className="flex gap-2">
                  <div className="w-12 h-5 rounded bg-[#EEF2FF] shimmer"></div>
                  <div className="w-16 h-5 rounded bg-[#EEF2FF] shimmer"></div>
                  <div className="w-14 h-5 rounded bg-[#EEF2FF] shimmer"></div>
                </div>
                <div className="space-y-2 pt-4">
                  <div className="flex justify-between">
                    <div className="w-24 h-3 bg-[#EEF2FF] shimmer"></div>
                    <div className="w-8 h-3 bg-[#EEF2FF] shimmer"></div>
                  </div>
                  <div className="w-full bg-[#EEF2FF] h-1.5 rounded-full shimmer"></div>
                </div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          /* Cards Grid list */
          <>
            <div className="flex items-center justify-between text-xs text-textmuted mb-4 mt-6">
              <span>Found <span className="font-bold text-[#1A1040]">{totalResults}</span> matches</span>
              <span>Page {page} of {totalPages}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          /* Search Empty state */
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-[#FF6B35] flex items-center justify-center mx-auto mb-6">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="font-heading text-xl font-bold text-[#1A1040]">No matches found</h3>
            <p className="text-textmuted text-sm mt-2">
              We couldn't find any results matching "{query}". Try checking your spelling or search terms.
            </p>
            {suggestedQuery && (
              <button
                onClick={() => handleSearch(suggestedQuery)}
                className="mt-6 bg-[#5B4FE8] hover:bg-[#4639D2] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/10"
              >
                Search instead for "{suggestedQuery}"
              </button>
            )}
          </div>
        )}

      </div>

      {/* Slide-in History drawer */}
      <SearchHistoryDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSelectQuery={handleSearch}
      />

    </div>
  );
};

export default Search;
