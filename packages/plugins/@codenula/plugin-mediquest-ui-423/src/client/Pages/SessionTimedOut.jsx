import { useEffect, useMemo, useState } from 'react';
import '../assets2/css/main.min.css';
import '../assets2/css/external.css';
import './PaymentPendingPage.css';
import { useAllEventsData } from '../context/EventDetailsProvider';
import Loader from '../Components/Loader';
import { paymentPageVisitReset } from '../utils/attendee';

export const SessionTimedOut = (props) => {
  const { allEvents, loading } = useAllEventsData();
  const [myLoader, setLoading] = useState(true);

  const accEvent = useMemo(() => {
    return allEvents.find((e) => e.event_title === 'ACC Asia 2024');
  }, [allEvents]);

  useEffect(() => {
    if (accEvent) {
      setLoading(false);
    }
  }, [loading, myLoader, accEvent]);

  const handleTryAgain = async () => {
    await paymentPageVisitReset(parseInt(props?.attendeeId));
    window.location.reload();
  };
  
  return (
    <>
      {(loading || myLoader) && <Loader />}
      {!loading && !myLoader && (
        <div className="payment-pending-container">
          <h1>Oops!</h1>
          <h2 className="mg-b-40">{accEvent?.timeout_message}</h2>
          <button className="btn btn-yellow btn-lg" onClick={handleTryAgain}>
            Try Again
          </button>
        </div>
      )}
    </>
  );
};
