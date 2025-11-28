import { NextResponse } from "next/server";
import { loadSalesData } from "@/lib/loadSales";

export async function GET() {
  const sales = loadSalesData();

  const yearlyTotals: Record<string, number> = {};

  sales.forEach((s) => {
    const year = new Date(s.Sale_Date).getFullYear().toString();
    if (!yearlyTotals[year]) yearlyTotals[year] = 0;
    yearlyTotals[year] += s.Sales_Amount;
  });

  const formatted = Object.keys(yearlyTotals).map((year) => ({
    year,
    totalSales: Number(yearlyTotals[year].toFixed(2)),
  }));

  return NextResponse.json(formatted);
}
