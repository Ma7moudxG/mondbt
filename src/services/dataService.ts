import moment from "moment";
import "moment-hijri";
// src/services/dataService.ts
// --- Interfaces (Copied directly from your last provided code) ---
export interface Region {
  region_id: number;
  name_en: string;
  name_ar: string;
  hasc_code?: string;
}

export interface City {
  city_id: number;
  region_id: number;
  name_en: string;
  name_ar: string;
}

export interface Area {
  area_id: number;
  city_id: number;
  name_en: string;
  name_ar: string;
}

export interface EducationType {
  education_type_id: number;
  description_en: string;
  description_ar: string;
}

export interface Parent {
  parent_id: number;
  first_name_en: string;
  first_name_ar: string;
  last_name_en: string;
  last_name_ar: string;
  email?: string;
  phone: number;
  poi_number?: number;
  identity_type?: string;
  gender?: string;
}

export interface ParentStudentRel {
  parent_id: number;
  student_id: number;
  relationship_en: string;
  relationship_ar: string;
}

export interface PenaltyType {
  penalty_type_id: number;
  code_en: string;
  description_en: string;
  description_ar: string;
}

export interface ParentPenalty {
  penalty_id: number;
  parent_id: number;
  student_id: number;
  penalty_type_id: number;
  penalty_date_g: string;
  penalty_date_h: string;
  amount_due: number;
  month_number?: number;
  year?: number;
  issued_at?: string;
  paid?: string;
  description?: string;
}

export interface RewardType {
  reward_type_id: number;
  description_en: string;
  description_ar: string;
}

export interface Reward {
  sid: number;
  student_id: number;
  reward_type_id: number;
  month_number: number;
  month: string;
  year: number;
  issued_at: string;
  performance_percentage?: string;
  description?: string;
}

export interface School {
  school_id: number;
  region_id: number;
  city_id: number;
  area_id: number;
  education_type_id: number;
  name_en: string;
  name_ar: string;
  educational_level_en: string;
  educational_level_ar: string;
  ministerial_number: number; // Added
  type_en: string; // Added (e.g., "Female", "Male")
  type_ar: string;
  address_en: string;
  address_ar: string;
  latitude: number;
  longitude: number;
}

export interface Student {
  student_id: number;
  school_id: number;
  class_en: string;
  class_ar: string;
  first_name_en: string;
  last_name_en: string;
  first_name_ar: string;
  last_name_ar: string;
  date_of_birth: string;
  date_of_birth_hijri?: string;
  gender: string; // Added
  registration_no?: string;
  poi_number?: number;
  identity_type?: string;
  image_url?: string;
}

export interface Absence {
  absence_id: number;
  student_id: number;
  date_g: string;
  date_h: string;
  created_at: string;
}

export interface AttendanceRecord {
  attendance_id: number;
  student_id: number;
  date_g: string;
  date_h: string;
  check_in_time?: string;
  check_out_time?: string;
  status: "IN_TIME" | "VIOLATION" | "late" | string;
}

export interface Excuse {
  id: number;
  student_id: number;
  reason_id: number;
  description: string;
  excuse_date_g: string;
  excuse_date_h: string;
  excuse_status: string;
  submitted_at: string;
  remarks_en: string;
  remarks_ar: string;
  status_en: string;
  status_ar: string;
}

export interface ExcuseAttachment {
  uploaded_at: string;
  excuse_id: number;
  file_url: string;
}

export interface ExcuseReason {
  id: string;
  reason_id: number;
  code: string;
  description_en: string;
  description_ar: string;
}

export interface GenericJsonDataItem {
  [key: string]: any;
}

export interface CalculatedStatistics {
  attendance: number;
  absence: number;
  late: number;
}

// --- Merged School Data Interface ---
export interface MergedSchoolData {
  areas: Area[];
  cities: City[];
  educationTypes: EducationType[];
  excuses: Excuse[];
  excuseAttachments: ExcuseAttachment[];
  excuseReasons: ExcuseReason[];
  genericJsonData: GenericJsonDataItem[];
  parents: Parent[];
  penalties: ParentPenalty[];
  parent_students: ParentStudentRel[];
  penaltyTypes: PenaltyType[];
  regions: Region[];
  rewardTypes: RewardType[];
  schools: School[];
  students: Student[];
  absences: Absence[];
  attendance: AttendanceRecord[];
  rewards: Reward[];
  [key: string]: any;
}

// --- Data Import (Crucial for data access) ---
import schoolDataJson from "@/data/merged_school_data.json";
const schoolData: MergedSchoolData = schoolDataJson as MergedSchoolData;

import initialSchoolData from "@/data/merged_school_data.json";
import i18n from "@/lib/i18n";

const JSON_SERVER_BASE_URL = "http://localhost:3001"; // Your JSON Server URL

// Load data from localStorage or use initial data
const loadSchoolData = (): MergedSchoolData => {
  if (typeof window !== "undefined") {
    const storedData = localStorage.getItem("schoolDataJson");
    if (storedData) {
      return JSON.parse(storedData) as MergedSchoolData;
    }
  }
  return initialSchoolData as MergedSchoolData;
};

let schoolDataJson1: MergedSchoolData = loadSchoolData();

console.log(
  "DataService: Initial schoolData.students loaded:",
  schoolData.students.length,
  "students."
);
// Log a sample student to verify its structure and content
if (schoolData.students.length > 0) {
  console.log("DataService: Sample student:", schoolData.students[0]);
}
// --- Other Utility and Data Service Interfaces ---
export interface RegionStats {
  attendance: number;
  absence: number;
  late: number;
  penalties: number;
  rewards: number;
  totalStudentsInRegion: number;
}

export interface Stats {
  attendance: number;
  absence: number;
  late: number;
  // excuses: number;
  fines: number;
}

export type SchoolType = "Male" | "Female";
export type EducationalLevel = "Primary" | "Intermediate" | "Secondary";

export interface FilterValues {
  region: string;
  city: string;
  area: string;
  schoolName: string;
  schoolType: string;
  ministryNumber: string;
  sex: string;
}

export interface StudentDetails {
  student: Student;
  school?: School;
  parent?: Parent;
  attendanceSummary?: {
    attendanceRate: number;
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
  };
  excuses: Excuse[];
  penalties: ParentPenalty[];
  rewards: Reward[];
}

/**
 * Maps a school type name (e.g., "National") to an array of corresponding education_type_ids.
 * Returns an array of IDs because some names might map to multiple IDs (like "National").
 */
const mapSchoolTypeNameToIds = (typeName: string): number[] => {
  if (!typeName || typeName.trim() === "") return [];
  const normalizedTypeName = typeName.trim().toLowerCase();
  return schoolData.educationTypes
    .filter((et) => et.description_en.toLowerCase() === normalizedTypeName)
    .map((et) => et.education_type_id);
};

// --- DataService Class (FIXED FUNCTIONS with Debugging) ---
export default class DataService {
  static getSchoolData(): MergedSchoolData {
    return schoolDataJson1;
  }

  // --- Methods now fetching from JSON Server ---

  static async getExcuseDescriptionById(
    excuseId: string,
    lang: string = "en"
  ): Promise<string | null> {
    const excuse = await this.getExcuseDetailsById(excuseId); // Reuse getExcuseDetailsById
    if (!excuse) return null;
    const reason = await this.getExcuseReasonById(excuse.id.toLocaleString());
    console.log("resssssssssssssssssssssssssssss11reason", excuse);
    return reason
      ? lang === "ar"
        ? reason.description_ar
        : reason.description_en
      : null;
  }

  static async getExcuseAttachmentById(
    excuseId: string
  ): Promise<string | null> {
    const response = await fetch(
      `${JSON_SERVER_BASE_URL}/excuseAttachments?excuse_id=${excuseId}`
    );
    if (!response.ok) throw new Error("Failed to fetch excuse attachments");
    const attachments: ExcuseAttachment[] = await response.json();
    return attachments.length > 0 ? attachments[0].file_url : null;
  }

  static async getExcuseReasons(): Promise<ExcuseReason[]> {
    try {
      const response = await fetch(`${JSON_SERVER_BASE_URL}/excuseReasons`);
      if (!response.ok) throw new Error("Failed to fetch excuse reasons");
      return response.json();
    } catch (error) {
      console.error("Error fetching excuse reasons:", error);
      return [];
    }
  }

  static async getExcuseReasonById(
    reasonId: string
  ): Promise<ExcuseReason | null> {
    // reasonId now string
    try {
      const response = await fetch(
        `${JSON_SERVER_BASE_URL}/excuseReasons/${reasonId}`
      );
      // console.log("resssssssssssssssssssssssssssssresponse.json", response.json())

      if (response.status === 404) return null;
      if (!response.ok) throw new Error("Failed to fetch excuse reason");
      const reason: ExcuseReason = await response.json();
      // console.log("resssssssssssssssssssssssssssss", reasonId);

      return reason;
    } catch (error) {
      console.error(`Error fetching excuse reason by ID ${reasonId}:`, error);
      return null;
    }
  }

  static async getExcusesForStudent(
    studentId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<Excuse[]> {
    // Changed return type to Promise<Excuse[]>

    try {
      // console.log(
      //   `DataService: Attempting to fetch excuses for student ID: ${studentId}`
      // );

      // Construct the URL. JSON Server supports filtering by a property.
      // E.g., /excuses?student_id=1 will return all excuses for student 1.
      const url = new URL(`${JSON_SERVER_BASE_URL}/excuses`);
      url.searchParams.append("student_id", String(studentId)); // Append studentId as a query param

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Details: ${errorText}`
        );
      }

      let studentExcuses: Excuse[] = await response.json();

      // If date range filters are provided, apply them client-side
      if (startDate && endDate) {
        studentExcuses = studentExcuses.filter((excuse) => {
          // Ensure excuse.excuse_date_g exists before parsing
          if (!excuse.excuse_date_g) return false;

          // Use your existing utility to check if the date is in range
          // Make sure this.isDateInRange is a static method in DataService or a global utility
          return DataService.isDateInRange(
            excuse.excuse_date_g,
            startDate,
            endDate
          );
        });
      }

      console.log(
        `DataService: Successfully fetched ${studentExcuses.length} excuses for student ID ${studentId}.`
      );
      return studentExcuses;
    } catch (error) {
      console.error(
        `DataService: Error getting excuses for student ID ${studentId}:`,
        error
      );
      return []; // Return an empty array on error
    }
  }

  static async getExcusesForStudents(studentIds: number[]): Promise<Excuse[]> {
    try {
      console.log(
        `DataService: Attempting to fetch all excuses to filter for student IDs: ${studentIds.join(
          ", "
        )}`
      );

      // Fetch ALL excuses from JSON Server
      const response = await fetch(`${JSON_SERVER_BASE_URL}/excuses`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Details: ${errorText}`
        );
      }

      const allExcuses: Excuse[] = await response.json();

      // Filter the fetched excuses locally based on the provided studentIds
      const filteredExcuses = allExcuses.filter((excuse) =>
        // Ensure student_id is a number before checking inclusion
        studentIds.includes(Number(excuse.student_id))
      );

      console.log(
        `DataService: Successfully fetched and filtered excuses. Found ${filteredExcuses.length} matching excuses for the given student IDs.`
      );
      return filteredExcuses;
    } catch (error) {
      console.error(`DataService: Error getting excuses for students:`, error);
      return []; // Return an empty array on error
    }
  }
  static async getExcuses(): Promise<Excuse[]> {
    try {
      // Fetch ALL excuses from JSON Server
      const response = await fetch(`${JSON_SERVER_BASE_URL}/excuses`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Details: ${errorText}`
        );
      }

      const allExcuses: Excuse[] = await response.json();
      const filteredExcuses = allExcuses.filter(
        (excuse) =>
          // Ensure student_id is a number before checking inclusion
          excuse.status_en === "PENDING"
      );

      console.log(
        `DataService: Successfully fetched and filtered excuses. Found ${filteredExcuses.length} matching excuses for the given student IDs.`
      );
      return filteredExcuses;
    } catch (error) {
      console.error(`DataService: Error getting excuses for students:`, error);
      return []; // Return an empty array on error
    }
  }

  static async createExcuse(
    parentId: number,
    studentId: number,
    reasonId: number, // <<< Expecting a NUMBER here from the page component
    remarks: string,
    attachmentFile: File | undefined,
    excuseDateG: string,
    excuseDateH: string
  ): Promise<{ newExcuse: Excuse; newAttachment?: ExcuseAttachment }> {
    const now = new Date();
    // Format to 'YYYY-MM-DD HH:mm:ss' which is common for timestamps
    const submittedAt = moment(now).format("YYYY-MM-DD HH:mm:ss");

    const newExcuseData = {
      // DO NOT include 'id' here. Let JSON Server generate the 'id'.
      student_id: studentId,
      parent_id: parentId,
      reason_id: reasonId, // <<< This reasonId (which is a number) will be sent to JSON Server
      excuse_date_g: excuseDateG,
      excuse_date_h: excuseDateH,
      submitted_at: submittedAt,
      remarks_en: remarks, // Use the remarks state directly
      remarks_ar: remarks, // Assuming remarks is general, or you could add a separate ar state
      status_en: "PENDING",
      status_ar: "قيد المراجعة",
    };

    console.log("Attempting to post new excuse to JSON Server:", newExcuseData);
    const excuseResponse = await fetch(`${JSON_SERVER_BASE_URL}/excuses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newExcuseData),
    });

    if (!excuseResponse.ok) {
      const errorText = await excuseResponse.text();
      console.error("JSON Server excuse creation error response:", errorText);
      throw new Error(
        `Failed to create excuse: ${excuseResponse.statusText} - ${errorText}`
      );
    }
    const newExcuse: Excuse = await excuseResponse.json();
    console.log("Excuse created successfully by JSON Server:", newExcuse);

    let newAttachment: ExcuseAttachment | undefined;
    if (attachmentFile) {
      const fileUrl = `uploads/${attachmentFile.name}`; // This is a mock path, real upload needs backend

      const newAttachmentData = {
        excuse_id: newExcuse.id, // Use the ID generated by JSON Server for the excuse
        file_url: fileUrl,
        uploaded_at: submittedAt,
      };

      console.log(
        "Attempting to post new attachment to JSON Server:",
        newAttachmentData
      );
      const attachmentResponse = await fetch(
        `${JSON_SERVER_BASE_URL}/excuseAttachments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAttachmentData),
        }
      );

      if (!attachmentResponse.ok) {
        const errorText = await attachmentResponse.text();
        console.error(
          "JSON Server attachment creation error response:",
          errorText
        );
        throw new Error(
          `Failed to create attachment: ${attachmentResponse.statusText} - ${errorText}`
        );
      }
      newAttachment = await attachmentResponse.json();
      console.log(
        "Attachment created successfully by JSON Server:",
        newAttachment
      );
    }

    return { newExcuse, newAttachment };
  }

  static async getRewardsForStudent(
    studentId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<Reward[]> {
    // Changed return type to Promise<Excuse[]>

    try {
      const url = new URL(`${JSON_SERVER_BASE_URL}/rewards`);
      url.searchParams.append("student_id", String(studentId)); // Append studentId as a query param

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Details: ${errorText}`
        );
      }

      let studentRewards: Reward[] = await response.json();

      return studentRewards;
    } catch (error) {
      console.error(
        `DataService: Error getting excuses for student ID ${studentId}:`,
        error
      );
      return []; // Return an empty array on error
    }
  }

  static async updateExcuseStatus(
    excuseId: string,
    statusEn: "PENDING" | "APPROVED" | "REJECTED",
    statusAr: "قيد المراجعة" | "مصدق" | "مرفوض"
  ): Promise<Excuse> {
    const updateData = {
      status_en: statusEn,
      status_ar: statusAr,
    };

    console.log(
      `Attempting to update excuse ${excuseId} status to:`,
      updateData
    );

    // Using PATCH to update only specific fields
    const response = await fetch(
      `${JSON_SERVER_BASE_URL}/excuses/${excuseId}`,
      {
        method: "PATCH", // Use PATCH to update only the specified fields
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "JSON Server excuse status update error response:",
        errorText
      );
      throw new Error(
        `Failed to update excuse status: ${response.statusText} - ${errorText}`
      );
    }

    const updatedExcuse: Excuse = await response.json();
    console.log("Excuse status updated successfully:", updatedExcuse);
    return updatedExcuse;
  }

  static getAllRegions(): Region[] {
    return schoolData.regions || [];
  }
  static getAllStudents(): Student[] {
    return schoolData.students || [];
  }
  static getAllSchools(): School[] {
    return schoolData.schools || [];
  }
  static getAllParentPenalties(): ParentPenalty[] {
    return schoolData.parentPenalties || [];
  }

  static getAllCities(): City[] {
    return schoolData.cities || [];
  }
  static getAllAreas(): Area[] {
    return schoolData.areas || [];
  }

  /**
   * Retrieves aggregated attendance statistics for schools matching specific criteria within a region.
   * @param regionId The ID of the region.
   * @param startDate The start date for the statistics.
   * @param endDate The end date for the statistics.
   * @param schoolType Optional: Filter by school type ("Male", "Female", "Mixed").
   * @param educationalLevel Optional: Filter by educational level ("Primary", "Intermediate", "Secondary").
   * @returns An object with aggregated attendance, absence, late counts, and total possible attendances.
   */
  public static getSchoolsForAttendance(
    regionId: number | null,
    filters: FilterValues
  ): {
    all: School[];
    male: School[];
    female: School[];
    primary: School[];
    intermediate: School[];
    secondary: School[];
  } {
    console.log(
      "DataService: getSchoolsForAttendance START with regionId:",
      regionId
    );

    // Start with all schools
    let schools = schoolData.schools;

    // Apply region filter if provided
    if (regionId !== null) {
      schools = schools.filter((school) => school.region_id === regionId);
      console.log(
        `DataService: Schools after region filter (${regionId}): ${schools.length}`
      );
    }

    // Apply additional filters from the UI
    if (filters.city) {
      const cityId = getCityIdFromName(filters.city);
      if (cityId !== null) {
        schools = schools.filter((school) => school.city_id === cityId);
      }
    }

    if (filters.schoolName) {
      const name = filters.schoolName.toLowerCase().trim();
      schools = schools.filter(
        (school) =>
          school.name_en.toLowerCase().includes(name) ||
          school.name_ar.toLowerCase().includes(name)
      );
    }

    if (filters.ministryNumber) {
      const number = filters.ministryNumber.toLowerCase().trim();
      schools = schools.filter((school) =>
        school.ministerial_number.toString().toLowerCase().includes(number)
      );
    }

    if (filters.schoolType) {
      const typeId = getEducationTypeIdFromName(filters.schoolType);
      if (typeId !== null) {
        schools = schools.filter(
          (school) => school.education_type_id === typeId
        );
      }
    }

    // Group schools by gender and educational level
    const maleSchools = schools.filter((school) => school.type_en === "Male");
    const femaleSchools = schools.filter(
      (school) => school.type_en === "Female"
    );

    const primarySchools = schools.filter(
      (school) => school.educational_level_en === "Primary"
    );

    const intermediateSchools = schools.filter(
      (school) => school.educational_level_en === "Intermediate"
    );

    const secondarySchools = schools.filter(
      (school) => school.educational_level_en === "Secondary"
    );

    console.log("DataService: getSchoolsForAttendance END");
    return {
      all: schools,
      male: maleSchools,
      female: femaleSchools,
      primary: primarySchools,
      intermediate: intermediateSchools,
      secondary: secondarySchools,
    };
  }

  public static getSchoolsByRegionId(regionId: number): School[] {
    console.log("DataService: getSchoolsByRegionId for region ID:", regionId);
    return schoolData.schools.filter((school) => school.region_id === regionId);
  }

  static getStudentNameById(studentId: number, lang: string): string[] {
    const student = schoolData.students?.find(
      (s) => s.student_id === studentId
    );

    if (!student) {
      // Return an array with a single element indicating "Unknown student"
      return [lang === "ar" ? "طالب غير معروف" : "Unknown student"];
    }

    // Return an array containing both the first and last names
    if (lang === "ar") {
      return [student.first_name_ar, student.last_name_ar];
    } else {
      return [student.first_name_en, student.last_name_en];
    }
  }
  static getSchoolById(schoolId: number): School | null {
    const school = schoolData.schools?.find((s) => s.school_id === schoolId);

    return school || null;
  }

  // static getAreaIdFromName(name: string): number | null {
  //   const area = schoolData.areas.find(a => a.name_en === name || a.name_ar === name);
  //   return area ? area.area_id : null;
  // }

  public static getRegionIdFromName(
    name: string,
    currentLang: string
  ): number | null {
    const region = schoolData.regions.find((r) =>
      currentLang === "ar" ? r.name_ar === name : r.name_en === name
    );
    return region ? region.region_id : null;
  }

  public static getCityIdFromName(
    name: string,
    currentLang: string
  ): number | null {
    const city = schoolData.cities.find((c) =>
      currentLang === "ar" ? c.name_ar === name : c.name_en === name
    );
    return city ? city.city_id : null;
  }
  public static getCityNameFromId(
    id: number,
    currentLang: string
  ): string | null {
    const city = schoolData.cities.find((c) => c.city_id === id);
    return currentLang === "ar" ? city?.name_ar || null : city?.name_en || null;
  }
  public static getRegionNameFromId(
    id: number,
    currentLang: string
  ): string | null {
    const region = schoolData.regions.find((c) => c.region_id === id);
    return currentLang === "ar"
      ? region?.name_ar || null
      : region?.name_en || null;
  }
  public static getAreaNameFromId(
    id: number,
    currentLang: string
  ): string | null {
    const area = schoolData.areas.find((a) => a.area_id === id);
    return currentLang === "ar" ? area?.name_ar || null : area?.name_en || null;
  }

  public static getAreaIdFromName(
    name: string,
    currentLang: string
  ): number | null {
    const area = schoolData.areas.find((a) =>
      currentLang === "ar" ? a.name_ar === name : a.name_en === name
    );
    return area ? area.area_id : null;
  }
  public static getIdFromName(
    name: string,
    currentLang: string
  ): number | null {
    const area = schoolData.areas.find((a) =>
      currentLang === "ar" ? a.name_ar === name : a.name_en === name
    );
    return area ? area.area_id : null;
  }

  // NEW Helper: Get Education Type ID from Name (e.g., "National" -> 1)
  public static getEducationTypeIdFromName(
    educationTypeName: string
  ): number | null {
    const normalizedTypeName = educationTypeName.toLowerCase().trim();
    const educationType = schoolData.educationTypes.find(
      (et) => et.description_en.toLowerCase().trim() === normalizedTypeName
    );
    return educationType ? educationType.education_type_id : null;
  }

  // NEW Helper: Get Education Type Name from ID (e.g., 1 -> "National")
  public static getEducationTypeNameFromId(
    educationTypeId: number
  ): string | null {
    const educationType = schoolData.educationTypes.find(
      (et) => et.education_type_id === educationTypeId
    );
    return educationType ? educationType.description_en : null;
  }

  public static getSchoolsByFilters(filters: FilterValues): School[] {
    // console.log("DataService: getSchoolsByFilters START with filters:", filters);
    let filteredSchools = schoolData.schools; // Start with all schools
    // console.log("DataService: Initial schools count before any filters:", filteredSchools.length);

    // Region Filter (UNCHANGED from previous)
    if (filters.region) {
      const selectedRegionId = DataService.getRegionIdFromName(
        filters.region,
        i18n.language
      );
      console.log(
        `DataService: Filtering by region. Filter Name: '${filters.region}', Mapped ID: ${selectedRegionId}`
      );
      if (selectedRegionId !== null) {
        filteredSchools = filteredSchools.filter(
          (school) => school.region_id === selectedRegionId
        );
        console.log(
          `DataService: Schools AFTER region filter (count: ${filteredSchools.length}).`
        );
        console.log(
          `DataService: Schools IDs after Region filter: ${filteredSchools
            .map((s) => s.school_id)
            .join(",")}`
        );
      } else {
        console.log(
          "DataService: getSchoolsByFilters - Region name not found, returning empty schools for region filter."
        );
        return [];
      }
    }

    // City Filter (UNCHANGED from previous, correctly uses city_id)
    if (filters.city) {
      const filterCityName = filters.city.toLowerCase().trim();
      const filterCityId = DataService.getCityIdFromName(
        filters.city,
        i18n.language
      );

      // console.log(`DataService: Filtering by city. Filter Name: '${filterCityName}', Mapped ID: ${filterCityId}. Schools before city filter: ${filteredSchools.length}`);

      if (filterCityId !== null) {
        filteredSchools = filteredSchools.filter((school) => {
          const schoolCityName = DataService.getCityNameFromId(
            school.city_id,
            i18n.language
          ); // Get the city name for the school
          const doesMatch = school.city_id === filterCityId;

          // console.log(`DataService.CityFilterDebug: School ID: ${school.school_id}, School City ID: ${school.city_id}, School City Name: '${schoolCityName}', Filter City Name: '${filterCityName}', Filter City ID: ${filterCityId}, Match: ${doesMatch}`);

          return doesMatch;
        });
        // console.log(`DataService: Schools AFTER city filter (count: ${filteredSchools.length}).`);
        // console.log(`DataService: Schools IDs after City filter: ${filteredSchools.map(s => s.school_id).join(',')}`);
      } else {
        // console.log("DataService: getSchoolsByFilters - City name not found in data, returning empty schools for city filter.");
        return [];
      }
    }

    console.log("filterssss", filters.area);
    // Area Filter
    if (filters.area) {
      const filterAreaId = DataService.getAreaIdFromName(
        filters.area,
        i18n.language
      );

      console.log(
        `DataService: Filtering by area. Filter Name: '${filters.area}', Mapped ID: ${filterAreaId}. Schools before area filter: ${filteredSchools.length}`
      );

      if (filterAreaId !== null) {
        filteredSchools = filteredSchools.filter(
          (school) => school.area_id === filterAreaId
        );
        console.log(
          `DataService: Schools AFTER area filter (count: ${filteredSchools.length}).`
        );
      } else {
        console.log(
          "DataService: getSchoolsByFilters - Area name not found in data, returning empty schools for area filter."
        );
        return [];
      }
    }

    // School Name Filter (UNCHANGED)
    if (filters.schoolName) {
      const schoolName = filters.schoolName.toLowerCase().trim();
      console.log(
        `DataService: Filtering by school name. Filter: '${schoolName}'. Schools before filter: ${filteredSchools.length}`
      );
      filteredSchools = filteredSchools.filter(
        (school) =>
          (school.name_en || "").toLowerCase().trim().includes(schoolName) ||
          (school.name_ar || "").toLowerCase().trim().includes(schoolName)
      );
      console.log(
        `DataService: Schools AFTER school name filter (count: ${filteredSchools.length}).`
      );
      console.log(
        `DataService: Schools IDs after School Name filter: ${filteredSchools
          .map((s) => s.school_id)
          .join(",")}`
      );
    }

    // Ministry Number Filter (UNCHANGED, correctly uses ministerial_number)
    if (filters.ministryNumber) {
      const ministryNumber = filters.ministryNumber.toLowerCase().trim();
      console.log(
        `DataService: Filtering by ministry number. Filter: '${ministryNumber}'. Schools before filter: ${filteredSchools.length}`
      );
      filteredSchools = filteredSchools.filter((school) =>
        (school.ministerial_number ? String(school.ministerial_number) : "")
          .toLowerCase()
          .trim()
          .includes(ministryNumber)
      );
      console.log(
        `DataService: Schools AFTER ministry number filter (count: ${filteredSchools.length}).`
      );
      console.log(
        `DataService: Schools IDs after Ministry Number filter: ${filteredSchools
          .map((s) => s.school_id)
          .join(",")}`
      );
    }

    // School Type Filter (NOW CORRECTLY uses education_type_id for "National", "Global" etc.)
    if (filters.schoolType) {
      const filterSchoolTypeName = filters.schoolType.toLowerCase().trim();
      const filterEducationTypeId = DataService.getEducationTypeIdFromName(
        filters.schoolType
      );

      console.log(
        `DataService: Filtering by education type. Filter Name: '${filterSchoolTypeName}', Mapped ID: ${filterEducationTypeId}. Schools before filter: ${filteredSchools.length}`
      );

      if (filterEducationTypeId !== null) {
        filteredSchools = filteredSchools.filter(
          (school) => school.education_type_id === filterEducationTypeId
        );
        console.log(
          `DataService: Schools AFTER education type filter (count: ${filteredSchools.length}).`
        );
        console.log(
          `DataService: Schools IDs after Education Type filter: ${filteredSchools
            .map((s) => s.school_id)
            .join(",")}`
        );
      } else {
        console.log(
          "DataService: getSchoolsByFilters - Education type name not found in data, returning empty schools."
        );
        return [];
      }
    }

    // NEW FILTER: School Gender (based on filters.sex from UI)
    // This filter now directly affects the list of schools based on their 'type_en' property.
    if (filters.sex) {
      const filterSchoolGender = filters.sex.toLowerCase().trim(); // 'male' or 'female'
      // console.log(`DataService: Filtering by school gender. Filter: '${filterSchoolGender}'. Schools before filter: ${filteredSchools.length}`);

      filteredSchools = filteredSchools.filter(
        (school) =>
          (school.type_en || "").toLowerCase().trim() === filterSchoolGender
      );
      // console.log(`DataService: Schools AFTER school gender filter (count: ${filteredSchools.length}).`);
      // console.log(`DataService: Schools IDs after School Gender filter: ${filteredSchools.map(s => s.school_id).join(',')}`);
    }

    // console.log("DataService: getSchoolsByFilters END. Final schools count:", filteredSchools.length);
    // console.log(`DataService: Final filtered schools IDs: ${filteredSchools.map(s => s.school_id).join(',')}`);
    return filteredSchools;
  }

  public static getFilteredStats(
    schoolIds: number[],
    startDate: Date,
    endDate: Date
  ): CalculatedStatistics {
    let attendance = 0; // IN_TIME
    let absence = 0; // From absences data
    let late = 0; // VIOLATION

    console.log("--- getFilteredStats START ---");
    console.log("Input schoolIds:", schoolIds);
    console.log("Input startDate (ISO):", startDate.toISOString());
    console.log("Input endDate (ISO):", endDate.toISOString());

    const studentsInScope = schoolData.students.filter((student) =>
      schoolIds.includes(student.school_id)
    );

    const studentIdsInScope = new Set(studentsInScope.map((s) => s.student_id));
    console.log("Students in scope (count):", studentsInScope.length);
    console.log("Student IDs in scope:", Array.from(studentIdsInScope));

    // Helper to normalize date strings to YYYY-MM-DD for comparison
    const normalizeDate = (dateInput: any): string => {
      if (dateInput instanceof Date) {
        return dateInput.toISOString().split("T")[0];
      }
      // Assuming dateInput is a string like "YYYY-MM-DD HH:MM:SS" or "YYYY-MM-DD"
      return String(dateInput).split(" ")[0];
    };

    const startNormalized = normalizeDate(startDate); // Pass Date object directly
    const endNormalized = normalizeDate(endDate); // Pass Date object directly
    console.log("Normalized Start Date (YYYY-MM-DD):", startNormalized);
    console.log("Normalized End Date (YYYY-MM-DD):", endNormalized);

    // --- Processing Attendance Records ---
    console.log("\n--- Processing Attendance Records ---");
    let debugAttendanceRecordsCount = 0;
    schoolData.attendance.forEach((record) => {
      debugAttendanceRecordsCount++;
      const recordDate = normalizeDate(record.date_g);
      // console.log("recooooooooooooordDate", recordDate);
      // console.log("StaaaaaaaaaaaartNormalized", startNormalized);
      const isStudentInScope = studentIdsInScope.has(record.student_id);
      const isDateInRange =
        recordDate >= startNormalized && recordDate <= endNormalized;

      // Log every record and its filter checks
      // console.log(
      //   `  Attendance Record #${debugAttendanceRecordsCount}: Student ID: ${record.student_id}, Date: ${record.date_g} (Normalized: ${recordDate}), Status: ${record.status}`
      // );
      // console.log(
      //   `    Is student in scope? ${isStudentInScope}. Is date in range? ${isDateInRange}`
      // );

      if (isStudentInScope && isDateInRange) {
        // console.log(
        //   `    **MATCH FOUND (Attendance)**: Student ID: ${record.student_id}, Date: ${recordDate}, Status: ${record.status}`
        // );
        switch (record.status) {
          case "IN_TIME":
            attendance++;
            break;
          case "VIOLATION":
            late++;
            break;
        }
      }
    });
    // console.log(
    //   "Total attendance records processed:",
    //   debugAttendanceRecordsCount
    // );
    // console.log("Calculated Attendance (IN_TIME):", attendance);
    // console.log("Calculated Late (VIOLATION):", late);

    // --- Processing Absence Records ---
    // console.log("\n--- Processing Absence Records ---");
    let debugAbsenceRecordsCount = 0;
    schoolData.absences.forEach((record) => {
      debugAbsenceRecordsCount++;
      const recordDate = normalizeDate(record.date_g);
      const isStudentInScope = studentIdsInScope.has(record.student_id);
      const isDateInRange =
        recordDate >= startNormalized && recordDate <= endNormalized;

      // Log every record and its filter checks
      // console.log(
      //   `  Absence Record #${debugAbsenceRecordsCount}: Student ID: ${record.student_id}, Date: ${record.date_g} (Normalized: ${recordDate})`
      // );
      // console.log(
      //   `    Is student in scope? ${isStudentInScope}. Is date in range? ${isDateInRange}`
      // );

      if (isStudentInScope && isDateInRange) {
        // console.log(
        //   `    **MATCH FOUND (Absence)**: Student ID: ${record.student_id}, Date: ${recordDate}`
        // );
        absence++;
      }
    });
    // console.log("Total absence records processed:", debugAbsenceRecordsCount);
    // console.log("Calculated Absence:", absence);

    // console.log("\n--- getFilteredStats END ---");
    return {
      attendance,
      absence,
      late,
    };
  }

  static saveSchoolData(data: MergedSchoolData) {
    schoolDataJson1 = data;
    if (typeof window !== "undefined") {
      localStorage.setItem("schoolDataJson", JSON.stringify(data));
    }
  }

  static getUnpaidPenaltiesForStudent(studentId: number): ParentPenalty[] {
    const penalties = this.getSchoolData().penalties || [];
    if (!penalties) return [];

    return penalties.filter(
      (penalty: ParentPenalty) =>
        Number(penalty.student_id) === studentId && penalty.paid === "N"
    );
  }

  static markPenaltyAsPaid(penaltyId: number): void {
    const data = this.getSchoolData();
    const penalties = data.penalties || [];

    const penaltyIndex = penalties.findIndex(
      (p: ParentPenalty) => p.penalty_id === penaltyId
    );

    if (penaltyIndex !== -1) {
      // Create a new array to ensure state updates
      const updatedPenalties = [...penalties];
      updatedPenalties[penaltyIndex] = {
        ...updatedPenalties[penaltyIndex],
        paid: "Y",
      };

      // Update and save the data
      this.saveSchoolData({
        ...data,
        penalties: updatedPenalties,
      });
    }
  }

  public static getStudentsBySex(studentIds: number[], sex: string): number[] {
    console.log(
      `DataService.getStudentsBySex: Called with sex: '${sex}' and ${studentIds.length} initial student IDs.`
    );

    if (!sex || sex.trim() === "") {
      console.log(
        "DataService.getStudentsBySex: Sex filter is empty, returning all initial student IDs."
      );
      return studentIds;
    }

    const sexFilterNormalized = sex.trim().toLowerCase();
    console.log(
      `DataService.getStudentsBySex: Normalized sex filter: '${sexFilterNormalized}'`
    );

    const relevantStudents = schoolData.students.filter((student) =>
      studentIds.includes(student.student_id)
    );
    console.log(
      `DataService.getStudentsBySex: Found ${relevantStudents.length} relevant students from schoolData.students.`
    );

    // --- ADD THIS LOOP TO INSPECT GENDER VALUES ---
    let foundMatchingGender = false;
    for (const student of relevantStudents) {
      if (student.gender === undefined || student.gender === null) {
        console.warn(
          `DataService.getStudentsBySex: Student ID ${student.student_id} has undefined/null gender.`
        );
      } else if (student.gender.toLowerCase() === sexFilterNormalized) {
        foundMatchingGender = true;
        // You can optionally log a few matches to confirm
        // console.log(`DataService.getStudentsBySex: Match found for student ID ${student.student_id} with gender '${student.gender}'.`);
      }
    }
    console.log(
      `DataService.getStudentsBySex: Iterated through relevant students. Found at least one matching gender: ${foundMatchingGender}`
    );
    // --- END OF LOOP ---

    const filteredBySex = relevantStudents.filter(
      (student) =>
        // Ensure student.gender is not null/undefined before calling toLowerCase
        student.gender && student.gender.toLowerCase() === sexFilterNormalized
    );

    console.log(
      `DataService.getStudentsBySex: After sex filter, found ${filteredBySex.length} students.`
    );
    return filteredBySex.map((student) => student.student_id);
  }

  public static getStudentsByIds(studentIds: number[]): Student[] {

    const relevantStudents = schoolData.students.filter((student) =>
      studentIds.includes(student.student_id)
    );

    return relevantStudents
  }

  static isDateInRange(
    checkDate: Date | string,
    rangeStartDate: Date,
    rangeEndDate: Date
  ): boolean {
    const normalizedCheckDate = this.normalizeDateForComparison(checkDate);
    const normalizedRangeStartDate =
      this.normalizeDateForComparison(rangeStartDate);
    const normalizedRangeEndDate =
      this.normalizeDateForComparison(rangeEndDate);

    return (
      normalizedCheckDate >= normalizedRangeStartDate &&
      normalizedCheckDate <= normalizedRangeEndDate
    );
  }

  static getRegionById(regionId: number): Region | undefined {
    return schoolData.regions?.find((r) => r.region_id === regionId);
  }

  static getStudentsBySchoolId(schoolId: number): Student[] {
    return (
      schoolData.students?.filter(
        (student) => student.school_id === schoolId
      ) || []
    );
  }

  static getStudentsByParentId(parentId: number): Student[] {
    const studentIds =
      schoolData.parent_students
        ?.filter((rel) => rel.parent_id === parentId)
        .map((rel) => rel.student_id) || [];
    return (
      schoolData.students?.filter((student) =>
        studentIds.includes(student.student_id)
      ) || []
    );
  }

  // Ensure this function correctly links students to regions via schools and cities
  private static getStudentsInRegion(regionId: number): Student[] {
    if (!schoolData.students || !schoolData.schools || !schoolData.cities) {
      // console.warn("DEBUG (getStudentsInRegion): Missing students, schools, or cities data. Returning empty array.");
      return [];
    }

    const studentsInRegion = schoolData.students.filter((s) => {
      const school = schoolData.schools.find(
        (sch) => sch.school_id === s.school_id
      );
      if (!school) {
        // console.warn(`DEBUG (getStudentsInRegion): Student ${s.student_id} linked to unknown school ${s.school_id}.`);
        return false;
      }
      const city = schoolData.cities.find((c) => c.city_id === school.city_id);
      if (!city) {
        // console.warn(`DEBUG (getStudentsInRegion): School ${school.school_id} linked to unknown city ${school.city_id}.`);
        return false;
      }
      return city?.region_id === regionId;
    });
    // This is important for understanding which students are considered in the region
    // console.log(`DEBUG (getStudentsInRegion): Found ${studentsInRegion.length} students for Region ID ${regionId}. Sample IDs:`,
    //             studentsInRegion.slice(0, 5).map(s => s.student_id), // Show a sample of IDs
    //             studentsInRegion.length > 5 ? '...' : ''
    // );
    return studentsInRegion;
  }

  static getSchoolDays(start: Date, end: Date): number {
    let count = 0;
    const current = new Date(start);
    current.setHours(0, 0, 0, 0); // Ensure start of day for iteration
    const finalEnd = new Date(end);
    finalEnd.setHours(0, 0, 0, 0); // Ensure start of day for iteration end condition

    while (current.getTime() <= finalEnd.getTime()) {
      // Use getTime() for reliable comparison
      const day = current.getDay(); // Sunday = 0, Monday = 1, ..., Friday = 5, Saturday = 6
      if (day !== 5 && day !== 6) {
        // Assuming Friday and Saturday are weekends
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

  // --- Main Data Aggregation for Minister Page Statistics (with detailed logging) ---
  static getRegionStats(
    regionId: number,
    startDate: Date,
    endDate: Date
  ): RegionStats {
    const studentsInRegion = this.getStudentsInRegion(regionId);
    // console.log(`  Found ${studentsInRegion.length} students in region ${regionId}.`);
    if (studentsInRegion.length === 0) {
      // console.log("  No students found for this region. Returning zeros.");
      console.groupEnd();
      return {
        attendance: 0,
        absence: 0,
        late: 0,
        penalties: 0,
        rewards: 0,
        totalStudentsInRegion: 0,
      };
    }

    const studentIdsInRegion = new Set(
      studentsInRegion.map((s) => s.student_id)
    );
    // console.log(`  DEBUG (getRegionStats): Student IDs considered for region ${regionId}:`, Array.from(studentIdsInRegion).slice(0, 10), (studentIdsInRegion.size > 10 ? '...' : ''));

    let totalAttendanceEvents = 0;
    let totalAbsenceEvents = 0;
    let totalLateEvents = 0;
    let totalFines = 0;
    let totalRewards = 0;

    // --- Process Attendance Records ---
    // (Your existing attendance processing code here)
    schoolData.attendance?.forEach((record) => {
      const recordStudentId = Number(record.student_id);
      const isInRegion = studentIdsInRegion.has(recordStudentId);
      const isDateValid =
        record.date_g && this.isDateInRange(record.date_g, startDate, endDate);

      if (!isInRegion || !isDateValid) {
        return;
      }

      if (record.status === "IN_TIME") {
        totalAttendanceEvents++;
      } else if (record.status === "VIOLATION") {
        totalLateEvents++;
      }
    });
    console.log(
      `  Total 'IN_TIME' attendance events for region ${regionId}: ${totalAttendanceEvents}`
    );
    console.log(
      `  Total 'late' attendance events for region ${regionId}: ${totalLateEvents}`
    );

    // --- Process Absence Records ---
    // (Your existing absence processing code here)
    schoolData.absences?.forEach((absence) => {
      const absenceStudentId = Number(absence.student_id);
      const isInRegion = studentIdsInRegion.has(absenceStudentId);
      const isDateValid =
        absence.date_g &&
        this.isDateInRange(absence.date_g, startDate, endDate);

      if (!isInRegion || !isDateValid) {
        return;
      }

      totalAbsenceEvents++;
    });
    // console.log(`Toooooooooootal full absence events (from 'absences' array) for region ${regionId}: ${totalAbsenceEvents}`);

    // --- Process Penalty Records ---
    // console.log(`\n--- Processing Penalty Records (${schoolData.parentPenalties?.length || 0} total) ---`);
    // Use optional chaining for safe access:
    // console.log("pennnnnnnnn", schoolData.parentPenalties?.[0]);
    schoolData.parentPenalties?.forEach((penalty) => {
      const penaltyStudentId = Number(penalty.student_id);
      const isInRegion = studentIdsInRegion.has(penaltyStudentId);
      // Ensure penalty.penalty_date_g is the correct field
      const isDateValid =
        penalty.penalty_date_g &&
        this.isDateInRange(penalty.penalty_date_g, startDate, endDate);

      // console.log(`  DEBUG (Penalty): Checking record for student ${penaltyStudentId}, date ${penalty.penalty_date_g}, amount ${penalty.amount_due}`);
      // console.log(`    Is Student ${penaltyStudentId} in Region ${regionId}?: ${isInRegion}`);
      // console.log(`    Is Date <span class="math-inline">\{penalty\.penalty\_date\_g\} in Range \[</span>{startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}]?: ${isDateValid}`);

      if (isInRegion && isDateValid) {
        totalFines += penalty.amount_due || 0;
        // console.log(`    !!! MATCH (Penalty) !!! Added ${penalty.amount_due}. Current Total Fines: ${totalFines}`);
      } else {
        // console.log(`    SKIPPING (Penalty): Student In Region: ${isInRegion}, Date Valid: ${isDateValid}`);
      }
    });
    // console.log(`Final calculated Total fines for region ${regionId}: ${totalFines}`);

    // --- Process Reward Records ---
    // (Your existing reward processing code here)
    schoolData.rewards?.forEach((reward) => {
      const rewardStudentId = Number(reward.student_id);
      const isInRegion = studentIdsInRegion.has(rewardStudentId);
      const isDateValid =
        reward.issued_at &&
        this.isDateInRange(reward.issued_at, startDate, endDate); // Use issued_at

      // console.log(`  DEBUG (Reward): Checking record for student ${rewardStudentId}, date ${reward.issued_at}`);
      // console.log(`    Is Student ${rewardStudentId} in Region ${regionId}?: ${isInRegion}`);
      // console.log(`    Is Date <span class="math-inline">\{reward\.issued\_at\} in Range \[</span>{startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}]?: ${isDateValid}`);

      if (isInRegion && isDateValid) {
        totalRewards++;
        // console.log(`    !!! MATCH (Reward) !!! Counted reward. Current Total Rewards: ${totalRewards}`);
      } else {
        // console.log(`    SKIPPING (Reward): Student In Region: ${isInRegion}, Date Valid: ${isDateValid}`);
      }
    });
    // console.log(`  Total rewards for region ${regionId}: ${totalRewards}`);

    const statsResult = {
      attendance: totalAttendanceEvents,
      absence: totalAbsenceEvents,
      late: totalLateEvents,
      penalties: totalFines,
      rewards: totalRewards,
      totalStudentsInRegion: studentsInRegion.length,
    };
    console.log(
      `DataService: Final calculated stats for region ${regionId}:`,
      statsResult
    );
    console.groupEnd();
    return statsResult;
  }

  static normalizeDateForComparison(
    dateInput: Date | string | null | undefined
  ): string {
    if (!dateInput) {
      // Handle null, undefined, empty string early
      console.warn(
        "DataService: Encountered null/undefined/empty dateInput. Skipping record."
      );
      return "1970-01-01"; // Or some default date that will likely be outside your active ranges
      // Alternatively, you could throw an error or handle higher up.
    }

    let date: Date;
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === "string") {
      // Option 1: Try parsing directly if it's reliable (e.g., YYYY-MM-DD or ISO 8601)
      date = new Date(dateInput);

      // Option 2: If your data uses "YYYY-MM-DD HH:MM:SS" and new Date() is flaky,
      // you might manually extract the date part first if you only care about day comparison.
      // For example:
      // const datePart = dateInput.split(' ')[0];
      // date = new Date(datePart);
    } else {
      console.error(
        "DataService: Unexpected type for dateInput:",
        typeof dateInput,
        dateInput
      );
      return "1970-01-01"; // Fallback for unexpected types
    }

    if (isNaN(date.getTime())) {
      console.error(
        "DataService: Could not parse date string to valid date:",
        dateInput
      );
      return "1970-01-01"; // Return a default for invalid dates
    }

    return date.toISOString().split("T")[0];
  }

  public static getSchoolsForAttendance(
    regionId: number | null,
    filters: FilterValues
  ): {
    all: School[];
    male: School[];
    female: School[];
    primary: School[];
    intermediate: School[];
    secondary: School[];
  } {
    // Filter by region first
    let schools = regionId
      ? schoolData.schools.filter((s) => s.region_id === regionId)
      : schoolData.schools;

    // Apply additional filters
    // ... (your existing filter logic) ...

    // Group schools
    return {
      all: schools,
      male: schools.filter((s) => s.type_en === "Male"),
      female: schools.filter((s) => s.type_en === "Female"),
      primary: schools.filter((s) => s.educational_level_en === "Primary"),
      intermediate: schools.filter(
        (s) => s.educational_level_en === "Intermediate"
      ),
      secondary: schools.filter((s) => s.educational_level_en === "Secondary"),
    };
  }

  static calculateGroupStats = (
    schools: School[],
    dateRange: { startDate: Date; endDate: Date }
  ) => {
    if (schools.length === 0) {
      return { attendance: 0, totalPossible: 0 };
    }

    const schoolIds = schools.map((s) => s.school_id);
    const studentIds = DataService.getStudentsInSchools(schoolIds);
    const schoolDays = DataService.getSchoolDays(
      dateRange.startDate,
      dateRange.endDate
    );

    // Calculate total possible attendance
    const totalPossible = studentIds.length * schoolDays;

    // Get all students
    const allStudents = DataService.getAllStudents();

    // Filter students that are in our studentIds list
    const students = allStudents.filter((student) =>
      studentIds.includes(student.student_id)
    );

    // Calculate attendance
    return {
      attendance: DataService.calculateAttendance(
        students,
        dateRange.startDate,
        dateRange.endDate
      ),
      totalPossible,
    };
  };

  static calculateAttendanceForStudentIds(
    studentIds: number[],
    start: Date,
    end: Date
  ): number {
    const schoolDays = this.getSchoolDays(start, end);
    const totalPossibleAttendanceDays = studentIds.length * schoolDays;

    const fullAbsenceDays = this.countAbsences(studentIds, start, end);
    const lateDays = this.countLateArrivals(studentIds, start, end);

    return totalPossibleAttendanceDays - fullAbsenceDays - lateDays;
  }

  static getStudentAttendances(
  studentIds: number[],
  startDate: Date,
  endDate: Date
): AttendanceRecord[] {
  return schoolData.attendance.filter((attendance) => {
    const attendanceDate = new Date(attendance.date_g); // Convert string to Date

    const inRange = attendanceDate >= startDate && attendanceDate <= endDate;
    const included = studentIds.includes(attendance.student_id);

    // console.log("attendanceDate", attendanceDate);
    // console.log("startDate", startDate);
    // console.log("endDate", endDate);
    // console.log("inRange:", inRange, "included:", included);

    return included && inRange;
  });
}



  static async getAggregatedStatsForStudents(
  studentIds: number[],
  startDate: Date,
  endDate: Date
): Promise<{
  attendance: number;
  absence: number;
  late: number;
  totalPossibleAttendances: number;
  penalties: number;
  rewards: number;
  totalStudentsInGroup: number;
}> {
  let totalAttendance = 0;
  let totalAbsence = 0;
  let totalLate = 0;
  let totalPossibleAttendances = 0;
  let totalPenalties = 0;
  let totalRewards = 0;

  const relevantAttendances = await DataService.getStudentAttendances(
    studentIds,
    startDate,
    endDate
  );

  console.log("relevant", relevantAttendances)
  const uniqueStudentDays = new Set<string>();

  relevantAttendances.forEach((record) => {
    const dayKey = `${record.student_id}-${record.date_g.toString().split("T")[0]}`;

    if (!uniqueStudentDays.has(dayKey)) {
      totalPossibleAttendances += 1;
      uniqueStudentDays.add(dayKey);
    }

    switch (record.status) {
      case "IN_TIME":
        totalAttendance += 1;
        break;
      case "VIOLATION":
        totalLate += 1;
        break;
    }
  });

  console.log("relevannnn", relevantAttendances)

  totalAbsence = DataService.countAbsences(studentIds, startDate, endDate)

  // ✅ Fetch penalties and rewards
  const penaltyPromises = studentIds.map((id) =>
    DataService.getPenaltiesForStudent(id)
  );
  const rewardPromises = studentIds.map((id) =>
    DataService.getRewardsForStudent(id, startDate, endDate)
  );

  const allPenalties = await Promise.all(penaltyPromises);
  const allRewards = await Promise.all(rewardPromises);

  // ✅ Sum penalties
  allPenalties.forEach((penaltyList) => {
    totalPenalties += penaltyList.reduce(
      (sum, p) => sum + (p.amount_due || 0),
      0
    );
  });

  // ✅ Count rewards
  allRewards.forEach((rewardList) => {
    totalRewards += rewardList.length;
  });

  return {
    attendance: totalAttendance,
    absence: totalAbsence,
    late: totalLate,
    totalPossibleAttendances: totalPossibleAttendances,
    penalties: totalPenalties,
    rewards: totalRewards,
    totalStudentsInGroup: studentIds.length,
  };
}


  // --- Other existing methods (unchanged unless explicitly mentioned) ---

  static getRegionByName(name: string): Region | undefined {
    if (!schoolData.regions) return undefined;
    const normalizedName = name.trim().toLowerCase();
    return schoolData.regions.find(
      (r) =>
        r.name_en.toLowerCase() === normalizedName || r.name_ar === name.trim()
    );
  }

  static getAbsencesByDateRange(
    start: Date,
    end: Date,
    regionId: number
  ): Absence[] {
    if (!schoolData.absences) return [];
    const students = this.getStudentsInRegion(regionId);
    const studentIds = students.map((s) => s.student_id);
    return schoolData.absences.filter(
      (a) =>
        studentIds.includes(Number(a.student_id)) &&
        this.isDateInRange(a.date_g, start, end)
    );
  }

  static getTotalFines(start: Date, end: Date, regionId: number): number {
    if (!schoolData.parentPenalties) return 0;
    const studentIdsInRegion = this.getStudentsInRegion(regionId).map(
      (s) => s.student_id
    );
    return this.sumPenalties(studentIdsInRegion, start, end);
  }

  static calculateAttendance(
    students: Student[],
    start: Date,
    end: Date
  ): number {

    const studentIds = students.map((s) => s.student_id);

    const totalPossibleAttendanceDays = schoolData.attendance.filter(
      (a) =>
        studentIds.includes(Number(a.student_id)) &&
        this.isDateInRange(a.date_g, start, end) ).length;
            

    // const fullAbsenceDays = this.countAbsences(studentIds, start, end);
    // const lateDays = this.countLateArrivals(studentIds, start, end);
    // console.log("fullAbsence", fullAbsenceDays);
    // console.log("lateDays", lateDays);

    return totalPossibleAttendanceDays;
  }

  static async getPenaltiesForParent(
    parentId: number
  ): Promise<ParentPenalty[]> {
    try {
      const parentStudents = this.getStudentsByParentId(parentId);
      //   if (!parentStudents || parentStudents.length === 0) {
      //     return [];
      // }
      const studentIdStrings = new Set(
        parentStudents.map((student) => String(student.student_id))
      );

      const response = await fetch(`${JSON_SERVER_BASE_URL}/parentPenalties`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Details: ${errorText}`
        );
      }

      const allPenalties: ParentPenalty[] = await response.json();

      const relevantPenalties = allPenalties.filter((penalty) => {
        // Check if the penalty's student_id is in the set of student IDs for this parent
        return studentIdStrings.has(penalty.student_id.toLocaleString());
      });

      console.log(
        `DataService: Found ${relevantPenalties.length} relevant penalties for parentId: ${parentId}`
      );
      return relevantPenalties;
    } catch (error) {
      console.error(
        `DataService: Error getting penalties for parent ID ${parentId}:`,
        error
      );
      return []; // Return empty array on error
    }
  }

  static async getTotalPenaltiesForParent(parentId: number): Promise<number> {
    try {
      const relevantPenalties = await this.getPenaltiesForParent(parentId);
      console.log("insideT", relevantPenalties);
      // if (relevantPenalties.length === 0) {
      //   return 0;
      // }

      const total = relevantPenalties.reduce(
        (sum, penalty) => sum + (penalty.amount_due || 0),
        0
      );
      console.log(
        `DataService: Calculated total penalties for parent ID ${parentId}: ${total}`
      );
      return total;
    } catch (error) {
      console.error(
        `DataService: Error calculating total penalties for parent ID ${parentId}:`,
        error
      );
      return 0; // Return 0 on error
    }
  }

  static async updatePenaltyStatus(
    penaltyId: string,
    newPaidStatus: "Y" | "N"
  ): Promise<ParentPenalty | null> {
    try {
      console.log(
        `DataService: Attempting to update penalty ID ${penaltyId} status to ${newPaidStatus}.`
      );
      const response = await fetch(
        `${JSON_SERVER_BASE_URL}/parentPenalties/${penaltyId}`,
        {
          method: "PATCH", // Use PATCH for partial updates
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paid: newPaidStatus }), // Send only the 'paid' field
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Details: ${errorText}`
        );
      }

      const updatedPenalty: ParentPenalty = await response.json();
      console.log(`DataService: Successfully updated penalty ID ${penaltyId}.`);
      return updatedPenalty;
    } catch (error) {
      console.error(
        `DataService: Error updating penalty status for ID ${penaltyId}:`,
        error
      );
      return null; // Return null on error
    }
  }

  static async getPenaltiesForStudent(
    studentId: number
  ): Promise<ParentPenalty[]> {
    try {
      const response = await fetch(`${JSON_SERVER_BASE_URL}/parentPenalties`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Details: ${errorText}`
        );
      }

      const allPenalties: ParentPenalty[] = await response.json();

      const relevantPenalties = allPenalties.filter((penalty) => {
        return penalty.student_id === studentId;
      });

      console.log(
        `DataService: Found ${relevantPenalties.length} relevant penalties for parentId: ${studentId}`
      );
      return relevantPenalties;
    } catch (error) {
      console.error(
        `DataService: Error getting penalties for parent ID ${studentId}:`,
        error
      );
      return []; // Return empty array on error
    }
  }

  static async getTotalPenaltiesForStudent(studentId: number): Promise<number> {
    const penalties = await this.getPenaltiesForStudent(studentId);
    return penalties.reduce((sum, p) => sum + (p.amount_due || 0), 0);
  }

  static countAbsences(studentIds: number[], start: Date, end: Date): number {
    if (!schoolData.absences) return 0;
    return schoolData.absences.filter(
      (a) =>
        studentIds.includes(Number(a.student_id)) &&
        this.isDateInRange(a.date_g, start, end)
    ).length;
  }

  static countLateArrivals(
    studentIds: number[],
    start: Date,
    end: Date
  ): number {
    if (!schoolData.attendance) return 0;
    return schoolData.attendance.filter(
      (a) =>
        studentIds.includes(Number(a.student_id)) &&
        this.isDateInRange(a.date_g, start, end) &&
        // Check for VIOLATION status if that's what indicates late
        (a.status === "VIOLATION") // <-- Check for both if applicable
    ).length;
  }

  private static getAttendanceStatus(
    checkIn: string,
    checkOut: string
  ): "IN_TIME" | "LATE" | "VIOLATION" | "UNKNOWN" {
    const lateThreshold = "07:15:00";
    const earlyExitThreshold = "13:30:00";

    if (!checkIn || !checkOut) {
      return "UNKNOWN"; // Or 'ABSENT' if no check-in/out implies absence
    }

    // Convert time strings to a comparable format (e.g., seconds from midnight or just string compare if format is consistent)
    // For simple string comparison, '07:00:00' < '07:15:00' works.
    const arrivedOnTime = checkIn <= lateThreshold;
    const exitedOnTime = checkOut >= earlyExitThreshold; // Check-out before 13:30:00 implies early exit/violation

    if (arrivedOnTime && exitedOnTime) {
      return "IN_TIME";
    } else if (!arrivedOnTime || !exitedOnTime) {
      // If arrived late OR exited early
      return "VIOLATION"; // Or 'LATE' if you want a specific 'LATE' status
    }
    return "UNKNOWN";
  }

  static sumPenalties(studentIds: number[], start: Date, end: Date): number {
    if (!schoolData.parentPenalties) return 0;
    return schoolData.parentPenalties
      .filter(
        (p) =>
          studentIds.includes(Number(p.student_id)) &&
          this.isDateInRange(p.penalty_date_g, start, end)
      )
      .reduce((sum, p) => sum + (p.amount_due || 0), 0);
  }

  static countRewards(studentIds: number[], start: Date, end: Date): number {
    if (!schoolData.rewards) return 0;
    return schoolData.rewards.filter(
      (r) =>
        studentIds.includes(Number(r.student_id)) &&
        this.isDateInRange(r.issued_at, start, end)
    ).length;
  }

  static getDailyStats(regionId: number, startDate: Date, endDate: Date) {
    if (
      !schoolData.absences ||
      !schoolData.parentPenalties ||
      !schoolData.attendance ||
      !schoolData.rewards
    ) {
      // console.warn("DEBUG (getDailyStats): Missing one or more data arrays (absences, penalties, attendance, rewards). Returning empty array.");
      return [];
    }
    const studentsInRegion = this.getStudentsInRegion(regionId);
    const studentIdsInRegion = new Set(
      studentsInRegion.map((s) => s.student_id)
    );

    const dailyDataMap: Record<
      string,
      {
        dateLabel: string;
        date_g: string;
        date_h: string;
        absences: number;
        late: number;
        fines: number;
        rewards: number;
      }
    > = {};

    const currentDay = new Date(startDate);
    currentDay.setHours(0, 0, 0, 0); // Normalize to start of day for iteration

    const endIterationDate = new Date(endDate);
    endIterationDate.setHours(23, 59, 59, 999); // Normalize to end of day for iteration

    while (currentDay.getTime() <= endIterationDate.getTime()) {
      const dateKey = currentDay.toISOString().split("T")[0]; // YYYY-MM-DD format for key
      // Hijri date placeholder. This needs to be replaced with actual conversion if possible.
      // For now, using a simple mock if the data doesn't provide it
      const hijriDatePlaceholder =
        "H " +
        (currentDay.getMonth() + 1).toString().padStart(2, "0") +
        "/" +
        currentDay.getDate().toString().padStart(2, "0") +
        "/" +
        currentDay.getFullYear();

      dailyDataMap[dateKey] = {
        dateLabel: this.formatHijriDate(hijriDatePlaceholder),
        date_g: dateKey,
        date_h: hijriDatePlaceholder,
        absences: 0,
        late: 0,
        fines: 0,
        rewards: 0,
      };
      currentDay.setDate(currentDay.getDate() + 1);
      currentDay.setHours(0, 0, 0, 0); // Reset hours for the next day
    }

    // Process Absences
    schoolData.absences.forEach((absence) => {
      const dateKey = absence.date_g
        ? new Date(absence.date_g.split(" ")[0]).toISOString().split("T")[0]
        : null;
      if (
        dateKey &&
        dailyDataMap[dateKey] &&
        studentIdsInRegion.has(Number(absence.student_id)) &&
        this.isDateInRange(absence.date_g, startDate, endDate)
      ) {
        dailyDataMap[dateKey].absences++;
        if (absence.date_h) dailyDataMap[dateKey].date_h = absence.date_h;
        dailyDataMap[dateKey].dateLabel = this.formatHijriDate(
          dailyDataMap[dateKey].date_h
        );
      }
    });

    // Process Attendance (for late status)
    schoolData.attendance.forEach((record) => {
      const dateKey = record.date_g
        ? new Date(record.date_g.split(" ")[0]).toISOString().split("T")[0]
        : null;
      if (
        dateKey &&
        dailyDataMap[dateKey] &&
        studentIdsInRegion.has(Number(record.student_id)) &&
        this.isDateInRange(record.date_g, startDate, endDate)
      ) {
        // Changed this line:
        if (record.status === "VIOLATION") {
          // <-- Change 'late' to 'VIOLATION' here
          dailyDataMap[dateKey].late++;
        }

        if (record.date_h) dailyDataMap[dateKey].date_h = record.date_h;
        dailyDataMap[dateKey].dateLabel = this.formatHijriDate(
          dailyDataMap[dateKey].date_h
        );
      }
    });

    // Process Penalties
    schoolData.parentPenalties.forEach((penalty) => {
      const dateKey = penalty.penalty_date_g
        ? new Date(penalty.penalty_date_g.split(" ")[0])
            .toISOString()
            .split("T")[0]
        : null;
      if (
        dateKey &&
        dailyDataMap[dateKey] &&
        studentIdsInRegion.has(Number(penalty.student_id)) &&
        this.isDateInRange(penalty.penalty_date_g, startDate, endDate)
      ) {
        dailyDataMap[dateKey].fines += penalty.amount_due || 0;
        if (penalty.penalty_date_h)
          dailyDataMap[dateKey].date_h = penalty.penalty_date_h;
        dailyDataMap[dateKey].dateLabel = this.formatHijriDate(
          dailyDataMap[dateKey].date_h
        );
      }
    });

    // Process Rewards
    schoolData.rewards.forEach((reward) => {
      const dateKey = reward.issued_at
        ? new Date(reward.issued_at.split(" ")[0]).toISOString().split("T")[0]
        : null;
      if (
        dateKey &&
        dailyDataMap[dateKey] &&
        studentIdsInRegion.has(Number(reward.student_id)) &&
        this.isDateInRange(reward.issued_at, startDate, endDate)
      ) {
        dailyDataMap[dateKey].rewards++;
      }
    });

    const totalStudentsInRegionCount = studentsInRegion.length;

    return Object.values(dailyDataMap)
      .map((dayStats) => {
        const actualPresentStudents = Math.max(
          0,
          totalStudentsInRegionCount - dayStats.absences - dayStats.late
        );
        const attendanceRate =
          totalStudentsInRegionCount > 0
            ? Math.round(
                (actualPresentStudents / totalStudentsInRegionCount) * 100
              )
            : 0;
        return {
          dateLabel: dayStats.dateLabel,
          date_g: dayStats.date_g,
          attendanceRate: attendanceRate,
          fines: dayStats.fines,
          late: dayStats.late,
          absences: dayStats.absences,
          rewards: dayStats.rewards,
        };
      })
      .sort(
        (a, b) => new Date(a.date_g).getTime() - new Date(b.date_g).getTime()
      );
  }

  static formatHijriDate(hijriDateString: string): string {
    if (
      !hijriDateString ||
      (!hijriDateString.includes("-") && !hijriDateString.includes("/"))
    ) {
      return "Unknown Date";
    }
    const parts = hijriDateString.replace(/\//g, "-").split("-");
    if (parts.length < 3) return hijriDateString;

    let year = parts[0],
      month = parts[1],
      day = parts[2];

    if (parts[0].length === 4) {
      // Assume YYYY-MM-DD or YYYY/MM/DD
      year = parts[0];
      month = parts[1];
      day = parts[2];
    } else {
      // Assume DD-MM-YYYY or DD/MM/YYYY
      day = parts[0];
      month = parts[1];
      year = parts[2];
    }

    const monthNum = parseInt(month, 10);
    const monthNames = [
      "Muharram",
      "Safar",
      "Rabi al-awwal",
      "Rabi al-thani",
      "Jumada al-ula",
      "Jumada al-thani",
      "Rajab",
      "Shaaban",
      "Ramadan",
      "Shawwal",
      "Dhu al-Qidah",
      "Dhu al-Hijjah",
    ];
    if (monthNum >= 1 && monthNum <= 12) {
      return `${parseInt(day, 10)} ${monthNames[monthNum - 1]}`;
    }
    return hijriDateString;
  }

  public static getStudentsInSchools(schoolIds: number[]): number[] {
    const studentsInSchools = schoolData.students.filter((student) => {
      const isIncluded = schoolIds.includes(student.school_id);

      return isIncluded;
    });

    if (studentsInSchools.length > 0) {
    } else {
      if (schoolData.students.length > 0) {
      } else {
        console.log("No students in schoolData.students at all.");
      }
    }

    return studentsInSchools.map((s) => s.student_id);
  }

  public static getStudentsInSchool(schoolId: number): Student[] {
    const allStudents = schoolData.students;

    if (!Array.isArray(allStudents) || allStudents.length === 0) {
      console.log("No students in schoolData.students at all.");
      return [];
    }

    const studentsInSchool = allStudents.filter(
      (student) => student.school_id === schoolId
    );

    console.log("School ID passed:", schoolId);
    console.log("All student school_ids:", allStudents);

    if (studentsInSchool.length === 0) {
      console.log(`No students found in school ID: ${schoolId}`);
    }

    return studentsInSchool;
  }

  static getReasonForExcuse(reasonId: number, lang: string): string {
    // Change parameter to single number
    const reason = schoolData.excuseReasons.find(
      (r) => r.reason_id === reasonId
    );
    return lang === "ar" ? reason.description_ar : reason.description_en;
  }

  static getCityById(cityId: number): City | undefined {
    if (!schoolData.cities) return undefined;
    return schoolData.cities.find((c) => c.city_id === cityId);
  }

  static getSchoolNameById(schoolId: number, lang: string): string {
    const school = schoolData.schools?.find((s) => s.school_id === schoolId);
    if (!school) {
      return lang === "ar" ? "مدرسة غير معروفة" : "Unknown School";
    }
    return lang === "ar" ? school.name_ar : school.name_en;
  }

  static getStudentDetailsById(
    studentId: number,
    dateRange: { start: Date; end: Date } | null = null
  ): StudentDetails | null {
    try {
      if (!schoolData.students) return null;
      const student = schoolData.students.find(
        (s) => s.student_id === studentId
      );
      if (!student) return null;

      const school = schoolData.schools?.find(
        (s) => s.school_id === student.school_id
      );

      const parentRelation = schoolData.parent_students?.find(
        (ps) => Number(ps.student_id) === studentId
      );
      const parent =
        parentRelation && schoolData.parents
          ? schoolData.parents.find(
              (p) => p.parent_id === parentRelation.parent_id
            )
          : undefined;
      console.log("parent", schoolData.parents[0]);
      // Filter records by date range if provided
      const filterByDate = (dateStr: string) => {
        if (!dateRange) return true;
        const date = new Date(dateStr);
        // Ensure comparison is inclusive for both start and end
        return (
          date.getTime() >= dateRange.start.getTime() &&
          date.getTime() <= dateRange.end.getTime()
        );
      };

      // --- Core Logic for Attendance Calculations ---

      const studentAbsenceRecords =
        schoolData.absences?.filter(
          (a) => Number(a.student_id) === studentId && filterByDate(a.date_g)
        ) || [];

      const studentAttendanceRecords =
        schoolData.attendance?.filter(
          (a) => Number(a.student_id) === studentId && filterByDate(a.date_g)
        ) || [];

      // Define counts based on the filtered records
      const totalAttendanceEntries = studentAttendanceRecords.length;
      const totalAbsenceEntries = studentAbsenceRecords.length;

      // totalExpectedDays is the denominator for rates
      // It's the sum of all days the student was either marked absent or had an attendance record
      const totalExpectedDays = totalAttendanceEntries + totalAbsenceEntries;

      // Corrected attendance, late, and absence calculations
      const presentDays = studentAttendanceRecords.filter(
        (rec) => rec.status === "IN_TIME"
      ).length;
      const lateDays = studentAttendanceRecords.filter(
        (rec) => rec.status === "VIOLATION"
      ).length;
      const absentDays = totalAbsenceEntries; // Already filtered above

      // Calculate rates only if totalExpectedDays is not zero to avoid division by zero
      const attendanceRate =
        totalExpectedDays > 0
          ? (presentDays + lateDays) / totalExpectedDays
          : 0;
      const lateRate = totalExpectedDays > 0 ? lateDays / totalExpectedDays : 0;
      const absenceRate =
        totalExpectedDays > 0 ? absentDays / totalExpectedDays : 0;

      // console.log("Student ID:", studentId);
      // console.log("Date Range:", dateRange);
      // console.log("Total Attendance Entries (IN_TIME + VIOLATION):", totalAttendanceEntries);
      // console.log("Total Absence Entries:", totalAbsenceEntries);
      // console.log("Total Expected Days (Denominator):", totalExpectedDays);
      // console.log("Present Days (IN_TIME):", presentDays);
      // console.log("Late Days (VIOLATION):", lateDays);
      // console.log("Absent Days:", absentDays);
      // console.log("Attendance Rate:", attendanceRate.toFixed(2));
      // console.log("Late Rate:", lateRate.toFixed(2));
      // console.log("Absence Rate:", absenceRate.toFixed(2));

      // --- End Core Logic for Attendance Calculations ---
      console.log("dettt", dateRange);
      console.log("dettt", attendanceRate);

      return {
        student,
        school,
        parent,
        attendanceSummary: {
          totalDays: totalExpectedDays, // This now reflects expected days based on records
          presentDays: presentDays,
          absentDays: absentDays,
          lateDays: lateDays,
          attendanceRate: attendanceRate, // Pass rates
          lateRate: lateRate,
          absenceRate: absenceRate,
        },
        excuses:
          schoolData.excuses?.filter(
            (e) => Number(e.student_id) === studentId
          ) || [],
        penalties:
          schoolData.parentPenalties?.filter(
            (p) =>
              Number(p.student_id) === studentId &&
              filterByDate(p.penalty_date_g)
          ) || [],
        rewards:
          schoolData.rewards?.filter(
            (r) =>
              Number(r.student_id) === studentId && filterByDate(r.issued_at)
          ) || [],
      };
    } catch (error) {
      console.error("Error getting student details by ID:", studentId, error);
      return null;
    }
  }

  static async getExcuseDetailsById(
    excuseId: string // Keep this as string, as your IDs are strings like "ec58"
  ): Promise<Excuse | null> {
    try {
      console.log(
        `DataService: Attempting to fetch excuse details for ID: ${excuseId}`
      );

      const response = await fetch(
        `${JSON_SERVER_BASE_URL}/excuses/${excuseId}`
      );
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`DataService: Excuse with ID ${excuseId} not found.`);
          return null; // Return null if not found
        }
        const errorText = await response.text(); // Get more details if available
        throw new Error(
          `HTTP error! Status: ${response.status}, Details: ${errorText}`
        );
      }

      const excuse: Excuse = await response.json();
      return excuse;
    } catch (error) {
      console.error(
        `DataService: Error getting Excuse details by ID ${excuseId}:`,
        error
      );
      return null; // Return null on any error during fetching
    }
  }

  static getAcademicYearRange(): { start: Date; end: Date } {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed (0=Jan, 11=Dec)

    // Academic year starts in September (month 8)
    let academicYearStart = new Date(currentYear, 8, 1);

    // If current month is before September, use previous year
    if (currentMonth < 8) {
      academicYearStart = new Date(currentYear - 1, 8, 1);
    }

    return {
      start: academicYearStart,
      end: new Date(), // today
    };
  }

  static validateDataStructure(): void {
    if (!schoolData) {
      console.error("DataService: schoolData is not loaded!");
      return;
    }
    console.log(
      "DataService: Data structure validated. Data loaded successfully."
    );
    // Optional: Add checks for critical arrays
    if (!schoolData.students)
      console.warn("DataService: 'students' array is missing from schoolData.");
    if (!schoolData.schools)
      console.warn("DataService: 'schools' array is missing from schoolData.");
    if (!schoolData.cities)
      console.warn("DataService: 'cities' array is missing from schoolData.");
    if (!schoolData.regions)
      console.warn("DataService: 'regions' array is missing from schoolData.");
    if (!schoolData.attendance)
      console.warn(
        "DataService: 'attendance' array is missing from schoolData."
      );
    if (!schoolData.absences)
      console.warn("DataService: 'absences' array is missing from schoolData.");
    if (!schoolData.parentPenalties)
      console.warn(
        "DataService: 'parentPenalties' array is missing from schoolData."
      );
    if (!schoolData.rewards)
      console.warn("DataService: 'rewards' array is missing from schoolData.");
  }

  static getAllMinisterialNumbers(): number[] {
    if (!schoolData.schools) return [];
    const numbers = new Set<number>();
    schoolData.schools.forEach((school) => {
      if (school.ministerial_number) {
        numbers.add(school.ministerial_number);
      }
    });
    return Array.from(numbers).sort((a, b) => a - b);
  }
  static getAllEducationTypes(): string[] {
    if (!schoolData.educationTypes) return [];
    const types = new Set<string>();
    schoolData.educationTypes.forEach((school) => {
      if (school.description_en) {
        types.add(school.description_en);
      }
    });
    return Array.from(types);
  }

  static getAllSchoolTypes(): string[] {
    if (!schoolData.schools) return [];
    const types = new Set<string>();
    schoolData.schools.forEach((school) => {
      if (school.type_en) {
        // Assuming type_en is the English description like "Female", "Male"
        types.add(school.type_en);
      }
    });
    return Array.from(types).sort();
  }

  static getAllStudentGenders(): string[] {
    if (!schoolData.students) return [];
    const genders = new Set<string>();
    schoolData.students.forEach((student) => {
      if (student.gender) {
        genders.add(student.gender);
      }
    });
    return Array.from(genders).sort();
  }

  /**
   * Filters schools based on criteria including ministerial number and type.
   * @param regionIds - Array of selected region IDs.
   * @param cityIds - Array of selected city IDs.
   * @param educationTypeIds - Array of selected education type IDs.
   * @param ministerialNumber - Optional, specific ministerial number to filter by.
   * @param schoolType - Optional, specific school type ('Female', 'Male') to filter by.
   * @returns Filtered array of School objects.
   */
  static filterSchools(
    regionIds: number[],
    cityIds: number[],
    educationTypeIds: number[],
    ministerialNumber?: number | null, // Added optional ministerialNumber
    schoolType?: string | null // Added optional schoolType
  ): School[] {
    let filtered = schoolData.schools || [];

    if (regionIds.length > 0) {
      const citiesInRegions =
        schoolData.cities
          ?.filter((city) => regionIds.includes(city.region_id))
          .map((city) => city.city_id) || [];
      filtered = filtered.filter((school) =>
        citiesInRegions.includes(school.city_id)
      );
    }

    if (cityIds.length > 0) {
      filtered = filtered.filter((school) => cityIds.includes(school.city_id));
    }

    if (educationTypeIds.length > 0) {
      filtered = filtered.filter((school) =>
        educationTypeIds.includes(school.education_type_id)
      );
    }

    if (ministerialNumber !== null && ministerialNumber !== undefined) {
      filtered = filtered.filter(
        (school) => school.ministerial_number === ministerialNumber
      );
    }

    if (schoolType !== null && schoolType !== undefined && schoolType !== "") {
      filtered = filtered.filter((school) => school.type_en === schoolType);
    }

    return filtered;
  }

  /**
   * Filters students based on school IDs and gender.
   * @param schoolIds - Array of school IDs to filter students by.
   * @param studentGender - Optional, specific student gender ('Male', 'Female') to filter by.
   * @returns Filtered array of Student objects.
   */
  static filterStudentsBySchoolsAndGender(
    schoolIds: number[],
    studentGender?: string | null
  ): Student[] {
    let filteredStudents =
      schoolData.students?.filter((student) =>
        schoolIds.includes(student.school_id)
      ) || [];

    if (
      studentGender !== null &&
      studentGender !== undefined &&
      studentGender !== ""
    ) {
      filteredStudents = filteredStudents.filter(
        (student) => student.gender === studentGender
      );
    }

    return filteredStudents;
  }
}
