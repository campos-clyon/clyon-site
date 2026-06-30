"use client";

import { useState } from "react";
import Image from "next/image";
import { LockKeyhole, CheckCircle2, AlertCircle, Camera } from "lucide-react";
import type { UserProfile } from "./types";

interface Props {
  user: UserProfile;
  googleAvatar: string | null;
  onUpdate: (updated: Partial<UserProfile>) => void;
}

function Field({
  label,
  id,
  value,
  onChange,
  type = "text",
  placeholder,
  readOnly,
  hint,
}: {
  label: string;
  id: string;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-slate-600 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`h-11 w-full rounded-xl border px-4 text-sm text-slate-800 outline-none transition ${
            readOnly
              ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400"
              : "border-slate-200 bg-white focus:border-[#00B4D8] focus:ring-2 focus:ring-[#00B4D8]/10"
          }`}
        />
        {readOnly && (
          <LockKeyhole className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300" />
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export default function DadosPessoais({ user, googleAvatar, onUpdate }: Props) {
  const [name,          setName]          = useState(user.name ?? "");
  const [phone,         setPhone]         = useState(user.phone ?? "");
  const [addressLine,   setAddressLine]   = useState(user.addressLine ?? "");
  const [addressNumber, setAddressNumber] = useState(user.addressNumber ?? "");
  const [postalCode,    setPostalCode]    = useState(user.postalCode ?? "");
  const [addressCity,   setAddressCity]   = useState(user.addressCity ?? "");
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  const avatarSrc = user.avatarUrl ?? googleAvatar;
  const inicial   = (name || user.email).charAt(0).toUpperCase();

  const handleSave = async () => {
    setSaving(true); setSuccess(false); setError("");
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone: phone || null, addressLine: addressLine || null,
          addressNumber: addressNumber || null, postalCode: postalCode || null,
          addressCity: addressCity || null }),
      });
      if (!res.ok) throw new Error("Erro ao guardar");
      setSuccess(true);
      onUpdate({ name, phone: phone || null, addressLine: addressLine || null,
        addressNumber: addressNumber || null, postalCode: postalCode || null,
        addressCity: addressCity || null });
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Não foi possível guardar as alterações. Tenta novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Dados pessoais</h2>
        <p className="mt-0.5 text-sm text-slate-500">Informações da tua conta CLYON.</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        {avatarSrc ? (
          <Image
            src={avatarSrc}
            alt={name || user.email}
            width={64}
            height={64}
            className="h-16 w-16 rounded-full object-cover ring-2 ring-[#00B4D8]/20"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00B4D8]/10 text-2xl font-bold text-[#0077B6]">
            {inicial}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-slate-800">{name || user.email}</p>
          <p className="mt-0.5 text-xs text-slate-400">Foto sincronizada com a tua conta Google</p>
        </div>
        <div className="ml-auto">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
            onClick={() => {/* upload Blob — futuro */ }}
          >
            <Camera className="h-3.5 w-3.5" />
            Alterar foto
          </button>
        </div>
      </div>

      {/* Formulário */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Nome completo" id="name" value={name} onChange={setName} placeholder="O teu nome" />
          </div>
          <div className="sm:col-span-2">
            <Field
              label="Email"
              id="email"
              value={user.email}
              readOnly
              hint="Gerido pela tua conta Google — não pode ser alterado aqui."
            />
          </div>
          <div className="sm:col-span-2">
            <Field
              label="Telefone"
              id="phone"
              type="tel"
              value={phone}
              onChange={setPhone}
              placeholder="+351 9xx xxx xxx"
            />
          </div>
          <div>
            <Field label="Rua / Avenida" id="addressLine" value={addressLine} onChange={setAddressLine} placeholder="Rua de exemplo" />
          </div>
          <div>
            <Field label="Número / Andar" id="addressNumber" value={addressNumber} onChange={setAddressNumber} placeholder="12, 2.º Esq." />
          </div>
          <div>
            <Field label="Código postal" id="postalCode" value={postalCode} onChange={setPostalCode} placeholder="1000-001" />
          </div>
          <div>
            <Field label="Cidade" id="addressCity" value={addressCity} onChange={setAddressCity} placeholder="Lisboa" />
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Dados guardados com sucesso.
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="rounded-xl bg-[#0077B6] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#005f96] disabled:opacity-60"
          >
            {saving ? "A guardar..." : "Guardar alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
