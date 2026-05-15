import { Sidebar } from "@/components/vertra";

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar isClient={true} />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
