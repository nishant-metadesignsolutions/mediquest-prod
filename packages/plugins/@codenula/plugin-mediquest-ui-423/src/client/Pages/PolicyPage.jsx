import { useMemo, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAllEventsData } from '../context/EventDetailsProvider';
import Loader from '../Components/Loader';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import StyledText from '../Components/StyledText';
import '../assets2/css/main.min.css';
import '../assets2/css/external.css';

export const PolicyPage = () => {
  const { hash } = useLocation();
  const termsConditionsRef = useRef(null);
  const privacyPolicyRef = useRef(null);
  const cancellationsRefundRef = useRef(null);
  const { allEvents, loading, footerDetails } = useAllEventsData();
  const accEvent = useMemo(() => {
    // Select the event you want to use
    return allEvents.find((e) => e.event_title === 'ACC Asia 2024');
  }, [allEvents]);
  // useEffect(() => {
     
  //   const targetElement = document.getElementById(hash.slice(1));
  //   if (targetElement) {
  //     targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  //   }
  // }, [loading, accEvent,hash]);
  useEffect(() => {
    const scrollToRef = (ref) => {
      if (ref.current) {
        const topOffset = ref.current.offsetTop;
        window.scrollTo({ top: topOffset, behavior: 'smooth' });
      }
    };
    const hashValue = hash.slice(1);

    switch (hashValue) {
      case 'termsConditions':
        scrollToRef(termsConditionsRef);
        break;
      case 'privacyPolicy':
        scrollToRef(privacyPolicyRef);
        break;
      case 'cancellationsRefund':
        scrollToRef(cancellationsRefundRef);
        break;
      default:
        break;
    }
  }, [loading, accEvent,hash]);
  return (
    <>
      {loading && <Loader />}
      {!loading && accEvent && footerDetails && (
        <>
        <section className='wrapper'>
          <Navbar />
          <section className="outer-box policy-page">
            <div className="content-wrapper" id="termsConditions" ref={termsConditionsRef}>
              <div className="container">
                <div className="heading-section text-center mg-b-30">
                  <h3 className="text-blue">{accEvent ? accEvent.TnC_title : ''}</h3>
                </div>
                <StyledText htmlContent={accEvent ? accEvent.terms_conditions : ''} />
              </div>
            </div>
            <div className="content-wrapper policypage" id="privacyPolicy" ref={privacyPolicyRef}>
              <div className="container">
                <div className="heading-section text-center mg-b-30">
                  <h3 className="text-blue">{accEvent ? accEvent.privacy_title : ''}</h3>
                </div>
                <StyledText htmlContent={accEvent ? accEvent.privacy_policy : ''} />
              </div>
            </div>
            <div className="content-wrapper policypage" id="cancellationsRefund" ref={cancellationsRefundRef}>
              <div className="container">
                <div className="heading-section text-center mg-b-30">
                  <h3 className="text-blue">{accEvent ? accEvent.cancellation_title : ''}</h3>
                </div>
                <StyledText htmlContent={accEvent ? accEvent.cancellation_refunds : ''} />
              </div>
            </div>
          </section>

          <Footer footerData={footerDetails ? footerDetails : ''} />
          </section>
        </>
      )}
    </>
  );
};
