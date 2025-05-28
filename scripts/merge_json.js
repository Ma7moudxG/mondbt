// scripts/merge_json.js
const fs = require('fs');
const path = require('path');

// Define the directory where your split JSON files are located
const dataDir = path.join(__dirname, '../src/data'); // Adjust if your script is elsewhere or data is deeper

// Define the path for the output merged JSON file
const outputFilePath = path.join(dataDir, 'merged_school_data.json');

// --- Configuration for Merging ---
// This map helps create meaningful keys in your final merged JSON
// and tells the script how to handle different file patterns.
const keyConfig = {
    // For files split into parts (e.g., AbsenceRecord_part1.json)
    "AbsenceRecord": { keyName: "absences", isArrayParts: true },
    "AttendanceRecord": { keyName: "attendance", isArrayParts: true }, // If you plan to use student attendance records
    "StudentReward": { keyName: "rewards", isArrayParts: true },
  
    // For standalone files (e.g., Parent.json).
    // Ensure your actual JSON filenames (e.g., "City.json", "Parent.json", "Student.json", "Penalty.json")
    // match these base names.
    "Area": { keyName: "areas" }, // If you have Area.json
    "City": { keyName: "cities" },
    "EducationType": { keyName: "educationTypes" }, // If you have EducationType.json
    "Excuse": { keyName: "excuses" },
    "ExcuseAttachment": { keyName: "excuseAttachments" }, // If you have ExcuseAttachment.json
    "ExcuseReason": { keyName: "excuseReasons" }, // If you have ExcuseReason.json
    "Parent": { keyName: "parents" },
    "ParentPenalty": { keyName: "parentPenalties" }, // If this is a distinct entity
    "ParentStudent": { keyName: "parent_students" }, //Snake_case to match DataService usage
    "Penalty": { keyName: "penalties" }, // Assuming "Penalty.json" or similar contains penalty records
    "PenaltyType": { keyName: "penaltyTypes" },
    "Region": { keyName: "regions" },
    "RewardType": { keyName: "rewardTypes" },
    "School": { keyName: "schools" },
    "Student": { keyName: "students" },
    "JSON": { keyName: "genericJsonData" } // For the file named JSON.json, if it exists
  };
// --- End Configuration ---

const mergedData = {};
const partsData = {}; // To temporarily store array parts

console.log(`Reading files from: ${dataDir}`);
const files = fs.readdirSync(dataDir);

files.forEach(file => {
  // Skip the output file itself, the old flat file, and non-JSON files
  if (file === path.basename(outputFilePath) || file === 'school_data_20_flat.json' || !file.endsWith('.json')) {
    return;
  }

  const filePath = path.join(dataDir, file);
  let content;
  try {
    content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    console.error(`Error parsing JSON from file ${file}:`, error);
    return; // Skip this file
  }

  const baseNameMatch = file.match(/^(.*?)(_part(\d+))?\.json$/);
  if (!baseNameMatch) {
    console.warn(`Could not parse filename pattern for: ${file}`);
    return;
  }

  const baseName = baseNameMatch[1]; // e.g., "AttendanceRecord" from "AttendanceRecord_part1.json"
  const isPart = !!baseNameMatch[2]; // True if "_partN" is present
  const partNumber = isPart ? parseInt(baseNameMatch[3], 10) : 0;

  const config = keyConfig[baseName];

  if (!config) {
    console.warn(`No configuration found for base name: ${baseName} (from file ${file}). Skipping.`);
    return;
  }

  if (isPart && config.isArrayParts) {
    if (!partsData[config.keyName]) {
      partsData[config.keyName] = [];
    }
    partsData[config.keyName].push({ number: partNumber, data: content });
  } else if (!isPart) {
    // For standalone files or files not designated as parts in config
    mergedData[config.keyName] = content;
  }
});

// Process and concatenate collected parts
for (const keyName in partsData) {
  mergedData[keyName] = partsData[keyName]
    .sort((a, b) => a.number - b.number) // Sort by part number
    .reduce((acc, part) => acc.concat(part.data), []); // Concatenate arrays
}

try {
  fs.writeFileSync(outputFilePath, JSON.stringify(mergedData, null, 2));
  console.log(`✅ Successfully merged data into ${outputFilePath}`);
} catch (error) {
  console.error(`Error writing merged JSON to file ${outputFilePath}:`, error);
}