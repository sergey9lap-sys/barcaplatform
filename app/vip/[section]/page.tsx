import { notFound } from "next/navigation";
import { VipSectionClient } from "@/components/premium/vip-section-client";
import { vipModules } from "@/lib/premium/vip";
export default async function VipSectionPage({ params }: { params: Promise<{ section: string }> }) { const { section } = await params; const module = vipModules.find((item) => item.slug === section); if (!module) notFound(); return <VipSectionClient module={module} />; }
