import { COLLECTION_AUTH_TOKEN, MEDIQUEST_URL } from '../myvars';
import { generatePassword } from './custom';
import { getAllCoupons, getPaymentCategories } from './getData';

export async function findAttendee(formValues) {
  const findAttendeeUrl = `${MEDIQUEST_URL}attendees:get?filter={"attendee_email":"${formValues.email_id}"}`;
  const findAttendeeResponse = await fetch(findAttendeeUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: COLLECTION_AUTH_TOKEN,
    },
  });

  if (!findAttendeeResponse.ok) {
    // Handle non-OK responses here
    throw new Error(`Failed to find attendee. Status: ${findAttendeeResponse.status}`);
  }

  const findAttendeeData = await findAttendeeResponse.json();

  if (findAttendeeData && findAttendeeData.data && findAttendeeData.data.id) {
    return findAttendeeData;
  } else {
    const findAttendeeUrl = `${MEDIQUEST_URL}attendees:get?filter={"attendee_contact_number":"${formValues.contact_number}"}`;
    const findAttendeeResponse = await fetch(findAttendeeUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });

    if (!findAttendeeResponse.ok) {
      // Handle non-OK responses here
      throw new Error(`Failed to find attendee. Status: ${findAttendeeResponse.status}`);
    }

    const findAttendeeData = await findAttendeeResponse.json();
    if (findAttendeeData && findAttendeeData.data && findAttendeeData.data.id) {
      return findAttendeeData;
    } else {
      return false;
    }
  }
}
export async function createAttendee(orderId, stateAndCity, formValues, formData) {
  try {
    const requestBody = {
      cityId: formValues.countryId == 'India' ? stateAndCity.cityId : null,
      stateId: formValues.countryId == 'India' ? stateAndCity.stateId : null,
      paymentsAttemptedId: formValues.paymentsAttemptedId || null,
      Attendee_country: formValues.countryId || null,
      countryId: stateAndCity.countryId || null,
      country_code: stateAndCity.country_code || null,
      attendee_last_name: formValues.last_name || null,
      attendee_email: formValues.email_id || null,
      attendee_address: formValues.address || null,
      attendee_salutation: formValues.salutation || null,
      attendee_alternate_email: formValues.alternate_email || null,
      attendee_qualifications: formValues.qualification || [],
      attendee_pincode: formValues.pincode || null,
      attendee_alternate_mobile_no: formValues.alternate_mobile_number || null,
      eventId: formData.eventId,
      attendee_first_name: formValues.first_name || null,
      attendee_date_of_birth: formValues.date_of_birth || null,
      attendee_gender: formValues.gender || null,
      attendee_gender_others: formValues.gender == 'Others' ? formValues.gender_others : null,
      attendee_profession_others: formValues.profession == 'Others' ? formValues.profession_others : null,
      attendee_years_of_practise: formValues.years_of_practice || null,
      attendee_affiliated_institution: formValues.affiliated_institution || null,
      attendee_hospital: formValues.hospital || null,
      attendee_profession: formValues.profession || null,
      attendee_practise_description: formValues.description_of_practice || null,
      attendee_practise_description_others:
        formValues.description_of_practice == 'Others' ? formValues.description_of_practice_others : null,
      attendee_areas_of_interest: formValues.areas_of_interest || [],
      attendee_contact_number: formValues.contact_number || null,
      paymentStatus: 'Pending',
      razorpay_order_id: orderId || null,
      other_state: formValues.countryId != 'India' ? formValues.stateId : null,
      other_city: formValues.countryId != 'India' ? formValues.cityId : null,
      csi_member_id: formValues.paymentId == 'CSI Member' ? formValues.csi_member_id : null,
      csi_chapter_name: formValues.paymentId == 'CSI Member' ? formValues.csi_chapter_name : null,
      name_of_institution:
        formValues.paymentId == 'Reduced (Residents, Students, Nurses, Allied Health Professional)'
          ? formValues.name_of_institution
          : null,
      enrollment_number_or_student_id:
        formValues.paymentId == 'Reduced (Residents, Students, Nurses, Allied Health Professional)'
          ? formValues.enrollment_number_or_student_id
          : null,
      attendee_payment_categorgy_selected: formValues.paymentId || null,
      discount_coupon_used: formValues.discountCouponId || null,
      attendee_membership: formValues.membership ? 'yes' : 'no' || null,
    };

    const findAttendeeData = await findAttendee(formValues);

    if (findAttendeeData && findAttendeeData.data && findAttendeeData.data.id) {
      const updateAttendeeUrl = `${MEDIQUEST_URL}attendees:update?filterByTk=${parseInt(findAttendeeData?.data?.id)}`;

      if (findAttendeeData.data.paymentStatus == 'Completed') {
        return { status: 'payment-completed', id: findAttendeeData.data.id };
      } else {
        const updateAttendeeResponse = await fetch(updateAttendeeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: COLLECTION_AUTH_TOKEN,
          },
          body: JSON.stringify(requestBody),
        });

        if (!updateAttendeeResponse.ok) {
          // Handle non-OK responses here
          throw new Error(`Failed to update attendee. Status: ${updateAttendeeResponse.status}`);
        }

        const updatedAttendeeData = await updateAttendeeResponse.json();
        if (updatedAttendeeData && updatedAttendeeData.data && updatedAttendeeData.data.length > 0) {
          return updatedAttendeeData.data[0].id;
        }
      }
    } else {
      const attendeeURL = `${MEDIQUEST_URL}attendees:create`;
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
    }
  } catch (error) {
    // Handle any errors that occurred during the process
    console.error('Error creating attendee:', error);
    // You might want to do some error handling or show a user-friendly error message here
    throw error;
  }
}

export async function createGroupAttendee(stateAndCity, formValues, formData) {
  try {
    const newPassword = generatePassword(9);
    const requestBody = {
      cityId: formValues.countryId == 'India' ? stateAndCity.cityId : null,
      stateId: formValues.countryId == 'India' ? stateAndCity.stateId : null,
      countryId: stateAndCity.countryId || null,
      other_state: formValues.countryId != 'India' ? formValues.stateId : null,
      other_city: formValues.countryId != 'India' ? formValues.cityId : null,
      attendee_first_name: formValues.first_name || null,
      attendee_last_name: formValues.last_name || null,
      attendee_email: formValues.email_id || null,
      attendee_contact_number: formValues.contact_number || null,
      country_code_displayed: stateAndCity.country_code || null,
      attendee_company_name: formValues.company_name || null,
      paymentStatus: 'Pending',
      group_attendee_type: 'group_leader',
      eventId: formData.eventId,
      attendee_password: newPassword,
      registration_id_prefix:
        formValues.company_name?.length >= 4
          ? formValues.company_name?.replace(/\s/g, '').slice(0, 4).toLocaleUpperCase()
          : formValues.company_name?.replace(/\s/g, '').toLocaleUpperCase(),
    };

    const findAttendeeUrl = `${MEDIQUEST_URL}group_attendee:get?filter={"attendee_email":"${formValues.email_id}"}`;
    const findAttendeeResponse = await fetch(findAttendeeUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });

    if (!findAttendeeResponse.ok) {
      // Handle non-OK responses here
      throw new Error(`Failed to find attendee. Status: ${findAttendeeResponse.status}`);
    }

    const findAttendeeData = await findAttendeeResponse.json();
    // return findAttendeeData.data.id;

    if (findAttendeeData && findAttendeeData.data && findAttendeeData.data.id) {
      if (findAttendeeData.data.group_attendee_type == 'group_member') {
        return { attendee_type: 'group_member', id: findAttendeeData.data.id };
      } else {
        return { attendee_type: 'group_leader', id: findAttendeeData.data.id };
      }
    } else {
      const attendeeURL = `${MEDIQUEST_URL}group_attendee:create`;
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
    }
  } catch (error) {
    // Handle any errors that occurred during the process
    console.error('Error creating attendee:', error);
    // You might want to do some error handling or show a user-friendly error message here
    throw error;
  }
}

export async function getAttendeeAllDetails(attendeeId) {
  const getAttendeeURL = `${MEDIQUEST_URL}/attendees:get?filterByTk=${parseInt(attendeeId)}&pageSize=1000`;
  const attendeeDataFetched = await fetch(getAttendeeURL, {
    method: 'GET',
    headers: {
      Authorization: COLLECTION_AUTH_TOKEN,
    },
  });
  const attendeeDataDataJSON = await attendeeDataFetched.json();
  const attendeeData = attendeeDataDataJSON.data;


  const AllEventsUrl = `${MEDIQUEST_URL}event:list?pageSize=20&appends%5B%5D=event_banner&appends%5B%5D=venue&appends%5B%5D=faculty&appends%5B%5D=agenda&appends%5B%5D=attendee&appends%5B%5D=createdBy&appends%5B%5D=updatedBy&appends%5B%5D=event_card_image&appends%5B%5D=chairpersons&appends%5B%5D=intl_faculty&filter=%7B%7D`;
  const AllEvent = await fetch(AllEventsUrl, {
    method: 'GET',
    headers: {
      Authorization: COLLECTION_AUTH_TOKEN,
    },
  });
  const AllEventDataJSON = await AllEvent.json();
  const AllEventData = AllEventDataJSON.data;
  const accEvent = AllEventData.find((e) => e.id === parseInt(attendeeData.eventId));
  

  const discount_coupon = attendeeData?.discount_coupon_used ? attendeeData.discount_coupon_used : '';
  const allDiscount = await getAllCoupons();
  var netAmt;
  var amtToPay;
  var myC;

  const payment = await getPaymentCategories();
  let toPay;
  let serviceCharge;
  let transactionCharge;
  var curPaymentMethod;
  var curPaymentCategory;
  var dateWisePaymentCategory;
  const curDate = new Date();

  payment.forEach((i) => {
    if (i.category_name == attendeeData?.attendee_payment_categorgy_selected) {
      if (curDate <= new Date(i.early_bird_date)) {
        if (attendeeData.countryId == 102) {
          // toPay = i.early_bird_inr;
          if (attendeeData.attendee_membership == 'yes') {
            toPay = i.early_rate_membership_rupees;
            curPaymentCategory = `${attendeeData.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
            dateWisePaymentCategory = accEvent.early_bird_title;
          } else {
            toPay = i.early_bird_inr;
            curPaymentCategory = `${attendeeData.attendee_payment_categorgy_selected}`;
            dateWisePaymentCategory = accEvent.early_bird_title;
          }
          curPaymentMethod = i;
          // curPaymentCategory = `${accEvent.early_bird_title}`;
          if (i.service_rupees != null && i.service_rupees != undefined && i.service_rupees != '') {
            serviceCharge = i.service_rupees;
          } else {
            serviceCharge = 0;
          }
          if (i.transaction_rupees != null && i.transaction_rupees != undefined && i.transaction_rupees != '') {
            transactionCharge = i.transaction_rupees;
          } else {
            transactionCharge = 0;
          }
        } else {
          // toPay = i.payment_amount;
          // toPay = i.early_bird_inr;
          // curPaymentCategory = `${accEvent.early_bird_title}`;
          if (attendeeData.attendee_membership == 'yes') {
            toPay = i.early_rate_membership_rupees;
            // curPaymentCategory = `${accEvent.early_bird_title} ${accEvent.payment_category_subs_text}`;
            curPaymentCategory = `${attendeeData.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
            dateWisePaymentCategory = accEvent.early_bird_title;
          } else {
            toPay = i.early_bird_inr;
            curPaymentCategory = `${attendeeData.attendee_payment_categorgy_selected}`;
            dateWisePaymentCategory = accEvent.early_bird_title;
          }
          curPaymentMethod = i;
          if (i.service_dollars != null && i.service_dollars != undefined && i.service_dollars != '') {
            serviceCharge = i.service_dollars;
          } else {
            serviceCharge = 0;
          }
          if (i.transaction_dollars != null && i.transaction_dollars != undefined && i.transaction_dollars != '') {
            transactionCharge = i.transaction_dollars;
          } else {
            transactionCharge = 0;
          }
        }
      } else if (curDate > new Date(i.early_bird_date) && curDate <= new Date(i.advanced_date)) {
        if (attendeeData.countryId == 102) {
          // toPay = i.advanced_rate_inr;
          if (attendeeData.attendee_membership == 'yes') {
            toPay = i.advanced_rate_membership_rupees;
            curPaymentCategory = `${attendeeData.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
            dateWisePaymentCategory = accEvent.advanced_title;
          } else {
            toPay = i.advanced_rate_inr;
            // curPaymentCategory = `${accEvent.advanced_title}`;
            curPaymentCategory = `${attendeeData.attendee_payment_categorgy_selected}`;
            dateWisePaymentCategory = accEvent.advanced_title;
          }
          curPaymentMethod = i;
          // curPaymentCategory = `${accEvent.advanced_title}`;
          if (i.service_rupees != null && i.service_rupees != undefined && i.service_rupees != '') {
            serviceCharge = i.service_rupees;
          } else {
            serviceCharge = 0;
          }
          if (i.transaction_rupees != null && i.transaction_rupees != undefined && i.transaction_rupees != '') {
            transactionCharge = i.transaction_rupees;
          } else {
            transactionCharge = 0;
          }
        } else {
          // toPay = i.advanced_rate;
          // toPay = i.advanced_rate_inr;
          // curPaymentCategory = `${accEvent.advanced_title}`;
          if (attendeeData.attendee_membership == 'yes') {
            toPay = i.advanced_rate_membership_rupees;
            // curPaymentCategory = `${accEvent.advanced_title} ${accEvent.payment_category_subs_text}`;
            curPaymentCategory = `${attendeeData.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
            dateWisePaymentCategory = accEvent.advanced_title;
          } else {
            toPay = i.advanced_rate_inr;
            // curPaymentCategory = `${accEvent.advanced_title}`;
            curPaymentCategory = `${attendeeData.attendee_payment_categorgy_selected}`;
            dateWisePaymentCategory = accEvent.advanced_title;
          }
          curPaymentMethod = i;
          if (i.service_dollars != null && i.service_dollars != undefined && i.service_dollars != '') {
            serviceCharge = i.service_dollars;
          } else {
            serviceCharge = 0;
          }
          if (i.transaction_dollars != null && i.transaction_dollars != undefined && i.transaction_dollars != '') {
            transactionCharge = i.transaction_dollars;
          } else {
            transactionCharge = 0;
          }
        }
      } else {
        if (attendeeData.countryId == 102) {
          // toPay = i.regular_rate_inr;
          if (attendeeData.attendee_membership == 'yes') {
            toPay = i.regular_rate_membership_rupees;
            // curPaymentCategory = `${accEvent.regular_title} ${accEvent.payment_category_subs_text}`;
            curPaymentCategory = `${attendeeData.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
            dateWisePaymentCategory = accEvent.regular_title;
          } else {
            toPay = i.regular_rate_inr;
            // curPaymentCategory = `${accEvent.regular_title}`;
            curPaymentCategory = `${attendeeData.attendee_payment_categorgy_selected}`;
            dateWisePaymentCategory = accEvent.regular_title;
          }
          curPaymentMethod = i;
          if (i.service_rupees != null && i.service_rupees != undefined && i.service_rupees != '') {
            serviceCharge = i.service_rupees;
          } else {
            serviceCharge = 0;
          }
          if (i.transaction_rupees != null && i.transaction_rupees != undefined && i.transaction_rupees != '') {
            transactionCharge = i.transaction_rupees;
          } else {
            transactionCharge = 0;
          }
        } else {
          // toPay = i.regular_rate;
          // toPay = i.regular_rate_inr;
          if (attendeeData.attendee_membership == 'yes') {
            toPay = i.regular_rate_membership_rupees;
            // curPaymentCategory = `${accEvent.regular_title} ${accEvent.payment_category_subs_text}`;
            curPaymentCategory = `${attendeeData.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
            dateWisePaymentCategory = accEvent.regular_title;
          } else {
            toPay = i.regular_rate_inr;
            // curPaymentCategory = `${accEvent.regular_title}`;
            curPaymentCategory = `${attendeeData.attendee_payment_categorgy_selected}`;
            dateWisePaymentCategory = accEvent.regular_title;
          }
          curPaymentMethod = i;
          if (i.service_dollars != null && i.service_dollars != undefined && i.service_dollars != '') {
            serviceCharge = i.service_dollars;
          } else {
            serviceCharge = 0;
          }
          if (i.transaction_dollars != null && i.transaction_dollars != undefined && i.transaction_dollars != '') {
            transactionCharge = i.transaction_dollars;
          } else {
            transactionCharge = 0;
          }
        }
      }
    }
  });
  netAmt = toPay;
  amtToPay = toPay;

  if (discount_coupon) {
    allDiscount.forEach((i) => {
      if (i.coupon_code == discount_coupon && new Date(i.coupon_validity) >= new Date() && i.coupon_user_count > 0) {
        myC = i;
      }
    });
  }
  if (myC && new Date(myC.coupon_validity) >= new Date() && myC.coupon_user_count > 0) {
    if (myC.coupon_max_amount != null && myC.coupon_max_amount != undefined && myC.coupon_max_amount != '') {
      amtToPay =
        parseFloat(toPay) -
        Math.min(
          myC.coupon_max_amount,
          parseFloat((parseFloat(toPay) * parseFloat(myC.coupon_discount_percentage)) / 100),
        );
    } else {
      amtToPay = parseFloat(toPay) - parseFloat((parseFloat(toPay) * parseFloat(myC.coupon_discount_percentage)) / 100);
    }
  }
  const after_discount = amtToPay;
  const after_discount_value = parseFloat(after_discount);
  amtToPay =
    parseFloat(after_discount) +
    parseFloat((parseFloat(after_discount) * parseFloat(serviceCharge)) / 100) +
    parseFloat((parseFloat(after_discount) * parseFloat(transactionCharge)) / 100);

  const registrationFee = parseFloat(netAmt);
  const registrationFeeToBePaid = parseFloat(amtToPay);
  const serviceAmt = parseFloat((parseFloat(after_discount) * parseFloat(serviceCharge)) / 100);
  const transactionAmt = parseFloat((parseFloat(after_discount) * parseFloat(transactionCharge)) / 100);

  const obj = {
    attendeeData,
    registrationFee,
    registrationFeeToBePaid,
    after_discount_value,
    serviceCharge,
    transactionCharge,
    curPaymentMethod,
    curPaymentCategory,
    dateWisePaymentCategory,
    serviceAmt,
    transactionAmt,
  };

  return obj;
}

export async function paymentPageVisit(attendeeId) {
  const findAttendeeUrl = `${MEDIQUEST_URL}attendees:get?filterByTk=${attendeeId}&pageSize=1000`;
  const updateAttendeeUrl = `${MEDIQUEST_URL}attendees:update?filterByTk=${attendeeId}&pageSize=1000`;
  try {
    const findAttendeeResponse = await fetch(findAttendeeUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });

    if (!findAttendeeResponse.ok) {
      // Handle non-OK responses here
      throw new Error(`Failed to find attendee. Status: ${findAttendeeResponse.status}`);
    }

    const findAttendeeData = await findAttendeeResponse.json();
    const attendeeData = findAttendeeData.data;
    const requestBody = { payment_page_visited: 'yes' };
    try {
      const updateAttendeeResponse = await fetch(updateAttendeeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: COLLECTION_AUTH_TOKEN,
        },
        body: JSON.stringify(requestBody),
      });

      if (!updateAttendeeResponse.ok) {
        // Handle non-OK responses here
        throw new Error(`Failed to update attendee. Status: ${updateAttendeeResponse.status}`);
      }
    } catch (err) {
      throw err;
    }
  } catch (err) {
    throw err;
  }
}
export async function paymentPageVisitReset(attendeeId) {
  const findAttendeeUrl = `${MEDIQUEST_URL}attendees:get?filterByTk=${attendeeId}&pageSize=1000`;
  const updateAttendeeUrl = `${MEDIQUEST_URL}attendees:update?filterByTk=${attendeeId}&pageSize=1000`;
  try {
    const findAttendeeResponse = await fetch(findAttendeeUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });

    if (!findAttendeeResponse.ok) {
      // Handle non-OK responses here
      throw new Error(`Failed to find attendee. Status: ${findAttendeeResponse.status}`);
    }

    const findAttendeeData = await findAttendeeResponse.json();
    const attendeeData = findAttendeeData.data;
    const requestBody = { payment_page_visited: '' };
    try {
      const updateAttendeeResponse = await fetch(updateAttendeeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: COLLECTION_AUTH_TOKEN,
        },
        body: JSON.stringify(requestBody),
      });

      if (!updateAttendeeResponse.ok) {
        // Handle non-OK responses here
        throw new Error(`Failed to update attendee. Status: ${updateAttendeeResponse.status}`);
      }
    } catch (err) {
      throw err;
    }
  } catch (err) {
    throw err;
  }
}

export async function getGrpLeaderDetails(company_name, eventId) {
  const findAttendeeUrl = `${MEDIQUEST_URL}group_attendee:get?filter={"attendee_company_name":"${company_name}", "group_attendee_type": "group_leader", "eventId": "${parseInt(
    eventId,
  )}"}`;
  const findAttendeeResponse = await fetch(findAttendeeUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: COLLECTION_AUTH_TOKEN,
    },
  });

  if (!findAttendeeResponse.ok) {
    // Handle non-OK responses here
    throw new Error(`Failed to find attendee. Status: ${findAttendeeResponse.status}`);
  }

  const findAttendeeData = await findAttendeeResponse.json();
  return findAttendeeData.data;
}

export async function uploadAttachments(file) {
  // const url = `${MEDIQUEST_URL}upload:attachments`;
  const url = `http://localhost:13000/api/upload:attachments`;
  const formData = new FormData();
  formData.append('file', file);
  const upload = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: COLLECTION_AUTH_TOKEN,
      Accept: '*/*',
    },
    body: formData,
  });
  const uploadData = await upload.json();
  return uploadData.data;
}
