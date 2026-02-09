'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CityData, loadRentData } from '@/lib/dataProcessor';
import RentBurdenChart from '@/components/RentBurdenChart';

export default function Home() {
  const [cities, setCities] = useState<CityData[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [annualIncome, setAnnualIncome] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Autocomplete states
  const [stateInput, setStateInput] = useState<string>('');
  const [cityInput, setCityInput] = useState<string>('');
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  
  // Comparison states
  const [isComparing, setIsComparing] = useState(false);
  const [compareState, setCompareState] = useState<string>('');
  const [compareCity, setCompareCity] = useState<string>('');
  const [compareStateInput, setCompareStateInput] = useState<string>('');
  const [compareCityInput, setCompareCityInput] = useState<string>('');
  const [showCompareStateDropdown, setShowCompareStateDropdown] = useState(false);
  const [showCompareCityDropdown, setShowCompareCityDropdown] = useState(false);
  
  // Chart filter states
  const [showBlueRange, setShowBlueRange] = useState(true);
  const [showBlueLine, setShowBlueLine] = useState(true);
  const [showRedRange, setShowRedRange] = useState(true);
  const [showRedLine, setShowRedLine] = useState(true);

  useEffect(() => {
    loadRentData()
      .then((data) => {
        setCities(data);
        if (data.length > 0) {
          const firstCity = data[0];
          setSelectedState(firstCity.stateName);
          setStateInput(firstCity.stateName);
          setSelectedCity(firstCity.regionName);
          const cityNameOnly = firstCity.regionName.split(',')[0].trim();
          setCityInput(cityNameOnly);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error loading data:', error);
        setIsLoading(false);
      });
  }, []);

  // Get unique states from cities
  const states = Array.from(new Set(cities.map((c) => c.stateName))).sort();
  
  // Filter states based on input
  const filteredStates = states.filter((state) =>
    state.toLowerCase().includes(stateInput.toLowerCase())
  );
  
  // Filter cities by selected state
  const citiesInState = cities.filter((c) => c.stateName === selectedState);
  
  // Filter cities based on input
  const filteredCitiesInState = citiesInState.filter((city) => {
    const cityNameOnly = city.regionName.split(',')[0].trim();
    return cityNameOnly.toLowerCase().includes(cityInput.toLowerCase());
  });
  
  const selectedCityData = cities.find((c) => c.regionName === selectedCity);

  const handleStateInputChange = (value: string) => {
    setStateInput(value);
    setShowStateDropdown(true);
    
    // Try to find exact match
    const exactMatch = states.find((s) => s.toLowerCase() === value.toLowerCase());
    if (exactMatch) {
      handleStateChange(exactMatch);
    } else {
      // If no exact match, clear selection if input doesn't match selected state
      if (selectedState && !value.toLowerCase().includes(selectedState.toLowerCase())) {
        setSelectedState('');
        setSelectedCity('');
      }
    }
  };

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    setStateInput(stateName);
    setShowStateDropdown(false);
    // Auto-select first city in the state
    const firstCityInState = cities.find((c) => c.stateName === stateName);
    if (firstCityInState) {
      setSelectedCity(firstCityInState.regionName);
      const cityNameOnly = firstCityInState.regionName.split(',')[0].trim();
      setCityInput(cityNameOnly);
    } else {
      setSelectedCity('');
      setCityInput('');
    }
  };

  const handleCityInputChange = (value: string) => {
    setCityInput(value);
    setShowCityDropdown(true);
    
    // Try to find exact match from datalist or filtered cities
    const exactMatch = citiesInState.find((c) => {
      const cityNameOnly = c.regionName.split(',')[0].trim();
      return cityNameOnly.toLowerCase() === value.toLowerCase();
    });
    if (exactMatch) {
      handleCityChange(exactMatch.regionName);
    } else {
      // If no exact match, clear selection if input doesn't match selected city
      if (selectedCity) {
        const selectedCityNameOnly = selectedCity.split(',')[0].trim();
        if (value.toLowerCase() !== selectedCityNameOnly.toLowerCase()) {
          setSelectedCity('');
        }
      }
    }
  };

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    const cityNameOnly = cityName.split(',')[0].trim();
    setCityInput(cityNameOnly);
    setShowCityDropdown(false);
  };

  const handleCompare = () => {
    if (isComparing) {
      // Stop comparing
      setIsComparing(false);
      setCompareState('');
      setCompareCity('');
      setCompareStateInput('');
      setCompareCityInput('');
    } else {
      // Start comparing
      setIsComparing(true);
    }
  };

  // Filter cities for comparison
  const compareCitiesInState = cities.filter((c) => c.stateName === compareState);
  const filteredCompareCitiesInState = compareCitiesInState.filter((city) => {
    const cityNameOnly = city.regionName.split(',')[0].trim();
    return cityNameOnly.toLowerCase().includes(compareCityInput.toLowerCase());
  });

  const handleCompareStateInputChange = (value: string) => {
    setCompareStateInput(value);
    setShowCompareStateDropdown(true);
    
    const exactMatch = states.find((s) => s.toLowerCase() === value.toLowerCase());
    if (exactMatch) {
      handleCompareStateChange(exactMatch);
    } else {
      if (compareState && !value.toLowerCase().includes(compareState.toLowerCase())) {
        setCompareState('');
        setCompareCity('');
      }
    }
  };

  const handleCompareStateChange = (stateName: string) => {
    setCompareState(stateName);
    setCompareStateInput(stateName);
    setShowCompareStateDropdown(false);
    const firstCityInState = cities.find((c) => c.stateName === stateName);
    if (firstCityInState) {
      setCompareCity(firstCityInState.regionName);
      const cityNameOnly = firstCityInState.regionName.split(',')[0].trim();
      setCompareCityInput(cityNameOnly);
    } else {
      setCompareCity('');
      setCompareCityInput('');
    }
  };

  const handleCompareCityInputChange = (value: string) => {
    setCompareCityInput(value);
    setShowCompareCityDropdown(true);
    
    const exactMatch = compareCitiesInState.find((c) => {
      const cityNameOnly = c.regionName.split(',')[0].trim();
      return cityNameOnly.toLowerCase() === value.toLowerCase();
    });
    if (exactMatch) {
      handleCompareCityChange(exactMatch.regionName);
    } else {
      if (compareCity) {
        const selectedCityNameOnly = compareCity.split(',')[0].trim();
        if (value.toLowerCase() !== selectedCityNameOnly.toLowerCase()) {
          setCompareCity('');
        }
      }
    }
  };

  const handleCompareCityChange = (cityName: string) => {
    setCompareCity(cityName);
    const cityNameOnly = cityName.split(',')[0].trim();
    setCompareCityInput(cityNameOnly);
    setShowCompareCityDropdown(false);
  };

  const compareCityData = cities.find((c) => c.regionName === compareCity);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Rent Rising Faster Than Wages
          </h1>
          <p className="text-lg text-gray-600">
            See how housing costs have outpaced income growth in cities across America
          </p>
        </div>

        {/* Personal Comparison Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Where do you live?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select or type your state
              </label>
              <input
                type="text"
                value={stateInput}
                onChange={(e) => handleStateInputChange(e.target.value)}
                onFocus={() => setShowStateDropdown(true)}
                onBlur={() => setTimeout(() => setShowStateDropdown(false), 200)}
                placeholder="Type or select state"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                list="states-list"
              />
              <datalist id="states-list">
                {states.map((state) => (
                  <option key={state} value={state} />
                ))}
              </datalist>
              {showStateDropdown && filteredStates.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredStates.map((state) => (
                    <button
                      key={state}
                      type="button"
                      onClick={() => handleStateChange(state)}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                    >
                      {state}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select or type your city
              </label>
              <input
                type="text"
                value={cityInput}
                onChange={(e) => handleCityInputChange(e.target.value)}
                onFocus={() => setShowCityDropdown(true)}
                onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filteredCitiesInState.length > 0) {
                    handleCityChange(filteredCitiesInState[0].regionName);
                  }
                }}
                placeholder={!selectedState ? "Select state first" : "Type or select city"}
                disabled={!selectedState || citiesInState.length === 0}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                list="cities-list"
              />
              <datalist id="cities-list">
                {citiesInState.map((city) => {
                  const cityNameOnly = city.regionName.split(',')[0].trim();
                  return (
                    <option key={city.regionId} value={cityNameOnly} />
                  );
                })}
              </datalist>
              {showCityDropdown && filteredCitiesInState.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredCitiesInState.map((city) => {
                    const cityNameOnly = city.regionName.split(',')[0].trim();
                    return (
                      <button
                        key={city.regionId}
                        type="button"
                        onClick={() => handleCityChange(city.regionName)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                      >
                        {cityNameOnly}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What is your annual household income?
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">$</span>
                <input
                  type="number"
                  value={annualIncome}
                  onChange={(e) => setAnnualIncome(e.target.value)}
                  placeholder="Enter annual income"
                  min="0"
                  step="1000"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Enter your total annual household income to see how rent burden affects you
              </p>
            </div>
          </div>
        </div>

        {/* Main Visualization */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Rent Burden Over Time</h2>
            <button
              onClick={handleCompare}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {isComparing ? 'Stop Comparing' : 'Compare'}
            </button>
          </div>
          
          {isComparing && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Select a city to compare</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compare state
                  </label>
                  <input
                    type="text"
                    value={compareStateInput}
                    onChange={(e) => handleCompareStateInputChange(e.target.value)}
                    onFocus={() => setShowCompareStateDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCompareStateDropdown(false), 200)}
                    placeholder="Type or select state"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    list="compare-states-list"
                  />
                  <datalist id="compare-states-list">
                    {states.map((state) => (
                      <option key={state} value={state} />
                    ))}
                  </datalist>
                  {showCompareStateDropdown && filteredStates.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredStates.map((state) => (
                        <button
                          key={state}
                          type="button"
                          onClick={() => handleCompareStateChange(state)}
                          className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                        >
                          {state}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compare city
                  </label>
                  <input
                    type="text"
                    value={compareCityInput}
                    onChange={(e) => handleCompareCityInputChange(e.target.value)}
                    onFocus={() => setShowCompareCityDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCompareCityDropdown(false), 200)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && filteredCompareCitiesInState.length > 0) {
                        handleCompareCityChange(filteredCompareCitiesInState[0].regionName);
                      }
                    }}
                    placeholder={!compareState ? "Select state first" : "Type or select city"}
                    disabled={!compareState || compareCitiesInState.length === 0}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    list="compare-cities-list"
                  />
                  <datalist id="compare-cities-list">
                    {compareCitiesInState.map((city) => {
                      const cityNameOnly = city.regionName.split(',')[0].trim();
                      return (
                        <option key={city.regionId} value={cityNameOnly} />
                      );
                    })}
                  </datalist>
                  {showCompareCityDropdown && filteredCompareCitiesInState.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredCompareCitiesInState.map((city) => {
                        const cityNameOnly = city.regionName.split(',')[0].trim();
                        return (
                          <button
                            key={city.regionId}
                            type="button"
                            onClick={() => handleCompareCityChange(city.regionName)}
                            className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                          >
                            {cityNameOnly}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Chart Filters */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Show/Hide:</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBlueRange}
                  onChange={(e) => setShowBlueRange(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Blue Range (Rent Burden)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBlueLine}
                  onChange={(e) => setShowBlueLine(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Blue Line (Rent Burden Median)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRedRange}
                  onChange={(e) => setShowRedRange(e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Red Range (Monthly Rent)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRedLine}
                  onChange={(e) => setShowRedLine(e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Red Line (Monthly Rent Median)</span>
              </label>
            </div>
          </div>

          {isComparing && compareCity ? (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {selectedCity.split(',')[0].trim()}, {selectedState}
                  </h3>
                  <RentBurdenChart
                    cityData={selectedCityData || null}
                    annualIncome={annualIncome ? parseFloat(annualIncome) : 0}
                    isAnimating={false}
                    currentYear={2024}
                    hideLegend={true}
                    showFewerYears={true}
                    showBlueRange={showBlueRange}
                    showBlueLine={showBlueLine}
                    showRedRange={showRedRange}
                    showRedLine={showRedLine}
                    isComparing={true}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {compareCity.split(',')[0].trim()}, {compareState}
                  </h3>
                  <RentBurdenChart
                    cityData={compareCityData || null}
                    annualIncome={annualIncome ? parseFloat(annualIncome) : 0}
                    isAnimating={false}
                    currentYear={2024}
                    hideLegend={true}
                    showFewerYears={true}
                    showBlueRange={showBlueRange}
                    showBlueLine={showBlueLine}
                    showRedRange={showRedRange}
                    showRedLine={showRedLine}
                    isComparing={true}
                  />
                </div>
              </div>
              {/* Shared legend for comparison view */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex flex-col items-center gap-3">
                  {/* Red dashed line indicator */}
                  <div className="flex items-center justify-center mb-2">
                    <svg width="40" height="16" className="mr-2">
                      <line x1="0" y1="8" x2="40" y2="8" stroke="#ef4444" strokeWidth="2" strokeDasharray="5 5" />
                    </svg>
                    <span className="text-xs text-gray-600">
                      Above the red dashed line housing is considered unaffordable
                    </span>
                  </div>
                  
                  {/* Legend items - organized in two rows */}
                  <div className="flex flex-col items-center gap-2">
                    {/* Ranges row */}
                    <div className="flex justify-center flex-wrap gap-5">
                      <div className="flex items-center">
                        <svg width="14" height="14" className="mr-2">
                          <rect width="14" height="14" fill="#3b82f6" fillOpacity={0.35} />
                        </svg>
                        <span className="text-xs">Range: Rent burden (min to max)</span>
                      </div>
                      <div className="flex items-center">
                        <svg width="14" height="14" className="mr-2">
                          <rect width="14" height="14" fill="#c2410c" fillOpacity={0.2} />
                        </svg>
                        <span className="text-xs">Range: Monthly rent (min to max)</span>
                      </div>
                    </div>
                    
                    {/* Medians row */}
                    <div className="flex justify-center flex-wrap gap-5">
                      <div className="flex items-center">
                        <svg width="14" height="14" className="mr-2">
                          <line x1="0" y1="7" x2="14" y2="7" stroke="#1e40af" strokeWidth="2" />
                        </svg>
                        <span className="text-xs">Median: Percentage of income spent on rent</span>
                      </div>
                      <div className="flex items-center">
                        <svg width="14" height="14" className="mr-2">
                          <line x1="0" y1="7" x2="14" y2="7" stroke="#c2410c" strokeWidth="2" />
                        </svg>
                        <span className="text-xs">Median: Monthly rent</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <RentBurdenChart
              cityData={selectedCityData || null}
              annualIncome={annualIncome ? parseFloat(annualIncome) : 0}
              isAnimating={false}
              currentYear={2024}
              showBlueRange={showBlueRange}
              showBlueLine={showBlueLine}
              showRedRange={showRedRange}
              showRedLine={showRedLine}
            />
          )}
        </div>


        {/* Context & Explanation */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">About This Data</h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold mb-2">Data Sources</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <strong>Rent Data:</strong> Zillow Observed Rent Index (ZORI) - monthly median
                  rent for single-family and condominium units
                </li>
                <li>
                  <strong>Income Data:</strong> Estimated based on American Community Survey (ACS)
                  median household income by metropolitan area
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">The 30% Rule</h3>
              <p className="text-sm">
                Above the red dashed line on the chart, housing is considered unaffordable. The U.S. Department of Housing and Urban Development (HUD) considers households
                spending more than 30% of their income on housing to be "cost-burdened." The 30% threshold is a widely
                used standard for housing affordability.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Methodology</h3>
              <p className="text-sm">
                Rent burden is calculated as the percentage of monthly household income spent on
                rent. Income estimates are based on median household income by metropolitan area,
                adjusted for different income percentiles (25th, 50th, 75th). The visualization shows
                how rent has changed relative to income over time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
