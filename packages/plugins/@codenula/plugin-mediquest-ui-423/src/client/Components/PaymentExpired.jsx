import { useNavigate } from 'react-router-dom';
import '../assets2/css/main.min.css';
import '../assets2/css/external.css';
import '../Pages/PaymentPendingPage.css';
export const PaymentExpired = (props) => {
  const navigate = useNavigate();
  const handleTryAgain = () => {
    // const tryAgainURL = `${ACC_ASIA_URL_FULL}events/${accEvent.id}/registered/${formValues}/${amount}/${netAmt}/${attendeeId}/${orderId}/${after_discount_value}`;
    // navigate(url);
    // window.location.reload();
    window.location.href = '';
    navigate(`/events/${parseInt(props.eventId)}/register`);
    window.location.reload();
  };
  return (
    <div className="payment-pending-container">
      {props.message ? (
        <h2 className="mg-b-40">{props.message}</h2>
      ) : (
        <h2 className="mg-b-40">Payment date has passed, please register.</h2>
      )}
      <button className="btn btn-yellow btn-lg" onClick={handleTryAgain}>
        Try Again
      </button>
    </div>
  );
};
