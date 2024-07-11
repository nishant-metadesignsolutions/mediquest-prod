import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../assets2/css/main.min.css';
import '../assets2/css/external.css';
import { RAZORPAY_API_KEY, ACC_ASIA_URL, MEDIQUEST_URL_IMG, ACC_ASIA_URL_FULL } from '../myvars.js';
import Loader from '../Components/Loader';
import { getAllMessages } from '../utils/message_templates';
import StyledText from '../Components/StyledText';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { useAllEventsData } from '../context/EventDetailsProvider';
import { getAttendeeAllDetails, paymentPageVisit } from '../utils/attendee';
import { SessionTimedOut } from './SessionTimedOut';
import { getRazopayKeys } from '../utils/getData.js';
import { ErrorPage } from './ErrorPage';
import { PaymentExpired } from '../Components/PaymentExpired';

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

const RegistrationCompletePage = () => {
  const navigate = useNavigate();
  const { eventId, attendeeId } = useParams();
  const [myLoader, setLoading] = useState(false);
  const [popup, setPopup] = useState(false);
  const [messages, setMessages] = useState([]);
  const [allAttendeeData, setAllAttendeeData] = useState({});
  const [paymentOption, setPaymentOption] = useState('');
  const { allEvents, loading, footerDetails } = useAllEventsData();
  const totalTime = 6 * 60; // 6 minutes * 60 seconds/minute
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [hideTimer, setHideTimer] = useState(false);
  const [curSession, setSession] = useState(false);
  const [razorpayData, setRazorpayData] = useState({});
  const [orderError, setOrderError] = useState(false);
  const [paymentExpired, setPaymentExpired] = useState(false);
  let session = false;
  let paymentSuccess = false;
  let paymentFailure = false;
  useEffect(() => {
    (async () => {
      const allKeys = await getRazopayKeys();
      // console.log(allKeys);
      if (!razorpayData) {
        setRazorpayData(allKeys);
      }
    })();
  }, [razorpayData, loading, paymentOption]);
  useEffect(() => {
    // console.log(session);
    setSession(session);
    // console.log(curSession);
  }, [session]);

  const accEvent = useMemo(() => {
    // Select the event you want to use
    return allEvents.find((e) => e.event_title === 'ACC Asia 2024');
  }, [allEvents]);
  useEffect(() => {
    (async () => {
      const allDetails = await getAttendeeAllDetails(parseInt(attendeeId));
      console.log('allDetails: ', allDetails);
      if (allDetails?.attendeeData?.payment_page_visited) {
        session = true;
        setSession(true);
      }
      setAllAttendeeData(allDetails);
    })();
  }, [attendeeId]);

  const displayRazorpay = async (amt, order_id, razorpay_key) => {
    try {
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      setLoading(true);

      if (!res) {
        alert('You are offline...Failed to load page');
        return;
      }
      const options = {
        key: razorpay_key,
        currency: allAttendeeData.attendeeData.Attendee_country == 'India' ? 'INR' : 'INR',
        order_id: order_id,
        amount: amt * 100,
        name: accEvent && accEvent.razorpay_payment_window_title ? accEvent.razorpay_payment_window_title : 'Razorpay',
        description:
          accEvent && accEvent.razorpay_payment_window_title ? accEvent.razorpay_payment_window_title : 'Razorpay',
        timeout: 300,
        callback_url: `${ACC_ASIA_URL}razorPay:verifyPayment?eventId=${eventId}&attendeeId=${attendeeId}`,
        image:
          accEvent && accEvent.razorpay_payment_window_tile_img.length > 0
            ? `${MEDIQUEST_URL_IMG}${accEvent.razorpay_payment_window_tile_img[0].url}`
            : '',
        // ${ACC_ASIA_URL}
        modal: {
          escape: false,
          ondismiss: function () {
            if (!paymentSuccess && !paymentFailure) {
              session = true;
              setSession(true);
            }
          },
        },
      };
      const paymentObject = new window.Razorpay(options);
      // paymentObject.error(()=>{
      //   return <ErrorPage error={true}/>
      // })
      paymentObject.open();
      paymentObject.on('payment.success', function (response) {
        paymentSuccess = true;
        // Handle payment success
      });
      paymentObject.on('payment.failed', async function (response) {
        paymentFailure = true;
        if (response) {
          paymentObject.close();
          setLoading(true);
          const reqBody = {
            orderId: order_id,
            attendee_Id: attendeeId,
            eventId: eventId,
          };
          // const country = countryList;
          // const countryCode = await getCountryCode(allAttendeeData.attendeeData.Attendee_country, country);
          // const mobNo = `${allAttendeeData.attendeeData.country_code}${allAttendeeData.attendeeData.attendee_contact_number}`;
          const failedPayment = await fetch(`${ACC_ASIA_URL}razorPay:paymentFailed`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(reqBody),
          }).then(
            // ${ACC_ASIA_URL_FULL}
            window.location.replace(`${ACC_ASIA_URL_FULL}events/${eventId}/payment-failed/${parseInt(attendeeId)}`),
          );
        }
      });
      setTimeout(() => {
        if (!session && !paymentSuccess && !paymentFailure) {
          console.log(session);
          navigate(`/payment-pending`);
        }
      }, 420000);
    } catch (err) {
      setOrderError(true);
    }
  };
  const updateTimer = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerInterval); // Clear the interval when timeLeft reaches 0 or below
          navigate(`/events/7/register`);
          return 0; // Set timeLeft to 0 to prevent negative values
        } else {
          return prevTime - 1; // Decrement timeLeft by 1 second
        }
      });
    }, 1000); // Update every second

    return () => clearInterval(timerInterval); // Cleanup function to clear the interval
  }, []);
  useEffect(() => {
    if (paymentOption === 'razorpay' && allAttendeeData?.attendeeData?.razorpay_order_id) {
      displayRazorpay(
        parseFloat(allAttendeeData.registrationFeeToBePaid),
        allAttendeeData.attendeeData.razorpay_order_id,
        razorpayData.key,
      );

      (async () => {
        await paymentPageVisit(parseInt(attendeeId));
      })();
    }
    if (paymentOption === 'razorpay' && !allAttendeeData?.attendeeData?.razorpay_order_id) {
      // return <ErrorPage/>
      setOrderError(true);
    }
  }, [allAttendeeData, paymentOption]);

  useEffect(() => {
    (async function () {
      try {
        setLoading(true);
        const data = await getAllMessages();
        setMessages(data);
      } catch (err) {
        console.log(err);
      }
    })();
  }, [eventId, allAttendeeData]);

  useEffect(() => {
    if (accEvent && messages && allAttendeeData) {
      if (allAttendeeData?.attendeeData) {
        if (!allAttendeeData?.attendeeData?.razorpay_order_id) {
          setOrderError(true);
        } else {
          setLoading(false);
        }
      }
    } else {
      setLoading(true);
    }
  }, [accEvent, messages, allAttendeeData]);
  window.onbeforeunload = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleProceedToPay = async () => {
    if (allAttendeeData.attendeeData && parseInt(allAttendeeData.registrationFeeToBePaid) === 0) {
      const mailBody = {
        email: allAttendeeData?.attendeeData?.attendee_email,
        attendeeId: parseInt(attendeeId),
        paymentAttempted: 'xyz',
      };
      const sendMail = async () => {
        try {
          const response = await fetch(`${ACC_ASIA_URL}send:email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(mailBody),
          });

          if (!response.ok) {
            throw new Error('Failed to send email', response);
          }

          console.log('Email Sent!!!');
        } catch (error) {
          console.error('Error sending email: ', error.message);
        }
      };
      await sendMail();
      navigate(`/events/${eventId}/payment-successfull/${parseInt(attendeeId)}`);
    } else if (
      allAttendeeData &&
      allAttendeeData.attendeeData &&
      allAttendeeData.attendeeData.paymentStatus == 'Completed' &&
      allAttendeeData.attendeeData.razorpay_payment_id
    ) {
      navigate(`/events/${eventId}/payment-successfull/${parseInt(attendeeId)}`);
    } else if (
      allAttendeeData &&
      allAttendeeData.attendeeData &&
      new Date(allAttendeeData.attendeeData.payment_by_date) < new Date()
    ) {
      setPaymentExpired(true);
    } else {
      setPopup(true);
    }
  };
  useEffect(() => {
    if (session) {
      setSession(session);
    }
  }, [session, curSession]);

  return (
    <>
      {myLoader && loading && <Loader />}
      {!myLoader && !loading && !popup && !paymentExpired && !curSession && (
        <>
          <section className="wrapper">
            <Navbar />
            <>
              <section className="outer-box">
                <div className="container">
                  <div className="mg-b-40 text-red1 text-center">
                    {!hideTimer && <p className="text-red1">{`Page will expire in ${updateTimer()}`}</p>}
                  </div>
                  <div className="thankyou">
                    <h2>Thank You!</h2>
                    {messages.length > 0 && (
                      <StyledText
                        className="messages-displayed"
                        htmlContent={
                          messages.length > 0
                            ? messages.find((m) => m.mssg_purpose == 'Registration Confirmation').description
                            : ''
                        }
                      />
                    )}
                  </div>
                  <div className="btn-holder text-center pd-t-10 pd-b-10" style={{ marginTop: '2%' }}>
                    <button className="btn btn-blue btn-lg" onClick={() => handleProceedToPay()}>
                      PROCEED TO PAY
                    </button>
                  </div>
                </div>
              </section>
            </>
            <Footer footerData={footerDetails} />
          </section>
        </>
      )}
      {!myLoader && !loading && popup && !paymentExpired && !curSession && (
        <>
          <section className="wrapper">
            <Navbar />
            <section className="outer-box">
              <div className="container">
                <div className="payment-summary">
                  <div className="payment-page text-center mg-b-40">
                    <div className="mg-b-20 text-red1">
                      {!hideTimer && <p className="text-red1">{`Page will expire in ${updateTimer()}`}</p>}
                    </div>
                    <div className="heading-section mg-b-40">
                      <h4>{accEvent ? accEvent.payment_instruction : ''}</h4>
                    </div>
                    {/* <div className="btn-holder">
                      <button className="btn btn-blue btn-xl" onClick={() => setPaymentOption('razorpay')}>
                        Razorpay
                      </button>
                    </div> */}
                  </div>
                  <div className="heading-section text-center mg-b-20">
                    <h3>Payment Summary</h3>
                  </div>
                  <div className="payment-table-wrap table-wrap">
                    <div className="payment-table table">
                      <div className="thead text-center">
                        <div className="tr">
                          <div className="th">Description</div>
                          <div className="th">
                            {/* {allAttendeeData.attendeeData.Attendee_country == 'India' ? 'Amount (INR)' : 'Amount (USD)'} */}
                            {allAttendeeData?.attendeeData?.Attendee_country == 'India'
                              ? 'Amount (INR)'
                              : 'Amount (INR)'}
                          </div>
                        </div>
                      </div>
                      <div className="tbody">
                        <div className="tr">
                          <div className="td">
                            Registration fee <br />
                            <small>{`(${allAttendeeData?.dateWisePaymentCategory})`}</small>{' '}
                            <small>{`(${allAttendeeData?.curPaymentCategory})`}</small>
                            <br />
                            <small style={{ fontSize: '14px' }}>(Exclusive of taxes)</small>
                          </div>

                          <div className="td">
                            {/* {allAttendeeData.attendeeData.Attendee_country == 'India'
                              ? registrationFee.toFixed(2)
                              : `$ ${registrationFee.toFixed(2)}`} */}
                            {allAttendeeData?.registrationFee.toFixed(2)}
                          </div>
                        </div>
                        {allAttendeeData?.attendeeData?.discount_coupon_used &&
                          allAttendeeData?.serviceAmt &&
                          allAttendeeData?.transactionAmt && (
                            <>
                              <div className="tr">
                                <div className="td text-red1">
                                  <small>
                                    {allAttendeeData?.attendeeData?.discount_coupon_used
                                      ? `Less Coupon discount - (${allAttendeeData?.attendeeData?.discount_coupon_used})`
                                      : ''}
                                  </small>
                                </div>
                                <div className="td text-red1">
                                  {/* {allAttendeeData.attendeeData.Attendee_country == 'India'
                                  ? `- ${(
                                      parseInt(registrationFee) -
                                      parseInt(
                                        parseInt(registrationFeeToBePaid) -
                                          parseInt(
                                            parseInt(parseInt(after_discount) * parseInt(charges.transactionCharge)) /
                                              100,
                                          ) -
                                          parseInt(
                                            parseInt(parseInt(after_discount) * parseInt(charges.serviceCharge)) / 100,
                                          ),
                                      )
                                    ).toFixed(2)}`
                                  : `- $ ${(
                                      parseInt(registrationFee) -
                                      parseInt(
                                        parseInt(registrationFeeToBePaid) -
                                          parseInt(
                                            parseInt(parseInt(after_discount) * parseInt(charges.transactionCharge)) /
                                              100,
                                          ) -
                                          parseInt(
                                            parseInt(parseInt(after_discount) * parseInt(charges.serviceCharge)) / 100,
                                          ),
                                      )
                                    ).toFixed(2)}`} */}
                                  {allAttendeeData?.attendeeData?.Attendee_country == 'India'
                                    ? `- ${(
                                        parseFloat(allAttendeeData?.registrationFee) -
                                        parseFloat(
                                          parseFloat(allAttendeeData?.registrationFeeToBePaid) -
                                            parseFloat(
                                              parseFloat(
                                                parseFloat(allAttendeeData?.after_discount_value) *
                                                  parseFloat(allAttendeeData?.serviceCharge),
                                              ) / 100,
                                            ) -
                                            parseFloat(
                                              parseFloat(
                                                parseFloat(allAttendeeData?.after_discount_value) *
                                                  parseFloat(allAttendeeData?.transactionCharge),
                                              ) / 100,
                                            ),
                                        )
                                      ).toFixed(2)}`
                                    : `- ${(
                                        parseFloat(allAttendeeData?.registrationFee) -
                                        parseFloat(
                                          parseFloat(allAttendeeData?.registrationFeeToBePaid) -
                                            parseFloat(
                                              parseFloat(
                                                parseFloat(allAttendeeData?.after_discount_value) *
                                                  parseFloat(allAttendeeData?.serviceCharge),
                                              ) / 100,
                                            ) -
                                            parseFloat(
                                              parseFloat(
                                                parseFloat(allAttendeeData?.after_discount_value) *
                                                  parseFloat(allAttendeeData?.transactionCharge),
                                              ) / 100,
                                            ),
                                        )
                                      ).toFixed(2)}`}
                                </div>
                              </div>
                              <div className="tr">
                                <div className="td">Total:</div>
                                <div className="td">
                                  {parseFloat(
                                    parseFloat(allAttendeeData?.registrationFee) -
                                      parseFloat(
                                        parseFloat(allAttendeeData?.registrationFee) -
                                          parseFloat(
                                            parseFloat(allAttendeeData?.registrationFeeToBePaid) -
                                              parseFloat(
                                                parseFloat(
                                                  parseFloat(allAttendeeData?.after_discount_value) *
                                                    parseFloat(allAttendeeData?.transactionCharge),
                                                ) / 100,
                                              ) -
                                              parseFloat(
                                                parseFloat(
                                                  parseFloat(allAttendeeData?.after_discount_value) *
                                                    parseFloat(allAttendeeData?.serviceCharge),
                                                ) / 100,
                                              ),
                                          ),
                                      ),
                                  ).toFixed(2)}
                                </div>
                              </div>
                            </>
                          )}
                        {allAttendeeData?.serviceAmt && allAttendeeData?.transactionAmt && (
                          <>
                            <div className="tr">
                              <div className="td">
                                <small>
                                  {allAttendeeData && allAttendeeData?.curPaymentMethod
                                    ? allAttendeeData?.curPaymentMethod?.additional_charge_two_title
                                    : ''}
                                </small>
                              </div>
                              <div className="td">
                                {/* {allAttendeeData.attendeeData.Attendee_country == 'India'
                                  ? `+ ${(
                                      (parseFloat(after_discount) * parseFloat(charges.transactionCharge)) /
                                      100
                                    ).toFixed(2)}`
                                  : `+  $ ${(
                                      (parseFloat(after_discount) * parseFloat(charges.transactionCharge)) /
                                      100
                                    ).toFixed(2)}`} */}
                                {allAttendeeData?.attendeeData?.Attendee_country == 'India'
                                  ? `+ ${allAttendeeData?.transactionAmt.toFixed(2)}`
                                  : `+ ${allAttendeeData?.transactionAmt.toFixed(2)}`}
                              </div>
                            </div>
                            <div className="tr">
                              <div className="td">
                                <small>
                                  {allAttendeeData && allAttendeeData?.curPaymentMethod
                                    ? allAttendeeData?.curPaymentMethod?.additional_charge_one_title
                                    : ''}
                                </small>
                              </div>
                              <div className="td">
                                {/* {allAttendeeData.attendeeData.Attendee_country == 'India'
                                  ? `+ ${((parseFloat(after_discount) * parseInt(charges.serviceCharge)) / 100).toFixed(
                                      2,
                                    )}`
                                  : `+  $ ${(
                                      (parseInt(after_discount) * parseInt(charges.serviceCharge)) /
                                      100
                                    ).toFixed(2)}`} */}
                                {allAttendeeData.attendeeData?.Attendee_country == 'India'
                                  ? `+ ${allAttendeeData?.serviceAmt.toFixed(2)}`
                                  : `+ ${allAttendeeData?.serviceAmt.toFixed(2)}`}
                              </div>
                            </div>
                          </>
                        )}
                        <div className="tr">
                          <div className="td">Total Amount to pay</div>
                          <div className="td">
                            {/* {allAttendeeData.attendeeData.Attendee_country == 'India'
                              ? registrationFeeToBePaid.toFixed(2)
                              : `$ ${registrationFeeToBePaid.toFixed(2)}`} */}
                            {Math.round(allAttendeeData?.registrationFeeToBePaid.toFixed(2))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="btn-holder text-center mg-t-40">
                      <button
                        className="btn btn-blue btn-lg"
                        onClick={() => {
                          setPaymentOption('razorpay');
                          setTimeLeft(10000);
                          setHideTimer(true);
                        }}
                      >
                        MAKE PAYMENT
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <Footer footerData={footerDetails} />
          </section>
        </>
      )}
      {paymentExpired && <PaymentExpired message={accEvent?.payment_date_passed_message} eventId={eventId}/>}
      {curSession && <SessionTimedOut attendeeId={parseInt(attendeeId)} />}
      {orderError && <ErrorPage error={true} />}
    </>
  );
};

export default RegistrationCompletePage;
