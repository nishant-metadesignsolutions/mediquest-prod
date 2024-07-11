import { useMemo, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAllEventsData } from '../context/EventDetailsProvider';
import Loader from '../Components/Loader';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import StyledText from '../Components/StyledText';
import '../assets2/css/external.css';
import '../assets2/css/main.min.css';
import '../assets2/css/override.css';

export const ContactUs = () => {
  const { allEvents, loading, footerDetails } = useAllEventsData();
  const { hash } = useLocation();
  const contactRef = useRef(null);
  const accEvent = useMemo(() => {
    return allEvents.find((e) => e.event_title === 'ACC Asia 2024');
  }, [allEvents]);
  // useEffect(() => {
  //   const targetElement = document.getElementById('contactUsBegin');
  //   if (targetElement) {
  //     targetElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  //   }
  // }, [loading]);

  useEffect(() => {
    const scrollToRef = (ref) => {
      if (ref.current) {
        const topOffset = ref.current.offsetTop;
        window.scrollTo({ top: topOffset, behavior: 'smooth' });
      }
    };
    const hashValue = hash.slice(1);

    switch (hashValue) {
      case 'contactUsBegin':
        scrollToRef(contactRef);
        break;
      default:
        break;
    }
  }, [loading, accEvent, hash]);
  return (
    <>
      {loading && <Loader />}
      {!loading && accEvent && footerDetails && (
        <>
          <section className="wrapper">
            <Navbar curMenu='contactus'/>
            <section className="outer-box">
              <div className="container">
                <div className="content-wrapper">
                  <div className="heading-section text-center mg-b-40" id="contactUsBegin" ref={contactRef}>
                    <h4 className="text-blue">{accEvent ? accEvent.contact_title : ''}</h4>
                  </div>
                  <div className="column-row">
                    <div className="column">
                      <p>
                        <strong>{accEvent.companyName}</strong>
                      </p>
                      <p>
                        <strong>Address</strong> <br />
                        <StyledText htmlContent={accEvent ? accEvent.companyAddress : ''} />
                      </p>
                    </div>
                    <div className="column">
                      <p>
                        <strong>Email</strong> <br />
                        <a href={`mailto:${accEvent.event_email}`}>{accEvent.event_email}</a>
                      </p>
                      <p>
                        {
                          <>
                            <strong>Phone</strong> <br /> {accEvent.event_contact}
                          </>
                        }
                      </p>
                      <p>
                        <strong>Website</strong> <br />
                        <a href={accEvent.event_contact_web} target="_blank" className="website" rel="noreferrer">
                          {accEvent.event_contact_web}
                        </a>
                      </p>
                    </div>
                  </div>
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
