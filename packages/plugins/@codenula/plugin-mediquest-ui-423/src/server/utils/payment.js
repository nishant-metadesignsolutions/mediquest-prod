import fetch from 'node-fetch';
import { COLLECTION_AUTH_TOKEN, MEDIQUEST_URL, ACC_ASIA_URL } from '../myvars';

export const getOrderDetails = async (orderID) => {
  const data = await fetch(`${ACC_ASIA_URL}razorPay:getOrder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ order_id: orderID }),
  });

  const res = await data.json();
  if (res && res.data) {
    const allPayment = res.data.items;
    const lastPayment = allPayment[allPayment.length - 1];
    return lastPayment;
  }
};
export async function updatePaymentStatusFailed(paymentAttempted, attendeeId) {
  const attendeeUpdateURL = `${MEDIQUEST_URL}attendees:update?filterByTk=${parseInt(attendeeId)}`;
  const updatePayment = await fetch(attendeeUpdateURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: COLLECTION_AUTH_TOKEN,
    },
    body: JSON.stringify({ paymentStatus: 'Failed', paymentsAttemptedId: paymentAttempted }),
  });
  const res = await updatePayment.json();
  console.log(res);
  return res.data[0].id;
}
export async function updatePaymentStatusFailedFromRazorpay(orderId, paymentAttempted) {
  const attendeeURL = `${MEDIQUEST_URL}attendees:update?filter={"razorpay_order_id":${orderId}}`;
  const updatePayment = await fetch(attendeeURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: COLLECTION_AUTH_TOKEN,
    },
    body: JSON.stringify({ paymentStatus: 'Failed', paymentsAttemptedId: paymentAttempted }),
  });
  const res = await updatePayment.json();
  console.log(res);
  return res.data[0].id;
}
export async function updatePaymentStatusSuccess(paymentAttempted, attendeeId) {
  const attendeeUpdateURL = `${MEDIQUEST_URL}attendees:update?filterByTk=${parseInt(attendeeId)}`;
  const updatePayment = await fetch(attendeeUpdateURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: COLLECTION_AUTH_TOKEN,
    },
    body: JSON.stringify({ paymentStatus: 'Completed', paymentsAttemptedId: paymentAttempted }),
  });
  const res = await updatePayment.json();
  console.log(res);
  return res.data[0].id;
}
export async function updatePaymentStatusSuccessFromRazorpay(orderId, paymentAttempted) {
  const attendeeURL = `${MEDIQUEST_URL}attendees:update?filter={"razorpay_order_id":${orderId}}`;
  const updatePayment = await fetch(attendeeURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: COLLECTION_AUTH_TOKEN,
    },
    body: JSON.stringify({ paymentStatus: 'Completed', paymentsAttemptedId: paymentAttempted }),
  });
  const res = await updatePayment.json();
  console.log(res);
  return res.data[0].id;
}
export async function createPaymentAttempted(body) {
  const paymentAttemptedURL = `${MEDIQUEST_URL}paymentsAttempted:create`;
  const requestBody = {
    payment_id: body.id,
    payment_status: body.status,
    payment_amount: body.amount / 100,
    payment_date: new Date(),
    order_id: body.order_id,
  };
  const createPayment = await fetch(paymentAttemptedURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: COLLECTION_AUTH_TOKEN,
    },
    body: JSON.stringify(requestBody),
  });
  const res = await createPayment.json();
  // console.log(res);
  return res.data;
}
export async function updatePaymentStatusPending(orderId, paymentAttempted) {
  const attendeeURL = `${MEDIQUEST_URL}attendees:update?filter={"razorpay_order_id":${orderId}}`;
  const updatePayment = await fetch(attendeeURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: COLLECTION_AUTH_TOKEN,
    },
    body: JSON.stringify({ paymentsAttemptedId: paymentAttempted }),
  });
  const res = await updatePayment.json();
  console.log(res);
  return res.data[0].id;
}
