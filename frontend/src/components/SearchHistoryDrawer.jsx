import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { X, History, TrendingUp, Search, RefreshCw } from 'lucide-react';

const SearchHistoryDrawer = ({ isOpen, onClose, onSelectQuery }) => {
  const [history, setHistory] = useState([]);
  const [topSearches, setTopSearches] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!isOpen) return;
    setLoading(true);
    try {
      const [historyRes, topRes] = await Promise.all([
        api.get('/api/analytics/search-history'),
        api.get('/api/analytics/top-searches')
      ]);
      setHistory(historyRes.data);
      setTopSearches(topRes.data);
    } catch (err) {
      console.error("Failed to fetch search history or top searches:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1A1040]/30 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#F0F4FF] flex items-center justify-between bg-[#F0F4FF]/50">
            <h2 className="font-heading text-lg font-bold text-[#1A1040] flex items-center gap-2">
              <History className="w-5 h-5 text-primary" /> Search Discovery Logs
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-surface text-textmuted hover:text-textprimary transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Contents */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* Top Global Searches Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#1A1040] uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-accent" /> Global Top 10 Searches
              </h3>
              
              {loading ? (
                <div className="flex justify-center py-4">
                  <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                </div>
              ) : topSearches.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {topSearches.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onSelectQuery(item.query);
                        onClose();
                      }}
                      className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-[#EEF2FF] hover:border-accent hover:bg-orange-50 text-textprimary transition-all"
                    >
                      <Search className="w-3 h-3 text-textmuted" />
                      <span>{item.query}</span>
                      <span className="bg-[#FF6B35]/15 text-[#FF6B35] px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                        {item.count}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-textmuted">No top search metrics aggregated yet.</p>
              )}
            </div>

            {/* Personal Past 50 Queries Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#1A1040] uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-primary" /> Your Recent Searches (Past 50)
              </h3>

              {loading ? (
                <div className="flex justify-center py-4">
                  <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                </div>
              ) : history.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {history.map((log) => (
                    <button
                      key={log.id}
                      onClick={() => {
                        onSelectQuery(log.query);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between text-left p-3 rounded-xl border border-[#EEF2FF] hover:border-primary/50 hover:bg-[#EEF2FF]/30 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-surface text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                          <Search className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#1A1040]">{log.query}</p>
                          <p className="text-[10px] text-textmuted">
                            {new Date(log.searched_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      
                      <span className="text-[10px] font-bold text-textmuted bg-surface px-2 py-0.5 rounded-md">
                        {log.results_count} results
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-textmuted">No recent queries. Start typing above to build history!</p>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#F0F4FF] bg-surface/50 text-center">
            <button
              onClick={() => {
                fetchData();
              }}
              className="text-xs font-semibold text-primary hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Force Refresh Logs
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SearchHistoryDrawer;
