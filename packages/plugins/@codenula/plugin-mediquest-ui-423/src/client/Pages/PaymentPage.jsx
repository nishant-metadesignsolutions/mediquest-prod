import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { COLLECTION_AUTH_TOKEN, MEDIQUEST_URL, ACC_ASIA_URL } from '../myvars.js';
import { RAZORPAY_API_KEY } from '../myvars.js';
import Loader from '../Components/Loader.jsx';
const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });
};
const getOrderDetails = async (orderID) => {
  const data = await fetch(`${ACC_ASIA_URL}razorPay:getOrder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ order_id: orderID }),
  });

  const res = await data.json();
  const allPayment = res.data.items;
  const lastPayment = allPayment[allPayment.length - 1];
  return lastPayment;
};
const PaymentPage = () => {
  const navigate = useNavigate();
  const { eventId, formValues, amtToPay, attendeeId, orderId } = useParams();
  const parsedFormValues = JSON.parse(decodeURIComponent(formValues));
  // const parsedFormValues = JSON.parse(formValues);
  const [loading, setLoading] = useState(false);
  const [paymentOption, setPaymentOption] = useState(''); // State to track selected payment option
  // const [orderId, setOrderId] = useState('');
  const [status, setStatus] = useState('');
  async function updatePaymentStatus(paymentAttempted) {
    const attendeeUpdateURL = `${MEDIQUEST_URL}attendees:update?filterByTk=${parseInt(attendeeId)}`;
    const updatePayment = await fetch(attendeeUpdateURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
      body: JSON.stringify({ paymentStatus: 'Completed', paymentsAttemptedId: paymentAttempted }),
    });
    const res = await updatePayment.json();
    console.log(res);
    return res.data[0].id;
  }
  async function createPaymentAttempted(body) {
    const paymentAttemptedURL = `${MEDIQUEST_URL}paymentsAttempted:create`;
    const requestBody = {
      payment_id: body.id,
      payment_status: body.status,
      payment_amount: body.amount / 100,
      payment_date: new Date(),
      order_id: body.order_id,
    };
    const createPayment = await fetch(paymentAttemptedURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
      body: JSON.stringify(requestBody),
    });
    const res = await createPayment.json();
    console.log(res);
    return res.data;
  }
  const displayRazorpay = async (amt, orderId) => {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    setLoading(true);

    if (!res) {
      alert('You are offline...Failed to load page');
      return;
    }

    const options = {
      key: RAZORPAY_API_KEY,
      currency: parsedFormValues.countryId == 'India' ? 'INR' : 'USD',
      order_id: orderId,
      amount: amt * 100,
      name: 'Mediquest',
      description: 'Event ticket booking',
      timeout: 300,
      callback_url: `${ACC_ASIA_URL}razorPay:verifyPayment?eventId=${eventId}&formValues=${formValues}&attendeeId=${attendeeId}&orderId=${orderId}`,
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
    paymentObject.on('payment.failed', async function (response) {
      if (response) {
        paymentObject.close();
        setLoading(true);
        const reqBody = {
          orderId: orderId,
          attendeeId: attendeeId,
          eventId: eventId,
        };
        const failedPayment = await fetch(`${ACC_ASIA_URL}razorPay:paymentFailed`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reqBody),
        }).then(navigate(`/events/${eventId}/payment-failed/${parseInt(attendeeId)}`));
      }
      // console.log(response);
    });
    setTimeout(() => {
      paymentObject.on('payment.authorized', async function (response) {
        if (response) {
          paymentObject.close();
          setLoading(true);
          const data = await response.json();
          console.log('Payment Pending', data);
          navigate(`/payment-pending`);
        }
        // console.log(response);
      });
    }, 7000);
  };

  useEffect(() => {
    if (paymentOption === 'razorpay' && orderId !== null && orderId !== undefined && orderId !== '') {
      displayRazorpay(parseFloat(amtToPay), orderId);
    }
  }, [amtToPay, orderId, paymentOption]);

  // const handleChequePayment = () => {
  //   // Implement cheque payment logic here
  //   // Example: navigate('/cheque-payment'); (replace with actual cheque payment page)
  //   alert('Redirecting to cheque payment page...');
  // };

  // const handleBack = () => {
  //   navigate(-1); // Navigate back to the previous page
  // };

  return (
    <>
      {loading && <Loader />}
      {!loading && (
        <div className="payment-page-container">
          <h3>Kindly select your payment option to proceed further:</h3>
          <div className="payment-options-container">
            <div className="payment-options">
              <button onClick={() => setPaymentOption('razorpay')}>Pay with Razorpay</button>
            </div>
            <div className="payment-details">
              <div>
                <h3>Amount to be Paid:</h3>
                <p>{amtToPay}</p>
              </div>

              {/* {paymentOption === 'cheque' && (
            <div>
              <h3>Amount to be Paid:</h3>
              <p>{amtToPay}</p>
              <h3>Cheque Payment Details:</h3>
              <label>Cheque Number:</label>
              <input type="text" />
              <button type="button" onClick={handleChequePayment}>
                Pay by Cheque
              </button>
            </div>
          )} */}
            </div>
          </div>
          {/* <button type="button" onClick={handleBack}>
        Back
      </button> */}
        </div>
      )}
    </>
  );
};

export default PaymentPage;
