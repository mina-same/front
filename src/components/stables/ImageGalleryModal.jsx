import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const ImageGalleryModal = ({
  selectedIndex,
  images,
  onClose,
  onNext,
  onPrev,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
    onClick={onClose}
  >
    <div
      className="relative max-w-6xl w-full px-6"
      onClick={(e) => e.stopPropagation()}
    >
      <motion.img
        key={selectedIndex}
        initial={{ opacity: 0.5, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0.5, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        src={images[selectedIndex]}
        alt="Gallery image"
        className="w-full h-auto max-h-[80vh] object-contain"
      />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
        aria-label="Close gallery"
      >
        <X size={24} />
      </button>
      <button
        onClick={onPrev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all"
        aria-label="Previous image"
        disabled={selectedIndex === 0}
      >
        <ChevronLeft size={28} />
      </button>
      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all"
        aria-label="Next image"
        disabled={selectedIndex === images.length - 1}
      >
        <ChevronRight size={28} />
      </button>
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-2.5 h-2.5 rounded-full ${selectedIndex === index ? "bg-white" : "bg-white bg-opacity-40"}`}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

export default ImageGalleryModal; 