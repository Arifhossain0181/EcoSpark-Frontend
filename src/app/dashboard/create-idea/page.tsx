import { redirect } from "next/navigation";

export default function DashboardCreateIdeaRedirectPage() {
  redirect("/dashboard/member/create-ideas");
}