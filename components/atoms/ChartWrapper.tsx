import { ReactNode } from "react";

export default function ChartWrapper({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
      <div className="w-full h-72">{children}</div>
    </div>
  );
}
