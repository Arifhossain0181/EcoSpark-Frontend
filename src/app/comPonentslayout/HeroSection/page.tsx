"use client";

import dynamic from "next/dynamic";

const Hero7 = dynamic(
    () => import("@/components/hero7").then((mod) => mod.Hero7),
    { ssr: false }
);

const HeroSection = () => {
    return (
        <div>
            <Hero7></Hero7>
        </div>
    )
 }
 export default HeroSection;