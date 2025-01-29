import React, { useState, useEffect } from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { client } from '../../src/lib/sanity';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const ReservationPopup = ({
  isOpen,
  onClose,
  serviceId,
  serviceName,
  providerRef
}) => {
  const [datetime, setDatetime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Verify if the user is logged in
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();

        if (data.authenticated) {
          setUser(data.user); // Set the user object if authenticated
        } else {
          router.push('/login'); // Redirect to login if not authenticated
        }
      } catch (error) {
        console.error('Error verifying user:', error);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [router]);

  const handleDatetimeChange = (e) => {
    setDatetime(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      if (!user) {
        console.error('User not authenticated');
        return;
      }

      const reservation = {
        _type: 'reservation',
        user: { _ref: user.id }, // Use the user ID from the user object
        provider: { _ref: providerRef },
        datetime: new Date(datetime).toISOString(),
        status: 'pending'
      };

      await client.create(reservation);

      setSubmitStatus('success');
      setTimeout(onClose, 2000); // Close the popup after 2 seconds
    } catch (error) {
      console.error('Reservation error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Show a loading state while verifying the user
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white rounded-2xl shadow-2xl w-full mx-4 sm:mx-auto">
        <div className="relative p-4 sm:p-6">
          <DialogHeader className="text-center mb-6">
            <DialogTitle className="text-2xl sm:text-3xl font-bold text-primary">
              Book {serviceName}
            </DialogTitle>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">
              Select your preferred date and time
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date and Time
              </label>
              <div className="flex items-center">
                <input
                  type="datetime-local"
                  name="datetime"
                  required
                  value={datetime}
                  onChange={handleDatetimeChange}
                  className="w-full pl-6 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-sm sm:text-base"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg text-sm sm:text-lg transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Confirm Reservation'}
            </Button>

            {submitStatus === 'success' && (
              <div className="text-center text-green-600 mt-4 text-sm sm:text-base">
                Reservation submitted successfully!
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="text-center text-red-600 mt-4 text-sm sm:text-base">
                Failed to submit reservation. Please try again.
              </div>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationPopup;  