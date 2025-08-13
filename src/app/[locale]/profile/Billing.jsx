import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CreditCard, MapPin, Info, Edit, Trash2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function BillingPage() {
  const { t, i18n } = useTranslation('profile');
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const isRTL = (i18n?.language || '').startsWith('ar');

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={`w-full max-w-5xl mx-auto p-4 ${isRTL ? 'text-right' : ''}`}>
      <h1 className="text-3xl font-bold mb-8">{t('profile:billing_title')}</h1>

      {/* Payment methods */}
      <section className="bg-white rounded-xl shadow mb-8 p-6">
        <div className="flex items-center mb-6">
          <CreditCard className={`text-blue-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
          <h2 className="text-xl font-semibold">{t('profile:payment_methods_title')}</h2>
        </div>

        <div className={`bg-red-50 ${isRTL ? 'border-r-4' : 'border-l-4'} border-red-500 p-4 flex items-start mb-6 rounded-xl`}>
          <AlertCircle className={`text-red-500 ${isRTL ? 'ml-2' : 'mr-2'} flex-shrink-0`} />
          <p className="text-red-800">{t('profile:card_expired_alert')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Payment method (primary) */}
          <div className="border border-[#e3e9ef] rounded-xl p-4">
            <div className="flex items-center pb-2 mb-2">
              <h3 className="font-semibold truncate">Isabella Bocouse</h3>
              <span className={`bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-xl ${isRTL ? 'mr-3' : 'ml-3'}`}>{t('profile:primary_label')}</span>
              <div className={`${isRTL ? 'mr-auto' : 'ml-auto'} flex`}>
                <button className="p-1 hover:text-blue-600" aria-label={t('profile:edit_label')}>
                  <Edit size={18} />
                </button>
                <button className={`p-1 hover:text-red-600 ${isRTL ? 'mr-2' : 'ml-2'}`} aria-label={t('profile:delete_label')}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <div className={`w-10 h-8 ${isRTL ? 'ml-2' : 'mr-2'} flex-shrink-0`}>
                <svg viewBox="0 0 52 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="..." fill="#2566AF"></path>
                  <path d="..." fill="#E6A540"></path>
                </svg>
              </div>
              <div className="text-sm">
                <div className="font-medium">{t('profile:visa_label')}</div>
                <div className="text-gray-500">{t('profile:debit_expires')}</div>
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="border border-[#e3e9ef] rounded-xl p-4">
            <div className="flex items-center pb-2 mb-2">
              <h3 className="font-semibold truncate">Isabella Bocouse</h3>
              <div className={`${isRTL ? 'mr-auto' : 'ml-auto'} flex`}>
                <button className="p-1 hover:text-blue-600" aria-label={t('profile:edit_label')}>
                  <Edit size={18} />
                </button>
                <button className={`p-1 hover:text-red-600 ${isRTL ? 'mr-2' : 'ml-2'}`} aria-label={t('profile:delete_label')}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <div className={`w-10 h-8 ${isRTL ? 'ml-2' : 'mr-2'} flex-shrink-0`}>
                <svg viewBox="0 0 52 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="..." fill="#FF5F00"></path>
                  <path d="..." fill="#EB001B"></path>
                  <path d="..." fill="#F79E1B"></path>
                </svg>
              </div>
              <div className="text-sm">
                <div className="font-medium">{t('profile:mastercard_label')}</div>
                <div className="text-gray-500">{t('profile:checking_expires')}</div>
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="border border-[#e3e9ef] rounded-xl p-4">
            <div className="flex items-center pb-2 mb-2">
              <h3 className="font-semibold truncate">Isabella Bocouse</h3>
              <div className={`${isRTL ? 'mr-auto' : 'ml-auto'} flex`}>
                <button className="p-1 hover:text-blue-600" aria-label={t('profile:edit_label')}>
                  <Edit size={18} />
                </button>
                <button className={`p-1 hover:text-red-600 ${isRTL ? 'mr-2' : 'ml-2'}`} aria-label={t('profile:delete_label')}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <div className={`w-10 h-8 ${isRTL ? 'ml-2' : 'mr-2'} flex-shrink-0`}>
                <svg width="52" height="42" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 42">
                  <path fill="#03a9f4" d="..."></path>
                  <path fill="#283593" d="..."></path>
                </svg>
              </div>
              <div className="text-sm">
                <div className="font-medium">{t('profile:electronic_payment_label')}</div>
                <div className="text-gray-500">{t('profile:email_example')}</div>
              </div>
            </div>
          </div>

          {/* Add payment method */}
          <div 
            className="border border-[#e3e9ef] rounded-xl border-dashed p-4 flex items-center justify-center cursor-pointer hover:bg-gray-50"
            onClick={() => setShowAddCardModal(true)}
          >
            <div className="flex items-center font-semibold text-blue-600">
              <PlusCircle className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('profile:add_payment_method')}
            </div>
          </div>
        </div>
      </section>

      {/* Billing address */}
      <section className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center mb-6">
          <MapPin className={`text-blue-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
          <h2 className="text-xl font-semibold">{t('profile:billing_address_title')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Address (primary) */}
          <div className="border border-[#e3e9ef] rounded-xl p-4">
            <div className="flex items-center pb-2 mb-2">
              <h3 className="font-semibold truncate">{t('profile:address_1_label')}</h3>
              <span className={`bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-xl ${isRTL ? 'mr-3' : 'ml-3'}`}>{t('profile:primary_label')}</span>
              <div className={`${isRTL ? 'mr-auto' : 'ml-auto'} flex`}>
                <button className="p-1 hover:text-blue-600" aria-label={t('profile:edit_label')}>
                  <Edit size={18} />
                </button>
                <button className={`p-1 hover:text-red-600 ${isRTL ? 'mr-2' : 'ml-2'}`} aria-label={t('profile:delete_label')}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: t('profile:address_1_details') }} />
          </div>

          {/* Address */}
          <div className="border border-[#e3e9ef] rounded-xl p-4">
            <div className="flex items-center pb-2 mb-2">
              <h3 className="font-semibold truncate">{t('profile:address_2_label')}</h3>
              <div className={`${isRTL ? 'mr-auto' : 'ml-auto'} flex`}>
                <button className="p-1 hover:text-blue-600" aria-label={t('profile:edit_label')}>
                  <Edit size={18} />
                </button>
                <button className={`p-1 hover:text-red-600 ${isRTL ? 'mr-2' : 'ml-2'}`} aria-label={t('profile:delete_label')}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: t('profile:address_2_details') }} />
          </div>

          {/* Add address */}
          <div 
            className="border border-[#e3e9ef] border-dashed rounded-xl p-4 flex items-center justify-center cursor-pointer hover:bg-gray-50 min-h-40"
            onClick={() => setShowAddAddressModal(true)}
          >
            <Button className="flex items-center font-semibold text-blue-600 bg-gray-200 hover:bg-gray-300 rounded-xl">
              <PlusCircle className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('profile:add_address_button')}
            </Button>
          </div>
        </div>

        {/* Tax location */}
        <div className="py-6 mt-4">
          <h3 className="font-semibold mb-1">{t('profile:tax_location_title')}</h3>
          <p className="text-gray-700">{t('profile:tax_location_details')}</p>
        </div>

        <div className="bg-[#ecf2fa] border border-[#3972b6] p-4 flex items-start rounded-xl">
          <Info className={`text-[#3972b6] ${isRTL ? 'ml-2' : 'mr-2'} flex-shrink-0`} />
          <p className="text-[#3972b6]" dangerouslySetInnerHTML={{ __html: t('profile:tax_location_info') }} />
        </div>
      </section>

      {/* Add Card Modal */}
      {showAddCardModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">{t('profile:add_card_modal_title')}</h3>
            <form>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('profile:card_holder_label')}</label>
                <Input type="text" className="w-full border rounded-xl p-2" placeholder={t('profile:card_holder_placeholder')} />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('profile:card_number_label')}</label>
                <Input type="text" className="w-full border rounded-xl p-2" placeholder={t('profile:card_number_placeholder')} />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-gray-700 mb-2">{t('profile:expiry_date_label')}</label>
                  <Input type="text" className="w-full border rounded-xl p-2" placeholder={t('profile:expiry_date_placeholder')} />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">{t('profile:cvc_label')}</label>
                  <Input type="text" className="w-full border rounded-xl p-2" placeholder={t('profile:cvc_placeholder')} />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
                  onClick={() => setShowAddCardModal(false)}
                >
                  {t('profile:cancel_button')}
                </Button>
                <Button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  {t('profile:add_card_button')}
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
            <h3 className="text-xl font-semibold mb-4">{t('profile:add_address_modal_title')}</h3>
            <form>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('profile:address_name_label')}</label>
                <Input type="text" className="w-full border rounded-xl p-2" placeholder={t('profile:address_name_placeholder')} />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('profile:street_address_label')}</label>
                <Input type="text" className="w-full border rounded-xl p-2" placeholder={t('profile:street_address_placeholder')} />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('profile:city_label')}</label>
                <Input type="text" className="w-full border rounded-xl p-2" placeholder={t('profile:city_placeholder')} />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">{t('profile:state_label')}</label>
                  <Input type="text" className="w-full border rounded-xl p-2" placeholder={t('profile:state_placeholder')} />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">{t('profile:postal_code_label')}</label>
                  <Input type="text" className="w-full border rounded-xl p-2" placeholder={t('profile:postal_code_placeholder')} />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">{t('profile:country_label')}</label>
                <select className="w-full border rounded-xl p-2">
                  <option>{t('profile:country_option_usa')}</option>
                  <option>{t('profile:country_option_canada')}</option>
                  <option>{t('profile:country_option_uk')}</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
                  onClick={() => setShowAddAddressModal(false)}
                >
                  {t('profile:cancel_button')}
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  {t('profile:add_address_button')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}