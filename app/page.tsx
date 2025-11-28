"use client";

import { useEffect, useState } from "react";
import ChartWrapper from "../components/atoms/ChartWrapper";
import SalesChart from "../components/molecules/SalesChart";
import DashboardShell from "../components/organisms/DashboardShell";

type Monthly = { month: string; value: number };
type YearSales = { year: number; monthly: Monthly[] };

export default function DashboardPage() {
  const [sales, setSales] = useState<YearSales[]>([]);
  const [year, setYear] = useState<number | null>(null);
  const [chartType, setChartType] = useState<"line" | "bar" | "pie">("line");
  const [minFilter, setMinFilter] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSales() {
      setLoading(true);
      try {
        const res = await fetch("/api/sales");
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const data = await res.json() as YearSales[];
        setSales(data);
        if (data.length > 0) setYear(data[0].year);
      } catch (err: any) {
        setError(String(err?.message ?? err));
      } finally {
        setLoading(false);
      }
    }
    fetchSales();
  }, []);

  const selected = sales.find((s) => s.year === year) ?? null;
  const yearData = selected ? selected.monthly : [];

  const filtered = minFilter === "" ? yearData : yearData.filter((m) => m.value >= Number(minFilter));

  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sales Dashboard</h1>
        <div className="flex gap-2 items-center">
          <label className="text-sm">Min sales</label>
          <input
            type="number"
            className="rounded p-2 border w-32"
            placeholder="e.g. 15000"
            value={minFilter}
            onChange={(e) => setMinFilter(e.target.value === "" ? "" : Number(e.target.value))}
          />
          <select value={year ?? ""} onChange={(e) => setYear(Number(e.target.value))} className="rounded p-2 border">
            <option value="">Select year</option>
            {sales.map((s) => (
              <option key={s.year} value={s.year}>
                {s.year}
              </option>
            ))}
          </select>
          <select value={chartType} onChange={(e) => setChartType(e.target.value as any)} className="rounded p-2 border">
            <option value="line">Line</option>
            <option value="bar">Bar</option>
            <option value="pie">Pie</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-6">Loading...</div>
      ) : error ? (
        <div className="p-6 text-red-500">Error: {error}</div>
      ) : (
        <>
          <ChartWrapper title={`Sales ${year ?? ""}`}>
            <SalesChart data={filtered} type={chartType} />
          </ChartWrapper>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl shadow p-4">
              <h4 className="font-semibold">Total (selected)</h4>
              <p className="text-2xl">{filtered.reduce((s, x) => s + x.value, 0).toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-4">
              <h4 className="font-semibold">Months shown</h4>
              <p className="text-2xl">{filtered.length}</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-4">
              <h4 className="font-semibold">Source</h4>
              <p className="text-sm">Kaggle dataset (local CSV)</p>
            </div>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
