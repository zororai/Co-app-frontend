/**
 * Generates 120 sample ore records for testing
 * 10 records per month from January to December 2025
 * Weights range from 35,000 - 45,000 kg (±5,000 from base 40,000)
 */

export interface SampleOreRecord {
  shaftNumbers: string;
  weight: string;
  numberOfBags: string;
  transportStatus: string;
  processStatus: string;
  location: string;
  date: string;
  time: {
    hour: number;
    minute: number;
    second: number;
    nano: number;
  };
  tax: Array<{
    taxType: string;
    taxRate: number;
    location: string;
    description: string;
  }>;
}

const SHAFT_NUMBERS = ['SA1', 'SA2', 'SA3', 'SA4', 'SA5', 'SA6', 'SA7', 'SA8', 'SA9', 'SA10'];
const MONTHS = [
  { num: 1, name: 'January' },
  { num: 2, name: 'February' },
  { num: 3, name: 'March' },
  { num: 4, name: 'April' },
  { num: 5, name: 'May' },
  { num: 6, name: 'June' },
  { num: 7, name: 'July' },
  { num: 8, name: 'August' },
  { num: 9, name: 'September' },
  { num: 10, name: 'October' },
  { num: 11, name: 'November' },
  { num: 12, name: 'December' }
];

/**
 * Generate a random weight between 35,000 and 45,000 kg
 */
function generateRandomWeight(): number {
  const baseWeight = 40000;
  const variance = 5000;
  // Random weight between -5000 and +5000
  const randomVariance = (Math.random() * 2 - 1) * variance;
  return Math.round(baseWeight + randomVariance);
}

/**
 * Generate random number of bags (50-100 bags)
 */
function generateRandomBags(): number {
  return Math.floor(Math.random() * 50) + 50;
}

/**
 * Generate random time of day
 */
function generateRandomTime() {
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);
  return { hour, minute, second, nano: 0 };
}

/**
 * Generate a random date within a month
 */
function generateDateInMonth(year: number, month: number): string {
  const daysInMonth = new Date(year, month, 0).getDate();
  const day = Math.floor(Math.random() * daysInMonth) + 1;
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return dateStr;
}

/**
 * Generate 120 sample ore records
 */
export function generateSampleOreData(): SampleOreRecord[] {
  const records: SampleOreRecord[] = [];

  // Generate 10 records per month for 12 months
  for (const month of MONTHS) {
    for (let i = 0; i < 10; i++) {
      const record: SampleOreRecord = {
        shaftNumbers: SHAFT_NUMBERS[Math.floor(Math.random() * SHAFT_NUMBERS.length)],
        weight: generateRandomWeight().toString(),
        numberOfBags: generateRandomBags().toString(),
        transportStatus: 'pending',
        processStatus: 'pending',
        location: 'Still on the ground',
        date: generateDateInMonth(2025, month.num),
        time: generateRandomTime(),
        tax: [
          {
            taxType: 'Processing Tax',
            taxRate: 5,
            location: 'Processing Plant',
            description: 'Standard processing fee'
          }
        ]
      };
      records.push(record);
    }
  }

  // Sort records by date
  records.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  return records;
}

/**
 * Format sample ore data for batch API submission
 */
export function formatSampleOreDataForBatch(records: SampleOreRecord[]): any[] {
  return records.map((record) => ({
    ...record,
    // Ensure all fields are properly formatted
    weight: parseFloat(record.weight),
    numberOfBags: parseInt(record.numberOfBags),
    transportStatus: record.transportStatus,
    processStatus: record.processStatus,
    location: record.location
  }));
}
