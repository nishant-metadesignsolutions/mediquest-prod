import { useEffect, useState } from 'react';
import Loader from './Loader.jsx';
import '../assets2/css/main.min.css';
import '../assets2/css/external.css';
import '../assets2/css/override.css';
import StyledText from './StyledText.jsx';
import { ErrorPage } from '../Pages/ErrorPage';
import { getQuery } from '../utils/supportQuery.js';

const formDesign = [
  { fields: ['request_no'], style: 'form-row2' },
  { fields: ['registered_name'], style: 'form-row2' },
  { fields: ['event_name'], style: 'form-row2' },
  // { fields: ['country_code','registered_phone'], style: 'form-row3' },
  { fields: ['queries'], style: 'form-row2' },
  { fields: ['othersQuery'], style: 'form-row2' },
  { fields: ['status'], style: 'form-row2' },
];

export const HelpAndSupportPopup = ({ formData, queryId, onError }) => {
  const [queryData, setQueryData] = useState({});
  const [error, setError] = useState(false);
  const labelStyle = {
    fontWeight: 'bold',
    marginRight: '8px', // Adjust margin as needed
  };

  useEffect(() => {
    console.log('queryId: ', queryId);
    if (!queryData.id) {
      (async () => {
        const data = await getQuery(parseInt(queryId));
        setQueryData(data);
      })();
    }
    console.log(queryData);
    console.log(formData);
  }, [queryData]);

  const mapFieldNameToLabel = (fieldName) => {
    switch (fieldName) {
      case 'queries':
        return 'Nature of Request';
      case 'othersQuery':
        return 'Message';
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
      //   await onVerifiedAndSubmit()
    } catch {
      setError(true);
      onError(error);
    }
  };

  return (
    <>
      {!error && (
        <section className="form-box form-box-rm-pd">
          <div className="container">
          <StyledText htmlContent={formData && formData['thankyou_message'] && formData['thankyou_message']} className="mb-10" />
            <div className="">
              {/* <h4 className="text-blue mg-b-20">{event.verification_instruction}</h4> */}
              {formDesign.map((row, rowIndex) => (
                <div key={rowIndex} className={`form-row ${row.style}`}>
                  {row.fields.map((eachField, fieldIndex) => {
                    let fieldValue;
                    fieldValue = queryData[eachField]? queryData[eachField]: null;
                    if(!fieldValue){
                      fieldValue = formData[eachField]? formData[eachField]: null;
                    }
                    if (fieldValue !== undefined && fieldValue !== '' && fieldValue !== null) {
                      if (eachField == 'gender_others' && !queryData.gender_others) {
                        return null;
                      }
                      if (eachField == 'description_of_practice_others' && !queryData.description_of_practice_others) {
                        return null;
                      }
                      if (eachField == 'membership') {
                        return null;
                      }
                      if (eachField == 'csi_member_id' && !queryData.csi_member_id) {
                        return null;
                      }
                      if (eachField == 'csi_chapter_name' && !queryData.csi_chapter_name) {
                        return null;
                      }
                      if (eachField == 'name_of_institution' && !queryData.name_of_institution) {
                        return null;
                      }
                      if (
                        eachField == 'enrollment_number_or_student_id' &&
                        !queryData.enrollment_number_or_student_id
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
                                <div className="textbox-inner">
                                  {queryData[eachField] == 'on' && queryData[eachField] ? (
                                    <input type="checkbox" checked={queryData[eachField]} disabled />
                                  ) : (
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={
                                        typeof queryData[eachField] === 'string' && queryData[eachField]
                                          ? queryData[eachField].toUpperCase().replace(/_/g, ' ')
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
              <StyledText htmlContent={formData && formData['thankyou_message_below'] && formData['thankyou_message_below']} className="mb-10" />
              {/* <div className="registration-btns regist-btns2">
                <button className="btn btn-blue btn-lg" onClick={onClose}>
                  EDIT FORM
                </button>
                <button className="btn btn-blue btn-lg" onClick={hadleVerifyAndSubmit}>
                  {queryData.company_name ? 'CONFIRM & PROCEED' : 'CONFIRM & PROCEED TO PAY'}
                </button>
              </div> */}
              {/* <div className="important-notes-list">
                <StyledText htmlContent={event.important_note} />
              </div> */}
            </div>
          </div>
        </section>
      )}
      {error && <ErrorPage error={true} />}
    </>
  );
};
