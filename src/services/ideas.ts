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

export interface IdeaSuggestion {
  id: string;
  type: "IDEA" | "CATEGORY";
  title: string;
  subtitle: string;
  score: number;
}

export interface IdeaRecommendation {
  id: string;
  title: string;
  category: string;
  isPaid: boolean;
  price: number;
  score: number;
  reasons: string[];
}

export async function getIdeas(): Promise<Idea[]> {
  const { data } = await api.get<{
    ideas: Idea[];
    total: number;
    page: number;
    limit: number;
  }>("ideas", {
    params: {
      includeTotal: "false",
    },
  });
  return data.ideas;
}

export async function getIdeaSearchSuggestions(query: string): Promise<IdeaSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const { data } = await api.get<{ suggestions: IdeaSuggestion[] }>("ideas/search/suggestions", {
    params: { q: trimmed },
  });
  return data.suggestions ?? [];
}

export async function getTrendingIdeaRecommendations(): Promise<IdeaRecommendation[]> {
  const { data } = await api.get<{ recommendations: IdeaRecommendation[] }>("ideas/recommendations/trending");
  return data.recommendations ?? [];
}

export async function getPersonalIdeaRecommendations(): Promise<IdeaRecommendation[]> {
  try {
    const { data } = await api.get<{ recommendations: IdeaRecommendation[] }>("ideas/recommendations/personal");
    return data.recommendations ?? [];
  } catch {
    return [];
  }
}

export async function trackIdeaInteraction(
  ideaId: string,
  type: "RECOMMENDATION_CLICK" | "TRENDING_CLICK" | "SEARCH_SUGGESTION_CLICK"
): Promise<void> {
  try {
    await api.post(`ideas/${ideaId}/interactions`, { type });
  } catch {
    // Ignore tracking failures to keep UX smooth.
  }
}
