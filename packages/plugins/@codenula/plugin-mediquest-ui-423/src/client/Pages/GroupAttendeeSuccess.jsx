import { useState, useEffect } from 'react';
import { getGroupAttendeeData } from '../utils/getData';
import { useParams } from 'react-router-dom';
import Loader from '../Components/Loader';
import './PaymentPendingPage.css';
import StyledText from '../Components/StyledText';
import { getAllMessages } from '../utils/message_templates';
import { getGrpLeaderDetails } from '../utils/attendee';
import { replacePlaceholders } from '../utils/custom';

export const GroupAttendeeSuccess = () => {
  const { eventId, attendeeId } = useParams();
  const [message, setMessage] = useState('');
  const [fnMessage, setFnMessage] = useState('');
  const [attendee, setAttendee] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attendee.id) {
      (async () => {
        const attendeeData = await getGroupAttendeeData(parseInt(attendeeId));
        setAttendee(attendeeData);
      })();
    }
  }, [attendeeId, attendee]);

  useEffect(() => {
    (async () => {
      if (!message) {
        const allMsg = await getAllMessages();
        // console.log(allMsg);
        if (attendee.group_attendee_type == 'group_member') {
          const msg = allMsg.find(
            (m) => m.mssg_purpose == 'Group Member Already Registered' && m.eventId == parseInt(eventId),
          );
          setMessage(msg.description);
          setLoading(false);
        } else if (attendee.group_attendee_type == 'group_leader') {
          const msg = allMsg.find(
            (m) => m.mssg_purpose == 'Group Leader Already Registered' && m.eventId == parseInt(eventId),
          );
          setMessage(msg.description);
          setLoading(false);
        }
      }
    })();
  }, [attendee, message, loading]);

  useEffect(() => {
    if (attendee.group_attendee_type == 'group_member' && message) {
      (async () => {
        const leader_data = await getGrpLeaderDetails(attendee?.attendee_company_name, eventId);
        const placeholders = {
          event_name: attendee?.event_name,
          leader_name: leader_data?.full_name,
          company_name: attendee?.attendee_company_name
        }
        const msg = replacePlaceholders(message, placeholders);
        setFnMessage(msg);
      })();
    } else if (attendee.group_attendee_type == 'group_leader' && message) {
      (async () => {
        const placeholders = {
          event_name: attendee?.event_name,
          company_name: attendee?.attendee_company_name
        }
        const msg = replacePlaceholders(message, placeholders);
        setFnMessage(msg);
      })();
    }
  }, [loading, message, attendee, attendeeId]);

  useEffect(() => {
    if (attendee.id && message && fnMessage) {
      setLoading(false);
    }
  }, [attendee, message, attendeeId, fnMessage]);
  return (
    <>
      {loading && <Loader />}
      {!loading && fnMessage && <StyledText htmlContent={fnMessage ? fnMessage : ''} className="payment-pending-container" />}
    </>
  );
};
