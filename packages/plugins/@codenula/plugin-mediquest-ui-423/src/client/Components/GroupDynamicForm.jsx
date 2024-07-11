import { useEffect, useMemo, useRef, useState } from 'react';
// import { COLLECTION_AUTH_TOKEN, MEDIQUEST_URL, ACC_ASIA_URL } from '../myvars.js';
import { useNavigate } from 'react-router-dom';
import '../assets2/css/main.min.css';
import '../assets2/css/external.css';
import '../assets2/css/override.css';
import { useAllLoactionData } from '../context/LocationDetailsProvider';
import { useAllEventsData } from '../context/EventDetailsProvider';
import Loader from './Loader.jsx';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import { Popup } from './Popup.jsx';

import {
  validatePhoneNumber,
  validatePhoneNumberInternational,
  validateEmail,
  emptyFieldCheck,
  emptyFieldCheckOnSubmit,
  validateFirstName,
  validateLastName,
} from '../utils/validation.js';
import { createGroupAttendee } from '../utils/attendee.js';
import StyledText from './StyledText';
import { getCountryCode } from '../utils/getData';
import { ErrorPage } from '../Pages/ErrorPage';

export const GroupDynamicForm = ({ formData, eventId, formDesign }) => {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [formValues, setFormValues] = useState({});
  const [isFormEdited, setFormEdited] = useState(false);
  const [validForm, setValidForm] = useState(true);
  const { allEvents, loading, footerDetails } = useAllEventsData();
  const { countryList, stateList, cityList, loadingLocation } = useAllLoactionData();
  const [filteredCities, setFilteredCities] = useState([]);
  const [filteredStates, setFilteredStates] = useState([]);
  const [initialFormValues, setInitialFormValues] = useState({});
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [error, setError] = useState(false);

  const accEvent = useMemo(() => {
    // Select the event you want to use
    return allEvents.find((e) => e.id === parseInt(eventId));
  }, [allEvents]);
  const allCountry = useMemo(() => {
    return countryList;
  }, [countryList]);
  const allStates = useMemo(() => {
    return stateList;
  }, [stateList]);
  const allCitites = useMemo(() => {
    return cityList;
  }, [cityList]);

  const getStateAndCityId = async () => {
    const stateAndCity = {
      countryId: '',
      country_code: '',
      stateId: '',
      cityId: '',
    };
    if (formValues.cityId) {
      allCitites.forEach((c) => {
        if (c.city_name.toLowerCase() === formValues.cityId.toLowerCase()) {
          stateAndCity.cityId = c.id;
        }
      });
    }

    if (formValues.stateId) {
      allStates.forEach((s) => {
        if (s.state_name.toLowerCase() === formValues.stateId.toLowerCase()) {
          stateAndCity.stateId = s.id;
        }
      });
    }

    if (formValues.countryId) {
      allCountry.forEach((s) => {
        if (s.country_name.toLowerCase() === formValues.countryId.toLowerCase()) {
          stateAndCity.countryId = s.id;
          stateAndCity.country_code = s.country_code;
        }
      });
    }
    return stateAndCity;
  };

  useEffect(() => {
    const fetchStates = async () => {
      const stId = await getStateAndCityId();
      var curCountry;
      allCountry.forEach((c) => {
        if (c.id == stId.countryId) {
          curCountry = c;
        }
      });

      const stateItems = [];
      allStates.forEach((s) => {
        if (s.countryId == curCountry.id) {
          stateItems.push(s);
        }
      });

      setFilteredStates(stateItems);
    };
    const fetchCities = async () => {
      const stId = await getStateAndCityId();
      var curState;
      allStates.forEach((s) => {
        if (s.id == stId.stateId) {
          curState = s;
        }
      });

      const cityItems = [];
      allCitites.forEach((c) => {
        if (c.stateId == curState.id) {
          cityItems.push(c);
        }
      });

      setFilteredCities(cityItems);
    };
    if (formValues.countryId && formValues.countryId == 'India') {
      fetchStates();
    }
    if (formValues.countryId && formValues.countryId == 'India' && formValues.stateId) {
      fetchCities();
    }
  }, [formValues, allCitites, allStates, allCountry]);
  const fieldsToIgnore = [
    'updatedById',
    'createdById',
    'createdAt',
    'updatedAt',
    'eventId',
    'paymentCategory',
    'id',
    'sort',
    'minimum_grp_count',
    'registration_id_prefix',
    'owner_thankyou_msg_backend',
    'grp_reg_payment_status',
  ];
  const handleInputChange = (event) => {
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      [event.target.name]: event.target.value,
    }));
    // Mark the form as edited when there's an input change
    setFormEdited(true);
  };

  const renderInputField = (key, value) => {
    const handleInputChange = (event) => {
      setFormValues((prevFormValues) => ({
        ...prevFormValues,
        [key]: event.target.value,
      }));
      emptyFieldCheck(formValues);
    };
    const handleCountryChange = (event) => {
      setFormValues((prevFormValues) => ({
        ...prevFormValues,
        [key]: event.target.value,
        stateId: '',
        cityId: '',
      }));
      // formValues.stateId = '';
      // formValues.cityId = '';
      emptyFieldCheck(formValues);
    };
    const handleStateChange = (event) => {
      setFormValues((prevFormValues) => ({
        ...prevFormValues,
        [key]: event.target.value,
        cityId: '',
      }));
      // formValues.stateId = '';
      // formValues.cityId = '';
      emptyFieldCheck(formValues);
    };
    const handleCheckboxChange = (event) => {
      setFormValues((prevFormValues) => {
        const currentValue = prevFormValues[key] || [];
        const updatedValues = event.target.checked
          ? [...currentValue, event.target.value]
          : currentValue.filter((item) => item !== event.target.value);

        return {
          ...prevFormValues,
          [key]: updatedValues,
        };
      });
    };
    const handleRadioChange = (event) => {
      setFormValues((prevFormValues) => ({
        ...prevFormValues,
        [key]: event.target.value,
      }));
    };
    if (fieldsToIgnore.includes(key)) {
      return null;
    }
    if (key === 'countryId' && Array.isArray(allCountry) && allCountry.length > 0) {
      // Render dropdown for stateId
      return (
        <div className="form-col">
          <div className="form-group" key={key}>
            <label name={key}>
              {key.slice(0, -2).toUpperCase()}: {<span style={{ color: 'red' }}>*</span>}
            </label>
            <div className="textbox-inner">
              <select id={key} name={key} className="form-control" onChange={handleCountryChange}>
                <option value={''}>Please Select</option>
                {allCountry &&
                  allCountry.map((countryItem) => (
                    <option key={countryItem.country_name} value={countryItem.country_name}>
                      {countryItem.country_name.toUpperCase().replace(/_/g, ' ')}
                    </option>
                  ))}
              </select>
              <div id="countryId-error" style={{ color: 'red' }}></div>
            </div>
          </div>
        </div>
      );
    } else if (key === 'stateId' && Array.isArray(allStates) && allStates.length > 0) {
      // Render dropdown for stateId
      return (
        <div className="form-col">
          <div className="form-group" key={key}>
            <label name={key}>
              {key.slice(0, -2).toUpperCase()}:{' '}
              {formValues.countryId == 'India' && <span style={{ color: 'red' }}>*</span>}
            </label>
            <div className="textbox-inner">
              {formValues.countryId == 'India' && (
                <>
                  <select id={key} name={key} className="form-control" onChange={handleStateChange}>
                    <option value={''}>Please Select</option>
                    {formValues.countryId &&
                      filteredStates &&
                      filteredStates.length > 0 &&
                      filteredStates.map((stateItem) => (
                        <option key={stateItem.country_name} value={stateItem.state_name}>
                          {stateItem.state_name.toUpperCase().replace(/_/g, ' ')}
                        </option>
                      ))}
                  </select>
                  <div id="stateId-error" style={{ color: 'red' }}></div>
                </>
              )}
              {formValues.countryId !== 'India' && (
                <input className="form-control" type="text" onChange={handleInputChange} />
              )}
            </div>
          </div>
        </div>
      );
    } else if (key === 'cityId' && Array.isArray(allCitites) && allCitites.length > 0) {
      return (
        <div className="form-col">
          <div className="form-group" key={key}>
            <label name={key}>
              {key.slice(0, -2).toUpperCase()}: {<span style={{ color: 'red' }}>*</span>}
            </label>
            <div className="textbox-inner">
              {formValues.countryId == 'India' && (
                <>
                  <select id={key} name={key} className="form-control" onChange={handleInputChange}>
                    <option value={''}>Please Select</option>
                    {formValues.countryId &&
                      formValues.stateId &&
                      filteredCities &&
                      filteredCities.length > 0 &&
                      filteredCities.map((cityItem) => (
                        <option key={cityItem.city_name} value={cityItem.city_name}>
                          {cityItem.city_name.toUpperCase().replace(/_/g, ' ')}
                        </option>
                      ))}
                  </select>
                  <div id="cityId-error" style={{ color: 'red' }}></div>
                </>
              )}
              {formValues.countryId != 'India' && (
                <>
                  <input id={key} className="form-control" type="text" onChange={handleInputChange} />
                  <div id="cityId-error" style={{ color: 'red' }}></div>
                </>
              )}
            </div>
          </div>
        </div>
      );
    } else if (key === 'email_id') {
      // Render input field for email
      return (
        <div className="form-col">
          <div className="form-group" key={key}>
            <label name={key}>
              {key.toUpperCase().replace(/_/g, ' ')}: {<span style={{ color: 'red' }}>*</span>}
            </label>
            <div className="textbox-inner">
              <input id="email" name={key} className="form-control" type="text" onChange={handleInputChange} />
              <div id="email-error" style={{ color: 'red' }}></div>
            </div>
          </div>
        </div>
      );
    } else if (key === 'contact_number') {
      // Render input field for mobile number
      return (
        <>
          <div className="form-col">
            <div className="form-group">
              <label name={key}>COUNTRY CODE:</label>
              <div className="textbox-inner">
                <input
                  // id={key}
                  name={key}
                  type="text"
                  className="form-control country-code"
                  value={formValues.countryId ? `+ ${getCountryCode(formValues.countryId, allCountry)}` : ''}
                  disabled
                  style={{ maxWidth: '85%', marginRight: '7px' }}
                />
              </div>
            </div>
          </div>
          <div className="form-col">
            <div className="form-group" key={key}>
              <label>
                {key.toUpperCase().replace(/_/g, ' ')}: {<span style={{ color: 'red' }}>*</span>}
              </label>
              <div className="textbox-inner">
                <div className="contact-info">
                  <span>
                    <span>
                      <input className="form-control" type="text" onChange={handleInputChange} id="phoneNumber" />
                    </span>
                  </span>
                </div>
                <div id="phoneNumber-error" style={{ color: 'red' }}></div>
              </div>
            </div>
          </div>
        </>
      );
    } else if (
      key === 'first_name' ||
      key === 'last_name' ||
      key === 'company_name' ||
      key === 'registration_id_prefix'
    ) {
      // Render input field for non-empty values
      return (
        <div className="form-col">
          <div className="form-group" key={key}>
            <label name={key}>
              {key.toUpperCase().replace(/_/g, ' ')}: {<span style={{ color: 'red' }}>*</span>}
            </label>
            <div className="textbox-inner">
              <input id={key} name={key} className="form-control" type="text" onChange={handleInputChange} />
              {key === 'registration_id_prefix' && (
                <div style={{ color: 'red', fontSize: '12px' }}>Ex: XYZ, MDS, TCS</div>
              )}
              <div id={`${key}-error`} style={{ color: 'red' }}></div>
            </div>
          </div>
        </div>
      );
    } else if (value !== null && value !== undefined && value !== '') {
      // Render input field for non-empty values
      return (
        <div className="form-col">
          <div className="form-group" key={key}>
            <label id={key} name={key}>
              {key.toUpperCase().replace(/_/g, ' ')}:
            </label>
            <div className="textbox-inner">
              <input id={key} name={key} className="form-control" type="text" onChange={handleInputChange} />
            </div>
          </div>
        </div>
      );
    } else if (key && Array.isArray(value) && value.length > 0) {
      // Render multiple select checkbox for arrays
      return (
        <>
          <div className="form-col">
            <div className="form-group" key={key}>
              <label id={key} name={key}>
                {key.toUpperCase().replace(/_/g, ' ')}:
              </label>
              <div className="textbox-inner">
                <select id={key} name={key} className="form-control" onChange={handleInputChange}>
                  <option value={''}>Please Select</option>
                  {value.map((currValue) => (
                    <option key={currValue} value={currValue}>
                      {currValue.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </>
      );
    } else {
      // Skip rendering for blank or null values
      return null;
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setValidForm(true);
    // formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // console.log('formValues: ', formValues);

    const firstEmptyField = emptyFieldCheckOnSubmit(formValues);

    if (firstEmptyField) {
      // Scroll to the first empty field
      firstEmptyField.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setValidForm(false);
      return false;
    }
    // if (emptyFieldCheckOnSubmit(formValues)) {
    //   setValidForm(false);
    //   return false;
    // }
    let firstInvalidField = null;
    // Check email and phone number validations
    if (!validateFirstName()) {
      setValidForm(false);
      if (!firstInvalidField) {
        firstInvalidField = document.getElementById('first_name');
      }
    } else if (!validateLastName()) {
      setValidForm(false);
      if (!firstInvalidField) {
        firstInvalidField = document.getElementById('last_name');
      }
    } else if (!validateEmail()) {
      if (!firstInvalidField) {
        firstInvalidField = document.getElementById('email');
      }
      setValidForm(false);
    } else if (formValues.countryId != 'India' && !validatePhoneNumberInternational()) {
      setValidForm(false);
      if (!firstInvalidField) {
        firstInvalidField = document.getElementById('phoneNumber');
      }
    } else if (formValues.countryId == 'India' && !validatePhoneNumber()) {
      setValidForm(false);
      if (!firstInvalidField) {
        firstInvalidField = document.getElementById('phoneNumber');
      }
    }

    if (firstInvalidField) {
      // Scroll to the first invalid field
      firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setValidForm(false);
      return false;
    }

    if (!event.target.checkValidity()) {
      // If not valid, the browser will show required field messages
      return false;
    }
    if (!firstEmptyField && !firstInvalidField) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setInitialFormValues(formValues);
    setPopupOpen(true);
  };

  const closePopup = () => {
    setPopupOpen(false);
    // Reset form edited state
    setFormEdited(false);
  };

  const onVerifiedAndSubmit = async () => {
    try {
      setFormEdited(false);
      let attendeeId;
      try {
        let stateAndCity;
        try {
          stateAndCity = await getStateAndCityId();
        } catch (err) {
          setError(true);
          throw err;
        }
        attendeeId = await createGroupAttendee(stateAndCity, formValues, formData);
        if (attendeeId && attendeeId.attendee_type && attendeeId.id) {
          const toPath = `/events/${formData.eventId}/registered-group/${attendeeId.id}`;
          navigate(toPath);
          return;
        }
        const eventId = formData.eventId;
        const navigatePath = `/events/${parseInt(eventId)}/group-registration-completed/${parseInt(attendeeId)}`;
        // const navigatePath = `/events/${parseInt(eventId)}/group-registration-completed/1}`;
        navigate(navigatePath);
        setPopupOpen(false);
        setError(false);
        // try {
        //   await sendGroupEmail(formValues.email_id, parseInt(attendeeId));
        // } catch (err) {
        //   setError(true);
        //   throw err;
        // }
      } catch (err) {
        setError(true);
        throw err;
      }
    } catch (err) {
      setError(true);
    }
  };

  if (!accEvent || loading || loadingLocation) {
    return <Loader />;
  }
  console.log('formData: ', formData);
  return (
    <>
      {(loading || loadingLocation || !accEvent || !allCountry || !allStates || !allCitites) && <Loader />}
      <>
        <Navbar />
        <section className="form-box">
          <form
            className="container"
            style={isPopupOpen ? { display: 'none' } : { display: 'block' }}
            ref={formRef}
            onSubmit={handleSubmit}
          >
            <h4 className="text-blue mg-b-20">{accEvent && accEvent.group_registration_form_title}</h4>
            <h4 className="form-heads">{accEvent && accEvent.group_registration_form_subtitle}</h4>

            {formDesign.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={`form-row ${row.style}`}
                style={row.fields[0] == 'paymentId' ? { display: 'block' } : { display: 'flex' }}
              >
                {row.fields.map((eachField, fieldIndex) => {
                  const fieldValue = formData[eachField];
                  let label = eachField; // Default to field key if label is not found
                  // Map field keys to labels as needed
                  switch (eachField) {
                    case 'countryId':
                      label = 'COUNTRY'; // Replace 'countryId' with appropriate label
                      break;
                    case 'stateId':
                      label = 'STATE'; // Replace 'stateId' with appropriate label
                      break;
                    case 'cityId':
                      label = 'CITY'; // Replace 'cityId' with appropriate label
                      break;
                    // Add more cases as needed for Others fields
                    default:
                      label = eachField;
                      break;
                  }
                  // Check if the field exists in formData and is not empty
                  if (fieldValue) {
                    return renderInputField(eachField, fieldValue, handleInputChange, isFormEdited);
                  }
                  return null;
                })}
              </div>
            ))}

            {/* Display fields in formData that are not covered by formDesign */}
            {Object.keys(formData).map((key) => {
              if (!formDesign.some((row) => row.fields.includes(key))) {
                const shouldRender = renderInputField(key, formData[key], handleInputChange, isFormEdited);
                return (
                  shouldRender !== null && (
                    <div key={key} className="form-row">
                      {shouldRender}
                    </div>
                  )
                );
              }
              return null;
            })}

            <div className="registration-btns">
              <button className="btn btn-blue btn-lg" type="submit">
                PROCEED
              </button>
            </div>
            <div className="important-notes-list">
              <div className="goal-row">
                <StyledText htmlContent={accEvent && accEvent?.important_note} />
              </div>
            </div>
          </form>
        </section>

        {isPopupOpen && (
          <Popup
            formValues={formValues}
            onClose={closePopup}
            onVerifiedAndSubmit={onVerifiedAndSubmit}
            formDesign={formDesign}
            formData={formData}
            event={accEvent}
            onError={setError}
          />
        )}
        <Footer footerData={footerDetails} />
      </>
      {error && <ErrorPage />}
    </>
  );
};
