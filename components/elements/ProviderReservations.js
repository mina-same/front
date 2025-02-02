import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MessageSquare, BookPlus, Check, X, ChevronRight, Trash2 } from 'lucide-react';
import Image from 'next/image';
import userFallbackImage from "../../public/assets/imgs/elements/user.png";
import { urlFor } from '../../src/lib/sanity';

const ProviderReservations = ({ reservations = [], onStatusUpdate, onDelete }) => {
    const [filterStatus, setFilterStatus] = useState('all');
    const [activeTab, setActiveTab] = useState('upcoming');

    // Function to handle status update
    const handleStatusUpdate = async (reservationId, status) => {
        try {
            await onStatusUpdate(reservationId, status);
        } catch (error) {
            console.error('Error updating reservation status:', error);
        }
    };

    if (!reservations || reservations.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                        <BookPlus className="w-5 h-5 text-blue-600" />
                        Reservations
                        <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-sm">
                            0
                        </span>
                    </h4>
                </div>
                <div className="gap-2 flex justify-center items-center bg-gray-50 py-5 rounded-xl">
                    <Calendar className="w-8 h-8 text-gray-600" />
                    <p className="text-gray-600">No reservations found</p>
                </div>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-emerald-100 text-emerald-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <Check className="w-3 h-3 text-white" />;
            case 'rejected':
                return <X className="w-3 h-3 text-white" />;
            default:
                return <Clock className="w-3 h-3 text-white" />;
        }
    };

    const getStatusBackgroundColor = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-emerald-500';
            case 'rejected':
                return 'bg-red-500';
            default:
                return 'bg-yellow-500';
        }
    };

    // Filter reservations based on status and tab
    const filteredReservations = reservations.filter(reservation => {
        if (!reservation.datetime) return false;
        
        const matchesStatus = filterStatus === 'all' || reservation.status === filterStatus;
        const reservationDate = new Date(reservation.datetime);
        const now = new Date();
        const isUpcoming = reservationDate > now;
        const matchesTab = (activeTab === 'upcoming' && isUpcoming) ||
            (activeTab === 'past' && !isUpcoming);
        
        return matchesStatus && matchesTab;
    });

    return (
        <div className="space-y-6 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Reservations
                    <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-sm">
                        {filteredReservations.length}
                    </span>
                </h4>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-gray-200">
                {['upcoming', 'past'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-medium text-sm transition-colors relative 
                                ${activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)} Reservations
                        {activeTab === tab && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Reservations List */}
            <div className="space-y-3">
                {filteredReservations.length === 0 ? (
                    <div className="gap-2 flex justify-center items-center bg-gray-50 py-5 rounded-xl">
                        <Calendar className="w-8 h-8 text-gray-600" />
                        <p className="text-gray-600">No {activeTab} reservations found</p>
                    </div>
                ) : (
                    filteredReservations.map(reservation => (
                        <motion.div
                            key={reservation._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-gray-50 rounded-xl hover:border-gray-200/60 transition-colors"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Image
                                            src={reservation.user?.image ? urlFor(reservation.user.image).url() : userFallbackImage}
                                            alt={reservation.user?.userName || 'User'}
                                            width={48}
                                            height={48}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                                        />
                                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ${getStatusBackgroundColor(reservation.status)}`}>
                                            {getStatusIcon(reservation.status)}
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="font-medium text-gray-900">{reservation.user?.userName}</h5>
                                        <div className="flex gap-2 mt-1 text-sm text-gray-500">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(reservation.datetime).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4" />
                                                {new Date(reservation.datetime).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {reservation.status === 'pending' ? (
                                        <div className="flex gap-2">
                                            <motion.button
                                                whileHover={{ y: -2 }}
                                                onClick={() => handleStatusUpdate(reservation._id, 'approved')}
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition-colors"
                                            >
                                                Accept
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ y: -2 }}
                                                onClick={() => handleStatusUpdate(reservation._id, 'rejected')}
                                                className="px-4 py-2 bg-transparent text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-300 font-medium transition-colors"
                                            >
                                                Decline
                                            </motion.button>
                                        </div>
                                    ) : (
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                                            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProviderReservations;