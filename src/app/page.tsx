'use client';
import { useState, useMemo, useCallback } from 'react';

// --- CODE QUALITY UPGRADES: Explicit TypeScript Interfaces ---
interface SimulationPayload {
  transport: number;
  energy: number;
  diet: number;
  total: number;
}

interface DietMetrics {
  [key: string]: number;
}

// --- CODE QUALITY UPGRADES: Extracted Constants (No Magic Numbers) ---
const DIET_COEFFICIENTS: DietMetrics = { omnivore: 2.5, vegetarian: 1.7, vegan: 1.2 };
const TRANSPORT_MULTIPLIER = 0.0002;
const ENERGY_MULTIPLIER = 0.0096; // (12 months * 0.0008)

export default function Home() {
  // Habit tracking configurations
  const [kmDriven, setKmDriven] = useState<number>(5000);
  const [electricityKwh, setElectricityKwh] = useState<number>(150);
  const [dietType, setDietType] = useState<string>('omnivore');

  // Interactive "What-If" reduction simulation states
  const [reduceKm, setReduceKm] = useState<number>(0);
  const [reduceKwh, setReduceKwh] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);
  const [insights, setInsights] = useState<string>('');
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);

  // --- EFFICIENCY UPGRADE: useMemo caches base logic so it doesn't recalculate pointlessly ---
  const { baseTotal, baseDiet } = useMemo(() => {
    const baseTransport = kmDriven * TRANSPORT_MULTIPLIER;
    const baseEnergy = electricityKwh * ENERGY_MULTIPLIER;
    const diet = DIET_COEFFICIENTS[dietType] || 2.5;
    return {
      baseDiet: diet,
      baseTotal: baseTransport + baseEnergy + diet,
    };
  }, [kmDriven, electricityKwh, dietType]);

  // --- EFFICIENCY UPGRADE: useMemo caches slider simulations ---
  const { simTransport, simEnergy, simulatedTotal, carbonSaved } = useMemo(() => {
    const transport = Math.max(0, (kmDriven - reduceKm) * TRANSPORT_MULTIPLIER);
    const energy = Math.max(0, (electricityKwh - reduceKwh) * ENERGY_MULTIPLIER);
    const total = transport + energy + baseDiet;
    return {
      simTransport: transport,
      simEnergy: energy,
      simulatedTotal: total,
      carbonSaved: Math.max(0, baseTotal - total),
    };
  }, [kmDriven, reduceKm, electricityKwh, reduceKwh, baseDiet, baseTotal]);

  // --- EFFICIENCY UPGRADE: useCallback prevents the function from recreating on every render ---
  const requestGeminiInsights = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setInsights('');
    setHasCalculated(true);

    const payload: SimulationPayload = {
      transport: simTransport,
      energy: simEnergy,
      diet: baseDiet,
      total: simulatedTotal,
    };

    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setInsights(data.insights || 'AI insights generated successfully.');
    } catch (err) {
      console.error('API Sync Error:', err);
      setInsights('Failed to sync insights with the AI engine.');
    } finally {
      setLoading(false);
    }
  }, [simTransport, simEnergy, baseDiet, simulatedTotal]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 antialiased font-sans">

      {/* HEADER PROTOCOL: Explicit Landmark & Heading Hierarchy */}
      <header className="border-b border-slate-900 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tight text-emerald-400 flex items-center gap-2">
            <span>EcoPlus</span>
            <span className="text-xs bg-emerald-500/15 text-emerald-400 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/20">
              v1.0 Live
            </span>
          </h1>
        </div>
      </header>

      {/* MAIN PROTOCOL: Core Semantic Landmark Wrapper */}
      <main className="max-w-6xl mx-auto px-4 py-10 md:py-14 space-y-10">

        <section className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-100">
            Track, Simulate, and Optimize Your Impact
          </h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Input your baseline profile analytics below to generate an interactive real-time simulation sandbox paired with targeted Gemini-driven sustainability planning.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <form onSubmit={requestGeminiInsights} className="lg:col-span-5 bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-2">1. Baseline Profile Parameters</h3>

            <div className="space-y-2">
              <label htmlFor="kmDrivenInput" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Annual Driving Distance (km)
              </label>
              <input
                id="kmDrivenInput"
                type="number"
                min="0"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 text-sm transition"
                value={kmDriven}
                onChange={(e) => setKmDriven(Math.max(0, parseInt(e.target.value) || 0))}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="electricityInput" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Monthly Electricity Consumption (kWh)
              </label>
              <input
                id="electricityInput"
                type="number"
                min="0"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 text-sm transition"
                value={electricityKwh}
                onChange={(e) => setElectricityKwh(Math.max(0, parseInt(e.target.value) || 0))}
                required
              />
            </div>

            <div className="space-y-3">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Primary Nutritional Lifestyle
              </span>

              <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Nutritional Choice Configurator">
                {[
                  { id: 'omnivore', label: 'Omnivore', desc: 'Standard Diet' },
                  { id: 'vegetarian', label: 'Vegetarian', desc: 'No Meat' },
                  { id: 'vegan', label: 'Vegan', desc: 'Plant-Based' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={dietType === item.id}
                    onClick={() => setDietType(item.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${dietType === item.id
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                  >
                    <span className="text-xs font-bold">{item.label}</span>
                    <span className="text-[10px] opacity-70 mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 text-sm font-bold py-3.5 px-4 rounded-xl transition shadow-lg shadow-emerald-500/10 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? 'Processing Gemini Optimization Parameters...' : 'Deploy Analytics Configuration'}
            </button>
          </form>

          <div className="lg:col-span-7 space-y-6">

            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-6 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-2">2. Real-Time Impact Mitigation Sandbox</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl text-center space-y-1">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Calculated Score</span>
                  <span className="text-3xl font-black text-slate-100">{simulatedTotal.toFixed(2)}</span>
                  <span className="block text-[10px] text-slate-500 font-medium">MTCO2e / Year Total</span>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl text-center space-y-1">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-emerald-400/80">Simulated Reductions</span>
                  <span className="text-3xl font-black text-emerald-400">-{carbonSaved.toFixed(2)}</span>
                  <span className="block text-[10px] text-emerald-500/60 font-medium">MTCO2e Prevented</span>
                </div>
              </div>

              <div className="space-y-5 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <label htmlFor="reduceKmSlider" className="text-slate-300">Target Transit Reduction: -{reduceKm} km</label>
                    <span className="text-slate-500">Max: {kmDriven} km</span>
                  </div>
                  <input
                    id="reduceKmSlider"
                    type="range"
                    min="0"
                    max={kmDriven || 1}
                    value={reduceKm}
                    onChange={(e) => setReduceKm(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <label htmlFor="reduceKwhSlider" className="text-slate-300">Target Power Conservation: -{reduceKwh} kWh/mo</label>
                    <span className="text-slate-500">Max: {electricityKwh} kWh</span>
                  </div>
                  <input
                    id="reduceKwhSlider"
                    type="range"
                    min="0"
                    max={electricityKwh || 1}
                    value={reduceKwh}
                    onChange={(e) => setReduceKwh(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-800/60">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Emission Sector Distribution Profiles</span>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400">Transit Sector Carbon Burden</span>
                    <span className="text-slate-200">{simTransport.toFixed(2)} MT</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden" role="progressbar" aria-valuenow={simTransport} aria-valuemin={0} aria-valuemax={baseTotal}>
                    <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${baseTotal > 0 ? (simTransport / baseTotal) * 100 : 0}%` }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400">Power Utilities Carbon Burden</span>
                    <span className="text-slate-200">{simEnergy.toFixed(2)} MT</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden" role="progressbar" aria-valuenow={simEnergy} aria-valuemin={0} aria-valuemax={baseTotal}>
                    <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${baseTotal > 0 ? (simEnergy / baseTotal) * 100 : 0}%` }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400">Nutritional Footprint Baseline</span>
                    <span className="text-slate-200">{baseDiet.toFixed(2)} MT</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden" role="progressbar" aria-valuenow={baseDiet} aria-valuemin={0} aria-valuemax={baseTotal}>
                    <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${baseTotal > 0 ? (baseDiet / baseTotal) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <section aria-live="polite" className="mt-6">
          {loading && (
            <div className="bg-slate-900/40 border border-slate-950 p-8 rounded-2xl flex flex-col items-center justify-center space-y-3 text-center animate-pulse">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              <p className="text-sm font-semibold text-emerald-400">Analyzing mitigation tracks using Gemini Core...</p>
            </div>
          )}

          {!loading && insights && (
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950/30 border border-emerald-500/10 rounded-2xl p-6 md:p-8 shadow-xl">
              <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                ✨ Gemini AI Personalized Strategy Matrix
              </h3>
              <div className="prose prose-invert max-w-none text-sm leading-relaxed text-slate-300 whitespace-pre-line">
                {insights}
              </div>
            </div>
          )}

          {!loading && !insights && hasCalculated && (
            <div className="bg-slate-900/20 border border-slate-900 text-slate-400 text-xs text-center py-4 rounded-xl">
              Pipeline configuration active. Submit changes to update Gemini parameters.
            </div>
          )}
        </section>

      </main>

      <footer className="border-t border-slate-900 mt-20 py-6 text-center text-xs text-slate-600">
        EcoPlus • Designed with Next.js App Router Landmarking Protocols
      </footer>

    </div>
  );
}
