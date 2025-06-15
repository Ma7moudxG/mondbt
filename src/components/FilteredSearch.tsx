// src/components/FilteredSearch.tsx

"use client";
import DataService from '@/services/dataService';
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface FilterValues {
  region: string;
  city: string;
  area: string; // Keep area in FilterValues
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
  const { t, i18n } = useTranslation();

  const [filters, setFilters] = useState<FilterValues>({
    region: '',
    city: '',
    area: '', // Initialize area filter
    schoolName: '',
    schoolType: '',
    ministryNumber: '',
    sex: '',
  });

  const [filterOptions, setFilterOptions] = useState({
    regions: [] as { region_id: number; name_en: string; name_ar: string }[],
    cities: [] as { city_id: number; name_en: string; name_ar: string; region_id: number }[],
    areas: [] as { area_id: number; city_id: number; name_en: string; name_ar: string; }[],
    schoolTypes: ['National', 'Global', 'Foreign', 'An international program for private schools', 'Egyptian Path', 'Sudanese path'],
    sexes: ['Male', 'Female']
  });

  useEffect(() => {
    setFilterOptions({
      regions: DataService.getAllRegions(),
      cities: DataService.getAllCities(),
      areas: DataService.getAllAreas(), // Assuming this fetches all areas
      schoolTypes: ['National', 'Global', 'Foreign', 'An international program for private schools', 'Egyptian Path', 'Sudanese path'],
      sexes: ['Male', 'Female']
    });
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;

    setFilters(prevFilters => {
      const newFilters = { ...prevFilters, [name]: value };

      // Reset city and area if region changes
      if (name === 'region') {
        newFilters.city = '';
        newFilters.area = '';
      }
      // Reset area if city changes
      if (name === 'city') {
        newFilters.area = '';
      }
      return newFilters;
    });
  }, []);

  useEffect(() => {
    onFilterChange?.(filters);
  }, [filters, onFilterChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit?.();
  };

  const getRegionIdFromName = (regionName: string) => {
    const region = filterOptions.regions.find(r =>
      i18n.language === 'ar' ? r.name_ar === regionName : r.name_en === regionName
    );
    return region ? region.region_id : null;
  };

  const getCityIdFromName = (cityName: string) => {
    const city = filterOptions.cities.find(c =>
      i18n.language === 'ar' ? c.name_ar === cityName : c.name_en === cityName
    );
    return city ? city.city_id : null;
  };

  // Memoized filtered cities based on selected region
  const filteredCities = React.useMemo(() => {
    const selectedRegionId = getRegionIdFromName(filters.region);
    return filters.region
      ? filterOptions.cities.filter(city => city.region_id === selectedRegionId)
      : filterOptions.cities;
  }, [filters.region, filterOptions.cities, i18n.language]);

  // Memoized filtered areas based on selected city
  const filteredAreas = React.useMemo(() => {
    const selectedCityId = getCityIdFromName(filters.city);
    return filters.city
      ? filterOptions.areas.filter(area => area.city_id === selectedCityId)
      : filterOptions.areas;
  }, [filters.city, filterOptions.areas, i18n.language]);


  return (
    <form onSubmit={handleSubmit} className="w-full bg-white p-6 rounded-2xl shadow-sm" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {/* Region Select */}
        <select
          className="p-2 text-[#777777] font-medium text-sm border rounded-lg focus:ring-2 focus:ring-[#5EB89D]"
          name="region"
          value={filters.region}
          onChange={handleChange}
        >
          <option value="">{t("Region")}</option>
          {filterOptions.regions.map(region => (
            <option key={region.region_id} value={i18n.language === 'ar' ? region.name_ar : region.name_en}>
              {i18n.language === 'ar' ? region.name_ar : region.name_en}
            </option>
          ))}
        </select>

        {/* City Select */}
        <select
          className="p-2 text-[#777777] font-medium text-sm border rounded-lg focus:ring-2 focus:ring-[#5EB89D]"
          name="city"
          value={filters.city}
          onChange={handleChange}
        >
          <option value="">{t("City")}</option>
          {filteredCities.map(city => ( // Use filteredCities
            <option key={city.city_id} value={i18n.language === 'ar' ? city.name_ar : city.name_en}>
              {i18n.language === 'ar' ? city.name_ar : city.name_en}
            </option>
          ))}
        </select>

        {/* Area Select - FIX APPLIED HERE */}
        <select
          className="p-2 text-[#777777] font-medium text-sm border rounded-lg focus:ring-2 focus:ring-[#5EB89D]"
          name="area"
          value={filters.area}
          onChange={handleChange}
        >
          <option value="">{t("Area")}</option>
          {filteredAreas.map(area => ( // Use filteredAreas and map 'area' properties
            <option key={area.area_id} value={i18n.language === 'ar' ? area.name_ar : area.name_en}>
              {i18n.language === 'ar' ? area.name_ar : area.name_en}
            </option>
          ))}
        </select>

        {/* Ministry Number Input */}
        <input
          type="text"
          className="p-2 text-[#777777] font-medium text-sm border rounded-lg focus:ring-2 focus:ring-[#5EB89D]"
          placeholder={t("Ministry Number")}
          name="ministryNumber"
          value={filters.ministryNumber}
          onChange={handleChange}
        />

        {/* School Type Select */}
        <select
          className="p-2 text-[#777777] font-medium border rounded-lg focus:ring-2 focus:ring-[#5EB89D]"
          name="schoolType"
          value={filters.schoolType}
          onChange={handleChange}
        >
          <option value="">{t("Type")}</option>
          {filterOptions.schoolTypes.map(type => (
            <option key={type} value={type}>{t(type)}</option>
          ))}
        </select>

        {/* Sex Select */}
        <select
          className="p-2 text-[#777777] font-medium text-sm border rounded-lg focus:ring-2 focus:ring-[#5EB89D]"
          name="sex"
          value={filters.sex}
          onChange={handleChange}
        >
          <option value="">{t("Sex")}</option>
          {filterOptions.sexes.map(sex => (
            <option key={sex} value={sex}>{t(sex)}</option>
          ))}
        </select>

        {/* School Name Input */}
        <input
          type="text"
          className="p-2 text-[#777777] font-medium text-sm border rounded-lg focus:ring-2 focus:ring-[#5EB89D]"
          placeholder={t("School Name")}
          name="schoolName"
          value={filters.schoolName}
          onChange={handleChange}
        />

        {/* Search Button */}
        <button
          type="submit"
          className="flex font-bold items-center justify-center gap-2 bg-[#5EB89D] hover:bg-[#4D9D85] text-white p-2 rounded-lg transition-colors"
        >
          {t("Search")}
        </button>
      </div>
    </form>
  );
};

export default FilteredSearch;