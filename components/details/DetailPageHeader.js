import { Star } from "lucide-react";

export default function DetailPageHeader({ title, subtitle, rating, ratingCount, imageUrl }) {
  return (
    <div className="relative">
      <div className="h-[400px] w-full">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-gray-900/20" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{title}</h1>
          {subtitle && <p className="text-xl text-gray-200 mb-4">{subtitle}</p>}
          {typeof rating === "number" && (
            <div className="flex items-center gap-2">
              <div className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}`}
                    />
                  ))}
                  <span className="text-white ml-2">
                    {rating.toFixed(1)} ({ratingCount || 0})
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}