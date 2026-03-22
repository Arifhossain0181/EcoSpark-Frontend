import api from "@/lib/axios";

export interface Idea {
  id: string;
  title: string;
  description: string;
  price: number;
  problem?: string;
  solution?: string;
  images?: string[];
  isPaid?: boolean;
  status?: "DRAFT" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  adminFeedback?: string | null;
  categoryId?: string;
  authorId?: string;
  author?: { id: string; name?: string | null } | null;
  category?: { name: string } | null;
  votes?: { userId: string; type: "UP" | "DOWN" }[];
  createdAt?: string;
  _count?: {
    comments?: number;
    votes?: number;
  };
}

export async function getIdeas(): Promise<Idea[]> {
  const { data } = await api.get<{
    ideas: Idea[];
    total: number;
    page: number;
    limit: number;
  }>("ideas");
  return data.ideas;
}
