# Atomic-sales-dashboard 

A simple sales dashboard built with **Next.js (App Router, v15)**, **TypeScript**, **Tailwind CSS**, and **Recharts**.  
It loads a sales CSV dataset (as described in the original dataset), aggregates sales by year/month, and visualizes it with interactive charts. The code follows an **atomic component structure** (atoms → molecules → organisms) for clean layout and easy extension.

---

## Features

- Load sales data from a CSV file (with specified columns: `Product_ID`, `Sale_Date`, `Sales_Amount`, etc.)  
- Aggregate sales by year (based on `Sale_Date`)  
- Display interactive chart (bar / line / pie) using Recharts  
- Simple dashboard UI with filters:  
  - Year selector  
  - Minimum-sales threshold filter  
  - Chart type selector (line / bar / pie)  
- Atomic architecture: components separated into **atoms**, **molecules**, **organisms** for modularity and reusability  
- Easy to extend — can integrate real APIs, more filter criteria, more charts, etc.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)  
- **Language**: TypeScript  
- **Styling**: Tailwind CSS  
- **Charts**: Recharts  
- **CSV parsing**: `csv-parse` (synchronous)  
- **CSS structure**: Atomic design (atoms / molecules / organisms)  

---

## Getting Started

### Prerequisites

- Node.js (v18 or newer recommended)  
- npm or Yarn  

### Installation

```
# Clone the repo
git clone https://github.com/deepshikha04yadav/Atomic-sales-dashboard.git
cd Atomic-sales-dashboard

# Install dependencies
npm install
# or
yarn install
```

### Project Setup

1. Place your sales CSV file (with proper columns as discussed) under:
```
public/data/sales.csv
```

2. Ensure the CSV uses the correct column names:
```
Product_ID, Sale_Date, Sales_Rep, Region, Sales_Amount, Quantity_Sold,
Product_Category, Unit_Cost, Unit_Price, Customer_Type, Discount,
Payment_Method, Sales_Channel, Region_and_Sales_Rep
```
