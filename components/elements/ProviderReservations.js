import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, Check, X, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import userFallbackImage from "../../public/assets/imgs/elements/user.png";
import { urlFor } from '../../src/lib/sanity';

const ProviderReservations = ({ reservations = [], onStatusUpdate }) => {
    const { t } = useTranslation();
    const [filterStatus, setFilterStatus] = useState('all');
    const [activeTab, setActiveTab] = useState('upcoming');

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
        <div className="space-y-4 md:space-y-6">
            {/* Header - Made responsive */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    {t('profile:reservations')}
                    <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-sm">
                        {reservations.length}
                    </span>
                </h4>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full sm:w-auto px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="all">{t('profile:allStatus')}</option>
                    <option value="pending">{t('profile:pending')}</option>
                    <option value="approved">{t('profile:approved')}</option>
                    <option value="rejected">{t('profile:rejected')}</option>
                </select>
            </div>

            {/* Tabs - Made responsive */}
            <div className="flex gap-4 border-b border-gray-200 overflow-x-auto">
                {['upcoming', 'past'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-medium text-sm transition-colors relative whitespace-nowrap
                            ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {t(`profile:${tab}Reservations`)}
                    </button>
                ))}
            </div>

            {/* Empty State - Made responsive */}
            {filteredReservations.length === 0 ? (
                <div className="gap-2 flex flex-col sm:flex-row justify-center items-center bg-gray-50 py-5 rounded-xl">
                    <Calendar className="w-8 h-8 text-gray-600" />
                    <p className="text-gray-600 text-center">{t('profile:noReservationsFound')}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredReservations.map(reservation => (
                        <div
                            key={reservation._id}
                            className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex flex-row    sm:flex-col items-start sm:items-center justify-between gap-4">
                                {/* User Info - Made responsive */}
                                <div className="flex justify-end items-center gap-3 w-full sm:w-auto">
                                    <div className="relative w-12 h-12 flex-shrink-0">
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
                                    <div className="min-w-0 flex-1">
                                        <h5 className="font-medium text-gray-900 truncate">{reservation.user?.userName}</h5>
                                        <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-500">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                                {new Date(reservation.datetime).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4 flex-shrink-0" />
                                                {new Date(reservation.datetime).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons - Made responsive */}
                                <div className="flex justify-end items-center gap-3 w-full sm:w-auto">
                                    {reservation.status === 'pending' ? (
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <button
                                                onClick={() => onStatusUpdate(reservation._id, 'approved')}
                                                className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition-colors"
                                            >
                                                {t('profile:accept')}
                                            </button>
                                            <button
                                                onClick={() => onStatusUpdate(reservation._id, 'rejected')}
                                                className="flex-1 sm:flex-none px-4 py-2 bg-white text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-300 font-medium transition-colors"
                                            >
                                                {t('profile:decline')}
                                            </button>
                                        </div>
                                    ) : (
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                                            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProviderReservations;
