"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BtnPrimary, FieldInput, VertraLogo } from "@/components/vertra";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); router.push("/painel"); }, 900);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(145deg,#EBF7F5 0%,#F8FDFB 45%,#E2F0F4 100%)",
      fontFamily: "Outfit, sans-serif", position: "relative", overflow: "hidden",
    }}>
      {/* Decorative rings */}
      <svg style={{ position: "absolute", top: -80, right: -80, opacity: 0.07 }} width="500" height="500" viewBox="0 0 80 80">
        <circle cx="28" cy="28" r="16" stroke="#0D2B3E" strokeWidth="9" fill="none" />
        <circle cx="52" cy="28" r="16" stroke="#5BA99B" strokeWidth="9" fill="none" />
        <circle cx="28" cy="52" r="16" stroke="#5BA99B" strokeWidth="9" fill="none" />
        <circle cx="52" cy="52" r="16" stroke="#0D2B3E" strokeWidth="9" fill="none" />
        <circle cx="40" cy="40" r="8" fill="#4A9B8E" />
      </svg>
      <svg style={{ position: "absolute", bottom: -60, left: -60, opacity: 0.05 }} width="400" height="400" viewBox="0 0 80 80">
        <circle cx="28" cy="28" r="16" stroke="#0D2B3E" strokeWidth="9" fill="none" />
        <circle cx="52" cy="28" r="16" stroke="#5BA99B" strokeWidth="9" fill="none" />
        <circle cx="28" cy="52" r="16" stroke="#5BA99B" strokeWidth="9" fill="none" />
        <circle cx="52" cy="52" r="16" stroke="#0D2B3E" strokeWidth="9" fill="none" />
        <circle cx="40" cy="40" r="8" fill="#4A9B8E" />
      </svg>

      <div style={{ background: "#fff", borderRadius: 20, padding: "48px 44px", width: 420, boxShadow: "0 16px 60px rgba(13,43,62,0.13)", position: "relative" }}>
        <div style={{ marginBottom: 36, display: "flex", justifyContent: "center" }}>
          <VertraLogo size={38} showText darkText />
        </div>
        <h2 style={{ fontWeight: 700, fontSize: 20, color: "#0D2B3E", margin: "0 0 6px", fontFamily: "Outfit, sans-serif" }}>Bem-vindo de volta</h2>
        <p style={{ color: "#8AAAB8", fontSize: 13, margin: "0 0 28px", fontFamily: "Outfit, sans-serif" }}>Faça login para acessar a plataforma</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <FieldInput label="E-mail" value={email} onChange={setEmail} type="email" placeholder="seu@email.com" required />
          <FieldInput label="Senha" value={password} onChange={setPassword} type="password" placeholder="••••••••" required />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <span style={{ fontSize: 12, color: "#4A9B8E", cursor: "pointer", fontFamily: "Outfit, sans-serif" }}>Esqueci minha senha</span>
          </div>
          <BtnPrimary style={{ width: "100%", padding: "12px", marginTop: 4, fontSize: 15 }} disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </BtnPrimary>
        </form>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #EEF4F6", display: "flex", justifyContent: "center", gap: 8 }}>
          <span style={{ color: "#A0B8C4", fontSize: 12, fontFamily: "Outfit, sans-serif" }}>Acesso de cliente?</span>
          <span onClick={() => router.push("/painel-cliente")} style={{ color: "#4A9B8E", fontSize: 12, cursor: "pointer", fontWeight: 600, fontFamily: "Outfit, sans-serif" }}>
            Entrar como cliente →
          </span>
        </div>
      </div>
    </div>
  );
}
