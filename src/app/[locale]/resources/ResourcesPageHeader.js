import { BookOpen, Book, GraduationCap } from "lucide-react";

export default function ResourcesPageHeader({ activeTab }) {
  return (
    <div className="relative">
      <div className="bg-[#d4af37] h-64">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80')",
          }}
        />
        <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white pt-8">
          <GraduationCap className="w-12 h-12 mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Equine {activeTab === "courses" ? "Courses" : "Books"} Library
          </h1>
          <p className="text-lg md:text-xl max-w-2xl text-[#f5e6b8]">
            {activeTab === "courses"
              ? "Discover expert-led courses to enhance your equine knowledge and skills"
              : "Explore our collection of specialized equine literature and resources"}
          </p>
        </div>
        {/* Curved bottom edge */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 bg-gray-50"
          style={{
            borderTopLeftRadius: "50% 100%",
            borderTopRightRadius: "50% 100%",
            transform: "scaleX(1.5)",
          }}
        />
      </div>
    </div>
  );
}