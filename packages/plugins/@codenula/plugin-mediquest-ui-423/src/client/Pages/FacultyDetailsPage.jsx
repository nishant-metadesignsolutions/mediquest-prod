import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { EventPageHero } from '../Components/EventPageHero';
import { useAllEventsData } from '../context/EventDetailsProvider';
import { useAllFacultyData } from '../context/FacultyDetailsProvider';
import { Venue } from '../Components/Venue';
import { getVenue } from '../utils/getData';
import { MEDIQUEST_URL_IMG } from '../myvars';
import Loader from '../Components/Loader';
import Modal from '../Components/Modal';
export const FacultyDetailsPage = () => {
  const { hash } = useLocation();
  const { allEvents, loading, footerDetails } = useAllEventsData();
  const { internationalFaculty, nationalFaculty, chairperson, loadingFaculty } = useAllFacultyData();
  const [myLoading, setLoading] = useState(true);
  const [venueDetail, setVenueDetail] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const accEvent = useMemo(() => {
    return allEvents.find((e) => e.event_title === 'ACC Asia 2024');
  }, [allEvents]);
  useEffect(() => {
    const targetElement = document.getElementById(hash.slice(1));
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [loading, myLoading, hash]);
  useEffect(() => {
    (async function () {
      if (accEvent) {
        const data = await getVenue(accEvent.venue[0].id);
        setVenueDetail(data);
      }
    })();
  }, [accEvent]);
  const openModal = (faculty) => {
    setSelectedFaculty(faculty);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedFaculty(null);
    setModalOpen(false);
  };
  useEffect(() => {
    if (!loadingFaculty && !loading) {
      setLoading(false);
    }
  }, [loading, loadingFaculty]);
  return (
    <>
      {myLoading && <Loader />}
      {!myLoading && (
        <>
          <Navbar curMenu='faculty'/>
          <EventPageHero />
          <section class="person-box personfirst-border" id="chairPersons">
            <div class="container">
              <h3>{accEvent ? accEvent.chairpersons_title : ''}</h3>

              {accEvent && accEvent.chairpersons && accEvent.chairpersons.length > 0 && (
                <ul class="person-list">
                  {accEvent &&
                    accEvent.chairpersons &&
                    accEvent.chairpersons.length > 0 &&
                    accEvent.chairpersons.map((item) => {
                      const curChairperson = chairperson.find((x) => x.id === item.id);
                      return (
                        <li key={curChairperson.id} onClick={() => openModal(curChairperson)}>
                          <a href="javascript:void(0)" className="person-cols" data-modal="modal-one">
                            {curChairperson && curChairperson.chairperson_image.length > 0 && (
                              <div className="person-img">
                                <img
                                  src={
                                    curChairperson && curChairperson.chairperson_image.length > 0
                                      ? `${MEDIQUEST_URL_IMG}${curChairperson.chairperson_image[0].url}`
                                      : ''
                                  }
                                  alt=""
                                />
                              </div>
                            )}
                            <span className="person-name">{curChairperson ? curChairperson.chairperson_name : ''}</span>
                            <span className="person-profile">
                              {curChairperson ? curChairperson.chairperson_degree : ''}
                            </span>
                          </a>
                        </li>
                      );
                    })}
                </ul>
              )}
              {(!accEvent || !accEvent.chairpersons || !accEvent.chairpersons.length > 0) && (
                <div className='text-center'>Details will be available shortly</div>
              )}
            </div>
          </section>

          <section class="person-box" id="internationalFaculty">
            <div class="container">
              <h2>{accEvent ? accEvent.intl_faculty_title : ''}</h2>

              {accEvent && accEvent.intl_faculty && accEvent.intl_faculty.length > 0 && (
                <ul class="person-list">
                  {accEvent &&
                    accEvent.intl_faculty &&
                    accEvent.intl_faculty.length > 0 &&
                    accEvent.intl_faculty.map((item) => {
                      const curIntlFaculty = internationalFaculty.find((x) => x.id === item.id);
                      return (
                        <li key={curIntlFaculty.id} onClick={() => openModal(curIntlFaculty)}>
                          <a href="javascript:void(0)" className="person-cols" data-modal="modal-one">
                            {curIntlFaculty && curIntlFaculty.intl_faculty_img.length > 0 && (
                              <div className="person-img">
                                <img
                                  src={
                                    curIntlFaculty && curIntlFaculty.intl_faculty_img.length > 0
                                      ? `${MEDIQUEST_URL_IMG}${curIntlFaculty.intl_faculty_img[0].url}`
                                      : ''
                                  }
                                  alt=""
                                />
                              </div>
                            )}
                            <span className="person-name text-blues">
                              {curIntlFaculty ? curIntlFaculty.intl_faculty_name : ''}
                            </span>
                            <span className="person-profile">
                              {curIntlFaculty ? curIntlFaculty.intl_faculty_degree : ''}
                            </span>
                          </a>
                        </li>
                      );
                    })}
                </ul>
              )}
              {(!accEvent || !accEvent.intl_faculty || !accEvent.intl_faculty.length > 0) && (
                <div className='text-center'>Details will be available shortly</div>
              )}
            </div>
          </section>

          <section class="person-box" id="nationalFaculty">
            <div class="container">
              <h2>{accEvent ? accEvent.faculty_title : ''}</h2>
              {accEvent && accEvent.faculty && accEvent.faculty.length > 0 && (
                <ul class="person-list">
                  {accEvent &&
                    accEvent.faculty &&
                    accEvent.faculty.length > 0 &&
                    accEvent.faculty.map((item) => {
                      const curNationalFaculty = nationalFaculty.find((x) => x.id === item.id);
                      return (
                        <li key={curNationalFaculty.id} onClick={() => openModal(curNationalFaculty)}>
                          <a href="javascript:void(0)" className="person-cols" data-modal="modal-one">
                            {curNationalFaculty && curNationalFaculty.faculty_image.length > 0 && (
                              <div className="person-img">
                                <img
                                  src={
                                    curNationalFaculty && curNationalFaculty.faculty_image.length > 0
                                      ? `${MEDIQUEST_URL_IMG}${curNationalFaculty.faculty_image[0].url}`
                                      : ''
                                  }
                                  alt=""
                                />
                              </div>
                            )}
                            <span className="person-name text-blues">
                              {curNationalFaculty ? curNationalFaculty.faculty_name : ''}
                            </span>
                            <span className="person-profile">
                              {curNationalFaculty ? curNationalFaculty.faculty_qualifications : ''}
                            </span>
                          </a>
                        </li>
                      );
                    })}
                </ul>
              )}
              {(!accEvent || !accEvent.faculty || !accEvent.faculty.length > 0) && (
                <div className='text-center'>Details will be available shortly</div>
              )}
            </div>
          </section>
          <Venue
            key={accEvent ? accEvent.id : ''}
            event={accEvent ? accEvent : ''}
            venue={venueDetail ? venueDetail : ''}
          />
          <Footer footerData={footerDetails ? footerDetails : ''} />
          {modalOpen && (
            <Modal id="modal-one" onClose={closeModal} isOpen={modalOpen}>
              {selectedFaculty && selectedFaculty.chairperson_name && (
                <div className="chair-person-modal">
                  {}
                  {selectedFaculty && selectedFaculty.chairperson_image.length > 0 && (
                    <img
                      src={
                        selectedFaculty && selectedFaculty.chairperson_image.length > 0
                          ? `${MEDIQUEST_URL_IMG}${selectedFaculty.chairperson_image[0].url}`
                          : ''
                      }
                      alt=""
                      className="person-img"
                    />
                  )}
                  <span className="person-name">{selectedFaculty.chairperson_name}</span>
                  <span className="person-profile">{selectedFaculty.chairperson_degree}</span>
                </div>
              )}
              {selectedFaculty && selectedFaculty.intl_faculty_name && (
                <div className="chair-person-modal">
                  {selectedFaculty && selectedFaculty.intl_faculty_img.length > 0 && (
                    <img
                      src={
                        selectedFaculty && selectedFaculty.intl_faculty_img.length > 0
                          ? `${MEDIQUEST_URL_IMG}${selectedFaculty.intl_faculty_img[0].url}`
                          : ''
                      }
                      alt=""
                      className="person-img"
                    />
                  )}
                  <span className="person-name">{selectedFaculty.intl_faculty_name}</span>
                  <span className="person-profile">{selectedFaculty.intl_faculty_degree}</span>
                </div>
              )}
              {selectedFaculty && selectedFaculty.faculty_name && (
                <div className="chair-person-modal">
                  {}
                  {selectedFaculty && selectedFaculty.faculty_image.length > 0 && (
                    <img
                      src={
                        selectedFaculty && selectedFaculty.faculty_image.length > 0
                          ? `${MEDIQUEST_URL_IMG}${selectedFaculty.faculty_image[0].url}`
                          : ''
                      }
                      alt=""
                      className="person-img"
                    />
                  )}
                  <span className="person-name">{selectedFaculty.faculty_name}</span>
                  <span className="person-profile">{selectedFaculty.faculty_qualifications}</span>
                </div>
              )}
            </Modal>
          )}
        </>
      )}
    </>
  );
};
