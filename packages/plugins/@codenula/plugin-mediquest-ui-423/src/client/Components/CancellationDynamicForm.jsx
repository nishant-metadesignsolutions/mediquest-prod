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
import StyledText from './StyledText';
import { ErrorPage } from '../Pages/ErrorPage';
import { HelpAndSupportPopup } from './HelpAndSupportPopup';
import { createCancellationRequest } from '../utils/supportQuery';
import { sendQueryConfirmationBackendEmail, sendQueryConfirmationEmail } from '../utils/sms';
import { getPaymentCategories } from '../utils/getData';
import { uploadAttachments } from '../utils/attendee';

export const CancellationDynamicForm = ({ formData, formDesign }) => {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const { allEvents, loading, footerDetails } = useAllEventsData();
  const { countryList, loadingLocation } = useAllLoactionData();
  const [payment, setPayment] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [isFormEdited, setFormEdited] = useState(false);
  const [validForm, setValidForm] = useState(true);
  const [initialFormValues, setInitialFormValues] = useState({});
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [error, setError] = useState(false);
  const [queryId, setQueryId] = useState(null);
  const [query, setQuery] = useState(false);

  const allCountry = useMemo(() => {
    return countryList;
  }, [countryList]);

  const fieldsToIgnore = [
    'updatedById',
    'createdById',
    'createdAt',
    'updatedAt',
    'eventId',
    'paymentCategory',
    'id',
    'sort',
    'message_placeholder',
    'form_title',
    'cancellation_instructions',
    'thankyou_message_head',
    'thankyou_message_footer',
    'currentPaymentCategoryFieldTitle',
    'newPaymentCategoryFieldTitle',
    'travelAttachmentFieldTitle',
    'refundPaymentCategoryTitle',
  ];
  useEffect(() => {
    (async () => {
      const paymentCategories = await getPaymentCategories();
      setPayment(paymentCategories);
    })();
    console.log(formData.event_start_date);
  }, [formData]);

  const handleInputChange = (event) => {
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      [event.target.name]: event.target.value,
    }));
    // Mark the form as edited when there's an input change
    setFormEdited(true);
  };

  const renderInputField = (key, value) => {
    const handleCountryChange = (event) => {
      setFormValues((prevFormValues) => ({
        ...prevFormValues,
        country_code: event.target.value,
      }));
      // formValues.stateId = '';
      // formValues.cityId = '';
      emptyFieldCheck(formValues);
    };
    const handleInputChange = (event) => {
      setFormValues((prevFormValues) => ({
        ...prevFormValues,
        [key]: event.target.value,
      }));
      emptyFieldCheck(formValues);
    };
    const handleFileChange = (event) => {
      setFormValues((prevFormValues) => ({
        ...prevFormValues,
        [key]: event.target.files[0],
      }));
      emptyFieldCheck(formValues);
    };
    if (fieldsToIgnore.includes(key)) {
      return null;
    } else if (key === 'event_name') {
      return (
        <div className="form-col">
          <div className="form-group" key={key}>
            <label name={key} className="wt-600">
              {key.toUpperCase().replace(/_/g, ' ')}: {<span style={{ color: 'red' }}>*</span>}
            </label>
            <div className="textbox-inner">
              <select id={key} name={key} className="form-control" onChange={handleInputChange}>
                <option value={''}>Please Select</option>
                {allEvents &&
                  allEvents.map((event, index) => (
                    <option key={event.event_title + index} value={event.event_title}>
                      {event.event_title.toUpperCase().replace(/_/g, ' ')}
                    </option>
                  ))}
              </select>
              <div id={`${key}-error`} style={{ color: 'red' }}></div>
            </div>
          </div>
        </div>
      );
    } else if (
      key === 'first_name' ||
      key === 'last_name' ||
      key === 'registered_email' ||
      key === 'registered_phone' ||
      key === 'registration_id'
    ) {
      // Render input field for non-empty values
      return (
        <div className="form-col">
          <div className="form-group" key={key}>
            {key === 'registered_phone' && (
              <label name={key} className="wt-600">
                {key.toUpperCase().replace(/_/g, ' ')}:
              </label>
            )}
            {key !== 'registered_phone' && (
              <label name={key} className="wt-600">
                {key.toUpperCase().replace(/_/g, ' ')}: {<span style={{ color: 'red' }}>*</span>}
              </label>
            )}
            <div className="textbox-inner">
              {key === 'registered_phone' && (
                <div style={{ display: 'flex' }}>
                  <div key="country_code" style={{ maxWidth: '15%', marginRight: '7px' }}>
                    <select
                      id="country_code"
                      name="country_code"
                      className="form-control"
                      onChange={handleCountryChange}
                    >
                      <option value={''}>Country Code</option>
                      {allCountry &&
                        allCountry.map((countryItem, index) => (
                          <option key={countryItem.country_code + index} value={countryItem.country_code}>
                            {countryItem.country_name + ' ' + '+(' + countryItem.country_code + ')'}
                          </option>
                        ))}
                    </select>
                  </div>
                  <input
                    id={key}
                    name="registered-phoneNo"
                    className="form-control"
                    type="text"
                    onChange={handleInputChange}
                  />
                </div>
              )}
              {key !== 'registered_phone' && (
                <input id={key} name={key} className="form-control" type="text" onChange={handleInputChange} />
              )}
              {key === 'registration_id_prefix' && (
                <div style={{ color: 'red', fontSize: '12px' }}>Ex: XYZ, MDS, TCS</div>
              )}
              <div id={`${key}-error`} style={{ color: 'red' }}></div>
            </div>
          </div>
        </div>
      );
    } else if (key === 'transaction_id' || key === 'rrn_number') {
      return (
        <div className="form-col" style={formValues.queries === 'Refund status' ? {} : { display: 'none' }}>
          <div className="form-group" key={key}>
            <label name={key} className="wt-600">
              {key.toUpperCase().replace(/_/g, ' ')}: {<span style={{ color: 'red' }}>*</span>}
            </label>
            <div className="textbox-inner">
              <input id={key} name={key} className="form-control" type="text" onChange={handleInputChange} />
              <div id={`${key}-error`} style={{ color: 'red' }}></div>
            </div>
          </div>
        </div>
      );
    } else if (key === 'othersQuery' || key === 'message') {
      // Render input field for non-empty values
      return (
        <div className="form-col">
          <div className="form-group" key={key}>
            <div className="textbox-inner">
              <textarea
                rows={4}
                cols={63}
                id={key}
                name={key}
                onChange={handleInputChange}
                style={{ resize: 'none' }}
                className="form-control"
                placeholder={key === 'othersQuery' ? formData['message_placeholder'] : ''}
              />
              <div id={`${key}-error`} style={{ color: 'red' }}></div>
            </div>
          </div>
        </div>
      );
    } else if (key === 'currentPaymentCategory' || key === 'newPaymentCategory') {
      // Render multiple select checkbox for arrays
      return (
        <>
          <div
            className="form-col"
            style={formValues.queries === 'Change request in registration category' ? {} : { display: 'none' }}
          >
            <div className="form-group" key={key}>
              {key === 'currentPaymentCategory' && (
                <label id={key} name={key} className="wt-600">
                  {formData['currentPaymentCategoryFieldTitle']
                    ? `${formData['currentPaymentCategoryFieldTitle']}:`
                    : 'Please select your Current Payment Category:'}
                  {<span style={{ color: 'red' }}>*</span>}
                </label>
              )}
              {key === 'newPaymentCategory' && (
                <label id={key} name={key} className="wt-600">
                  {formData['newPaymentCategoryFieldTitle']
                    ? `${formData['newPaymentCategoryFieldTitle']}:`
                    : 'Please select a New Payment Category:'}
                  {<span style={{ color: 'red' }}>*</span>}
                </label>
              )}
              {key === 'refundPaymentCategory' && (
                <label id={key} name={key} className="wt-600">
                  {formData['refundPaymentCategoryFieldTitle']
                    ? `${formData['refundPaymentCategoryFieldTitle']}:`
                    : 'Please select your Payment Category:'}
                  {<span style={{ color: 'red' }}>*</span>}
                </label>
              )}
              <div className="textbox-inner">
                <select id={key} name={key} className="form-control" onChange={handleInputChange}>
                  <option value={''}>Please Select</option>
                  {payment.map((p) => (
                    <option value={p.category_name} key={p.category_name}>
                      {p.category_name.toUpperCase().replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div id={`${key}-error`} style={{ color: 'red' }}></div>
            </div>
          </div>
        </>
      );
    } else if (key === 'refundPaymentCategory') {
      // Render multiple select checkbox for arrays
      return (
        <>
          <div className="form-col" style={formValues.queries === 'Refund status' ? {} : { display: 'none' }}>
            <div className="form-group" key={key}>
              {key === 'refundPaymentCategory' && (
                <label id={key} name={key} className="wt-600">
                  {formData['refundPaymentCategoryTitle']
                    ? `${formData['refundPaymentCategoryTitle']}:`
                    : 'Please select your Payment Category:'}
                  {<span style={{ color: 'red' }}>*</span>}
                </label>
              )}
              <div className="textbox-inner">
                <select id={key} name={key} className="form-control" onChange={handleInputChange}>
                  <option value={''}>Please Select</option>
                  {payment.map((p) => (
                    <option value={p.category_name} key={p.category_name}>
                      {p.category_name.toUpperCase().replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div id={`${key}-error`} style={{ color: 'red' }}></div>
            </div>
          </div>
        </>
      );
    } else if (key === 'travel_attachment' || (value && value.length > 0 && value[0] && value[0].url)) {
      return (
        <>
          <div
            className="form-col"
            style={formValues.queries === 'Raise Cancellation Request' ? {} : { display: 'none' }}
          >
            <div className="form-group" key={key}>
              {key === 'travel_attachment' && (
                <label id={key} name={key} className="wt-600">
                  {formData.travelAttachmentFieldTitle ? formData.travelAttachmentFieldTitle : 'Attachment'}
                </label>
              )}
              {key !== 'travel_attachment' && (
                <label id={key} name={key} className="wt-600">
                  {key.toUpperCase().replace(/_/g, ' ')}:
                </label>
              )}
              <div className="textbox-inner">
                <input type="file" id={key} name={key} className="form-control" onChange={handleFileChange} />
              </div>
            </div>
          </div>
        </>
      );
    } else if (key && Array.isArray(value) && value.length > 0) {
      // Render multiple select checkbox for arrays
      return (
        <>
          <div className="form-col">
            <div className="form-group" key={key}>
              {key === 'queries' && (
                <label id={key} name={key} className="wt-600">
                  {`What assistance do you need? Please Select:`}{' '}
                  {key === 'queries' ? <span style={{ color: 'red' }}> *</span> : ''}
                </label>
              )}
              {key !== 'queries' && (
                <label id={key} name={key} className="wt-600">
                  {key.toUpperCase().replace(/_/g, ' ')}:
                  {key === 'queries' ? <span style={{ color: 'red' }}>*</span> : ''}
                </label>
              )}
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
              {key === 'queries' && <div id={`${key}-error`} style={{ color: 'red' }}></div>}
            </div>
          </div>
        </>
      );
    } else if (key === 'event_start_date' || key === 'event_end_date') {
      // Render input field for non-empty values
      return (
        <div
          className="form-col"
          style={formValues.queries === 'Raise Cancellation Request' ? {} : { display: 'none' }}
        >
          <div className="form-group" key={key}>
            <label id={key} name={key} className="wt-600">
              {key.toUpperCase().replace(/_/g, ' ')}: {<span style={{ color: 'red' }}>*</span>}
            </label>
            <div className="textbox-inner">
              <input type="date" id={key} name={key} className="form-control" onChange={handleInputChange} />
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
            <label id={key} name={key} className="wt-600">
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

  const handleSubmit = (event) => {
    event.preventDefault();
    setValidForm(true);
    const attachments = [];
    // formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // console.log('formValues: ', formValues);

    const firstEmptyField = emptyFieldCheckOnSubmit(formValues);

    if (firstEmptyField) {
      // Scroll to the first empty field
      firstEmptyField.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setValidForm(false);
      return false;
    }
    let firstInvalidField = null;
    // // Check email and phone number validations
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
    } else if (formValues.registered_phone && formValues.country_code != '91' && !validatePhoneNumberInternational()) {
      setValidForm(false);
      if (!firstInvalidField) {
        firstInvalidField = document.getElementById('registered_phone');
      }
    } else if (formValues.registered_phone && formValues.country_code == '91' && !validatePhoneNumber()) {
      setValidForm(false);
      if (!firstInvalidField) {
        firstInvalidField = document.getElementById('registered_phone');
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

    if (formValues.queries === 'Others (please fill below)') {
      formValues.currentPaymentCategory = '';
      formValues.newPaymentCategory = '';
      formValues.event_start_date = '';
      formValues.event_end_date = '';
      formValues.travel_attachment = null;
      formValues.refundPaymentCategory = '';
      formValues.transaction_id = '';
      formValues.rrn_number = '';
    }
    if (formValues.queries === 'Change request in registration category') {
      formValues.event_start_date = '';
      formValues.event_end_date = '';
      formValues.travel_attachment = null;
      formValues.refundPaymentCategory = '';
      formValues.transaction_id = '';
      formValues.rrn_number = '';
    }
    if (formValues.queries === 'Raise Cancellation Request') {
      formValues.currentPaymentCategory = '';
      formValues.newPaymentCategory = '';
      formValues.refundPaymentCategory = '';
      formValues.transaction_id = '';
      formValues.rrn_number = '';
    }
    if (formValues.queries === 'Refund status') {
      formValues.event_start_date = '';
      formValues.event_end_date = '';
      formValues.travel_attachment = null;
      formValues.currentPaymentCategory = '';
      formValues.newPaymentCategory = '';
    }
    if (formValues.travel_attachment) {
    }
    if (!firstEmptyField && !firstInvalidField && validForm) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (formValues.travel_attachment) {
        (async () => {
          // const upload_attachment = await uploadAttachments(formValues.travel_attachment);
          // attachments.push(upload_attachment);
          // console.log('upload_attachment: ', upload_attachment);
        })();
      }
      // console.log("attachments: ", attachments);
      // (async () => {
      //   try {
      //     const id = await createCancellationRequest(formValues, attachments);
      //     setQueryId(id);
      //     setQuery(true);
      //   } catch (err) {
      //     throw err;
      //   }
      // })();
      // if (formValues.travel_attachment) {
      // console.log('file: ', formValues.travel_attachment);
      // const f = formValues.travel_attachment.fileInput.files[0];
      // console.log(f);
      // (async () => {
      //   const d = await uploadAttachment(formValues.travel_attachment);
      //   console.log(d);
      // })();
      // }
    }
    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setInitialFormValues(formValues);
    // (async () => await createQuery(formValues))();
    // console.log(formValues);
    // setPopupOpen(true);
  };

  useEffect(() => {
    if (query) {
      // setQueryId(parseInt(id));
      (async () => {
        try {
          //   await sendQueryConfirmationEmail(queryId);
          //   await sendQueryConfirmationBackendEmail(queryId);
        } catch (err) {
          throw err;
        }
      })();
      //   setPopupOpen(true);
    }
  }, [query]);

  if (loading || loadingLocation || !payment) {
    return <Loader />;
  }
  return (
    <>
      {(loading || loadingLocation || !payment) && <Loader />}
      <>
        <Navbar />
        <section className="form-box">
          <form
            className="container"
            style={isPopupOpen ? { display: 'none' } : { display: 'block' }}
            ref={formRef}
            onSubmit={handleSubmit}
          >
            <h4 className="text-blue mg-b-20">{formData && formData['form_title']}</h4>
            <StyledText htmlContent={formData && formData['cancellation_instructions']} className="mb-10" />

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
                    case 'queries':
                      label = 'What assistance do you need? Please Select:'; // Replace 'cityId' with appropriate label
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
                SUBMIT
              </button>
            </div>
            {/* <div className="important-notes-list">
              <div className="goal-row">
                <StyledText htmlContent={accEvent && accEvent?.important_note} />
              </div>
            </div> */}
          </form>
        </section>

        {isPopupOpen && <HelpAndSupportPopup formData={formData} queryId={queryId} onError={setError} />}
        <Footer footerData={footerDetails} />
      </>
      {error && <ErrorPage />}
    </>
  );
};
