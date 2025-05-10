"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../../src/components/ui/card";
import { Check, X, AlertCircle, Calendar, Clock, Phone, MapPin } from "lucide-react";
import Image from "next/image";
import { urlFor, client } from "../../src/lib/sanity";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../src/components/ui/dialog";
import { Button } from "../../src/components/ui/button";
import userFallbackImage from "../../public/assets/imgs/elements/user.png";

const UserReservations = ({ userId }) => {
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [newDateTime, setNewDateTime] = useState("");

    const fetchUserReservations = useCallback(async () => {
        setIsLoading(true);
        try {
            const query = `*[_type == "reservation" && user._ref == $userId]{
                    _id,
                    datetime,
                    status,
                    proposedDatetime,
                    userResponse,
                    provider->{
                        _id,
                        name_en,
                        name_ar,
                        userRef->{
                            _id,
                            userName,
                            email,
                            image,
                            phoneNumber,
                            location
                        },
                        mainServiceRef->{
                            _id,
                            name_en,
                            name_ar,
                            price,
                            image
                        }
                    }
                }`;

            const result = await client.fetch(query, { userId });
            setReservations(result);
        } catch (error) {
            console.error('Error fetching user reservations:', error);
            setError('Failed to load reservations');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchUserReservations();
    }, [fetchUserReservations]);

    const handleReschedule = async () => {
        if (!selectedReservation || !newDateTime) return;

        try {
            // Update the reservation in Sanity
            await client
                .patch(selectedReservation._id)
                .set({
                    proposedDatetime: new Date(newDateTime).toISOString(),
                    status: 'pending',
                    userResponse: 'reschedule_requested'
                })
                .commit();

            // Update local state
            setReservations(reservations.map(res =>
                res._id === selectedReservation._id
                    ? { ...res, proposedDatetime: newDateTime, status: 'pending' }
                    : res
            ));

            setIsRescheduleDialogOpen(false);
            setSelectedReservation(null);
            setNewDateTime("");
        } catch (error) {
            console.error('Error rescheduling reservation:', error);
            setError('Failed to reschedule reservation');
        }
    };

    const handleCancel = async () => {
        if (!selectedReservation) return;

        try {
            // Delete the reservation from Sanity
            await client.delete(selectedReservation._id);

            // Update local state to remove the reservation
            setReservations(reservations.filter(res => res._id !== selectedReservation._id));

            setIsCancelDialogOpen(false);
            setSelectedReservation(null);
        } catch (error) {
            console.error('Error cancelling reservation:', error);
            setError('Failed to cancel reservation');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <Check className="w-4 h-4" />;
            case 'rejected':
                return <X className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'rejected':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <>
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Responsive Header Section */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Reservations</h1>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <select className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm">
                                <option>All Statuses</option>
                                <option>Approved</option>
                                <option>Pending</option>
                                <option>Rejected</option>
                            </select>
                            <select className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm">
                                <option>This Month</option>
                                <option>Last Month</option>
                                <option>Last 3 Months</option>
                            </select>
                        </div>
                    </div>

                    {/* Empty State */}
                    {reservations.length === 0 ? (
                        <div className="text-center py-16 sm:py-32 bg-gray-50 rounded-xl">
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                className="space-y-4 px-4"
                            >
                                <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto" />
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-700">No Reservations Found</h3>
                                <p className="text-sm sm:text-base text-gray-500">
                                    You haven&apos;t made any reservations yet.
                                </p>
                            </motion.div>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {reservations.map((reservation) => (
                                <ReservationCard
                                    key={reservation._id}
                                    reservation={reservation}
                                    getStatusIcon={getStatusIcon}
                                    getStatusStyles={getStatusStyles}
                                    setSelectedReservation={setSelectedReservation}
                                    setIsRescheduleDialogOpen={setIsRescheduleDialogOpen}
                                    setIsCancelDialogOpen={setIsCancelDialogOpen}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Reschedule Dialog */}
            <Dialog className="bg-white text-black" open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
                <DialogContent className="bg-white text-black">
                    <DialogHeader>
                        <DialogTitle className="text-black">Reschedule Reservation</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <label className="block text-sm font-medium text-black mb-2">
                            Select New Date and Time
                        </label>
                        <input
                            type="datetime-local"
                            className="w-full px-4 py-2 border rounded-lg text-black"
                            value={newDateTime}
                            onChange={(e) => setNewDateTime(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                        />
                    </div>
                    <DialogFooter className="bg-white text-black">
                        <Button variant="outline" className="border-gray-300 text-black hover:bg-gray-100" onClick={() => setIsRescheduleDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="bg-blue-500 text-white hover:bg-blue-600" onClick={handleReschedule}>
                            Confirm Reschedule
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Dialog */}
            <Dialog className="bg-white text-black" open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <DialogContent className="bg-white text-black">
                    <DialogHeader>
                        <DialogTitle className="text-black">Cancel Reservation</DialogTitle>
                    </DialogHeader>
                    <p className="py-4 text-black">Are you sure you want to cancel this reservation? This action cannot be undone.</p>
                    <DialogFooter className="bg-white text-black">
                        <Button variant="outline" className="border-gray-300 text-black hover:bg-gray-100" onClick={() => setIsCancelDialogOpen(false)}>
                            No, Keep It
                        </Button>
                        <Button variant="destructive" className="bg-red-500 text-white hover:bg-red-600" onClick={handleCancel}>
                            Yes, Cancel Reservation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

const ReservationCard = ({ reservation, getStatusIcon, getStatusStyles, setSelectedReservation, setIsRescheduleDialogOpen, setIsCancelDialogOpen }) => {
    return (
        <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
            <Card className="overflow-hidden border-0 shadow-lg">
                <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                        {/* Service Image Section */}
                        <div className="w-full sm:w-1/3 relative h-48 sm:h-auto">
                            <Image
                                src={reservation.provider?.mainServiceRef?.image ?
                                    urlFor(reservation.provider.mainServiceRef.image).url() :
                                    userFallbackImage}
                                alt={reservation.provider?.mainServiceRef?.name_en || 'Service Image'}
                                className="w-full h-full object-cover"
                                width={50}
                                height={50}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                            <div className="absolute bottom-4 left-4 text-white">
                                <h3 className="text-base sm:text-lg font-bold">{reservation.provider?.name_en}</h3>
                                <p className="text-xs sm:text-sm opacity-90">
                                    {reservation.provider?.mainServiceRef?.name_en}
                                </p>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="w-full sm:w-2/3 p-4 sm:p-6 bg-white">
                            {/* Provider Info */}
                            <div className="flex sm:flex-col justify-between items-start gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <Image
                                        src={reservation.provider?.userRef?.image ?
                                            urlFor(reservation.provider.userRef.image).url() :
                                            userFallbackImage}
                                        alt={reservation.provider?.userRef?.userName || 'Provider'}
                                        className="w-10 h-10 rounded-full ring-2 ring-white shadow-md"
                                        width={10}
                                        height={10}
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {reservation.provider?.userRef?.userName}
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-500">
                                            {reservation.provider?.mainServiceRef?.name_en}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border ${getStatusStyles(reservation.status)}`}>
                                    {getStatusIcon(reservation.status)}
                                    {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                </span>
                            </div>

                            {/* Reservation Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-xs sm:text-sm truncate">
                                        {new Date(reservation.datetime).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-xs sm:text-sm truncate">
                                        {new Date(reservation.datetime).toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Phone className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-xs sm:text-sm truncate">
                                        {reservation.provider?.userRef?.phoneNumber || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-xs sm:text-sm truncate">
                                        {reservation.provider?.userRef?.location || 'N/A'}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                                {reservation.status !== 'cancelled' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setSelectedReservation(reservation);
                                                setIsRescheduleDialogOpen(true);
                                            }}
                                            className="w-full sm:w-auto px-4 py-2 bg-blue-50 text-blue-500 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                                        >
                                            Reschedule
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedReservation(reservation);
                                                setIsCancelDialogOpen(true);
                                            }}
                                            className="w-full sm:w-auto px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default UserReservations;
