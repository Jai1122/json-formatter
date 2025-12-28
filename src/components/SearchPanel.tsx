import React, { useState } from 'react';

interface SearchPanelProps {
  onSearch: (query: string) => void;
  resultCount?: number;
}

const SearchPanel: React.FC<SearchPanelProps> = ({ onSearch, resultCount }) => {
  const [query, setQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsVisible(false);
      handleClear();
    }
  };

  // Listen for Ctrl+F / Cmd+F globally
  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setIsVisible(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium transition-colors"
        title="Search (Cmd+F)"
      >
        🔍 Search
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4 w-80">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-semibold text-sm">Search JSON</h3>
        <button
          onClick={() => {
            setIsVisible(false);
            handleClear();
          }}
          className="text-gray-400 hover:text-white text-lg leading-none"
        >
          ×
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search keys and values..."
          className="w-full bg-gray-900 text-white border border-gray-600 rounded px-3 py-2 pr-20 text-sm focus:outline-none focus:border-blue-500"
          autoFocus
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm"
          >
            Clear
          </button>
        )}
      </div>

      {query && resultCount !== undefined && (
        <div className="mt-2 text-xs text-gray-400">
          {resultCount} {resultCount === 1 ? 'match' : 'matches'} found
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        Press <kbd className="px-1 py-0.5 bg-gray-700 rounded">Esc</kbd> to close
      </div>
    </div>
  );
};

export default SearchPanel;
