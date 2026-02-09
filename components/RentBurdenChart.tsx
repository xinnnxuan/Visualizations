'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Legend,
  Cell,
} from 'recharts';
import { RentDataPoint, CityData, getCityDataForIncome } from '@/lib/dataProcessor';

interface RentBurdenChartProps {
  cityData: CityData | null;
  annualIncome: number;
  isAnimating?: boolean;
  currentYear?: number;
  onYearChange?: (year: number) => void;
  hideLegend?: boolean;
  showFewerYears?: boolean;
  showBlueRange?: boolean;
  showBlueLine?: boolean;
  showRedRange?: boolean;
  showRedLine?: boolean;
  isComparing?: boolean;
}

export default function RentBurdenChart({
  cityData,
  annualIncome,
  isAnimating = false,
  currentYear = 2024,
  onYearChange,
  hideLegend = false,
  showFewerYears = false,
  showBlueRange = true,
  showBlueLine = true,
  showRedRange = true,
  showRedLine = true,
  isComparing = false,
}: RentBurdenChartProps) {
  const [displayData, setDisplayData] = useState<RentDataPoint[]>([]);

  useEffect(() => {
    if (!cityData || annualIncome <= 0) {
      setDisplayData([]);
      return;
    }

    const processedData = getCityDataForIncome(cityData, annualIncome);
    
    let dataToProcess = processedData;
    if (isAnimating && currentYear) {
      // Show data up to currentYear (show all months for years before, and up to month 3 for current year)
      dataToProcess = processedData.filter(
        (d) => d.year < currentYear || (d.year === currentYear && d.month <= 3)
      );
    }
    
    setDisplayData(dataToProcess);
  }, [cityData, annualIncome, isAnimating, currentYear]);

  const formatCurrency = (value: number) => {
    return `$${Math.round(value).toLocaleString()}`;
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Group data by year and calculate min, max, and median for each year
  // MUST process data before any early returns to maintain hook order
  interface YearlyData {
    year: number;
    burdenMin: number;
    burdenMax: number;
    burdenMedian: number;
    rentMin: number;
    rentMax: number;
    rentMedian: number;
  }

  const calculateMedian = (values: number[]): number => {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  };

  // Process data - must happen before any early returns to maintain hook order
  const dataByYear: Record<number, { rentBurden: number[]; rent: number[] }> = {};
  displayData.forEach((point) => {
    if (!dataByYear[point.year]) {
      dataByYear[point.year] = { rentBurden: [], rent: [] };
    }
    dataByYear[point.year].rentBurden.push(point.rentBurden);
    dataByYear[point.year].rent.push(point.rent);
  });

  // Calculate yearly aggregated data with min, max, and median
  const yearlyData: YearlyData[] = Object.keys(dataByYear)
    .map(Number)
    .sort((a, b) => a - b)
    .map((year) => {
      const burdenValues = dataByYear[year].rentBurden;
      const rentValues = dataByYear[year].rent;
      
      const burdenMin = burdenValues.length > 0 ? Math.min(...burdenValues) : 0;
      const burdenMax = burdenValues.length > 0 ? Math.max(...burdenValues) : 0;
      const rentMin = rentValues.length > 0 ? Math.min(...rentValues) : 0;
      const rentMax = rentValues.length > 0 ? Math.max(...rentValues) : 0;
      
      return {
        year,
        burdenMin,
        burdenMax,
        burdenMedian: calculateMedian(burdenValues),
        burdenRange: burdenMax - burdenMin, // Range for stacked area
        rentMin,
        rentMax,
        rentMedian: calculateMedian(rentValues),
        rentRange: rentMax - rentMin, // Range for stacked area
      };
    });

  // Calculate Y-axis domains - fixed based on all data, not affected by filter visibility
  // Use useMemo to ensure domains don't recalculate when filters change
  // MUST be called before any early returns to maintain hook order
  const { burdenDomain, rentDomain } = useMemo(() => {
    if (yearlyData.length === 0) {
      return {
        burdenDomain: [0, 50] as [number, number],
        rentDomain: [0, 4000] as [number, number],
      };
    }
    const maxRentBurden = Math.max(...yearlyData.map(d => d.burdenMax));
    const maxRent = Math.max(...yearlyData.map(d => d.rentMax));
    const minRent = Math.min(...yearlyData.map(d => d.rentMin));
    
    return {
      burdenDomain: [0, Math.max(50, maxRentBurden * 1.15)] as [number, number],
      rentDomain: [Math.max(0, minRent * 0.9), maxRent * 1.1] as [number, number],
    };
  }, [yearlyData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as YearlyData;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold mb-2">Year: {data.year}</p>
          <div className="mb-2">
            <p className="text-xs font-semibold text-gray-600 mb-1">Rent Burden (% of income):</p>
            <p className="text-sm">Min: {formatPercent(data.burdenMin)}</p>
            <p className="text-sm font-semibold">Median: {formatPercent(data.burdenMedian)}</p>
            <p className="text-sm">Max: {formatPercent(data.burdenMax)}</p>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-600 mb-1">Monthly Rent ($):</p>
            <p className="text-sm">Min: {formatCurrency(data.rentMin)}</p>
            <p className="text-sm font-semibold">Median: {formatCurrency(data.rentMedian)}</p>
            <p className="text-sm">Max: {formatCurrency(data.rentMax)}</p>
          </div>
          {data.burdenMedian >= 30 && (
            <p className="text-red-600 font-semibold mt-2">Median above affordability threshold</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Early returns AFTER all hooks
  if (!cityData) {
    return (
      <div className="w-full h-96 flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-gray-500">Select a city to view data</p>
      </div>
    );
  }

  if (annualIncome <= 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-gray-500">Enter your annual income to view rent burden data</p>
      </div>
    );
  }

  if (displayData.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Find the year when median rent burden crosses 30%
  const crossingPoint = yearlyData.find((d) => d.burdenMedian >= 30);
  const crossingYear = crossingPoint ? crossingPoint.year : null;

  // Get year range for X-axis
  const years = yearlyData.map((d) => d.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  
  // Create array of all years for ticks
  const yearTicks: number[] = [];
  for (let year = minYear; year <= maxYear; year++) {
    yearTicks.push(year);
  }

  // Use 450px height when comparing, 700px for single chart
  const chartHeight = isComparing ? 425 : 700;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <ComposedChart
          data={yearlyData}
          margin={{ top: 20, right: 100, left: 100, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="year"
            type="number"
            scale="linear"
            domain={[minYear - 0.5, maxYear + 0.5]}
            ticks={yearTicks}
            tickFormatter={(value) => value.toString()}
            angle={-45}
            textAnchor="end"
            height={100}
            interval={showFewerYears ? undefined : 0}
            label={{ value: 'Year', position: 'insideBottom', offset: -10 }}
            stroke="#666"
          />
          <YAxis
            yAxisId="burden"
            stroke="#1e40af"
            orientation="left"
            label={{ value: 'Percentage of Income Spent on Rent (%)', angle: -90, position: 'insideLeft', offset: -70, style: { textAnchor: 'middle' } }}
            tickFormatter={formatPercent}
            domain={burdenDomain}
            allowDataOverflow={true}
            allowDecimals={true}
            width={80}
          />
          <YAxis
            yAxisId="rent"
            stroke="#c2410c"
            orientation="right"
            label={{ value: 'Monthly Rent ($)', angle: 90, position: 'insideRight', offset: -70, style: { textAnchor: 'middle' } }}
            tickFormatter={formatCurrency}
            domain={rentDomain}
            allowDataOverflow={true}
            allowDecimals={true}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          {!hideLegend && (
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => {
              if (value === 'rentBurden') return 'Median: Percentage of income spent on rent';
              if (value === 'rent') return 'Median: Monthly rent';
              if (value === 'burdenRange') return 'Range: Rent burden (min to max)';
              if (value === 'rentRange') return 'Range: Monthly rent (min to max)';
              return value;
            }}
            content={(props) => {
              const { payload } = props;
              
              // Filter out the transparent range min entries and organize the legend
              const filteredPayload = payload?.filter((entry: any) => 
                entry.value !== 'burdenRangeMin' && entry.value !== 'rentRangeMin'
              ) || [];
              
              // Organize items: ranges first, then medians
              const ranges = filteredPayload.filter((entry: any) => 
                entry.value === 'burdenRange' || entry.value === 'rentRange'
              );
              const medians = filteredPayload.filter((entry: any) => 
                entry.value === 'rentBurden' || entry.value === 'rent'
              );
              
              const getLabel = (value: string) => {
                if (value === 'rentBurden') return 'Median: Percentage of income spent on rent';
                if (value === 'rent') return 'Median: Monthly rent';
                if (value === 'burdenRange') return 'Range: Rent burden (min to max)';
                if (value === 'rentRange') return 'Range: Monthly rent (min to max)';
                return value;
              };
              
              return (
                <div style={{ paddingTop: '20px' }}>
                  {/* Red dashed line indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <svg width="40" height="16" style={{ marginRight: '8px' }}>
                      <line x1="0" y1="8" x2="40" y2="8" stroke="#ef4444" strokeWidth="2" strokeDasharray="5 5" />
                    </svg>
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      Above the red dashed line housing is considered unaffordable
                    </span>
                  </div>
                  
                  {/* Legend items - organized in two rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    {/* Ranges row */}
                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px' }}>
                      {ranges.map((entry: any, index: number) => {
                        // Use brighter blue and higher opacity for burden range
                        const fillColor = entry.value === 'burdenRange' ? '#3b82f6' : entry.color;
                        const fillOpacity = entry.value === 'burdenRange' ? 0.35 : 0.2;
                        return (
                          <div key={`range-${index}`} style={{ display: 'flex', alignItems: 'center' }}>
                            <svg width="14" height="14" style={{ marginRight: '8px' }}>
                              <rect width="14" height="14" fill={fillColor} fillOpacity={fillOpacity} />
                            </svg>
                            <span style={{ fontSize: '12px' }}>{getLabel(entry.value)}</span>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Medians row */}
                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px' }}>
                      {medians.map((entry: any, index: number) => (
                        <div key={`median-${index}`} style={{ display: 'flex', alignItems: 'center' }}>
                          <svg width="14" height="14" style={{ marginRight: '8px' }}>
                            <line x1="0" y1="7" x2="14" y2="7" stroke={entry.color} strokeWidth="2" />
                          </svg>
                          <span style={{ fontSize: '12px' }}>{getLabel(entry.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }}
          />
          )}
          <ReferenceLine
            yAxisId="burden"
            y={30}
            stroke="#ef4444"
            strokeDasharray="5 5"
            strokeWidth={2}
          />
          
          {/* Rent Burden Min-Max Band - using stacked areas with transparent base */}
          {/* Always render but control visibility with opacity */}
          <Area
            yAxisId="burden"
            type="monotone"
            dataKey="burdenMin"
            stroke="none"
            fill="transparent"
            fillOpacity={0}
            stackId="burdenBand"
            name="burdenRangeMin"
          />
          <Area
            yAxisId="burden"
            type="monotone"
            dataKey="burdenRange"
            stroke="none"
            fill="#3b82f6"
            fillOpacity={showBlueRange ? 0.35 : 0}
            stackId="burdenBand"
            name="burdenRange"
          />
          
          {/* Rent Min-Max Band - using stacked areas with transparent base */}
          {/* Always render but control visibility with opacity */}
          <Area
            yAxisId="rent"
            type="monotone"
            dataKey="rentMin"
            stroke="none"
            fill="transparent"
            fillOpacity={0}
            stackId="rentBand"
            name="rentRangeMin"
          />
          <Area
            yAxisId="rent"
            type="monotone"
            dataKey="rentRange"
            stroke="none"
            fill="#c2410c"
            fillOpacity={showRedRange ? 0.2 : 0}
            stackId="rentBand"
            name="rentRange"
          />
          
          {/* Rent Burden Median Line - rendered after areas to appear on top */}
          {/* Always render but control visibility with opacity */}
          <Line
            yAxisId="burden"
            type="monotone"
            dataKey="burdenMedian"
            stroke="#1e40af"
            strokeWidth={3}
            strokeOpacity={showBlueLine ? 1 : 0}
            dot={false}
            name="rentBurden"
            isAnimationActive={false}
          />
          
          {/* Rent Median Line - rendered after areas to appear on top */}
          {/* Always render but control visibility with opacity */}
          <Line
            yAxisId="rent"
            type="monotone"
            dataKey="rentMedian"
            stroke="#c2410c"
            strokeWidth={3}
            strokeOpacity={showRedLine ? 1 : 0}
            dot={false}
            name="rent"
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
      {crossingYear && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded">
          <p className="text-sm text-orange-800">
            <strong>In {crossingYear}</strong>, typical monthly rent began exceeding 30% of income
            for renters at this income level. From here on, housing became unaffordable.
          </p>
        </div>
      )}
    </div>
  );
}
