import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SearchableBreedDropdown = ({ formData, handleChange, t, isRTL, formGroupClass }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBreed, setSelectedBreed] = useState('');
    const dropdownRef = useRef(null);
    const { i18n } = useTranslation(); // Get i18n for language detection
    const currentLang = i18n.language === 'ar' ? 'ar' : 'en'; // Determine current language

    // Breed options with separate Arabic and English names
    const breedOptions = React.useMemo(() => [
        { ar: 'الخيل العربي الأصيل', en: 'Purebred Arabian', value: 'purebredArabian' },
        { ar: 'الخيل التبتي', en: 'Tibetan Pony', value: 'tibetanPony' },
        { ar: 'الخيل المنغولي', en: 'Mongolian Horse', value: 'mongolianHorse' },
        { ar: 'الخيل الأندلسي', en: 'Andalusian', value: 'andalusian' },
        { ar: 'الخيل الفريزي', en: 'Friesian', value: 'friesian' },
        { ar: 'الخيل الهنغاري', en: 'Hungarian Horse', value: 'hungarianHorse' },
        { ar: 'الخيل البلغاري', en: 'Bulgarian Horse', value: 'bulgarianHorse' },
        { ar: 'الخيل الأوزبكي', en: 'Uzbek Horse', value: 'uzbekHorse' },
        { ar: 'الخيل الأفغاني', en: 'Afghan Horse', value: 'afghanHorse' },
        { ar: 'الخيل التركي', en: 'Turkish Horse', value: 'turkishHorse' },
        { ar: 'الخيل الإيراني', en: 'Persian Horse', value: 'persianHorse' },
        { ar: 'الخيل الكوردي', en: 'Kurdish Horse', value: 'kurdishHorse' },
        { ar: 'الخيل الأرمني', en: 'Armenian Horse', value: 'armenianHorse' },
        { ar: 'الخيل الجورجي', en: 'Georgian Horse', value: 'georgianHorse' },
        { ar: 'الخيل الأبخازي', en: 'Abkhazian Horse', value: 'abkhazianHorse' },
        { ar: 'الخيل الألطي', en: 'Altai Horse', value: 'altaiHorse' },
        { ar: 'الخيل الباشكيري', en: 'Bashkir Horse', value: 'bashkirHorse' },
        { ar: 'الخيل التتاري', en: 'Tatar Horse', value: 'tatarHorse' },
        { ar: 'الخيل القرغيزي', en: 'Kyrgyz Horse', value: 'kyrgyzHorse' },
        { ar: 'الخيل الطاجيكي', en: 'Tajik Horse', value: 'tajikHorse' },
        { ar: 'الخيل التركماني', en: 'Turkmen Horse', value: 'turkmenHorse' },
        { ar: 'الخيل الأوزبكي الكاراكالباكي', en: 'Karakalpak Uzbek Horse', value: 'karakalpakUzbekHorse' },
        { ar: 'الخيل الكازاخستاني', en: 'Kazakh Horse', value: 'kazakhHorse' },
        { ar: 'الخيل الروسي الدون', en: 'Don Horse', value: 'donHorse' },
        { ar: 'الخيل الروسي الكوباني', en: 'Kuban Horse', value: 'kubanHorse' },
        { ar: 'الخيل البيلاروسي', en: 'Belarusian Horse', value: 'belarusianHorse' },
        { ar: 'الخيل الأوكراني', en: 'Ukrainian Horse', value: 'ukrainianHorse' },
        { ar: 'الخيل البولندي', en: 'Polish Horse', value: 'polishHorse' },
        { ar: 'الخيل التشيكي', en: 'Czech Horse', value: 'czechHorse' },
        { ar: 'الخيل السلوفاكي', en: 'Slovak Horse', value: 'slovakHorse' },
        { ar: 'الخيل المجر', en: 'Hungarian Horse', value: 'hungarianHorse2' },
        { ar: 'الخيل الروماني', en: 'Romanian Horse', value: 'romanianHorse' },
        { ar: 'الخيل البلغاري الشاغي', en: 'Shaggy Bulgarian Horse', value: 'shaggyBulgarianHorse' },
        { ar: 'الخيل اليوناني', en: 'Greek Horse', value: 'greekHorse' },
        { ar: 'الخيل التركي الأناضولي', en: 'Anatolian Horse', value: 'anatolianHorse' },
        { ar: 'الخيل الإيراني الأزرق', en: 'Persian Blue Horse', value: 'persianBlueHorse' },
        { ar: 'الخيل الأفغاني الهزاره', en: 'Hazaragi Horse', value: 'hazaragiHorse' },
        { ar: 'الخيل الباكستاني البشتوني', en: 'Pashtun Horse', value: 'pashtunHorse' },
        { ar: 'الخيل الهندي المارواري', en: 'Marwari', value: 'marwari' },
        { ar: 'الخيل النيبالي', en: 'Nepalese Pony', value: 'nepalesePony' },
        { ar: 'الخيل البوتاني', en: 'Bhutanese Pony', value: 'bhutanesePony' },
        { ar: 'الخيل التايلندي', en: 'Thai Pony', value: 'thaiPony' },
        { ar: 'الخيل الكمبودي', en: 'Cambodian Pony', value: 'cambodianPony' },
        { ar: 'الخيل الفيتنامي', en: 'Vietnamese Pony', value: 'vietnamesePony' },
        { ar: 'الخيل اللاوسي', en: 'Laotian Pony', value: 'laotianPony' },
        { ar: 'الخيل البرمي', en: 'Burmese Pony', value: 'burmesePony' },
        { ar: 'الخيل الصيني المانشو', en: 'Manchu Horse', value: 'manchuHorse' },
        { ar: 'الخيل الياباني الكيسو', en: 'Kiso Horse', value: 'kisoHorse' },
        { ar: 'الخيل الكوري', en: 'Korean Horse', value: 'koreanHorse' },
        { ar: 'الخيل المنغولي البايانخونغور', en: 'Bayankhongor Mongolian Horse', value: 'bayankhongorMongolianHorse' },
        { ar: 'الخيل المنغولي الخنتي', en: 'Khentii Mongolian Horse', value: 'khentiiMongolianHorse' },
        { ar: 'الخيل التبتية', en: 'Tibetan Pony', value: 'tibetanPony2' },
        { ar: 'الخيل النيبالية', en: 'Nepalese Pony', value: 'nepalesePony2' },
        { ar: 'الخيل البوتانية', en: 'Bhutanese Pony', value: 'bhutanesePony2' },
        { ar: 'الخيل التايلاندية', en: 'Thai Pony', value: 'thaiPony2' },
        { ar: 'الخيل الكمبودية', en: 'Cambodian Pony', value: 'cambodianPony2' },
        { ar: 'الخيل الفيتنامية', en: 'Vietnamese Pony', value: 'vietnamesePony2' },
        { ar: 'الخيل اللاوسية', en: 'Laotian Pony', value: 'laotianPony2' },
        { ar: 'الخيل البرمية', en: 'Burmese Pony', value: 'burmesePony2' },
        { ar: 'الخيل الصينية المانشو', en: 'Manchu Horse', value: 'manchuHorse2' },
        { ar: 'الخيل اليابانية الكيسو', en: 'Kiso Horse', value: 'kisoHorse2' },
        { ar: 'الخيل الكورية', en: 'Korean Horse', value: 'koreanHorse2' },
        { ar: 'الخيل المنغولية البايانخونغور', en: 'Bayankhongor Mongolian Horse', value: 'bayankhongorMongolianHorse2' },
        { ar: 'الخيل المنغولية الخنتي', en: 'Khentii Mongolian Horse', value: 'khentiiMongolianHorse2' },
        { ar: 'الخيل التبتية', en: 'Tibetan Pony', value: 'tibetanPony3' },
        { ar: 'الخيل النيبالية', en: 'Nepalese Pony', value: 'nepalesePony3' },
        { ar: 'الخيل البوتانية', en: 'Bhutanese Pony', value: 'bhutanesePony3' },
        { ar: 'الخيل التايلاندية', en: 'Thai Pony', value: 'thaiPony3' },
        { ar: 'الخيل الكمبودية', en: 'Cambodian Pony', value: 'cambodianPony3' },
        { ar: 'الخيل الفيتنامية', en: 'Vietnamese Pony', value: 'vietnamesePony3' },
        { ar: 'الخيل اللاوسية', en: 'Laotian Pony', value: 'laotianPony3' },
        { ar: 'الخيل البرمية', en: 'Burmese Pony', value: 'burmesePony3' },
        { ar: 'الخيل الصينية المانشو', en: 'Manchu Horse', value: 'manchuHorse3' },
        { ar: 'الخيل اليابانية الكيسو', en: 'Kiso Horse', value: 'kisoHorse3' },
        { ar: 'الخيل الكورية', en: 'Korean Horse', value: 'koreanHorse3' },
        { ar: 'الخيل العربي', en: 'Arabian', value: 'arabian' },
        { ar: 'الخيل الأندلسي الإسباني', en: 'Spanish Andalusian', value: 'spanishAndalusian' },
        { ar: 'الخيل الإنجليزي', en: 'Thoroughbred', value: 'thoroughbred' },
        { ar: 'الخيل الفرنسي', en: 'French Horse', value: 'frenchHorse' },
        { ar: 'الخيل الألماني', en: 'German Horse', value: 'germanHorse' },
        { ar: 'الخيل الإيطالي', en: 'Italian Horse', value: 'italianHorse' },
        { ar: 'الخيل البلجيكي', en: 'Belgian Draft', value: 'belgianDraft' },
        { ar: 'الخيل الهولندي', en: 'Dutch Horse', value: 'dutchHorse' },
        { ar: 'الخيل الدنماركي', en: 'Danish Horse', value: 'danishHorse' },
        { ar: 'الخيل النرويجي', en: 'Norwegian Fjord', value: 'norwegianFjord' },
        { ar: 'الخيل السويدي', en: 'Swedish Horse', value: 'swedishHorse' },
        { ar: 'الخيل الفنلندي', en: 'Finnhorse', value: 'finnhorse' },
        { ar: 'الخيل الإستوني', en: 'Estonian Horse', value: 'estonianHorse' },
        { ar: 'الخيل اللاتفي', en: 'Latvian Horse', value: 'latvianHorse' },
        { ar: 'الخيل الليتواني', en: 'Lithuanian Horse', value: 'lithuanianHorse' },
        { ar: 'الخيل البولندي الكونيك', en: 'Konik', value: 'konik' },
        { ar: 'الخيل الروسي الدون', en: 'Don Horse', value: 'donHorse2' },
        { ar: 'الخيل الروسي الكوباني', en: 'Kuban Horse', value: 'kubanHorse2' },
        { ar: 'الخيل الأوكراني', en: 'Ukrainian Horse', value: 'ukrainianHorse2' },
        { ar: 'الخيل البيلاروسي', en: 'Belarusian Horse', value: 'belarusianHorse2' },
    ], []);

    // Filter breeds based on search term
    const filteredBreeds = breedOptions.filter(breed =>
        breed[currentLang].toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Set initial selected breed from formData if it exists
    useEffect(() => {
        if (formData.breed) {
            const breedOption = breedOptions.find(option => option.value === formData.breed);
            if (breedOption) {
                setSelectedBreed(breedOption[currentLang]); // Use current language for display
            }
        }
    }, [formData.breed, currentLang, breedOptions]); // Re-run if language changes or breed options change

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBreedSelect = (breed) => {
        const syntheticEvent = {
            target: {
                name: 'breed',
                value: breed.value,
            },
        };
        handleChange(syntheticEvent);
        setSelectedBreed(breed[currentLang]); // Display name in current language
        setIsOpen(false);
        setSearchTerm('');
    };

    const clearSelection = () => {
        const syntheticEvent = {
            target: {
                name: 'breed',
                value: '',
            },
        };
        handleChange(syntheticEvent);
        setSelectedBreed('');
        setSearchTerm('');
    };

    return (
        <div className={formGroupClass} ref={dropdownRef}>
            <label className="block text-gray-700 font-medium mb-2">
                {t("user:horseRegistration.breed")} <span className="text-red-500">*</span>
            </label>

            {/* Main dropdown trigger */}
            <div className="relative w-full" dir={isRTL ? "rtl" : "ltr"}>
                <div
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 flex justify-between items-center cursor-pointer bg-white"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="truncate">
                        {selectedBreed || t("user:horseRegistration.selectBreed")}
                    </div>
                    <div className="flex items-center">
                        {selectedBreed && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearSelection();
                                }}
                                className="mr-2 rounded-full p-1 bg-red-300"
                            >
                                <X size={16} color='black' />
                            </button>
                        )}
                        <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </div>

                {/* Dropdown menu */}
                {isOpen && (
                    <div
                        className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg"
                        style={{ maxHeight: '200px', overflowY: 'auto' }}
                    >
                        {/* Search input */}
                        <div className="sticky top-0 bg-white p-2 border-b border-gray-200 z-20">
                            <div className="relative">
                                <Search size={18} className={`absolute text-gray-400 ${isRTL ? "left-3" : "right-3"}`} style={{ top: "10px" }} />
                                <input
                                    type="text"
                                    className="w-full p-2 pl-10 pr-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder={t("user:horseRegistration.searchBreed")}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    dir={isRTL ? "rtl" : "ltr"}
                                />
                            </div>
                        </div>

                        {/* Breed options */}
                        <div className="overflow-y-auto">
                            {filteredBreeds.length > 0 ? (
                                filteredBreeds.map((breed) => (
                                    <div
                                        key={breed.value}
                                        className="p-3 hover:bg-gray-100 cursor-pointer text-sm"
                                        onClick={() => handleBreedSelect(breed)}
                                    >
                                        {breed[currentLang]} {/* Display breed name in current language */}
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 text-gray-500 text-center text-sm">
                                    {t("user:horseRegistration.noBreedFound")}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Hidden input for form submission */}
                <input
                    type="hidden"
                    name="breed"
                    value={formData.breed}
                    required
                />
            </div>
        </div>
    );
};

export default SearchableBreedDropdown;
