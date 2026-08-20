"use client";

import { Archive, Check, ClipboardList, CopyPlus, Send, ShieldCheck, WandSparkles, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CHALLENGE_LABELS, CHALLENGE_TEMPLATES } from "@/lib/challenges/engine";
import { createSupabaseClient } from "@/lib/supabase/client";
import type { ChallengeRecord, ChallengeStatus, Match, PlayerCatalogItem } from "@/types/database";

interface ChallengeAdminPanelProps {
  challenges: ChallengeRecord[];
  matches: Match[];
  players: PlayerCatalogItem[];
}

const emptyForm = {
  id: "",
  template_key: "daily-opinion",
  title: "",
  description: "",
  day_mode: "ordinary" as ChallengeRecord["day_mode"],
  phase: "daily" as ChallengeRecord["phase"],
  cadence: "daily" as ChallengeRecord["cadence"],
  response_type: "single_choice" as ChallengeRecord["response_type"],
  verification_type: "participation" as ChallengeRecord["verification_type"],
  skill_key: "",
  match_id: "",
  optionsText: "",
  correctAnswer: "",
  linked_route: "",
  reward_coins: "15",
  reward_xp: "0",
  target_count: "1",
  opens_at: "",
  closes_at: "",
  status: "draft" as ChallengeStatus,
  featured: false,
};

type ChallengeFormState = typeof emptyForm;

export function ChallengeAdminPanel({ challenges, matches, players }: ChallengeAdminPanelProps) {
  const router = useRouter();
  const [form, setForm] = useState<ChallengeFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Array<{ id: string; answer: unknown; submitted_at: string; user_id: string; challenges?: { title?: string } | null }>>([]);

  const sortedChallenges = useMemo(() => [...challenges].sort((a, b) => Number(b.featured) - Number(a.featured) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), [challenges]);

  useEffect(() => {
    const supabase = createSupabaseClient();
    if (!supabase) return;
    void supabase.from("challenge_submissions").select("id,answer,submitted_at,user_id,challenges(title)").eq("status", "pending").order("submitted_at", { ascending: true }).then(({ data }) => {
      if (data) setPending(data as typeof pending);
    });
  }, []);

  function applyTemplate(key: string) {
    const template = CHALLENGE_TEMPLATES.find((item) => item.key === key);
    if (!template) return;
    setForm((current) => ({
      ...emptyForm,
      template_key: template.key,
      title: template.title,
      description: template.description,
      day_mode: template.dayMode,
      phase: template.phase,
      cadence: template.cadence,
      response_type: template.responseType,
      verification_type: template.verificationType,
      skill_key: template.skillKey ?? "",
      optionsText: template.options.join("\n"),
      linked_route: template.linkedRoute ?? "",
      reward_coins: String(template.rewardCoins),
      reward_xp: String(template.rewardXp),
      target_count: template.cadence === "weekly" ? "5" : template.cadence === "monthly" ? "20" : "1",
      status: current.status,
    }));
  }

  async function saveChallenge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    const supabase = createSupabaseClient();
    if (!supabase) {
      setError("Нет подключения к Supabase.");
      setSaving(false);
      return;
    }
    if (!form.title.trim()) {
      setError("Укажите название челленджа.");
      setSaving(false);
      return;
    }

    const options = form.optionsText.split("\n").map((label) => label.trim()).filter(Boolean).map((label, index) => ({ id: `option-${index + 1}`, label }));
    const correctOption = options.find((option) => option.id === form.correctAnswer || option.label === form.correctAnswer);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      template_key: form.template_key || "custom",
      day_mode: form.day_mode,
      phase: form.phase,
      cadence: form.cadence,
      response_type: form.response_type,
      verification_type: form.verification_type,
      skill_key: form.skill_key || null,
      match_id: form.match_id || null,
      options,
      correct_answer: form.verification_type === "correct_answer" && form.correctAnswer ? { value: correctOption?.id ?? form.correctAnswer } : null,
      linked_route: form.linked_route || null,
      reward_coins: Math.max(0, Number(form.reward_coins) || 0),
      reward_xp: Math.max(0, Number(form.reward_xp) || 0),
      target_count: Math.max(1, Number(form.target_count) || 1),
      opens_at: form.opens_at ? new Date(form.opens_at).toISOString() : null,
      closes_at: form.closes_at ? new Date(form.closes_at).toISOString() : null,
      status: form.status,
      featured: form.featured,
    };

    const operation = form.id && !form.id.startsWith("mock-") ? supabase.from("challenges").update(payload).eq("id", form.id) : supabase.from("challenges").insert(payload);
    const { error: saveError } = await operation;
    if (saveError) {
      setError(saveError.message.includes("relation") ? "Сначала примените миграцию 0019_challenge_engine.sql в Supabase." : saveError.message);
      setSaving(false);
      return;
    }
    setMessage(form.status === "published" ? "Челлендж опубликован на платформе." : "Черновик челленджа сохранён.");
    setForm(emptyForm);
    setSaving(false);
    router.refresh();
  }

  async function changeStatus(id: string, status: ChallengeStatus) {
    if (id.startsWith("mock-")) {
      setError("Это локальный демонстрационный челлендж. Создайте собственную копию из шаблона.");
      return;
    }
    const supabase = createSupabaseClient();
    if (!supabase) return;
    const { error: updateError } = await supabase.from("challenges").update({ status }).eq("id", id);
    if (updateError) setError(updateError.message);
    else {
      setMessage(status === "published" ? "Челлендж опубликован." : "Челлендж перенесён в архив.");
      router.refresh();
    }
  }

  async function reviewSubmission(id: string, approve: boolean) {
    const supabase = createSupabaseClient();
    if (!supabase) return;
    const { error: reviewError } = await supabase.rpc("resolve_challenge_submission", { target_submission: id, approve });
    if (reviewError) setError(reviewError.message);
    else {
      setPending((current) => current.filter((item) => item.id !== id));
      setMessage(approve ? "Ответ подтверждён, опыт начислен." : "Ответ отклонён.");
    }
  }

  function editChallenge(challenge: ChallengeRecord) {
    const correct = typeof challenge.correct_answer === "object" && challenge.correct_answer ? (challenge.correct_answer as { value?: string }).value ?? "" : typeof challenge.correct_answer === "string" ? challenge.correct_answer : "";
    setForm({
      id: challenge.id,
      template_key: challenge.template_key,
      title: challenge.title,
      description: challenge.description,
      day_mode: challenge.day_mode,
      phase: challenge.phase,
      cadence: challenge.cadence,
      response_type: challenge.response_type,
      verification_type: challenge.verification_type,
      skill_key: challenge.skill_key ?? "",
      match_id: challenge.match_id ?? "",
      optionsText: challenge.options.map((option) => option.label).join("\n"),
      correctAnswer: correct,
      linked_route: challenge.linked_route ?? "",
      reward_coins: String(challenge.reward_coins),
      reward_xp: String(challenge.reward_xp),
      target_count: String(challenge.target_count),
      opens_at: toLocalInput(challenge.opens_at),
      closes_at: toLocalInput(challenge.closes_at),
      status: challenge.status,
      featured: challenge.featured,
    });
    document.getElementById("challenge-builder")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <Card id="challenge-builder" className="barca-panel border-accent/15">
      <CardContent className="space-y-6 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><div className="flex items-center gap-2"><WandSparkles className="h-5 w-5 text-amber-300" /><h3 className="text-2xl font-semibold">Конструктор челленджей</h3></div><p className="ui-note mt-2 max-w-3xl text-sm">Выберите шаблон, измените вопрос и награду — публикация займёт меньше минуты.</p></div>
          <Badge variant="accent">{challenges.filter((item) => item.status === "published").length} опубликовано</Badge>
        </div>

        {error ? <p className="ui-status-error text-sm">{error}</p> : null}
        {message ? <p className="ui-status-success text-sm">{message}</p> : null}

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {CHALLENGE_TEMPLATES.map((template) => <button key={template.key} type="button" onClick={() => applyTemplate(template.key)} className={form.template_key === template.key ? "spotlight-strip min-h-24 text-left" : "soft-panel min-h-24 p-4 text-left"}><p className="ui-value text-sm font-semibold">{template.title}</p><p className="ui-note mt-2 text-xs">{CHALLENGE_LABELS.dayMode[template.dayMode]} · {CHALLENGE_LABELS.response[template.responseType]}</p></button>)}
        </div>

        <form onSubmit={saveChallenge} className="space-y-4 rounded-2xl bg-black/15 p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-2">
            <input className="form-control" placeholder="Название челленджа" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            <select className="form-control" value={form.template_key} onChange={(event) => applyTemplate(event.target.value)}>{CHALLENGE_TEMPLATES.map((template) => <option key={template.key} value={template.key}>{template.title}</option>)}<option value="custom">Свой челлендж</option></select>
          </div>
          <textarea className="form-control min-h-24 resize-y" placeholder="Короткое и понятное описание" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Field label="Режим дня"><select className="form-control" value={form.day_mode} onChange={(event) => setForm((current) => ({ ...current, day_mode: event.target.value as ChallengeRecord["day_mode"] }))}>{Object.entries(CHALLENGE_LABELS.dayMode).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
            <Field label="Этап"><select className="form-control" value={form.phase} onChange={(event) => setForm((current) => ({ ...current, phase: event.target.value as ChallengeRecord["phase"] }))}>{Object.entries(CHALLENGE_LABELS.phase).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
            <Field label="Период"><select className="form-control" value={form.cadence} onChange={(event) => setForm((current) => ({ ...current, cadence: event.target.value as ChallengeRecord["cadence"] }))}>{Object.entries(CHALLENGE_LABELS.cadence).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
            <Field label="Формат ответа"><select className="form-control" value={form.response_type} onChange={(event) => setForm((current) => ({ ...current, response_type: event.target.value as ChallengeRecord["response_type"] }))}>{Object.entries(CHALLENGE_LABELS.response).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <Field label="Способ проверки"><select className="form-control" value={form.verification_type} onChange={(event) => setForm((current) => ({ ...current, verification_type: event.target.value as ChallengeRecord["verification_type"] }))}>{Object.entries(CHALLENGE_LABELS.verification).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
            <Field label="Навык для опыта"><select className="form-control" value={form.skill_key} onChange={(event) => setForm((current) => ({ ...current, skill_key: event.target.value }))}><option value="">Опыт не начисляется</option><option value="results">Результаты</option><option value="score">Точный счёт</option><option value="tactics">Тактика</option><option value="transfers">Трансферы</option><option value="fantasy">Fantasy</option><option value="knowledge">Знания</option><option value="analyst">Аналитика</option><option value="scout">Скаутинг</option></select></Field>
            <Field label="Матч"><select className="form-control" value={form.match_id} onChange={(event) => setForm((current) => ({ ...current, match_id: event.target.value }))}><option value="">Любой ближайший матч</option>{matches.map((match) => <option key={match.id} value={match.id}>{match.home_team} — {match.away_team} · {new Date(match.kickoff_at).toLocaleDateString("ru-RU")}</option>)}</select></Field>
          </div>

          {(form.response_type === "single_choice" || form.response_type === "multiple_choice") ? <Field label="Варианты ответа — каждый с новой строки"><textarea className="form-control min-h-32 resize-y" value={form.optionsText} onChange={(event) => setForm((current) => ({ ...current, optionsText: event.target.value }))} placeholder={players.slice(0, 4).map((player) => player.display_name).join("\n")} /></Field> : null}
          {form.verification_type === "correct_answer" ? <Field label="Правильный вариант"><select className="form-control" value={form.correctAnswer} onChange={(event) => setForm((current) => ({ ...current, correctAnswer: event.target.value }))}><option value="">Выберите ответ</option>{form.optionsText.split("\n").map((label) => label.trim()).filter(Boolean).map((label, index) => <option key={label} value={`option-${index + 1}`}>{label}</option>)}</select></Field> : null}
          {form.response_type === "action" ? <Field label="Ссылка на раздел"><input className="form-control" value={form.linked_route} onChange={(event) => setForm((current) => ({ ...current, linked_route: event.target.value }))} placeholder="/matches/{matchId}" /></Field> : null}

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Монеты"><input className="form-control" inputMode="numeric" value={form.reward_coins} onChange={(event) => setForm((current) => ({ ...current, reward_coins: event.target.value }))} /></Field>
            <Field label="Опыт"><input className="form-control" inputMode="numeric" value={form.reward_xp} onChange={(event) => setForm((current) => ({ ...current, reward_xp: event.target.value }))} /></Field>
            <Field label="Цель для серии"><input className="form-control" inputMode="numeric" value={form.target_count} onChange={(event) => setForm((current) => ({ ...current, target_count: event.target.value }))} /></Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Открыть"><input className="form-control" type="datetime-local" value={form.opens_at} onChange={(event) => setForm((current) => ({ ...current, opens_at: event.target.value }))} /></Field>
            <Field label="Закрыть"><input className="form-control" type="datetime-local" value={form.closes_at} onChange={(event) => setForm((current) => ({ ...current, closes_at: event.target.value }))} /></Field>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select className="form-control max-w-48" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ChallengeStatus }))}><option value="draft">Черновик</option><option value="published">Опубликовать</option><option value="archived">Архив</option></select>
            <label className="flex min-h-12 items-center gap-2 rounded-xl bg-white/[0.04] px-4 text-sm text-blue-100/80"><input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} />Показывать первым</label>
            <Button className="min-w-52 flex-1" disabled={saving}>{saving ? "Сохраняем..." : form.status === "published" ? <><Send className="mr-2 h-4 w-4" />Опубликовать челлендж</> : <><CopyPlus className="mr-2 h-4 w-4" />Сохранить черновик</>}</Button>
            {form.id ? <Button type="button" variant="ghost" onClick={() => setForm(emptyForm)}>Отменить редактирование</Button> : null}
          </div>
        </form>

        <div className="space-y-3">
          <div className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-blue-300" /><h4 className="text-lg font-semibold">Опубликованные и сохранённые</h4></div>
          <div className="grid gap-2 lg:grid-cols-2">
            {sortedChallenges.map((challenge) => <div key={challenge.id} className="soft-panel flex items-start justify-between gap-3 p-4"><button type="button" onClick={() => editChallenge(challenge)} className="min-w-0 flex-1 text-left"><div className="flex flex-wrap gap-2"><Badge variant={challenge.status === "published" ? "accent" : "primary"}>{challenge.status === "published" ? "Опубликован" : challenge.status === "draft" ? "Черновик" : "Архив"}</Badge><Badge variant="accent">{CHALLENGE_LABELS.dayMode[challenge.day_mode]}</Badge></div><p className="ui-value mt-3 font-semibold">{challenge.title}</p><p className="ui-note mt-1 text-xs">{CHALLENGE_LABELS.response[challenge.response_type]} · +{challenge.reward_coins} монет</p></button><div className="flex gap-1">{challenge.status !== "published" ? <button type="button" title="Опубликовать" onClick={() => void changeStatus(challenge.id, "published")} className="rounded-xl p-2 text-emerald-200 hover:bg-white/[0.06]"><Check className="h-4 w-4" /></button> : null}{challenge.status !== "archived" ? <button type="button" title="В архив" onClick={() => void changeStatus(challenge.id, "archived")} className="rounded-xl p-2 text-blue-100/65 hover:bg-white/[0.06]"><Archive className="h-4 w-4" /></button> : null}</div></div>)}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-rose-300" /><h4 className="text-lg font-semibold">Ответы на проверке</h4></div>
          {pending.length ? pending.map((submission) => <div key={submission.id} className="soft-panel flex flex-wrap items-center justify-between gap-4 p-4"><div><p className="ui-value font-semibold">{submission.challenges?.title ?? "Челлендж"}</p><p className="ui-note mt-1 text-xs">{new Date(submission.submitted_at).toLocaleString("ru-RU")} · пользователь {submission.user_id.slice(0, 8)}</p><p className="mt-2 max-w-2xl break-words text-xs text-blue-100/70">{JSON.stringify(submission.answer)}</p></div><div className="flex gap-2"><Button type="button" size="sm" variant="secondary" onClick={() => void reviewSubmission(submission.id, true)}><Check className="mr-1 h-4 w-4" />Подтвердить</Button><Button type="button" size="sm" variant="ghost" onClick={() => void reviewSubmission(submission.id, false)}><X className="mr-1 h-4 w-4" />Отклонить</Button></div></div>) : <p className="ui-note text-sm">Сейчас нет ответов, ожидающих ручной проверки.</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="space-y-2"><span className="meta-label block text-xs">{label}</span>{children}</label>;
}

function toLocalInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}
