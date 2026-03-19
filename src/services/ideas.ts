import api from "@/lib/axios";

export interface Idea {
  id: string;
  title: string;
  description: string;
  category?: { name: string } | null;
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
