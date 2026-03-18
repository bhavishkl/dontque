import { useState, useEffect, useCallback } from 'react';
import { Search, Scan } from 'lucide-react';
import { Button } from "@nextui-org/react";
import debounce from 'lodash/debounce';
import { useRouter } from 'next/navigation';

export default function SearchBar({ onSearch, onScanClick, isSearching }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();

  const debouncedFetch = useCallback(
    debounce(async (query) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const storedLocation = sessionStorage.getItem('userLocation');
        const userCity = storedLocation ? JSON.parse(storedLocation).city : '';
        
        const response = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(query)}&city=${encodeURIComponent(userCity || '')}`
        );
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    }, 300),
    []
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedFetch(value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      debouncedFetch(searchQuery);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, debouncedFetch]);

  return (
    <div className="search-container relative">
      <form onSubmit={(e) => {
        e.preventDefault();
        onSearch(searchQuery);
        setShowSuggestions(false);
      }} className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-5 z-10">
              <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="search"
              className="w-full h-14 pl-12 pr-4 rounded-[2rem] text-gray-900 bg-white/90 backdrop-blur-xl border border-white/40 transition-all shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.2),inset_2px_2px_6px_rgba(255,255,255,1),inset_-2px_-2px_6px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-white/50 dark:bg-gray-800/90 dark:text-white dark:border-gray-700/50 dark:shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(255,255,255,0.05),inset_2px_2px_6px_rgba(255,255,255,0.1),inset_-2px_-2px_6px_rgba(0,0,0,0.2)]"
              placeholder="Search queues or enter 6-digit code..."
              value={searchQuery}
              onChange={handleInputChange}
              autoComplete="off"
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions?.length > 0 && (
              <div className="absolute w-full mt-2 bg-white/95 backdrop-blur-xl dark:bg-gray-800/95 rounded-[1.5rem] shadow-[8px_8px_20px_rgba(0,0,0,0.15),-8px_-8px_20px_rgba(255,255,255,0.1)] border border-white/50 dark:border-gray-700/50 z-50 max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full px-5 py-3 text-left hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors first:rounded-t-[1.5rem] last:rounded-b-[1.5rem]"
                    onClick={() => handleSuggestionClick(suggestion.name)}
                  >
                    <div className="flex items-center gap-3">
                      <Search className="h-4 w-4 text-gray-400" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{suggestion.name}</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {suggestion.category} • {suggestion.location}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            type="submit"
            isIconOnly
            className="h-14 w-14 bg-white/90 text-orange-500 rounded-[1.5rem] font-bold shadow-[6px_6px_12px_rgba(0,0,0,0.1),-6px_-6px_12px_rgba(255,255,255,0.2),inset_2px_2px_4px_rgba(255,255,255,1),inset_-2px_-2px_4px_rgba(0,0,0,0.05)] hover:bg-white active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,1)] transition-all dark:bg-gray-800/90 dark:text-orange-400 dark:shadow-[6px_6px_12px_rgba(0,0,0,0.3),-6px_-6px_12px_rgba(255,255,255,0.05),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.2)]"
            disabled={isSearching}
          >
            {isSearching ? <div className="animate-spin">⌛</div> : <Search className="h-5 w-5" />}
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            className="flex-1 h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-[1.5rem] text-white font-semibold shadow-[4px_4px_10px_rgba(0,0,0,0.1),-4px_-4px_10px_rgba(255,255,255,0.1),inset_2px_2px_4px_rgba(255,255,255,0.3),inset_-2px_-2px_4px_rgba(0,0,0,0.05)] hover:bg-white/30 active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.1)] transition-all dark:bg-gray-800/40 dark:border-gray-700/50"
            onClick={() => router.push('/scan')}
          >
            <Scan className="text-white h-5 w-5 mr-2" />
            Scan QR
          </Button>
          <Button
            className="flex-1 h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-[1.5rem] text-white font-semibold shadow-[4px_4px_10px_rgba(0,0,0,0.1),-4px_-4px_10px_rgba(255,255,255,0.1),inset_2px_2px_4px_rgba(255,255,255,0.3),inset_-2px_-2px_4px_rgba(0,0,0,0.05)] hover:bg-white/30 active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.1)] transition-all dark:bg-gray-800/40 dark:border-gray-700/50"
            onClick={() => router.push('/user/queues')}
          >
            View All
          </Button>
        </div>
      </form>
    </div>
  );
} 