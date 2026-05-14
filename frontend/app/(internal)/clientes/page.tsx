"use client";

import { useEffect, useState } from "react";
import {
  Client,
  ClientCreate,
  ClientUpdate,
  createClient,
  deleteClient,
  fetchClients,
  updateClient,
} from "@/lib/api";

const ORGANIZATION_ID = process.env.NEXT_PUBLIC_ORGANIZATION_ID ?? "";

const EMPTY_FORM: ClientCreate = {
  organization_id: ORGANIZATION_ID,
  name: "",
  cnpj: "",
  email: "",
  phone: "",
  city: "",
  state: "",
};

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientCreate>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchClients(ORGANIZATION_ID);
      setClients(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (client: Client) => {
    setEditing(client);
    setForm({
      organization_id: client.organization_id,
      name: client.name,
      cnpj: client.cnpj ?? "",
      email: client.email ?? "",
      phone: client.phone ?? "",
      city: client.city ?? "",
      state: client.state ?? "",
    });
    setFormError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError("Nome é obrigatório");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        const update: ClientUpdate = {
          name: form.name,
          cnpj: form.cnpj || undefined,
          email: form.email || undefined,
          phone: form.phone || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
        };
        await updateClient(editing.id, update);
      } else {
        await createClient({
          ...form,
          cnpj: form.cnpj || undefined,
          email: form.email || undefined,
          phone: form.phone || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
        });
      }
      closeModal();
      await load();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (client: Client) => {
    try {
      await updateClient(client.id, { active: !client.active });
      await load();
    } catch {
      alert("Erro ao atualizar status do cliente");
    }
  };

  const handleDelete = async (client: Client) => {
    if (!confirm(`Excluir cliente "${client.name}"?`)) return;
    try {
      await deleteClient(client.id);
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao excluir");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          + Novo Cliente
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
          Nenhum cliente cadastrado ainda.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">CNPJ</th>
                <th className="px-4 py-3 text-left">Cidade / UF</th>
                <th className="px-4 py-3 text-left">E-mail</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.cnpj ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.city && c.state ? `${c.city} / ${c.state}` : c.city ?? c.state ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.email ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {c.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleActive(c)}
                        className="text-yellow-600 hover:text-yellow-800 text-xs font-medium"
                      >
                        {c.active ? "Desativar" : "Ativar"}
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editing ? "Editar Cliente" : "Novo Cliente"}
            </h2>

            {formError && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {formError}
              </div>
            )}

            <div className="space-y-3">
              <Field
                label="Nome *"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
              />
              <Field
                label="CNPJ"
                value={form.cnpj ?? ""}
                onChange={(v) => setForm({ ...form, cnpj: v })}
                placeholder="00.000.000/0001-00"
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="E-mail"
                  value={form.email ?? ""}
                  onChange={(v) => setForm({ ...form, email: v })}
                  type="email"
                />
                <Field
                  label="Telefone"
                  value={form.phone ?? ""}
                  onChange={(v) => setForm({ ...form, phone: v })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Cidade"
                  value={form.city ?? ""}
                  onChange={(v) => setForm({ ...form, city: v })}
                />
                <Field
                  label="UF"
                  value={form.state ?? ""}
                  onChange={(v) => setForm({ ...form, state: v.toUpperCase().slice(0, 2) })}
                  placeholder="SP"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
