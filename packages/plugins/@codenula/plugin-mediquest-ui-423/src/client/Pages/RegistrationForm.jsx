import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { COLLECTION_AUTH_TOKEN, MEDIQUEST_URL } from '../myvars.js';
import { DynamicForm } from '../Components/DynamicForm.jsx';
import Loader from '../Components/Loader.jsx';
import '../assets2/css/override.css';

import './RegistrationForm.css';

export const RegistrationForm = () => {
  const { eventId } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ data: [] });

  useEffect(() => {
    async function fetchData() {
      try {
        const collectionURL = `${MEDIQUEST_URL}acc_reg_form:list?pageSize=1000`;
        const formData = await fetch(collectionURL, {
          method: 'GET',
          headers: {
            Authorization: COLLECTION_AUTH_TOKEN,
          },
        });

        const jsonData = await formData.json();
        const eventForm = jsonData.data.filter((item) => item.eventId === parseInt(eventId));
        setData(eventForm[0]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    }

    fetchData();
  }, [eventId]);
  return (
    <>
      {loading && <Loader />}
      <section className='wrapper'>
        <div>
          <DynamicForm formData={data} />
        </div>
      </section>
    </>
  );
};
