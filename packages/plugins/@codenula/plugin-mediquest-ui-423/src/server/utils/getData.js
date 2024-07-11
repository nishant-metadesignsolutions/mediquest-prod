import fetch from 'node-fetch';
import { COLLECTION_AUTH_TOKEN, MEDIQUEST_URL } from '../myvars';

export async function getCountry() {
  const countryURL = `${MEDIQUEST_URL}test_countries:list?pageSize=100000`;
  const countryData = await fetch(countryURL, {
    method: 'GET',
    headers: {
      Authorization: COLLECTION_AUTH_TOKEN,
    },
  });
  const myData = await countryData.json();
  var countryNames = [];
  await myData.data.map((i) => {
    countryNames.push(i);
  });
  return countryNames;
}

export function getCountryCode(countryId, country) {
  var countryObj;
  country.forEach((c) => {
    if (c.country_name == countryId) {
      countryObj = c;
    }
  });
  // countryObj = country.find((c) => c.country_name == countryId);
  // console.log(countryObj);
  const countryCode = countryObj.country_code;
  return countryCode;
}

export async function getPaymentCategories() {
  const paymentURL = `${MEDIQUEST_URL}payment_category:list?pageSize=1000`;
  const paymentData = await fetch(paymentURL, {
    method: 'GET',
    headers: {
      Authorization: COLLECTION_AUTH_TOKEN,
    },
  });
  const myData = await paymentData.json();
  var paymentCategories = [];
  await myData.data.map((i) => {
    const paymentOption = {
      category_name: i.category_name,
      payment_amount: i.payment_amount,
      early_bird_date: i.early_bird_date,
      early_bird_inr: i.early_bird_inr,
      advanced_date: i.advanced_date,
      advanced_rate: i.advanced_rate,
      advanced_rate_inr: i.advanced_rate_inr,
      regular_date: i.regular_date,
      regular_rate: i.regular_rate,
      regular_rate_inr: i.regular_rate_inr,
      service_dollars: i.service_dollars,
      service_rupees: i.service_rupees,
      transaction_dollars: i.transaction_dollars,
      transaction_rupees: i.transaction_rupees,
      additional_charge_one_title: i.additional_charge_one_title,
      additional_charge_two_title: i.additional_charge_two_title,
      advanced_rate_membership_dollars: i.advanced_rate_membership_dollars,
      advanced_rate_membership_rupees: i.advanced_rate_membership_rupees,
      early_rate_membership_dollars: i.early_rate_membership_dollars,
      early_rate_membership_rupees: i.early_rate_membership_rupees,
      regular_rate_membership_dollars: i.regular_rate_membership_dollars,
      regular_rate_membership_rupees: i.regular_rate_membership_rupees,
    };
    paymentCategories.push(paymentOption);
  });
  return paymentCategories;
}

export async function getAllCoupons() {
  try {
    const couponURL = `${MEDIQUEST_URL}discount_coupon:list?pageSize=1000`;
    const discountData = await fetch(couponURL, {
      method: 'GET',
      headers: {
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });
    const myData = await discountData.json();
    var allCoupon = [];
    myData.data.map((i) => {
      allCoupon.push(i);
    });
    return allCoupon;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
export async function getRazopayKeys(){
  try {
    const razorPayUrl = `${MEDIQUEST_URL}payment_methods:get?&pageSize=1000`;
    const razorpayData = await fetch(razorPayUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });
    if (!razorpayData.ok) {
      throw new Error('Failed to fetch agenda details');
    }
    const data = await razorpayData.json();
    const allData = await data.data;
    let obj;
    if(data && data.data && data.data.payment_mode == 'test'){
      obj = {
        key: data?.data?.razorpay_test_key,
        secret: data?.data?.razorpay_test_secret,
      }
    } else {
      obj = {
        key: data?.data?.razorpay_production_key,
        secret: data?.data?.razorpay_production_secret,
      }
    }
    return obj;
  } catch (error) {
    console.error('Error fetching agenda details:', error);
    throw error; // Rethrow the error to propagate it to the caller
  }
}
export async function getAttendeeData(attendeeId) {
  try {
    const attendeeURL = `${MEDIQUEST_URL}/attendees:get?filterByTk=${attendeeId}&pageSize=1000`;
    const attendeeData = await fetch(attendeeURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });
    if (!attendeeData.ok) {
      throw new Error('Failed to fetch agenda details');
    }
    const data = await attendeeData.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching agenda details:', error);
    throw error; // Rethrow the error to propagate it to the caller
  }
}

