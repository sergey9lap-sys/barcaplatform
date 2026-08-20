import { DigitalShopClient } from "@/components/shop/digital-shop-client";
import { Card, CardContent } from "@/components/ui/card";
import { SECTION_BACKGROUNDS, createPhotoPanelStyle } from "@/lib/backgrounds";

export default function ShopPage() { return <div className="space-y-6"><Card className="hero-panel border-0" style={createPhotoPanelStyle(SECTION_BACKGROUNDS.homeTransfers, { position: "center 52%" })}><CardContent className="p-5"><p className="meta-label text-xs">Цифровой магазин · тестовый режим</p><h2 className="mt-2 text-3xl font-semibold">Маленькие вещи, которые делают профиль вашим</h2><p className="mt-2 max-w-3xl text-sm text-blue-100/75">Рамки, стикеры, реакции, темы поля и шаблоны экспорта за 39–299 ₽. Физических товаров и реальных оплат пока нет.</p></CardContent></Card><DigitalShopClient /></div>; }
