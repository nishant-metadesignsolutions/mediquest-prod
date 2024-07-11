import { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAllEventsData } from '../context/EventDetailsProvider';
import Loader from '../Components/Loader';
import Navbar from '../Components/Navbar';
import Hero from '../Components/Hero';
import Footer from '../Components/Footer';
import StyledText from '../Components/StyledText';
import EventCard from '../Components/EventCard';
import { Venue } from '../Components/Venue';
import { getVenue } from '../utils/getData';
import '../assets2/css/main.min.css';
import '../assets2/css/external.css';
import arrowDown from '../assets2/images/arrow-down.svg';

export const Home2 = () => {
  const { allEvents, loading, footerDetails } = useAllEventsData();
  const [venueDetail, setVenueDetail] = useState([]);
  // console.log(allEvents);
  // return <h1>HelloN</h1>

  // const accEvent = allEvents[1];

  const accEvent = useMemo(() => {
    return allEvents.find((e) => e.event_title === 'ACC Asia 2024');
  }, [allEvents]);
  // console.log(accEvent);
  useEffect(() => {
    (async function () {
      if (accEvent) {
        const data = await getVenue(accEvent.venue[0].id);
        setVenueDetail(data);
      }
    })();
  }, [accEvent]);
  // console.log(venueDetail);
  // useEffect(() => {
  //   if (accEvent) {
  //     console.log(accEvent.companyAddress);
  //   }
  // }, [accEvent]);

  // return <h1>HelloN</h1>;

  if (loading) {
    return <Loader />;
  } else if (Object.keys(allEvents).length === 0) {
    return <Loader />;
  } else {
    return (
      <>
        {loading && <Loader />}
        {!loading && (
          <>
            <section className="wrapper">
              <div>
                <Navbar curMenu="home" />
              </div>
              <div>
                <Hero />
              </div>
              <section className="program-overview-box">
                <div className="container">
                  <h3>{accEvent.program_overview_title}</h3>
                  <StyledText htmlContent={accEvent.event_overview} />

                  {/* <div className="pro-btns">
                    <Link to="https://www.acc.org/asia2024" target="_blank" rel="noopener noreferrer">
                      <button className="btn btn-yellow withimg">
                        Know More <img src={arrowDown} alt="" />
                      </button>
                    </Link>
                  </div> */}
                </div>
              </section>

              <section id="program-info-box" className="program-info-box">
                <div className="container">
                  <h3>{accEvent.information_title}</h3>
                  <EventCard key={accEvent.id} event={accEvent} />
                </div>
              </section>
              <Venue key={accEvent.id} event={accEvent} venue={venueDetail} />
              <Footer footerData={footerDetails} />
            </section>
          </>
        )}
      </>
    );
  }
};
