"use client";

import Link from "next/link";
import { Badge, C, Card, PageBody, PageContent, TableHeader, TableRow, TD, TopBar } from "@/components/vertra";

const STATS = [
  { label: "Clientes Ativos",   value: "24",    delta: "+3 este mês",        color: "#4A9B8E" },
  { label: "Projetos em Curso", value: "11",    delta: "2 finalizados",       color: "#2B7A8A" },
  { label: "NFs Importadas",    value: "1.847", delta: "+312 esta semana",    color: "#3D6B7A" },
  { label: "Taxa de Entrega",   value: "94%",   delta: "+1.2% vs mês ant.",   color: "#1E8A6E" },
];

const RECENT = [
  { project: "Logística SP — Mai/25", client: "Mercatto Atacado", nfs: 312, status: "active",    date: "12/05/2025" },
  { project: "Distribuição Sul Q2",   client: "TechDist Ltda",    nfs: 88,  status: "active",    date: "10/05/2025" },
  { project: "Rota Interior Jan/25",  client: "Agro Brasil S.A.", nfs: 540, status: "completed", date: "28/01/2025" },
  { project: "Urbano RJ — Abr",       client: "CityLog Rio",      nfs: 201, status: "paused",    date: "30/04/2025" },
  { project: "Cross SP–MG Mar",       client: "Mercatto Atacado", nfs: 177, status: "completed", date: "31/03/2025" },
];

export default function PainelPage() {
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <PageBody>
      <TopBar title="Painel" subtitle={`Visão geral — ${today}`} />
      <PageContent gap={28}>

        {/* KPI cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ background: C.bgCard, borderRadius: 14, padding: "22px 22px 18px", boxShadow: "0 1px 6px rgba(13,43,62,0.07)", borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontSize: 11, fontFamily: "Outfit, sans-serif", fontWeight: 600, color: C.textMuted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: 34, color: C.navy, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, color: s.color, marginTop: 8, fontWeight: 500 }}>{s.delta}</div>
            </div>
          ))}
        </div>

        {/* Recent projects */}
        <Card>
          <div style={{ padding: "18px 24px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #EEF4F6" }}>
            <span style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: 15, color: C.navy }}>Projetos Recentes</span>
            <Link href="/projetos" style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, color: C.teal, fontWeight: 600, textDecoration: "none" }}>Ver todos →</Link>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <TableHeader cols={["Projeto", "Cliente", "NFs", "Status", "Última atualização"]} />
            <tbody>
              {RECENT.map((r, i) => (
                <TableRow key={i}>
                  <TD primary>{r.project}</TD>
                  <TD>{r.client}</TD>
                  <TD>{r.nfs.toLocaleString("pt-BR")}</TD>
                  <TD><Badge status={r.status} /></TD>
                  <TD muted>{r.date}</TD>
                </TableRow>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Link href="/clientes" style={{ textDecoration: "none" }}>
            <div style={{ background: "linear-gradient(135deg,#0D2B3E,#1A4A5C)", borderRadius: 14, padding: "22px 24px", cursor: "pointer", transition: "transform 0.15s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = ""; }}>
              <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 6 }}>Gerenciar Clientes</div>
              <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.55)" }}>Cadastre e atualize clientes da organização</div>
            </div>
          </Link>
          <Link href="/projetos" style={{ textDecoration: "none" }}>
            <div style={{ background: "linear-gradient(135deg,#3A8578,#4A9B8E)", borderRadius: 14, padding: "22px 24px", cursor: "pointer", transition: "transform 0.15s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = ""; }}>
              <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 6 }}>Novo Projeto + NFs</div>
              <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.65)" }}>Crie projetos e importe planilhas de NF</div>
            </div>
          </Link>
        </div>

      </PageContent>
    </PageBody>
  );
}
