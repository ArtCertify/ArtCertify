import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

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
    <div className={`space-y-3 ${className}`}>
      {/* Compact Search and Filters Bar */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-700/50 border border-slate-600/50 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Compact Filters */}
          {(hasFilters || hasSorting) && (
            <div className="flex gap-2">
              {hasFilters && (
                <select
                  value={filterValue}
                  onChange={(e) => onFilterChange?.(e.target.value)}
                  className="bg-slate-700/50 border border-slate-600/50 rounded-md px-2 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm min-w-[120px]"
                >
                  {filterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {hasSorting && (
                <select
                  value={sortValue}
                  onChange={(e) => onSortChange?.(e.target.value)}
                  className="bg-slate-700/50 border border-slate-600/50 rounded-md px-2 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm min-w-[140px]"
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

      {/* Compact Results Count and Clear Filters */}
      {(resultCount !== undefined || hasActiveFilters) && (
        <div className="flex items-center justify-between">
          {resultCount !== undefined && (
            <p className="text-slate-400 text-xs">
              {resultCount} risultati
            </p>
          )}
          
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-blue-400 hover:text-blue-300 text-xs underline"
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