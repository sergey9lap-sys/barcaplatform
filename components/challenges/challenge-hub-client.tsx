"use client";

import Link from "next/link";
import { CalendarCheck, Check, Clock3, Coins, Flame, Gift, LockKeyhole, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CHALLENGE_LABELS, getChallengeDayContext, isChallengeAvailable, resolveChallengeRoute } from "@/lib/challenges/engine";
import { addLocalChallengeCoins, claimLocalDailyBonus, getLocalChallengeSubmissions, getLocalChallengeWallet, saveLocalChallengeSubmission } from "@/lib/challenges/storage";
import { rewardStoredUserCustom } from "@/lib/community/storage";
import { mockCommunityUsers } from "@/lib/mocks/community-users";
import { createSupabaseClient } from "@/lib/supabase/client";
import type { ChallengeRecord, ChallengeSubmissionRecord, ChallengeWalletRecord, Match } from "@/types/database";

interface ChallengeHubClientProps {
  initialChallenges: ChallengeRecord[];
  matches: Match[];
  userId: string | null;
  backendEnabled: boolean;
}

const rewards = [10, 15, 20, 25, 30, 40, 50];

export function ChallengeHubClient({ initialChallenges, matches, userId, backendEnabled }: ChallengeHubClientProps) {
  const [submissions, setSubmissions] = useState<ChallengeSubmissionRecord[]>([]);
  const [wallet, setWallet] = useState<ChallengeWalletRecord>(() => getLocalChallengeWallet());
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const context = useMemo(() => getChallengeDayContext(matches), [matches]);

  useEffect(() => {
    const localSubmissions = getLocalChallengeSubmissions();
    const localWallet = getLocalChallengeWallet();
    setSubmissions(localSubmissions);
    setWallet(localWallet);

    if (!backendEnabled || !userId) return;
    const supabase = createSupabaseClient();
    if (!supabase) return;

    void Promise.all([
      supabase.from("challenge_submissions").select("*").eq("user_id", userId).order("submitted_at", { ascending: false }),
      supabase.from("challenge_wallets").select("*").eq("user_id", userId).maybeSingle(),
    ]).then(([submissionResult, walletResult]) => {
      if (!submissionResult.error && submissionResult.data) setSubmissions(submissionResult.data as ChallengeSubmissionRecord[]);
      if (!walletResult.error && walletResult.data) setWallet(walletResult.data as ChallengeWalletRecord);
    });
  }, [backendEnabled, userId]);

  const dailyChallenges = initialChallenges.filter((challenge) => challenge.cadence === "daily" && isChallengeAvailable(challenge, context)).slice(0, 4);
  const progressChallenges = initialChallenges.filter((challenge) => challenge.cadence !== "daily" && isChallengeAvailable(challenge, context));
  const completedIds = new Set(submissions.map((item) => item.challenge_id));
  const todayKey = new Date().toLocaleDateString("en-CA");
  const dailyClaimed = wallet.last_claimed_date === todayKey;
  const dailyCompletionCount = submissions.filter((item) => item.submitted_at && new Date(item.submitted_at).getTime() >= startOfCurrentWeek()).length;
  const monthlyCompletionCount = submissions.filter((item) => item.submitted_at && new Date(item.submitted_at).getTime() >= startOfCurrentMonth()).length;

  async function claimBonus() {
    setError(null);
    setMessage(null);
    if (backendEnabled && userId) {
      const supabase = createSupabaseClient();
      if (supabase) {
        const { data, error: claimError } = await supabase.rpc("claim_daily_challenge_bonus");
        if (!claimError && data) {
          const result = data as { claimed: boolean; reward: number; coins: number; streak: number; longest_streak?: number; last_claimed_date?: string };
          setWallet((current) => ({ ...current, coins: result.coins, current_streak: result.streak, longest_streak: result.longest_streak ?? current.longest_streak, last_claimed_date: result.last_claimed_date ?? todayKey, updated_at: new Date().toISOString() }));
          setMessage(result.claimed ? `Ежедневный подарок: +${result.reward} монет.` : "Сегодняшний подарок уже получен.");
          return;
        }
      }
    }

    const result = claimLocalDailyBonus();
    setWallet(result.wallet);
    setMessage(result.claimed ? `Ежедневный подарок: +${result.reward} монет.` : "Сегодняшний подарок уже получен.");
  }

  async function submitChallenge(challenge: ChallengeRecord) {
    const answer = normalizeAnswer(challenge, answers[challenge.id], resolveChallengeRoute(challenge, context));
    if (!answer) {
      setError("Сначала заполните ответ на челлендж.");
      return;
    }

    setSavingId(challenge.id);
    setError(null);
    setMessage(null);

    if (backendEnabled && userId && !challenge.id.startsWith("mock-")) {
      const supabase = createSupabaseClient();
      if (supabase) {
        const { data, error: submitError } = await supabase.rpc("submit_challenge_answer", { target_challenge: challenge.id, submitted_answer: answer });
        if (!submitError && data) {
          const result = data as { id: string; status: ChallengeSubmissionRecord["status"]; was_correct: boolean | null; coins_awarded: number; xp_awarded: number };
          const submission: ChallengeSubmissionRecord = { id: result.id, challenge_id: challenge.id, user_id: userId, answer, status: result.status, was_correct: result.was_correct, coins_awarded: result.coins_awarded, xp_awarded: result.xp_awarded, submitted_at: new Date().toISOString(), reviewed_at: result.status === "verified" ? new Date().toISOString() : null };
          setSubmissions((current) => [submission, ...current]);
          setWallet((current) => ({ ...current, coins: current.coins + result.coins_awarded }));
          setMessage(buildCompletionMessage(result.status, result.was_correct, result.coins_awarded, result.xp_awarded));
          setSavingId(null);
          return;
        }
      }
    }

    const correct = isLocallyCorrect(challenge, answer);
    const status: ChallengeSubmissionRecord["status"] = challenge.verification_type === "manual" || challenge.verification_type === "match_result" ? "pending" : "verified";
    const xp = challenge.verification_type === "correct_answer" && correct ? challenge.reward_xp : 0;
    const submission: ChallengeSubmissionRecord = { id: crypto.randomUUID(), challenge_id: challenge.id, user_id: userId ?? "local-user", answer, status, was_correct: challenge.verification_type === "correct_answer" ? correct : null, coins_awarded: challenge.reward_coins, xp_awarded: xp, submitted_at: new Date().toISOString(), reviewed_at: status === "verified" ? new Date().toISOString() : null };
    setSubmissions(saveLocalChallengeSubmission(submission));
    setWallet(addLocalChallengeCoins(challenge.reward_coins));
    if (xp) rewardStoredUserCustom(mockCommunityUsers[0], { xp });
    setMessage(buildCompletionMessage(status, submission.was_correct, challenge.reward_coins, xp));
    setSavingId(null);
  }

  return (
    <div className="space-y-4">
      <section className="hero-panel border-0 p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_280px] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={context.mode === "matchday" ? "primary" : "accent"}>{context.label}</Badge>
              {context.match ? <Badge variant="accent">{context.match.home_team} — {context.match.away_team}</Badge> : null}
            </div>
            <h2 className="mt-3 max-w-3xl text-2xl font-semibold sm:text-3xl">Челленджи, которые меняются вместе с футбольным днём</h2>
            <p className="ui-note mt-2 max-w-2xl text-sm">{context.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-black/20 p-3">
              <div className="flex items-center gap-2 text-amber-200"><Coins className="h-4 w-4" /><span className="text-sm">Монеты</span></div>
              <p className="mt-1.5 text-xl font-semibold tabular-nums">{wallet.coins}</p>
            </div>
            <div className="rounded-xl bg-black/20 p-3">
              <div className="flex items-center gap-2 text-rose-200"><Flame className="h-4 w-4" /><span className="text-sm">Серия</span></div>
              <p className="mt-1.5 text-xl font-semibold tabular-nums">{formatDayCount(wallet.current_streak)}</p>
            </div>
          </div>
        </div>
      </section>

      {error ? <p className="ui-status-error text-sm">{error}</p> : null}
      {message ? <p className="ui-status-success text-sm">{message}</p> : null}

      <DailyBonus wallet={wallet} claimed={dailyClaimed} onClaim={() => void claimBonus()} />

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div><h3 className="text-xl font-semibold">Сегодня</h3><p className="ui-note mt-1 text-sm">Задания обновляются в зависимости от расписания и статуса матча.</p></div>
          <Badge variant="accent">{completedIds.size} выполнено</Badge>
        </div>
        {dailyChallenges.length ? (
          <div className="space-y-3">
            {dailyChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} context={context} submission={submissions.find((item) => item.challenge_id === challenge.id) ?? null} answer={answers[challenge.id]} setAnswer={(value) => setAnswers((current) => ({ ...current, [challenge.id]: value }))} saving={savingId === challenge.id} onSubmit={() => void submitChallenge(challenge)} />
            ))}
          </div>
        ) : (
          <Card className="soft-panel"><CardContent className="p-5"><p className="ui-value font-semibold">Новые задания готовятся</p><p className="ui-note mt-2 text-sm">Администратор сможет опубликовать их из конструктора. Загляните позже.</p></CardContent></Card>
        )}
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        {progressChallenges.map((challenge) => {
          const value = challenge.cadence === "weekly" ? dailyCompletionCount : monthlyCompletionCount;
          return <ProgressChallenge key={challenge.id} challenge={challenge} value={value} completed={completedIds.has(challenge.id)} onClaim={() => void submitChallenge(challenge)} />;
        })}
      </section>

      <ChallengeHistory submissions={submissions} challenges={initialChallenges} />
    </div>
  );
}

function DailyBonus({ wallet, claimed, onClaim }: { wallet: ChallengeWalletRecord; claimed: boolean; onClaim: () => void }) {
  const nextDay = wallet.current_streak >= 7 ? 1 : wallet.current_streak + 1;
  return (
    <Card className="barca-panel border-accent/15">
      <CardContent className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="flex items-center gap-2.5"><Gift className="h-5 w-5 text-amber-300" /><h3 className="text-lg font-semibold">Ежедневный подарок</h3></div>
          <p className="ui-note mt-2 text-sm">За вход начисляются только монеты. Игровой опыт остаётся наградой за проверяемые футбольные действия.</p>
          <div className="mt-3 grid grid-cols-7 gap-1.5">
            {rewards.map((reward, index) => {
              const day = index + 1;
              const active = day === (wallet.current_streak || 1);
              return <div key={reward} className={active ? "rounded-xl bg-amber-300/15 p-2 text-center outline outline-1 outline-amber-300/30" : "rounded-xl bg-white/[0.035] p-2 text-center"}><p className="text-[10px] text-blue-100/65">Д{day}</p><p className="mt-1 text-xs font-semibold text-amber-100">{reward}</p></div>;
            })}
          </div>
        </div>
        <Button onClick={onClaim} disabled={claimed} className="min-w-48">{claimed ? <><Check className="mr-2 h-4 w-4" />Подарок получен</> : `Забрать ${rewards[nextDay - 1]} монет`}</Button>
      </CardContent>
    </Card>
  );
}

function ChallengeCard({ challenge, context, submission, answer, setAnswer, saving, onSubmit }: { challenge: ChallengeRecord; context: ReturnType<typeof getChallengeDayContext>; submission: ChallengeSubmissionRecord | null; answer: unknown; setAnswer: (value: unknown) => void; saving: boolean; onSubmit: () => void }) {
  const route = resolveChallengeRoute(challenge, context);
  return (
    <Card className="barca-panel border-accent/15">
      <CardContent className="grid gap-4 p-4 lg:grid-cols-[1fr_240px]">
        <div>
          <div className="flex flex-wrap items-center gap-2"><Badge variant="accent">{CHALLENGE_LABELS.phase[challenge.phase]}</Badge><Badge variant="primary">+{challenge.reward_coins} монет</Badge>{challenge.reward_xp ? <Badge variant="accent">до +{challenge.reward_xp} опыта</Badge> : null}</div>
          <h3 className="mt-3 text-lg font-semibold sm:text-xl">{challenge.title}</h3>
          <p className="ui-note mt-2 text-sm">{challenge.description}</p>
          <div className="mt-3"><ChallengeAnswer challenge={challenge} value={answer} onChange={setAnswer} disabled={Boolean(submission)} /></div>
        </div>
        <div className="flex flex-col justify-between gap-3 rounded-xl bg-black/15 p-3">
          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-2 text-blue-100/80"><CalendarCheck className="h-4 w-4 text-blue-300" />{CHALLENGE_LABELS.cadence[challenge.cadence]}</p>
            <p className="flex items-center gap-2 text-blue-100/80"><Clock3 className="h-4 w-4 text-rose-300" />{CHALLENGE_LABELS.verification[challenge.verification_type]}</p>
            {submission ? <SubmissionState submission={submission} /> : null}
          </div>
          {submission ? <Button disabled variant="outline">Ответ сохранён</Button> : challenge.response_type === "action" && route ? <div className="grid gap-2"><Button asChild variant="secondary"><Link href={route}>Перейти к заданию</Link></Button><Button onClick={onSubmit} disabled={saving}>{saving ? "Сохраняем..." : "Отметить выполненным"}</Button></div> : <Button onClick={onSubmit} disabled={saving}>{saving ? "Сохраняем..." : "Отправить ответ"}</Button>}
        </div>
        {submission && challenge.options.length ? <Consensus challenge={challenge} submission={submission} /> : null}
      </CardContent>
    </Card>
  );
}

function ChallengeAnswer({ challenge, value, onChange, disabled }: { challenge: ChallengeRecord; value: unknown; onChange: (value: unknown) => void; disabled: boolean }) {
  if (challenge.response_type === "single_choice") return <div className="grid gap-2 sm:grid-cols-2">{challenge.options.map((option) => <button key={option.id} type="button" disabled={disabled} onClick={() => onChange(option.id)} className={value === option.id ? "spotlight-strip px-4 py-3 text-left text-sm font-semibold" : "soft-panel px-4 py-3 text-left text-sm ui-note"}>{option.label}</button>)}</div>;
  if (challenge.response_type === "multiple_choice") {
    const selected = Array.isArray(value) ? value as string[] : [];
    return <div className="grid gap-2 sm:grid-cols-2">{challenge.options.map((option) => <button key={option.id} type="button" disabled={disabled} onClick={() => onChange(selected.includes(option.id) ? selected.filter((id) => id !== option.id) : [...selected, option.id])} className={selected.includes(option.id) ? "spotlight-strip px-4 py-3 text-left text-sm font-semibold" : "soft-panel px-4 py-3 text-left text-sm ui-note"}>{selected.includes(option.id) ? <Check className="mr-2 inline h-4 w-4" /> : null}{option.label}</button>)}</div>;
  }
  if (challenge.response_type === "text") return <textarea disabled={disabled} className="form-control min-h-28 resize-y" value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value)} placeholder="Напишите короткий футбольный аргумент" maxLength={500} />;
  if (challenge.response_type === "scale") return <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">{Array.from({ length: 10 }, (_, index) => index + 1).map((number) => <button key={number} type="button" disabled={disabled} onClick={() => onChange(number)} className={value === number ? "ui-tab ui-tab-active" : "ui-tab ui-tab-idle bg-white/[0.035]"}>{number}</button>)}</div>;
  if (challenge.response_type === "score") {
    const score = typeof value === "object" && value ? value as { home?: string; away?: string } : {};
    return <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3"><input disabled={disabled} className="form-control text-center text-xl" inputMode="numeric" value={score.home ?? ""} onChange={(event) => onChange({ ...score, home: event.target.value })} aria-label="Голы хозяев" /><span className="text-xl text-blue-100/60">—</span><input disabled={disabled} className="form-control text-center text-xl" inputMode="numeric" value={score.away ?? ""} onChange={(event) => onChange({ ...score, away: event.target.value })} aria-label="Голы гостей" /></div>;
  }
  return <div className="flex items-center gap-3 rounded-2xl bg-white/[0.035] p-4"><Trophy className="h-5 w-5 text-amber-300" /><p className="ui-note text-sm">Выполните действие в соответствующем разделе, затем вернитесь и отметьте задание выполненным.</p></div>;
}

function SubmissionState({ submission }: { submission: ChallengeSubmissionRecord }) {
  if (submission.status === "pending") return <p className="flex items-center gap-2 text-amber-200"><Clock3 className="h-4 w-4" />Ожидает проверки</p>;
  if (submission.status === "rejected") return <p className="flex items-center gap-2 text-rose-200"><LockKeyhole className="h-4 w-4" />Ответ не подтверждён</p>;
  return <p className="flex items-center gap-2 text-emerald-200"><Check className="h-4 w-4" />Награда начислена</p>;
}

function Consensus({ challenge, submission }: { challenge: ChallengeRecord; submission: ChallengeSubmissionRecord }) {
  const selected = typeof submission.answer === "object" && submission.answer ? (submission.answer as { value?: string }).value : null;
  const options = challenge.options.map((option) => ({ ...option, votes: (option.votes ?? 0) + (selected === option.id ? 1 : 0) }));
  const total = Math.max(1, options.reduce((sum, option) => sum + (option.votes ?? 0), 0));
  return <div className="space-y-3 border-t border-white/10 pt-4 lg:col-span-2"><p className="text-sm font-semibold text-blue-100">Мнение сообщества</p>{options.map((option) => <div key={option.id}><div className="flex justify-between gap-4 text-xs"><span className={selected === option.id ? "text-rose-200" : "text-blue-100/75"}>{option.label}</span><span className="tabular-nums text-blue-100/65">{Math.round(((option.votes ?? 0) / total) * 100)}%</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-rose-500" style={{ width: `${((option.votes ?? 0) / total) * 100}%` }} /></div></div>)}</div>;
}

function ProgressChallenge({ challenge, value, completed, onClaim }: { challenge: ChallengeRecord; value: number; completed: boolean; onClaim: () => void }) {
  const progress = Math.min(100, Math.round((value / challenge.target_count) * 100));
  return <Card className="barca-panel border-accent/15"><CardContent className="p-4"><div className="flex items-start justify-between gap-4"><div><Badge variant="accent">{CHALLENGE_LABELS.cadence[challenge.cadence]}</Badge><h3 className="mt-2.5 text-lg font-semibold">{challenge.title}</h3><p className="ui-note mt-1.5 text-sm">{challenge.description}</p></div><Trophy className="h-6 w-6 text-amber-300" /></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-rose-500" style={{ width: `${progress}%` }} /></div><div className="mt-2.5 flex items-center justify-between text-sm"><span className="ui-note">{Math.min(value, challenge.target_count)} из {challenge.target_count}</span><span className="text-amber-100">+{challenge.reward_coins} монет</span></div><Button className="mt-3 w-full" variant="outline" disabled={completed || value < challenge.target_count} onClick={onClaim}>{completed ? "Награда получена" : value >= challenge.target_count ? "Забрать награду" : "Продолжить серию"}</Button></CardContent></Card>;
}

function ChallengeHistory({ submissions, challenges }: { submissions: ChallengeSubmissionRecord[]; challenges: ChallengeRecord[] }) {
  const challengeMap = new Map(challenges.map((item) => [item.id, item]));
  return <section className="space-y-3"><div><h3 className="text-xl font-semibold">История челленджей</h3><p className="ui-note mt-1 text-sm">Сохранённые ответы и задания, которые ещё ждут проверки.</p></div><Card className="soft-panel"><CardContent className="divide-y divide-white/10 p-0">{submissions.length ? submissions.slice(0, 8).map((submission) => <div key={submission.id} className="flex items-center justify-between gap-4 px-4 py-3"><div><p className="ui-value text-sm font-semibold">{challengeMap.get(submission.challenge_id)?.title ?? "Челлендж"}</p><p className="ui-note mt-1 text-xs">{new Date(submission.submitted_at).toLocaleString("ru-RU")}</p></div><div className="text-right"><p className="text-sm text-amber-100">+{submission.coins_awarded} монет</p><p className="ui-note mt-1 text-xs">{submission.status === "pending" ? "На проверке" : submission.status === "verified" ? "Завершён" : "Не подтверждён"}</p></div></div>) : <div className="p-4"><p className="ui-value font-semibold">История пока пуста</p><p className="ui-note mt-2 text-sm">Выполните первый челлендж — он появится здесь.</p></div>}</CardContent></Card></section>;
}

function normalizeAnswer(challenge: ChallengeRecord, value: unknown, route: string | null) {
  if (challenge.response_type === "single_choice" && typeof value === "string") return { value };
  if (challenge.response_type === "multiple_choice" && Array.isArray(value) && value.length) return { values: value };
  if (challenge.response_type === "text" && typeof value === "string" && value.trim()) return { text: value.trim() };
  if (challenge.response_type === "scale" && typeof value === "number") return { value };
  if (challenge.response_type === "score" && value && typeof value === "object") {
    const score = value as { home?: string; away?: string };
    if (score.home !== "" && score.away !== "" && score.home != null && score.away != null) return { home: Number(score.home), away: Number(score.away) };
  }
  if (challenge.response_type === "action") return { completed: true, route };
  return null;
}

function isLocallyCorrect(challenge: ChallengeRecord, answer: unknown) {
  const expected = typeof challenge.correct_answer === "string" ? { value: challenge.correct_answer } : challenge.correct_answer;
  return challenge.verification_type !== "correct_answer" || JSON.stringify(expected) === JSON.stringify(answer);
}

function buildCompletionMessage(status: ChallengeSubmissionRecord["status"], correct: boolean | null, coins: number, xp: number) {
  if (status === "pending") return `Ответ сохранён. +${coins} монет уже начислено, опыт появится после проверки.`;
  if (correct === false) return `Ответ сохранён. +${coins} монет за участие, но опыт за правильный ответ не начислен.`;
  return `Челлендж выполнен: +${coins} монет${xp ? ` и +${xp} опыта` : ""}.`;
}

function startOfCurrentWeek() {
  const now = new Date();
  const day = now.getDay() || 7;
  now.setHours(0, 0, 0, 0);
  now.setDate(now.getDate() - day + 1);
  return now.getTime();
}

function startOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

function formatDayCount(value: number) {
  const mod100 = value % 100;
  const mod10 = value % 10;
  const word = mod100 >= 11 && mod100 <= 14 ? "дней" : mod10 === 1 ? "день" : mod10 >= 2 && mod10 <= 4 ? "дня" : "дней";
  return `${value} ${word}`;
}
