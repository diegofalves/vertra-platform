"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, BtnPrimary, BtnSecondary, C, Card, FieldInput, FieldSelect, FieldTextarea, FormError, Modal, PageBody, PageContent, TableHeader, TableRow, TD, TopBar } from "@/components/vertra";
import { Client, Project, ProjectCreate, ProjectUpdate, createProject, deleteProject, fetchClients, fetchProjects, updateProject } from "@/lib/api";

const ORGANIZATION_ID = process.env.NEXT_PUBLIC_ORGANIZATION_ID ?? "";

const EMPTY_FORM = { client_id: "", name: "", description: "", status: "active", started_at: "", finished_at: "" };

export default function ProjetosPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterClient, setFilterClient] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadClients = async () => {
    const data = await fetchClients(ORGANIZATION_ID);
    setClients(data.filter((c) => c.active));
  };

  const load = async (clientId?: string) => {
    setLoading(true); setError(null);
    try { setProjects(await fetchProjects(ORGANIZATION_ID, clientId || undefined)); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Erro ao carregar projetos"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadClients(); load(); }, []);

  const handleFilterChange = (id: string) => { setFilterClient(id); load(id); };

  const f = (k: string) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setFormError(null); setShowModal(true); };
  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({ client_id: p.client_id, name: p.name, description: p.description ?? "", status: p.status, started_at: p.started_at ?? "", finished_at: p.finished_at ?? "" });
    setFormError(null); setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError("Nome é obrigatório"); return; }
    if (!form.client_id) { setFormError("Selecione um cliente"); return; }
    setSaving(true); setFormError(null);
    try {
      if (editing) {
        const u: ProjectUpdate = { name: form.name, description: form.description || undefined, status: form.status as ProjectUpdate["status"], started_at: form.started_at || undefined, finished_at: form.finished_at || undefined };
        await updateProject(editing.id, u);
      } else {
        const c: ProjectCreate = { organization_id: ORGANIZATION_ID, client_id: form.client_id, name: form.name, description: form.description || undefined, status: form.status as ProjectCreate["status"], started_at: form.started_at || undefined, finished_at: form.finished_at || undefined };
        await createProject(c);
      }
      closeModal(); await load(filterClient);
    } catch (e: unknown) { setFormError(e instanceof Error ? e.message : "Erro ao salvar"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (p: Project) => {
    if (!confirm(`Excluir projeto "${p.name}"?`)) return;
    try { await deleteProject(p.id); await load(filterClient); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Erro ao excluir"); }
  };

  const activeCount = projects.filter((p) => p.status === "active").length;

  const fmt = (d: string | null) => d ? new Date(d + "T12:00").toLocaleDateString("pt-BR") : "—";

  return (
    <PageBody>
      <TopBar
        title="Projetos"
        subtitle={`${activeCount} em andamento · ${projects.length} total`}
        actions={<BtnPrimary onClick={openCreate}>+ Novo Projeto</BtnPrimary>}
      />
      <PageContent>
        {error && (
          <div style={{ background: "#FFF1F1", border: "1px solid #FFCACA", borderRadius: 8, padding: "10px 14px", color: "#C0392B", fontFamily: "Outfit, sans-serif", fontSize: 13 }}>{error}</div>
        )}

        {/* Filter */}
        <div>
          <select
            value={filterClient} onChange={(e) => handleFilterChange(e.target.value)}
            style={{ border: "1.5px solid #D4E5EC", borderRadius: 8, padding: "9px 14px", fontFamily: "Outfit, sans-serif", fontSize: 14, color: C.navy, outline: "none", background: "#fff", cursor: "pointer" }}
          >
            <option value="">Todos os clientes</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <Card>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <TableHeader cols={["Projeto", "Cliente", "Status", "Início", "Fim Previsto", "Ações"]} />
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 48, textAlign: "center", color: C.textFaint, fontFamily: "Outfit, sans-serif", fontSize: 14 }}>Carregando…</td></tr>
              ) : projects.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 48, textAlign: "center", color: C.textFaint, fontFamily: "Outfit, sans-serif", fontSize: 14 }}>Nenhum projeto encontrado.</td></tr>
              ) : projects.map((p) => (
                <TableRow key={p.id}>
                  <td style={{ padding: "13px 18px" }}>
                    <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 600, fontSize: 14, color: C.navy }}>{p.name}</div>
                    {p.description && <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, color: C.textFaint, marginTop: 2 }}>{p.description}</div>}
                  </td>
                  <TD>{p.client_name ?? "—"}</TD>
                  <TD><Badge status={p.status} /></TD>
                  <TD muted mono>{fmt(p.started_at)}</TD>
                  <TD muted mono>{fmt(p.finished_at)}</TD>
                  <td style={{ padding: "13px 18px" }}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <span onClick={() => openEdit(p)} style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, fontWeight: 600, color: C.teal, cursor: "pointer" }}>Editar</span>
                      <Link href={`/projetos/${p.id}/carga`} style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, fontWeight: 600, color: "#2B7A8A", textDecoration: "none" }}>Carregar NFs</Link>
                      <span onClick={() => handleDelete(p)} style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, fontWeight: 600, color: "#D0484A", cursor: "pointer" }}>Excluir</span>
                    </div>
                  </td>
                </TableRow>
              ))}
            </tbody>
          </table>
        </Card>
      </PageContent>

      {showModal && (
        <Modal title={editing ? "Editar Projeto" : "Novo Projeto"} onClose={closeModal} width={560}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <FormError msg={formError} />
            <FieldSelect label="Cliente" value={form.client_id} onChange={f("client_id")} required
              options={[{ value: "", label: "Selecione um cliente" }, ...clients.map((c) => ({ value: c.id, label: c.name }))]} />
            <FieldInput label="Nome do Projeto" value={form.name} onChange={f("name")} required />
            <FieldTextarea label="Descrição" value={form.description} onChange={f("description")} placeholder="Opcional" />
            <FieldSelect label="Status" value={form.status} onChange={f("status")}
              options={[{ value: "active", label: "Ativo" }, { value: "paused", label: "Pausado" }, { value: "completed", label: "Concluído" }]} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FieldInput label="Data de Início" value={form.started_at} onChange={f("started_at")} type="date" />
              <FieldInput label="Fim Previsto" value={form.finished_at} onChange={f("finished_at")} type="date" />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}>
            <BtnSecondary onClick={closeModal}>Cancelar</BtnSecondary>
            <BtnPrimary onClick={handleSave} disabled={saving}>{saving ? "Salvando…" : "Salvar"}</BtnPrimary>
          </div>
        </Modal>
      )}
    </PageBody>
  );
}
