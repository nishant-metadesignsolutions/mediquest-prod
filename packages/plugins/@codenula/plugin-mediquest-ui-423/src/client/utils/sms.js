//import fetch from 'node-fetch';
import { ACC_ASIA_URL } from "../myvars";

export async function sendSMS(mobile_no, attendeeId, eventId) {
  try {
    const body = {
      mobile_no: mobile_no,
      attendeeId: attendeeId,
      eventId: eventId,
    };
    await fetch(`${ACC_ASIA_URL}send:sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw err;
  }
}

export async function sendPaymentSMS(mobile_no, attendeeId) {
  try {
    const body = {
      mobile_no: mobile_no,
      attendeeId: attendeeId,
    };
    await fetch(`${ACC_ASIA_URL}send:paymentSMS`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw err;
  }
}
export async function sendEmail(email, attendeeId ) {
  try {
    const body = {
      email: email,
      attendeeId: attendeeId,
    };
    // ${ACC_ASIA_URL}
    await fetch(`${ACC_ASIA_URL}send:registrationEmail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw err;
  }
}

export async function sendQueryConfirmationEmail(queryId){
  try {
    const url = `${ACC_ASIA_URL}send:queryRegistration`;
    // const url = `http://localhost:13000/api/send:queryRegistration`;
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({queryId: queryId}),
    })
  } catch (err){
    throw err;
  }
}

export async function sendQueryConfirmationBackendEmail(queryId){
  try {
    const url = `${ACC_ASIA_URL}send:queryRegistrationBackend`;
    // const url = `http://localhost:13000/api/send:queryRegistrationBackend`;
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({queryId: queryId}),
    })
  } catch (err){
    throw err;
  }
}
