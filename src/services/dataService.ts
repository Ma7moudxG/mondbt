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

export interface Penalty {
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
  student_reward_id: number;
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
  city_id: number;
  area_id: number;
  education_type_id: number;
  name_en: string;
  name_ar: string;
  educational_level_en?: string;
  educational_level_ar?: string;
  ministerial_number?: number;
  type_en: string;
  type_ar: string;
  address_en?: string;
  address_ar?: string;
  latitude?: number;
  longitude?: number;
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
  gender: string;
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
  status: 'IN_TIME' | 'VIOLATION' | 'late' | string;
}

export interface Excuse {
  excuse_id: number;
  student_id: number;
  description: string;
  date_g: string;
  status: string;
}

export interface ExcuseAttachment {
  attachment_id: number;
  excuse_id: number;
  file_url: string;
}

export interface ExcuseReason {
  reason_id: number;
  code: string;
  description_en: string;
  description_ar: string;
}

export interface GenericJsonDataItem {
  [key: string]: any;
}

// --- Merged School Data Interface ---
interface MergedSchoolData {
  areas: Area[];
  cities: City[];
  educationTypes: EducationType[];
  excuses: Excuse[];
  excuseAttachments: ExcuseAttachment[];
  excuseReasons: ExcuseReason[];
  genericJsonData: GenericJsonDataItem[];
  parents: Parent[];
  parentPenalties: Penalty[];
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
import schoolDataJson from '@/data/merged_school_data.json';
const schoolData: MergedSchoolData = schoolDataJson as MergedSchoolData;


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
  excuses: number;
  fines: number;
}

export interface FilterValues {
  region: string;
  city: string;
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
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
  };
  excuses: Excuse[];
  penalties: Penalty[];
  rewards: Reward[];
}

// --- DataService Class (FIXED FUNCTIONS with Debugging) ---
export default class DataService {

  static getAllRegions(): Region[] {
    return schoolData.regions || [];
  }

  // Updated isDateInRange with detailed logging
  static isDateInRange(dateString: string, startDate: Date, endDate: Date): boolean {
    if (!dateString) {
      console.log(`  DEBUG (isDateInRange): No date string provided. Returning false.`);
      return false;
    }

    // Try to parse the date part only (e.g., "YYYY-MM-DD" from "YYYY-MM-DD HH:MM:SS")
    const recordDate = new Date(dateString.split(' ')[0]);
    if (isNaN(recordDate.getTime())) {
      console.warn(`  DEBUG (isDateInRange): Invalid date string "${dateString}" found. Returning false.`);
      return false;
    }

    // Normalize record date to start of its day (local time)
    const startOfDayRecord = new Date(recordDate);
    startOfDayRecord.setHours(0, 0, 0, 0);

    // Normalize start and end of the comparison range to start/end of their days (local time)
    const startOfRange = new Date(startDate);
    startOfRange.setHours(0, 0, 0, 0);

    const endOfRange = new Date(endDate);
    endOfRange.setHours(23, 59, 59, 999);

    const isAfterOrEqualStart = startOfDayRecord.getTime() >= startOfRange.getTime();
    const isBeforeOrEqualEnd = startOfDayRecord.getTime() <= endOfRange.getTime();

    console.log(`  DEBUG (isDateInRange) Check:
    Record Date String: "${dateString}"
    Parsed Record Date (normalized): ${startOfDayRecord.toLocaleString()} (timestamp: ${startOfDayRecord.getTime()})
    Range Start Date (normalized):   ${startOfRange.toLocaleString()} (timestamp: ${startOfRange.getTime()})
    Range End Date (normalized):     ${endOfRange.toLocaleString()} (timestamp: ${endOfRange.getTime()})
    Is After/Equal Start: ${isAfterOrEqualStart}
    Is Before/Equal End:  ${isBeforeOrEqualEnd}
    Overall Result: ${isAfterOrEqualStart && isBeforeOrEqualEnd}
    ---------------------------------------------------`);

    return isAfterOrEqualStart && isBeforeOrEqualEnd;
  }

  static getRegionById(regionId: number): Region | undefined {
    return schoolData.regions?.find(r => r.region_id === regionId);
  }

  static getStudentsBySchoolId(schoolId: number): Student[] {
    return schoolData.students?.filter(student => student.school_id === schoolId) || [];
  }

  static getStudentsByParentId(parentId: number): Student[] {
    const studentIds = schoolData.parent_students
      ?.filter(rel => rel.parent_id === parentId)
      .map(rel => rel.student_id) || [];
    return schoolData.students?.filter(student => studentIds.includes(student.student_id)) || [];
  }

  // Ensure this function correctly links students to regions via schools and cities
  private static getStudentsInRegion(regionId: number): Student[] {
    if (!schoolData.students || !schoolData.schools || !schoolData.cities) {
      console.warn("DEBUG (getStudentsInRegion): Missing students, schools, or cities data. Returning empty array.");
      return [];
    }

    const studentsInRegion = schoolData.students.filter(s => {
      const school = schoolData.schools.find(sch => sch.school_id === s.school_id);
      if (!school) {
        // console.warn(`DEBUG (getStudentsInRegion): Student ${s.student_id} linked to unknown school ${s.school_id}.`);
        return false;
      }
      const city = schoolData.cities.find(c => c.city_id === school.city_id);
      if (!city) {
        // console.warn(`DEBUG (getStudentsInRegion): School ${school.school_id} linked to unknown city ${school.city_id}.`);
        return false;
      }
      return city?.region_id === regionId;
    });
    // This is important for understanding which students are considered in the region
    console.log(`DEBUG (getStudentsInRegion): Found ${studentsInRegion.length} students for Region ID ${regionId}. Sample IDs:`, 
                studentsInRegion.slice(0, 5).map(s => s.student_id), // Show a sample of IDs
                studentsInRegion.length > 5 ? '...' : ''
    );
    return studentsInRegion;
  }

  static getSchoolDays(start: Date, end: Date): number {
    let count = 0;
    const current = new Date(start);
    current.setHours(0, 0, 0, 0); // Ensure start of day for iteration
    const finalEnd = new Date(end);
    finalEnd.setHours(0, 0, 0, 0); // Ensure start of day for iteration end condition

    while (current.getTime() <= finalEnd.getTime()) { // Use getTime() for reliable comparison
      const day = current.getDay(); // Sunday = 0, Monday = 1, ..., Friday = 5, Saturday = 6
      if (day !== 5 && day !== 6) { // Assuming Friday and Saturday are weekends
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
    console.groupCollapsed(`DataService: Calculating region stats for region ID ${regionId} from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);
    console.log(`  Requested Start Date (raw): ${startDate.toISOString()}`);
    console.log(`  Requested End Date (raw): ${endDate.toISOString()}`);


    const studentsInRegion = this.getStudentsInRegion(regionId);
    console.log(`  Found ${studentsInRegion.length} students in region ${regionId}.`);
    if (studentsInRegion.length === 0) {
      console.log("  No students found for this region. Returning zeros.");
      console.groupEnd();
      return { attendance: 0, absence: 0, late: 0, penalties: 0, rewards: 0, totalStudentsInRegion: 0 };
    }

    const studentIdsInRegion = new Set(studentsInRegion.map(s => s.student_id));
    console.log(`  DEBUG (getRegionStats): Student IDs considered for region ${regionId}:`, Array.from(studentIdsInRegion).slice(0, 10), (studentIdsInRegion.size > 10 ? '...' : ''));

    let totalAttendanceEvents = 0; // Count of IN_TIME attendance records
    let totalAbsenceEvents = 0;    // Count of records in the 'absences' array
    let totalLateEvents = 0;       // Count of 'late' status in 'attendance' records
    let totalFines = 0;
    let totalRewards = 0;

    // --- Process Attendance Records ---
    console.log(`\n--- Processing Attendance Records (${schoolData.attendance?.length || 0} total) ---`);
    schoolData.attendance?.forEach(record => {
      const recordStudentId = Number(record.student_id);
      const isInRegion = studentIdsInRegion.has(recordStudentId);
      const isDateValid = record.date_g && this.isDateInRange(record.date_g, startDate, endDate);

      if (!isInRegion || !isDateValid) {
        console.log(`  DEBUG (Attendance): Skipping record for student ${recordStudentId} on ${record.date_g}. In Region: ${isInRegion}, Date Valid: ${isDateValid}`);
        return; // Skip if not in region or date invalid
      }
      
      if (record.status === 'IN_TIME') {
        totalAttendanceEvents++;
        console.log(`  DEBUG (Attendance): IN_TIME record for student ${recordStudentId} on ${record.date_g}. Current total: ${totalAttendanceEvents}`);
      } else if (record.status === 'VIOLATION') {
        console.warn(`  DEBUG (Attendance): 'VIOLATION' status found for student ${recordStudentId} on ${record.date_g}. Not counted as IN_TIME/late/absence here.`);
      } else if (record.status === 'late') {
        totalLateEvents++;
        console.log(`  DEBUG (Attendance): LATE record for student ${recordStudentId} on ${record.date_g}. Current total late: ${totalLateEvents}`);
      }
    });
    console.log(`  Total 'IN_TIME' attendance events for region ${regionId}: ${totalAttendanceEvents}`);
    console.log(`  Total 'late' attendance events for region ${regionId}: ${totalLateEvents}`);

    // --- Process Absence Records ---
    console.log(`\n--- Processing Absence Records (${schoolData.absences?.length || 0} total) ---`);
    schoolData.absences?.forEach(absence => {
      const absenceStudentId = Number(absence.student_id);
      const isInRegion = studentIdsInRegion.has(absenceStudentId);
      const isDateValid = absence.date_g && this.isDateInRange(absence.date_g, startDate, endDate);

      if (!isInRegion || !isDateValid) {
        console.log(`  DEBUG (Absence): Skipping record for student ${absenceStudentId} on ${absence.date_g}. In Region: ${isInRegion}, Date Valid: ${isDateValid}`);
        return;
      }
      
      totalAbsenceEvents++;
      console.log(`  DEBUG (Absence): ABSENCE record for student ${absenceStudentId} on ${absence.date_g}. Current total: ${totalAbsenceEvents}`);
    });
    console.log(`Total full absence events (from 'absences' array) for region ${regionId}: ${totalAbsenceEvents}`);

    // --- Process Penalty Records ---
    console.log(`\n--- Processing Penalty Records (${schoolData.parentPenalties?.length || 0} total) ---`);
    schoolData.parentPenalties?.forEach(penalty => {
      const penaltyStudentId = Number(penalty.student_id);
      const isInRegion = studentIdsInRegion.has(penaltyStudentId);
      const isDateValid = penalty.penalty_date_g && this.isDateInRange(penalty.penalty_date_g, startDate, endDate);

      console.log(`  DEBUG (Penalty): Checking record for student ${penaltyStudentId}, date ${penalty.penalty_date_g}, amount ${penalty.amount_due}`);
      console.log(`    Is Student ${penaltyStudentId} in Region ${regionId}?: ${isInRegion}`);
      console.log(`    Is Date ${penalty.penalty_date_g} in Range [${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}]?: ${isDateValid}`);

      if (isInRegion && isDateValid) {
        totalFines += (penalty.amount_due || 0);
        console.log(`    !!! MATCH (Penalty) !!! Added ${penalty.amount_due}. Current Total Fines: ${totalFines}`);
      } else {
        console.log(`    SKIPPING (Penalty): Student In Region: ${isInRegion}, Date Valid: ${isDateValid}`);
      }
    });
    console.log(`Final calculated Total fines for region ${regionId}: ${totalFines}`);

    // --- Process Reward Records ---
    console.log(`\n--- Processing Reward Records (${schoolData.rewards?.length || 0} total) ---`);
    schoolData.rewards?.forEach(reward => {
      const rewardStudentId = Number(reward.student_id);
      const isInRegion = studentIdsInRegion.has(rewardStudentId);
      const isDateValid = reward.issued_at && this.isDateInRange(reward.issued_at, startDate, endDate); // Use issued_at

      console.log(`  DEBUG (Reward): Checking record for student ${rewardStudentId}, date ${reward.issued_at}`);
      console.log(`    Is Student ${rewardStudentId} in Region ${regionId}?: ${isInRegion}`);
      console.log(`    Is Date ${reward.issued_at} in Range [${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}]?: ${isDateValid}`);

      if (isInRegion && isDateValid) {
        totalRewards++;
        console.log(`    !!! MATCH (Reward) !!! Counted reward. Current Total Rewards: ${totalRewards}`);
      } else {
        console.log(`    SKIPPING (Reward): Student In Region: ${isInRegion}, Date Valid: ${isDateValid}`);
      }
    });
    console.log(`  Total rewards for region ${regionId}: ${totalRewards}`);

    const statsResult = {
      attendance: totalAttendanceEvents,
      absence: totalAbsenceEvents,
      late: totalLateEvents,
      penalties: totalFines,
      rewards: totalRewards,
      totalStudentsInRegion: studentsInRegion.length
    };
    console.log(`DataService: Final calculated stats for region ${regionId}:`, statsResult);
    console.groupEnd();
    return statsResult;
  }

  // --- Other existing methods (unchanged unless explicitly mentioned) ---

  static getRegionByName(name: string): Region | undefined {
    if (!schoolData.regions) return undefined;
    const normalizedName = name.trim().toLowerCase();
    return schoolData.regions.find(r =>
      r.name_en.toLowerCase() === normalizedName ||
      r.name_ar === name.trim()
    );
  }

  static getAbsencesByDateRange(start: Date, end: Date, regionId: number): Absence[] {
    if (!schoolData.absences) return [];
    const students = this.getStudentsInRegion(regionId);
    const studentIds = students.map(s => s.student_id);
    return schoolData.absences.filter(a =>
      studentIds.includes(Number(a.student_id)) &&
      this.isDateInRange(a.date_g, start, end)
    );
  }

  static getTotalFines(start: Date, end: Date, regionId: number): number {
    if (!schoolData.parentPenalties) return 0;
    const studentIdsInRegion = this.getStudentsInRegion(regionId).map(s => s.student_id);
    return this.sumPenalties(studentIdsInRegion, start, end);
  }

  static calculateAttendance(students: Student[], start: Date, end: Date): number {
    const totalPossibleAttendanceDays = students.length * this.getSchoolDays(start, end);
    const studentIds = students.map(s => s.student_id);

    const fullAbsenceDays = this.countAbsences(studentIds, start, end);
    const lateDays = this.countLateArrivals(studentIds, start, end);

    return totalPossibleAttendanceDays - fullAbsenceDays - lateDays;
  }

  static getTotalPenaltiesForParent(
    parentId: number,
    startDate?: Date,
    endDate?: Date
  ): number {
    const parentStudents = this.getStudentsByParentId(parentId);
    if (!parentStudents || parentStudents.length === 0) {
      return 0;
    }
    const studentIds = parentStudents.map(student => student.student_id);
    if (!schoolData.parentPenalties || !Array.isArray(schoolData.parentPenalties)) {
      console.warn("DataService: Penalties data is missing or invalid in schoolData.parentPenalties.");
      return 0;
    }
    const relevantPenalties = schoolData.parentPenalties.filter(penalty => {
      if (!studentIds.includes(Number(penalty.student_id))) {
        return false;
      }
      if (startDate && endDate) {
        if (!penalty.penalty_date_g) return false;
        return this.isDateInRange(penalty.penalty_date_g, startDate, endDate);
      }
      return true;
    });
    return relevantPenalties.reduce((sum, penalty) => sum + (penalty.amount_due || 0), 0);
  }

  static getPenaltiesForStudent(
    studentId: number,
    startDate?: Date,
    endDate?: Date
  ): Penalty[] {
    if (!schoolData.parentPenalties || !Array.isArray(schoolData.parentPenalties)) {
      console.warn("DataService: Penalties data is missing or invalid in schoolData.parentPenalties.");
      return [];
    }
    const studentPenalties = schoolData.parentPenalties.filter(penalty => {
      const penaltyStudentId = Number(penalty.student_id);
      const isStudentMatch = (penaltyStudentId === studentId);
      if (!isStudentMatch) {
        return false;
      }
      if (startDate && endDate) {
        if (!penalty.penalty_date_g) {
          return false;
        }
        const dateInRange = this.isDateInRange(penalty.penalty_date_g, startDate, endDate);
        return dateInRange;
      }
      return true;
    });
    return studentPenalties;
  }

  static getTotalPenaltiesForStudent(
    studentId: number,
    startDate?: Date,
    endDate?: Date
  ): number {
    const penalties = this.getPenaltiesForStudent(studentId, startDate, endDate);
    const total = penalties.reduce((sum, penalty) => {
      const amount = penalty.amount_due || 0;
      return sum + amount;
    }, 0);
    return total;
  }

  static getExcusesForStudent(
    studentId: number,
    startDate?: Date,
    endDate?: Date
  ): Excuse[] {
    if (!schoolData.excuses || !Array.isArray(schoolData.excuses)) {
      console.warn("DataService: Excuses data is missing or invalid in schoolData.");
      return [];
    }
    const studentExcuses = schoolData.excuses.filter(excuse => {
      if (Number(excuse.student_id) !== studentId) {
        return false;
      }
      if (startDate && endDate) {
        if (!excuse.date_g) return false;
        return this.isDateInRange(excuse.date_g, startDate, endDate);
      }
      return true;
    });
    return studentExcuses;
  }

  static countAbsences(studentIds: number[], start: Date, end: Date): number {
    if (!schoolData.absences) return 0;
    return schoolData.absences.filter(a =>
      studentIds.includes(Number(a.student_id)) &&
      this.isDateInRange(a.date_g, start, end)
    ).length;
  }

  static countLateArrivals(studentIds: number[], start: Date, end: Date): number {
    if (!schoolData.attendance) return 0;
    return schoolData.attendance.filter(a =>
      studentIds.includes(Number(a.student_id)) &&
      this.isDateInRange(a.date_g, start, end) &&
      a.status === 'late'
    ).length;
  }

  static sumPenalties(studentIds: number[], start: Date, end: Date): number {
    if (!schoolData.parentPenalties) return 0;
    return schoolData.parentPenalties.filter(p =>
      studentIds.includes(Number(p.student_id)) &&
      this.isDateInRange(p.penalty_date_g, start, end)
    ).reduce((sum, p) => sum + (p.amount_due || 0), 0);
  }

  static countRewards(studentIds: number[], start: Date, end: Date): number {
    if (!schoolData.rewards) return 0;
    return schoolData.rewards.filter(r =>
      studentIds.includes(Number(r.student_id)) &&
      this.isDateInRange(r.issued_at, start, end)
    ).length;
  }

  static getDailyStats(regionId: number, startDate: Date, endDate: Date) {
    if (!schoolData.absences || !schoolData.parentPenalties || !schoolData.attendance || !schoolData.rewards) {
      console.warn("DEBUG (getDailyStats): Missing one or more data arrays (absences, penalties, attendance, rewards). Returning empty array.");
      return [];
    }
    const studentsInRegion = this.getStudentsInRegion(regionId);
    const studentIdsInRegion = new Set(studentsInRegion.map(s => s.student_id));

    const dailyDataMap: Record<string, {
      dateLabel: string; date_g: string; date_h: string;
      absences: number; late: number; fines: number; rewards: number;
    }> = {};

    const currentDay = new Date(startDate);
    currentDay.setHours(0, 0, 0, 0); // Normalize to start of day for iteration

    const endIterationDate = new Date(endDate);
    endIterationDate.setHours(23, 59, 59, 999); // Normalize to end of day for iteration

    while (currentDay.getTime() <= endIterationDate.getTime()) {
      const dateKey = currentDay.toISOString().split('T')[0]; // YYYY-MM-DD format for key
      // Hijri date placeholder. This needs to be replaced with actual conversion if possible.
      // For now, using a simple mock if the data doesn't provide it
      const hijriDatePlaceholder = "H " + (currentDay.getMonth() + 1).toString().padStart(2, '0') + "/" + currentDay.getDate().toString().padStart(2, '0') + "/" + currentDay.getFullYear();

      dailyDataMap[dateKey] = {
        dateLabel: this.formatHijriDate(hijriDatePlaceholder),
        date_g: dateKey,
        date_h: hijriDatePlaceholder,
        absences: 0, late: 0, fines: 0, rewards: 0
      };
      currentDay.setDate(currentDay.getDate() + 1);
      currentDay.setHours(0, 0, 0, 0); // Reset hours for the next day
    }

    // Process Absences
    schoolData.absences.forEach(absence => {
      const dateKey = absence.date_g ? new Date(absence.date_g.split(' ')[0]).toISOString().split('T')[0] : null;
      if (dateKey && dailyDataMap[dateKey] && studentIdsInRegion.has(Number(absence.student_id)) &&
        this.isDateInRange(absence.date_g, startDate, endDate)) {
        dailyDataMap[dateKey].absences++;
        if (absence.date_h) dailyDataMap[dateKey].date_h = absence.date_h;
        dailyDataMap[dateKey].dateLabel = this.formatHijriDate(dailyDataMap[dateKey].date_h);
      }
    });

    // Process Attendance (for late status)
    schoolData.attendance.forEach(record => {
      const dateKey = record.date_g ? new Date(record.date_g.split(' ')[0]).toISOString().split('T')[0] : null;
      if (dateKey && dailyDataMap[dateKey] && studentIdsInRegion.has(Number(record.student_id)) &&
        this.isDateInRange(record.date_g, startDate, endDate)) {
        if (record.status === 'late') {
          dailyDataMap[dateKey].late++;
        }
        if (record.date_h) dailyDataMap[dateKey].date_h = record.date_h;
        dailyDataMap[dateKey].dateLabel = this.formatHijriDate(dailyDataMap[dateKey].date_h);
      }
    });

    // Process Penalties
    schoolData.parentPenalties.forEach(penalty => {
      const dateKey = penalty.penalty_date_g ? new Date(penalty.penalty_date_g.split(' ')[0]).toISOString().split('T')[0] : null;
      if (dateKey && dailyDataMap[dateKey] && studentIdsInRegion.has(Number(penalty.student_id)) &&
        this.isDateInRange(penalty.penalty_date_g, startDate, endDate)) {
        dailyDataMap[dateKey].fines += penalty.amount_due || 0;
        if (penalty.penalty_date_h) dailyDataMap[dateKey].date_h = penalty.penalty_date_h;
        dailyDataMap[dateKey].dateLabel = this.formatHijriDate(dailyDataMap[dateKey].date_h);
      }
    });

    // Process Rewards
    schoolData.rewards.forEach(reward => {
      const dateKey = reward.issued_at ? new Date(reward.issued_at.split(' ')[0]).toISOString().split('T')[0] : null;
      if (dateKey && dailyDataMap[dateKey] && studentIdsInRegion.has(Number(reward.student_id)) &&
        this.isDateInRange(reward.issued_at, startDate, endDate)) {
        dailyDataMap[dateKey].rewards++;
      }
    });

    const totalStudentsInRegionCount = studentsInRegion.length;

    return Object.values(dailyDataMap).map(dayStats => {
      const actualPresentStudents = Math.max(0, totalStudentsInRegionCount - dayStats.absences - dayStats.late);
      const attendanceRate = totalStudentsInRegionCount > 0
        ? Math.round((actualPresentStudents / totalStudentsInRegionCount) * 100)
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
    }).sort((a, b) => new Date(a.date_g).getTime() - new Date(b.date_g).getTime());
  }

  static formatHijriDate(hijriDateString: string): string {
    if (!hijriDateString || (!hijriDateString.includes('-') && !hijriDateString.includes('/'))) {
      return "Unknown Date";
    }
    const parts = hijriDateString.replace(/\//g, '-').split('-');
    if (parts.length < 3) return hijriDateString;

    let year = parts[0], month = parts[1], day = parts[2];

    if (parts[0].length === 4) { // Assume YYYY-MM-DD or YYYY/MM/DD
      year = parts[0];
      month = parts[1];
      day = parts[2];
    } else { // Assume DD-MM-YYYY or DD/MM/YYYY
      day = parts[0];
      month = parts[1];
      year = parts[2];
    }

    const monthNum = parseInt(month, 10);
    const monthNames = [
      'Muharram', 'Safar', 'Rabi al-awwal', 'Rabi al-thani',
      'Jumada al-ula', 'Jumada al-thani', 'Rajab', 'Shaaban',
      'Ramadan', 'Shawwal', 'Dhu al-Qidah', 'Dhu al-Hijjah'
    ];
    if (monthNum >= 1 && monthNum <= 12) {
      return `${parseInt(day, 10)} ${monthNames[monthNum - 1]}`;
    }
    return hijriDateString;
  }

  static getStudentsInSchools(schoolIds: number[]): Student[] {
    if (!schoolData.students) return [];
    return schoolData.students.filter(student => schoolIds.includes(student.school_id));
  }

  static getExcusesForStudents(studentIds: number[]): Excuse[] {
    if (!schoolData.excuses) {
      return [];
    }
    return schoolData.excuses.filter(excuse => studentIds.includes(Number(excuse.student_id)));
  }

  static getCityById(cityId: number): City | undefined {
    if (!schoolData.cities) return undefined;
    return schoolData.cities.find(c => c.city_id === cityId);
  }

  static getSchoolsByFilters(filters: FilterValues): School[] {
    if (!schoolData.schools) return [];
    return schoolData.schools.filter(school => {
      const city = this.getCityById(school.city_id);
      const region = city ? this.getRegionById(city.region_id) : undefined;

      return (
        (!filters.region || region?.name_ar === filters.region || region?.name_en === filters.region) &&
        (!filters.city || city?.name_ar === filters.city || city?.name_en === filters.city) &&
        (!filters.schoolName || school.name_ar.includes(filters.schoolName) || school.name_en.toLowerCase().includes(filters.schoolName.toLowerCase())) &&
        (!filters.schoolType || school.type_en === filters.schoolType) &&
        (!filters.ministryNumber || school.ministerial_number?.toString() === filters.ministryNumber) &&
        (!filters.sex || school.type_en.toLowerCase() === filters.sex.toLowerCase())
      );
    });
  }

  static getSchoolNameById(schoolId: number, lang: 'en' | 'ar' = 'en'): string {
    const school = schoolData.schools?.find(s => s.school_id === schoolId);
    if (!school) {
      return lang === 'ar' ? 'مدرسة غير معروفة' : 'Unknown School';
    }
    return lang === 'ar' ? school.name_ar : school.name_en;
  }

  static getStudentDetailsById(studentId: number): StudentDetails | null {
    try {
      if (!schoolData.students) return null;
      const student = schoolData.students.find(s => s.student_id === studentId);
      if (!student) return null;

      const school = schoolData.schools?.find(s => s.school_id === student.school_id);

      const parentRelation = schoolData.parent_students?.find(ps => Number(ps.student_id) === studentId);
      const parent = parentRelation && schoolData.parents
        ? schoolData.parents.find(p => p.parent_id === parentRelation.parent_id)
        : undefined;

      const studentAbsenceRecords = schoolData.absences?.filter(a => Number(a.student_id) === studentId) || [];
      const studentAttendanceRecords = schoolData.attendance?.filter(a => Number(a.student_id) === studentId) || [];

      const now = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      const totalPossibleDays = this.getSchoolDays(oneMonthAgo, now);

      const absentDays = studentAbsenceRecords.length;
      const lateDays = studentAttendanceRecords.filter(rec => rec.status === 'late').length;
      const presentDays = Math.max(0, totalPossibleDays - absentDays - lateDays);

      return {
        student,
        school,
        parent,
        attendanceSummary: {
          totalDays: totalPossibleDays,
          presentDays: presentDays,
          absentDays: absentDays,
          lateDays: lateDays
        },
        excuses: schoolData.excuses?.filter(e => Number(e.student_id) === studentId) || [],
        penalties: schoolData.parentPenalties?.filter(p => Number(p.student_id) === studentId) || [],
        rewards: schoolData.rewards?.filter(r => Number(r.student_id) === studentId) || [],
      };
    } catch (error) {
      console.error("Error getting student details by ID:", studentId, error);
      return null;
    }
  }

  static validateDataStructure(): void {
    if (!schoolData) {
      console.error("DataService: schoolData is not loaded!");
      return;
    }
    console.log("DataService: Data structure validated. Data loaded successfully.");
    // Optional: Add checks for critical arrays
    if (!schoolData.students) console.warn("DataService: 'students' array is missing from schoolData.");
    if (!schoolData.schools) console.warn("DataService: 'schools' array is missing from schoolData.");
    if (!schoolData.cities) console.warn("DataService: 'cities' array is missing from schoolData.");
    if (!schoolData.regions) console.warn("DataService: 'regions' array is missing from schoolData.");
    if (!schoolData.attendance) console.warn("DataService: 'attendance' array is missing from schoolData.");
    if (!schoolData.absences) console.warn("DataService: 'absences' array is missing from schoolData.");
    if (!schoolData.parentPenalties) console.warn("DataService: 'parentPenalties' array is missing from schoolData.");
    if (!schoolData.rewards) console.warn("DataService: 'rewards' array is missing from schoolData.");
  }
}