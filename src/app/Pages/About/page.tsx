export default function AboutPage() {
	return (
		<main className="container max-w-6xl py-10 space-y-8">
			<header className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#1a3a2a] via-[#2d6a4f] to-[#40916c] p-6 sm:p-8">
				<div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
				<div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-white/5" />

				<p className="relative z-10 text-xs uppercase tracking-wide text-[#b7e4c7]">EcoSpark Hub</p>
				<h1 className="relative z-10 mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">About Us</h1>
				<p className="relative z-10 mt-3 max-w-3xl text-sm text-[#d8f3dc] sm:text-base">
					EcoSpark Hub is a collaborative sustainability platform where communities turn practical
					ideas into real environmental impact through sharing, review, and action.
				</p>
			</header>

			<section className="grid gap-4 md:grid-cols-3">
				<div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-emerald-900/70 dark:bg-emerald-950/40">
					<h2 className="font-semibold text-emerald-900 dark:text-emerald-100">Our Mission</h2>
					<p className="mt-2 text-sm text-gray-600 dark:text-emerald-200/80">
						Enable people to take climate-positive action by making useful sustainability ideas easy to discover and implement.
					</p>
				</div>
				<div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-emerald-900/70 dark:bg-emerald-950/40">
					<h2 className="font-semibold text-emerald-900 dark:text-emerald-100">How It Works</h2>
					<p className="mt-2 text-sm text-gray-600 dark:text-emerald-200/80">
						Members create ideas, the community votes and discusses, and admins review quality for responsible publishing.
					</p>
				</div>
				<div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-emerald-900/70 dark:bg-emerald-950/40">
					<h2 className="font-semibold text-emerald-900 dark:text-emerald-100">Core Values</h2>
					<p className="mt-2 text-sm text-gray-600 dark:text-emerald-200/80">
						Practical impact, community trust, transparent moderation, and long-term environmental responsibility.
					</p>
				</div>
			</section>

			<section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm dark:border-emerald-900/70 dark:bg-emerald-950/40">
				<h2 className="text-xl font-semibold text-emerald-900 dark:text-emerald-100">What You Can Do Here</h2>
				<ul className="mt-3 space-y-2 pl-5 text-sm text-gray-600 list-disc dark:text-emerald-200/80">
					<li>Explore sustainability ideas by category, popularity, and relevance</li>
					<li>Create your own idea and track review status from your dashboard</li>
					<li>Vote, comment, and collaborate with other community members</li>
					<li>Unlock premium paid ideas securely through integrated payment flow</li>
				</ul>
			</section>
		</main>
	);
}
