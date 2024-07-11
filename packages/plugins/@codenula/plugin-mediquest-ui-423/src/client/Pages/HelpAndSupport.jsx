import { React, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { COLLECTION_AUTH_TOKEN, MEDIQUEST_URL } from '../myvars.js';
import { GroupDynamicForm } from '../Components/GroupDynamicForm.jsx';
import Loader from '../Components/Loader.jsx';
import '../assets2/css/override.css';
import './RegistrationForm.css';
import { HelpDynamicForm } from '../Components/HelpDynamicForm.jsx';

const formDesign = [
  { fields: ['event_name', 'registration_id'], style: 'form-row2' },
  { fields: ['first_name', 'last_name'], style: 'form-row2' },
  { fields: ['registered_email', 'registered_phone'], style: 'form-row2' },
  // { fields: ['country_code','registered_phone'], style: 'form-row3' },
  { fields: ['queries'], style: 'form-row2' },
  { fields: ['othersQuery'], style: 'form-row2' },
  { fields: ['message'], style: 'form-row2' },
];

export const HelpAndSupport = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ data: [] });

  useEffect(() => {
    async function fetchData() {
      try {
        const collectionURL = `${MEDIQUEST_URL}helpAndSupportForm:get?pageSize=1000`;
        const formData = await fetch(collectionURL, {
          method: 'GET',
          headers: {
            Authorization: COLLECTION_AUTH_TOKEN,
          },
        });

        const jsonData = await formData.json();
        const eventForm = jsonData.data;
        console.log('eventForm: ', eventForm);
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
          <HelpDynamicForm formData={data} formDesign={formDesign} />
        </div>
      </section>
    </>
  );
};
