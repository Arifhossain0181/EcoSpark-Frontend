"use client";

import AdminCommentsPage from "../../admin/Comments/page";

export default function ManagerCommentsPage() {
	return (
		<main className="space-y-4">
			<section className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-5 shadow-lg shadow-black/20">
				<h1 className="text-xl font-semibold text-[#e8f5f0]">Comment Moderation</h1>
				<p className="mt-1 text-sm text-emerald-100/60">
					Keep discussions healthy by reviewing and resolving problematic comments.
				</p>
			</section>
			<AdminCommentsPage />
		</main>
	);
}
