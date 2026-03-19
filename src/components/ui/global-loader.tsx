"use client";

import { ReactNode } from "react";
import { useAuth } from "@/context/authcontext";

interface GlobalLoaderProps {
	children: ReactNode;
}

export function GlobalLoader({ children }: GlobalLoaderProps) {
	const { loading } = useAuth();

	return (
		<div className="relative min-h-screen">
			{children}
			{loading && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm">
					<div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
				</div>
			)}
		</div>
	);
}
