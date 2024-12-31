import { Button } from '@/components/common/Button/Button';
import type { FilterOptions } from '../../types';

interface FilterBarProps {
  filterOptions: FilterOptions;
  onFilterChange: (newOptions: FilterOptions) => void;
}

export const FilterBar = ({ filterOptions, onFilterChange }: FilterBarProps) => {
  return (
    <div className="flex gap-4 flex-wrap">
      <Button
        onClick={() => onFilterChange({
          ...filterOptions,
          showGradedOnly: !filterOptions.showGradedOnly
        })}
        variant={filterOptions.showGradedOnly ? 'primary' : 'secondary'}
      >
        {filterOptions.showGradedOnly ? 'Show All' : 'Show Graded Only'}
      </Button>
      
      <select
        value={filterOptions.sortBy}
        onChange={(e) => onFilterChange({
          ...filterOptions,
          sortBy: e.target.value as FilterOptions['sortBy']
        })}
        className="bg-transparent border border-gray-800 rounded-lg px-4 py-2 text-white"
      >
        <option value="due_date">Sort by Due Date</option>
        <option value="name">Sort by Name</option>
        <option value="grade">Sort by Grade</option>
      </select>

      <Button
        onClick={() => onFilterChange({
          ...filterOptions,
          sortDirection: filterOptions.sortDirection === 'asc' ? 'desc' : 'asc'
        })}
        variant="secondary"
      >
        {filterOptions.sortDirection === 'asc' ? '↑' : '↓'}
      </Button>
    </div>
  );
}; 