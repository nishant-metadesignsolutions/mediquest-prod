import { useState, useEffect, useMemo, useRef } from 'react';
import { COLLECTION_AUTH_TOKEN, MEDIQUEST_URL, ACC_ASIA_URL } from '../myvars.js';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader.jsx';
import { Popup } from './Popup.jsx';
import '../assets2/css/main.min.css';
import '../assets2/css/external.css';
import '../assets2/css/override.css';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import { sendEmail, sendSMS } from '../utils/sms.js';
import { useAllEventsData } from '../context/EventDetailsProvider.jsx';
import { useAllLoactionData } from '../context/LocationDetailsProvider.jsx';
import { getPaymentCategories, getCountryCode, getAllCoupons } from '../utils/getData.js';
import { createOrder } from '../utils/payment.js';
// import { updateCoupon } from '../utils/coupon.js';
import { createAttendee } from '../utils/attendee.js';
import {
  validatePhoneNumber,
  validatePhoneNumberInternational,
  validateEmail,
  validatePincodeInternational,
  validatePincode,
  validateCoupon,
  clearErrorMessage,
  emptyFieldCheck,
  emptyFieldCheckOnSubmit,
  validateFirstName,
  validateLastName,
  validateDOB,
} from '../utils/validation.js';
import StyledText from './StyledText.jsx';
import { ErrorPage } from '../Pages/ErrorPage';

const formDesign = [
  { fields: ['paymentId'], style: '' },
  { fields: ['csi_member_id', 'csi_chapter_name'], style: 'form-row2' },
  { fields: ['name_of_institution', 'enrollment_number_or_student_id'], style: 'form-row2' },
  { fields: ['salutation', 'first_name', 'last_name'], style: 'form-row2' },
  { fields: ['gender', 'gender_others', 'date_of_birth'], style: 'form-row3' },
  { fields: ['qualification', 'profession', 'profession_others', 'years_of_practice'], style: 'form-row3' },
  {
    fields: ['description_of_practice', 'description_of_practice_others', 'affiliated_institution'],
    style: 'form-row3',
  },
  { fields: ['address', 'pincode'], style: 'form-row2' },
  { fields: ['countryId', 'stateId', 'cityId'], style: 'form-row3' },
  { fields: ['contact_number', 'email_id'], style: 'form-row3' },
  { fields: ['areas_of_interest'], style: '' },
  { fields: ['membership'], style: 'form-row2' },
  { fields: ['discountCouponId'], style: 'form-row2' },
];

export const DynamicForm = ({ formData }) => {
  const [city, setCity] = useState([]);
  const [state, setState] = useState([]);
  const [country, setCountry] = useState([]);
  const [payment, setPayment] = useState([]);
  const [allDiscount, setDiscount] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [validForm, setValidForm] = useState(true);
  const [event, setEvent] = useState({});
  const [filteredCities, setFilteredCities] = useState([]);
  const [filteredStates, setFilteredStates] = useState([]);
  const formRef = useRef(null);
  const { allEvents, loading, footerDetails } = useAllEventsData();
  const { countryList, stateList, cityList, loadingLocation } = useAllLoactionData();
  const [initialFormValues, setInitialFormValues] = useState({});
  const [isFormEdited, setFormEdited] = useState(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  // const [selectedMembership, setSelectedMembership] = useState('mem2');

  const accEvent = useMemo(() => {
    // Select the event you want to use
    return allEvents.find((e) => e.event_title === 'ACC Asia 2024');
  }, [allEvents]);
  useEffect(() => {
    (async () => {
      try {
        const eventURL = `${MEDIQUEST_URL}event:get?filterByTk=${parseInt(7)}&pageSize=1000`;
        const eventData = await fetch(eventURL, {
          method: 'GET',
          headers: {
            Authorization: COLLECTION_AUTH_TOKEN,
          },
        });
        const myData = await eventData.json();
        setEvent(myData.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setEvent({}); // or handle the error appropriately
      }
    })();
  }, [formData.eventId]);
  const allCountry = useMemo(() => {
    return countryList;
  }, [countryList]);
  const allStates = useMemo(() => {
    return stateList;
  }, [stateList]);
  const allCitites = useMemo(() => {
    return cityList;
  }, [cityList]);
  useEffect(() => {
    if (show == true) {
      formValues.membership = 'on';
    } else {
      formValues.membership = '';
    }
  }, [show]);

  const navigate = useNavigate();
  useEffect(() => {
    async function fetchData() {
      try {
        setCity(allCitites);

        if (formData.stateId !== null && formData.stateId !== undefined && formData.stateId !== '') {
          setState(allStates);
        }

        if (formData.countryId !== null && formData.countryId !== undefined && formData.countryId !== '') {
          setCountry(allCountry);
        }

        if (formData.paymentId !== null && formData.paymentId !== undefined && formData.paymentId !== '') {
          const paymentCategories = await getPaymentCategories();
          setPayment(paymentCategories);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, [formData.countryId, formData.stateId, formData.cityId, formData.paymentId, loading, loadingLocation]);
  useEffect(() => {
    const fetchStates = async () => {
      const stId = await getStateAndCityId();
      var curCountry;
      country.forEach((c) => {
        if (c.id == stId.countryId) {
          curCountry = c;
        }
      });

      const stateItems = [];
      state.forEach((s) => {
        if (s.countryId == curCountry.id) {
          stateItems.push(s);
        }
      });

      setFilteredStates(stateItems);
    };
    const fetchCities = async () => {
      const stId = await getStateAndCityId();
      var curState;
      state.forEach((s) => {
        if (s.id == stId.stateId) {
          curState = s;
        }
      });

      const cityItems = [];
      city.forEach((c) => {
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
  }, [formValues, city, state, country]);
  const fieldsToIgnore = ['updatedById', 'createdById', 'createdAt', 'updatedAt', 'eventId', 'paymentCategory', 'id', 'sort'];
  const getStateAndCityId = async () => {
    const stateAndCity = {
      countryId: '',
      country_code: '',
      stateId: '',
      cityId: '',
    };
    if (formValues.cityId) {
      city.forEach((c) => {
        if(c.city_name.toLowerCase() === formValues.cityId.toLowerCase()){
          stateAndCity.cityId = c.id;
        }
      });
    }

    if (formValues.stateId) {
      state.forEach((s) => {
        if (s.state_name.toLowerCase() === formValues.stateId.toLowerCase()) {
          stateAndCity.stateId = s.id;
        }
      });
    }

    if (formValues.countryId) {
      country.forEach((s) => {
        if(s.country_name.toLowerCase() === formValues.countryId.toLowerCase()){
          stateAndCity.countryId = s.id;
          stateAndCity.country_code = s.country_code;
        }
      });
    }
    return stateAndCity;
  };

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
    if (key === 'date_of_birth' && value !== null && value !== undefined && value !== '') {
      // Render multiple select checkbox for arrays
      return (
        <div className="form-col">
          <div className="form-group" key={key}>
            <label id="date_of_birth" name="date_of_birth">
              {key.toUpperCase().replace(/_/g, ' ')}:
            </label>
            <div className="textbox-inner">
              <input
                className="form-control"
                id="date_of_birth_input"
                type="date"
                name={key}
                onChange={handleInputChange}
              />
              <div id="date_of_birth_input-error" style={{ color: 'red' }}></div>
            </div>
          </div>
        </div>
      );
    } else if (
      (key === 'gender' || key === 'profession' || key === 'years_of_practice') &&
      Array.isArray(value) &&
      value.length > 0
    ) {
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
    } else if (key === 'gender_others') {
      return (
        <>
          <div className="form-col">
            <div className="form-group" key={key}>
              <label
                id={key}
                name={key}
                style={{ fontStyle: 'italic' }}
                className={formValues.gender == 'Others' ? '' : 'others-field'}
              >
                Others:
              </label>
              <div className="textbox-inner">
                <input
                  id={key}
                  name={key}
                  className="form-control"
                  type="text"
                  onChange={handleInputChange}
                  disabled={formValues.gender !== 'Others'}
                  value={formValues.gender == 'Others' ? formValues.gender_others : ''}
                />
              </div>
            </div>
          </div>
        </>
      );
    } else if (key === 'profession_others') {
      return (
        <>
          <div className="form-col">
            <div className="form-group" key={key}>
              <label
                id={key}
                name={key}
                style={{ fontStyle: 'italic' }}
                className={formValues.profession == 'Others' ? '' : 'others-field'}
              >
                Others:
              </label>
              <div className="textbox-inner">
                <input
                  id={key}
                  name={key}
                  className="form-control"
                  type="text"
                  onChange={handleInputChange}
                  disabled={formValues.profession !== 'Others'}
                  value={formValues.profession == 'Others' ? formValues.profession_others : ''}
                />
              </div>
            </div>
          </div>
        </>
      );
    } else if (key === 'description_of_practice' && Array.isArray(value) && value.length > 0) {
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
    } else if (key === 'description_of_practice_others') {
      // Render multiple select checkbox for arrays
      // const isDescriptionOfPracticeOther = formValues.description_of_practice === 'Others';
      return (
        <>
          <div className="form-col">
            <div className="form-group" key={key}>
              <label
                id={key}
                name={key}
                style={{ fontStyle: 'italic' }}
                className={formValues.description_of_practice == 'Others' ? '' : 'others-field'}
              >
                Others:
              </label>
              <div className="textbox-inner">
                <input
                  id={key}
                  name={key}
                  className="form-control"
                  type="text"
                  onChange={handleInputChange}
                  disabled={formValues.description_of_practice !== 'Others'}
                  value={
                    formValues.description_of_practice == 'Others' ? formValues.description_of_practice_others : ''
                  }
                />
              </div>
            </div>
          </div>
        </>
      );
    } else if (key === 'countryId' && Array.isArray(country) && country.length > 0) {
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
                {country &&
                  country.map((countryItem) => (
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
    } else if (key === 'stateId' && Array.isArray(state) && state.length > 0) {
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
    } else if (key === 'cityId' && Array.isArray(city) && city.length > 0) {
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
    } else if (key !== 'paymentId' && Array.isArray(value) && value.length > 0) {
      // Render multiple select checkbox for arrays
      return (
        <div className="form-col">
          <div className="form-group" key={key}>
            <label id={key} name={key}>
              {key.toUpperCase().replace(/_/g, ' ')}:
            </label>
            <div className="textbox-inner" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
              {value.map((item) => (
                <label
                  key={item}
                  style={{
                    fontSize: '10px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginRight: '15px',
                  }}
                >
                  <input
                    id={key}
                    name={key}
                    type="checkbox"
                    className="form-control"
                    value={item}
                    style={{ width: '14px', height: '14px', marginLeft: '8px' }}
                    onChange={handleCheckboxChange}
                  />
                  <span>{item.toUpperCase().replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      );
    } else if (key === 'paymentId') {
      // Render multiple select checkbox for arrays
      return (
        <div className="category-tables mg-b-0">
          <div className="has-actions">
            <h4>Select a Category {<span style={{ color: 'red' }}>*</span>}</h4>
            <div className="membership">
              <label for="membership1">
                {' '}
                <input
                  type="radio"
                  name="membership"
                  onChange={() => setShow(false)}
                  id="membership1"
                  className="radio"
                  defaultChecked={true}
                />{' '}
                {accEvent?.conference_title}
              </label>
              <label for="membership2">
                {' '}
                <input
                  type="radio"
                  name="membership"
                  onChange={() => setShow(true)}
                  id="membership2"
                  className="radio"
                />{' '}
                {accEvent?.conference_subscription_title}
              </label>
            </div>
          </div>
          <div className="table-overflow">
            {/* style={{ minWidth: '700px' }} */}
            <table className="tables" style={{ minWidth: '700px' }}>
              <thead>
                <tr>
                  {/* style={{ width: '40%' }} */}
                  <th>
                    {/* Adjust width for the category column */}
                    <p className="bolds">Category</p>
                  </th>
                  {/* style={{ width: '20%' }} */}
                  <th>
                    {/* Adjust width for the Early Bird Rate column */}
                    <p>{accEvent?.early_bird_title}</p>
                    <p className="subtext">{`Till ${
                      payment && payment.length > 0 && payment[0]
                        ? new Intl.DateTimeFormat('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          }).format(new Date(payment[0].early_bird_date))
                        : ''
                    }`}</p>
                  </th>
                  {/* style={{ width: '20%' }} */}
                  <th>
                    {/* Adjust width for the Advance Rate column */}
                    <p>{accEvent?.advanced_title}</p>
                    <p className="subtext">{`Till ${
                      payment && payment.length > 0 && payment[0]
                        ? new Intl.DateTimeFormat('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          }).format(new Date(payment[0].advanced_date))
                        : ''
                    }`}</p>
                  </th>
                  {/* style={{ width: '20%' }} */}
                  <th>
                    {/* Adjust width for the Regular column */}
                    <p>{accEvent?.regular_title}</p>
                    <p className="subtext">Spot Registration</p>
                  </th>
                </tr>
              </thead>
              <tbody>
                {payment.map((item) => (
                  <tr key={item.category_name}>
                    <td className="gray">
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center', // Align items vertically centered
                          marginLeft: '10px',
                        }}
                      >
                        <input
                          type="radio"
                          className="form-control"
                          name={`${key}-radio-group`}
                          id={key}
                          value={item.category_name}
                          onChange={handleRadioChange}
                          style={{
                            width: '12px', // Fixed width for the radio button
                            height: '12px', // Fixed height for the radio button
                            marginRight: '12px', // Add spacing between radio button and text
                          }}
                        />
                        <p
                          className="bolds"
                          // style={{
                          //   // maxWidth: '450px',
                          //   // overflow: 'hidden',
                          //   // textOverflow: 'ellipsis',
                          //   // whiteSpace: 'nowrap',
                          // }}
                        >
                          {item.category_name.toUpperCase().replace(/_/g, ' ')}
                        </p>
                      </label>
                    </td>
                    <td className={new Date() <= new Date(payment[0].early_bird_date) ? 'pink' : 'gray'}>
                      {/* <p>{formValues.countryId == 'India' ? item.early_bird_inr : `$ ${item.payment_amount}`}</p> */}
                      {show && (
                        <p className={new Date() <= new Date(payment[0].early_bird_date) ? 'bolds' : ''}>
                          {formValues.countryId == 'India'
                            ? item.early_rate_membership_rupees
                            : item.early_rate_membership_rupees}
                        </p>
                      )}
                      {!show && (
                        <p className={new Date() <= new Date(payment[0].early_bird_date) ? 'bolds' : ''}>
                          {formValues.countryId == 'India' ? item.early_bird_inr : item.early_bird_inr}
                        </p>
                      )}
                    </td>
                    <td
                      className={
                        new Date() > new Date(payment[0].early_bird_date) &&
                        new Date() <= new Date(payment[0].advanced_date)
                          ? 'pink'
                          : 'gray'
                      }
                    >
                      {/* <p>{formValues.countryId == 'India' ? item.advanced_rate_inr : `$ ${item.advanced_rate}`}</p> */}

                      {/* <p>{formValues.countryId == 'India' ? item.advanced_rate_inr : item.advanced_rate_inr}</p> */}
                      {show && (
                        <p
                          className={
                            new Date() > new Date(payment[0].early_bird_date) &&
                            new Date() <= new Date(payment[0].advanced_date)
                              ? 'bolds'
                              : ''
                          }
                        >
                          {formValues.countryId == 'India'
                            ? item.advanced_rate_membership_rupees
                            : item.advanced_rate_membership_rupees}
                        </p>
                      )}
                      {!show && (
                        <p
                          className={
                            new Date() > new Date(payment[0].early_bird_date) &&
                            new Date() <= new Date(payment[0].advanced_date)
                              ? 'bolds'
                              : ''
                          }
                        >
                          {formValues.countryId == 'India' ? item.advanced_rate_inr : item.advanced_rate_inr}
                        </p>
                      )}
                    </td>
                    <td className={new Date() > new Date(payment[0].advanced_date) ? 'pink' : 'gray'}>
                      {/* <p>{formValues.countryId == 'India' ? item.regular_rate_inr : `$ ${item.regular_rate}`}</p> */}

                      {/* <p>{formValues.countryId == 'India' ? item.regular_rate_inr : item.regular_rate_inr}</p> */}
                      {show && (
                        <p className={new Date() > new Date(payment[0].advanced_date) ? 'bolds' : ''}>
                          {formValues.countryId == 'India'
                            ? item.regular_rate_membership_rupees
                            : item.regular_rate_membership_rupees}
                        </p>
                      )}
                      {!show && (
                        <p className={new Date() > new Date(payment[0].advanced_date) ? 'bolds' : ''}>
                          {formValues.countryId == 'India' ? item.regular_rate_inr : item.regular_rate_inr}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div id="paymentId-error" style={{ color: 'red' }}></div>
        </div>
      );
    } else if (key === 'discountCouponId') {
      // Render input field for non-empty values
      return (
        <div className="form-col">
          <div className="form-group" key={key}>
            <label id="coupon" name={key}>
              If you have a coupon, kindly enter it here.
            </label>
            <div className="textbox-inner">
              <input name={key} className="form-control" type="text" onChange={handleInputChange} id="coupon" />
              <div id="coupon-error" style={{ color: 'red' }}></div>
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
                  value={formValues.countryId ? `+ ${getCountryCode(formValues.countryId, country)}` : ''}
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
    } else if (key === 'first_name' || key === 'last_name') {
      // Render input field for non-empty values
      return (
        <div className="form-col">
          <div className="form-group" key={key}>
            <label name={key}>
              {key.toUpperCase().replace(/_/g, ' ')}: {<span style={{ color: 'red' }}>*</span>}
            </label>
            <div className="textbox-inner">
              <input id={key} name={key} className="form-control" type="text" onChange={handleInputChange} />
              <div id={`${key}-error`} style={{ color: 'red' }}></div>
            </div>
          </div>
        </div>
      );
    } else if (key === 'pincode') {
      // Render input field for non-empty values
      return (
        <div className="form-col">
          <div className="form-group" key={key}>
            <label name={key}>
              {`POSTAL CODE/${key.toUpperCase().replace(/_/g, ' ')}`}: {<span style={{ color: 'red' }}>*</span>}
            </label>
            <div className="textbox-inner">
              <div>
                <span>
                  <span>
                    <input name={key} className="form-control" type="text" onChange={handleInputChange} id="pincode" />
                  </span>
                </span>
              </div>
              <div id="pincode-error" style={{ color: 'red' }}></div>
            </div>
          </div>
        </div>
      );
    } else if (key === 'membership') {
      // Render input field for non-empty values
      return null;
    } else if (key === 'csi_member_id' || key === 'csi_chapter_name') {
      // Render input field for non-empty values
      const curKeyValue = formValues[key];
      return (
        <div
          className="form-col"
          style={formValues.paymentId == 'CSI Member' ? { display: 'block' } : { display: 'none' }}
        >
          <div className="form-group" key={key}>
            <label name={key}>
              {key.toUpperCase().replace(/_/g, ' ')}:{' '}
              {formValues.paymentId == 'CSI Member' && <span style={{ color: 'red' }}>*</span>}
            </label>
            <div className="textbox-inner">
              <div>
                <span>
                  <span>
                    <input
                      name={key}
                      id={key}
                      className="form-control"
                      type="text"
                      onChange={handleInputChange}
                      // required={formValues.paymentId == 'CSI Member'}
                      disabled={formValues.paymentId != 'CSI Member'}
                      value={formValues.paymentId == 'CSI Member' ? curKeyValue : ''}
                    />
                  </span>
                </span>
              </div>
              <div id={`${key}-error`} style={{ color: 'red' }}></div>
            </div>
          </div>
        </div>
      );
    } else if (key === 'name_of_institution' || key === 'enrollment_number_or_student_id') {
      // Render input field for non-empty values
      const curKeyValue = formValues[key];

      return (
        <div
          className="form-col"
          style={
            formValues.paymentId == 'Reduced (Residents, Students, Nurses, Allied Health Professional)'
              ? { display: 'block' }
              : { display: 'none' }
          }
        >
          <div className="form-group" key={key}>
            <label name={key}>
              {key.toUpperCase().replace(/_/g, ' ')}:{' '}
              {formValues.paymentId == 'Reduced (Residents, Students, Nurses, Allied Health Professional)' && (
                <span style={{ color: 'red' }}>*</span>
              )}
            </label>
            <div className="textbox-inner">
              <div>
                <span>
                  <span>
                    <input
                      name={key}
                      id={key}
                      className="form-control"
                      type="text"
                      onChange={handleInputChange}
                      // required={formValues.paymentId == 'Reduced (Residents, Students, Nurses, Allied Health Professional)'}
                      disabled={
                        formValues.paymentId != 'Reduced (Residents, Students, Nurses, Allied Health Professional)'
                      }
                      value={
                        formValues.paymentId == 'Reduced (Residents, Students, Nurses, Allied Health Professional)'
                          ? curKeyValue
                          : ''
                      }
                    />
                  </span>
                </span>
              </div>
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
    } else {
      // Skip rendering for blank or null values
      return null;
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const allCoupon = await getAllCoupons();
        if (JSON.stringify(allDiscount) !== JSON.stringify(allCoupon)) {
          setDiscount(allCoupon);
        }
      } catch (err) {
        console.log(err);
      }
    }
    fetchData();
  }, [allDiscount]);
  var amtToPay;
  const handleSubmit = (event) => {
    event.preventDefault();
    setValidForm(true);
    // formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    var validCoupon;
    var isValid = false;
    if (formValues.discountCouponId) {
      allDiscount.forEach((i) => {
        if (
          i.coupon_code == formValues.discountCouponId &&
          new Date(i.coupon_validity) >= new Date() &&
          i.coupon_user_count > 0
        ) {
          validCoupon = i;
          isValid = true;
        }
      });
    }
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
    } else if (!validateDOB(formValues)) {
      if (!firstInvalidField) {
        firstInvalidField = document.getElementById('date_of_birth_input');
      }
      setValidForm(false);
    } else if (!validateEmail()) {
      if (!firstInvalidField) {
        firstInvalidField = document.getElementById('email');
      }
      setValidForm(false);
    } else if (
      formValues.countryId != 'India' &&
      (!validatePhoneNumberInternational() || !validatePincodeInternational())
    ) {
      setValidForm(false);
      if (!firstInvalidField) {
        firstInvalidField = document.getElementById('pincode');
      }
    } else if (formValues.countryId == 'India' && (!validatePhoneNumber() || !validatePincode())) {
      setValidForm(false);
      if (!firstInvalidField) {
        firstInvalidField = document.getElementById('pincode');
      }
    }
    if (formValues.discountCouponId) {
      if (!validateCoupon(isValid)) {
        setValidForm(false);
        if (!firstInvalidField) {
          firstInvalidField = document.getElementById('coupon');
        }
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
    if (formValues.gender != 'Others') {
      formValues.gender_others = '';
    }
    if (formValues.profession != 'Others') {
      formValues.profession_others = '';
    }
    if (formValues.description_of_practice != 'Others') {
      formValues.description_of_practice_others = '';
    }
    if (formValues.paymentId != 'CSI Member') {
      formValues.csi_member_id = '';
    }
    if (formValues.paymentId != 'CSI Member') {
      formValues.csi_chapter_name = '';
    }
    if (formValues.paymentId != 'Reduced (Residents, Students, Nurses, Allied Health Professional)') {
      formValues.name_of_institution = '';
    }
    if (formValues.paymentId != 'Reduced (Residents, Students, Nurses, Allied Health Professional)') {
      formValues.enrollment_number_or_student_id = '';
    }
    if (!firstEmptyField && !firstInvalidField) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setInitialFormValues(formValues);
    setPopupOpen(true);
  };

  // useEffect(() => {
  //   if (!validForm) {
  //     const timeoutId = setTimeout(() => {
  //       clearErrorMessage();
  //       setValidForm(true);
  //     }, 8000);
  //     return () => clearTimeout(timeoutId);
  //   }
  // }, [validForm]);

  const closePopup = () => {
    setPopupOpen(false);
    // Reset form edited state
    setFormEdited(false);
  };

  const onVerifiedAndSubmit = async () => {
    try {
      var toPay;
      var amtToPay = 0;
      var netAmt;

      setFormEdited(false);
      const curDate = new Date();
      let serviceCharge;
      let transactionCharge;
      payment.forEach((i) => {
        if (i.category_name == formValues.paymentId) {
          if (curDate <= new Date(i.early_bird_date)) {
            if (formValues.countryId == 'India') {
              if (formValues.membership == 'on') {
                toPay = i.early_rate_membership_rupees;
              } else {
                toPay = i.early_bird_inr;
              }
              if (i.service_rupees != null && i.service_rupees != undefined && i.service_rupees != '') {
                serviceCharge = i.service_rupees;
              } else {
                serviceCharge = 0;
              }
              if (i.transaction_rupees != null && i.transaction_rupees != undefined && i.transaction_rupees != '') {
                transactionCharge = i.transaction_rupees;
              } else {
                transactionCharge = 0;
              }
            } else {
              // toPay = i.payment_amount;
              if (formValues.membership == 'on') {
                toPay = i.early_rate_membership_rupees;
              } else {
                toPay = i.early_bird_inr;
              }
              if (i.service_dollars != null && i.service_dollars != undefined && i.service_dollars != '') {
                serviceCharge = i.service_dollars;
              } else {
                serviceCharge = 0;
              }
              if (i.transaction_dollars != null && i.transaction_dollars != undefined && i.transaction_dollars != '') {
                transactionCharge = i.transaction_dollars;
              } else {
                transactionCharge = 0;
              }
            }
          } else if (curDate > new Date(i.early_bird_date) && curDate <= new Date(i.advanced_date)) {
            if (formValues.countryId == 'India') {
              if (formValues.membership == 'on') {
                toPay = i.advanced_rate_membership_rupees;
              } else {
                toPay = i.advanced_rate_inr;
              }
              if (i.service_rupees != null && i.service_rupees != undefined && i.service_rupees != '') {
                serviceCharge = i.service_rupees;
              } else {
                serviceCharge = 0;
              }
              if (i.transaction_rupees != null && i.transaction_rupees != undefined && i.transaction_rupees != '') {
                transactionCharge = i.transaction_rupees;
              } else {
                transactionCharge = 0;
              }
            } else {
              // toPay = i.advanced_rate;
              // toPay = i.advanced_rate_inr;
              if (formValues.membership == 'on') {
                toPay = i.advanced_rate_membership_rupees;
              } else {
                toPay = i.advanced_rate_inr;
              }
              if (i.service_dollars != null && i.service_dollars != undefined && i.service_dollars != '') {
                serviceCharge = i.service_dollars;
              } else {
                serviceCharge = 0;
              }
              if (i.transaction_dollars != null && i.transaction_dollars != undefined && i.transaction_dollars != '') {
                transactionCharge = i.transaction_dollars;
              } else {
                transactionCharge = 0;
              }
            }
          } else {
            if (formValues.countryId == 'India') {
              // toPay = i.regular_rate_inr;
              if (formValues.membership == 'on') {
                toPay = i.regular_rate_membership_rupees;
              } else {
                toPay = i.regular_rate_inr;
              }
              if (i.service_rupees != null && i.service_rupees != undefined && i.service_rupees != '') {
                serviceCharge = i.service_rupees;
              } else {
                serviceCharge = 0;
              }
              if (i.transaction_rupees != null && i.transaction_rupees != undefined && i.transaction_rupees != '') {
                transactionCharge = i.transaction_rupees;
              } else {
                transactionCharge = 0;
              }
            } else {
              // toPay = i.regular_rate;
              // toPay = i.regular_rate_inr;
              if (formValues.membership == 'on') {
                toPay = i.regular_rate_membership_rupees;
              } else {
                toPay = i.regular_rate_inr;
              }
              if (i.service_dollars != null && i.service_dollars != undefined && i.service_dollars != '') {
                serviceCharge = i.service_dollars;
              } else {
                serviceCharge = 0;
              }
              if (i.transaction_dollars != null && i.transaction_dollars != undefined && i.transaction_dollars != '') {
                transactionCharge = i.transaction_dollars;
              } else {
                transactionCharge = 0;
              }
            }
          }
        }
      });
      netAmt = toPay;
      amtToPay = toPay;
      let myC;
      // console.log('before discount: ', amtToPay);
      if (formValues.discountCouponId) {
        allDiscount.forEach((i) => {
          if (i.coupon_code == formValues.discountCouponId) {
            myC = i;
          }
        });
        if (myC && new Date(myC.coupon_validity) >= new Date() && myC.coupon_user_count > 0) {
          if (myC.coupon_max_amount != null && myC.coupon_max_amount != undefined && myC.coupon_max_amount != '') {
            amtToPay =
              parseFloat(toPay) -
              Math.min(
                myC.coupon_max_amount,
                parseFloat((parseFloat(toPay) * parseFloat(myC.coupon_discount_percentage)) / 100),
              );
          } else {
            amtToPay =
              parseFloat(toPay) - parseFloat((parseFloat(toPay) * parseFloat(myC.coupon_discount_percentage)) / 100);
          }
        }
      }
      const after_discount = amtToPay;
      amtToPay =
        parseFloat(after_discount) +
        parseFloat((parseFloat(after_discount) * parseFloat(serviceCharge)) / 100) +
        parseFloat((parseFloat(after_discount) * parseFloat(transactionCharge)) / 100);

      // const currency = formValues.countryId == 'India' ? 'INR' : 'USD';
      const currency = formValues.countryId == 'India' ? 'INR' : 'INR';
      var orderId;
      if (parseFloat(amtToPay) != parseFloat(0)) {
        try {
          orderId = await createOrder(Math.round(amtToPay), currency);
        } catch (error) {
          setError(true);
          throw error;
        }
      } else {
        try {
          orderId = await createOrder(parseInt(1), currency);
        } catch (error) {
          setError(true);
          throw error;
        }
      }
      const curOrderId = orderId.id;
      let stateAndCity;
      try {
        stateAndCity = await getStateAndCityId();
      } catch (err) {
        setError(true);
        throw err;
      }
      let attendeeId;
      try {
        attendeeId = await createAttendee(curOrderId, stateAndCity, formValues, formData);
      } catch (err) {
        setError(true);
        throw err;
      }
      if (attendeeId && attendeeId.status == 'payment-completed') {
        const toPath = `/events/${formData.eventId}/registered/${attendeeId.id}`;
        navigate(toPath);
        return;
      }

      const eventId = formData.eventId;
      const formValuesString = encodeURIComponent(JSON.stringify(formValues));
      const navigatePath = `/events/${eventId}/registration-completed/${parseInt(attendeeId)}`;
      const mobileNo = `${getCountryCode(formValues.countryId, country) + formValues.contact_number}`;
      if (formValues.countryId == 'India') {
        // await sendSMS(mobileNo, parseInt(attendeeId), formValuesString, curOrderId);
        try {
          await sendSMS(mobileNo, parseInt(attendeeId), eventId);
        } catch {
          setError(true);
        }
      }
      const allFormValues = formValues;
      try {
        await sendEmail(formValues.email_id, parseInt(attendeeId));
      } catch (err) {
        setError(true);
        throw err;
      }

      navigate(navigatePath);
      setPopupOpen(false);
      setError(false);
    } catch (err) {
      setError(true);
      console.log(err);
      throw err;
    }
  };
  if (!event || loading || loadingLocation) {
    return <Loader />;
  }

  return (
    <>
      {(loading || loadingLocation || !event || !country || !state || !city) && <Loader />}
      <>
        <Navbar />
        <section className="form-box">
          <form
            className="container"
            style={isPopupOpen ? { display: 'none' } : { display: 'block' }}
            ref={formRef}
            onSubmit={handleSubmit}
          >
            <h4 className="text-blue mg-b-20">{event.registration_instruction}</h4>
            <h4 className="form-heads">REGISTRATION FORM</h4>

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
                  if (fieldValue !== undefined && fieldValue !== '') {
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
                <StyledText htmlContent={accEvent?.important_note} />
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

export default DynamicForm;
