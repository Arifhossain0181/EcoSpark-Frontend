"use client";

import AdminCategoriesPage from "../../admin/categories/page";

export default function ManagerCategoriesPage() {
	return (
		<main className="space-y-4">
			<section className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-5 shadow-lg shadow-black/20">
				<h1 className="text-xl font-semibold text-[#e8f5f0]">Category Management</h1>
				<p className="mt-1 text-sm text-emerald-100/60">
					Maintain taxonomy quality so ideas stay discoverable and well organized.
				</p>
			</section>
			<AdminCategoriesPage />
		</main>
	);
}
