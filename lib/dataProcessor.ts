import Papa from 'papaparse';

export interface RentDataPoint {
  year: number;
  month: number;
  rent: number;
  rentBurden: number; // as percentage
}

export interface CityData {
  regionId: string;
  regionName: string;
  stateName: string;
  data: RentDataPoint[];
}

// Estimated median household income by city (2024, in thousands)
// Based on ACS data and typical metro area income levels
const ESTIMATED_MEDIAN_INCOME: Record<string, number> = {
  'New York, NY': 78,
  'Los Angeles, CA': 72,
  'Chicago, IL': 68,
  'Dallas, TX': 70,
  'Houston, TX': 67,
  'Washington, DC': 98,
  'Philadelphia, PA': 67,
  'Miami, FL': 62,
  'Atlanta, GA': 68,
  'Boston, MA': 88,
  'Phoenix, AZ': 67,
  'San Francisco, CA': 125,
  'Riverside, CA': 72,
  'Detroit, MI': 57,
  'Seattle, WA': 98,
  'Minneapolis, MN': 78,
  'San Diego, CA': 88,
  'Tampa, FL': 62,
};

// Income multipliers for different percentiles
const INCOME_PERCENTILE_MULTIPLIERS: Record<number, number> = {
  25: 0.65, // 25th percentile is about 65% of median
  50: 1.0,  // 50th percentile is median
  75: 1.5,  // 75th percentile is about 150% of median
};

export function parseDate(dateStr: string): { year: number; month: number } {
  // Date format is YYYY-MM-DD, extract year and month
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  return { year, month };
}

export function calculateRentBurden(
  monthlyRent: number,
  cityName: string,
  incomePercentile: number
): number {
  const medianIncome = ESTIMATED_MEDIAN_INCOME[cityName] || 65;
  const multiplier = INCOME_PERCENTILE_MULTIPLIERS[incomePercentile] || 1.0;
  const annualIncome = medianIncome * 1000 * multiplier;
  const monthlyIncome = annualIncome / 12;
  
  if (monthlyIncome === 0) return 0;
  return (monthlyRent / monthlyIncome) * 100;
}

export function calculateRentBurdenFromIncome(
  monthlyRent: number,
  annualIncome: number
): number {
  const monthlyIncome = annualIncome / 12;
  
  if (monthlyIncome === 0) return 0;
  return (monthlyRent / monthlyIncome) * 100;
}

export async function loadRentData(): Promise<CityData[]> {
  const response = await fetch('/Metro_zori_uc_sfrcondomfr_sm_month.csv');
  const text = await response.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cities: CityData[] = [];
        
        for (const row of results.data as any[]) {
          if (!row.RegionName || row.RegionType !== 'msa') continue;
          
          const dataPoints: RentDataPoint[] = [];
          
          // Process each date column
          for (const [key, value] of Object.entries(row)) {
            if (key.match(/^\d{4}-\d{2}-\d{2}$/)) {
              const rent = parseFloat(value as string);
              if (!isNaN(rent) && rent > 0) {
                const { year, month } = parseDate(key);
                // Calculate rent burden for median income (50th percentile)
                const rentBurden = calculateRentBurden(rent, row.RegionName, 50);
                dataPoints.push({ year, month, rent, rentBurden });
              }
            }
          }
          
          if (dataPoints.length > 0) {
            // Sort by year and month
            dataPoints.sort((a, b) => {
              if (a.year !== b.year) return a.year - b.year;
              return a.month - b.month;
            });
            
            cities.push({
              regionId: row.RegionID,
              regionName: row.RegionName,
              stateName: row.StateName || '',
              data: dataPoints,
            });
          }
        }
        
        resolve(cities);
      },
      error: reject,
    });
  });
}

export function getCityDataForPercentile(
  cityData: CityData,
  incomePercentile: number
): RentDataPoint[] {
  return cityData.data.map((point) => ({
    ...point,
    rentBurden: calculateRentBurden(
      point.rent,
      cityData.regionName,
      incomePercentile
    ),
  }));
}

export function getCityDataForIncome(
  cityData: CityData,
  annualIncome: number
): RentDataPoint[] {
  return cityData.data.map((point) => ({
    ...point,
    rentBurden: calculateRentBurdenFromIncome(point.rent, annualIncome),
  }));
}
