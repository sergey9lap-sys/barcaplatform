"use client";

import type { ReactNode } from "react";
import { useState } from "react";

type Tab = "overview" | "skills" | "activity";

export function ProfileSectionsClient({ overview, skills, activity }: { overview: ReactNode; skills: ReactNode; activity: ReactNode }) {
  const [tab, setTab] = useState<Tab>("overview");
  const tabs: { id: Tab; label: string }[] = [{ id: "overview", label: "Обзор" }, { id: "skills", label: "Навыки" }, { id: "activity", label: "Активность" }];
  return <div className="space-y-5"><div className="no-scrollbar overflow-x-auto"><div className="flex min-w-max gap-2" role="tablist" aria-label="Раздел профиля">{tabs.map((item) => <button key={item.id} type="button" role="tab" aria-selected={tab===item.id} onClick={() => setTab(item.id)} className={tab===item.id ? "ui-tab ui-tab-active min-h-11 px-5" : "ui-tab ui-tab-idle min-h-11 bg-white/[0.035] px-5"}>{item.label}</button>)}</div></div><div role="tabpanel">{tab === "overview" ? overview : tab === "skills" ? skills : activity}</div></div>;
}
