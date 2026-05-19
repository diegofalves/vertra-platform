"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, C, Card, PageBody, PageContent, TableHeader, TableRow, TD, TopBar } from "@/components/vertra";
import { Client, fetchClients, fetchProjects, Project } from "@/lib/api";

const ORGANIZATION_ID = process.env.NEXT_PUBLIC_ORGANIZATION_ID ?? "";

export default function PainelPage() {
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchClients(ORGANIZATION_ID), fetchProjects(ORGANIZATION_ID)])
      .then(([c, p]) => { setClients(c); setProjects(p); })
      .finally(() => setLoading(false));
  }, []);

  const activeClients = clients.filter((c) => c.active).length;
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;

  const STATS = [
    { label: "Clientes Ativos",   value: loading ? "—" : String(activeClients),   delta: `${clients.length} total`,             color: "#4A9B8E" },
    { label: "Projetos em Curso", value: loading ? "—" : String(activeProjects),   delta: `${completedProjects} finalizados`,     color: "#2B7A8A" },
    { label: "NFs Importadas",    value: "—",                                       delta: "em breve",                            color: "#3D6B7A" },
    { label: "Taxa de Entrega",   value: "—",                                       delta: "em breve",                            color: "#1E8A6E" },
  ];

  const recent = [...projects]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

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
            <TableHeader cols={["Projeto", "Cliente", "Status", "Última atualização"]} />
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ padding: 48, textAlign: "center", color: C.textFaint, fontFamily: "Outfit, sans-serif", fontSize: 14 }}>Carregando…</td></tr>
              ) : recent.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 48, textAlign: "center", color: C.textFaint, fontFamily: "Outfit, sans-serif", fontSize: 14 }}>Nenhum projeto ainda.</td></tr>
              ) : recent.map((r) => (
                <TableRow key={r.id}>
                  <TD primary>{r.name}</TD>
                  <TD>{r.client_name ?? "—"}</TD>
                  <TD><Badge status={r.status} /></TD>
                  <TD muted>{new Date(r.updated_at).toLocaleDateString("pt-BR")}</TD>
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
