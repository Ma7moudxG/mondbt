declare module '@/data/merged_school_data.json' {
    interface Region {
      region_id: number;
      name_en: string;
      name_ar: string;
    }
  
    interface SchoolStudent {
      school_id: number;
      student_id: number;
    }
    
    interface Excuses {
      school_id: number;
      student_id: number;
    }
  
    const data: {
      regions: Region[];
      cities: any[];
      areas: any[];
      schools: any[];
      students: any[];
      attendance: any[];
      parents: any[];
      parent_students: any[];
      absences: any[];
      penalties: any[];
      rewards: any[];
      school_students: SchoolStudent[];
      excuses: any[]; // Add this if exists
    };
    
    export default data;
  }