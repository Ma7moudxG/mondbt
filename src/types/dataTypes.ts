// src/types/dataTypes.ts
export interface Region {
    region_id: number;
    name_en: string;
    name_ar: string;
  }
  
  export interface City {
    city_id: number;
    region_id: number;
    name_en: string;
    name_ar: string;
  }
  
  // Add other interfaces as needed