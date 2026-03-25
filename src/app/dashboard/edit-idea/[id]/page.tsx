"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { getCategories } from "@/services/category";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type IdeaForm = {
  title: string;
  problem: string;
  solution: string;
  description: string;
  categoryId: string;
  isPaid: boolean;
  price: number;
  images: string[];
};

const EMPTY_FORM: IdeaForm = {
  title: "",
  problem: "",
  solution: "",
  description: "",
  categoryId: "",
  isPaid: false,
  price: 0,
  images: [],
};

export default function EditIdeaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [draft, setDraft] = useState<{ id: string; form: IdeaForm } | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: idea, isLoading } = useQuery({
    queryKey: ["idea", id],
    queryFn: async () => {
      const { data } = await api.get(`/ideas/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });

  const baseForm: IdeaForm = idea
    ? {
        title: idea.title ?? "",
        problem: idea.problem ?? "",
        solution: idea.solution ?? "",
        description: idea.description ?? "",
        categoryId: idea.categoryId ?? "",
        isPaid: Boolean(idea.isPaid),
        price: idea.price ?? 0,
        images: Array.isArray(idea.images) ? idea.images : [],
      }
    : EMPTY_FORM;

  const form = draft?.id === id ? draft.form : baseForm;

  const setForm = (updater: (prev: IdeaForm) => IdeaForm) => {
    const current = draft?.id === id ? draft.form : baseForm;
    setDraft({ id, form: updater(current) });
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.title.trim()) nextErrors.title = "Title is required";
    if (!form.problem.trim()) nextErrors.problem = "Problem is required";
    if (!form.solution.trim()) nextErrors.solution = "Solution is required";
    if (!form.description.trim()) nextErrors.description = "Description is required";
    if (!form.categoryId) nextErrors.categoryId = "Category is required";
    if (form.isPaid && form.price <= 0) nextErrors.price = "Price must be greater than 0";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const { mutate: updateIdea, isPending } = useMutation({
    mutationFn: async () => {
      await api.patch(`/ideas/${id}`, {
        ...form,
        price: form.isPaid ? form.price : 0,
      });
    },
    onSuccess: () => {
      toast.success("Idea updated successfully");
      router.push("/dashboard/member/my-ideas");
    },
  });

  const inputCls = (field: string) =>
    `w-full border-2 rounded-xl px-4 py-3 text-sm bg-white/70 dark:bg-emerald-950/30 backdrop-blur-md outline-none transition-all duration-200 ${
      errors[field]
        ? "border-red-400 focus:border-red-500"
        : "border-gray-200 dark:border-emerald-900/70 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
    }`;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#081c15] via-[#1b4332] to-[#2d6a4f] p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Idea</h1>
          <p className="text-gray-300 text-sm mt-1">
            Update your idea and make it impactful 🚀
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 dark:bg-emerald-950/40 backdrop-blur-xl rounded-3xl shadow-xl border border-white/10 p-6 space-y-6">

          {/* Title */}
          <div>
            <label className="text-sm font-semibold mb-1 block">Title</label>
            <input
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              className={inputCls("title")}
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-semibold mb-1 block">Category</label>
            <select
              value={form.categoryId}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  categoryId: e.target.value,
                }))
              }
              className={inputCls("categoryId")}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Problem */}
          <div>
            <label className="text-sm font-semibold mb-1 block">Problem</label>
            <textarea
              rows={3}
              value={form.problem}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, problem: e.target.value }))
              }
              className={inputCls("problem")}
            />
          </div>

          {/* Solution */}
          <div>
            <label className="text-sm font-semibold mb-1 block">Solution</label>
            <textarea
              rows={3}
              value={form.solution}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, solution: e.target.value }))
              }
              className={inputCls("solution")}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold mb-1 block">Description</label>
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className={inputCls("description")}
            />
          </div>

          {/* Paid Toggle */}
          <div className="flex justify-between items-center">
            <span className="font-semibold">Paid Idea</span>
            <input
              type="checkbox"
              checked={form.isPaid}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  isPaid: e.target.checked,
                }))
              }
            />
          </div>

          {/* Price */}
          {form.isPaid && (
            <input
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  price: Number(e.target.value),
                }))
              }
              className={inputCls("price")}
              placeholder="Enter price"
            />
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => router.push("/dashboard/member/my-ideas")}
              className="px-5 py-2.5 rounded-xl border text-sm font-semibold hover:bg-gray-100 dark:hover:bg-emerald-900/40"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                if (!validate()) return;
                updateIdea();
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}