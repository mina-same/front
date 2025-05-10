import React from 'react';
import { Label } from "@/components/ui/label";
import { ScrollArea } from '@/components/ui/scroll-area';

const SuppliersFields = ({
  formData,
  handleNestedChange,
  handleNestedArrayChange,
  addNestedArrayItem,
  removeNestedArrayItem,
  errors,
  isRTL = false,
}) => {
  // Make sure we're working with a properly initialized suppliers object
  React.useEffect(() => {
    if (!formData.service_details.suppliers) {
      handleNestedChange('suppliers', '', {});
    }
  }, []);

  const supplierDetails = formData.service_details.suppliers || {};
  const products = supplierDetails.products || [];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium mb-4">Supplier Information</h3>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-3">Products</h4>
            <ScrollArea className="h-auto max-h-[300px] pr-4">
              {products.length > 0 ? (
                <div className="space-y-4">
                  {products.map((product, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="relative">
                        <Label className="absolute -top-2.5 left-4 bg-white px-2 text-xs font-medium text-black rounded-md">
                          Product Name (Arabic)
                        </Label>
                        <input
                          type="text"
                          value={product.name_ar || ''}
                          onChange={(e) => handleNestedArrayChange('suppliers.products', index, 'name_ar', e.target.value)}
                          className="w-full p-4 rounded-xl border border-gray-200 hover:border-gray-300 focus:border-gold focus:outline-none"
                          dir={isRTL ? "rtl" : "ltr"}
                        />
                      </div>
                      
                      <div className="relative">
                        <Label className="absolute -top-2.5 left-4 bg-white px-2 text-xs font-medium text-black rounded-md">
                          Product Name (English)
                        </Label>
                        <input
                          type="text"
                          value={product.name_en || ''}
                          onChange={(e) => handleNestedArrayChange('suppliers.products', index, 'name_en', e.target.value)}
                          className="w-full p-4 rounded-xl border border-gray-200 hover:border-gray-300 focus:border-gold focus:outline-none"
                        />
                      </div>
                      
                      <div className="relative">
                        <Label className="absolute -top-2.5 left-4 bg-white px-2 text-xs font-medium text-black rounded-md">
                          Price
                        </Label>
                        <input
                          type="number"
                          min="0"
                          value={product.price || ''}
                          onChange={(e) => handleNestedArrayChange('suppliers.products', index, 'price', e.target.value)}
                          className="w-full p-4 rounded-xl border border-gray-200 hover:border-gray-300 focus:border-gold focus:outline-none"
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removeNestedArrayItem('suppliers.products', index)}
                        className="md:col-span-3 text-sm text-red-500 hover:text-red-700 mt-2"
                      >
                        Remove Product
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No products added yet. Add your first product below.</p>
              )}
            </ScrollArea>
            
            <button
              type="button"
              onClick={() => addNestedArrayItem('suppliers.products')}
              className="mt-4 px-4 py-2 bg-gold/10 text-gold hover:bg-gold/20 rounded-lg text-sm font-medium transition-colors"
            >
              + Add Product
            </button>
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-3">Certifications</h4>
            <div className="mt-2 p-4 border border-dashed border-gray-300 rounded-xl text-center">
              <input
                type="file"
                id="certifications"
                name="certifications"
                onChange={(e) => {
                  if (e.target.files) {
                    handleNestedChange('suppliers', 'certifications', e.target.files);
                  }
                }}
                accept=".pdf, .doc, .docx, .jpg, .jpeg, .png, .gif"
                className="hidden"
                multiple
              />
              <label
                htmlFor="certifications"
                className="cursor-pointer block p-6 text-center"
              >
                <div className="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="mt-2 text-sm font-medium text-gray-900">Upload Certifications</span>
                  <span className="mt-1 text-xs text-gray-500">
                    PDF, DOC, DOCX, JPG, JPEG, PNG, or GIF files
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuppliersFields;