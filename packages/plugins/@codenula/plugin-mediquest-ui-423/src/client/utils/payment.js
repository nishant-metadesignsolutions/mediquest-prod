//import fetch from 'node-fetch';
import { ACC_ASIA_URL } from "../myvars";

export async function createOrder(ToPay, currency) {
  // ${ACC_ASIA_URL}
  const data = await fetch(`${ACC_ASIA_URL}razorPay:createOrder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amtToPay: ToPay, currency: currency }),
  })
    .then(async (response) => await response.json())
    .then((data) => {
      // console.log(data.data);
      return data.data;
    })
    .catch((error) => {
      console.error('Error:', error)
      throw error;
    });
  return data;
}
