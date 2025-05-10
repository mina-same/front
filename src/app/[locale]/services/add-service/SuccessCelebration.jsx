import { motion } from "framer-motion";
import { Check } from "lucide-react";

export const SuccessCelebration = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
    >
      <motion.div
        initial={{ y: 100, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="bg-white rounded-lg p-8 text-center space-y-4 max-w-md mx-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
          className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center"
        >
          <Check className="w-10 h-10 text-green-600" />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-3xl font-bold text-green-600"
        >
          Success!
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-muted-foreground text-lg"
        >
          Your service has been submitted successfully.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="pt-2"
        >
          <p className="text-sm text-gray-500">Redirecting to home page...</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
