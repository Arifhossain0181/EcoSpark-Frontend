export default function AboutPage() {
	return (
		<main className="container max-w-5xl py-10 space-y-8">
			<header className="space-y-2">
				<p className="text-xs uppercase tracking-wide text-muted-foreground">EcoSpark Hub</p>
				<h1 className="text-3xl font-bold tracking-tight">About Us</h1>
				<p className="text-sm text-muted-foreground max-w-3xl">
					EcoSpark Hub is a community-driven sustainability portal where members share practical,
					high-impact ideas to reduce waste, save energy, and improve local environmental outcomes.
				</p>
			</header>

			<section className="grid gap-4 md:grid-cols-3">
				<div className="rounded-2xl border bg-card p-5">
					<h2 className="font-semibold">Our Mission</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						Empower communities to take climate-positive action through collaborative innovation.
					</p>
				</div>
				<div className="rounded-2xl border bg-card p-5">
					<h2 className="font-semibold">Our Process</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						Members submit ideas, admins review feasibility, and approved ideas are published for wider adoption.
					</p>
				</div>
				<div className="rounded-2xl border bg-card p-5">
					<h2 className="font-semibold">Our Values</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						Transparency, accessibility, practical impact, and long-term environmental responsibility.
					</p>
				</div>
			</section>

			<section className="rounded-2xl border bg-card p-6">
				<h2 className="text-xl font-semibold">What You Can Do Here</h2>
				<ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-5">
					<li>Discover and search sustainability ideas by category and relevance</li>
					<li>Submit your own idea and track its review status</li>
					<li>Vote and discuss with community members</li>
					<li>Support premium ideas through secure payment access</li>
				</ul>
			</section>
		</main>
	);
}
