"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Leaf,
  Car,
  Zap,
  Utensils,
  Sparkles,
  RefreshCw,
  Info,
  HelpCircle,
  TrendingDown,
  Globe,
  AlertCircle
} from "lucide-react";

// Standard calculation constants
const TRANSPORT_FACTOR = 0.0002;
const ENERGY_FACTOR = 0.0008;
const DIET_FACTORS = {
  Omnivore: 2.5,
  Vegetarian: 1.7,
  Vegan: 1.2,
};

type DietType = "Omnivore" | "Vegetarian" | "Vegan";

const LOADING_MESSAGES = [
  "Analyzing your carbon footprint metrics...",
  "Consulting the Gemini AI Sustainability Engine...",
  "Calculating regional offsets and grid factors...",
  "Formulating highly actionable reduction strategies...",
];

export default function Home() {
  // Input State
  const [kmDriven, setKmDriven] = useState<number>(12000);
  const [electricityKwh, setElectricityKwh] = useState<number>(350);
  const [diet, setDiet] = useState<DietType>("Omnivore");

  // What-If Simulation State (offsets from original input)
  const [simKmDriven, setSimKmDriven] = useState<number>(12000);
  const [simElectricityKwh, setSimElectricityKwh] = useState<number>(350);
  const [simDiet, setSimDiet] = useState<DietType>("Omnivore");

  // Helper functions to sync simulator when editing main input
  const updateKmDriven = (val: number) => {
    setKmDriven(val);
    setSimKmDriven(val);
  };

  const updateElectricityKwh = (val: number) => {
    setElectricityKwh(val);
    setSimElectricityKwh(val);
  };

  const updateDiet = (val: DietType) => {
    setDiet(val);
    setSimDiet(val);
  };

  // Sync simulator state when main form is updated
  const syncSimulator = () => {
    setSimKmDriven(kmDriven);
    setSimElectricityKwh(electricityKwh);
    setSimDiet(diet);
  };

  // API response and UI states
  const [insights, setInsights] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loadingMessage, setLoadingMessage] = useState<string>(LOADING_MESSAGES[0]);

  // Rotate loading messages for a dynamic feeling
  useEffect(() => {
    if (!loading) return;

    const timeoutId = setTimeout(() => {
      setLoadingMessage(LOADING_MESSAGES[0]);
    }, 0);

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[index]);
    }, 3000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, [loading]);

  // Main carbon calculations
  const transportFootprint = useMemo(() => kmDriven * TRANSPORT_FACTOR, [kmDriven]);
  const energyFootprint = useMemo(() => electricityKwh * 12 * ENERGY_FACTOR, [electricityKwh]);
  const dietFootprint = useMemo(() => DIET_FACTORS[diet], [diet]);
  const totalFootprint = useMemo(
    () => transportFootprint + energyFootprint + dietFootprint,
    [transportFootprint, energyFootprint, dietFootprint]
  );

  // Simulated carbon calculations (for "What-If" section)
  const simTransportFootprint = useMemo(() => simKmDriven * TRANSPORT_FACTOR, [simKmDriven]);
  const simEnergyFootprint = useMemo(() => simElectricityKwh * 12 * ENERGY_FACTOR, [simElectricityKwh]);
  const simDietFootprint = useMemo(() => DIET_FACTORS[simDiet], [simDiet]);
  const simTotalFootprint = useMemo(
    () => simTransportFootprint + simEnergyFootprint + simDietFootprint,
    [simTransportFootprint, simEnergyFootprint, simDietFootprint]
  );

  // Main form inputs automatically sync simulator on change

  // Fetch AI Insights from serverless API
  const handleGetInsights = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInsights("");

    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transport: transportFootprint,
          energy: energyFootprint,
          diet: dietFootprint,
          total: totalFootprint,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch sustainability coaching insights.");
      }

      setInsights(data.insights);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Simple parser to extract bullet points from Gemini response
  const parsedBulletPoints = useMemo(() => {
    if (!insights) return [];
    return insights
      .split(/\n+/)
      .map((line) => line.trim())
      // Look for lines starting with *, -, or numbers
      .filter((line) => line.startsWith("*") || line.startsWith("-") || /^\d+\./.test(line))
      // Strip out the bullet markdown symbols
      .map((line) => {
        const cleaned = line.replace(/^[\*\-\d\.\s]+/, "").trim();
        // Remove markdown bolding **text** -> text
        return cleaned.replace(/\*\*(.*?)\*\*/g, "$1");
      })
      .slice(0, 3); // Ensure exactly 3 items
  }, [insights]);

  // Percentages for the breakdown charts
  const transportPercent = (transportFootprint / totalFootprint) * 100;
  const energyPercent = (energyFootprint / totalFootprint) * 100;
  const dietPercent = (dietFootprint / totalFootprint) * 100;

  // Simulator savings
  const totalSavings = totalFootprint - simTotalFootprint;
  const savingsPercent = totalFootprint > 0 ? (totalSavings / totalFootprint) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 overflow-x-hidden pb-16 relative">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-950/20 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-slate-900/40 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-emerald-500 to-emerald-400 p-2 rounded-xl text-slate-950 shadow-lg shadow-emerald-500/20 animate-pulse">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
                EcoPulse
              </span>
              <span className="ml-1.5 px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                V1.0
              </span>
            </div>
          </div>
          <nav className="flex items-center gap-6 text-sm text-slate-400">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Global Target: &lt; 2.0 MTCO2e/yr
            </span>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Title and Intro */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
            Your Carbon Footprint Dashboard
          </h1>
          <p className="text-slate-400 max-w-2xl text-base sm:text-lg">
            Track, simulate, and actively reduce your greenhouse gas emissions. Input your daily habits below and get tailored sustainability strategies from Gemini AI.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Inputs Card (Grid: 5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-emerald-400" />
                1. Input Your Annual Habits
              </h2>

              <form onSubmit={handleGetInsights} className="space-y-6">
                {/* Transport Input */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label htmlFor="km-input" className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Car className="w-4 h-4 text-emerald-400" />
                      Annual Driving
                    </label>
                    <span className="text-xs text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-850">
                      {kmDriven.toLocaleString()} km/yr
                    </span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <input
                      type="range"
                      min="0"
                      max="50000"
                      step="500"
                      value={kmDriven}
                      onChange={(e) => updateKmDriven(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
                    />
                    <input
                      id="km-input"
                      type="number"
                      min="0"
                      max="1000000"
                      value={kmDriven}
                      onChange={(e) => updateKmDriven(Math.max(0, Number(e.target.value)))}
                      className="w-24 bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2.5 text-right text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Energy Input */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label htmlFor="kwh-input" className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      Monthly Electricity
                    </label>
                    <span className="text-xs text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-850">
                      {electricityKwh.toLocaleString()} kWh/mo
                    </span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      step="20"
                      value={electricityKwh}
                      onChange={(e) => updateElectricityKwh(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
                    />
                    <input
                      id="kwh-input"
                      type="number"
                      min="0"
                      max="50000"
                      value={electricityKwh}
                      onChange={(e) => updateElectricityKwh(Math.max(0, Number(e.target.value)))}
                      className="w-24 bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2.5 text-right text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Diet Selection (Card Selector instead of select dropdown for superior UX) */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-emerald-400" />
                    Dietary Pattern
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["Omnivore", "Vegetarian", "Vegan"] as DietType[]).map((type) => {
                      const isActive = diet === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => updateDiet(type)}
                          className={`flex flex-col items-center justify-center py-3.5 px-2.5 rounded-2xl border text-center transition-all ${
                            isActive
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/5 font-semibold"
                              : "bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          {type === "Omnivore" && <Utensils className="w-5 h-5 mb-1.5" />}
                          {type === "Vegetarian" && <Leaf className="w-5 h-5 mb-1.5" />}
                          {type === "Vegan" && <TrendingDown className="w-5 h-5 mb-1.5" />}
                          <span className="text-xs">{type}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-slate-950 group-hover:rotate-12 transition-transform duration-300" />
                      Get Gemini AI Coaching
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Extra Info / Callout */}
            <div className="bg-slate-900/30 border border-slate-800/40 rounded-2xl p-5 text-xs text-slate-400 flex gap-3">
              <Info className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-medium text-slate-300 mb-1">Standard Calculation Equivalents:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Transport: 0.2 kg CO2e per km driven</li>
                  <li>Electricity: 0.8 kg CO2e per kWh consumed</li>
                  <li>Diet baseline yearly emissions: Omnivore (2.5t), Veg (1.7t), Vegan (1.2t)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* RIGHT: Results & Insights (Grid: 7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Dashboard Visualizer Card */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-8">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                2. Real-Time Footprint Analysis
              </h2>

              {/* Big Metric Display */}
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-between bg-slate-950/60 border border-slate-850 p-6 rounded-2xl">
                <div>
                  <p className="text-xs uppercase tracking-widest font-semibold text-slate-500 mb-1">
                    Total Estimated Footprint
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold tracking-tight text-white bg-gradient-to-r from-emerald-400 to-white bg-clip-text text-transparent">
                      {totalFootprint.toFixed(2)}
                    </span>
                    <span className="text-sm font-semibold text-slate-400">MTCO2e/yr</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                    {totalFootprint > 10 ? (
                      <span className="text-amber-500 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> High emitting
                      </span>
                    ) : totalFootprint > 4 ? (
                      <span className="text-emerald-400 font-semibold">Moderate emissions</span>
                    ) : (
                      <span className="text-emerald-500 font-semibold">Eco-Friendly baseline</span>
                    )}
                    — Global Target: &lt; 2.0 MTCO2e/yr
                  </p>
                </div>

                {/* Graphical Dial Gauge */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    {/* Background Circle */}
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      strokeWidth="8"
                      stroke="rgba(30, 41, 59, 0.8)"
                      fill="transparent"
                    />
                    {/* Value Circle */}
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 48}
                      strokeDashoffset={
                        2 * Math.PI * 48 * (1 - Math.min(1, totalFootprint / 15))
                      }
                      strokeLinecap="round"
                      stroke={totalFootprint > 8 ? "#f59e0b" : "#10b981"}
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xs text-slate-500 font-medium">Percent of Avg</span>
                    <span className="text-lg font-bold text-white">
                      {Math.round((totalFootprint / 6.0) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Breakdown Bars */}
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-slate-350">Habit Emissions Breakdown</h3>
                <div className="space-y-4">
                  {/* Transport Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-slate-500" />
                        Transport (Driving)
                      </span>
                      <span className="text-white">
                        {transportFootprint.toFixed(2)} MTCO2e/yr ({totalFootprint > 0 ? Math.round(transportPercent) : 0}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-900">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${totalFootprint > 0 ? transportPercent : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Energy Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-slate-500" />
                        Energy (Electricity)
                      </span>
                      <span className="text-white">
                        {energyFootprint.toFixed(2)} MTCO2e/yr ({totalFootprint > 0 ? Math.round(energyPercent) : 0}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-900">
                      <div
                        className="bg-emerald-400 h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${totalFootprint > 0 ? energyPercent : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Diet Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-slate-500" />
                        Diet ({diet})
                      </span>
                      <span className="text-white">
                        {dietFootprint.toFixed(2)} MTCO2e/yr ({totalFootprint > 0 ? Math.round(dietPercent) : 0}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-900">
                      <div
                        className="bg-teal-500 h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${totalFootprint > 0 ? dietPercent : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* DYNAMIC WHAT-IF SIMULATOR SECTION */}
              <div className="pt-6 border-t border-slate-800/80">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <TrendingDown className="w-4 h-4 text-emerald-400 animate-bounce" />
                      Carbon Reduction Sandbox
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Simulate lifestyle improvements to watch your footprint drop in real-time.
                    </p>
                  </div>
                  {((simKmDriven !== kmDriven) || (simElectricityKwh !== electricityKwh) || (simDiet !== diet)) && (
                    <button
                      onClick={syncSimulator}
                      className="text-xs flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" /> Reset Sandbox
                    </button>
                  )}
                </div>

                <div className="bg-slate-950/50 rounded-2xl p-5 border border-slate-850 space-y-4">
                  {/* Sim Driving Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Reduce Driving Distance:</span>
                      <span className="text-emerald-400 font-semibold">{simKmDriven.toLocaleString()} km</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={kmDriven}
                      step="100"
                      value={simKmDriven}
                      onChange={(e) => setSimKmDriven(Number(e.target.value))}
                      className="w-full accent-emerald-400 h-1 bg-slate-900 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Sim Electricity Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Reduce Electricity Use:</span>
                      <span className="text-emerald-400 font-semibold">{simElectricityKwh.toLocaleString()} kWh</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={electricityKwh}
                      step="10"
                      value={simElectricityKwh}
                      onChange={(e) => setSimElectricityKwh(Number(e.target.value))}
                      className="w-full accent-emerald-400 h-1 bg-slate-900 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Sim Diet Select */}
                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-slate-400">Simulate Diet Change:</span>
                    <div className="flex gap-2">
                      {(["Omnivore", "Vegetarian", "Vegan"] as DietType[]).map((type) => {
                        const isOriginal = diet === type;
                        const isSimulated = simDiet === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setSimDiet(type)}
                            className={`px-2.5 py-1 text-[10px] rounded-lg border transition-all ${
                              isSimulated
                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-semibold"
                                : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
                            }`}
                          >
                            {type} {isOriginal && "(Current)"}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sandbox Output Comparison */}
                  <div className="pt-4 border-t border-slate-900 flex justify-between items-center">
                    <div className="text-xs">
                      <span className="text-slate-400">Simulated Footprint:</span>
                      <div className="text-base font-bold text-white">
                        {simTotalFootprint.toFixed(2)} MTCO2e/yr
                      </div>
                    </div>
                    {totalSavings > 0 ? (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">
                          Potential Savings
                        </span>
                        <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 inline-block mt-0.5">
                          -{totalSavings.toFixed(2)} t (-{Math.round(savingsPercent)}%)
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Adjust sliders to see potential savings</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights Card */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between mb-6 border-b border-slate-850 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/15 p-2 rounded-xl text-emerald-400">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Gemini Eco-Sustainability Coach</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Powered by gemini-2.5-flash
                    </p>
                  </div>
                </div>
                {loading && (
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                )}
              </div>

              {/* State: Empty */}
              {!loading && !insights && !error && (
                <div className="text-center py-10 px-4">
                  <div className="w-12 h-12 bg-slate-950 border border-slate-850 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-350 mb-1">No Active AI Coaching</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Click the &quot;Get Gemini AI Coaching&quot; button to generate personalized, actionable recommendations based on your current carbon metrics.
                  </p>
                </div>
              )}

              {/* State: Loading */}
              {loading && (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-emerald-500/10 border-t-2 border-t-emerald-400 animate-spin" />
                    <Sparkles className="w-5 h-5 text-emerald-400 absolute top-3.5 left-3.5 animate-pulse" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-emerald-400">Analyzing your footprint with Gemini...</p>
                    <p className="text-xs text-slate-400 italic animate-pulse max-w-xs px-4">
                      &quot;{loadingMessage}&quot;
                    </p>
                  </div>
                </div>
              )}

              {/* State: Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-2xl flex gap-3 text-sm">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Connection Error</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* State: Loaded Insights */}
              {insights && !loading && !error && (
                <div className="space-y-6">
                  {/* Encouraging Headline */}
                  <p className="text-sm text-slate-350 italic border-l-2 border-emerald-500/40 pl-3">
                    Coach insights generated directly from your emitting profile:
                  </p>

                  {/* Rendered Action Items */}
                  {parsedBulletPoints.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {parsedBulletPoints.map((point, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl hover:border-emerald-500/20 transition-all flex items-start gap-4 group"
                        >
                          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-bold shrink-0 group-hover:scale-105 transition-transform">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-sm text-slate-200 leading-relaxed font-medium">
                              {point}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Fallback to raw text if formatting wasn't perfectly parsed
                    <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl whitespace-pre-line text-sm text-slate-300 leading-relaxed">
                      {insights}
                    </div>
                  )}

                  {/* Action footer */}
                  <div className="pt-2 flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-900">
                    <span>Coach active</span>
                    <span>Suggestions are directional</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
