import {
    Check, X, FileText, DollarSign, Clock, Star, Info, ArrowLeft, ArrowRight, Upload,
    Home, Stethoscope, Trophy, Building, Map, Utensils, Truck, HardHat, Package, Dumbbell, Scissors, Plus, Trash, Book, Library, Gavel, Briefcase, Megaphone, Mic, Camera
} from 'lucide-react';

export const renderServiceTypeFields = ({ formData, handleNestedChange, handleNestedArrayChange, addNestedArrayItem, removeNestedArrayItem, handleChange, errors, t }) => {
    switch (formData.serviceType) {
        case 'horse_stable':
            return (
                <div className="space-y-6">
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="stableDescription">
                            {t('profile:stableDescription')}*
                        </label>
                        <textarea
                            id="stableDescription"
                            value={formData.horseStableDetails.stableDescription}
                            onChange={(e) => handleNestedChange('horseStableDetails', 'stableDescription', e.target.value)}
                            rows="4"
                            className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.stableDescription ? 'border-red-500' : 'border-gray-200'}`}
                            placeholder={t('profile:stableDescription')}
                        />
                        {errors.stableDescription && <p className="text-red-500 text-sm mt-1 ml-2">{errors.stableDescription}</p>}
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="kindOfStable">
                            {t('profile:kindOfStable')}
                        </label>
                        <select
                            id="kindOfStable"
                            value={formData.horseStableDetails.kindOfStable}
                            onChange={(e) => handleNestedChange('horseStableDetails', 'kindOfStable', e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="">{t('profile:selectKind')}</option>
                            <option value="educational">{t('profile:educational')}</option>
                            <option value="entertainment">{t('profile:entertainment')}</option>
                            <option value="competitions">{t('profile:competitions')}</option>
                            <option value="events">{t('profile:events')}</option>
                        </select>
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="listingPurpose">
                            {t('profile:listingPurpose')}
                        </label>
                        <select
                            id="listingPurpose"
                            value={formData.horseStableDetails.listingPurpose}
                            onChange={(e) => handleNestedChange('horseStableDetails', 'listingPurpose', e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="">{t('profile:selectPurpose')}</option>
                            <option value="for_sale">{t('profile:forSale')}</option>
                            <option value="for_rent">{t('profile:forRent')}</option>
                        </select>
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="dateOfEstablishment">
                            {t('profile:dateOfEstablishment')}
                        </label>
                        <input
                            type="date"
                            id="dateOfEstablishment"
                            value={formData.horseStableDetails.dateOfEstablishment || ''}
                            onChange={(e) => handleNestedChange('horseStableDetails', 'dateOfEstablishment', e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600">
                            {t('profile:additionalBenefits')}
                        </label>
                        <div className="p-4 border-2 border-gray-200 rounded-xl">
                            {formData.horseStableDetails.additionalBenefits.map((benefit, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={benefit.name_ar}
                                        onChange={(e) => handleNestedArrayChange('horseStableDetails', 'additionalBenefits', index, 'name_ar', e.target.value)}
                                        placeholder={t('profile:benefitNameArabic')}
                                        className="w-1/3 p-2 border rounded text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={benefit.name_en}
                                        onChange={(e) => handleNestedArrayChange('horseStableDetails', 'additionalBenefits', index, 'name_en', e.target.value)}
                                        placeholder={t('profile:benefitNameEnglish')}
                                        className="w-1/3 p-2 border rounded text-sm"
                                    />
                                    <input
                                        type="number"
                                        value={benefit.additional_price}
                                        onChange={(e) => handleNestedArrayChange('horseStableDetails', 'additionalBenefits', index, 'additional_price', parseFloat(e.target.value))}
                                        placeholder={t('profile:additionalPrice')}
                                        className="w-1/3 p-2 border rounded text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeNestedArrayItem('horseStableDetails', 'additionalBenefits', index)}
                                        className="p-2 text-red-500 hover:text-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addNestedArrayItem('horseStableDetails', 'additionalBenefits', { name_ar: '', name_en: '', additional_price: 0 })}
                                className="mt-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Plus size={16} /> {t('profile:addBenefit')}
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="licensesAndCertificates">
                            {t('profile:licensesAndCertificates')}
                        </label>
                        <input
                            type="file"
                            id="licensesAndCertificates"
                            name="licensesAndCertificates"
                            onChange={handleChange}
                            multiple
                            className="w-full p-4 border-2 border-gray-200 rounded-xl"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                        />
                    </div>
                </div>
            );

        case 'veterinary':
            return (
                <div className="space-y-6">
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600">
                            {t('profile:specialties')}*
                        </label>
                        <div className="p-4 border-2 border-gray-200 rounded-xl">
                            {['surgery', 'general_medicine', 'dentistry', 'monitoring', 'physical_therapy'].map(specialty => (
                                <div key={specialty} className="flex items-center mb-2">
                                    <input
                                        type="checkbox"
                                        id={`specialty-${specialty}`}
                                        checked={formData.VeterinaryDetails.specialties.includes(specialty)}
                                        onChange={(e) => {
                                            const newSpecialties = e.target.checked
                                                ? [...formData.VeterinaryDetails.specialties, specialty]
                                                : formData.VeterinaryDetails.specialties.filter(s => s !== specialty);
                                            handleNestedChange('VeterinaryDetails', 'specialties', newSpecialties);
                                        }}
                                        className="mr-2"
                                    />
                                    <label htmlFor={`specialty-${specialty}`} className="text-sm">{t(`profile:${specialty}`)}</label>
                                </div>
                            ))}
                        </div>
                        {errors.specialties && <p className="text-red-500 text-sm mt-1 ml-2">{errors.specialties}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="licenseNumber">
                                {t('profile:licenseNumber')}
                            </label>
                            <input
                                type="text"
                                id="licenseNumber"
                                value={formData.VeterinaryDetails.professionalLicense.licenseNumber}
                                onChange={(e) => handleNestedChange('VeterinaryDetails', 'professionalLicense', {
                                    ...formData.VeterinaryDetails.professionalLicense,
                                    licenseNumber: e.target.value,
                                })}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div className="relative">
                            <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="licenseDate">
                                {t('profile:licenseDate')}
                            </label>
                            <input
                                type="date"
                                id="licenseDate"
                                value={formData.VeterinaryDetails.professionalLicense.licenseDate || ''}
                                onChange={(e) => handleNestedChange('VeterinaryDetails', 'professionalLicense', {
                                    ...formData.VeterinaryDetails.professionalLicense,
                                    licenseDate: e.target.value,
                                })}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="graduationOrAccreditationCertificate">
                            {t('profile:graduationOrAccreditationCertificate')}
                        </label>
                        <input
                            type="file"
                            id="graduationOrAccreditationCertificate"
                            name="graduationOrAccreditationCertificate"
                            onChange={handleChange}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                        />
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600">
                            {t('profile:additionalServices')}
                        </label>
                        <div className="p-4 border-2 border-gray-200 rounded-xl">
                            {formData.VeterinaryDetails.additionalServices.map((service, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={service.name_ar}
                                        onChange={(e) => handleNestedArrayChange('VeterinaryDetails', 'additionalServices', index, 'name_ar', e.target.value)}
                                        placeholder={t('profile:serviceNameArabic')}
                                        className="w-1/3 p-2 border rounded text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={service.name_en}
                                        onChange={(e) => handleNestedArrayChange('VeterinaryDetails', 'additionalServices', index, 'name_en', e.target.value)}
                                        placeholder={t('profile:serviceNameEnglish')}
                                        className="w-1/3 p-2 border rounded text-sm"
                                    />
                                    <input
                                        type="number"
                                        value={service.additional_price}
                                        onChange={(e) => handleNestedArrayChange('VeterinaryDetails', 'additionalServices', index, 'additional_price', parseFloat(e.target.value))}
                                        placeholder={t('profile:additionalPrice')}
                                        className="w-1/3 p-2 border rounded text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeNestedArrayItem('VeterinaryDetails', 'additionalServices', index)}
                                        className="p-2 text-red-500 hover:text-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addNestedArrayItem('VeterinaryDetails', 'additionalServices', { name_ar: '', name_en: '', additional_price: 0 })}
                                className="mt-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Plus size={16} /> {t('profile:addService')}
                            </button>
                        </div>
                    </div>
                </div>
            );

        case 'competitions':
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="competitionLevel">
                                {t('profile:competitionLevel')}
                            </label>
                            <select
                                id="competitionLevel"
                                value={formData.competitions.level}
                                onChange={(e) => handleNestedChange('competitions', 'level', e.target.value)}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="">{t('profile:selectLevel')}</option>
                                <option value="Beginner">{t('profile:beginner')}</option>
                                <option value="Intermediate">{t('profile:intermediate')}</option>
                                <option value="Advanced">{t('profile:advanced')}</option>
                            </select>
                        </div>
                        <div className="relative">
                            <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="raceType">
                                {t('profile:raceType')}
                            </label>
                            <select
                                id="raceType"
                                value={formData.competitions.raceType}
                                onChange={(e) => handleNestedChange('competitions', 'raceType', e.target.value)}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="">{t('profile:selectRaceType')}</option>
                                <option value="endurance_race">{t('profile:enduranceRace')}</option>
                                <option value="shooting_arrows">{t('profile:shootingArrows')}</option>
                                <option value="pickup_pegs">{t('profile:pickupPegs')}</option>
                                <option value="dressage">{t('profile:dressage')}</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="heightDistance">
                                {t('profile:heightDistance')}
                            </label>
                            <input
                                type="text"
                                id="heightDistance"
                                value={formData.competitions.heightDistance}
                                onChange={(e) => handleNestedChange('competitions', 'heightDistance', e.target.value)}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div className="relative">
                            <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="organiserName">
                                {t('profile:organiserName')}
                            </label>
                            <input
                                type="text"
                                id="organiserName"
                                value={formData.competitions.organiserName}
                                onChange={(e) => handleNestedChange('competitions', 'organiserName', e.target.value)}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="relative">
                            <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="mainReferee">
                                {t('profile:mainReferee')}
                            </label>
                            <input
                                type="text"
                                id="mainReferee"
                                value={formData.competitions.mainReferee}
                                onChange={(e) => handleNestedChange('competitions', 'mainReferee', e.target.value)}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div className="relative">
                            <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="coReferee1">
                                {t('profile:coReferee1')}
                            </label>
                            <input
                                type="text"
                                id="coReferee1"
                                value={formData.competitions.coReferee1}
                                onChange={(e) => handleNestedChange('competitions', 'coReferee1', e.target.value)}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div className="relative">
                            <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="coReferee2">
                                {t('profile:coReferee2')}
                            </label>
                            <input
                                type="text"
                                id="coReferee2"
                                value={formData.competitions.coReferee2}
                                onChange={(e) => handleNestedChange('competitions', 'coReferee2', e.target.value)}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="prize">
                                {t('profile:prize')}
                            </label>
                            <input
                                type="text"
                                id="prize"
                                value={formData.competitions.prize}
                                onChange={(e) => handleNestedChange('competitions', 'prize', e.target.value)}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div className="relative">
                            <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="sponsor">
                                {t('profile:sponsor')}
                            </label>
                            <input
                                type="text"
                                id="sponsor"
                                value={formData.competitions.sponsor}
                                onChange={(e) => handleNestedChange('competitions', 'sponsor', e.target.value)}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="sponsorLogo">
                            {t('profile:sponsorLogo')}
                        </label>
                        <input
                            type="file"
                            id="sponsorLogo"
                            name="sponsorLogo"
                            onChange={handleChange}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl"
                            accept="image/*"
                        />
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="sponsorshipValue">
                            {t('profile:sponsorshipValue')}
                        </label>
                        <input
                            type="number"
                            id="sponsorshipValue"
                            value={formData.competitions.sponsorshipValue}
                            onChange={(e) => handleNestedChange('competitions', 'sponsorshipValue', parseFloat(e.target.value))}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            min="0"
                        />
                    </div>
                </div>
            );

        case 'housing':
            return (
                <div className="space-y-6">
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="housingDetails">
                            {t('profile:housingDetails')}
                        </label>
                        <textarea
                            id="housingDetails"
                            value={formData.housingDetails.housingDetails}
                            onChange={(e) => handleNestedChange('housingDetails', 'housingDetails', e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder={t('profile:housingDetails')}
                        />
                    </div>
                </div>
            );

        case 'horse_trainer':
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="trainerLevel">
                                {t('profile:trainerLevel')}
                            </label>
                            <select
                                id="trainerLevel"
                                value={formData.horseTrainerDetails.trainerLevel}
                                onChange={(e) => handleNestedChange('horseTrainerDetails', 'trainerLevel', e.target.value)}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="">{t('profile:selectLevel')}</option>
                                <option value="beginner">{t('profile:beginner')}</option>
                                <option value="intermediate">{t('profile:intermediate')}</option>
                                <option value="advanced">{t('profile:advanced')}</option>
                            </select>
                        </div>
                        <div className="relative">
                            <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="specialization">
                                {t('profile:specialization')}
                            </label>
                            <select
                                id="specialization"
                                value={formData.horseTrainerDetails.specialization}
                                onChange={(e) => handleNestedChange('horseTrainerDetails', 'specialization', e.target.value)}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="">{t('profile:selectSpecialization')}</option>
                                <option value="show_jumping">{t('profile:showJumping')}</option>
                                <option value="endurance_racing">{t('profile:enduranceRacing')}</option>
                                <option value="horseback_riding_lessons">{t('profile:horsebackRidingLessons')}</option>
                                <option value="horse_breaking_training">{t('profile:horseBreakingTraining')}</option>
                                <option value="speed_racing">{t('profile:speedRacing')}</option>
                                <option value="cross_country_jumping">{t('profile:crossCountryJumping')}</option>
                            </select>
                        </div>
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="yearsOfExperience">
                            {t('profile:yearsOfExperience')}
                        </label>
                        <input
                            type="number"
                            id="yearsOfExperience"
                            value={formData.horseTrainerDetails.yearsOfExperience}
                            onChange={(e) => handleNestedChange('horseTrainerDetails', 'yearsOfExperience', parseInt(e.target.value))}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            min="0"
                        />
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="qualifications">
                            {t('profile:qualifications')}
                        </label>
                        <textarea
                            id="qualifications"
                            value={formData.horseTrainerDetails.qualifications}
                            onChange={(e) => handleNestedChange('horseTrainerDetails', 'qualifications', e.target.value)}
                            className="w-full p-4 border-2 ‏rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder={t('profile:qualifications')}
                        />
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600">
                            {t('profile:additionalServices')}
                        </label>
                        <div className="p-4 border-2 border-gray-200 rounded-xl">
                            {formData.horseTrainerDetails.additionalServices.map((service, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={service.name_ar}
                                        onChange={(e) => handleNestedArrayChange('horseTrainerDetails', 'additionalServices', index, 'name_ar', e.target.value)}
                                        placeholder={t('profile:serviceNameArabic')}
                                        className="w-1/3 p-2 border rounded text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={service.name_en}
                                        onChange={(e) => handleNestedArrayChange('horseTrainerDetails', 'additionalServices', index, 'name_en', e.target.value)}
                                        placeholder={t('profile:serviceNameEnglish')}
                                        className="w-1/3 p-2 border rounded text-sm"
                                    />
                                    <input
                                        type="number"
                                        value={service.price}
                                        onChange={(e) => handleNestedArrayChange('horseTrainerDetails', 'additionalServices', index, 'price', parseFloat(e.target.value))}
                                        placeholder={t('profile:price')}
                                        className="w-1/3 p-2 border rounded text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeNestedArrayItem('horseTrainerDetails', 'additionalServices', index)}
                                        className="p-2 text-red-500 hover:text-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addNestedArrayItem('horseTrainerDetails', 'additionalServices', { name_ar: '', name_en: '', price: 0 })}
                                className="mt-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Plus size={16} /> {t('profile:addService')}
                            </button>
                        </div>
                    </div>
                </div>
            );

        case 'hoof_trimmer':
            return (
                <div className="space-y-6">
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="specialization">
                            {t('profile:specialization')}
                        </label>
                        <select
                            id="specialization"
                            value={formData.hoofTrimmerDetails.specialization}
                            onChange={(e) => handleNestedChange('hoofTrimmerDetails', 'specialization', e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="">{t('profile:selectSpecialization')}</option>
                            <option value="hoof_trimmer">{t('profile:hoofTrimmer')}</option>
                            <option value="farrier">{t('profile:farrier')}</option>
                            <option value="horseshoe_fitting">{t('profile:horseshoeFitting')}</option>
                        </select>
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="methodsAndTools">
                            {t('profile:methodsAndTools')}
                        </label>
                        <textarea
                            id="methodsAndTools"
                            value={formData.hoofTrimmerDetails.methodsAndTools}
                            onChange={(e) => handleNestedChange('hoofTrimmerDetails', 'methodsAndTools', e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder={t('profile:methodsAndTools')}
                        />
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="certifications">
                            {t('profile:certifications')}
                        </label>
                        <input
                            type="file"
                            id="certifications"
                            name="certifications"
                            onChange={handleChange}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                        />
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600">
                            {t('profile:additionalServices')}
                        </label>
                        <div className="p-4 border-2 border-gray-200 rounded-xl">
                            {formData.hoofTrimmerDetails.additionalServices.map((service, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={service.name_ar}
                                        onChange={(e) => handleNestedArrayChange('hoofTrimmerDetails', 'additionalServices', index, 'name_ar', e.target.value)}
                                        placeholder={t('profile:serviceNameArabic')}
                                        className="w-1/3 p-2 border rounded text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={service.name_en}
                                        onChange={(e) => handleNestedArrayChange('hoofTrimmerDetails', 'additionalServices', index, 'name_en', e.target.value)}
                                        placeholder={t('profile:serviceNameEnglish')}
                                        className="w-1/3 p-2 border rounded text-sm"
                                    />
                                    <input
                                        type="number"
                                        value={service.price}
                                        onChange={(e) => handleNestedArrayChange('hoofTrimmerDetails', 'additionalServices', index, 'price', parseFloat(e.target.value))}
                                        placeholder={t('profile:price')}
                                        className="w-1/3 p-2 border rounded text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeNestedArrayItem('hoofTrimmerDetails', 'additionalServices', index)}
                                        className="p-2 text-red-500 hover:text-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addNestedArrayItem('hoofTrimmerDetails', 'additionalServices', { name_ar: '', name_en: '', price: 0 })}
                                className="mt-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Plus size={16} /> {t('profile:addService')}
                            </button>
                        </div>
                    </div>
                </div>
            );

        case 'horse_grooming':
            return (
                <div className="space-y-6">
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="methodsAndTools">
                            {t('profile:methodsAndTools')}
                        </label>
                        <textarea
                            id="methodsAndTools"
                            value={formData.horseGroomingDetails.methodsAndTools}
                            onChange={(e) => handleNestedChange('horseGroomingDetails', 'methodsAndTools', e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder={t('profile:methodsAndTools')}
                        />
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="certifications">
                            {t('profile:certifications')}
                        </label>
                        <input
                            type="file"
                            id="certifications"
                            name="certifications"
                            onChange={handleChange}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                        />
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600">
                            {t('profile:additionalServices')}
                        </label>
                        <div className="p-4 border-2 border-gray-200 rounded-xl">
                            {formData.horseGroomingDetails.additionalServices.map((service, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={service.name_ar}
                                        onChange={(e) => handleNestedArrayChange('horseGroomingDetails', 'additionalServices', index, 'name_ar', e.target.value)}
                                        placeholder={t('profile:serviceNameArabic')}
                                        className="w-1/3 p-2 border rounded text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={service.name_en}
                                        onChange={(e) => handleNestedArrayChange('horseGroomingDetails', 'additionalServices', index, 'name_en', e.target.value)}
                                        placeholder={t('profile:serviceNameEnglish')}
                                        className="w-1/3 p-2 border rounded text-sm"
                                    />
                                    <input
                                        type="number"
                                        value={service.price}
                                        onChange={(e) => handleNestedArrayChange('horseGroomingDetails', 'additionalServices', index, 'price', parseFloat(e.target.value))}
                                        placeholder={t('profile:price')}
                                        className="w-1/3 p-2 border rounded text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeNestedArrayItem('horseGroomingDetails', 'additionalServices', index)}
                                        className="p-2 text-red-500 hover:text-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addNestedArrayItem('horseGroomingDetails', 'additionalServices', { name_ar: '', name_en: '', price: 0 })}
                                className="mt-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Plus size={16} /> {t('profile:addService')}
                            </button>
                        </div>
                    </div>
                </div>
            );

        case 'event_judging':
            return (
                <div className="space-y-6">
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600">
                            {t('profile:eventTypes')}
                        </label>
                        <div className="p-4 border-2 border-gray-200 rounded-xl">
                            {[
                                'show_jumping',
                                'endurance_racing',
                                'horseback_riding_lessons',
                                'horse_breaking_training',
                                'speed_racing',
                                'cross_country_jumping',
                                'other',
                            ].map(type => (
                                <div key={type} className="flex items-center mb-2">
                                    <input
                                        type="checkbox"
                                        id={`eventType-${type}`}
                                        checked={formData.eventJudgingDetails.eventTypes.includes(type)}
                                        onChange={(e) => {
                                            const newTypes = e.target.checked
                                                ? [...formData.eventJudgingDetails.eventTypes, type]
                                                : formData.eventJudgingDetails.eventTypes.filter(t => t !== type);
                                            handleNestedChange('eventJudgingDetails', 'eventTypes', newTypes);
                                        }}
                                        className="mr-2"
                                    />
                                    <label htmlFor={`eventType-${type}`} className="text-sm">{t(`profile:${type}`)}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="judgingLevel">
                            {t('profile:judgingLevel')}
                        </label>
                        <select
                            id="judgingLevel"
                            value={formData.eventJudgingDetails.judgingLevel}
                            onChange={(e) => handleNestedChange('eventJudgingDetails', 'judgingLevel', e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="">{t('profile:selectLevel')}</option>
                            <option value="local">{t('profile:local')}</option>
                            <option value="national">{t('profile:national')}</option>
                            <option value="international">{t('profile:international')}</option>
                        </select>
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="certifications">
                            {t('profile:certifications')}
                        </label>
                        <input
                            type="file"
                            id="certifications"
                            name="certifications"
                            onChange={handleChange}
                            multiple
                            className="w-full p-4 border-2 border-gray-200 rounded-xl"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                        />
                    </div>
                </div>
            );

        case 'marketing_promotion':
            return (
                <div className="space-y-6">
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600">
                            {t('profile:portfolioLinks')}
                        </label>
                        <div className="p-4 border-2 border-gray-200 rounded-xl">
                            {formData.marketingPromotionDetails.portfolioLinks.map((link, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={link.url}
                                        onChange={(e) => handleNestedArrayChange('marketingPromotionDetails', 'portfolioLinks', index, 'url', e.target.value)}
                                        placeholder={t('profile:portfolioURL')}
                                        className="w-1/3 p-2 border rounded text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={link.description_ar}
                                        onChange={(e) => handleNestedArrayChange('marketingPromotionDetails', 'portfolioLinks', index, 'description_ar', e.target.value)}
                                        placeholder={t('profile:descriptionArabic')}
                                        className="w-1/3 p-2 border rounded text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={link.description_en}
                                        onChange={(e) => handleNestedArrayChange('marketingPromotionDetails', 'portfolioLinks', index, 'description_en', e.target.value)}
                                        placeholder={t('profile:descriptionEnglish')}
                                        className="w-1/3 p-2 border rounded text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeNestedArrayItem('marketingPromotionDetails', 'portfolioLinks', index)}
                                        className="p-2 text-red-500 hover:text-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addNestedArrayItem('marketingPromotionDetails', 'portfolioLinks', { url: '', description_ar: '', description_en: '' })}
                                className="mt-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Plus size={16} /> {t('profile:addLink')}
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="certifications">
                            {t('profile:certifications')}
                        </label>
                        <input
                            type="file"
                            id="certifications"
                            name="certifications"
                            onChange={handleChange}
                            multiple
                            className="w-full p-4 border-2 border-gray-200 rounded-xl"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                        />
                    </div>
                </div>
            );

        case 'event_commentary':
            return (
                <div className="space-y-6">
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="portfolioLink">
                            {t('profile:portfolioURL')}
                        </label>
                        <input
                            type="text"
                            id="portfolioLink"
                            value={formData.eventCommentaryDetails.portfolioLink.url}
                            onChange={(e) => handleNestedChange('eventCommentaryDetails', 'portfolioLink', {
                                ...formData.eventCommentaryDetails.portfolioLink,
                                url: e.target.value,
                            })}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder={t('profile:portfolioURL')}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="description_ar">
                                {t('profile:descriptionArabic')}
                            </label>
                            <input
                                type="text"
                                id="description_ar"
                                value={formData.eventCommentaryDetails.portfolioLink.description_ar}
                                onChange={(e) => handleNestedChange('eventCommentaryDetails', 'portfolioLink', {
                                    ...formData.eventCommentaryDetails.portfolioLink,
                                    description_ar: e.target.value,
                                })}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div className="relative">
                            <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="description_en">
                                {t('profile:descriptionEnglish')}
                            </label>
                            <input
                                type="text"
                                id="description_en"
                                value={formData.eventCommentaryDetails.portfolioLink.description_en}
                                onChange={(e) => handleNestedChange('eventCommentaryDetails', 'portfolioLink', {
                                    ...formData.eventCommentaryDetails.portfolioLink,
                                    description_en: e.target.value,
                                })}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="certifications">
                            {t('profile:certifications')}
                        </label>
                        <input
                            type="file"
                            id="certifications"
                            name="certifications"
                            onChange={handleChange}
                            multiple
                            className="w-full p-4 border-2 border-gray-200 rounded-xl"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                        />
                    </div>
                </div>
            );

        case 'consulting_services':
            return (
                <div className="space-y-6">
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="certifications">
                            {t('profile:certifications')}
                        </label>
                        <input
                            type="file"
                            id="certifications"
                            name="certifications"
                            onChange={handleChange}
                            multiple
                            className="w-full p-4 border-2 border-gray-200 rounded-xl"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                        />
                    </div>
                </div>
            );

        case 'photography_services':
            return (
                <div className="space-y-6">
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600">
                            {t('profile:photographyTypes')}
                        </label>
                        <div className="p-4 border-2 border-gray-200 rounded-xl">
                            {[
                                'event_photography',
                                'event_videography',
                                'equine_portrait_photography',
                                'promotional_photography',
                                'promotional_videography',
                                'other',
                            ].map(type => (
                                <div key={type} className="flex items-center mb-2">
                                    <input
                                        type="checkbox"
                                        id={`photographyType-${type}`}
                                        checked={formData.photographyServicesDetails.photographyTypes.includes(type)}
                                        onChange={(e) => {
                                            const newTypes = e.target.checked
                                                ? [...formData.photographyServicesDetails.photographyTypes, type]
                                                : formData.photographyServicesDetails.photographyTypes.filter(t => t !== type);
                                            handleNestedChange('photographyServicesDetails', 'photographyTypes', newTypes);
                                        }}
                                        className="mr-2"
                                    />
                                    <label htmlFor={`photographyType-${type}`} className="text-sm">{t(`profile:${type}`)}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="portfolioLink">
                            {t('profile:portfolioURL')}
                        </label>
                        <input
                            type="text"
                            id="portfolioLink"
                            value={formData.photographyServicesDetails.portfolioLink.url}
                            onChange={(e) => handleNestedChange('photographyServicesDetails', 'portfolioLink', {
                                ...formData.photographyServicesDetails.portfolioLink,
                                url: e.target.value,
                            })}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder={t('profile:portfolioURL')}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="description_ar">
                                {t('profile:descriptionArabic')}
                            </label>
                            <input
                                type="text"
                                id="description_ar"
                                value={formData.photographyServicesDetails.portfolioLink.description_ar}
                                onChange={(e) => handleNestedChange('photographyServicesDetails', 'portfolioLink', {
                                    ...formData.photographyServicesDetails.portfolioLink,
                                    description_ar: e.target.value,
                                })}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div className="relative">
                            <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="description_en">
                                {t('profile:descriptionEnglish')}
                            </label>
                            <input
                                type="text"
                                id="description_en"
                                value={formData.photographyServicesDetails.portfolioLink.description_en}
                                onChange={(e) => handleNestedChange('photographyServicesDetails', 'portfolioLink', {
                                    ...formData.photographyServicesDetails.portfolioLink,
                                    description_en: e.target.value,
                                })}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="certifications">
                            {t('profile:certifications')}
                        </label>
                        <input
                            type="file"
                            id="certifications"
                            name="certifications"
                            onChange={handleChange}
                            multiple
                            className="w-full p-4 border-2 border-gray-200 rounded-xl"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                        />
                    </div>
                </div>
            );

        case 'horse_transport':
            return (
                <div className="space-y-6">
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="maxLoad">
                            {t('profile:maxLoad')}
                        </label>
                        <input
                            type="number"
                            id="maxLoad"
                            value={formData.transportDetails.maxLoad}
                            onChange={(e) => handleNestedChange('transportDetails', 'maxLoad', parseInt(e.target.value))}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            min="1"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            'suspensionSystem',
                            'ventilationAndLighting',
                            'internalBarriers',
                            'advancedVentilation',
                            'wallUpholstery',
                            'horseInsurance',
                            'waterAndFood',
                            'emergencyVetServices',
                        ].map(field => (
                            <div key={field} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`transportDetails-${field}`}
                                    name={`transportDetails-${field}`}
                                    checked={formData.transportDetails[field]}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                <label htmlFor={`transportDetails-${field}`} className="text-sm font-medium text-gray-700">
                                    {t(`profile:${field}`)}
                                </label>
                            </div>
                        ))}
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="experienceYears">
                            {t('profile:experienceYears')}
                        </label>
                        <input
                            type="number"
                            id="experienceYears"
                            value={formData.transportDetails.experienceYears}
                            onChange={(e) => handleNestedChange('transportDetails', 'experienceYears', parseInt(e.target.value))}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            min="0"
                        />
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="certifications">
                            {t('profile:certifications')}
                        </label>
                        <input
                            type="file"
                            id="certifications"
                            name="certifications"
                            onChange={handleChange}
                            multiple
                            className="w-full p-4 border-2 border-gray-200 rounded-xl"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                        />
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="relevantLicenses">
                            {t('profile:relevantLicenses')}
                        </label>
                        <textarea
                            id="relevantLicenses"
                            value={formData.transportDetails.relevantLicenses}
                            onChange={(e) => handleNestedChange('transportDetails', 'relevantLicenses', e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder={t('profile:relevantLicenses')}
                        />
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="termsAndPolicies">
                            {t('profile:termsAndPolicies')}
                        </label>
                        <textarea
                            id="termsAndPolicies"
                            value={formData.transportDetails.termsAndPolicies}
                            onChange={(e) => handleNestedChange('transportDetails', 'termsAndPolicies', e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder={t('profile:termsAndPolicies')}
                        />
                    </div>
                </div>
            );

        case 'contractors':
            return (
                <div className="space-y-6">
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600">
                            {t('profile:serviceTypes')}
                        </label>
                        <div className="p-4 border-2 border-gray-200 rounded-xl">
                            {[
                                'barn_construction',
                                'fence_installation',
                                'arena_construction',
                                'stable_maintenance',
                                'other',
                            ].map(type => (
                                <div key={type} className="flex items-center mb-2">
                                    <input
                                        type="checkbox"
                                        id={`serviceType-${type}`}
                                        checked={formData.contractorsDetails.serviceTypes.includes(type)}
                                        onChange={(e) => {
                                            const newTypes = e.target.checked
                                                ? [...formData.contractorsDetails.serviceTypes, type]
                                                : formData.contractorsDetails.serviceTypes.filter(t => t !== type);
                                            handleNestedChange('contractorsDetails', 'serviceTypes', newTypes);
                                        }}
                                        className="mr-2"
                                    />
                                    <label htmlFor={`serviceType-${type}`} className="text-sm">{t(`profile:${type}`)}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="portfolioLink">
                            {t('profile:portfolioURL')}
                        </label>
                        <input
                            type="text"
                            id="portfolioLink"
                            value={formData.contractorsDetails.portfolioLink.url}
                            onChange={(e) => handleNestedChange('contractorsDetails', 'portfolioLink', {
                                ...formData.contractorsDetails.portfolioLink,
                                url: e.target.value,
                            })}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder={t('profile:portfolioURL')}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="description_ar">
                                {t('profile:descriptionArabic')}
                            </label>
                            <input
                                type="text"
                                id="description_ar"
                                value={formData.contractorsDetails.portfolioLink.description_ar}
                                onChange={(e) => handleNestedChange('contractorsDetails', 'portfolioLink', {
                                    ...formData.contractorsDetails.portfolioLink,
                                    description_ar: e.target.value,
                                })}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div className="relative">
                            <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="description_en">
                                {t('profile:descriptionEnglish')}
                            </label>
                            <input
                                type="text"
                                id="description_en"
                                value={formData.contractorsDetails.portfolioLink.description_en}
                                onChange={(e) => handleNestedChange('contractorsDetails', 'portfolioLink', {
                                    ...formData.contractorsDetails.portfolioLink,
                                    description_en: e.target.value,
                                })}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="certifications">
                            {t('profile:certifications')}
                        </label>
                        <input
                            type="file"
                            id="certifications"
                            name="certifications"
                            onChange={handleChange}
                            multiple
                            className="w-full p-4 border-2 border-gray-200 rounded-xl"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                        />
                    </div>
                </div>
            );

        case 'suppliers':
            return (
                <div className="space-y-6">
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="certifications">
                            {t('profile:certifications')}
                        </label>
                        <input
                            type="file"
                            id="certifications"
                            name="certifications"
                            onChange={handleChange}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                        />
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600">
                            {t('profile:products')}
                        </label>
                        <div className="p-4 border-2 border-gray-200 rounded-xl">
                            {formData.supplierDetails.products.map((product, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={product.name_ar}
                                        onChange={(e) => handleNestedArrayChange('supplierDetails', 'products', index, 'name_ar', e.target.value)}
                                        placeholder={t('profile:productNameArabic')}
                                        className="w-1/3 p-2 border rounded text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={product.name_en}
                                        onChange={(e) => handleNestedArrayChange('supplierDetails', 'products', index, 'name_en', e.target.value)}
                                        placeholder={t('profile:productNameEnglish')}
                                        className="w-1/3 p-2 border rounded text-sm"
                                    />
                                    <input
                                        type="number"
                                        value={product.price}
                                        onChange={(e) => handleNestedArrayChange('supplierDetails', 'products', index, 'price', parseFloat(e.target.value))}
                                        placeholder={t('profile:price')}
                                        className="w-1/3 p-2 border rounded text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeNestedArrayItem('supplierDetails', 'products', index)}
                                        className="p-2 text-red-500 hover:text-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addNestedArrayItem('supplierDetails', 'products', { name_ar: '', name_en: '', price: 0 })}
                                className="mt-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Plus size={16} /> {t('profile:addProduct')}
                            </button>
                        </div>
                    </div>
                </div>
            );

        case 'horse_catering':
            return (
                <div className="space-y-6">
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600">
                            {t('profile:additionalServices')}
                        </label>
                        <div className="p-4 border-2 border-gray-200 rounded-xl">
                            {formData.horseCateringDetails.additionalServices.map((service, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={service.name_ar}
                                        onChange={(e) => handleNestedArrayChange('horseCateringDetails', 'additionalServices', index, 'name_ar', e.target.value)}
                                        placeholder={t('profile:serviceNameArabic')}
                                        className="w-1/3 p-2 border rounded text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={service.name_en}
                                        onChange={(e) => handleNestedArrayChange('horseCateringDetails', 'additionalServices', index, 'name_en', e.target.value)}
                                        placeholder={t('profile:serviceNameEnglish')}
                                        className="w-1/3 p-2 border rounded text-sm"
                                    />
                                    <input
                                        type="number"
                                        value={service.price}
                                        onChange={(e) => handleNestedArrayChange('horseCateringDetails', 'additionalServices', index, 'price', parseFloat(e.target.value))}
                                        placeholder={t('profile:price')}
                                        className="w-1/3 p-2 border rounded text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeNestedArrayItem('horseCateringDetails', 'additionalServices', index)}
                                        className="p-2 text-red-500 hover:text-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addNestedArrayItem('horseCateringDetails', 'additionalServices', { name_ar: '', name_en: '', price: 0 })}
                                className="mt-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Plus size={16} /> {t('profile:addService')}
                            </button>
                        </div>
                    </div>
                </div>
            );

        case 'trip_coordinator':
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="locationOfHorses">
                                {t('profile:locationOfHorses')}
                            </label>
                            <input
                                type="text"
                                id="locationOfHorses"
                                value={formData.tripCoordinator.locationOfHorses}
                                onChange={(e) => handleNestedChange('tripCoordinator', 'locationOfHorses', e.target.value)}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder={t('profile:locationOfHorses')}
                            />
                        </div>
                        <div className="relative">
                            <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="locationOfTent">
                                {t('profile:locationOfTent')}
                            </label>
                            <input
                                type="text"
                                id="locationOfTent"
                                value={formData.tripCoordinator.locationOfTent}
                                onChange={(e) => handleNestedChange('tripCoordinator', 'locationOfTent', e.target.value)}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder={t('profile:locationOfTent')}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="startDate">
                                {t('profile:startDate')}
                            </label>
                            <input
                                type="date"
                                id="startDate"
                                value={formData.tripCoordinator.startDate || ''}
                                onChange={(e) => handleNestedChange('tripCoordinator', 'startDate', e.target.value)}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div className="relative">
                            <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="endDate">
                                {t('profile:endDate')}
                            </label>
                            <input
                                type="date"
                                id="endDate"
                                value={formData.tripCoordinator.endDate || ''}
                                onChange={(e) => handleNestedChange('tripCoordinator', 'endDate', e.target.value)}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="breakTimes">
                            {t('profile:breakTimes')}
                        </label>
                        <input
                            type="text"
                            id="breakTimes"
                            value={formData.tripCoordinator.breakTimes}
                            onChange={(e) => handleNestedChange('tripCoordinator', 'breakTimes', e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder={t('profile:breakTimes')}
                        />
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600">
                            {t('profile:meals')}
                        </label>
                        <div className="p-4 border-2 border-gray-200 rounded-xl">
                            {formData.tripCoordinator.meals.map((meal, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={meal.name_ar}
                                        onChange={(e) => handleNestedArrayChange('tripCoordinator', 'meals', index, 'name_ar', e.target.value)}
                                        placeholder={t('profile:mealNameArabic')}
                                        className="w-1/2 p-2 border rounded text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={meal.name_en}
                                        onChange={(e) => handleNestedArrayChange('tripCoordinator', 'meals', index, 'name_en', e.target.value)}
                                        placeholder={t('profile:mealNameEnglish')}
                                        className="w-1/2 p-2 border rounded text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeNestedArrayItem('tripCoordinator', 'meals', index)}
                                        className="p-2 text-red-500 hover:text-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addNestedArrayItem('tripCoordinator', 'meals', { name_ar: '', name_en: '' })}
                                className="mt-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Plus size={16} /> {t('profile:addMeal')}
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="containsAidBag"
                            name="containsAidBag"
                            checked={formData.tripCoordinator.containsAidBag}
                            onChange={handleChange}
                            className="mr-2"
                        />
                        <label htmlFor="containsAidBag" className="text-sm font-medium text-gray-700">
                            {t('profile:containsAidBag')}
                        </label>
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="activities">
                            {t('profile:activities')}
                        </label>
                        <textarea
                            id="activities"
                            value={formData.tripCoordinator.activities}
                            onChange={(e) => handleNestedChange('tripCoordinator', 'activities', e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder={t('profile:activities')}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="relative">
                            <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="priceForFamilyOf2">
                                {t('profile:priceForFamilyOf2')}
                            </label>
                            <input
                                type="number"
                                id="priceForFamilyOf2"
                                value={formData.tripCoordinator.priceForFamilyOf2}
                                onChange={(e) => handleNestedChange('tripCoordinator', 'priceForFamilyOf2', parseFloat(e.target.value))}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                min="0"
                            />
                        </div>
                        <div className="relative">
                            <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="priceForFamilyOf3">
                                {t('profile:priceForFamilyOf3')}
                            </label>
                            <input
                                type="number"
                                id="priceForFamilyOf3"
                                value={formData.tripCoordinator.priceForFamilyOf3}
                                onChange={(e) => handleNestedChange('tripCoordinator', 'priceForFamilyOf3', parseFloat(e.target.value))}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                min="0"
                            />
                        </div>
                        <div className="relative">
                            <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="priceForFamilyOf4">
                                {t('profile:priceForFamilyOf4')}
                            </label>
                            <input
                                type="number"
                                id="priceForFamilyOf4"
                                value={formData.tripCoordinator.priceForFamilyOf4}
                                onChange={(e) => handleNestedChange('tripCoordinator', 'priceForFamilyOf4', parseFloat(e.target.value))}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                min="0"
                            />
                        </div>
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="tripProgram">
                            {t('profile:tripProgram')}
                        </label>
                        <textarea
                            id="tripProgram"
                            value={formData.tripCoordinator.tripProgram}
                            onChange={(e) => handleNestedChange('tripCoordinator', 'tripProgram', e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder={t('profile:tripProgram')}
                        />
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="levelOfHardship">
                            {t('profile:levelOfHardship')}
                        </label>
                        <select
                            id="levelOfHardship"
                            value={formData.tripCoordinator.levelOfHardship}
                            onChange={(e) => handleNestedChange('tripCoordinator', 'levelOfHardship', e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="">{t('profile:selectLevel')}</option>
                            <option value="easy">{t('profile:easy')}</option>
                            <option value="moderate">{t('profile:moderate')}</option>
                            <option value="difficult">{t('profile:difficult')}</option>
                        </select>
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="conditionsAndRequirements">
                            {t('profile:conditionsAndRequirements')}
                        </label>
                        <textarea
                            id="conditionsAndRequirements"
                            value={formData.tripCoordinator.conditionsAndRequirements}
                            onChange={(e) => handleNestedChange('tripCoordinator', 'conditionsAndRequirements', e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder={t('profile:conditionsAndRequirements')}
                        />
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="safetyAndEquipment">
                            {t('profile:safetyAndEquipment')}
                        </label>
                        <textarea
                            id="safetyAndEquipment"
                            value={formData.tripCoordinator.safetyAndEquipment}
                            onChange={(e) => handleNestedChange('tripCoordinator', 'safetyAndEquipment', e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder={t('profile:safetyAndEquipment')}
                        />
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="cancellationAndRefundPolicy">
                            {t('profile:cancellationAndRefundPolicy')}
                        </label>
                        <textarea
                            id="cancellationAndRefundPolicy"
                            value={formData.tripCoordinator.cancellationAndRefundPolicy}
                            onChange={(e) => handleNestedChange('tripCoordinator', 'cancellationAndRefundPolicy', e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder={t('profile:cancellationAndRefundPolicy')}
                        />
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="moreDetails">
                            {t('profile:moreDetails')}
                        </label>
                        <textarea
                            id="moreDetails"
                            value={formData.tripCoordinator.moreDetails}
                            onChange={(e) => handleNestedChange('tripCoordinator', 'moreDetails', e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder={t('profile:moreDetails')}
                        />
                    </div>
                </div>
            );

        default:
            return null;
    }
};