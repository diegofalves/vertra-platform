"use client";

import { useEffect, useState } from "react";
import { Badge, BtnPrimary, BtnSecondary, C, Card, FieldInput, FormError, Modal, PageBody, PageContent, SearchIcon, TableHeader, TableRow, TD, TopBar } from "@/components/vertra";
import { Client, ClientCreate, ClientUpdate, createClient, deleteClient, fetchClients, updateClient } from "@/lib/api";

const ORGANIZATION_ID = process.env.NEXT_PUBLIC_ORGANIZATION_ID ?? "";

const EMPTY_FORM: ClientCreate = { organization_id: ORGANIZATION_ID, name: "", cnpj: "", email: "", phone: "", city: "", state: "" };

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientCreate>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try { setClients(await fetchClients(ORGANIZATION_ID)); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Erro ao carregar clientes"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const f = (k: keyof ClientCreate) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setFormError(null); setShowModal(true); };
  const openEdit = (c: Client) => {
    setEditing(c);
    setForm({ organization_id: c.organization_id, name: c.name, cnpj: c.cnpj ?? "", email: c.email ?? "", phone: c.phone ?? "", city: c.city ?? "", state: c.state ?? "" });
    setFormError(null); setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError("Nome é obrigatório"); return; }
    setSaving(true); setFormError(null);
    try {
      if (editing) {
        const u: ClientUpdate = { name: form.name, cnpj: form.cnpj || undefined, email: form.email || undefined, phone: form.phone || undefined, city: form.city || undefined, state: form.state || undefined };
        await updateClient(editing.id, u);
      } else {
        await createClient({ ...form, cnpj: form.cnpj || undefined, email: form.email || undefined, phone: form.phone || undefined, city: form.city || undefined, state: form.state || undefined });
      }
      closeModal(); await load();
    } catch (e: unknown) { setFormError(e instanceof Error ? e.message : "Erro ao salvar"); }
    finally { setSaving(false); }
  };

  const handleToggle = async (c: Client) => {
    try { await updateClient(c.id, { active: !c.active }); await load(); }
    catch { alert("Erro ao atualizar status"); }
  };

  const handleDelete = async (c: Client) => {
    if (!confirm(`Excluir cliente "${c.name}"?`)) return;
    try { await deleteClient(c.id); await load(); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Erro ao excluir"); }
  };

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || (c.cnpj ?? "").includes(search)
  );
  const activeCount = clients.filter((c) => c.active).length;

  return (
    <PageBody>
      <TopBar
        title="Clientes"
        subtitle={`${activeCount} ativos · ${clients.length} total`}
        actions={<BtnPrimary onClick={openCreate}>+ Novo Cliente</BtnPrimary>}
      />
      <PageContent>
        {error && (
          <div style={{ background: "#FFF1F1", border: "1px solid #FFCACA", borderRadius: 8, padding: "10px 14px", color: "#C0392B", fontFamily: "Outfit, sans-serif", fontSize: 13 }}>{error}</div>
        )}

        {/* Search */}
        <div style={{ position: "relative", maxWidth: 340 }}>
          <input
            value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome ou CNPJ…"
            style={{ width: "100%", border: "1.5px solid #D4E5EC", borderRadius: 8, padding: "9px 12px 9px 36px", fontFamily: "Outfit, sans-serif", fontSize: 14, color: C.navy, outline: "none", background: "#fff", boxSizing: "border-box" } as React.CSSProperties}
          />
          <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}><SearchIcon /></div>
        </div>

        <Card>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <TableHeader cols={["Nome / Empresa", "CNPJ", "Cidade / UF", "E-mail", "Status", "Ações"]} />
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 48, textAlign: "center", color: C.textFaint, fontFamily: "Outfit, sans-serif", fontSize: 14 }}>Carregando…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 48, textAlign: "center", color: C.textFaint, fontFamily: "Outfit, sans-serif", fontSize: 14 }}>Nenhum cliente encontrado.</td></tr>
              ) : filtered.map((c) => (
                <TableRow key={c.id}>
                  <TD primary>{c.name}</TD>
                  <TD mono>{c.cnpj || "—"}</TD>
                  <TD>{c.city && c.state ? `${c.city} / ${c.state}` : "—"}</TD>
                  <TD>{c.email || "—"}</TD>
                  <TD><Badge status={c.active ? "active" : "inactive"} /></TD>
                  <td style={{ padding: "13px 18px" }}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <span onClick={() => openEdit(c)} style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, fontWeight: 600, color: C.teal, cursor: "pointer" }}>Editar</span>
                      <span onClick={() => handleToggle(c)} style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, fontWeight: 600, color: "#C09020", cursor: "pointer" }}>{c.active ? "Desativar" : "Ativar"}</span>
                      <span onClick={() => handleDelete(c)} style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, fontWeight: 600, color: "#D0484A", cursor: "pointer" }}>Excluir</span>
                    </div>
                  </td>
                </TableRow>
              ))}
            </tbody>
          </table>
        </Card>
      </PageContent>

      {showModal && (
        <Modal title={editing ? "Editar Cliente" : "Novo Cliente"} onClose={closeModal}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <FormError msg={formError} />
            <FieldInput label="Nome / Razão Social" value={form.name} onChange={f("name")} required placeholder="Ex: Empresa Ltda" />
            <FieldInput label="CNPJ" value={form.cnpj ?? ""} onChange={f("cnpj")} placeholder="00.000.000/0001-00" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FieldInput label="E-mail" value={form.email ?? ""} onChange={f("email")} type="email" />
              <FieldInput label="Telefone" value={form.phone ?? ""} onChange={f("phone")} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 12 }}>
              <FieldInput label="Cidade" value={form.city ?? ""} onChange={f("city")} />
              <FieldInput label="UF" value={form.state ?? ""} onChange={(v) => f("state")(v.toUpperCase().slice(0, 2))} placeholder="SP" />
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
