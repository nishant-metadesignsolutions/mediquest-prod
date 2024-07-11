import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Loader from '../Components/Loader';
// import { ACC_ASIA_URL_FULL } from '../myvars';
import { useAllEventsData } from '../context/EventDetailsProvider';
import '../assets2/css/main.min.css';
import '../assets2/css/external.css';
import { getAllMessages } from '../utils/message_templates';
import StyledText from '../Components/StyledText';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { getAttendeeAllDetails } from '../utils/attendee';

const PaymentFailurePage = () => {
  const navigate = useNavigate();
  // const { eventId, transactionId, formValues, attendeeId, amount, mobNo, netAmt, orderId, after_discount_value } =
  const { eventId, attendeeId } = useParams();
  const [myLoader, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [attendeeAllData, setAttendeeAllData] = useState({});
  const { allEvents, loading, footerDetails } = useAllEventsData();

  const accEvent = useMemo(() => {
    // Select the event you want to use
    return allEvents.find((e) => e.event_title === 'ACC Asia 2024');
  }, [allEvents]);
  useEffect(() => {
    (async () => {
      const allDetails = await getAttendeeAllDetails(parseInt(attendeeId));
      setAttendeeAllData(allDetails);
    })();
  }, [attendeeId]);
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
  }, [eventId]);
  useEffect(() => {
    if (accEvent && messages && attendeeAllData && attendeeAllData.attendeeData) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [accEvent, messages, attendeeAllData, attendeeAllData.attendeeData]);

  // useEffect(() => {
  //   if (!accEvent) {
  //     setLoading(true);
  //   } else {
  //     setLoading(false);
  //   }
  // }, [accEvent]);

  const handleTryAgain = () => {
    // const tryAgainURL = `${ACC_ASIA_URL_FULL}events/${accEvent.id}/registered/${formValues}/${amount}/${netAmt}/${attendeeId}/${orderId}/${after_discount_value}`;
    navigate(-1);
  };
  return (
    <>
      {myLoader && loading && <Loader />}
      {!myLoader && !loading && (
        <>
          <section className="wrapper">
            <Navbar />
            <section className="outer-box">
              <div className="container">
                <div className="transaction-summary">
                  <div className="transaction-page mg-b-40">
                    <h2 className="mg-b-20">Sorry!</h2>
                    <StyledText
                      htmlContent={
                        messages.length > 0
                          ? messages.find((m) => m.mssg_purpose == 'Transaction Failed').description
                          : ''
                      }
                    />
                  </div>
                  <div className="btn-holder text-center mg-b-50">
                    <button className="btn btn-yellow btn-lg" onClick={handleTryAgain}>
                      Try Again
                    </button>
                  </div>
                  <div className="heading-section mg-b-20 mg-t-20">
                    <h4 className="font-arial-bold">Failed transaction Summary</h4>
                  </div>
                  <div className="transaction-table-wrap table-wrap">
                    <div className="transaction-table table">
                      <div className="tbody">
                        <div className="tr">
                          <div className="td">Registration Id</div>
                          <div className="td">Name</div>
                          {/* <div className="td">{decodedFormValues.countryId == 'India' ? 'Amount (INR)' : 'Amount (USD)'}</div> */}
                          <div className="td">
                            {attendeeAllData?.attendeeData?.Attendee_country == 'India'
                              ? 'Amount (INR)'
                              : 'Amount (INR)'}
                          </div>
                        </div>
                        <div className="tr">
                          <div className="td">--</div>
                          <div className="td">{`${attendeeAllData?.attendeeData?.attendee_first_name} ${' '} ${attendeeAllData?.attendeeData?.attendee_last_name}`}</div>
                          <div className="td text-red1">
                            {attendeeAllData?.attendeeData?.paymentAmount
                              ? Math.round(attendeeAllData?.attendeeData?.paymentAmount)
                              : '--'}
                          </div>
                        </div>
                        <div className="tr">
                          <div className="td">Transaction Id</div>
                          <div className="td">Email</div>
                          <div className="td">Mobile</div>
                        </div>
                        <div className="tr">
                          <div className="td text-red1">
                            {attendeeAllData?.attendeeData?.razorpay_payment_id
                              ? attendeeAllData.attendeeData?.razorpay_payment_id
                              : '--'}
                          </div>
                          <div className="td">{attendeeAllData?.attendeeData?.attendee_email}</div>
                          <div className="td">
                            +
                            {`${attendeeAllData?.attendeeData?.country_code}${attendeeAllData?.attendeeData?.attendee_contact_number}`}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="btn-holder text-center mg-t-40">
                      <button className="btn btn-blue btn-lg mg-r-40" onClick={() => window.print()}>
                        PRINT
                      </button>
                      {accEvent && accEvent.homeButtonText && accEvent.homeButtonUrl && (
                        <Link to={accEvent && accEvent.homeButtonUrl ? accEvent.homeButtonUrl : '#'}>
                          <button className="btn btn-blue btn-lg">
                            {accEvent && accEvent.homeButtonText ? accEvent.homeButtonText : 'HOME'}
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <Footer footerData={footerDetails} />
          </section>
        </>
      )}
    </>
  );
};

export default PaymentFailurePage;
