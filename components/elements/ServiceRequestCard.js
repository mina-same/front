import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Check, X } from 'lucide-react';
import { createClient } from '@sanity/client';
import { client, urlFor } from "../../src/lib/sanity";

const ServiceRequestCard = ({ request, currentProviderId, onStatusUpdate, onDelete }) => {
    const [loading, setLoading] = React.useState(false);
    const [notes, setNotes] = React.useState(request.notes || '');
    const isRequester = request.requesterProviderRef._ref === currentProviderId;

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this request?')) return;
        setLoading(true);
        try {
            await client.delete(request._id);
            onDelete(request._id);
        } catch (error) {
            console.error('Error deleting request:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setLoading(true);
        try {
            const updatedRequest = await client
                .patch(request._id)
                .set({
                    status: newStatus,
                    notes: notes,
                })
                .commit();
            onStatusUpdate(updatedRequest);
        } catch (error) {
            console.error('Error updating request:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto mb-4">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">
                        {isRequester ? 'Your Request to Join' : 'Request to Join Your Service'}
                    </h3>
                    <Badge className={getStatusColor(request.status)}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent>
                <div className="space-y-4">
                    {isRequester ? (
                        // Requester View
                        <div>
                            <p className="text-sm text-gray-600">
                                You requested to join service:{' '}
                                <span className="font-semibold">{request.requestedServiceRef.name_en}</span>
                            </p>
                            {request.notes && (
                                <div className="mt-2">
                                    <p className="text-sm font-medium">Notes:</p>
                                    <p className="text-sm text-gray-600">{request.notes}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Service Owner View
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Request from provider:{' '}
                                <span className="font-semibold">{request.requesterProviderRef.name_en}</span>
                            </p>
                            {request.status === 'pending' && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Response Notes:</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                        rows={3}
                                        placeholder="Add any notes about your decision..."
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="flex justify-end space-x-2">
                {isRequester ? (
                    request.status === 'pending' && (
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={loading}
                            className="flex items-center"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Cancel Request
                        </Button>
                    )
                ) : (
                    request.status === 'pending' && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => handleStatusUpdate('rejected')}
                                disabled={loading}
                                className="flex items-center"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Reject
                            </Button>
                            <Button
                                variant="default"
                                onClick={() => handleStatusUpdate('approved')}
                                disabled={loading}
                                className="flex items-center"
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Approve
                            </Button>
                        </>
                    )
                )}
            </CardFooter>
        </Card>
    );
};

// Container component to handle multiple requests
const ServiceRequestsList = ({ requests, currentProviderId }) => {
    const [serviceRequests, setServiceRequests] = React.useState(requests);

    const handleStatusUpdate = (updatedRequest) => {
        setServiceRequests(prev =>
            prev.map(request =>
                request._id === updatedRequest._id ? updatedRequest : request
            )
        );
    };

    const handleDelete = (requestId) => {
        setServiceRequests(prev =>
            prev.filter(request => request._id !== requestId)
        );
    };

    return (
        <div className="space-y-4 p-4">
            {serviceRequests.map((request) => (
                <ServiceRequestCard
                    key={request._id}
                    request={request}
                    currentProviderId={currentProviderId}
                    onStatusUpdate={handleStatusUpdate}
                    onDelete={handleDelete}
                />
            ))}
            {serviceRequests.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                    No service requests found
                </div>
            )}
        </div>
    );
};

export default ServiceRequestsList;