import React, { useState } from 'react';
import { AlertCircle, CreditCard, MapPin, Info, Edit, Trash2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function BillingPage() {
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Billing</h1>

      {/* Payment methods */}
      <section className="bg-white rounded-xl shadow mb-8 p-6">
        <div className="flex items-center mb-6">
          <CreditCard className="text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold">Payment methods</h2>
        </div>

        <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-start mb-6 rounded-xl">
          <AlertCircle className="text-red-500 mr-2 flex-shrink-0" />
          <p className="text-red-800">Your primary credit card expired on 01/04/2023. Please add a new card or update this one.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Payment method (primary) */}
          <div className="border border-[#e3e9ef] rounded-xl p-4">
            <div className="flex items-center pb-2 mb-2">
              <h3 className="font-semibold truncate">Isabella Bocouse</h3>
              <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-xl ml-3">Primary</span>
              <div className="ml-auto flex">
                <button className="p-1 hover:text-blue-600" aria-label="Edit">
                  <Edit size={18} />
                </button>
                <button className="p-1 hover:text-red-600 ml-2" aria-label="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-8 mr-2 flex-shrink-0">
                <svg viewBox="0 0 52 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.6402 28.2865H18.5199L21.095 12.7244H25.2157L22.6402 28.2865ZM15.0536 12.7244L11.1255 23.4281L10.6607 21.1232L10.6611 21.124L9.27467 14.1256C9.27467 14.1256 9.10703 12.7244 7.32014 12.7244H0.8262L0.75 12.9879C0.75 12.9879 2.73586 13.3942 5.05996 14.7666L8.63967 28.2869H12.9327L19.488 12.7244H15.0536ZM47.4619 28.2865H51.2453L47.9466 12.7239H44.6345C43.105 12.7239 42.7324 13.8837 42.7324 13.8837L36.5873 28.2865H40.8825L41.7414 25.9749H46.9793L47.4619 28.2865ZM42.928 22.7817L45.093 16.9579L46.3109 22.7817H42.928ZM36.9095 16.4667L37.4975 13.1248C37.4975 13.1248 35.6831 12.4463 33.7916 12.4463C31.7469 12.4463 26.8913 13.3251 26.8913 17.5982C26.8913 21.6186 32.5902 21.6685 32.5902 23.7803C32.5902 25.8921 27.4785 25.5137 25.7915 24.182L25.1789 27.6763C25.1789 27.6763 27.0187 28.555 29.8296 28.555C32.6414 28.555 36.8832 27.1234 36.8832 23.2271C36.8832 19.1808 31.1331 18.8041 31.1331 17.0449C31.1335 15.2853 35.1463 15.5113 36.9095 16.4667Z" fill="#2566AF"></path>
                  <path d="M10.6611 22.1235L9.2747 15.1251C9.2747 15.1251 9.10705 13.7239 7.32016 13.7239H0.8262L0.75 13.9874C0.75 13.9874 3.87125 14.6235 6.86507 17.0066C9.72766 19.2845 10.6611 22.1235 10.6611 22.1235Z" fill="#E6A540"></path>
                </svg>
              </div>
              <div className="text-sm">
                <div className="font-medium">Visa •••• 9016</div>
                <div className="text-gray-500">Debit - Expires 03/24</div>
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="border border-[#e3e9ef] rounded-xl p-4">
            <div className="flex items-center pb-2 mb-2">
              <h3 className="font-semibold truncate">Isabella Bocouse</h3>
              <div className="ml-auto flex">
                <button className="p-1 hover:text-blue-600" aria-label="Edit">
                  <Edit size={18} />
                </button>
                <button className="p-1 hover:text-red-600 ml-2" aria-label="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-8 mr-2 flex-shrink-0">
                <svg viewBox="0 0 52 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M31.4109 30.6159H20.5938V10.7068H31.4111L31.4109 30.6159Z" fill="#FF5F00"></path>
                  <path d="M21.28 20.6617C21.28 16.6232 23.1264 13.0256 26.0016 10.7072C23.8252 8.94968 21.1334 7.99582 18.3618 8.00001C11.5344 8.00001 6 13.6688 6 20.6617C6 27.6547 11.5344 33.3235 18.3618 33.3235C21.1334 33.3277 23.8254 32.3738 26.0018 30.6163C23.1268 28.2983 21.28 24.7005 21.28 20.6617Z" fill="#EB001B"></path>
                  <path d="M46.0028 20.6617C46.0028 27.6547 40.4684 33.3235 33.641 33.3235C30.8691 33.3276 28.1768 32.3738 26 30.6163C28.876 28.2979 30.7224 24.7005 30.7224 20.6617C30.7224 16.623 28.876 13.0256 26 10.7072C28.1768 8.94974 30.8689 7.99589 33.6408 8.00001C40.4682 8.00001 46.0026 13.6688 46.0026 20.6617" fill="#F79E1B"></path>
                </svg>
              </div>
              <div className="text-sm">
                <div className="font-medium">MasterCard •••• 4242</div>
                <div className="text-gray-500">Checking - Expires 01/25</div>
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="border border-[#e3e9ef] rounded-xl p-4">
            <div className="flex items-center pb-2 mb-2">
              <h3 className="font-semibold truncate">Isabella Bocouse</h3>
              <div className="ml-auto flex">
                <button className="p-1 hover:text-blue-600" aria-label="Edit">
                  <Edit size={18} />
                </button>
                <button className="p-1 hover:text-red-600 ml-2" aria-label="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-8 mr-2 flex-shrink-0">
                <svg width="52" height="42" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 42">
                  <path fill="#03a9f4" d="M37.3,11.8c-0.2-0.1-0.5-0.1-0.7,0c-0.2,0.1-0.4,0.3-0.4,0.6c0,0.2-0.1,0.5-0.1,0.7c-1.4,6.3-4.2,9.4-8.5,9.4h-6.4c-0.3,0-0.6,0.2-0.7,0.6l-2.1,10L18,35.5c-0.2,1.2,0.5,2.3,1.7,2.5c0.1,0,0.3,0,0.4,0h4.3c1,0,1.8-0.7,2.1-1.6l1.7-6.9h3.7c4.4,0,7.4-3.5,8.5-9.8l0,0C41.1,16.7,39.9,13.5,37.3,11.8z"></path>
                  <path fill="#283593" d="M36,6.5c-1.4-1.6-3.4-2.5-5.5-2.5H18.6c-1.8,0-3.3,1.3-3.5,3l-3.7,24.4c-0.2,1.2,0.6,2.3,1.8,2.4c0.1,0,0.2,0,0.3,0H19c0.3,0,0.6-0.2,0.7-0.6l2-9.4h5.8c5.1,0,8.4-3.5,9.9-10.5c0.1-0.3,0.1-0.6,0.1-0.8C38,10.3,37.4,8.1,36,6.5z"></path>
                </svg>
              </div>
              <div className="text-sm">
                <div className="font-medium">Electronic payment system</div>
                <div className="text-gray-500">bocouse@example.com</div>
              </div>
            </div>
          </div>

          {/* Add payment method */}
          <div 
            className="border border-[#e3e9ef] rounded-xl border-dashed p-4 flex items-center justify-center cursor-pointer hover:bg-gray-50"
            onClick={() => setShowAddCardModal(true)}
          >
            <div className="flex items-center font-semibold text-blue-600">
              <PlusCircle className="mr-2" />
              Add new payment methods
            </div>
          </div>
        </div>
      </section>

      {/* Billing address */}
      <section className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center mb-6">
          <MapPin className="text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold">Billing address</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Address (primary) */}
          <div className="border border-[#e3e9ef] rounded-xl p-4">
            <div className="flex items-center pb-2 mb-2">
              <h3 className="font-semibold truncate">Billing address #1</h3>
              <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-xl ml-3">Primary</span>
              <div className="ml-auto flex">
                <button className="p-1 hover:text-blue-600" aria-label="Edit">
                  <Edit size={18} />
                </button>
                <button className="p-1 hover:text-red-600 ml-2" aria-label="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <p className="text-gray-700">
              314 Robinson Lane,<br />
              Wilmington, DE 19805,<br />
              USA
            </p>
          </div>

          {/* Address */}
          <div className="border border-[#e3e9ef] rounded-xl p-4">
            <div className="flex items-center pb-2 mb-2">
              <h3 className="font-semibold truncate">Billing address #2</h3>
              <div className="ml-auto flex">
                <button className="p-1 hover:text-blue-600" aria-label="Edit">
                  <Edit size={18} />
                </button>
                <button className="p-1 hover:text-red-600 ml-2" aria-label="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <p className="text-gray-700">
              401 Magnetic Drive Unit 2,<br />
              Toronto, Ontario, M3J 3H9<br />
              Canada
            </p>
          </div>

          {/* Add address */}
          <div 
            className="border border-[#e3e9ef] border-dashed rounded-xl p-4 flex items-center justify-center cursor-pointer hover:bg-gray-50 min-h-40"
            onClick={() => setShowAddAddressModal(true)}
          >
            <Button className="flex items-center font-semibold text-blue-600 bg-gray-200 hover:bg-gray-300 rounded-xl">
              <PlusCircle className="mr-2" />
              Add new address
            </Button>
          </div>
        </div>

        {/* Tax location */}
        <div className="py-6 mt-4">
          <h3 className="font-semibold mb-1">Tax location</h3>
          <p className="text-gray-700">United States - 10% VAT</p>
        </div>

        <div className="bg-[#ecf2fa] border border-[#3972b6] p-4 flex items-start rounded-xl">
          <Info className="text-[#3972b6] mr-2 flex-shrink-0" />
          <p className="text-[#3972b6]">
            Your text location determines the taxes that are applied to your bill. 
            <a href="#" className="font-semibold ml-1 hover:underline">Learn more</a>
          </p>
        </div>
      </section>

      {/* Add Card Modal */}
      {showAddCardModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Add new payment method</h3>
            <form>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Card holder name</label>
                <Input type="text" className="w-full border rounded-xl p-2" placeholder="Name on card" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Card number</label>
                <Input type="text" className="w-full border rounded-xl p-2" placeholder="0000 0000 0000 0000" />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-gray-700 mb-2">Expiry date</label>
                  <Input type="text" className="w-full border rounded-xl p-2" placeholder="MM/YY" />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">CVC</label>
                  <Input type="text" className="w-full border rounded-xl p-2" placeholder="000" />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
                  onClick={() => setShowAddCardModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  Add card
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Add new address</h3>
            <form>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Address name</label>
                <Input type="text" className="w-full border rounded-xl p-2" placeholder="Home, Work, etc." />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Street address</label>
                <Input type="text" className="w-full border rounded-xl p-2" placeholder="Street address" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">City</label>
                <Input type="text" className="w-full border rounded-xl p-2" placeholder="City" />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">State/Province</label>
                  <Input type="text" className="w-full border rounded-xl p-2" placeholder="State" />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Postal code</label>
                  <Input type="text" className="w-full border rounded-xl p-2" placeholder="Postal code" />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Country</label>
                <select className="w-full border rounded-xl p-2">
                  <option>United States</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
                  onClick={() => setShowAddAddressModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  Add address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}