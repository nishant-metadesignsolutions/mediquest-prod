// import React from 'react';
import { useParams } from 'react-router-dom';
import './PaymentPendingPage.css';
import StyledText from '../Components/StyledText';
import { useEffect, useState } from 'react';
import { getAllMessages } from '../utils/message_templates';
import Loader from '../Components/Loader';

export const GroupRegComplete = () => {
  const { eventId } = useParams();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      if (!message) {
        const allMsg = await getAllMessages();
        // console.log(allMsg);
        const msg = allMsg.find(
          (m) => m.mssg_purpose == 'Group Registration Success' && m.eventId == parseInt(eventId),
        );
        setMessage(msg.description);
        setLoading(false);
      }
    })();
  }, [message, loading]);
  return (
    <>
      {loading && <Loader />}
      {!loading && message && <StyledText htmlContent={message ? message : ''} className="payment-pending-container" />}
    </>
  );
};
