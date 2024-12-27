import { useState, useEffect, useCallback } from 'react';
import { Search, Scan } from 'lucide-react';
import { Button } from "@nextui-org/react";
import debounce from 'lodash/debounce';

export default function SearchBar({ onSearch, onScanClick, isSearching }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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
      }} className="flex items-center gap-2">
        <Button
          isIconOnly
          className="h-12 w-12 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 rounded-xl"
          onClick={onScanClick}
        >
          <Scan className="text-white h-5 w-5" />
        </Button>
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="search"
            className="w-full h-12 pl-12 pr-4 rounded-xl text-gray-900 bg-white/95 backdrop-blur-md border border-white/20 focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
            placeholder="Search queues or enter 6-digit code..."
            value={searchQuery}
            onChange={handleInputChange}
            autoComplete="off"
          />
          
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions?.length > 0 && (
            <div className="absolute w-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
                  onClick={() => handleSuggestionClick(suggestion.name)}
                >
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <div className="flex flex-col">
                      <span className="font-medium">{suggestion.name}</span>
                      <span className="text-xs text-gray-500">
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
          className="h-12 w-12 bg-white text-orange-500 hover:bg-orange-50 rounded-xl font-medium"
          disabled={isSearching}
        >
          {isSearching ? <div className="animate-spin">⌛</div> : <Search className="h-5 w-5" />}
        </Button>
      </form>
    </div>
  );
} 