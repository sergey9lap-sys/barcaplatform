import type { ReactNode } from "react";

interface AppMotionProps {
  children: ReactNode;
}

export function AppMotion({ children }: AppMotionProps) {
  return <div className="motion-page">{children}</div>;
}
