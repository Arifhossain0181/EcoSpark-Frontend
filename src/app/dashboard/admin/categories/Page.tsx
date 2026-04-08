"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/axios";

type CategoryItem = {
  id: string;
  name: string;
  _count?: {
    ideas?: number;
  };
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object"
  ) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) {
      return response.data.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export default function CategoryDashboardPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  const {
    data: categories = [],
    isLoading,
    isError,
  } = useQuery<CategoryItem[]>({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data } = await api.get("/categories");
      return (data?.data ?? []) as CategoryItem[];
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const totalIdeas = useMemo(
    () =>
      categories.reduce((sum, category) => {
        return sum + (category._count?.ideas ?? 0);
      }, 0),
    [categories],
  );

  const filteredCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((category) => category.name.toLowerCase().includes(term));
  }, [categories, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedCategories = filteredCategories.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const { mutate: addCategory, isPending: adding } = useMutation({
    mutationFn: (payload: { name: string }) => api.post("/categories", payload),
    onSuccess: () => {
      setName("");
      toast.success("Category added successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to add category"));
    },
  });

  const { mutate: deleteCategory, isPending: deleting } = useMutation({
    mutationFn: async (id: string) => {
      setDeletingCategoryId(id);
      return api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      toast.success("Category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete category"));
    },
    onSettled: () => setDeletingCategoryId(null),
  });

  const { mutate: updateCategory, isPending: updating } = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      api.patch(`/categories/${id}`, { name }),
    onSuccess: () => {
      toast.success("Category updated successfully");
      setEditId(null);
      setEditName("");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update category"));
    },
  });

  const handleAdd = () => {
    const normalizedName = name.trim();
    if (!normalizedName) {
      toast.error("Category name is required");
      return;
    }
    addCategory({ name: normalizedName });
  };

  const handleDelete = (id: string) => {
    deleteCategory(id);
  };

  const openEditModal = (category: CategoryItem) => {
    setEditId(category.id);
    setEditName(category.name);
  };

  const handleUpdate = () => {
    if (!editId) return;

    const normalizedName = editName.trim();
    if (!normalizedName) {
      toast.error("Category name is required");
      return;
    }

    updateCategory({ id: editId, name: normalizedName });
  };

  if (isLoading) {
    return (
      <main className="space-y-4 p-4 md:p-6">
        <div className="h-8 w-56 animate-pulse rounded bg-[#162e27]" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-2xl border border-emerald-500/20 bg-[#0f211c]" />
          ))}
        </div>
        <div className="h-28 animate-pulse rounded-2xl border border-emerald-500/20 bg-[#0f211c]" />
        <div className="h-72 animate-pulse rounded-2xl border border-emerald-500/20 bg-[#0f211c]" />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-4 md:p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Failed to load categories. Please refresh and try again.
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#e8f5f0] md:text-3xl">Category Dashboard</h1>
        <p className="mt-1 text-sm text-emerald-100/65">Manage all idea categories</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-4 shadow-lg shadow-black/20">
          <p className="text-sm text-emerald-100/65">Total Categories</p>
          <h2 className="mt-1 text-2xl font-bold text-[#e8f5f0]">{categories.length}</h2>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-4 shadow-lg shadow-black/20">
          <p className="text-sm text-emerald-100/65">Total Ideas</p>
          <h2 className="mt-1 text-2xl font-bold text-[#e8f5f0]">{totalIdeas}</h2>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-emerald-500/20 bg-[#0f211c] p-4 shadow-lg shadow-black/20">
        <h2 className="font-semibold text-[#e8f5f0]">Add New Category</h2>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Enter category name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />

          <button
            onClick={handleAdd}
            disabled={adding}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
          >
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#0f211c] shadow-lg shadow-black/20">
        <div className="border-b p-4">
          <input
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setPage(1);
            }}
            placeholder="Filter categories..."
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-400 sm:max-w-sm"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 text-sm text-emerald-50">
            <thead className="bg-[#162e27] text-emerald-100/70">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Category Name</th>
                <th className="px-4 py-3 text-left font-medium">Ideas</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {pagedCategories.map((cat) => (
                <tr
                  key={cat.id}
                  className="border-t border-emerald-500/15 transition-colors hover:bg-[#162e27]/70"
                >
                  <td className="px-4 py-3 font-medium text-[#e8f5f0]">{cat.name}</td>

                  <td className="px-4 py-3 text-emerald-100/70">{cat._count?.ideas ?? 0}</td>

                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(cat)}
                        disabled={updating || (deleting && deletingCategoryId === cat.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Update
                      </button>

                      <button
                        onClick={() => handleDelete(cat.id)}
                        disabled={(deleting && deletingCategoryId === cat.id) || updating}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 dark:hover:bg-emerald-900/60 disabled:opacity-60"
                      >
                        {deleting && deletingCategoryId === cat.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {pagedCategories.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="p-6 text-center text-sm text-emerald-100/60"
                  >
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
          <span className="text-emerald-100/70">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              className="rounded-lg border px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="rounded-lg border px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm space-y-4 rounded-2xl border bg-card p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-foreground">Update Category</h2>

            <input
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="Enter category name"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setEditId(null);
                  setEditName("");
                }}
                disabled={updating}
                className="rounded-lg border border-emerald-200 px-3 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/40 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                disabled={updating}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
              >
                {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}