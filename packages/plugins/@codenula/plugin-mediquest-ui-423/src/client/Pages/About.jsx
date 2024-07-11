import { useMemo, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAllEventsData } from '../context/EventDetailsProvider';
import Loader from '../Components/Loader';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import StyledText from '../Components/StyledText';
import '../assets2/css/main.min.css';
import '../assets2/css/external.css';

export default () => {
  const { allEvents, loading, footerDetails } = useAllEventsData();
  const { hash } = useLocation();
  const aboutRef = useRef(null);
  const accEvent = useMemo(() => {
    return allEvents.find((e) => e.event_title === 'ACC Asia 2024');
  }, [allEvents]);
  // useEffect(() => {
  //   const targetElement = document.getElementById('aboutUsBegin');
  //   if (targetElement) {
  //     targetElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  //   }
  // }, [loading, hash]);
  useEffect(() => {
    const scrollToRef = (ref) => {
      if (ref.current) {
        const topOffset = ref.current.offsetTop;
        window.scrollTo({ top: topOffset, behavior: 'smooth' });
      }
    };
    const hashValue = hash.slice(1);

    switch (hashValue) {
      case 'aboutUsBegin':
        scrollToRef(aboutRef);
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
          <Navbar curMenu = 'aboutus'/>
          <section className="outer-box">
            <div className="container">
              <div className="content-wrapper aboutuspage">
                <div className="heading-section text-center mg-b-30" id='aboutUsBegin' ref={aboutRef}>
                  <h4 className="text-blue">{accEvent ? accEvent.about_title : ''}</h4>
                </div>
                <StyledText htmlContent={accEvent ? accEvent.event_about : ''} />
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
