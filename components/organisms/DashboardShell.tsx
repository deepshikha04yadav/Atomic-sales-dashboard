import { ReactNode } from "react";

export default function DashboardShell({ children }: { children: ReactNode }) {
  return <section className="space-y-4">{children}</section>;
}
