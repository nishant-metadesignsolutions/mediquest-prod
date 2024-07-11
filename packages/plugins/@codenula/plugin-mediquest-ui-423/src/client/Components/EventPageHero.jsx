import { useMemo, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAllEventsData } from '../context/EventDetailsProvider';
import Loader from './Loader';
import StyledText from './StyledText';
import '../assets2/css/main.min.css';
import '../assets2/css/external.css';
import { MEDIQUEST_URL_IMG } from '../myvars';

export const EventPageHero = () => {
  const { allEvents, loading, footerDetails } = useAllEventsData();
  const accEvent = useMemo(() => {
    // Select the event you want to use
    return allEvents.find((e) => e.event_title === 'ACC Asia 2024');
  }, [allEvents]);

  // Define calculateCountdown before using it in useState
  const calculateCountdown = useCallback(() => {
    const now = new Date();
    const difference = new Date(accEvent.event_date) - now;

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return {
      days,
      hours,
      minutes,
      seconds,
    };
  }, [accEvent]);

  // State for countdown
  const [countdown, setCountdown] = useState({});

  useEffect(() => {
    // Set countdown initially
    setCountdown(calculateCountdown());

    const timer = setInterval(() => {
      setCountdown(calculateCountdown());
    }, 1000);

    // Clean up timer
    return () => clearInterval(timer);
  }, [calculateCountdown]);
  const allMonths = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const event_start_date = `${new Date(accEvent.event_date).getDate()} ${
    allMonths[new Date(accEvent.event_date).getMonth()]
  }`;
  const event_end_date = `${new Date(accEvent.event_end_date).getDate()} ${
    allMonths[new Date(accEvent.event_date).getMonth()]
  }`;
  return (
    <>
      {loading && <Loader />}
      {!loading && (
        <>
          <section className="acc-box acc-new-box">
            <div className="container">
              <h1>{accEvent.event_title}</h1>
              <p className="size28">{accEvent.event_subtitle}</p>
              <div className="acc-new-row">
                <div className="acc-new-left">
                  <div className="acc-list-outer">
                    <ul className="acc-list">
                      <li>
                        <span >{countdown.days}</span>
                        <span className="days">
                          Days
                        </span>
                      </li>
                      <li>
                        <span >{countdown.hours}</span>
                        <span className="days">
                          Hours
                        </span>
                      </li>
                      <li>
                        <span className="redtext">
                          {countdown.minutes}
                        </span>
                        <span className="days redtext">
                          Minutes
                        </span>
                      </li>
                      <li>
                        <span className="redtext">
                          {countdown.seconds}
                        </span>
                        <span className="days redtext">
                          Seconds
                        </span>
                      </li>
                    </ul>
                  </div>
                  {/* <div className="acc-btns">
                    <a href="" className="btn btn-yellow">
                      RESERVE YOUR SPOT
                    </a>
                  </div> */}
                  {accEvent.acceptRegistration=='yes' && <Link className="acc-btns" to={`/events/${parseInt(7)}/register`}>
                    <button className="btn btn-yellow btn-lg">RESERVE YOUR SPOT</button>{' '}
                  </Link>}
                </div>
                <div className="acc-new-right">
                  <img
                    src={accEvent ? `${MEDIQUEST_URL_IMG}${accEvent.event_card_image[0].url}` : ''}
                    alt=""
                  />
                </div>
              </div>

              <div className="acc-new-details">
                <StyledText className="text30" htmlContent={accEvent ? accEvent.event_overview : ''} />
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
};
