import { redirect } from "next/navigation";

export default function CreatedIdeasRedirectPage() {
  redirect("/dashboard/member/created-my-ideas");
}
