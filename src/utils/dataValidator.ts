import schoolData from '@/data/merged_school_data.json';

export function validateDataStructure() {
    console.group('Data Structure Validation');
    
    // Check regions
    console.log('Regions:', schoolData.regions?.length || 'Missing regions');
    
    // Check student-school-city-region linkage
    const sampleStudent = schoolData.students[0];
    if (sampleStudent) {
      const school = schoolData.schools.find(s => s.school_id === sampleStudent.school_id);
      const city = schoolData.cities.find(c => c.city_id === school?.city_id);
      const region = schoolData.regions.find(r => r.region_id === city?.region_id);
      
      console.log('Sample student linkage:', {
        student: sampleStudent.student_id,
        school: school?.school_id,
        city: city?.city_id,
        region: region?.region_id
      });
    }
    
    // Check date formats
    const sampleAbsence = schoolData.absences[0];
    if (sampleAbsence) {
      console.log('Sample absence date:', sampleAbsence.date_g, 
                  'Parsed:', new Date(sampleAbsence.date_g));
    }
    
    console.groupEnd();
  }
  
  // Call in MinisterPage.tsx useEffect
  validateDataStructure();