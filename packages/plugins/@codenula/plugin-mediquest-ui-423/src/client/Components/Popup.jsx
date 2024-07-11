import { useState } from 'react';
import Loader from './Loader.jsx';
import '../assets2/css/main.min.css';
import '../assets2/css/external.css';
import '../assets2/css/override.css';
import StyledText from './StyledText.jsx';
import { ErrorPage } from '../Pages/ErrorPage';

export const Popup = ({ formValues, onClose, onVerifiedAndSubmit, formDesign, formData, event, onError }) => {
  const [error, setError] = useState(false);
  const labelStyle = {
    fontWeight: 'bold',
    marginRight: '8px', // Adjust margin as needed
  };

  const mapFieldNameToLabel = (fieldName) => {
    switch (fieldName) {
      case 'paymentId':
        return 'Payment Category';
      case 'discountCouponId':
        return 'Discount Coupon';
      case 'stateId':
        return 'State';
      case 'cityId':
        return 'City';
      case 'countryId':
        return 'Country';
      // Add more cases as needed
      default:
        return fieldName;
    }
  };
  const hadleVerifyAndSubmit = async () => {
    try {
      await onVerifiedAndSubmit()
    } catch {
      setError(true);
      onError(error);
    }
  };

  return (
    <>
      {!error && (
        <section className="form-box registration-confirm">
          <div className="container">
            <div class="forms-fills-page">
              <h4 className="text-blue mg-b-20">{event.verification_instruction}</h4>
              {formDesign.map((row, rowIndex) => (
                <div key={rowIndex} className={`form-row ${row.style}`}>
                  {row.fields.map((eachField, fieldIndex) => {
                    const fieldValue = formData[eachField];
                    if (fieldValue !== undefined && fieldValue !== '' && fieldValue !== null) {
                      if (eachField == 'gender_others' && !formValues.gender_others) {
                        return null;
                      }
                      if (eachField == 'description_of_practice_others' && !formValues.description_of_practice_others) {
                        return null;
                      }
                      if (eachField == 'membership') {
                        return null;
                      }
                      if (eachField == 'csi_member_id' && !formValues.csi_member_id) {
                        return null;
                      }
                      if (eachField == 'csi_chapter_name' && !formValues.csi_chapter_name) {
                        return null;
                      }
                      if (eachField == 'name_of_institution' && !formValues.name_of_institution) {
                        return null;
                      }
                      if (
                        eachField == 'enrollment_number_or_student_id' &&
                        !formValues.enrollment_number_or_student_id
                      ) {
                        return null;
                      } else {
                        return (
                          <>
                            <div className="form-col">
                              <div key={rowIndex} className="form-group">
                                <span style={labelStyle}>
                                  {mapFieldNameToLabel(eachField).toUpperCase().replace(/_/g, ' ')}:
                                </span>
                                {/* <div className="textbox-inner">
                              <input
                                type="text"
                                className="form-control"
                                value={
                                  formValues[eachField] ? formValues[eachField].toUpperCase().replace(/_/g, ' ') : '- -'
                                }
                                disabled
                              />
                            </div> */}
                                <div className="textbox-inner">
                                  {formValues[eachField] == 'on' && formValues[eachField] ? (
                                    <input type="checkbox" checked={formValues[eachField]} disabled />
                                  ) : (
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={
                                        typeof formValues[eachField] === 'string' && formValues[eachField]
                                          ? formValues[eachField].toUpperCase().replace(/_/g, ' ')
                                          : '- -'
                                      }
                                      disabled
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      }
                    }
                    return null;
                  })}
                </div>
              ))}
              <div className="registration-btns regist-btns2">
                <button className="btn btn-blue btn-lg" onClick={onClose}>
                  EDIT FORM
                </button>
                <button className="btn btn-blue btn-lg" onClick={hadleVerifyAndSubmit}>
                  {formValues.company_name? "CONFIRM & PROCEED": "CONFIRM & PROCEED TO PAY"}
                </button>
              </div>
              <div className="important-notes-list">
                <StyledText htmlContent={event.important_note} />
              </div>
            </div>
          </div>
        </section>
      )}
      {error && <ErrorPage error={true}/>}
    </>
  );
};
