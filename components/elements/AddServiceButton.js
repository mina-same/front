"use clinet";
// components/AddServiceButton.jsx
import { useState } from 'react';
import { Plus } from 'lucide-react';
import ServiceFormPopup from './ServiceFormPopup';

const AddServiceButton = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleSubmitForm = async (formData) => {
    // Here you would typically send the data to your backend
    console.log('Submitting form data:', formData);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  };

  return (
    <>
      <button
        onClick={handleOpenForm}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        <Plus size={20} className="mr-2" />
        Add Service
      </button>

      <ServiceFormPopup 
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
      />
    </>
  );
};

export default AddServiceButton;