import React from 'react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface FilterOption {
  value: string;
  label: string;
}

interface SortOption {
  value: string;
  label: string;
}

interface SearchAndFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  sortValue?: string;
  onSortChange?: (value: string) => void;
  sortOptions?: SortOption[];
  resultCount?: number;
  onClearFilters?: () => void;
  showClearFilters?: boolean;
  className?: string;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Cerca...',
  filterValue,
  onFilterChange,
  filterOptions = [],
  sortValue,
  onSortChange,
  sortOptions = [],
  resultCount,
  onClearFilters,
  showClearFilters = false,
  className = ''
}) => {
  const hasFilters = filterOptions.length > 0;
  const hasSorting = sortOptions.length > 0;
  const hasActiveFilters = showClearFilters && (searchValue || (filterValue && filterValue !== 'all'));

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filters Bar */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          {(hasFilters || hasSorting) && (
            <div className="flex gap-4">
              {hasFilters && (
                <div className="flex items-center gap-2">
                  <FunnelIcon className="h-5 w-5 text-slate-400" />
                  <select
                    value={filterValue}
                    onChange={(e) => onFilterChange?.(e.target.value)}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {filterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {hasSorting && (
                <select
                  value={sortValue}
                  onChange={(e) => onSortChange?.(e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results Count and Clear Filters */}
      {(resultCount !== undefined || hasActiveFilters) && (
        <div className="flex items-center justify-between">
          {resultCount !== undefined && (
            <p className="text-slate-400 text-sm">
              {resultCount} risultati trovati
            </p>
          )}
          
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-blue-400 hover:text-blue-300 text-sm underline"
            >
              Cancella filtri
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter; 