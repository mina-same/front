import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { motion } from "framer-motion";

const FormNavigation = ({ 
  currentStep, 
  totalSteps, 
  nextStep, 
  prevStep, 
  isLastStep,
  isSubmitting
}) => {
  return (
    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
      {currentStep > 1 ? (
        <motion.button
          type="button"
          onClick={prevStep}
          className="flex items-center justify-center px-6 py-2.5 border-2 border-black/10 text-black font-medium rounded-xl transition-all duration-300 hover:border-black hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black/20"
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </motion.button>
      ) : (
        <div></div>
      )}
      
      <motion.button
        type={isLastStep ? "submit" : "button"}
        onClick={isLastStep ? undefined : nextStep}
        className={`flex items-center justify-center px-8 py-2.5 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 ${
          isLastStep 
            ? 'bg-gold text-white hover:bg-gold/90 focus:ring-gold/30' 
            : 'bg-black text-white hover:bg-black/90 focus:ring-black/30'
        }`}
        whileHover={{ x: isLastStep ? 0 : 5 }}
        whileTap={{ scale: 0.98 }}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {isLastStep ? "Submitting..." : "Please wait..."}
          </span>
        ) : isLastStep ? (
          <>
            Submit
            <Send className="w-4 h-4 ml-2" />
          </>
        ) : (
          <>
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </motion.button>
    </div>
  );
};

export default FormNavigation;
