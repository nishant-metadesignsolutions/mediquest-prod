import fetch from 'node-fetch';
import { ACC_ASIA_URL, COLLECTION_AUTH_TOKEN } from '../myvars';

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

export async function sendEmail(email, attendeeId) {
  try {
    const body = {
      email: email,
      attendeeId: attendeeId,
    };
    await fetch(`${ACC_ASIA_URL}send:email`, {
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

export async function sendEmailToSupport(email, groupAttendeeId, password) {
  const url = `${ACC_ASIA_URL}send:groupPaymentEmailBackend`;
  const raw = JSON.stringify({
    email: email,
    groupAttendeeId: groupAttendeeId,
    password: password,
  });
  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: COLLECTION_AUTH_TOKEN
    },
    body: raw,
  };
  try {
    await fetch(url, fetchOptions);
  } catch (err){
    throw err;
  }
}
