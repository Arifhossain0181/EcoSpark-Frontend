import { Star } from "lucide-react";

export function starRating({
    value ,onChange,readonly=false
}: {
    value: number;
    onChange: (value: number) => void;
    readonly?: boolean;
}){
    return (
         
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star)}
          disabled={readonly}
          className={`text-lg transition-transform ${
            !readonly ? "hover:scale-125 cursor-pointer" : "cursor-default"
          }`}
        >
          <Star
            className={`w-5 h-5 ${
              star <= value
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
      {!readonly && (
        <span className="ml-2 text-sm text-gray-500 self-center font-medium">
          {value}/10
        </span>
      )}
    </div>
  );
    
}