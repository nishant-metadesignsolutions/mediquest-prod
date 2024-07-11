import { React, useEffect, useState } from 'react';
import { COLLECTION_AUTH_TOKEN, MEDIQUEST_URL } from '../myvars.js';
import Loader from '../Components/Loader.jsx';
import '../assets2/css/override.css';
import './RegistrationForm.css';
import { CancellationDynamicForm } from '../Components/CancellationDynamicForm.jsx';

const formDesign = [
  { fields: ['event_name', 'registration_id'], style: 'form-row2' },
  { fields: ['first_name', 'last_name'], style: 'form-row2' },
  { fields: ['registered_email', 'registered_phone'], style: 'form-row2' },
  { fields: ['queries'], style: 'form-row2' },
  { fields: ['currentPaymentCategory', 'newPaymentCategory'], style: 'form-row2' },
  { fields: ['event_start_date', 'event_end_date'], style: 'form-row2' },
  { fields: ['refundPaymentCategory', 'transaction_id', 'rrn_number'], style: 'form-row3' },
  { fields: ['othersQuery'], style: 'form-row2' },
  { fields: ['travel_attachment'], style: 'form-row2' },
  { fields: ['message'], style: 'form-row2' },
];

export const CancellationRegistration = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ data: [] });

  useEffect(() => {
    async function fetchData() {
      try {
        const collectionURL = `${MEDIQUEST_URL}cancellation_form:get?pageSize=1000&appends%5B%5D=travel_attachment`;
        const formData = await fetch(collectionURL, {
          method: 'GET',
          headers: {
            Authorization: COLLECTION_AUTH_TOKEN,
          },
        });

        const jsonData = await formData.json();
        const eventForm = jsonData.data;
        // console.log("eventForm: ",eventForm);
        setData(eventForm);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);
  return (
    <>
      {loading && <Loader />}
      <section className="wrapper">
        <div>
          <CancellationDynamicForm formData={data} formDesign={formDesign} />
        </div>
      </section>
    </>
  );
};
