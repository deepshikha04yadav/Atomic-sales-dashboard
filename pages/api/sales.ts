// pages/api/sales.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

type MonthlySales = { month: string; value: number };
type YearSales = { year: number; monthly: MonthlySales[] };

function guessColumn(headers: string[], patterns: string[]) {
  const lower = headers.map((h) => h.toLowerCase());
  for (const p of patterns) {
    const idx = lower.findIndex((h) => h.includes(p));
    if (idx >= 0) return headers[idx];
  }
  return null;
}

function monthName(monthIndex: number) {
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return names[monthIndex];
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const csvPath = path.join(process.cwd(), "data", "sales_dataset.csv");
    if (!fs.existsSync(csvPath)) {
      return res.status(500).json({ error: "CSV not found. Put the Kaggle CSV at /data/sales_dataset.csv" });
    }

    const raw = fs.readFileSync(csvPath, "utf8");
    const records = parse(raw, {
      columns: true,
      skip_empty_lines: true
    }) as Record<string, string>[];

    if (!records || records.length === 0) return res.status(500).json({ error: "No rows parsed from CSV" });

    const headers = Object.keys(records[0]);

    // Detect date column
    const dateCol = guessColumn(headers, ["date", "orderdate", "order_date", "order date", "invoice", "shipdate", "sale_date", "salesdate"]);
    // Detect sales column
    const salesCol = guessColumn(headers, ["sales", "amount", "total", "price", "revenue"]);
    // Detect quantity & unit price
    const quantityCol = guessColumn(headers, ["quantity", "qty", "units"]);
    const unitPriceCol = guessColumn(headers, ["unitprice", "unit price", "price", "unit_price"]);

    if (!dateCol) {
      return res.status(500).json({ error: "Could not detect any date column in CSV headers", headers });
    }

    // group {year -> monthIndex -> sum}
    const grouped = new Map<number, number[]>();

    for (const row of records) {
      const rawDate = row[dateCol];
      if (!rawDate) continue;

      // Try parse date heuristically
      let d = new Date(rawDate);
      if (isNaN(d.getTime())) {
        // attempt some common formats dd/mm/yyyy or mm/dd/yyyy
        const parts = rawDate.replace(/['"]+/g, "").split(/[\/\-. ]+/).map((p) => p.trim());
        if (parts.length >= 3) {
          // heuristic: if year is 4-digit in first/last place
          let yearStr = parts.find((p) => p.length === 4) ?? parts[2];
          let year = parseInt(yearStr);
          let month = parseInt(parts[1]) - 1;
          if (isNaN(month)) month = 0;
          d = new Date(year, month, 1);
        } else {
          continue;
        }
      }

      const year = d.getFullYear();
      const monthIndex = d.getMonth(); // 0-11

      // Determine row sales value
      let value = 0;
      if (salesCol && row[salesCol]) {
        const cleaned = row[salesCol].replace(/[^0-9.\-]/g, "");
        value = Number(cleaned) || 0;
      } else if (quantityCol && unitPriceCol && row[quantityCol] && row[unitPriceCol]) {
        const q = Number(String(row[quantityCol]).replace(/[^0-9.\-]/g, "")) || 0;
        const p = Number(String(row[unitPriceCol]).replace(/[^0-9.\-]/g, "")) || 0;
        value = q * p;
      } else {
        // try common pairs
        const qty = guessColumn(headers, ["quantity", "qty", "units"]);
        const price = guessColumn(headers, ["price", "unitprice", "unit_price"]);
        if (qty && price && row[qty] && row[price]) {
          const q = Number(String(row[qty]).replace(/[^0-9.\-]/g, "")) || 0;
          const p = Number(String(row[price]).replace(/[^0-9.\-]/g, "")) || 0;
          value = q * p;
        } else {
          value = 0;
        }
      }

      if (!grouped.has(year)) grouped.set(year, Array(12).fill(0));
      grouped.get(year)![monthIndex] += value;
    }

    // Convert grouped map to YearSales[] sorted descending (latest first)
    const result: YearSales[] = Array.from(grouped.entries())
      .map(([year, months]) => ({
        year,
        monthly: months.map((v, idx) => ({ month: monthName(idx), value: Math.round(v) }))
      }))
      .sort((a, b) => b.year - a.year);

    // Optional: filter by ?year=YYYY
    const { year } = req.query;
    if (year) {
      const y = Number(year);
      const found = result.find((r) => r.year === y);
      if (!found) return res.status(404).json({ error: "Year not found" });
      return res.status(200).json(found);
    }

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: String(err?.message ?? err) });
  }
}
