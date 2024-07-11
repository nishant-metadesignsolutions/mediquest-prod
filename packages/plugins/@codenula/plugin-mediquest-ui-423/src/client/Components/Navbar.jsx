// Navbar.js
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAllEventsData } from '../context/EventDetailsProvider';
import '../assets2/css/main.min.css';
import '../assets2/css/external.css';
import '../assets2/css/override.css';
import Loader from './Loader';
import { MEDIQUEST_URL_IMG } from '../myvars';

const Navbar = (props) => {
  const [scrolled, setScrolled] = useState(false);
  const { allEvents, loading } = useAllEventsData();
  const [myLoader, setMyLoader] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('');
  const accEvent = allEvents.find((e) => e.event_title === 'ACC Asia 2024');

  const handleToggleMenu = () => {
    var target = document.querySelector('.header-navbar .menu-list');
    if (target.classList.contains('show')) {
      target.classList.remove('show');
    } else {
      target.classList.add('show');
    }
  };

  useEffect(() => {
    if (accEvent) {
      setMyLoader(false);
    }
  }, [accEvent]);
  const handleScroll = () => {
    setScrolled(window.scrollY > 400);
  };

  useEffect(() => {
    if (scrolled) {
      document.body.classList.add('scrolled');
    } else {
      document.body.classList.remove('scrolled');
    }
  }, [scrolled]);
  // className="active"
  // const handleMenuItemClick = (menuItem) => {
  //   setActiveMenuItem(menuItem);
  // };
  const handleMenuItemClick = (menuItem) => {
    setActiveMenuItem(menuItem);
    const targetElement = document.getElementById(menuItem);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };


  return (
    <>
      {myLoader && <Loader />}
      {!myLoader && (
        <>
          {/* <section className="menu-box">
            <div className="container">
              <div className="menu-toggle">
                <button className="btn-toggle" onClick={handleToggleMenu}>
                  <i className="fa fa-bars" aria-hidden="true"></i>
                </button>
              </div>
              <nav className="header-navbar">
                <ul className="menu-list">
                  <li className={activeMenuItem === 'home' || props.curMenu === 'home' ? 'active' : ''}>
                    <Link to="/home2" onClick={() => handleMenuItemClick('home')}>
                      Home
                    </Link>
                  </li>
                  <li
                    className={
                      activeMenuItem === 'faculty' ||
                      activeMenuItem === 'internationalFaculty' ||
                      activeMenuItem === 'nationalFaculty' ||
                      props.curMenu === 'faculty' ||
                      props.curMenu === 'internationalFaculty' ||
                      props.curMenu === 'nationalFaculty'
                        ? 'active'
                        : ''
                    }
                  >
                    <Link to="/faculty-details" onClick={() => handleMenuItemClick('faculty')}>
                      Faculty
                    </Link>

                    <div className="submenu">
                      <ul>
                        <li>
                          <Link to="/faculty-details#chairPersons" onClick={() => handleMenuItemClick('chairPersons')}>
                            Chair Persons
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/faculty-details#internationalFaculty"
                            onClick={() => handleMenuItemClick('internationalFaculty')}
                          >
                            International Faculty
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/faculty-details#nationalFaculty"
                            onClick={() => handleMenuItemClick('nationalFaculty')}
                          >
                            National Faculty
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </li>
                  <li className={activeMenuItem === 'programInformation' || props.curMenu === 'programInformation' ? 'active' : ''}>
                    <Link to="/events/7#programInformation" onClick={() => handleMenuItemClick('programInformation')}>
                      Program Information
                    </Link>
                  </li>
                  <li className={activeMenuItem === 'scientfic-program' || props.curMenu === 'scientfic-program'? 'active' : ''}>
                    <Link to="/events/7#scientfic-program" onClick={() => handleMenuItemClick('scientfic-program')}>
                      Scientific Program
                    </Link>
                  </li>
                  <li className={activeMenuItem === 'venue' || props.curMenu === 'venue' ? 'active' : ''}>
                    <Link to="/events/7#venue" onClick={() => handleMenuItemClick('venue')}>
                      Venue
                    </Link>
                  </li>
                  <li className={activeMenuItem === 'aboutus' || props.curMenu === 'aboutus'? 'active' : ''}>
                    <Link to="/about" onClick={() => handleMenuItemClick('aboutus')}>
                      ABOUT US
                    </Link>
                  </li>
                  <li className={activeMenuItem === 'contactus' || props.curMenu === 'contactus'? 'active' : ''}>
                    <Link to="/contact-us" onClick={() => handleMenuItemClick('contactus')}>
                      Contact US
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </section> */}

          <section className="menu-box">
            <div className="container">
              <div className="menu-toggle">
                <button className="btn-toggle" onClick={handleToggleMenu}>
                  <i className="fa fa-bars" aria-hidden="true"></i>
                </button>
              </div>
              <nav className="header-navbar">
                <ul className="menu-list">
                  <li className={activeMenuItem === 'home' || props.curMenu === 'home' ? 'active' : ''}>
                    <Link to="https://www.accasia.in/" onClick={() => handleMenuItemClick('home')}>
                      HOME
                    </Link>
                  </li>
                  <li>
                    <Link to="#">SUBMIT YOUR SCIENCE</Link>

                    <div className="submenu">
                      <ul>
                        <li>
                          <Link
                            to="https://www.accasia.in/submit-your-science"
                            onClick={() => handleMenuItemClick('chairPersons')}
                          >
                            • Abstracts
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="https://www.accasia.in/submit-your-science"
                            onClick={() => handleMenuItemClick('internationalFaculty')}
                          >
                            • Complex Clinical Cases
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </li>
                 <li>
                    <Link to="#">PLAN YOUR PROGRAM</Link>

                    <div className="submenu">
                      <ul>
                        <li>
                          <Link
                            to="https://www.accasia.in/copy-of-submit-your-science"
                            onClick={() => handleMenuItemClick('chairPersons')}
                          >
                            • Preconference(s)
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="https://www.accasia.in/copy-of-submit-your-science"
                            onClick={() => handleMenuItemClick('internationalFaculty')}
                          >
                            • Agenda
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="https://www.accasia.in/copy-of-submit-your-science"
                            onClick={() => handleMenuItemClick('internationalFaculty')}
                          >
                            • FIT Jeopardy
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="https://www.accasia.in/copy-of-submit-your-science"
                            onClick={() => handleMenuItemClick('internationalFaculty')}
                          >
                            • Credit
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <Link to="#">SPEAKERS</Link>

                    <div className="submenu">
                      <ul>
                        <li>
                          <Link
                            to="https://www.accasia.in/speakers"
                            onClick={() => handleMenuItemClick('chairPersons')}
                          >
                            • Planning Committee
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="https://www.accasia.in/speakers"
                            onClick={() => handleMenuItemClick('internationalFaculty')}
                          >
                            • International Faculty
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="https://www.accasia.in/speakers"
                            onClick={() => handleMenuItemClick('internationalFaculty')}
                          >
                            • National Faculty
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <Link to="#">REGISTRATION & VENUE</Link>

                    <div className="submenu">
                      <ul>
                        <li>
                          <Link to="https://www.accasia.in/venue" onClick={() => handleMenuItemClick('chairPersons')}>
                            • Registration
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="https://www.accasia.in/venue"
                            onClick={() => handleMenuItemClick('internationalFaculty')}
                          >
                            • Venue
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </li>
                  <li
                    className={
                      activeMenuItem === 'programInformation' || props.curMenu === 'programInformation' ? 'active' : ''
                    }
                  >
                    <Link
                      to="https://www.accasia.in/copy-of-about-us"
                      onClick={() => handleMenuItemClick('programInformation')}
                    >
                      SPONSORS
                    </Link>
                  </li>
                  <li>
                    <Link to="#">MORE</Link>

                    <div className="submenu">
                      <Link
                        to="https://www.accasia.in/copy-of-about-us-1"
                        onClick={() => handleMenuItemClick('chairPersons')}
                      >
                        HOTEL & TRAVEL INFORMATION
                      </Link>
                      <ul>
                        <li>
                          <Link
                            to="https://www.accasia.in/copy-of-about-us-1"
                            onClick={() => handleMenuItemClick('chairPersons')}
                          >
                            • HOTEL INFORMATION
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="https://www.accasia.in/copy-of-about-us-1"
                            onClick={() => handleMenuItemClick('chairPersons')}
                          >
                            • TRAVEL INFORMATION
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="https://www.accasia.in/copy-of-about-us-1"
                            onClick={() => handleMenuItemClick('chairPersons')}
                          >
                            • VISA INFORMATION
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </nav>
            </div>
          </section>
          <header className={`header-cntr ${scrolled ? 'scrolled' : ''}`}>
            <div className="media-holder">
              <Link to="https://www.accasia.in/" className="logo">
                <img
                  src={
                    accEvent && accEvent.event_banner.length > 0
                      ? `${MEDIQUEST_URL_IMG}${accEvent.event_banner[0].url}`
                      : ''
                  }
                  alt=""
                  loading="lazy"
                />
              </Link>
            </div>
          </header>
        </>
      )}
    </>
  );
};

export default Navbar;
