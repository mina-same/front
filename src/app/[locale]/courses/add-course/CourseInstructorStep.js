"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";

// Mock instructors - in a real app, these would come from Sanity
const mockInstructors = [
  { _id: "instructor1", name: "Ahmad Al-Farsi", specialization: "Horse Training" },
  { _id: "instructor2", name: "Fatima Khalid", specialization: "Equine Health" },
  { _id: "instructor3", name: "Mohammed Ibrahim", specialization: "Stable Management" },
  { _id: "instructor4", name: "Sarah Al-Qahtani", specialization: "Nutrition Expert" },
];

export default function CourseInstructorStep({ formData, setFormData }) {
  const [instructors, setInstructors] = useState(mockInstructors);
  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Filter instructors based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = mockInstructors.filter((instructor) =>
        instructor.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setInstructors(filtered);
    } else {
      setInstructors(mockInstructors);
    }
  }, [searchTerm]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
        <User className="text-yellow-500 mr-2" size={28} />
        Instructor Details
      </h2>
      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-6">
        <p className="text-yellow-800 font-medium">
          Select the instructor who will be teaching this course.
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Search Instructors
        </label>
        <input
          type="text"
          className="w-full p-3 border border-gray-300 rounded-md"
          placeholder="Search by instructor name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Select Instructor
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {instructors.map((instructor) => (
            <div
              key={instructor._id}
              onClick={() =>
                handleInputChange({
                  target: { name: "instructor", value: instructor._id },
                })
              }
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                formData.instructor === instructor._id
                  ? "border-yellow-500 bg-yellow-50"
                  : "border-gray-200 hover:border-yellow-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-medium">{instructor.name}</h3>
                  <p className="text-sm text-gray-500">{instructor.specialization}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {instructors.length === 0 && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-center text-gray-500 mt-2">
            No instructors found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}