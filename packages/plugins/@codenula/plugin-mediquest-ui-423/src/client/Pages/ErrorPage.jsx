import { useNavigate } from 'react-router-dom';
import '../assets2/css/main.min.css';
import '../assets2/css/external.css';
import './PaymentPendingPage.css';
import React from 'react';
export const ErrorPage = (props) => {
  const navigate = useNavigate();
  const handleTryAgain = () => {
    // const tryAgainURL = `${ACC_ASIA_URL_FULL}events/${accEvent.id}/registered/${formValues}/${amount}/${netAmt}/${attendeeId}/${orderId}/${after_discount_value}`;
    // navigate(url);
    // window.location.reload();
    window.location.href = '';
    navigate('/events/7/register');
    window.location.reload();
  };
  return (
    <div className="payment-pending-container">
      {!props.error && <h1>Sorry!</h1>}
      {props.error && <h1>Oops!</h1>}
      {!props.error && <h2 className="mg-b-40">Your page does not exist</h2>}
      {props.error && <h2 className="mg-b-40">Some error occured while processing your request</h2>}
      <button className="btn btn-yellow btn-lg" onClick={handleTryAgain}>
        Try Again
      </button>
    </div>
  );
};
