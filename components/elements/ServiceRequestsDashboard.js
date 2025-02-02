import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Check, Clock, Calendar, MessageSquare,
    X, RefreshCw, ChevronRight, Trash2
} from 'lucide-react';
import { client, urlFor } from '../../src/lib/sanity';
import Image from 'next/image';
import userFallbackImage from "../../public/assets/imgs/elements/user.png";


const ServiceRequestsSection = ({ providerId }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [responseMessage, setResponseMessage] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [activeTab, setActiveTab] = useState('sent');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const query = `{
                    "sent": *[_type == "serviceRequest" && requesterProviderRef._ref == $providerId]{
                        _id,
                        requestedServiceRef->{
                            _id,
                            name_en,
                            image,
                            provider->{
                                _id,
                                name_en
                            }
                        },
                        status,
                        notes,
                        _createdAt,
                        "type": "sent"
                    },
                    "received": *[_type == "serviceRequest" && receiverProviderRef._ref == $providerId]{
                        _id,
                        requesterProviderRef->{
                            _id,
                            name_en,
                            userRef->{
                                image,
                                userName,
                                email
                            }
                        },
                        status,
                        notes,
                        _createdAt,
                        "type": "received"
                    }
                }`;

                const result = await client.fetch(query, { providerId });
                const allRequests = [...result.sent, ...result.received];

                // Sort by date, pending first
                const sortedRequests = allRequests.sort((a, b) => {
                    if (a.status === 'pending' && b.status !== 'pending') return -1;
                    if (a.status !== 'pending' && b.status === 'pending') return 1;
                    return new Date(b._createdAt) - new Date(a._createdAt);
                });

                setRequests(sortedRequests);
            } catch (error) {
                console.error('Error fetching requests:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [providerId]);


    const handleStatusUpdate = async (requestId, newStatus) => {
        try {
            await client
                .patch(requestId)
                .set({
                    status: newStatus,
                    notes: responseMessage
                })
                .commit();

            setRequests(prev =>
                prev.map(request =>
                    request._id === requestId
                        ? { ...request, status: newStatus, notes: responseMessage }
                        : request
                )
            );

            setResponseMessage('');
            setSelectedRequest(null);
        } catch (error) {
            console.error('Error updating request status:', error);
        }
    };

    const handleDeleteRequest = async (requestId) => {
        try {
            await client.delete({ query: `*[_id == "${requestId}"]` });
            setRequests(prev => prev.filter(request => request._id !== requestId));
        } catch (error) {
            console.error('Error deleting request:', error);
        }
    };

    const filteredRequests = requests.filter(request => {
        const matchesTab = request.type === activeTab;
        const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
        return matchesTab && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex justify-center p-4">
                <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Service Requests
                    <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-sm">
                        {filteredRequests.length}
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
            <div className="flex gap-4 border-b border-gray-200">
                {['sent', 'received'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-medium text-sm transition-colors relative 
                            ${activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)} Requests
                        {activeTab === tab && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Requests List */}
            <div className="space-y-3">
                {filteredRequests.length === 0 ? (
                    <div className="gap-2 flex justify-center items-center bg-gray-50 py-5">
                        <MessageSquare className="w-8 h-8 text-gray-600" />
                        <p className="text-gray-600">No {activeTab} requests found</p>
                    </div>
                ) : (
                    filteredRequests.map(request => (
                        <motion.div
                            key={request._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-gray-50 rounded-xl hover:border-gray-200/60 transition-colors"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Image
                                            src={request.type === 'sent'
                                                ? (request.requestedServiceRef?.image ? urlFor(request.requestedServiceRef.image).url() : userFallbackImage)
                                                : (request.requesterProviderRef?.userRef?.image ? urlFor(request.requesterProviderRef.userRef.image).url() : userFallbackImage)}
                                            alt="Profile"
                                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                                            width={12}
                                            height={12}
                                        />
                                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white
                                            ${request.status === 'pending' ? 'bg-yellow-500' :
                                                request.status === 'approved' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                            {request.status === 'pending' ? (
                                                <Clock className="w-3 h-3 text-white" />
                                            ) : request.status === 'approved' ? (
                                                <Check className="w-3 h-3 text-white" />
                                            ) : (
                                                <X className="w-3 h-3 text-white" />
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="font-medium text-gray-900">
                                            {request.type === 'sent'
                                                ? `Requesting to join: ${request.requestedServiceRef?.name_en}`
                                                : `Request from: ${request.requesterProviderRef?.name_en}`}
                                        </h5>
                                        <div className="flex gap-2 mt-1 text-sm text-gray-500">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(request._createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {request.status === 'pending' && (
                                        <>
                                            {request.type === 'sent' ? (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    onClick={() => handleDeleteRequest(request._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </motion.button>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <motion.button
                                                        whileHover={{ y: -2 }}
                                                        onClick={() => handleStatusUpdate(request._id, 'approved')}
                                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition-colors"
                                                    >
                                                        Accept
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ y: -2 }}
                                                        onClick={() => handleStatusUpdate(request._id, 'rejected')}
                                                        className="px-4 py-2 bg-transparent text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-300 font-medium transition-colors"
                                                    >
                                                        Decline
                                                    </motion.button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    {request.status !== 'pending' && (
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium
                                            ${request.status === 'approved'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : 'bg-red-100 text-red-800'}`}>
                                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
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

export default ServiceRequestsSection;