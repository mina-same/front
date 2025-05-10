import { ArrowLeft, Home, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "../../src/components/ui/button";
import { motion } from "framer-motion";

const ResourceNotFound = ({ type }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="max-w-lg w-full text-center">
        <motion.img 
          src="/lovable-uploads/7baed824-fcad-49cd-9ed3-7169a5f05966.png"
          alt="404 Horse"
          className="w-full max-w-md mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {type === "book" ? "Book Not Found" : "Course Not Found"}
          </h2>
          <p className="text-gray-600 mb-8">
            The {type} you're looking for might have been removed, renamed, or is temporarily unavailable.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button variant="default" size="lg">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            
            <Link to={type === "book" ? "/books" : "/courses"}>
              <Button variant="outline" size="lg">
                <BookOpen className="mr-2 h-4 w-4" />
                Browse {type === "book" ? "Books" : "Courses"}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResourceNotFound;
