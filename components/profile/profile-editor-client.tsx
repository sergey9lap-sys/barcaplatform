"use client";

import { Check, LoaderCircle, Pencil } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

export function ProfileEditorClient({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({ display_name: profile.display_name ?? "", favorite_player: profile.favorite_player ?? "Педри", favorite_era: profile.favorite_era ?? "Гвардиола 2008–12", favorite_coach: profile.favorite_coach ?? "Ханси Флик", favorite_formation: profile.favorite_formation ?? "4-3-3", short_bio: profile.short_bio ?? "" });
  const router = useRouter();

  async function save() {
    if (!form.display_name.trim()) { setMessage("Укажите имя в приложении."); return; }
    const supabase = createSupabaseClient(); if (!supabase) return;
    setBusy(true); setMessage(null);
    const { error } = await supabase.from("profiles").update({ ...form, display_name: form.display_name.trim(), short_bio: form.short_bio.trim() }).eq("id", profile.id);
    setBusy(false);
    if (error) { setMessage("Не удалось сохранить профиль. Проверьте миграцию 0021 и попробуйте снова."); return; }
    setMessage("Профиль обновлён."); setOpen(false); router.refresh();
  }

  if (!open) return <Button variant="secondary" onClick={() => setOpen(true)}><Pencil className="mr-2 h-4 w-4" />Редактировать профиль</Button>;
  return <div className="space-y-4 rounded-2xl border border-white/10 bg-black/15 p-4">
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Имя" value={form.display_name} onChange={(value) => setForm({ ...form, display_name: value })} maxLength={40} /><Field label="Любимый игрок" value={form.favorite_player} onChange={(value) => setForm({ ...form, favorite_player: value })} maxLength={60} /><Field label="Любимая эпоха" value={form.favorite_era} onChange={(value) => setForm({ ...form, favorite_era: value })} maxLength={80} /><Field label="Любимый тренер" value={form.favorite_coach} onChange={(value) => setForm({ ...form, favorite_coach: value })} maxLength={60} /><Field label="Любимая схема" value={form.favorite_formation} onChange={(value) => setForm({ ...form, favorite_formation: value })} maxLength={20} /></div>
    <div className="space-y-2"><Label htmlFor="profile-bio">Коротко о вашем футбольном взгляде</Label><textarea id="profile-bio" className="form-control min-h-24 resize-y" maxLength={240} value={form.short_bio} onChange={(event) => setForm({ ...form, short_bio: event.target.value })} /></div>
    {message ? <p className="text-sm text-amber-100" role="status">{message}</p> : null}
    <div className="flex flex-wrap gap-2"><Button onClick={() => void save()} disabled={busy}>{busy ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}Сохранить</Button><Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>Отмена</Button></div>
  </div>;
}

function Field({ label, value, onChange, maxLength }: { label: string; value: string; onChange: (value: string) => void; maxLength: number }) {
  const id = `profile-${label.toLowerCase().replaceAll(" ", "-")}`;
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Input id={id} value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} /></div>;
}
