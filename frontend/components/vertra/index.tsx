"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CSSProperties, ReactNode } from "react";

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
export const C = {
  navy: "#0D2B3E",
  navyMid: "#1A4A5C",
  teal: "#4A9B8E",
  tealDark: "#3A8578",
  tealLight: "#7ECDC0",
  bgPage: "#F4FAFB",
  bgCard: "#FFFFFF",
  bgHeader: "#F8FBFC",
  textPrimary: "#0D2B3E",
  textSecondary: "#5A7A8A",
  textMuted: "#7A9BAA",
  textFaint: "#9BBAC4",
  border: "#E0ECED",
  borderInput: "#D4E5EC",
} as const;

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------
export function PanelIcon({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="7" height="7" rx="1.5" fill={color} opacity="0.9" />
      <rect x="11" y="2" width="7" height="7" rx="1.5" fill={color} opacity="0.9" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" fill={color} opacity="0.9" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" fill={color} opacity="0.9" />
    </svg>
  );
}
export function ClientsIcon({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="7" cy="7" r="3.5" fill={color} opacity="0.9" />
      <path d="M1 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
      <circle cx="14" cy="7" r="2.5" fill={color} opacity="0.55" />
      <path d="M17 16.5c0-2.485-1.343-4.5-3-4.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}
export function ProjectsIcon({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="16" height="3.5" rx="1.5" fill={color} opacity="0.9" />
      <rect x="2" y="7.5" width="10" height="3.5" rx="1.5" fill={color} opacity="0.9" />
      <rect x="2" y="13" width="13" height="3.5" rx="1.5" fill={color} opacity="0.9" />
    </svg>
  );
}
export function ReportsIcon({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="3" y="2" width="14" height="16" rx="2" stroke={color} strokeWidth="1.8" opacity="0.9" />
      <path d="M7 7h6M7 11h4M7 15h5" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}
export function LogoutIcon({ size = 17, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M8 3H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h4" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M13 7l4 3-4 3M7 10h10" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function UploadIcon({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 12V4M10 4L7 7M10 4l3 3" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 15v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
export function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <circle cx="9" cy="9" r="6" stroke="#9BBAC4" strokeWidth="2" />
      <path d="M14 14l3 3" stroke="#9BBAC4" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Logo
// ---------------------------------------------------------------------------
export function VertraLogo({ size = 32, showText = true, darkText = false }: { size?: number; showText?: boolean; darkText?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        <circle cx="28" cy="28" r="16" stroke="#0D2B3E" strokeWidth="9" fill="none" />
        <circle cx="52" cy="28" r="16" stroke="#5BA99B" strokeWidth="9" fill="none" />
        <circle cx="28" cy="52" r="16" stroke="#5BA99B" strokeWidth="9" fill="none" />
        <circle cx="52" cy="52" r="16" stroke="#0D2B3E" strokeWidth="9" fill="none" />
        <circle cx="40" cy="40" r="8" fill="#4A9B8E" />
        <circle cx="37" cy="37" r="3" fill="rgba(255,255,255,0.35)" />
      </svg>
      {showText && (
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: size * 0.56, color: darkText ? C.navy : "#fff", letterSpacing: "0.04em" }}>VERTRA</div>
          <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 500, fontSize: size * 0.31, color: "#5BA99B", letterSpacing: "0.18em" }}>SOLUTIONS</div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
const INTERNAL_NAV = [
  { href: "/painel", label: "Painel", Icon: PanelIcon },
  { href: "/clientes", label: "Clientes", Icon: ClientsIcon },
  { href: "/projetos", label: "Projetos", Icon: ProjectsIcon },
];
const CLIENT_NAV = [
  { href: "/painel-cliente", label: "Painel", Icon: PanelIcon },
  { href: "/relatorios", label: "Relatórios", Icon: ReportsIcon },
];

export function Sidebar({ isClient = false }: { isClient?: boolean }) {
  const pathname = usePathname();
  const nav = isClient ? CLIENT_NAV : INTERNAL_NAV;

  return (
    <aside style={{ width: 220, minWidth: 220, background: C.navy, display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, flexShrink: 0 }}>
      <div style={{ padding: "28px 20px 24px", borderBottom: "1px solid rgba(91,169,155,0.15)" }}>
        <VertraLogo size={28} />
      </div>

      <nav style={{ flex: 1, padding: "16px 0", overflowY: "auto" }}>
        {nav.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 11, padding: "10px 20px",
                background: active ? "rgba(91,169,155,0.18)" : "transparent",
                borderLeft: active ? "3px solid #5BA99B" : "3px solid transparent",
                color: active ? C.tealLight : "rgba(255,255,255,0.6)",
                fontFamily: "Outfit, sans-serif", fontWeight: active ? 600 : 400, fontSize: 14,
                transition: "background 0.15s",
              }}>
                <Icon size={17} color={active ? C.tealLight : "rgba(255,255,255,0.55)"} />
                {label}
              </div>
            </Link>
          );
        })}

        {!isClient && (
          <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 20px", marginTop: 8, opacity: 0.4, color: "rgba(255,255,255,0.6)", fontFamily: "Outfit, sans-serif", fontSize: 14, borderLeft: "3px solid transparent" }}>
            <UploadIcon size={17} color="rgba(255,255,255,0.45)" />
            Carga de NFs
          </div>
        )}
      </nav>

      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(91,169,155,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#4A9B8E,#0D2B3E)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
            {isClient ? "C" : "A"}
          </div>
          <div>
            <div style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Outfit, sans-serif", fontWeight: 500, fontSize: 13, lineHeight: 1.3 }}>{isClient ? "Acesso Cliente" : "Administrador"}</div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Outfit, sans-serif", fontSize: 11 }}>{isClient ? "painel-cliente" : "vertra.solutions"}</div>
          </div>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "rgba(255,255,255,0.4)", fontFamily: "Outfit, sans-serif", fontSize: 12, background: "none", border: "none", padding: 0 }}>
          <LogoutIcon size={14} color="rgba(255,255,255,0.4)" />
          Sair
        </button>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// TopBar
// ---------------------------------------------------------------------------
export function TopBar({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
      <div>
        <h1 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: 22, color: C.navy, margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ fontFamily: "Outfit, sans-serif", fontSize: 13, color: C.textMuted, margin: "2px 0 0" }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: 10, alignItems: "center" }}>{actions}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------
type BadgeStatus = "active" | "paused" | "completed" | "inactive" | "delivered" | "transit" | "pending";
const BADGE_MAP: Record<BadgeStatus, { label: string; bg: string; color: string }> = {
  active:    { label: "Ativo",        bg: "#E6F5F2", color: "#2B8A7A" },
  paused:    { label: "Pausado",      bg: "#FFF8E6", color: "#B07D10" },
  completed: { label: "Concluído",    bg: "#F0F0F2", color: "#6B7C8A" },
  inactive:  { label: "Inativo",      bg: "#F5F5F7", color: "#8A9BAA" },
  delivered: { label: "Entregue",     bg: "#E6F5F2", color: "#2B8A7A" },
  transit:   { label: "Em trânsito",  bg: "#EBF4FF", color: "#2B65C0" },
  pending:   { label: "Pendente",     bg: "#FFF8E6", color: "#B07D10" },
};
export function Badge({ status }: { status: string }) {
  const s = BADGE_MAP[status as BadgeStatus] ?? BADGE_MAP.inactive;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 10px", borderRadius: 99, background: s.bg, color: s.color, fontFamily: "Outfit, sans-serif", fontWeight: 600, fontSize: 11 }}>
      {s.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
export function Modal({ title, onClose, children, width = 520 }: { title: string; onClose: () => void; children: ReactNode; width?: number }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(13,43,62,0.5)", backdropFilter: "blur(3px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "#fff", borderRadius: 16, width, maxWidth: "calc(100vw - 32px)", boxShadow: "0 24px 64px rgba(13,43,62,0.22)", overflow: "hidden" }}>
        <div style={{ padding: "22px 28px 18px", borderBottom: "1px solid #E8F0F2", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: 17, color: C.navy, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9BBAC4", fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
        </div>
        <div style={{ padding: "20px 28px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Form primitives
// ---------------------------------------------------------------------------
export function FieldInput({ label, value, onChange, placeholder, type = "text", required, disabled }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean; disabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, fontWeight: 600, color: "#4A6878", letterSpacing: "0.03em" }}>
        {label}{required && <span style={{ color: "#E05A5A" }}> *</span>}
      </label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        style={{ border: "1.5px solid #D4E5EC", borderRadius: 8, padding: "9px 12px", fontFamily: "Outfit, sans-serif", fontSize: 14, color: C.navy, outline: "none", background: disabled ? "#F4F8FA" : "#FAFCFD", transition: "border-color 0.15s", width: "100%", boxSizing: "border-box" } as CSSProperties}
        onFocus={(e) => { e.target.style.borderColor = C.teal; }}
        onBlur={(e) => { e.target.style.borderColor = "#D4E5EC"; }}
      />
    </div>
  );
}

export function FieldTextarea({ label, value, onChange, placeholder, rows = 2 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, fontWeight: 600, color: "#4A6878", letterSpacing: "0.03em" }}>{label}</label>
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{ border: "1.5px solid #D4E5EC", borderRadius: 8, padding: "9px 12px", fontFamily: "Outfit, sans-serif", fontSize: 14, color: C.navy, outline: "none", background: "#FAFCFD", resize: "none", width: "100%", boxSizing: "border-box" } as CSSProperties}
        onFocus={(e) => { e.target.style.borderColor = C.teal; }}
        onBlur={(e) => { e.target.style.borderColor = "#D4E5EC"; }}
      />
    </div>
  );
}

export function FieldSelect({ label, value, onChange, options, required }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; required?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, fontWeight: 600, color: "#4A6878", letterSpacing: "0.03em" }}>
        {label}{required && <span style={{ color: "#E05A5A" }}> *</span>}
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{ border: "1.5px solid #D4E5EC", borderRadius: 8, padding: "9px 12px", fontFamily: "Outfit, sans-serif", fontSize: 14, color: C.navy, outline: "none", background: "#FAFCFD", cursor: "pointer", width: "100%", boxSizing: "border-box" } as CSSProperties}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Buttons
// ---------------------------------------------------------------------------
export function BtnPrimary({ children, onClick, disabled, style = {}, type = "button" }: { children: ReactNode; onClick?: () => void; disabled?: boolean; style?: CSSProperties; type?: "button" | "submit" | "reset" }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      background: disabled ? "#A8D4CD" : "linear-gradient(135deg,#4A9B8E,#3A8578)",
      color: "#fff", border: "none", borderRadius: 8, padding: "10px 22px",
      fontFamily: "Outfit, sans-serif", fontWeight: 600, fontSize: 14,
      cursor: disabled ? "not-allowed" : "pointer", transition: "opacity 0.15s", ...style,
    }}>{children}</button>
  );
}

export function BtnSecondary({ children, onClick, style = {} }: { children: ReactNode; onClick?: () => void; style?: CSSProperties }) {
  return (
    <button onClick={onClick} style={{
      background: "none", color: "#6A8A98", border: "1.5px solid #D4E5EC", borderRadius: 8, padding: "9px 18px",
      fontFamily: "Outfit, sans-serif", fontWeight: 500, fontSize: 14, cursor: "pointer", ...style,
    }}>{children}</button>
  );
}

// ---------------------------------------------------------------------------
// FormError
// ---------------------------------------------------------------------------
export function FormError({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <div style={{ background: "#FFF1F1", border: "1px solid #FFCACA", borderRadius: 8, padding: "10px 14px", color: "#C0392B", fontFamily: "Outfit, sans-serif", fontSize: 13 }}>
      {msg}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table helpers
// ---------------------------------------------------------------------------
export function TableHeader({ cols }: { cols: string[] }) {
  return (
    <thead>
      <tr style={{ background: C.bgHeader }}>
        {cols.map((h) => (
          <th key={h} style={{ padding: "11px 18px", textAlign: "left", fontFamily: "Outfit, sans-serif", fontWeight: 600, fontSize: 11, color: C.textMuted, letterSpacing: "0.05em", textTransform: "uppercase" as const }}>{h}</th>
        ))}
      </tr>
    </thead>
  );
}

export function TableRow({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <tr
      style={{ borderTop: "1px solid #F0F6F8", cursor: onClick ? "pointer" : "default" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = C.bgHeader; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = ""; }}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TD({ children, primary, muted, center, mono }: { children: ReactNode; primary?: boolean; muted?: boolean; center?: boolean; mono?: boolean }) {
  return (
    <td style={{
      padding: "13px 18px",
      fontFamily: "Outfit, sans-serif",
      fontWeight: primary ? 600 : 400,
      fontSize: primary ? 14 : 13,
      color: primary ? C.navy : muted ? C.textMuted : C.textSecondary,
      textAlign: center ? "center" : "left",
      fontVariantNumeric: mono ? "tabular-nums" : undefined,
    }}>
      {children}
    </td>
  );
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------
export function Card({ children, style = {} }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ background: C.bgCard, borderRadius: 14, boxShadow: "0 1px 6px rgba(13,43,62,0.07)", overflow: "hidden", ...style }}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page shell
// ---------------------------------------------------------------------------
export function PageBody({ children }: { children: ReactNode }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bgPage, minHeight: "100vh" }}>
      {children}
    </div>
  );
}
export function PageContent({ children, gap = 24 }: { children: ReactNode; gap?: number }) {
  return (
    <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap }}>
      {children}
    </div>
  );
}
