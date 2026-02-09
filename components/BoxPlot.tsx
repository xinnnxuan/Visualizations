'use client';

import React from 'react';

interface BoxPlotProps {
  x: number;
  y: number;
  width: number;
  height: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  yScale: (value: number) => number;
  boxWidth?: number;
  color?: string;
}

export const BoxPlotShape: React.FC<BoxPlotProps> = ({
  x,
  y,
  width,
  height,
  min,
  q1,
  median,
  q3,
  max,
  yScale,
  boxWidth = 30,
  color = "#1e40af",
}) => {
  const centerX = x + width / 2;
  const halfBoxWidth = boxWidth / 2;
  
  // Calculate y positions using the scale
  const yMin = yScale(max);
  const yQ1 = yScale(q3);
  const yMedian = yScale(median);
  const yQ3 = yScale(q1);
  const yMax = yScale(min);
  
  // Box height
  const boxTop = yQ1;
  const boxBottom = yQ3;
  const boxHeight = boxBottom - boxTop;
  
  return (
    <g>
      {/* Lower whisker (min to Q1) */}
      <line
        x1={centerX}
        y1={yMax}
        x2={centerX}
        y2={boxBottom}
        stroke={color}
        strokeWidth={2}
      />
      {/* Upper whisker (Q3 to max) */}
      <line
        x1={centerX}
        y1={boxTop}
        x2={centerX}
        y2={yMin}
        stroke={color}
        strokeWidth={2}
      />
      {/* Whisker caps */}
      <line
        x1={centerX - halfBoxWidth}
        y1={yMax}
        x2={centerX + halfBoxWidth}
        y2={yMax}
        stroke={color}
        strokeWidth={2}
      />
      <line
        x1={centerX - halfBoxWidth}
        y1={yMin}
        x2={centerX + halfBoxWidth}
        y2={yMin}
        stroke={color}
        strokeWidth={2}
      />
      {/* Box (Q1 to Q3) */}
      <rect
        x={centerX - halfBoxWidth}
        y={boxTop}
        width={boxWidth}
        height={boxHeight}
        fill={color}
        fillOpacity={0.6}
        stroke={color}
        strokeWidth={1}
      />
      {/* Median line */}
      <line
        x1={centerX - halfBoxWidth}
        y1={yMedian}
        x2={centerX + halfBoxWidth}
        y2={yMedian}
        stroke="#ffffff"
        strokeWidth={2}
      />
    </g>
  );
};
