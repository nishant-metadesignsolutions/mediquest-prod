import { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { AccordionItem } from '../Components/Accordion';
import Loader from '../Components/Loader';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { Venue } from '../Components/Venue';
import { getVenue } from '../utils/getData';
import StyledText from '../Components/StyledText';
import { EventPageHero } from '../Components/EventPageHero';
import { useAllEventsData } from '../context/EventDetailsProvider';

import '../assets2/css/main.min.css';
import '../assets2/css/external.css';
import { getAgendaDetails } from '../utils/getData';
import { MEDIQUEST_URL_IMG } from '../myvars';

export default () => {
  const { hash } = useLocation();
  const { eventId } = useParams();
  const { allEvents, loading, footerDetails } = useAllEventsData();
  const [myLoader, setLoader] = useState(true);
  const [agenda, setAgenda] = useState({});
  const [venueDetail, setVenueDetail] = useState([]);
  const accEvent = useMemo(() => {
    return allEvents.find((e) => e.event_title === 'ACC Asia 2024');
  }, [allEvents]);

  useEffect(() => {
    const targetElement = document.getElementById(hash.slice(1));
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [loading, myLoader, hash]);
  useEffect(() => {
    (async function () {
      if (accEvent && accEvent.venue.length > 0) {
        const data = await getVenue(accEvent.venue[0].id);
        setVenueDetail(data);
      }
    })();
  }, [accEvent]);

  useEffect(() => {
    const fetchAgenda = async () => {
      if (allEvents && allEvents.length > 1) {
        try {
          const data = await getAgendaDetails(allEvents.find((e) => e.event_title === 'ACC Asia 2024').agenda[0].id);
          console.log(data);
          setAgenda(data);
          setLoader(false);
        } catch (error) {
          console.error('Error fetching agenda:', error);
        }
      }
    };

    fetchAgenda();
  }, [allEvents]);
  return (
    <>
      {myLoader && loading && <Loader />}
      {!myLoader && !loading && (
        <>
          <section className="wrapper">
            <Navbar curMenu={hash.slice(1)}/>
            <EventPageHero />
            <section className="attend-box" id='programInformation'>
              <div className="container">
                <h4 className='size28'>{accEvent ? accEvent.objective_title : ''}</h4>
                <StyledText htmlContent={accEvent ? accEvent.event_objectives : ''} />
              </div>
            </section>
            <section className="goal-box">
              <div className="">
                <AccordionItem
                  inActiveState={false}
                  title={accEvent ? accEvent.target_audience_title : ''}
                  content={accEvent ? accEvent.event_audience : ''}
                />
                <div id="scientfic-program">
                  <AccordionItem
                    inActiveState={hash.slice(1) == 'scientfic-program' ? true : false}
                    title={accEvent ? accEvent.scientific_program_title : ''}
                    content={agenda ? agenda.agenda_description : ''}
                    pdfLink={
                      agenda && agenda.agenda_pdf.length > 0 ? `${MEDIQUEST_URL_IMG}${agenda.agenda_pdf[0].url}` : '#'
                    }
                  />
                </div>
              </div>
            </section>
            <div id="venue">
              <Venue key={accEvent.id} event={accEvent} venue={venueDetail} />
            </div>

            <Footer footerData={footerDetails ? footerDetails : ''} />
          </section>
        </>
      )}
    </>
  );
};
