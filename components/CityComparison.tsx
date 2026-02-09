'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { CityData, getCityDataForIncome } from '@/lib/dataProcessor';

interface CityComparisonProps {
  cities: CityData[];
  selectedCities: string[];
  annualIncome: number;
}

export default function CityComparison({
  cities,
  selectedCities,
  annualIncome,
}: CityComparisonProps) {
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Calculate current rent burden for each selected city
  const comparisonData = cities
    .filter((city) => selectedCities.includes(city.regionName))
    .map((city) => {
      const processedData = annualIncome > 0 ? getCityDataForIncome(city, annualIncome) : [];
      // Get the most recent data point
      const latest = processedData[processedData.length - 1];
      return {
        city: city.regionName.replace(',', ',\n'),
        rentBurden: latest ? latest.rentBurden : 0,
        rent: latest ? latest.rent : 0,
      };
    })
    .sort((a, b) => b.rentBurden - a.rentBurden);

  if (annualIncome <= 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-gray-500">Enter your annual income to compare cities</p>
      </div>
    );
  }

  if (comparisonData.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-gray-500">Select cities to compare</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold mb-4">Current Rent Burden by City</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="city"
            angle={-45}
            textAnchor="end"
            height={100}
            stroke="#666"
          />
          <YAxis
            stroke="#1e40af"
            label={{ value: 'Percentage of Income Spent on Rent (%)', angle: -90, position: 'insideLeft' }}
            tickFormatter={formatPercent}
          />
          <Tooltip
            formatter={(value: number) => formatPercent(value)}
            labelFormatter={(label) => `City: ${label.replace(/\n/g, ' ')}`}
          />
          <ReferenceLine
            y={30}
            stroke="#ef4444"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{ value: '30% threshold', position: 'topRight' }}
          />
          <Bar
            dataKey="rentBurden"
            fill="#1e40af"
            name="Percentage of income spent on rent"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
