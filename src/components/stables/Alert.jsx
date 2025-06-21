import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, X } from "lucide-react";

const Alert = ({ message, isVisible, onClose, type }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-auto"
      >
        <div
          className={`bg-white shadow-xl rounded-lg p-4 flex items-start ${type === "success" ? "border-l-4 border-green-500" : "border-l-4 border-red-500"}`}
        >
          {type === "success" ? (
            <CheckCircle className="text-green-500 mr-3" size={24} />
          ) : (
            <AlertTriangle className="text-red-500 mr-3" size={24} />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Close alert"
          >
            <X size={20} />
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default Alert; 