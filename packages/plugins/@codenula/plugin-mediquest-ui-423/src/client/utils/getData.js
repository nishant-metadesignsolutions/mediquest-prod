import { COLLECTION_AUTH_TOKEN, MEDIQUEST_URL, ACC_ASIA_URL } from '../myvars';
//import fetch from 'node-fetch';

export async function getCity() {
  const cityURL = `${MEDIQUEST_URL}/demo_cities:list?pageSize=1000`;
  const cityData = await fetch(cityURL, {
    method: 'GET',
    headers: {
      Authorization: COLLECTION_AUTH_TOKEN,
    },
  });
  const myData = await cityData.json();
  var cityNames = [];
  await myData.data.map((i) => {
    cityNames.push(i);
  });
  cityNames.sort((a, b) => {
    if (a.city_name > b.city_name) {
      return 1;
    } else {
      return -1;
    }
  });
  return cityNames;
}

export async function getState() {
  const stateURL = `${MEDIQUEST_URL}test_states:list?pageSize=1000`;
  const stateData = await fetch(stateURL, {
    method: 'GET',
    headers: {
      Authorization: COLLECTION_AUTH_TOKEN,
    },
  });
  const myData = await stateData.json();
  var stateNames = [];
  await myData.data.map((i) => {
    stateNames.push(i);
  });
  stateNames.sort((a, b) => {
    if (a.state_name > b.state_name) {
      return 1;
    } else {
      return -1;
    }
  });
  return stateNames;
}

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
  countryNames.sort((a, b) => {
    if (a.country_name > b.country_name) {
      return 1;
    } else {
      return -1;
    }
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

export async function getFooter() {
  const footerURL = `${MEDIQUEST_URL}footer:get?appends%5B%5D=company_logo&filterByTk=1`;
  const footerData = await fetch(footerURL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: COLLECTION_AUTH_TOKEN,
    },
  });
  const data = await footerData.json();
  return data.data;
}
export async function getVenue(id) {
  const footerURL = `${MEDIQUEST_URL}event_master_venue:get?appends%5B%5D=country&appends%5B%5D=state&appends%5B%5D=city&appends%5B%5D=faculty&appends%5B%5D=agenda&appends%5B%5D=venue_images&filterByTk=${parseInt(
    id,
  )}`;
  const venueData = await fetch(footerURL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: COLLECTION_AUTH_TOKEN,
    },
  });
  const data = await venueData.json();
  return data.data;
}
export async function getAgendaDetails(id) {
  try {
    const agendaURL = `${MEDIQUEST_URL}event_master_agenda:get?appends%5B%5D=agenda_pdf&filterByTk=${id}`;
    const agendaData = await fetch(agendaURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });
    if (!agendaData.ok) {
      throw new Error('Failed to fetch agenda details');
    }
    const data = await agendaData.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching agenda details:', error);
    throw error; // Rethrow the error to propagate it to the caller
  }
}

export async function getInternationalFacultyDetails() {
  try {
    const internationalFacultyURL = `${MEDIQUEST_URL}international_faculty:list?appends%5B%5D=intl_faculty_img`;
    const internationalFacultyData = await fetch(internationalFacultyURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });
    if (!internationalFacultyData.ok) {
      throw new Error('Failed to fetch agenda details');
    }
    const data = await internationalFacultyData.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching agenda details:', error);
    throw error; // Rethrow the error to propagate it to the caller
  }
}
export async function getChairperosnDetails() {
  try {
    const charirpersonURL = `${MEDIQUEST_URL}chairperson:list?appends%5B%5D=chairperson_image`;
    const chairpersonData = await fetch(charirpersonURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });
    if (!chairpersonData.ok) {
      throw new Error('Failed to fetch agenda details');
    }
    const data = await chairpersonData.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching agenda details:', error);
    throw error; // Rethrow the error to propagate it to the caller
  }
}
export async function getNationalFacultyDetails() {
  try {
    const nationalFacultyURL = `${MEDIQUEST_URL}faculty_details:list?appends%5B%5D=faculty_image`;
    const nationalFacultyData = await fetch(nationalFacultyURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });
    if (!nationalFacultyData.ok) {
      throw new Error('Failed to fetch agenda details');
    }
    const data = await nationalFacultyData.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching agenda details:', error);
    throw error; // Rethrow the error to propagate it to the caller
  }
}

export async function getOrderDetails(orderID) {
  try {
    const data = await fetch(`${ACC_ASIA_URL}razorPay:getOrder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
      body: JSON.stringify({ order_id: orderID }),
    });

    const res = await data.json();
    if (res && res.data) {
      let allPayment;
      if (res.data.items) {
        allPayment = res.data.items;
        if (allPayment.length > 0) {
          const lastPayment = allPayment[allPayment.length - 1];
          return lastPayment;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (err) {
    throw err;
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

export async function getGroupAttendeeData(attendeeId) {
  try {
    const attendeeURL = `${MEDIQUEST_URL}/group_attendee:get?filterByTk=${attendeeId}&pageSize=1000`;
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

export async function getCurPaymentData(id) {
  try {
    const curPaymentURL = `${MEDIQUEST_URL}paymentsAttempted:get?filterByTk=${id}&pageSize=1000`;
    const curPaymentData = await fetch(curPaymentURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });
    if (!curPaymentData.ok) {
      throw new Error('Failed to fetch agenda details');
    }
    const data = await curPaymentData.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching agenda details:', error);
    throw error; // Rethrow the error to propagate it to the caller
  }
}

export function addMetaTags() {
  const viewportMeta = document.createElement('meta');
  viewportMeta.name = 'viewport';
  viewportMeta.content =
    'width=device-width, initial-scale=1.0, minimum-scale=1, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no';

  const handheldMeta = document.createElement('meta');
  handheldMeta.name = 'HandheldFriendly';
  handheldMeta.content = 'true';

  document.head.appendChild(viewportMeta);
  document.head.appendChild(handheldMeta);
}

export async function getRazopayKeys() {
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
    if (data && data.data && data.data.payment_mode == 'test') {
      obj = {
        key: data?.data?.razorpay_test_key,
        secret: data?.data?.razorpay_test_secret,
      };
    } else {
      obj = {
        key: data?.data?.razorpay_production_key,
        secret: data?.data?.razorpay_production_secret,
      };
    }
    return obj;
  } catch (error) {
    console.error('Error fetching agenda details:', error);
    throw error; // Rethrow the error to propagate it to the caller
  }
}
