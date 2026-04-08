"use client";

import ManageIdeasPage from "../../admin/Manage.ideas/page";

export default function ManagerModerateIdeasPage() {
	return (
		<main className="space-y-4">
			<section className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-5 shadow-lg shadow-black/20">
				<h1 className="text-xl font-semibold text-[#e8f5f0]">Moderate Ideas</h1>
				<p className="mt-1 text-sm text-emerald-100/60">
					Review pending ideas, approve strong submissions, and keep quality high.
				</p>
			</section>
			<ManageIdeasPage />
		</main>
	);
}
