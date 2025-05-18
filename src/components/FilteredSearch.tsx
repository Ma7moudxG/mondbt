"use client";
import React, { useState, useEffect } from 'react';
// import { FiSearch } from 'react-icons/fi';

interface FilterValues {
  region: string;
  city: string;
  schoolName: string;
  schoolType: string;
  ministryNumber: string;
  sex: string;
}

interface FilteredSearchProps {
  onFilterChange?: (filters: FilterValues) => void;
  onSearchSubmit?: () => void;
}

const FilteredSearch: React.FC<FilteredSearchProps> = ({ onFilterChange, onSearchSubmit }) => {
  const [filters, setFilters] = useState<FilterValues>({
    region: '',
    city: '',
    schoolName: '',
    schoolType: '',
    ministryNumber: '',
    sex: '',
  });

  // Mock data - replace with API data
  const filterOptions = {
    regions: [
      'الحدود الشمالية',
      'الجوف',
      'تبوك',
      'حائل',
      'القصيم',
      'المدينة المنورة',
      'الرياض',
      'الشرقية',
      'عسير',
      'جازان',
      'نجران',
      'الباحة'
    ],
    cities: ['الرياض', 'جدة', 'مكة', 'الدمام', 'الخبر'],
    schoolTypes: ['حكومي', 'أهلي', 'دولي'],
    ministryNumbers: ['M12345', 'M67890', 'M11223', 'M44556'],
    sexes: ['طلاب', 'طالبات', 'مختلط']
  };

  useEffect(() => {
    onFilterChange?.(filters);
  }, [filters, onFilterChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit?.();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white p-6 rounded-2xl shadow-sm" dir="ltr">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {/* المنطقة (Region) */}
        <select
          className="p-2 text-[#777777] font-medium text-sm border rounded-lg focus:ring-2 focus:ring-[#5EB89D]"
          value={filters.region}
          onChange={(e) => setFilters({...filters, region: e.target.value})}
        >
          <option value="">Region</option>
          {filterOptions.regions.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>

        {/* المدينة (City) */}
        <select
          className="p-2 text-[#777777] font-medium text-sm border rounded-lg focus:ring-2 focus:ring-[#5EB89D]"
          value={filters.city}
          onChange={(e) => setFilters({...filters, city: e.target.value})}
        >
          <option value="">City</option>
          {filterOptions.cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        {/* الرقم الوزاري (Ministry Number) */}
        <select
          className="p-2 text-[#777777] font-medium text-sm border rounded-lg focus:ring-2 focus:ring-[#5EB89D]"
          value={filters.ministryNumber}
          onChange={(e) => setFilters({...filters, ministryNumber: e.target.value})}
        >
          <option value="">Ministry No.</option>
          {filterOptions.ministryNumbers.map(num => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>

        {/* النوع (Type) */}
        <select
          className="p-2 text-[#777777] font-medium border rounded-lg focus:ring-2 focus:ring-[#5EB89D]"
          value={filters.schoolType}
          onChange={(e) => setFilters({...filters, schoolType: e.target.value})}
        >
          <option value="">Type</option>
          {filterOptions.schoolTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        {/* الجنس (Sex) */}
        <select
          className="p-2 text-[#777777] font-medium text-sm border rounded-lg focus:ring-2 focus:ring-[#5EB89D]"
          value={filters.sex}
          onChange={(e) => setFilters({...filters, sex: e.target.value})}
        >
          <option value="">Sex</option>
          {filterOptions.sexes.map(sex => (
            <option key={sex} value={sex}>{sex}</option>
          ))}
        </select>

        {/* اسم المدرسة (School Name) */}
        <input
          type="text"
          className="p-2 text-[#777777] font-medium text-sm border rounded-lg focus:ring-2 focus:ring-[#5EB89D]"
          placeholder="School Name"
          value={filters.schoolName}
          onChange={(e) => setFilters({...filters, schoolName: e.target.value})}
        />

        {/* Search Button */}
        <button
          type="submit"
          className="flex font-bold items-center justify-center gap-2 bg-[#5EB89D] hover:bg-[#4D9D85] text-white p-2 rounded-lg transition-colors"
        >
          {/* <FiSearch /> */}
          Search
        </button>
      </div>
    </form>
  );
};

export default FilteredSearch;