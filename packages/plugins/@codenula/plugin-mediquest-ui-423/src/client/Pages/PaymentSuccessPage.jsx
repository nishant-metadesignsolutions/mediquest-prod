import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Loader from '../Components/Loader';
import { useAllEventsData } from '../context/EventDetailsProvider';
import '../assets2/css/main.min.css';
import '../assets2/css/external.css';
import { getAllMessages } from '../utils/message_templates';
import StyledText from '../Components/StyledText';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { getAttendeeAllDetails } from '../utils/attendee';

const PaymentSuccessPage = () => {
  // const { eventId, transactionId, formValues, attendeeId, amount, mobNo } = useParams();
  const { eventId, attendeeId } = useParams();
  const [myLoader, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const { allEvents, loading, footerDetails } = useAllEventsData();
  const [attendeeAllData, setAttendeeAllData] = useState({});
  // const decodedFormValues = JSON.parse(decodeURIComponent(formValues));

  const accEvent = useMemo(() => {
    // Select the event you want to use
    return allEvents.find((e) => e.event_title === 'ACC Asia 2024');
  }, [allEvents]);
  useEffect(()=>{
    (async ()=>{
      const allDetails = await getAttendeeAllDetails(parseInt(attendeeId));
      setAttendeeAllData(allDetails);
    })()
  },[attendeeId])
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
    if (accEvent && messages && attendeeAllData) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [accEvent, messages, attendeeAllData]);

  useEffect(() => {
    if (!accEvent) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [accEvent]);
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
                    <h2 className="mg-b-20">Thank You!</h2>
                    <StyledText
                      htmlContent={
                        messages.length > 0
                          ? messages.find((m) => m.mssg_purpose == 'Transaction Success').description
                          : ''
                      }
                    />
                    <div className="heading-section mg-b-20 mg-t-20">
                      <h4 className="font-arial-bold">Registration and Payment Summary</h4>
                    </div>
                    <div className="transaction-table-wrap table-wrap">
                      <div className="transaction-table table">
                        <div className="tbody">
                          <div className="tr">
                            <div className="td">Registration Id</div>
                            <div className="td">Name</div>
                            {/* <div className="td">{decodedFormValues.countryId == 'India' ? 'Amount (INR)' : 'Amount (USD)'}</div> */}
                            <div className="td">
                              {attendeeAllData?.attendeeData?.Attendee_country == 'India' ? 'Amount (INR)' : 'Amount (INR)'}
                            </div>
                          </div>
                          <div className="tr">
                            <div className="td">{`ACCASIA0${parseInt(attendeeId)}`}</div>
                            <div className="td">{`${attendeeAllData?.attendeeData?.attendee_first_name} ${' '} ${attendeeAllData?.attendeeData?.attendee_last_name}`}</div>
                            <div className="td">{attendeeAllData?.attendeeData?.paymentAmount? Math.round(attendeeAllData?.attendeeData?.paymentAmount): '--'}</div>
                          </div>
                          <div className="tr">
                            <div className="td">Transaction Id</div>
                            <div className="td">Email</div>
                            <div className="td">Mobile</div>
                          </div>
                          <div className="tr">
                            <div className="td">{attendeeAllData?.attendeeData?.razorpay_payment_id? attendeeAllData.attendeeData.razorpay_payment_id: `acc_full_discount${attendeeAllData?.attendeeData?.id}`}</div>
                            <div className="td">{attendeeAllData?.attendeeData?.attendee_email}</div>
                            <div className="td">+{`${attendeeAllData?.attendeeData?.country_code}${attendeeAllData?.attendeeData?.attendee_contact_number}`}</div>
                          </div>
                        </div>
                      </div>
                      <div className="btn-holder text-center mg-t-40">
                        <button className="btn btn-blue btn-lg mg-r-40" onClick={() => window.print()}>
                          PRINT
                        </button>
                        {accEvent && accEvent.homeButtonText && accEvent.homeButtonUrl && (
                          <Link to={accEvent && accEvent.homeButtonUrl ? accEvent.homeButtonUrl : ''}>
                            <button className="btn btn-blue btn-lg">
                              {accEvent && accEvent.homeButtonText ? accEvent.homeButtonText : ''}
                            </button>
                          </Link>
                        )}
                      </div>
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

export default PaymentSuccessPage;
