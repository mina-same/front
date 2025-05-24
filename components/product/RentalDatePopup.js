import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../src/components/ui/dialog";
import { Button } from "../../src/components/ui/button";
import { Input } from "../../src/components/ui/input";
import { Label } from "../../src/components/ui/label";
import { toast } from "sonner";

const RentalDatePopup = ({ isOpen, onClose, onSubmit, rentalDurationUnit }) => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [error, setError] = useState("");

    const validateDates = () => {
        if (!startDate || !endDate) {
            setError("Both start and end dates are required.");
            return false;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();

        if (start < now) {
            setError("Start date must be in the future.");
            return false;
        }

        if (start > end) {
            setError("Start date must be before end date.");
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
                    setError("Rental duration must be at least 1 hour.");
                    return false;
                }
                break;
            case "day":
                if (diffDays < 1) {
                    setError("Rental duration must be at least 1 day.");
                    return false;
                }
                break;
            case "week":
                if (diffWeeks < 1) {
                    setError("Rental duration must be at least 1 week.");
                    return false;
                }
                break;
            case "month":
                if (diffMonths < 1) {
                    setError("Rental duration must be at least 1 month.");
                    return false;
                }
                break;
            case "year":
                if (diffYears < 1) {
                    setError("Rental duration must be at least 1 year.");
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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Select Rental Dates</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="startDate" className="text-right">
                            Start Date
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
                        <Label htmlFor="endDate" className="text-right">
                            End Date
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
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>Confirm</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default RentalDatePopup;