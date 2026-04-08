"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { getIdeas } from "@/services/ideas";
import { getCategories } from "@/services/category";

const Hero7 = dynamic(
    () => import("@/components/hero7").then((mod) => mod.Hero7),
    { ssr: false }
);

const HeroSection = () => {
    const { data: ideasData } = useQuery({
        queryKey: ["ideas"],
        queryFn: getIdeas,
        staleTime: 3 * 60 * 1000,
    });

    const { data: categoriesData } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
        staleTime: 5 * 60 * 1000,
    });

    const ideas = ideasData ?? [];
    const approvedIdeas = ideas.filter((idea) => idea.status === "APPROVED");

    const totalVotes = useMemo(
        () => ideas.reduce((sum, idea) => sum + (idea._count?.votes ?? idea.votes?.length ?? 0), 0),
        [ideas]
    );

    const totalContributors = useMemo(() => {
        const ids = new Set<string>();
        ideas.forEach((idea) => {
            if (idea.author?.id) ids.add(idea.author.id);
            else if (idea.authorId) ids.add(idea.authorId);
        });
        return ids.size;
    }, [ideas]);

    const totalComments = useMemo(
        () => ideas.reduce((sum, idea) => sum + (idea._count?.comments ?? 0), 0),
        [ideas]
    );

    const rating = useMemo(() => {
        if (totalVotes === 0) return 4.5;
        const normalized = Math.min(5, 4 + totalVotes / Math.max(approvedIdeas.length * 25, 1));
        return Number(normalized.toFixed(1));
    }, [approvedIdeas.length, totalVotes]);

    const reviewCount = Math.max(totalComments, approvedIdeas.length * 2);

    const avatarPool = useMemo(
        () =>
            approvedIdeas
                .flatMap((idea) => idea.images ?? [])
                .filter((img): img is string => Boolean(img))
                .slice(0, 5)
                .map((src, index) => ({ src, alt: `Community idea ${index + 1}` })),
        [approvedIdeas]
    );

    const fallbackAvatars = [
        { src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp", alt: "Member 1" },
        { src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-2.webp", alt: "Member 2" },
        { src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp", alt: "Member 3" },
        { src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-4.webp", alt: "Member 4" },
        { src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-5.webp", alt: "Member 5" },
    ];

    const heroStats = [
        { value: String(approvedIdeas.length), label: "Ideas Approved" },
        { value: String(totalContributors), label: "Active Contributors" },
        { value: String(categoriesData?.length ?? 0), label: "Categories" },
    ];

    const heroDescription =
        `Explore ${approvedIdeas.length} approved ideas across ${categoriesData?.length ?? 0} categories and collaborate with ${totalContributors} contributors for a greener future.`;

    return (
        <div>
            <Hero7
                description={heroDescription}
                stats={heroStats}
                reviews={{
                    count: reviewCount,
                    rating,
                    avatars: avatarPool.length > 0 ? avatarPool : fallbackAvatars,
                }}
            ></Hero7>
        </div>
    )
 }
 export default HeroSection;