"use client";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { getCategories } from "@/services/category";
import { toast } from "sonner";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";

export default function CreateIdeaPage() {
  const router      = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({
    title:       "",
    problem:     "",
    solution:    "",
    description: "",
    categoryId:  "",
    isPaid:      false,
    price:       0,
  });

  type LocalImage = {
    id: string;
    file: File;
    previewUrl: string;
  };

  const [urlImages, setUrlImages] = useState<string[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [localImages, setLocalImages] = useState<LocalImage[]>([]);
  const [imageInput, setImageInput] = useState("");
  const [mediaInput, setMediaInput] = useState("");
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: Infinity,
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim())       e.title       = "Title is required";
    if (!form.problem.trim())     e.problem     = "Problem is required";
    if (!form.solution.trim())    e.solution    = "Solution is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.categoryId)         e.categoryId  = "Category is required";
    if (form.isPaid && form.price <= 0) e.price = "Price must be greater than 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const { mutate: createIdea, isPending } = useMutation({
    mutationFn: async (asDraft: boolean) => {
      const localImageDataUrls = await Promise.all(
        localImages.map(
          (item) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => reject(new Error("Failed to read image"));
              reader.readAsDataURL(item.file);
            })
        )
      );

      const payload = {
        title: form.title,
        problem: form.problem,
        solution: form.solution,
        description: form.description,
        categoryId: form.categoryId,
        isPaid: form.isPaid,
        price: form.isPaid ? form.price : 0,
        images: [...urlImages, ...localImageDataUrls],
      };

      const { data } = await api.post("/ideas", {
        ...payload,
        images: [...payload.images, ...mediaUrls],
      });

      if (!asDraft) {
        const createdIdeaId = data?.id ?? data?.data?.id ?? data?.idea?.id;

        if (!createdIdeaId) {
          throw new Error("Created idea ID not found in server response");
        }

        await api.patch(`/ideas/${createdIdeaId}/submit`);
      }

      return { asDraft };
    },
    onSuccess: ({ asDraft }) => {
      queryClient.invalidateQueries({ queryKey: ["created-my-ideas"] });
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      toast.success(
        asDraft ? "Saved as draft! 📝" : "Submitted for review! 🌿"
      );
      router.push("/dashboard/member/created-my-ideas");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) =>
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.response?.statusText ||
          err?.message ||
          "Failed to create idea"
      ),
  });

  const handleSubmit = (asDraft: boolean) => {
    if (!asDraft && !validate()) return;
    createIdea(asDraft);
  };

  const addImage = () => {
    if (imageInput.trim() && !urlImages.includes(imageInput.trim())) {
      setUrlImages((prev) => [...prev, imageInput.trim()]);
      setImageInput("");
    }
  };

  const removeImage = (value: string, source: "url" | "local") => {
    if (source === "url") {
      setUrlImages((prev) => prev.filter((img) => img !== value));
      return;
    }

    setLocalImages((prev) => {
      const target = prev.find((img) => img.id === value);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((img) => img.id !== value);
    });
  };

  const addMediaUrl = () => {
    const value = mediaInput.trim();
    if (!value) return;
    if (mediaUrls.includes(value)) {
      toast.error("This media URL is already added");
      return;
    }
    setMediaUrls((prev) => [...prev, value]);
    setMediaInput("");
  };

  const removeMediaUrl = (value: string) => {
    setMediaUrls((prev) => prev.filter((item) => item !== value));
  };

  const handleImageFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploadingImages(true);

    try {
      const selected = Array.from(files).filter((file) =>
        file.type.startsWith("image/")
      );

      if (selected.length === 0) {
        toast.error("Please select image files only");
        return;
      }

      setLocalImages((prev) => {
        const existingKeys = new Set(
          prev.map((item) => `${item.file.name}-${item.file.size}-${item.file.lastModified}`)
        );

        const nextItems = selected
          .filter((file) => {
            const key = `${file.name}-${file.size}-${file.lastModified}`;
            if (existingKeys.has(key)) return false;
            existingKeys.add(key);
            return true;
          })
          .map((file) => ({
            id: crypto.randomUUID(),
            file,
            previewUrl: URL.createObjectURL(file),
          }));

        return [...prev, ...nextItems];
      });

      toast.success(`${selected.length} image(s) added`);
    } catch {
      toast.error("Failed to upload selected images");
    } finally {
      setIsUploadingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  useEffect(() => {
    return () => {
      localImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, [localImages]);

  const field = (
    id: keyof typeof form,
    label: string,
    element: React.ReactNode
  ) => (
    <div>
      <label
        htmlFor={`idea-${String(id)}`}
        className="block text-sm font-semibold text-foreground mb-1.5"
      >
        {label}
      </label>
      {element}
      {errors[id] && (
        <p className="text-red-500 text-xs mt-1">{errors[id]}</p>
      )}
    </div>
  );

  const inputCls = (id: string) =>
    `w-full border-2 rounded-xl px-4 py-3 text-sm bg-white dark:bg-emerald-950/40 outline-none transition-colors ${
      errors[id]
        ? "border-red-400 focus:border-red-500"
        : "border-gray-200 dark:border-emerald-900/70 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
    }`;

  return (
    <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 pb-6">

      {/* Header */}
      <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/70 bg-linear-to-r from-emerald-50 to-white dark:from-emerald-950 dark:to-emerald-900/70 p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300 mb-2">Member Workspace</p>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Create New Idea
        </h1>
        <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
          Share your sustainability concept clearly with problem, solution, media, and optional paid access details.
        </p>
      </div>

      <div className="bg-white dark:bg-emerald-950/40 rounded-3xl border border-gray-100 dark:border-emerald-900/70 p-5 sm:p-6 md:p-7 space-y-6 shadow-sm">

        {/* Title */}
        {field(
          "title",
          "Idea Title *",
          <input
            id="idea-title"
            name="title"
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Solar panels for rural schools"
            className={inputCls("title")}
          />
        )}

        {/* Category */}
        {field(
          "categoryId",
          "Category *",
          <select
            id="idea-categoryId"
            name="categoryId"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className={inputCls("categoryId")}
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}

        {/* Problem */}
        {field(
          "problem",
          "Problem Statement *",
          <textarea
            id="idea-problem"
            name="problem"
            value={form.problem}
            onChange={(e) => setForm({ ...form, problem: e.target.value })}
            placeholder="What problem does this idea solve?"
            rows={3}
            className={`${inputCls("problem")} resize-none`}
          />
        )}

        {/* Solution */}
        {field(
          "solution",
          "Proposed Solution *",
          <textarea
            id="idea-solution"
            name="solution"
            value={form.solution}
            onChange={(e) => setForm({ ...form, solution: e.target.value })}
            placeholder="How does your idea solve this problem?"
            rows={3}
            className={`${inputCls("solution")} resize-none`}
          />
        )}

        {/* Description */}
        {field(
          "description",
          "Detailed Description *",
          <textarea
            id="idea-description"
            name="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Provide a detailed description of your idea..."
            rows={5}
            className={`${inputCls("description")} resize-none`}
          />
        )}

        {/* Images */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Images (URL or Upload)
          </label>
          <input
            ref={fileInputRef}
            id="idea-images-file"
            name="imagesFile"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleImageFiles(e.target.files)}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingImages}
            className="w-full mb-3 border-2 border-dashed border-gray-300 dark:border-emerald-900/70 hover:border-emerald-600 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 dark:text-emerald-200/70 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isUploadingImages ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading images...
              </>
            ) : (
              <>
                <ImagePlus className="w-4 h-4" />
                Upload from device / gallery
              </>
            )}
          </button>

          <div className="flex gap-2 mb-3">
            <input
              id="idea-images-url"
              name="imagesUrl"
              type="url"
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addImage()}
              placeholder="Paste image URL and press Enter"
              className="flex-1 border-2 border-gray-200 dark:border-emerald-900/70 bg-white dark:bg-emerald-950/40 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
            />
            <button
              type="button"
              onClick={addImage}
              className="bg-emerald-600 text-white px-4 py-3 rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>

          {(urlImages.length > 0 || localImages.length > 0) && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {urlImages.map((url) => (
                <div key={`url-${url}`} className="relative group">
                  <Image
                    src={url}
                    alt="Preview"
                    width={240}
                    height={96}
                    unoptimized
                    className="w-full h-24 object-cover rounded-xl border border-gray-200 dark:border-emerald-900/70"
                  />
                  <button
                    onClick={() => removeImage(url, "url")}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {localImages.map((image) => (
                <div key={image.id} className="relative group">
                  <Image
                    src={image.previewUrl}
                    alt={image.file.name || "Preview"}
                    width={240}
                    height={96}
                    unoptimized
                    className="w-full h-24 object-cover rounded-xl border border-gray-200 dark:border-emerald-900/70"
                  />
                  <button
                    onClick={() => removeImage(image.id, "local")}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Optional Media Attachments */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Optional Media Attachment (Video / PDF URL)
          </label>
          <div className="flex gap-2 mb-3">
            <input
              id="idea-media-url"
              name="mediaUrl"
              type="url"
              value={mediaInput}
              onChange={(e) => setMediaInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addMediaUrl()}
              placeholder="Paste video or PDF URL"
              className="flex-1 border-2 border-gray-200 dark:border-emerald-900/70 bg-white dark:bg-emerald-950/40 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
            />
            <button
              type="button"
              onClick={addMediaUrl}
              className="bg-emerald-600 text-white px-4 py-3 rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>

          {mediaUrls.length > 0 && (
            <div className="space-y-2">
              {mediaUrls.map((url) => (
                <div
                  key={url}
                  className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-emerald-900/70 px-3 py-2"
                >
                  <p className="text-xs text-gray-600 dark:text-emerald-200/70 truncate pr-2">{url}</p>
                  <button
                    onClick={() => removeMediaUrl(url)}
                    className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paid toggle */}
        <div className="bg-gray-50 dark:bg-emerald-900/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Paid Idea
              </p>
              <p className="text-xs text-gray-500 dark:text-emerald-200/70 mt-0.5">
                Members must pay to view full content
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({
                  ...f, isPaid: !f.isPaid,
                  price: !f.isPaid ? f.price : 0,
                }))
              }
              className={`relative w-12 h-6 rounded-full transition-colors ${
                form.isPaid ? "bg-emerald-600" : "bg-gray-300 dark:bg-emerald-800"
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                form.isPaid ? "translate-x-7" : "translate-x-1"
              }`} />
            </button>
          </div>

          {form.isPaid && (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-emerald-200/70 mb-1">
                Price (USD) *
              </label>
              <input
                id="idea-price"
                name="price"
                type="number"
                min={0.01}
                step={0.01}
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: parseFloat(e.target.value) || 0 })
                }
                className={`w-full sm:w-40 border-2 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${
                  errors.price
                    ? "border-red-400"
                    : "border-gray-200 dark:border-emerald-900/70 focus:border-emerald-600"
                }`}
              />
              {errors.price && (
                <p className="text-red-500 text-xs mt-1">{errors.price}</p>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => handleSubmit(true)}
            disabled={isPending}
            className="flex-1 border-2 border-gray-200 dark:border-emerald-900/70 text-gray-700 dark:text-emerald-100
                       font-semibold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-emerald-900/30
                       transition-colors text-sm disabled:opacity-50
                       flex items-center justify-center gap-2"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Save as Draft"
            )}
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={isPending}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700
                       text-white font-semibold py-3 rounded-xl
                       transition-colors text-sm disabled:opacity-50
                       flex items-center justify-center gap-2"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              " Submit for Review"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}