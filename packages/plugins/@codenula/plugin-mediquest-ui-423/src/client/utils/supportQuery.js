import { COLLECTION_AUTH_TOKEN, MEDIQUEST_URL } from '../myvars';
import { generateTicketId } from './custom';
// query form
export async function createQuery(formValues) {
  try {
    const ticketId = generateTicketId();

    const requestBody = {
      country_code: `+${formValues.country_code}` || null,
      registered_name:
        formValues.first_name && formValues.last_name ? `${formValues.first_name} ${formValues.last_name}` : null,
      event_name: formValues.event_name || null,
      queries: formValues.queries || null,
      othersQuery: formValues.othersQuery || null,
      first_name: formValues.first_name || null,
      last_name: formValues.last_name || null,
      registered_email: formValues.registered_email || null,
      registered_phone: parseInt(formValues.registered_phone) || null,
      registration_id: formValues.registration_id || null,
      status: 'open',
      request_no: ticketId,
    };

    const attendeeURL = `${MEDIQUEST_URL}helpAndSupport:create`;
    const createAttendeeResponse = await fetch(attendeeURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
      body: JSON.stringify(requestBody),
    });

    if (!createAttendeeResponse.ok) {
      // Handle non-OK responses here
      throw new Error(`Failed to create attendee. Status: ${createAttendeeResponse.status}`);
    }

    const attendeeData = await createAttendeeResponse.json();
    return attendeeData.data.id;
  } catch (error) {
    // Handle any errors that occurred during the process
    console.error('Error creating attendee:', error);
    // You might want to do some error handling or show a user-friendly error message here
    throw error;
  }
}

export async function getQuery(id) {
  try {
    const attendeeURL = `${MEDIQUEST_URL}helpAndSupport:get?filterByTk=${parseInt(id)}`;
    const createAttendeeResponse = await fetch(attendeeURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });

    if (!createAttendeeResponse.ok) {
      // Handle non-OK responses here
      throw new Error(`Failed to create attendee. Status: ${createAttendeeResponse.status}`);
    }

    const attendeeData = await createAttendeeResponse.json();
    return attendeeData.data;
  } catch (error) {
    // Handle any errors that occurred during the process
    console.error('Error creating attendee:', error);
    // You might want to do some error handling or show a user-friendly error message here
    throw error;
  }
}

// cancellation form
export async function createCancellationRequest(formValues, attachments) {
  try {
    const ticketId = generateTicketId();
    console.log('inside create: ', formValues, attachments)
    const requestBody = {
      country_code: `+${formValues.country_code}` || null,
      registered_name:
        formValues.first_name && formValues.last_name ? `${formValues.first_name} ${formValues.last_name}` : null,
      event_name: formValues.event_name || null,
      queries: formValues.queries || null,
      othersQuery: formValues.othersQuery || null,
      first_name: formValues.first_name || null,
      last_name: formValues.last_name || null,
      registered_email: formValues.registered_email || null,
      registered_phone: parseInt(formValues.registered_phone) || null,
      registration_id: formValues.registration_id || null,
      status: 'open',
      request_no: ticketId? ticketId: null,
      acknowledgement: formValues.acknowledgement || null,
      currentPaymentCategory: formValues.currentPaymentCategory || null,
      newPaymentCategory: formValues.newPaymentCategory || null,
      event_start_date: formValues.event_start_date? new Date(formValues.event_start_date) : null,
      event_end_date: formValues.event_end_date? new Date(formValues.event_end_date) : null,
      refundPaymentCategory: formValues.refundPaymentCategory || null,
      transaction_id: formValues.transaction_id || null,
      rrn_number: formValues.rrn_number || null,
      travel_attachment: attachments && attachments.length>0 && attachments[0].id? attachments : null, 
    };

    const attendeeURL = `${MEDIQUEST_URL}cancellation_tickets:create`;
    const createAttendeeResponse = await fetch(attendeeURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
      body: JSON.stringify(requestBody),
    });

    if (!createAttendeeResponse.ok) {
      // Handle non-OK responses here
      throw new Error(`Failed to create attendee. Status: ${createAttendeeResponse.status}`);
    }

    const attendeeData = await createAttendeeResponse.json();
    return attendeeData.data.id;
  } catch (error) {
    // Handle any errors that occurred during the process
    console.error('Error creating attendee:', error);
    // You might want to do some error handling or show a user-friendly error message here
    throw error;
  }
}

export async function getCancellationRequest(id) {
  try {
    const attendeeURL = `${MEDIQUEST_URL}cancellation_tickets:get?filterByTk=${parseInt(id)}`;
    const createAttendeeResponse = await fetch(attendeeURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });

    if (!createAttendeeResponse.ok) {
      // Handle non-OK responses here
      throw new Error(`Failed to create attendee. Status: ${createAttendeeResponse.status}`);
    }

    const attendeeData = await createAttendeeResponse.json();
    return attendeeData.data;
  } catch (error) {
    // Handle any errors that occurred during the process
    console.error('Error creating attendee:', error);
    // You might want to do some error handling or show a user-friendly error message here
    throw error;
  }
}

// export async function uploadAttachment(file) {
//   try {
//     const url = `${MEDIQUEST_URL}attachments:create`;
//     const formData = new FormData();
//     formData.append('file', file);
//     const request = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: COLLECTION_AUTH_TOKEN,
//       },
//       body: formData,
//       redirect: "follow"
//     });
//     const resData = await request.json();
//     return resData.data;
//   } catch (err) {
//     throw err;
//   }
// }
