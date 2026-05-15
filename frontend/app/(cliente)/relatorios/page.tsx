"use client";

import { useState } from "react";
import { C, Card, FieldSelect, PageBody, PageContent, TopBar } from "@/components/vertra";

const BAR_DATA = [
  { label: "Jan", frete: 24200 },
  { label: "Fev", frete: 31800 },
  { label: "Mar", frete: 48500 },
  { label: "Abr", frete: 55300 },
  { label: "Mai", frete: 67100 },
];
const MAX_FRETE = Math.max(...BAR_DATA.map((d) => d.frete));

const TRANSPORTADORAS = [
  { name: "Transportes Rápidos", nfs: 98, pct: 40, frete: 26840 },
  { name: "LogBrasil",           nfs: 74, pct: 30, frete: 20130 },
  { name: "SpeedLog",            nfs: 49, pct: 20, frete: 13420 },
  { name: "Outros",              nfs: 22, pct: 10, frete:  6710 },
];

const KPIS = [
  { l: "NFs no Período",  v: "243",       u: "notas fiscais"   },
  { l: "Peso Total",      v: "18.420",    u: "kg transportados" },
  { l: "Custo de Frete",  v: "R$ 67.100", u: "total acumulado"  },
  { l: "Frete / NF",      v: "R$ 276",    u: "custo médio"      },
];

export default function RelatoriosPage() {
  const [period, setPeriod] = useState("mai-2025");

  return (
    <PageBody>
      <TopBar
        title="Relatórios"
        subtitle="Mercatto Atacado · Logística SP"
        actions={
          <FieldSelect label="" value={period} onChange={setPeriod}
            options={[
              { value: "mai-2025", label: "Maio 2025" },
              { value: "abr-2025", label: "Abril 2025" },
              { value: "mar-2025", label: "Março 2025" },
            ]}
          />
        }
      />
      <PageContent gap={24}>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {KPIS.map((k) => (
            <div key={k.l} style={{ background: C.bgCard, borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 6px rgba(13,43,62,0.07)" }}>
              <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>{k.l}</div>
              <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: 26, color: C.navy, lineHeight: 1 }}>{k.v}</div>
              <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, color: C.textFaint, marginTop: 5 }}>{k.u}</div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <Card style={{ padding: "22px 24px" }}>
          <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 20 }}>Custo de Frete por Mês (R$)</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 160 }}>
            {BAR_DATA.map((d, i) => (
              <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 11, color: C.textMuted }}>R$ {(d.frete / 1000).toFixed(0)}k</div>
                <div style={{ width: "100%", borderRadius: "6px 6px 0 0", background: i === BAR_DATA.length - 1 ? C.teal : "#B8D9D5", height: `${(d.frete / MAX_FRETE) * 120}px`, transition: "height 0.5s" }} />
                <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, fontWeight: 600, color: C.textSecondary }}>{d.label}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Transportadoras */}
        <Card style={{ padding: "22px 24px" }}>
          <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 16 }}>Por Transportadora</div>
          {TRANSPORTADORAS.map((t) => (
            <div key={t.name} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontFamily: "Outfit, sans-serif", fontSize: 13, color: C.navy, fontWeight: 500 }}>{t.name}</span>
                <span style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, color: C.textMuted }}>{t.nfs} NFs · R$ {t.frete.toLocaleString("pt-BR")}</span>
              </div>
              <div style={{ background: "#EEF4F6", borderRadius: 4, height: 8, overflow: "hidden" }}>
                <div style={{ width: `${t.pct}%`, height: "100%", background: "linear-gradient(90deg,#4A9B8E,#7ECDC0)", borderRadius: 4, transition: "width 0.6s" }} />
              </div>
            </div>
          ))}
        </Card>

      </PageContent>
    </PageBody>
  );
}
