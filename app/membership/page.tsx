import { MembershipClient } from "@/components/premium/membership-client";
import { Card, CardContent } from "@/components/ui/card";

export default function MembershipPage() { return <div className="space-y-6"><Card className="hero-panel"><CardContent className="p-5"><p className="meta-label text-xs">Barça Membership</p><h2 className="mt-2 text-3xl font-semibold">Больше стиля и глубины. Ноль pay-to-win.</h2><p className="mt-2 max-w-3xl text-sm text-blue-100/75">Основная платформа остаётся бесплатной. Подписка добавляет оформление, расширенную аналитику и доступ в закрытый Socio 1899.</p></CardContent></Card><MembershipClient /></div>; }
