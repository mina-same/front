import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../src/components/ui/dialog";
import { Button } from "../../src/components/ui/button";
import { Input } from "../../src/components/ui/input";
import { Label } from "../../src/components/ui/label";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";

const RentalDatePopup = ({ isOpen, onClose, onSubmit, rentalDurationUnit }) => {
    const { locale } = useParams();
    const { t } = useTranslation('product');
    const isRTL = locale === 'ar';
    
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [error, setError] = useState("");

    const validateDates = () => {
        if (!startDate || !endDate) {
            setError(t('rentalDatePopup.errors.bothRequired'));
            return false;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();

        if (start < now) {
            setError(t('rentalDatePopup.errors.futureDate'));
            return false;
        }

        if (start > end) {
            setError(t('rentalDatePopup.errors.startBeforeEnd'));
            return false;
        }

        // Validate based on rentalDurationUnit
        const diffTime = end - start;
        const diffHours = diffTime / (1000 * 60 * 60);
        const diffDays = diffHours / 24;
        const diffWeeks = diffDays / 7;
        const diffMonths = diffDays / 30;
        const diffYears = diffDays / 365;

        switch (rentalDurationUnit) {
            case "hour":
                if (diffHours < 1) {
                    setError(t('rentalDatePopup.errors.minHour'));
                    return false;
                }
                break;
            case "day":
                if (diffDays < 1) {
                    setError(t('rentalDatePopup.errors.minDay'));
                    return false;
                }
                break;
            case "week":
                if (diffWeeks < 1) {
                    setError(t('rentalDatePopup.errors.minWeek'));
                    return false;
                }
                break;
            case "month":
                if (diffMonths < 1) {
                    setError(t('rentalDatePopup.errors.minMonth'));
                    return false;
                }
                break;
            case "year":
                if (diffYears < 1) {
                    setError(t('rentalDatePopup.errors.minYear'));
                    return false;
                }
                break;
            default:
                break;
        }

        return true;
    };

    const handleSubmit = () => {
        if (validateDates()) {
            onSubmit({ startDate, endDate });
            setStartDate("");
            setEndDate("");
            setError("");
            onClose();
        }
    };

    // Determine input type based on rentalDurationUnit
    const isHourly = rentalDurationUnit === "hour";
    const inputType = isHourly ? "datetime-local" : "date";

    // Set min date to tomorrow for date inputs
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];
    const minDateTime = tomorrow.toISOString().slice(0, 16);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]" dir={isRTL ? 'rtl' : 'ltr'}>
                <DialogHeader>
                    <DialogTitle>{t('rentalDatePopup.title')}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="startDate" className={isRTL ? "text-left" : "text-right"}>
                            {isHourly ? t('rentalDatePopup.startDateTime') : t('rentalDatePopup.startDate')}
                        </Label>
                        <Input
                            id="startDate"
                            type={inputType}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="col-span-3"
                            min={isHourly ? minDateTime : minDate}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="endDate" className={isRTL ? "text-left" : "text-right"}>
                            {isHourly ? t('rentalDatePopup.endDateTime') : t('rentalDatePopup.endDate')}
                        </Label>
                        <Input
                            id="endDate"
                            type={inputType}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="col-span-3"
                            min={isHourly ? minDateTime : minDate}
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
                <DialogFooter className={isRTL ? "justify-start flex-row-reverse" : ""}>
                    <Button variant="outline" onClick={onClose}>
                        {t('rentalDatePopup.cancel')}
                    </Button>
                    <Button onClick={handleSubmit}>{t('rentalDatePopup.confirm')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default RentalDatePopup;