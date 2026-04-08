import { Users, MessageSquare, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HeroTitleReveal from "@/components/community/hero-title-reveal";
import ParallaxText from "@/components/community/parallax-text";

const highlights = [
  {
    title: "Join The Discussion",
    description:
      "Connect with builders, share feedback, and help ideas grow with constructive conversations.",
    icon: MessageSquare,
  },
  {
    title: "Find Collaborators",
    description:
      "Meet people with shared interests and team up to turn sustainability ideas into real projects.",
    icon: Users,
  },
  {
    title: "Inspire Impact",
    description:
      "Discover trending community initiatives and contribute your perspective to meaningful challenges.",
    icon: Sparkles,
  },
];

export default function CommunityPage() {
  return (
    <main className="py-12 md:py-16 space-y-8">
      <section className="container">
        <div className="rounded-3xl border border-emerald-100 dark:border-emerald-900/70 bg-linear-to-b from-white to-emerald-50/50 dark:from-emerald-950 dark:to-emerald-900/70 p-8 shadow-sm md:p-12">
          <p className="mb-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-800 uppercase dark:bg-emerald-900/60 dark:text-emerald-200">
            EcoSpark Community
          </p>
          <HeroTitleReveal
            text="Build Better Ideas Together"
            className="max-w-3xl text-3xl font-bold tracking-tight text-emerald-900 dark:text-emerald-100 md:text-5xl"
          />
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-emerald-800/90 dark:text-emerald-200/90 md:text-lg">
            This is your space to collaborate, review, and uplift eco-friendly ideas.
            Join conversations, discover people with similar goals, and shape projects that matter.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700">
              <Link href="/ideas">
                Explore Ideas <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/40"
            >
              <Link href="/All.ideas">Start a Discussion</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {highlights.map(({ title, description, icon: Icon }) => (
            <Card
              key={title}
              className="border-emerald-100 dark:border-emerald-900/70 bg-card"
            >
              <CardHeader className="pb-2">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-emerald-900 dark:text-emerald-100">
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10">
          <ParallaxText />
        </div>
      </section>
    </main>
  );
}
