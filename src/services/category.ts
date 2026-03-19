import api from "@/lib/axios";

export interface Category {
  id: string;
  name: string;
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<{ success: boolean; data: Category[] }>(
    "categories"
  );
  return data.data;
}
