"use client";

import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { BtnPrimary, BtnSecondary, C, PageBody, TopBar, UploadIcon } from "@/components/vertra";
import { bulkImportShipments } from "@/lib/api";

// Column mapping: spreadsheet header → backend field
const COLUMN_MAP: Record<string, string> = {
  "nf": "nf_number", "número nf": "nf_number", "numero nf": "nf_number", "nf_number": "nf_number",
  "data nf": "nf_date", "data emissão": "nf_date", "data emissao": "nf_date", "nf_date": "nf_date",
  "valor nf": "nf_value", "nf_value": "nf_value",
  "remetente": "sender_name", "sender_name": "sender_name",
  "cidade remetente": "sender_city", "sender_city": "sender_city",
  "uf remetente": "sender_state", "sender_state": "sender_state",
  "destinatário": "recipient_name", "destinatario": "recipient_name", "recipient_name": "recipient_name",
  "endereço destinatário": "recipient_address", "endereco destinatario": "recipient_address", "endereço": "recipient_address", "recipient_address": "recipient_address",
  "cidade destinatário": "recipient_city", "cidade destinatario": "recipient_city", "cidade": "recipient_city", "recipient_city": "recipient_city",
  "uf destinatário": "recipient_state", "uf destinatario": "recipient_state", "uf": "recipient_state", "recipient_state": "recipient_state",
  "cep": "recipient_zipcode", "recipient_zipcode": "recipient_zipcode",
  "peso (kg)": "weight_kg", "peso kg": "weight_kg", "peso": "weight_kg", "weight_kg": "weight_kg",
  "volume (m³)": "volume_m3", "volume m3": "volume_m3", "volume": "volume_m3", "volume_m3": "volume_m3",
  "valor frete": "freight_value", "frete": "freight_value", "freight_value": "freight_value",
  "modalidade": "freight_modality", "freight_modality": "freight_modality",
  "transportadora": "carrier_name", "carrier_name": "carrier_name",
  "prazo (dias)": "delivery_deadline", "prazo dias": "delivery_deadline", "prazo": "delivery_deadline", "delivery_deadline": "delivery_deadline",
  "data entrega": "delivery_date", "delivery_date": "delivery_date",
  "latitude": "latitude", "longitude": "longitude",
};

const TEMPLATE_HEADERS = ["Número NF","Data NF","Valor NF","Remetente","Cidade Remetente","UF Remetente","Destinatário","Endereço Destinatário","Cidade Destinatário","UF Destinatário","CEP","Peso (kg)","Volume (m³)","Valor Frete","Modalidade","Transportadora","Prazo (dias)","Data Entrega"];

const MODALITY_MAP: Record<string, string> = { "lotação":"lotacao","lotacao":"lotacao","fracionado peso":"fracionado_peso","fracionado_peso":"fracionado_peso","fracionado valor":"fracionado_valor","fracionado_valor":"fracionado_valor" };

function normalizeKey(h: string) { return h.trim().toLowerCase(); }
function parseDate(val: unknown): string | undefined {
  if (!val) return undefined;
  if (typeof val === "number") { const d = XLSX.SSF.parse_date_code(val); if (!d) return undefined; return `${d.y}-${String(d.m).padStart(2,"0")}-${String(d.d).padStart(2,"0")}`; }
  const s = String(val).trim();
  const dmY = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmY) return `${dmY[3]}-${dmY[2].padStart(2,"0")}-${dmY[1].padStart(2,"0")}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return s || undefined;
}
function parseNumber(val: unknown): number | undefined {
  if (val === null || val === undefined || val === "") return undefined;
  const n = Number(String(val).replace(",", "."));
  return isNaN(n) ? undefined : n;
}
function parseRow(headers: string[], raw: Record<string, unknown>) {
  const record: Record<string, unknown> = {};
  for (const h of headers) {
    const field = COLUMN_MAP[normalizeKey(h)];
    if (!field) continue;
    const val = raw[h];
    if (["nf_date","delivery_date"].includes(field)) record[field] = parseDate(val);
    else if (["nf_value","weight_kg","volume_m3","freight_value","latitude","longitude"].includes(field)) record[field] = parseNumber(val);
    else if (field === "delivery_deadline") { const n = parseNumber(val); record[field] = n !== undefined ? Math.round(n) : undefined; }
    else if (field === "freight_modality") { const s = String(val ?? "").trim().toLowerCase(); record[field] = MODALITY_MAP[s] ?? (val ? String(val).trim() : undefined); }
    else record[field] = val !== undefined && val !== null && val !== "" ? String(val).trim() : undefined;
  }
  return record;
}
function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "NFs");
  XLSX.writeFile(wb, "template_nfs.xlsx");
}

type Step = "upload" | "preview" | "result";

const PREVIEW_COLS = ["nf_number","nf_date","nf_value","sender_name","recipient_city","recipient_state","weight_kg","freight_value","carrier_name"];
const COL_LABELS: Record<string, string> = { nf_number:"NF", nf_date:"Data", nf_value:"Valor NF (R$)", sender_name:"Remetente", recipient_city:"Cidade Dest.", recipient_state:"UF", weight_kg:"Peso (kg)", freight_value:"Frete (R$)", carrier_name:"Transportadora" };

export default function CargaPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ inserted: number; failed: number; total: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    setParseError(null); setResult(null); setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: "array", cellDates: false });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, { raw: true, defval: "" });
        if (json.length === 0) { setParseError("Arquivo vazio ou sem dados reconhecíveis."); return; }
        const cols = Object.keys(json[0]);
        if (!cols.some((h) => COLUMN_MAP[normalizeKey(h)])) { setParseError("Nenhuma coluna reconhecida. Use os cabeçalhos do template."); return; }
        setHeaders(cols); setRows(json); setStep("preview");
      } catch { setParseError("Erro ao ler o arquivo. Verifique se é um .xlsx ou .csv válido."); }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    setImporting(true); setParseError(null);
    try {
      const records = rows.map((r) => parseRow(headers, r));
      const res = await bulkImportShipments(projectId, records);
      setResult(res); setStep("result");
    } catch (e: unknown) { setParseError(e instanceof Error ? e.message : "Erro ao importar"); }
    finally { setImporting(false); }
  };

  const reset = () => { setStep("upload"); setRows([]); setHeaders([]); setFileName(null); setParseError(null); setResult(null); if (inputRef.current) inputRef.current.value = ""; };

  const previewCols = headers.filter((h) => COLUMN_MAP[normalizeKey(h)]);
  const steps: [string, string, Step][] = [["1","Selecionar arquivo","upload"],["2","Revisar dados","preview"],["3","Conclusão","result"]];

  return (
    <PageBody>
      <TopBar
        title="Carga de NFs"
        subtitle={fileName ? `Projeto · ${fileName}` : "Importar planilha de notas fiscais"}
        actions={<BtnSecondary onClick={() => router.back()} style={{ fontSize: 13, padding: "7px 16px" }}>← Voltar</BtnSecondary>}
      />

      <div style={{ padding: "28px 32px" }}>
        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28, maxWidth: 560 }}>
          {steps.map(([n, label, s], i) => {
            const done = (step === "preview" && i === 0) || (step === "result" && i <= 1);
            const active = step === s;
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : undefined }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: done ? C.teal : active ? C.navy : "#E0ECED", color: (done || active) ? "#fff" : "#9BBAC4", fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: 14, transition: "background 0.3s" }}>
                    {done ? "✓" : n}
                  </div>
                  <span style={{ fontFamily: "Outfit, sans-serif", fontSize: 11, color: active ? C.navy : "#9BBAC4", fontWeight: active ? 600 : 400, whiteSpace: "nowrap" }}>{label}</span>
                </div>
                {i < 2 && <div style={{ flex: 1, height: 2, background: done ? C.teal : "#D4E5EC", margin: "0 8px", marginBottom: 18, transition: "background 0.3s" }} />}
              </div>
            );
          })}
        </div>

        {/* UPLOAD */}
        {step === "upload" && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
              <span onClick={downloadTemplate} style={{ fontFamily: "Outfit, sans-serif", fontSize: 13, color: C.teal, cursor: "pointer", fontWeight: 600 }}>↓ Baixar template .xlsx</span>
            </div>
            <div
              onClick={() => inputRef.current?.click()}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              style={{ border: `2px dashed ${dragOver ? C.teal : "#B0D4DC"}`, borderRadius: 16, padding: "72px 40px", textAlign: "center", cursor: "pointer", background: dragOver ? "#F0FAF8" : "#fff", transition: "all 0.2s" }}
            >
              <div style={{ marginBottom: 14, display: "flex", justifyContent: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "#EBF7F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <UploadIcon size={26} color={C.teal} />
                </div>
              </div>
              <p style={{ fontFamily: "Outfit, sans-serif", fontWeight: 600, fontSize: 16, color: C.navy, margin: "0 0 6px" }}>Arraste seu arquivo aqui</p>
              <p style={{ fontFamily: "Outfit, sans-serif", fontSize: 13, color: C.textFaint, margin: 0 }}>Suporta <strong>.xlsx</strong> e <strong>.csv</strong> — clique para selecionar</p>
              <input ref={inputRef} type="file" accept=".xlsx,.csv,.xls" className="hidden" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
            {parseError && <div style={{ marginTop: 14, background: "#FFF1F1", border: "1px solid #FFCACA", borderRadius: 8, padding: "10px 14px", color: "#C0392B", fontFamily: "Outfit, sans-serif", fontSize: 13 }}>{parseError}</div>}
          </div>
        )}

        {/* PREVIEW */}
        {step === "preview" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <span style={{ fontFamily: "Outfit, sans-serif", fontWeight: 600, fontSize: 15, color: C.navy }}>{fileName}</span>
                <span style={{ fontFamily: "Outfit, sans-serif", fontSize: 13, color: C.textMuted, marginLeft: 10 }}>{rows.length} linhas encontradas</span>
              </div>
              <span onClick={reset} style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, color: "#9BBAC4", cursor: "pointer" }}>Trocar arquivo</span>
            </div>

            {parseError && <div style={{ marginBottom: 14, background: "#FFF1F1", border: "1px solid #FFCACA", borderRadius: 8, padding: "10px 14px", color: "#C0392B", fontFamily: "Outfit, sans-serif", fontSize: 13 }}>{parseError}</div>}

            <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 6px rgba(13,43,62,0.07)", overflow: "hidden", marginBottom: 20 }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: C.bgHeader }}>
                      <th style={{ padding: "9px 14px", fontFamily: "Outfit, sans-serif", fontWeight: 600, fontSize: 11, color: C.textMuted, textAlign: "left" }}>#</th>
                      {previewCols.filter((h) => PREVIEW_COLS.includes(COLUMN_MAP[normalizeKey(h)])).map((h) => (
                        <th key={h} style={{ padding: "9px 14px", fontFamily: "Outfit, sans-serif", fontWeight: 600, fontSize: 11, color: C.textMuted, textAlign: "left", whiteSpace: "nowrap" }}>
                          {COL_LABELS[COLUMN_MAP[normalizeKey(h)]] ?? h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 50).map((r, i) => (
                      <tr key={i} style={{ borderTop: "1px solid #F0F6F8" }}>
                        <td style={{ padding: "10px 14px", color: "#B0C8D0", fontFamily: "Outfit, sans-serif" }}>{i + 1}</td>
                        {previewCols.filter((h) => PREVIEW_COLS.includes(COLUMN_MAP[normalizeKey(h)])).map((h) => {
                          const field = COLUMN_MAP[normalizeKey(h)];
                          const val = r[h];
                          const display = (field === "nf_value" || field === "freight_value")
                            ? `R$ ${Number(val).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                            : String(val ?? "—");
                          return <td key={h} style={{ padding: "10px 14px", fontFamily: "Outfit, sans-serif", color: C.navy, whiteSpace: "nowrap" }}>{display}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 50 && <p style={{ textAlign: "center", fontSize: 12, color: C.textFaint, padding: "8px 0", fontFamily: "Outfit, sans-serif" }}>Mostrando 50 de {rows.length} linhas</p>}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <BtnSecondary onClick={reset}>Cancelar</BtnSecondary>
              <BtnPrimary onClick={handleImport} disabled={importing}>
                {importing ? "Importando…" : `Importar ${rows.length} registro${rows.length !== 1 ? "s" : ""}`}
              </BtnPrimary>
            </div>
          </div>
        )}

        {/* RESULT */}
        {step === "result" && result && (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
            <div style={{ background: "#fff", borderRadius: 20, padding: "48px 56px", textAlign: "center", boxShadow: "0 4px 24px rgba(13,43,62,0.08)", maxWidth: 420 }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#E6F5F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="16" fill="#4A9B8E" opacity="0.15" />
                  <path d="M9 16l5 5 9-9" stroke="#2B8A7A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: 20, color: C.navy, margin: "0 0 8px" }}>Importação concluída!</h3>
              <p style={{ fontFamily: "Outfit, sans-serif", fontSize: 14, color: C.textMuted, margin: "0 0 20px" }}>
                <span style={{ color: "#2B8A7A", fontWeight: 700 }}>{result.inserted}</span> registros inseridos
                {result.failed > 0 && <> · <span style={{ color: "#D0484A", fontWeight: 700 }}>{result.failed}</span> com erro</>}
                {" "}de <strong>{result.total}</strong> total
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <BtnSecondary onClick={reset}>Nova carga</BtnSecondary>
                <BtnPrimary onClick={() => router.back()}>Voltar ao projeto</BtnPrimary>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageBody>
  );
}
