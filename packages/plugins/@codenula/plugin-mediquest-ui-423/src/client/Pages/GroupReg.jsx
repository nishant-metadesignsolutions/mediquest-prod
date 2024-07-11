
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { COLLECTION_AUTH_TOKEN, MEDIQUEST_URL } from '../myvars.js';
import { GroupDynamicForm } from '../Components/GroupDynamicForm.jsx';
import Loader from '../Components/Loader.jsx';
import '../assets2/css/override.css';
import './RegistrationForm.css';

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
  { fields: ['company_name', 'registration_id_prefix'], style: 'form-row2' },
];

export const GroupReg = () => {
  const { eventId } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ data: [] });

  useEffect(() => {
    async function fetchData() {
      try {
        const collectionURL = `${MEDIQUEST_URL}group_reg_form:get?filter={"eventId":${eventId}}&pageSize=1000`;
        const formData = await fetch(collectionURL, {
          method: 'GET',
          headers: {
            Authorization: COLLECTION_AUTH_TOKEN,
          },
        });
        
        const jsonData = await formData.json();
        const eventForm = jsonData.data;
        console.log("eventForm: ",eventForm);
        setData(eventForm);
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
          <GroupDynamicForm formData={data} formDesign={formDesign} eventId={eventId}/>
        </div>
      </section>
    </>
  );
};
