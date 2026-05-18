import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={outfit.className}>
      <body style={{ margin: 0, padding: 0, background: "#F4FAFB" }}>
        {children}
      </body>
    </html>
  );
}
