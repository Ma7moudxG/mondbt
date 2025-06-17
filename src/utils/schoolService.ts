import { MergedSchoolData } from "@/services/dataService";

// utils/schoolStorage.client.ts
export function saveSchoolData(data: MergedSchoolData) {
  if (typeof window !== "undefined") {
    localStorage.setItem("schoolDataJson", JSON.stringify(data));
  }
}
