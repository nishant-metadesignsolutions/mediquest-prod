import { useState, useEffect } from 'react';
import { getAttendeeData } from '../utils/getData';
import { useParams } from 'react-router-dom';
import Loader from '../Components/Loader';
import './PaymentPendingPage.css';

export const AttendeeSuccess = () => {
  const { eventId, attendeeId } = useParams();
  const [attendee, setAttendee] = useState({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const attendeeData = await getAttendeeData(parseInt(attendeeId));
      setAttendee(attendeeData);
    })();
  }, [attendeeId]);

  useEffect(() => {
    if (attendee) {
      setLoading(false);
    }
  }, [attendee]);
  return (
    <>
      {loading && <Loader />}
      {!loading && (
        <div className="payment-pending-container">
          <h1>Thank you!</h1>
          <h2>You have already registered for the ACC ASIA 2024.</h2>
          <p>
            We have already sent a confirmation details to your registered email id: {attendee?.attendee_email} from
            info@accasia2024.in
          </p>
        </div>
      )}
    </>
  );
};
