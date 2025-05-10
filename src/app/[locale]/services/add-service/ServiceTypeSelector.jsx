import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const ServiceTypeSelector = ({ selectedType, onSelect }) => {
  const serviceTypes = [
    {
      id: "horse_stable",
      name: "Horse Stable", 
      description: "Manage and run horse stables",
      icon: "🏢"
    },
    {
      id: "veterinary",
      name: "Veterinary Services",
      description: "Medical care for horses",
      icon: "⚕️"
    },
    {
      id: "competitions",
      name: "Horse Competitions",
      description: "Organize and manage horse competitions", 
      icon: "🏆"
    },
    {
      id: "housing",
      name: "Horse Housing",
      description: "Accommodation services for horses",
      icon: "🏠"
    },
    {
      id: "horse_trainer",
      name: "Horse Trainer",
      description: "Training and development services",
      icon: "🔄"
    },
    {
      id: "hoof_trimmer",
      name: "Hoof Trimmer",
      description: "Specialized hoof care services",
      icon: "✂️"
    },
    {
      id: "horse_grooming",
      name: "Horse Grooming",
      description: "Appearance and hygiene services",
      icon: "🧼"
    },
    {
      id: "event_judging",
      name: "Event Judging",
      description: "Professional judging for equestrian events",
      icon: "⚖️"
    },
    {
      id: "marketing_promotion",
      name: "Marketing & Promotion",
      description: "Marketing services for equestrian businesses",
      icon: "📣"
    },
    {
      id: "event_commentary",
      name: "Event Commentary",
      description: "Professional commentary for events",
      icon: "🎙️"
    },
    {
      id: "consulting_services",
      name: "Consulting Services",
      description: "Professional advice and consulting",
      icon: "💼"
    },
    {
      id: "photography_services",
      name: "Photography Services",
      description: "Professional equestrian photography",
      icon: "📸"
    },
    {
      id: "horse_transport",
      name: "Horse Transport",
      description: "Safe and reliable horse transportation",
      icon: "🚚"
    },
    {
      id: "contractors",
      name: "Contractors",
      description: "Specialized construction and maintenance",
      icon: "🏗️"
    },
    {
      id: "horse_catering",
      name: "Horse Catering",
      description: "Food services for horses and events",
      icon: "🍽️"
    },
    {
      id: "trip_coordinator",
      name: "Trip Coordinator",
      description: "Organize and coordinate horse trips",
      icon: "🧭"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {serviceTypes.map((type) => (
        <motion.div
          key={type.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(type.id)}
          className={cn(
            "cursor-pointer p-4 rounded-lg border transition-all",
            "hover:shadow-lg hover:border-primary",
            selectedType === type.id
              ? "border-primary bg-primary/5 shadow-md"
              : "border-border hover:border-primary"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">{type.icon}</div>
            <div>
              <h3 className="font-semibold">{type.name}</h3>
              <p className="text-sm text-muted-foreground">{type.description}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
