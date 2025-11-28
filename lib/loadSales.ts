import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

export interface SalesRecord {
  Product_ID: string;
  Sale_Date: string;
  Sales_Rep: string;
  Region: string;
  Sales_Amount: number;
  Quantity_Sold: number;
  Product_Category: string;
  Unit_Cost: number;
  Unit_Price: number;
  Customer_Type: string;
  Discount: number;
  Payment_Method: string;
  Sales_Channel: string;
  Region_and_Sales_Rep: string;
}

export function loadSalesData(): SalesRecord[] {
  const filePath = path.join(process.cwd(), "public/data/sales.csv");
  const fileContent = fs.readFileSync(filePath, "utf-8");

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  return records.map((row: any) => ({
    ...row,
    Sales_Amount: Number(row.Sales_Amount),
    Quantity_Sold: Number(row.Quantity_Sold),
    Unit_Cost: Number(row.Unit_Cost),
    Unit_Price: Number(row.Unit_Price),
    Discount: Number(row.Discount)
  }));
}
