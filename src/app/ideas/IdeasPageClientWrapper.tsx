"use client";

import dynamic from "next/dynamic";

const IdeasClientPage = dynamic(
  () => import("@/app/ideas/IdeasClientPage"),
  { ssr: false }
);

export default function IdeasPageClientWrapper() {
  return <IdeasClientPage />;
}
