"use client";

import { Badge, C, Card, PageBody, PageContent, TableHeader, TableRow, TD, TopBar } from "@/components/vertra";

const KPI = [
  { label: "Total de NFs", value: 5, sub: "neste projeto",  color: "#2B7A8A" },
  { label: "Entregas OK",  value: 2, sub: "40% do total",   color: "#2B8A7A" },
  { label: "Em Trânsito",  value: 2, sub: "estimativa: 3d", color: "#2B65C0" },
];

const SHIPMENTS = [
  { nf: "001234", date: "01/05/2025", dest: "Campinas / SP",        carrier: "Transportes Rápidos", deadline: 3, freight: 850,  status: "delivered" },
  { nf: "001235", date: "01/05/2025", dest: "Ribeirão Preto / SP",  carrier: "LogBrasil",           deadline: 5, freight: 540,  status: "transit"   },
  { nf: "001236", date: "02/05/2025", dest: "Santos / SP",          carrier: "Transportes Rápidos", deadline: 2, freight: 1200, status: "pending"   },
  { nf: "001237", date: "03/05/2025", dest: "Sorocaba / SP",        carrier: "SpeedLog",            deadline: 4, freight: 720,  status: "delivered" },
  { nf: "001238", date: "04/05/2025", dest: "Guarulhos / SP",       carrier: "LogBrasil",           deadline: 1, freight: 290,  status: "transit"   },
];

export default function PainelClientePage() {
  return (
    <PageBody>
      <TopBar title="Meu Painel" subtitle="Logística SP — Mai/25 · Mercatto Atacado" />
      <PageContent gap={24}>

        {/* KPI cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {KPI.map((s) => (
            <div key={s.label} style={{ background: C.bgCard, borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 6px rgba(13,43,62,0.07)", borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: 36, color: C.navy, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, color: s.color, marginTop: 6 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Shipments table */}
        <Card>
          <div style={{ padding: "16px 22px 12px", borderBottom: "1px solid #EEF4F6" }}>
            <span style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: 15, color: C.navy }}>Notas Fiscais</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <TableHeader cols={["NF","Data","Destino","Transportadora","Prazo (d)","Frete","Status"]} />
            <tbody>
              {SHIPMENTS.map((r) => (
                <TableRow key={r.nf}>
                  <TD primary>{r.nf}</TD>
                  <TD muted>{r.date}</TD>
                  <TD>{r.dest}</TD>
                  <TD>{r.carrier}</TD>
                  <td style={{ padding: "12px 18px", fontFamily: "Outfit, sans-serif", fontSize: 13, color: C.textMuted, textAlign: "center" }}>{r.deadline}</td>
                  <TD>R$ {r.freight.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TD>
                  <TD><Badge status={r.status} /></TD>
                </TableRow>
              ))}
            </tbody>
          </table>
        </Card>

      </PageContent>
    </PageBody>
  );
}
