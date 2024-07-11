import { Plugin } from '@nocobase/server';
import cors from '@koa/cors';
// import Koa from 'koa';
import { koaMulter as multer } from '@nocobase/utils';
import fs from 'fs';
import os from 'os';
import FormData from 'form-data';

import fetch from 'node-fetch';
import crypto from 'crypto';
import https from 'https';
import axios from 'axios';
import nodemailer from 'nodemailer';
import { COLLECTION_AUTH_TOKEN, MEDIQUEST_URL, MEDIQUEST_URL_IMG, ACC_ASIA_URL, ACC_ASIA_URL_FULL } from './myvars';
import { getRazopayKeys } from './utils/getData';
import { sendEmail, sendEmailToSupport, sendPaymentSMS } from './utils/sms';
import { getPaymentCategories, getAllCoupons, getAttendeeData } from './utils/getData';
import { updateCoupon } from './utils/coupon';
import {
  groupInvoiceRequestBackendEmailTemp,
  groupPaymentBackendEmailTemp,
  groupPaymentEmailTemp,
  groupPaymentLeaderEmailTemp,
  groupPaymentProofApprovedEmailTemp,
  groupPaymentProofBackendEmailTemp,
  groupPaymentProofEmailTemp,
  groupRegistrationBackendEmailTemp,
  groupRegistrationEmailTemp,
  groupSendInvoiceEmailTemp,
  paymentEmailTemp,
  queryClosedTemp,
  queryRegistrationBackendTemp,
  queryRegistrationTemp,
  queryReplyTemp,
  registrationEmailTemp,
  transporterOptions,
} from './utils/emailTemplates';
import { replacePlaceholders } from './utils/custom';
import {
  getOrderDetails,
  updatePaymentStatusFailed,
  updatePaymentStatusFailedFromRazorpay,
  updatePaymentStatusPending,
  updatePaymentStatusSuccess,
  updatePaymentStatusSuccessFromRazorpay,
  createPaymentAttempted,
} from './utils/payment';

const transporter = nodemailer.createTransport(transporterOptions);

export class PluginMediquestUiServer extends Plugin {
  async afterAdd() {}

  async beforeLoad() {}

  async load() {
    this.app.resource({
      name: 'razorPay',
      actions: {
        async createOrder(ctx, next) {
          const data = ctx.request.body;
          const paymentAllData = await getRazopayKeys();
          const RAZORPAY_API_KEY = paymentAllData.key;
          const RAZORPAY_API_SECRET = paymentAllData.secret;
          const requestOptions = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Basic ${btoa(`${RAZORPAY_API_KEY}:${RAZORPAY_API_SECRET}`)}`,
            },
            body: JSON.stringify({
              amount: parseInt(data.amtToPay) * 100,
              currency: data.currency,
            }),
          };
          await fetch('https://api.razorpay.com/v1/orders', requestOptions)
            .then((response) => response.json())
            .then((data) => (ctx.body = data))
            .catch((error) => console.error('Error:', error));
          next();
        },
        async getOrder(ctx, next) {
          const data = ctx.request.body;
          const paymentAllData = await getRazopayKeys();
          const RAZORPAY_API_KEY = paymentAllData.key;
          const RAZORPAY_API_SECRET = paymentAllData.secret;
          const requestOptions = {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Basic ${btoa(`${RAZORPAY_API_KEY}:${RAZORPAY_API_SECRET}`)}`,
            },
          };
          await fetch(`https://api.razorpay.com/v1/orders/${data.order_id}/payments`, requestOptions)
            .then((response) => response.json())
            .then((data) => (ctx.body = data))
            .catch((error) => console.error('Error:', error));
          next();
        },
        async verifyPayment(ctx, next) {
          const response = await ctx.request.body;
          const queryParams = ctx.action.params;
          const eventId = queryParams.eventId;
          const attendeeId = queryParams.attendeeId;
          const attendeeData = await getAttendeeData(parseInt(attendeeId));

          if (attendeeData.discount_coupon_used) {
            await updateCoupon(attendeeData.discount_coupon_used);
          }

          const res = await getOrderDetails(response.razorpay_order_id);
          if (res.status == 'captured' || res.status == 'success' || res.status == 'authorized') {
            const paymentAttempted = await createPaymentAttempted(res);
            const attendeeId = await updatePaymentStatusSuccess(paymentAttempted.id, queryParams.attendeeId);
            const mobNo = `${attendeeData.country_code}${attendeeData.attendee_contact_number}`;
            if (attendeeData.Attendee_country == 'India') {
              await sendPaymentSMS(mobNo, parseInt(attendeeId));
            }
            const mailBody = {
              email: attendeeData.attendee_email,
              attendeeId: parseInt(attendeeId),
              paymentAttempted: paymentAttempted.payment_id,
            };
            const sendMail = async () => {
              try {
                const response = await fetch(`${ACC_ASIA_URL}send:email`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(mailBody),
                });

                if (!response.ok) {
                  throw new Error('Failed to send email', response);
                }

                console.log('Email Sent!!!');
              } catch (error) {
                console.error('Error sending email: ', error.message);
              }
            };
            // ${ACC_ASIA_URL_FULL}
            await sendMail();
            ctx.redirect(`${ACC_ASIA_URL_FULL}events/${eventId}/payment-successfull/${parseInt(attendeeId)}`);
          }
          setTimeout(() => {
            if (res.status != 'captured') {
              ctx.redirect(`${ACC_ASIA_URL_FULL}payment-pending`);
            }
          }, 60000);
        },
        async paymentFailed(ctx, next) {
          const body = ctx.request.body;
          const orderId = body.orderId;
          const attendeeId = body.attendee_Id;
          const res = await getOrderDetails(orderId);
          // const attendeeData = await getAttendeeData(parseInt(attendeeId));

          const paymentAttempted = await createPaymentAttempted(res);
          const curAttendeeId = await updatePaymentStatusFailed(paymentAttempted.id, attendeeId);
          // if (body.attendeeId) {
          //   ctx.body = `http://localhost:15000/events/${body.eventId}/payment-failed/${parseInt(body.attendeeId)}`;
          //   ctx.redirect(`http://localhost:15000/events/${body.eventId}/payment-failed/${parseInt(body.attendeeId)}`);
          // }
        },
      },
    });
    this.app.resource({
      name: 'send',
      actions: {
        async sms(ctx, next) {
          // const { mobile_no, attendeeId, formValuesString, orderId } = await ctx.request.body;
          const { mobile_no, attendeeId, eventId } = ctx.request.body;
          const customAxios = axios.create({
            httpsAgent: new https.Agent({
              secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
              // Other options if needed
            }),
          });

          const requestOptions = {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Accept: '*/*',
              'Accept-Encoding': 'gzip, deflate, br',
            },
          };

          const paymentURL = `${ACC_ASIA_URL_FULL}events/${parseInt(eventId)}/registration-completed/${parseInt(
            attendeeId,
          )}`;

          // const demoURL = `https://medi.metadesign.org.in/events/7/registered/%7B%22membership%22%3A%22on%22%2C%22paymentId%22%3A%22Reduced%20(Allied%20Health%20Professional%2C%20Nurses%2C%20Students%2C%20Residents)%22%2C%22name_of_institution%22%3A%22ngngfnfngnfgnfg%22%2C%22enrollment_number_or_student_id%22%3A%22mvhm%22%2C%22first_name%22%3A%22NKKK%22%2C%22last_name%22%3A%22KK%22%2C%22pincode%22%3A%22122002%22%2C%22countryId%22%3A%22India%22%2C%22stateId%22%3A%22Andhra%20Pradesh%22%2C%22cityId%22%3A%22Avanigadda%22%2C%22contact_number%22%3A%227393073739%22%2C%22email_id%22%3A%22nishant%40metadesignsolutions.co.uk%22%2C%22discountCouponId%22%3A%22ACCCOMP30%22%2C%22gender_others%22%3A%22%22%2C%22profession_others%22%3A%22%22%2C%22description_of_practice_others%22%3A%22%22%2C%22csi_member_id%22%3A%22%22%2C%22csi_chapter_name%22%3A%22%22%7D/28224.42/33500/278/order_NmXJigdXhHUixn/23450`;

          // Template:Hello%20Doctor,%20Your%20registration%20details%20for%20ACC%20Asia%202024%20has%20been%20submitted%20successfully.%20Kindly%20make%20the%20payment%20to%20confirm%20your%20registration%20-%20Mediquest%20Healthcom.

          // Template:Your%20registration%20details%20for%20ACC%20Asia%202024%20have%20been%20submitted%20successfully.%20Kindly%20complete%20payment%20to%20confirm%20your%20registration.%20${paymentUrl}%20-%20Mediquest%20Healthcom.

          // const fullUrl = `https://enterprise.smsgupshup.com/GatewayAPI/rest?msg=Hello%20Doctor,%20Your%20registration%20details%20for%20ACC%20Asia%202024%20has%20been%20submitted%20successfully.%20Kindly%20make%20the%20payment%20to%20confirm%20your%20registration%20-%20Mediquest%20Healthcom.&v=1.1&userid=2000175249&password=YGm7VMjuG&maskk=MQEVNT&send_to=${mobile_no}&msg_type=text&method=sendMessage`;
          const fullUrl = `https://enterprise.smsgupshup.com/GatewayAPI/rest?msg=Your%20registration%20details%20for%20ACC%20Asia%202024%20have%20been%20submitted%20successfully.%20Kindly%20complete%20payment%20to%20confirm%20your%20registration.%20${paymentURL}%20-%20Mediquest%20Healthcom.&v=1.1&userid=2000175249&password=YGm7VMjuG&maskk=MQEVNT&send_to=${mobile_no}&msg_type=text&method=sendMessage`;
          // const fullUrl = `https://enterprise.smsgupshup.com/GatewayAPI/rest?msg=Hello%20Doctor,%20Thank%20you%20for%20registering%20for%20ASN%20Kidney%20Week%20Highlights%20India.%20Your%20Registration%20id%20is%20ASN000${attendeeId},%20Mediquest%20Healthcom.&v=1.1&userid=2000175249&password=YGm7VMjuG&maskk=MQEVNT&send_to=${mobile_no}&msg_type=text&method=sendMessage`;
          ctx.body = fullUrl;
          try {
            // Use the customAxios instance in the fetch request
            const response = await customAxios.get(fullUrl, requestOptions);

            // Process the response as needed
            console.log(response.data);
          } catch (error) {
            // Handle errors
            console.error('Error:', error.message);
          }

          // const obj = {
          //   mobile_no,
          //   event_name,
          //   attendeeId,
          // };
          // ctx.body = obj;
        },
        async paymentSMS(ctx, next) {
          const { mobile_no, attendeeId } = ctx.request.body;
          const attendeeDetails = await getAttendeeData(parseInt(attendeeId));
          const customAxios = axios.create({
            httpsAgent: new https.Agent({
              secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
              // Other options if needed
            }),
          });

          const requestOptions = {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Accept: '*/*',
              'Accept-Encoding': 'gzip, deflate, br',
            },
          };
          // Template:Hello%20Doctor,%20We%20have%20received%20your%20payment%20for%20ACC%20Asia%202024.%20Your%20Registration%20confirmation%20id%20is%20${attendeeId}%20-%20Mediquest%20Healthcom.

          // Template:Your%20payment%20for%20ACC%20Asia%202024%20has%20been%20received.%20Your%20registration%20confirmation%20id%20is%20${attendeeId}.%20-%20Mediquest%20Healthcom.
          const fullUrl = `https://enterprise.smsgupshup.com/GatewayAPI/rest?msg=Your%20payment%20for%20ACC%20Asia%202024%20has%20been%20received.%20Your%20registration%20confirmation%20id%20is%20${attendeeDetails.registration_id}.%20-%20Mediquest%20Healthcom.&v=1.1&userid=2000175249&password=YGm7VMjuG&maskk=MQEVNT&send_to=${mobile_no}&msg_type=text&method=sendMessage`;
          // const fullUrl = `https://enterprise.smsgupshup.com/GatewayAPI/rest?msg=Hello%20Doctor,%20Thank%20you%20for%20registering%20for%20ASN%20Kidney%20Week%20Highlights%20India.%20Your%20Registration%20id%20is%20ASN000${attendeeId},%20Mediquest%20Healthcom.&v=1.1&userid=2000175249&password=YGm7VMjuG&maskk=MQEVNT&send_to=${mobile_no}&msg_type=text&method=sendMessage`;
          ctx.body = fullUrl;
          try {
            // Use the customAxios instance in the fetch request
            const response = await customAxios.get(fullUrl, requestOptions);

            // Process the response as needed
            console.log(response.data);
          } catch (error) {
            // Handle errors
            console.error('Error:', error.message);
          }

          // const obj = {
          //   mobile_no,
          //   event_name,
          //   attendeeId,
          // };
          // ctx.body = obj;
        },
        async email(ctx, next) {
          try {
            const { email, attendeeId, paymentAttempted } = await ctx.request.body;
            const getAttendeeURL = `${MEDIQUEST_URL}/attendees:get?filterByTk=${parseInt(attendeeId)}&pageSize=1000`;
            const attendeeData = await fetch(getAttendeeURL, {
              method: 'GET',
              headers: {
                Authorization: COLLECTION_AUTH_TOKEN,
              },
            });
            const attendeeDataDataJSON = await attendeeData.json();
            const formValues = attendeeDataDataJSON.data;


            const AllEventsUrl = `${MEDIQUEST_URL}event:list?pageSize=20&appends%5B%5D=event_banner&appends%5B%5D=venue&appends%5B%5D=faculty&appends%5B%5D=agenda&appends%5B%5D=attendee&appends%5B%5D=createdBy&appends%5B%5D=updatedBy&appends%5B%5D=event_card_image&appends%5B%5D=chairpersons&appends%5B%5D=intl_faculty&filter=%7B%7D`;
            const AllEvent = await fetch(AllEventsUrl, {
              method: 'GET',
              headers: {
                Authorization: COLLECTION_AUTH_TOKEN,
              },
            });
            const AllEventDataJSON = await AllEvent.json();
            const AllEventData = AllEventDataJSON.data;
            // const accEvent = AllEventData[1];
            const accEvent = AllEventData.find((e) => e.id === parseInt(formValues.eventId));

            

            const discount_coupon = formValues.discount_coupon_used ? formValues.discount_coupon_used : '';
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
              if (i.category_name == formValues.attendee_payment_categorgy_selected) {
                if (curDate <= new Date(i.early_bird_date)) {
                  if (formValues.countryId == 102) {
                    // toPay = i.early_bird_inr;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.early_rate_membership_rupees;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.early_bird_title;
                    } else {
                      toPay = i.early_bird_inr;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.early_bird_title;
                    }
                    curPaymentMethod = i;
                    // curPaymentCategory = `${accEvent.early_bird_title}`;
                    if (i.service_rupees != null && i.service_rupees != undefined && i.service_rupees != '') {
                      serviceCharge = i.service_rupees;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_rupees != null &&
                      i.transaction_rupees != undefined &&
                      i.transaction_rupees != ''
                    ) {
                      transactionCharge = i.transaction_rupees;
                    } else {
                      transactionCharge = 0;
                    }
                  } else {
                    // toPay = i.payment_amount;
                    // toPay = i.early_bird_inr;
                    // curPaymentCategory = `${accEvent.early_bird_title}`;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.early_rate_membership_rupees;
                      // curPaymentCategory = `${accEvent.early_bird_title} ${accEvent.payment_category_subs_text}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.early_bird_title;
                    } else {
                      toPay = i.early_bird_inr;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.early_bird_title;
                    }
                    curPaymentMethod = i;
                    if (i.service_dollars != null && i.service_dollars != undefined && i.service_dollars != '') {
                      serviceCharge = i.service_dollars;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_dollars != null &&
                      i.transaction_dollars != undefined &&
                      i.transaction_dollars != ''
                    ) {
                      transactionCharge = i.transaction_dollars;
                    } else {
                      transactionCharge = 0;
                    }
                  }
                } else if (curDate > new Date(i.early_bird_date) && curDate <= new Date(i.advanced_date)) {
                  if (formValues.countryId == 102) {
                    // toPay = i.advanced_rate_inr;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.advanced_rate_membership_rupees;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.advanced_title;
                    } else {
                      toPay = i.advanced_rate_inr;
                      // curPaymentCategory = `${accEvent.advanced_title}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.advanced_title;
                    }
                    curPaymentMethod = i;
                    // curPaymentCategory = `${accEvent.advanced_title}`;
                    if (i.service_rupees != null && i.service_rupees != undefined && i.service_rupees != '') {
                      serviceCharge = i.service_rupees;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_rupees != null &&
                      i.transaction_rupees != undefined &&
                      i.transaction_rupees != ''
                    ) {
                      transactionCharge = i.transaction_rupees;
                    } else {
                      transactionCharge = 0;
                    }
                  } else {
                    // toPay = i.advanced_rate;
                    // toPay = i.advanced_rate_inr;
                    // curPaymentCategory = `${accEvent.advanced_title}`;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.advanced_rate_membership_rupees;
                      // curPaymentCategory = `${accEvent.advanced_title} ${accEvent.payment_category_subs_text}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.advanced_title;
                    } else {
                      toPay = i.advanced_rate_inr;
                      // curPaymentCategory = `${accEvent.advanced_title}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.advanced_title;
                    }
                    curPaymentMethod = i;
                    if (i.service_dollars != null && i.service_dollars != undefined && i.service_dollars != '') {
                      serviceCharge = i.service_dollars;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_dollars != null &&
                      i.transaction_dollars != undefined &&
                      i.transaction_dollars != ''
                    ) {
                      transactionCharge = i.transaction_dollars;
                    } else {
                      transactionCharge = 0;
                    }
                  }
                } else {
                  if (formValues.countryId == 102) {
                    // toPay = i.regular_rate_inr;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.regular_rate_membership_rupees;
                      // curPaymentCategory = `${accEvent.regular_title} ${accEvent.payment_category_subs_text}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.regular_title;
                    } else {
                      toPay = i.regular_rate_inr;
                      // curPaymentCategory = `${accEvent.regular_title}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.regular_title;
                    }
                    curPaymentMethod = i;
                    if (i.service_rupees != null && i.service_rupees != undefined && i.service_rupees != '') {
                      serviceCharge = i.service_rupees;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_rupees != null &&
                      i.transaction_rupees != undefined &&
                      i.transaction_rupees != ''
                    ) {
                      transactionCharge = i.transaction_rupees;
                    } else {
                      transactionCharge = 0;
                    }
                  } else {
                    // toPay = i.regular_rate;
                    // toPay = i.regular_rate_inr;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.regular_rate_membership_rupees;
                      // curPaymentCategory = `${accEvent.regular_title} ${accEvent.payment_category_subs_text}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.regular_title;
                    } else {
                      toPay = i.regular_rate_inr;
                      // curPaymentCategory = `${accEvent.regular_title}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.regular_title;
                    }
                    curPaymentMethod = i;
                    if (i.service_dollars != null && i.service_dollars != undefined && i.service_dollars != '') {
                      serviceCharge = i.service_dollars;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_dollars != null &&
                      i.transaction_dollars != undefined &&
                      i.transaction_dollars != ''
                    ) {
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
                if (
                  i.coupon_code == discount_coupon &&
                  new Date(i.coupon_validity) >= new Date() &&
                  i.coupon_user_count > 0
                ) {
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
                amtToPay =
                  parseFloat(toPay) -
                  parseFloat((parseFloat(toPay) * parseFloat(myC.coupon_discount_percentage)) / 100);
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
            const payment_email_temp = await paymentEmailTemp();
            const placeholders = {
              banner_image: `<img style = "max-width: 560px;" src=${`${MEDIQUEST_URL_IMG}${payment_email_temp.email_banner_image[0].url}`} alt="" />`,
              full_name: `${formValues.attendee_first_name} ${formValues.attendee_last_name}`,
              registration_id: formValues.registration_id,
              registration_type: `${formValues.attendee_payment_categorgy_selected} (${dateWisePaymentCategory}) : INR ${toPay}`,
              get_direction: `<a href=${accEvent.venue[0].venue_map_link} style="display: inline-block; padding: 10px; background-color: rgb(228, 139, 107); font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 20px; color: #ffffff; text-decoration: none;">Get Direction</a>`,
              payment_table: `<tr>
              <td colspan="2" valign="middle" style="padding-left: 0px; padding-right: 0px; background-color: #f6f6f6; border: 1px solid #cccccc;">
                  <table width="100%" style="border-collapse: collapse;">
                      <tr>
                          <td colspan="2" valign="middle" style="padding: 10px 20px; border-bottom: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              <p
                              style="margin: 0px; padding: 0px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: center;"> Payment Receipt </p>
                          </td>
                      </tr>
                      <tr>
                          <td colspan="2" valign="middle" style="padding: 10px 20px; border-bottom: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              <p
                              style="margin: 0px; padding: 0px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: center;"> ${
                                accEvent.payment_company_name
                              }</p>
                          </td>
                      </tr>
                      <tr>
                          <td colspan="2" valign="middle" style="padding: 10px 20px; border-bottom: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              <p
                              style="margin: 0px 0 20px; padding: 0px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: center;"><strong>Address:</strong> ${accEvent.payment_company_address.replace(
                                /<\/?p>/g,
                                ' ',
                              )}</p>
                              <p
                              style="margin: 0px 0 20px; padding: 0px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: center;"><strong>GST Registration No.</strong> ${
                                accEvent.GSTRegistrationNumber
                              }</p>
                              <p
                              style="margin: 0px 0 0px; padding: 0px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: center;"><strong>Registered for ${
                                accEvent.event_title
                              }</strong></p>
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; background-color: #0b2c54; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; color: #ffffff;">
                              Description
                          </td>
                          <td style="padding: 10px 20px; background-color: #0b2c54; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; color: #ffffff;">
                              Amount in INR
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              Registration fee  <br>
                              <span style="font-size: 14px; font-style: italic; color: #666666;">
                              (${dateWisePaymentCategory})
                              (${curPaymentCategory}) <br />
                              (Exclusive of taxes)
                              </span>

                          </td>
                          <td style="padding: 10px 20px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: right;">
                              ${parseFloat(toPay).toFixed(2)}
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; color: rgb(27, 160, 27);">
                              Less Coupon discount${discount_coupon ? ` -(${discount_coupon})` : ''}
                          </td>
                          <td style="padding: 10px 20px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: right;">
                          - ${(
                            parseFloat(registrationFee) -
                            parseFloat(
                              parseFloat(registrationFeeToBePaid) -
                                parseFloat(
                                  parseFloat(parseFloat(after_discount_value) * parseFloat(transactionCharge)) / 100,
                                ) -
                                parseFloat(
                                  parseFloat(parseFloat(after_discount_value) * parseFloat(serviceCharge)) / 100,
                                ),
                            )
                          ).toFixed(2)}
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              Total:

                          </td>
                          <td style="padding: 10px 20px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: right;">
                              ${parseFloat(
                                parseFloat(toPay) -
                                  parseFloat(
                                    parseFloat(registrationFee) -
                                      parseFloat(
                                        parseFloat(registrationFeeToBePaid) -
                                          parseFloat(
                                            parseFloat(
                                              parseFloat(after_discount_value) * parseFloat(transactionCharge),
                                            ) / 100,
                                          ) -
                                          parseFloat(
                                            parseFloat(parseFloat(after_discount_value) * parseFloat(serviceCharge)) /
                                              100,
                                          ),
                                      ),
                                  ),
                              ).toFixed(2)}
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                          ${payment[0].additional_charge_two_title}
                          </td>
                          <td style="padding: 10px 20px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: right;">
                          ${((parseFloat(after_discount_value) * parseFloat(transactionCharge)) / 100).toFixed(2)}
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                          ${payment[0].additional_charge_one_title}
                          </td>
                          <td style="padding: 10px 20px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: right;">
                          ${((parseFloat(after_discount_value) * parseFloat(serviceCharge)) / 100).toFixed(2)}
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; border-top: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              Amount Paid
                          </td>
                          <td style="padding: 10px 20px; border-top: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; color: rgb(235, 65, 65); text-align: right;">
                          ${Math.round(registrationFeeToBePaid.toFixed(2))}
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>`,
            };
            let emailBody;
            emailBody = replacePlaceholders(payment_email_temp.email_description, placeholders);
            const mailOptions = {
              from: payment_email_temp.email_from,
              to: email,
              bcc: payment_email_temp?.email_to ? payment_email_temp?.email_to : '',
              subject: payment_email_temp.email_subject,
              html: `<!DOCTYPE html>
              <html lang="en">
              
              <head>
              <title>${accEvent.event_title}</title>
                  <meta name="viewport"
                      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no" />
              
              </head>
              
              <body>
                  <div style="max-width: 560px; width: 100%; margin: 0 auto;">
                      <table style="width: 100%" cellpadding="0" cellspacing="0"
                          style="font-family: Calibri, 'Gill Sans', 'Trebuchet MS', sans-serif; border: 1px solid #cccccc;">
                          ${emailBody}
                      </table>
                  </div>
              </body>
              
              </html>`,
            };
            const sendMail = await transporter.sendMail(mailOptions);
            ctx.body = 'payment email sent!';
          } catch (err) {
            ctx.body = err;
          }
        },
        async registrationEmail(ctx, next) {
          try {
            const { email, attendeeId } = ctx.request.body;
            const getAttendeeURL = `${MEDIQUEST_URL}/attendees:get?filterByTk=${parseInt(attendeeId)}&pageSize=1000`;
            const attendeeData = await fetch(getAttendeeURL, {
              method: 'GET',
              headers: {
                Authorization: COLLECTION_AUTH_TOKEN,
              },
            });
            const attendeeDataDataJSON = await attendeeData.json();
            const formValues = attendeeDataDataJSON.data;


            const AllEventsUrl = `${MEDIQUEST_URL}event:list?pageSize=20&appends%5B%5D=event_banner&appends%5B%5D=venue&appends%5B%5D=faculty&appends%5B%5D=agenda&appends%5B%5D=attendee&appends%5B%5D=createdBy&appends%5B%5D=updatedBy&appends%5B%5D=event_card_image&appends%5B%5D=chairpersons&appends%5B%5D=intl_faculty&filter=%7B%7D`;
            const AllEvent = await fetch(AllEventsUrl, {
              method: 'GET',
              headers: {
                Authorization: COLLECTION_AUTH_TOKEN,
              },
            });
            const AllEventDataJSON = await AllEvent.json();
            const AllEventData = AllEventDataJSON.data;
            const accEvent = AllEventData.find((e) => e.id === parseInt(formValues.eventId));

            const discount_coupon = formValues.discount_coupon_used ? formValues.discount_coupon_used : '';
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
              if (i.category_name == formValues.attendee_payment_categorgy_selected) {
                if (curDate <= new Date(i.early_bird_date)) {
                  if (formValues.countryId == 102) {
                    // toPay = i.early_bird_inr;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.early_rate_membership_rupees;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.early_bird_title;
                    } else {
                      toPay = i.early_bird_inr;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.early_bird_title;
                    }
                    curPaymentMethod = i;
                    // curPaymentCategory = `${accEvent.early_bird_title}`;
                    if (i.service_rupees != null && i.service_rupees != undefined && i.service_rupees != '') {
                      serviceCharge = i.service_rupees;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_rupees != null &&
                      i.transaction_rupees != undefined &&
                      i.transaction_rupees != ''
                    ) {
                      transactionCharge = i.transaction_rupees;
                    } else {
                      transactionCharge = 0;
                    }
                  } else {
                    // toPay = i.payment_amount;
                    // toPay = i.early_bird_inr;
                    // curPaymentCategory = `${accEvent.early_bird_title}`;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.early_rate_membership_rupees;
                      // curPaymentCategory = `${accEvent.early_bird_title} ${accEvent.payment_category_subs_text}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.early_bird_title;
                    } else {
                      toPay = i.early_bird_inr;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.early_bird_title;
                    }
                    curPaymentMethod = i;
                    if (i.service_dollars != null && i.service_dollars != undefined && i.service_dollars != '') {
                      serviceCharge = i.service_dollars;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_dollars != null &&
                      i.transaction_dollars != undefined &&
                      i.transaction_dollars != ''
                    ) {
                      transactionCharge = i.transaction_dollars;
                    } else {
                      transactionCharge = 0;
                    }
                  }
                } else if (curDate > new Date(i.early_bird_date) && curDate <= new Date(i.advanced_date)) {
                  if (formValues.countryId == 102) {
                    // toPay = i.advanced_rate_inr;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.advanced_rate_membership_rupees;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.advanced_title;
                    } else {
                      toPay = i.advanced_rate_inr;
                      // curPaymentCategory = `${accEvent.advanced_title}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.advanced_title;
                    }
                    curPaymentMethod = i;
                    // curPaymentCategory = `${accEvent.advanced_title}`;
                    if (i.service_rupees != null && i.service_rupees != undefined && i.service_rupees != '') {
                      serviceCharge = i.service_rupees;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_rupees != null &&
                      i.transaction_rupees != undefined &&
                      i.transaction_rupees != ''
                    ) {
                      transactionCharge = i.transaction_rupees;
                    } else {
                      transactionCharge = 0;
                    }
                  } else {
                    // toPay = i.advanced_rate;
                    // toPay = i.advanced_rate_inr;
                    // curPaymentCategory = `${accEvent.advanced_title}`;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.advanced_rate_membership_rupees;
                      // curPaymentCategory = `${accEvent.advanced_title} ${accEvent.payment_category_subs_text}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.advanced_title;
                    } else {
                      toPay = i.advanced_rate_inr;
                      // curPaymentCategory = `${accEvent.advanced_title}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.advanced_title;
                    }
                    curPaymentMethod = i;
                    if (i.service_dollars != null && i.service_dollars != undefined && i.service_dollars != '') {
                      serviceCharge = i.service_dollars;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_dollars != null &&
                      i.transaction_dollars != undefined &&
                      i.transaction_dollars != ''
                    ) {
                      transactionCharge = i.transaction_dollars;
                    } else {
                      transactionCharge = 0;
                    }
                  }
                } else {
                  if (formValues.countryId == 102) {
                    // toPay = i.regular_rate_inr;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.regular_rate_membership_rupees;
                      // curPaymentCategory = `${accEvent.regular_title} ${accEvent.payment_category_subs_text}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.regular_title;
                    } else {
                      toPay = i.regular_rate_inr;
                      // curPaymentCategory = `${accEvent.regular_title}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.regular_title;
                    }
                    curPaymentMethod = i;
                    if (i.service_rupees != null && i.service_rupees != undefined && i.service_rupees != '') {
                      serviceCharge = i.service_rupees;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_rupees != null &&
                      i.transaction_rupees != undefined &&
                      i.transaction_rupees != ''
                    ) {
                      transactionCharge = i.transaction_rupees;
                    } else {
                      transactionCharge = 0;
                    }
                  } else {
                    // toPay = i.regular_rate;
                    // toPay = i.regular_rate_inr;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.regular_rate_membership_rupees;
                      // curPaymentCategory = `${accEvent.regular_title} ${accEvent.payment_category_subs_text}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.regular_title;
                    } else {
                      toPay = i.regular_rate_inr;
                      // curPaymentCategory = `${accEvent.regular_title}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.regular_title;
                    }
                    curPaymentMethod = i;
                    if (i.service_dollars != null && i.service_dollars != undefined && i.service_dollars != '') {
                      serviceCharge = i.service_dollars;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_dollars != null &&
                      i.transaction_dollars != undefined &&
                      i.transaction_dollars != ''
                    ) {
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
                if (
                  i.coupon_code == discount_coupon &&
                  new Date(i.coupon_validity) >= new Date() &&
                  i.coupon_user_count > 0
                ) {
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
                amtToPay =
                  parseFloat(toPay) -
                  parseFloat((parseFloat(toPay) * parseFloat(myC.coupon_discount_percentage)) / 100);
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
            // console.log('company name is: ', accEvent.companyName);
            const registration_email_temp = await registrationEmailTemp();
            const placeholders = {
              banner_image: `<img style = "max-width: 560px;" src=${`${MEDIQUEST_URL_IMG}${registration_email_temp.email_banner_image[0].url}`} alt="" />`,
              full_name: `${formValues.attendee_first_name} ${formValues.attendee_last_name}`,
              make_payment: `<a href="${ACC_ASIA_URL_FULL}events/${accEvent.id}/registration-completed/${attendeeId}"} style="display: inline-block; padding: 10px; background-color: orangered; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 20px; color: #ffffff;">MAKE PAYMENT</a>`,
              payment_table: `<tr>
              <td colspan="2" valign="middle" style="padding-left: 0px; padding-right: 0px; background-color: #f6f6f6; border: 1px solid #cccccc;">
                  <table width="100%" style="border-collapse: collapse;">
                      <tr>
                          <td colspan="2" valign="middle" style="padding: 10px 20px; border-bottom: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              <p
                              style="margin: 0px; padding: 0px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: center;"> ${
                                accEvent.event_title
                              }</p>
                          </td>
                      </tr>
                      <tr>
                          <td colspan="2" valign="middle" style="padding: 10px 20px; border-bottom: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              <p
                              style="margin: 0px; padding: 0px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: center;"> Payment Summary</p>
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; background-color: #0b2c54; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; color: #ffffff;">
                              Description
                          </td>
                          <td style="padding: 10px 20px; background-color: #0b2c54; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; color: #ffffff;">
                              Amount in INR
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              Registration fee  <br>
                              <span style="font-size: 14px; font-style: italic; color: #666666;">
                              (${dateWisePaymentCategory})
                              (${curPaymentCategory}) <br />
                              (Exclusive of taxes)
                              </span>

                          </td>
                          <td style="padding: 10px 20px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: right;">
                          ${parseFloat(toPay).toFixed(2)}
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; color: rgb(27, 160, 27);">
                          Less Coupon discount${discount_coupon ? ` -(${discount_coupon})` : ''}
                          </td>
                          <td style="padding: 10px 20px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: right;">
                          - ${(
                            parseFloat(registrationFee) -
                            parseFloat(
                              parseFloat(registrationFeeToBePaid) -
                                parseFloat(
                                  parseFloat(parseFloat(after_discount_value) * parseFloat(transactionCharge)) / 100,
                                ) -
                                parseFloat(
                                  parseFloat(parseFloat(after_discount_value) * parseFloat(serviceCharge)) / 100,
                                ),
                            )
                          ).toFixed(2)}
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              Total:

                          </td>
                          <td style="padding: 10px 20px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: right;">
                              ${parseFloat(
                                parseFloat(toPay) -
                                  parseFloat(
                                    parseFloat(registrationFee) -
                                      parseFloat(
                                        parseFloat(registrationFeeToBePaid) -
                                          parseFloat(
                                            parseFloat(
                                              parseFloat(after_discount_value) * parseFloat(transactionCharge),
                                            ) / 100,
                                          ) -
                                          parseFloat(
                                            parseFloat(parseFloat(after_discount_value) * parseFloat(serviceCharge)) /
                                              100,
                                          ),
                                      ),
                                  ),
                              ).toFixed(2)}
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                          ${payment[0].additional_charge_two_title}
                          </td>
                          <td style="padding: 10px 20px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: right;">
                          ${((parseFloat(after_discount_value) * parseFloat(transactionCharge)) / 100).toFixed(2)}
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                          ${payment[0].additional_charge_one_title}
                          </td>
                          <td style="padding: 10px 20px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: right;">
                          ${((parseFloat(after_discount_value) * parseFloat(serviceCharge)) / 100).toFixed(2)}
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; border-top: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              Total Amount to pay
                          </td>
                          <td style="padding: 10px 20px; border-top: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; color: rgb(235, 65, 65); text-align: right;">
                          ${Math.round(registrationFeeToBePaid.toFixed(2))}
                          </td>
                      </tr>
                  </table>
              </td>                
          </tr>`,
              click_here_to_make_payment: `<a href="${ACC_ASIA_URL_FULL}events/${accEvent.id}/registration-completed/${attendeeId}"}>Click here to make payment</a>`,
            };
            let emailBody;
            emailBody = replacePlaceholders(registration_email_temp.email_description, placeholders);
            const mailOptions = {
              from: registration_email_temp.email_from,
              to: email,
              subject: registration_email_temp.email_subject,
              html: `<!DOCTYPE html>
              <html lang="en">
              
              <head>
              <title>${accEvent.event_title}</title>
                  <meta name="viewport"
                      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no" />
              
              </head>
              
              <body>
                  <div style="max-width: 560px; width: 100%; margin: 0 auto;">
                      <table style="width: 100%" cellpadding="0" cellspacing="0"
                          style="font-family: Calibri, 'Gill Sans', 'Trebuchet MS', sans-serif; border: 1px solid #cccccc;">
                          ${emailBody}
                      </table>
                  </div>
              </body>
              
              </html>`,
            };
            const sendMail = await transporter.sendMail(mailOptions);
            ctx.body = 'reg email sent!';
          } catch (err) {
            ctx.body = err;
          }
        },
        async groupPaymentEmailAll(ctx, next) {
          try {
            const { email, groupAttendeeId } = await ctx.request.body;
            const getAttendeeURL = `${MEDIQUEST_URL}/group_attendee:get?filterByTk=${parseInt(
              groupAttendeeId,
            )}&pageSize=1000`;
            const attendeeData = await fetch(getAttendeeURL, {
              method: 'GET',
              headers: {
                Authorization: COLLECTION_AUTH_TOKEN,
              },
            });
            const attendeeDataDataJSON = await attendeeData.json();
            const formValues = attendeeDataDataJSON.data;

            const AllEventsUrl = `${MEDIQUEST_URL}event:get?filterByTk=${formValues.eventId}&pageSize=100&appends%5B%5D=event_banner&appends%5B%5D=venue&appends%5B%5D=faculty&appends%5B%5D=agenda&appends%5B%5D=attendee&appends%5B%5D=createdBy&appends%5B%5D=updatedBy&appends%5B%5D=event_card_image&appends%5B%5D=chairpersons&appends%5B%5D=intl_faculty&filter=%7B%7D`;
            const AllEvent = await fetch(AllEventsUrl, {
              method: 'GET',
              headers: {
                Authorization: COLLECTION_AUTH_TOKEN,
              },
            });
            const AllEventDataJSON = await AllEvent.json();
            const accEvent = AllEventDataJSON.data;

            const discount_coupon = formValues.discount_coupon_used ? formValues.discount_coupon_used : '';
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
              if (i.category_name == formValues.attendee_payment_categorgy_selected) {
                if (curDate <= new Date(i.early_bird_date)) {
                  if (formValues.countryId == 102) {
                    // toPay = i.early_bird_inr;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.early_rate_membership_rupees;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.early_bird_title;
                    } else {
                      toPay = i.early_bird_inr;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.early_bird_title;
                    }
                    curPaymentMethod = i;
                    // curPaymentCategory = `${accEvent.early_bird_title}`;
                    if (i.service_rupees != null && i.service_rupees != undefined && i.service_rupees != '') {
                      serviceCharge = i.service_rupees;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_rupees != null &&
                      i.transaction_rupees != undefined &&
                      i.transaction_rupees != ''
                    ) {
                      transactionCharge = i.transaction_rupees;
                    } else {
                      transactionCharge = 0;
                    }
                  } else {
                    // toPay = i.payment_amount;
                    // toPay = i.early_bird_inr;
                    // curPaymentCategory = `${accEvent.early_bird_title}`;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.early_rate_membership_rupees;
                      // curPaymentCategory = `${accEvent.early_bird_title} ${accEvent.payment_category_subs_text}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.early_bird_title;
                    } else {
                      toPay = i.early_bird_inr;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.early_bird_title;
                    }
                    curPaymentMethod = i;
                    if (i.service_dollars != null && i.service_dollars != undefined && i.service_dollars != '') {
                      serviceCharge = i.service_dollars;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_dollars != null &&
                      i.transaction_dollars != undefined &&
                      i.transaction_dollars != ''
                    ) {
                      transactionCharge = i.transaction_dollars;
                    } else {
                      transactionCharge = 0;
                    }
                  }
                } else if (curDate > new Date(i.early_bird_date) && curDate <= new Date(i.advanced_date)) {
                  if (formValues.countryId == 102) {
                    // toPay = i.advanced_rate_inr;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.advanced_rate_membership_rupees;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.advanced_title;
                    } else {
                      toPay = i.advanced_rate_inr;
                      // curPaymentCategory = `${accEvent.advanced_title}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.advanced_title;
                    }
                    curPaymentMethod = i;
                    // curPaymentCategory = `${accEvent.advanced_title}`;
                    if (i.service_rupees != null && i.service_rupees != undefined && i.service_rupees != '') {
                      serviceCharge = i.service_rupees;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_rupees != null &&
                      i.transaction_rupees != undefined &&
                      i.transaction_rupees != ''
                    ) {
                      transactionCharge = i.transaction_rupees;
                    } else {
                      transactionCharge = 0;
                    }
                  } else {
                    // toPay = i.advanced_rate;
                    // toPay = i.advanced_rate_inr;
                    // curPaymentCategory = `${accEvent.advanced_title}`;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.advanced_rate_membership_rupees;
                      // curPaymentCategory = `${accEvent.advanced_title} ${accEvent.payment_category_subs_text}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.advanced_title;
                    } else {
                      toPay = i.advanced_rate_inr;
                      // curPaymentCategory = `${accEvent.advanced_title}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.advanced_title;
                    }
                    curPaymentMethod = i;
                    if (i.service_dollars != null && i.service_dollars != undefined && i.service_dollars != '') {
                      serviceCharge = i.service_dollars;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_dollars != null &&
                      i.transaction_dollars != undefined &&
                      i.transaction_dollars != ''
                    ) {
                      transactionCharge = i.transaction_dollars;
                    } else {
                      transactionCharge = 0;
                    }
                  }
                } else {
                  if (formValues.countryId == 102) {
                    // toPay = i.regular_rate_inr;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.regular_rate_membership_rupees;
                      // curPaymentCategory = `${accEvent.regular_title} ${accEvent.payment_category_subs_text}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.regular_title;
                    } else {
                      toPay = i.regular_rate_inr;
                      // curPaymentCategory = `${accEvent.regular_title}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.regular_title;
                    }
                    curPaymentMethod = i;
                    if (i.service_rupees != null && i.service_rupees != undefined && i.service_rupees != '') {
                      serviceCharge = i.service_rupees;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_rupees != null &&
                      i.transaction_rupees != undefined &&
                      i.transaction_rupees != ''
                    ) {
                      transactionCharge = i.transaction_rupees;
                    } else {
                      transactionCharge = 0;
                    }
                  } else {
                    // toPay = i.regular_rate;
                    // toPay = i.regular_rate_inr;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.regular_rate_membership_rupees;
                      // curPaymentCategory = `${accEvent.regular_title} ${accEvent.payment_category_subs_text}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.regular_title;
                    } else {
                      toPay = i.regular_rate_inr;
                      // curPaymentCategory = `${accEvent.regular_title}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.regular_title;
                    }
                    curPaymentMethod = i;
                    if (i.service_dollars != null && i.service_dollars != undefined && i.service_dollars != '') {
                      serviceCharge = i.service_dollars;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_dollars != null &&
                      i.transaction_dollars != undefined &&
                      i.transaction_dollars != ''
                    ) {
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
            // ctx.body = {discount_coupon, allDiscount};
            // return;

            if (discount_coupon) {
              allDiscount.forEach((i) => {
                if (
                  i.coupon_code == discount_coupon &&
                  new Date(i.coupon_validity) >= new Date() &&
                  i.coupon_user_count > 0
                ) {
                  myC = i;
                  // ctx.body = myC;
                  // return;
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
                amtToPay =
                  parseFloat(toPay) -
                  parseFloat((parseFloat(toPay) * parseFloat(myC.coupon_discount_percentage)) / 100);
              }
            }
            const after_discount = amtToPay;
            const after_discount_value = parseFloat(after_discount);
            amtToPay =
              parseFloat(after_discount) +
              parseFloat((parseFloat(after_discount) * parseFloat(transactionCharge)) / 100);
            // amtToPay = after_discount_value;

            const registrationFee = parseFloat(netAmt);
            const registrationFeeToBePaid = parseFloat(amtToPay);

            // ctx.body = { registrationFee, registrationFeeToBePaid };
            // return;
            const payment_email_temp = await groupPaymentEmailTemp();
            const placeholders = {
              banner_image: `<img style = "max-width: 560px;" src=${`${MEDIQUEST_URL_IMG}${payment_email_temp.email_banner_image[0].url}`} alt="" />`,
              full_name: `${formValues.attendee_first_name} ${formValues.attendee_last_name}`,
              comapny_name: formValues.attendee_company_name,
              registration_id: `${formValues.attendee_registration_id}`,
              registration_type: `${formValues.attendee_payment_categorgy_selected} (${dateWisePaymentCategory}) : INR ${toPay}`,
              get_direction: `<a href=${accEvent.venue[0].venue_map_link} style="display: inline-block; padding: 10px; background-color: rgb(228, 139, 107); font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 20px; color: #ffffff; text-decoration: none;">Get Direction</a>`,
              payment_table: `<tr>
              <td colspan="2" valign="middle" style="padding-left: 0px; padding-right: 0px; background-color: #f6f6f6; border: 1px solid #cccccc;">
                  <table width="100%" style="border-collapse: collapse;">
                      <tr>
                          <td colspan="2" valign="middle" style="padding: 10px 20px; border-bottom: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              <p
                              style="margin: 0px; padding: 0px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: center;"> Payment Receipt </p>
                          </td>
                      </tr>
                      <tr>
                          <td colspan="2" valign="middle" style="padding: 10px 20px; border-bottom: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              <p
                              style="margin: 0px; padding: 0px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: center;"> ${
                                accEvent.payment_company_name
                              }</p>
                          </td>
                      </tr>
                      <tr>
                          <td colspan="2" valign="middle" style="padding: 10px 20px; border-bottom: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              <p
                              style="margin: 0px 0 20px; padding: 0px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: center;"><strong>Address:</strong> ${accEvent.payment_company_address.replace(
                                /<\/?p>/g,
                                ' ',
                              )}</p>
                              <p
                              style="margin: 0px 0 20px; padding: 0px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: center;"><strong>GST Registration No.</strong> ${
                                accEvent.GSTRegistrationNumber
                              }</p>
                              <p
                              style="margin: 0px 0 0px; padding: 0px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: center;"><strong>Registered for ${
                                accEvent.event_title
                              }</strong></p>
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; background-color: #0b2c54; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; color: #ffffff;">
                              Description
                          </td>
                          <td style="padding: 10px 20px; background-color: #0b2c54; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; color: #ffffff;">
                              Amount in INR
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              Registration fee  <br>
                              <span style="font-size: 14px; font-style: italic; color: #666666;">
                              (${dateWisePaymentCategory})
                              (${curPaymentCategory}) <br />
                              (Exclusive of taxes)
                              </span>

                          </td>
                          <td style="padding: 10px 20px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: right;">
                              ${parseFloat(toPay).toFixed(2)}
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; color: rgb(27, 160, 27);">
                              Less Coupon discount${discount_coupon ? ` -(${discount_coupon})` : ''}
                          </td>
                          <td style="padding: 10px 20px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: right;">
                          - ${(
                            parseFloat(registrationFee) +
                            parseFloat(
                              parseFloat(parseFloat(after_discount_value) * parseFloat(transactionCharge)) / 100,
                            ) -
                            parseFloat(registrationFeeToBePaid)
                          ).toFixed(2)}
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              Total:

                          </td>
                          <td style="padding: 10px 20px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: right;">
                              ${parseFloat(
                                parseFloat(toPay) -
                                  parseFloat(
                                    parseFloat(registrationFee) -
                                      parseFloat(
                                        parseFloat(registrationFeeToBePaid) -
                                          parseFloat(
                                            parseFloat(
                                              parseFloat(after_discount_value) * parseFloat(transactionCharge),
                                            ) / 100,
                                          ),
                                      ),
                                  ),
                              ).toFixed(2)}
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                          ${payment[0].additional_charge_two_title}
                          </td>
                          <td style="padding: 10px 20px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: right;">
                          ${((parseFloat(after_discount_value) * parseFloat(transactionCharge)) / 100).toFixed(2)}
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; border-top: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              Amount Paid
                          </td>
                          <td style="padding: 10px 20px; border-top: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; color: rgb(235, 65, 65); text-align: right;">
                          ${Math.round(registrationFeeToBePaid.toFixed(2))}
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>`,
            };
            let emailBody;
            emailBody = replacePlaceholders(payment_email_temp.email_description, placeholders);
            // ctx.body = emailBody;
            // return;
            const mailOptions = {
              from: payment_email_temp.email_from,
              to: email,
              subject: payment_email_temp.email_subject,
              html: `<!DOCTYPE html>
              <html lang="en">
              
              <head>
              <title>${accEvent.event_title}</title>
                  <meta name="viewport"
                      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no" />
              
              </head>
              
              <body>
                  <div style="max-width: 560px; width: 100%; margin: 0 auto;">
                      <table style="width: 100%" cellpadding="0" cellspacing="0"
                          style="font-family: Calibri, 'Gill Sans', 'Trebuchet MS', sans-serif; border: 1px solid #cccccc;">
                          ${emailBody}
                      </table>
                  </div>
              </body>
              
              </html>`,
            };
            await transporter.sendMail(mailOptions);
            // ctx.body = {after_discount_value, registrationFee, registrationFeeToBePaid, myC};
            ctx.body = 'email sent!';
          } catch (err) {
            ctx.body = err;
          }
        },
        async groupPaymentEmailLeader(ctx, next) {
          // to be modified
          try {
            const { email, groupAttendeeId } = await ctx.request.body;
            const getAttendeeURL = `${MEDIQUEST_URL}/group_attendee:get?filterByTk=${parseInt(
              groupAttendeeId,
            )}&pageSize=1000&appends%5B%5D=group_members_list`;
            const attendeeData = await fetch(getAttendeeURL, {
              method: 'GET',
              headers: {
                Authorization: COLLECTION_AUTH_TOKEN,
              },
            });
            const attendeeDataDataJSON = await attendeeData.json();
            const formValues = attendeeDataDataJSON.data;
            const attachment = [];
            if (formValues.group_members_list.length > 0) {
              formValues.group_members_list.map((obj) => {
                const newObj = {
                  filename: obj.filename,
                  path: `${MEDIQUEST_URL_IMG}${obj.url}`,
                };
                attachment.push(newObj);
              });
            }
            const AllEventsUrl = `${MEDIQUEST_URL}event:get?filterByTk=${formValues.eventId}&pageSize=100&appends%5B%5D=event_banner&appends%5B%5D=venue&appends%5B%5D=faculty&appends%5B%5D=agenda&appends%5B%5D=attendee&appends%5B%5D=createdBy&appends%5B%5D=updatedBy&appends%5B%5D=event_card_image&appends%5B%5D=chairpersons&appends%5B%5D=intl_faculty&filter=%7B%7D`;
            const AllEvent = await fetch(AllEventsUrl, {
              method: 'GET',
              headers: {
                Authorization: COLLECTION_AUTH_TOKEN,
              },
            });
            const AllEventDataJSON = await AllEvent.json();
            const accEvent = AllEventDataJSON.data;

            const discount_coupon = formValues.discount_coupon_used ? formValues.discount_coupon_used : '';
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
              if (i.category_name == formValues.attendee_payment_categorgy_selected) {
                if (curDate <= new Date(i.early_bird_date)) {
                  if (formValues.countryId == 102) {
                    // toPay = i.early_bird_inr;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.early_rate_membership_rupees;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.early_bird_title;
                    } else {
                      toPay = i.early_bird_inr;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.early_bird_title;
                    }
                    curPaymentMethod = i;
                    // curPaymentCategory = `${accEvent.early_bird_title}`;
                    if (i.service_rupees != null && i.service_rupees != undefined && i.service_rupees != '') {
                      serviceCharge = i.service_rupees;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_rupees != null &&
                      i.transaction_rupees != undefined &&
                      i.transaction_rupees != ''
                    ) {
                      transactionCharge = i.transaction_rupees;
                    } else {
                      transactionCharge = 0;
                    }
                  } else {
                    // toPay = i.payment_amount;
                    // toPay = i.early_bird_inr;
                    // curPaymentCategory = `${accEvent.early_bird_title}`;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.early_rate_membership_rupees;
                      // curPaymentCategory = `${accEvent.early_bird_title} ${accEvent.payment_category_subs_text}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.early_bird_title;
                    } else {
                      toPay = i.early_bird_inr;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.early_bird_title;
                    }
                    curPaymentMethod = i;
                    if (i.service_dollars != null && i.service_dollars != undefined && i.service_dollars != '') {
                      serviceCharge = i.service_dollars;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_dollars != null &&
                      i.transaction_dollars != undefined &&
                      i.transaction_dollars != ''
                    ) {
                      transactionCharge = i.transaction_dollars;
                    } else {
                      transactionCharge = 0;
                    }
                  }
                } else if (curDate > new Date(i.early_bird_date) && curDate <= new Date(i.advanced_date)) {
                  if (formValues.countryId == 102) {
                    // toPay = i.advanced_rate_inr;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.advanced_rate_membership_rupees;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.advanced_title;
                    } else {
                      toPay = i.advanced_rate_inr;
                      // curPaymentCategory = `${accEvent.advanced_title}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.advanced_title;
                    }
                    curPaymentMethod = i;
                    // curPaymentCategory = `${accEvent.advanced_title}`;
                    if (i.service_rupees != null && i.service_rupees != undefined && i.service_rupees != '') {
                      serviceCharge = i.service_rupees;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_rupees != null &&
                      i.transaction_rupees != undefined &&
                      i.transaction_rupees != ''
                    ) {
                      transactionCharge = i.transaction_rupees;
                    } else {
                      transactionCharge = 0;
                    }
                  } else {
                    // toPay = i.advanced_rate;
                    // toPay = i.advanced_rate_inr;
                    // curPaymentCategory = `${accEvent.advanced_title}`;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.advanced_rate_membership_rupees;
                      // curPaymentCategory = `${accEvent.advanced_title} ${accEvent.payment_category_subs_text}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.advanced_title;
                    } else {
                      toPay = i.advanced_rate_inr;
                      // curPaymentCategory = `${accEvent.advanced_title}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.advanced_title;
                    }
                    curPaymentMethod = i;
                    if (i.service_dollars != null && i.service_dollars != undefined && i.service_dollars != '') {
                      serviceCharge = i.service_dollars;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_dollars != null &&
                      i.transaction_dollars != undefined &&
                      i.transaction_dollars != ''
                    ) {
                      transactionCharge = i.transaction_dollars;
                    } else {
                      transactionCharge = 0;
                    }
                  }
                } else {
                  if (formValues.countryId == 102) {
                    // toPay = i.regular_rate_inr;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.regular_rate_membership_rupees;
                      // curPaymentCategory = `${accEvent.regular_title} ${accEvent.payment_category_subs_text}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.regular_title;
                    } else {
                      toPay = i.regular_rate_inr;
                      // curPaymentCategory = `${accEvent.regular_title}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.regular_title;
                    }
                    curPaymentMethod = i;
                    if (i.service_rupees != null && i.service_rupees != undefined && i.service_rupees != '') {
                      serviceCharge = i.service_rupees;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_rupees != null &&
                      i.transaction_rupees != undefined &&
                      i.transaction_rupees != ''
                    ) {
                      transactionCharge = i.transaction_rupees;
                    } else {
                      transactionCharge = 0;
                    }
                  } else {
                    // toPay = i.regular_rate;
                    // toPay = i.regular_rate_inr;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.regular_rate_membership_rupees;
                      // curPaymentCategory = `${accEvent.regular_title} ${accEvent.payment_category_subs_text}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.regular_title;
                    } else {
                      toPay = i.regular_rate_inr;
                      // curPaymentCategory = `${accEvent.regular_title}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.regular_title;
                    }
                    curPaymentMethod = i;
                    if (i.service_dollars != null && i.service_dollars != undefined && i.service_dollars != '') {
                      serviceCharge = i.service_dollars;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_dollars != null &&
                      i.transaction_dollars != undefined &&
                      i.transaction_dollars != ''
                    ) {
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
            const payment_email_temp = await groupPaymentLeaderEmailTemp();
            const placeholders = {
              banner_image: `<img style = "max-width: 560px;" src=${`${MEDIQUEST_URL_IMG}${payment_email_temp.email_banner_image[0].url}`} alt="" />`,
              full_name: `${formValues.attendee_first_name} ${formValues.attendee_last_name}`,
              get_direction: `<a href=${accEvent.venue[0].venue_map_link} style="display: inline-block; padding: 10px; background-color: rgb(228, 139, 107); font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 20px; color: #ffffff; text-decoration: none;">Get Direction</a>`,
              payment_table: `<tr>
              <td colspan="2" valign="middle" style="padding-left: 0px; padding-right: 0px; background-color: #f6f6f6; border: 1px solid #cccccc;">
                  <table width="100%" style="border-collapse: collapse;">
                      <tr>
                          <td colspan="2" valign="middle" style="padding: 10px 20px; border-bottom: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              <p
                              style="margin: 0px; padding: 0px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: center;"> Payment Receipt </p>
                          </td>
                      </tr>
                      <tr>
                          <td colspan="2" valign="middle" style="padding: 10px 20px; border-bottom: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              <p
                              style="margin: 0px; padding: 0px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: center;"> ${
                                accEvent.payment_company_name ? accEvent.payment_company_name : ''
                              }</p>
                          </td>
                      </tr>
                      <tr>
                          <td colspan="2" valign="middle" style="padding: 10px 20px; border-bottom: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              <p
                              style="margin: 0px 0 20px; padding: 0px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: center;"><strong>Address:</strong> ${accEvent.payment_company_address.replace(
                                /<\/?p>/g,
                                ' ',
                              )}</p>
                              <p
                              style="margin: 0px 0 20px; padding: 0px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: center;"><strong>GST Registration No.</strong> ${
                                accEvent.GSTRegistrationNumber ? accEvent.GSTRegistrationNumber : ''
                              }</p>
                              <p
                              style="margin: 0px 0 0px; padding: 0px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: center;"><strong>Registered for ${
                                accEvent.event_title ? accEvent.event_title : ''
                              }</strong></p>
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; background-color: #0b2c54; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; color: #ffffff;">
                              Description
                          </td>
                          <td style="padding: 10px 20px; background-color: #0b2c54; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; color: #ffffff;">
                              Amount in INR
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              Registration fee  <br>
                              <span style="font-size: 14px; font-style: italic; color: #666666;">
                              ${dateWisePaymentCategory ? `(${dateWisePaymentCategory})` : ''}
                              (Exclusive of taxes)
                              </span>

                          </td>
                          <td style="padding: 10px 20px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: right;">
                              ${parseFloat(formValues.NetPayableAmount ? formValues.NetPayableAmount : 0).toFixed(2)}
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; color: rgb(27, 160, 27);">
                              Less Coupon discount${discount_coupon ? ` -(${discount_coupon})` : ''}
                          </td>
                          <td style="padding: 10px 20px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: right;">
                          - ${formValues.discountValue ? formValues.discountValue.toFixed(2) : 0}
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              Total:

                          </td>
                          <td style="padding: 10px 20px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: right;">
                              ${parseFloat(
                                parseFloat(formValues.NetPayableAmount ? formValues.NetPayableAmount : 0) -
                                  parseFloat(formValues.discountValue ? formValues.discountValue : 0),
                              ).toFixed(2)}
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                          ${payment[0].additional_charge_two_title}
                          </td>
                          <td style="padding: 10px 20px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: right;">
                          ${
                            Math.round(
                              formValues.total_payable_amount ? formValues.total_payable_amount.toFixed(2) : 0,
                            ) -
                            parseFloat(
                              parseFloat(formValues.NetPayableAmount ? formValues.NetPayableAmount : 0) -
                                parseFloat(formValues.discountValue ? formValues.discountValue : 0),
                            ).toFixed(2)
                          }
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; border-top: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              Amount Paid
                          </td>
                          <td style="padding: 10px 20px; border-top: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; color: rgb(235, 65, 65); text-align: right;">
                          ${Math.round(
                            formValues.total_payable_amount ? formValues.total_payable_amount.toFixed(2) : 0,
                          )}
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>`,
            };
            let emailBody;
            emailBody = replacePlaceholders(payment_email_temp.email_description, placeholders);
            // ctx.body = emailBody;
            // return;
            const mailOptions = {
              from: payment_email_temp.email_from,
              to: email,
              subject: payment_email_temp.email_subject,
              html: `<!DOCTYPE html>
              <html lang="en">
              
              <head>
              <title>${accEvent.event_title}</title>
                  <meta name="viewport"
                      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no" />
              
              </head>
              
              <body>
                  <div style="max-width: 560px; width: 100%; margin: 0 auto;">
                      <table style="width: 100%" cellpadding="0" cellspacing="0"
                          style="font-family: Calibri, 'Gill Sans', 'Trebuchet MS', sans-serif; border: 1px solid #cccccc;">
                          ${emailBody}
                      </table>
                  </div>
              </body>
              
              </html>`,
              attachments: attachment.length > 0 ? attachment : null,
            };
            await transporter.sendMail(mailOptions);
            // ctx.body = {after_discount_value, registrationFee, registrationFeeToBePaid, myC};
            ctx.body = 'email sent!';
          } catch (err) {
            ctx.body = err;
          }
        },
        async groupregistrationEmail(ctx, next) {
          try {
            const { email, password } = await ctx.request.body;
            const getAttendeeURL = `${MEDIQUEST_URL}/group_attendee:get?filter={"attendee_email":"${email}"}&pageSize=1000`;
            const attendeeData = await fetch(getAttendeeURL, {
              method: 'GET',
              headers: {
                Authorization: COLLECTION_AUTH_TOKEN,
              },
            });
            const attendeeDataDataJSON = await attendeeData.json();
            const formValues = attendeeDataDataJSON.data;

            const registration_email_temp = await groupRegistrationEmailTemp();

            const placeholders = {
              banner_image: `<img style = "max-width: 560px;" src=${`${MEDIQUEST_URL_IMG}${registration_email_temp.email_banner_image[0].url}`} alt="" />`,
              full_name: `${formValues.attendee_first_name} ${formValues.attendee_last_name}`,
              backend_url: ACC_ASIA_URL_FULL,
              email: email,
              password: password,
            };
            let emailBody;
            emailBody = replacePlaceholders(registration_email_temp.email_description, placeholders);
            const mailOptions = {
              from: registration_email_temp.email_from,
              to: email,
              subject: registration_email_temp.email_subject,
              html: `<!DOCTYPE html>
              <html lang="en">
              
              <head>
              <title>Group Registration Email</title>
                  <meta name="viewport"
                      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no" />
              
              </head>
              
              <body>
                  <div style="max-width: 560px; width: 100%; margin: 0 auto;">
                      <table style="width: 100%" cellpadding="0" cellspacing="0"
                          style="font-family: Calibri, 'Gill Sans', 'Trebuchet MS', sans-serif; border: 1px solid #cccccc;">
                          ${emailBody}
                      </table>
                  </div>
              </body>
              
              </html>`,
            };
            await transporter.sendMail(mailOptions);
            try {
              await sendEmailToSupport(email, formValues.id, password);
            } catch (err) {
              ctx.body = err;
            }
            ctx.body = 'group registration email sent!';
          } catch (err) {
            ctx.body = err;
          }
        },
        async groupPaymentEmailBackend(ctx, next) {
          try {
            const { email, groupAttendeeId, password } = await ctx.request.body;
            const getAttendeeURL = `${MEDIQUEST_URL}/group_attendee:get?filterByTk=${parseInt(
              groupAttendeeId,
            )}&pageSize=1000`;
            const attendeeData = await fetch(getAttendeeURL, {
              method: 'GET',
              headers: {
                Authorization: COLLECTION_AUTH_TOKEN,
              },
            });
            const attendeeDataDataJSON = await attendeeData.json();
            const formValues = attendeeDataDataJSON.data;

            const AllEventsUrl = `${MEDIQUEST_URL}event:get?filterByTk=${formValues.eventId}&pageSize=100&appends%5B%5D=event_banner&appends%5B%5D=venue&appends%5B%5D=faculty&appends%5B%5D=agenda&appends%5B%5D=attendee&appends%5B%5D=createdBy&appends%5B%5D=updatedBy&appends%5B%5D=event_card_image&appends%5B%5D=chairpersons&appends%5B%5D=intl_faculty&filter=%7B%7D`;
            const AllEvent = await fetch(AllEventsUrl, {
              method: 'GET',
              headers: {
                Authorization: COLLECTION_AUTH_TOKEN,
              },
            });
            const AllEventDataJSON = await AllEvent.json();
            const accEvent = AllEventDataJSON.data;

            const payment_email_temp = await groupRegistrationBackendEmailTemp();
            const placeholders = {
              full_name: `${formValues.attendee_first_name} ${formValues.attendee_last_name}`,
              comapny_name: formValues.attendee_company_name,
              email: email,
              contact_number: formValues.attendee_contact_number,
              url: ACC_ASIA_URL_FULL,
              password: password,
            };
            let emailBody;
            emailBody = replacePlaceholders(payment_email_temp.email_description, placeholders);
            // ctx.body = emailBody;
            // return;
            const mailOptions = {
              from: payment_email_temp.email_from,
              to: payment_email_temp.email_to,
              subject: payment_email_temp.email_subject,
              html: `<!DOCTYPE html>
              <html lang="en">
              
              <head>
              <title>${accEvent.event_title}</title>
                  <meta name="viewport"
                      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no" />
              
              </head>
              
              <body>
                  <div style="max-width: 560px; width: 100%; margin: 0 auto;">
                      <table style="width: 100%" cellpadding="0" cellspacing="0"
                          style="font-family: Calibri, 'Gill Sans', 'Trebuchet MS', sans-serif; border: 1px solid #cccccc;">
                          ${emailBody}
                      </table>
                  </div>
              </body>
              
              </html>`,
            };
            await transporter.sendMail(mailOptions);
            // ctx.body = {after_discount_value, registrationFee, registrationFeeToBePaid, myC};
            ctx.body = 'email sent to support!';
          } catch (err) {
            ctx.body = err;
          }
        },
        async groupPaymentConfirmationEmailBackend(ctx, next) {
          try {
            const { email, groupAttendeeId } = await ctx.request.body;
            const getAttendeeURL = `${MEDIQUEST_URL}/group_attendee:get?filterByTk=${parseInt(
              groupAttendeeId,
            )}&pageSize=1000`;
            const attendeeData = await fetch(getAttendeeURL, {
              method: 'GET',
              headers: {
                Authorization: COLLECTION_AUTH_TOKEN,
              },
            });
            const attendeeDataDataJSON = await attendeeData.json();
            const formValues = attendeeDataDataJSON.data;

            const AllEventsUrl = `${MEDIQUEST_URL}event:get?filterByTk=${formValues.eventId}&pageSize=100&appends%5B%5D=event_banner&appends%5B%5D=venue&appends%5B%5D=faculty&appends%5B%5D=agenda&appends%5B%5D=attendee&appends%5B%5D=createdBy&appends%5B%5D=updatedBy&appends%5B%5D=event_card_image&appends%5B%5D=chairpersons&appends%5B%5D=intl_faculty&filter=%7B%7D`;
            const AllEvent = await fetch(AllEventsUrl, {
              method: 'GET',
              headers: {
                Authorization: COLLECTION_AUTH_TOKEN,
              },
            });
            const AllEventDataJSON = await AllEvent.json();
            const accEvent = AllEventDataJSON.data;

            const payment_email_temp = await groupPaymentBackendEmailTemp();
            const placeholders = {
              full_name: `${formValues.attendee_first_name} ${formValues.attendee_last_name}`,
              comapny_name: formValues.attendee_company_name,
              email: email,
              contact_number: formValues.attendee_contact_number,
            };
            let emailBody;
            emailBody = replacePlaceholders(payment_email_temp.email_description, placeholders);
            // ctx.body = emailBody;
            // return;
            const mailOptions = {
              from: payment_email_temp.email_from,
              to: payment_email_temp.email_to,
              subject: payment_email_temp.email_subject,
              html: `<!DOCTYPE html>
              <html lang="en">
              
              <head>
              <title>${accEvent.event_title}</title>
                  <meta name="viewport"
                      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no" />
              
              </head>
              
              <body>
                  <div style="max-width: 560px; width: 100%; margin: 0 auto;">
                      <table style="width: 100%" cellpadding="0" cellspacing="0"
                          style="font-family: Calibri, 'Gill Sans', 'Trebuchet MS', sans-serif; border: 1px solid #cccccc;">
                          ${emailBody}
                      </table>
                  </div>
              </body>
              
              </html>`,
            };
            await transporter.sendMail(mailOptions);
            // ctx.body = {after_discount_value, registrationFee, registrationFeeToBePaid, myC};
            ctx.body = 'payment email sent to support!';
          } catch (err) {
            ctx.body = err;
          }
        },
        async groupInvoiceRequest(ctx, next) {
          // to be modified
          try {
            const { email, groupAttendeeId } = await ctx.request.body;
            const getAttendeeURL = `${MEDIQUEST_URL}/group_attendee:get?filterByTk=${parseInt(
              groupAttendeeId,
            )}&pageSize=1000`;
            const attendeeData = await fetch(getAttendeeURL, {
              method: 'GET',
              headers: {
                Authorization: COLLECTION_AUTH_TOKEN,
              },
            });
            const attendeeDataDataJSON = await attendeeData.json();
            const formValues = attendeeDataDataJSON.data;

            const AllEventsUrl = `${MEDIQUEST_URL}event:get?filterByTk=${formValues.eventId}&pageSize=100&appends%5B%5D=event_banner&appends%5B%5D=venue&appends%5B%5D=faculty&appends%5B%5D=agenda&appends%5B%5D=attendee&appends%5B%5D=createdBy&appends%5B%5D=updatedBy&appends%5B%5D=event_card_image&appends%5B%5D=chairpersons&appends%5B%5D=intl_faculty&filter=%7B%7D`;
            const AllEvent = await fetch(AllEventsUrl, {
              method: 'GET',
              headers: {
                Authorization: COLLECTION_AUTH_TOKEN,
              },
            });
            const AllEventDataJSON = await AllEvent.json();
            const accEvent = AllEventDataJSON.data;

            const discount_coupon = formValues.discount_coupon_used ? formValues.discount_coupon_used : '';
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
              if (i.category_name == formValues.attendee_payment_categorgy_selected) {
                if (curDate <= new Date(i.early_bird_date)) {
                  if (formValues.countryId == 102) {
                    // toPay = i.early_bird_inr;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.early_rate_membership_rupees;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.early_bird_title;
                    } else {
                      toPay = i.early_bird_inr;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.early_bird_title;
                    }
                    curPaymentMethod = i;
                    // curPaymentCategory = `${accEvent.early_bird_title}`;
                    if (i.service_rupees != null && i.service_rupees != undefined && i.service_rupees != '') {
                      serviceCharge = i.service_rupees;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_rupees != null &&
                      i.transaction_rupees != undefined &&
                      i.transaction_rupees != ''
                    ) {
                      transactionCharge = i.transaction_rupees;
                    } else {
                      transactionCharge = 0;
                    }
                  } else {
                    // toPay = i.payment_amount;
                    // toPay = i.early_bird_inr;
                    // curPaymentCategory = `${accEvent.early_bird_title}`;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.early_rate_membership_rupees;
                      // curPaymentCategory = `${accEvent.early_bird_title} ${accEvent.payment_category_subs_text}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.early_bird_title;
                    } else {
                      toPay = i.early_bird_inr;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.early_bird_title;
                    }
                    curPaymentMethod = i;
                    if (i.service_dollars != null && i.service_dollars != undefined && i.service_dollars != '') {
                      serviceCharge = i.service_dollars;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_dollars != null &&
                      i.transaction_dollars != undefined &&
                      i.transaction_dollars != ''
                    ) {
                      transactionCharge = i.transaction_dollars;
                    } else {
                      transactionCharge = 0;
                    }
                  }
                } else if (curDate > new Date(i.early_bird_date) && curDate <= new Date(i.advanced_date)) {
                  if (formValues.countryId == 102) {
                    // toPay = i.advanced_rate_inr;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.advanced_rate_membership_rupees;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.advanced_title;
                    } else {
                      toPay = i.advanced_rate_inr;
                      // curPaymentCategory = `${accEvent.advanced_title}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.advanced_title;
                    }
                    curPaymentMethod = i;
                    // curPaymentCategory = `${accEvent.advanced_title}`;
                    if (i.service_rupees != null && i.service_rupees != undefined && i.service_rupees != '') {
                      serviceCharge = i.service_rupees;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_rupees != null &&
                      i.transaction_rupees != undefined &&
                      i.transaction_rupees != ''
                    ) {
                      transactionCharge = i.transaction_rupees;
                    } else {
                      transactionCharge = 0;
                    }
                  } else {
                    // toPay = i.advanced_rate;
                    // toPay = i.advanced_rate_inr;
                    // curPaymentCategory = `${accEvent.advanced_title}`;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.advanced_rate_membership_rupees;
                      // curPaymentCategory = `${accEvent.advanced_title} ${accEvent.payment_category_subs_text}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.advanced_title;
                    } else {
                      toPay = i.advanced_rate_inr;
                      // curPaymentCategory = `${accEvent.advanced_title}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.advanced_title;
                    }
                    curPaymentMethod = i;
                    if (i.service_dollars != null && i.service_dollars != undefined && i.service_dollars != '') {
                      serviceCharge = i.service_dollars;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_dollars != null &&
                      i.transaction_dollars != undefined &&
                      i.transaction_dollars != ''
                    ) {
                      transactionCharge = i.transaction_dollars;
                    } else {
                      transactionCharge = 0;
                    }
                  }
                } else {
                  if (formValues.countryId == 102) {
                    // toPay = i.regular_rate_inr;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.regular_rate_membership_rupees;
                      // curPaymentCategory = `${accEvent.regular_title} ${accEvent.payment_category_subs_text}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.regular_title;
                    } else {
                      toPay = i.regular_rate_inr;
                      // curPaymentCategory = `${accEvent.regular_title}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.regular_title;
                    }
                    curPaymentMethod = i;
                    if (i.service_rupees != null && i.service_rupees != undefined && i.service_rupees != '') {
                      serviceCharge = i.service_rupees;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_rupees != null &&
                      i.transaction_rupees != undefined &&
                      i.transaction_rupees != ''
                    ) {
                      transactionCharge = i.transaction_rupees;
                    } else {
                      transactionCharge = 0;
                    }
                  } else {
                    // toPay = i.regular_rate;
                    // toPay = i.regular_rate_inr;
                    if (formValues.attendee_membership == 'yes') {
                      toPay = i.regular_rate_membership_rupees;
                      // curPaymentCategory = `${accEvent.regular_title} ${accEvent.payment_category_subs_text}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected} + ${accEvent.payment_category_subs_text}`;
                      dateWisePaymentCategory = accEvent.regular_title;
                    } else {
                      toPay = i.regular_rate_inr;
                      // curPaymentCategory = `${accEvent.regular_title}`;
                      curPaymentCategory = `${formValues.attendee_payment_categorgy_selected}`;
                      dateWisePaymentCategory = accEvent.regular_title;
                    }
                    curPaymentMethod = i;
                    if (i.service_dollars != null && i.service_dollars != undefined && i.service_dollars != '') {
                      serviceCharge = i.service_dollars;
                    } else {
                      serviceCharge = 0;
                    }
                    if (
                      i.transaction_dollars != null &&
                      i.transaction_dollars != undefined &&
                      i.transaction_dollars != ''
                    ) {
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
            // ctx.body = dateWisePaymentCategory;
            // return;
            const payment_email_temp = await groupInvoiceRequestBackendEmailTemp(formValues.eventId);
            const placeholders = {
              banner_image: `<img style = "max-width: 560px;" src=${
                payment_email_temp &&
                payment_email_temp.email_banner_image.length > 0 &&
                payment_email_temp.email_banner_image[0].url
                  ? `${MEDIQUEST_URL_IMG}${payment_email_temp.email_banner_image[0].url}`
                  : ''
              } alt="" />`,
              full_name: `${formValues.attendee_first_name} ${formValues.attendee_last_name}`,
              company_name: formValues.attendee_company_name,
              payment_table: `<tr>
              <td colspan="2" valign="middle" style="padding-left: 0px; padding-right: 0px; background-color: #f6f6f6; border: 1px solid #cccccc;">
                  <table width="100%" style="border-collapse: collapse;">
                      <tr>
                          <td colspan="2" valign="middle" style="padding: 10px 20px; border-bottom: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              <p
                              style="margin: 0px; padding: 0px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: center;"> Payment Receipt </p>
                          </td>
                      </tr>
                      <tr>
                          <td colspan="2" valign="middle" style="padding: 10px 20px; border-bottom: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              <p
                              style="margin: 0px; padding: 0px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: center;"> ${
                                accEvent.payment_company_name ? accEvent.payment_company_name : ''
                              }</p>
                          </td>
                      </tr>
                      <tr>
                          <td colspan="2" valign="middle" style="padding: 10px 20px; border-bottom: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              <p
                              style="margin: 0px 0 20px; padding: 0px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: center;"><strong>Address:</strong> ${accEvent.payment_company_address.replace(
                                /<\/?p>/g,
                                ' ',
                              )}</p>
                              <p
                              style="margin: 0px 0 20px; padding: 0px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: center;"><strong>GST Registration No.</strong> ${
                                accEvent.GSTRegistrationNumber ? accEvent.GSTRegistrationNumber : ''
                              }</p>
                              <p
                              style="margin: 0px 0 0px; padding: 0px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: center;"><strong>Registered for ${
                                accEvent.event_title ? accEvent.event_title : ''
                              }</strong></p>
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; background-color: #0b2c54; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; color: #ffffff;">
                              Description
                          </td>
                          <td style="padding: 10px 20px; background-color: #0b2c54; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; color: #ffffff;">
                              Amount in INR
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              Registration fee  <br>
                              <span style="font-size: 14px; font-style: italic; color: #666666;">
                              ${dateWisePaymentCategory ? `(${dateWisePaymentCategory})` : ''}
                              (Exclusive of taxes)
                              </span>

                          </td>
                          <td style="padding: 10px 20px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: right;">
                              ${parseFloat(formValues.NetPayableAmount ? formValues.NetPayableAmount : 0).toFixed(2)}
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; color: rgb(27, 160, 27);">
                              Less Coupon discount${discount_coupon ? ` -(${discount_coupon})` : ''}
                          </td>
                          <td style="padding: 10px 20px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: right;">
                          - ${formValues.discountValue ? formValues.discountValue.toFixed(2) : 0}
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              Total:

                          </td>
                          <td style="padding: 10px 20px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: right;">
                              ${parseFloat(
                                parseFloat(formValues.NetPayableAmount ? formValues.NetPayableAmount : 0) -
                                  parseFloat(formValues.discountValue ? formValues.discountValue : 0),
                              ).toFixed(2)}
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                          ${payment[0].additional_charge_two_title}
                          </td>
                          <td style="padding: 10px 20px; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; text-align: right;">
                          ${
                            Math.round(
                              formValues.total_payable_amount ? formValues.total_payable_amount.toFixed(2) : 0,
                            ) -
                            parseFloat(
                              parseFloat(formValues.NetPayableAmount ? formValues.NetPayableAmount : 0) -
                                parseFloat(formValues.discountValue ? formValues.discountValue : 0),
                            ).toFixed(2)
                          }
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px; border-right: 1px solid #cccccc; border-top: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px;">
                              Amount Paid
                          </td>
                          <td style="padding: 10px 20px; border-top: 1px solid #cccccc; font-family: 'Gill Sans', Calibri, 'Trebuchet MS', sans-serif; font-size: 16px; color: rgb(235, 65, 65); text-align: right;">
                          ${Math.round(
                            formValues.total_payable_amount ? formValues.total_payable_amount.toFixed(2) : 0,
                          )}
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>`,
            };

            // ctx.body = placeholders;
            // return;

            let emailBody;
            emailBody = replacePlaceholders(payment_email_temp.email_description, placeholders);
            const subjectPlacehoders = {
              event_name: accEvent.event_title,
            };
            const subject = replacePlaceholders(payment_email_temp.email_subject, subjectPlacehoders);
            // ctx.body = emailBody;
            // return;
            const mailOptions = {
              from: payment_email_temp.email_from,
              to: payment_email_temp.email_to,
              subject: subject,
              html: `<!DOCTYPE html>
              <html lang="en">
              
              <head>
              <title>${accEvent.event_title}</title>
                  <meta name="viewport"
                      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no" />
              
              </head>
              
              <body>
                  <div style="max-width: 560px; width: 100%; margin: 0 auto;">
                      <table style="width: 100%" cellpadding="0" cellspacing="0"
                          style="font-family: Calibri, 'Gill Sans', 'Trebuchet MS', sans-serif; border: 1px solid #cccccc;">
                          ${emailBody}
                      </table>
                  </div>
              </body>
              
              </html>`,
            };
            await transporter.sendMail(mailOptions);
            // ctx.body = {after_discount_value, registrationFee, registrationFeeToBePaid, myC};
            ctx.body = 'invoice email sent!';
          } catch (err) {
            ctx.body = err;
          }
        },
        async groupSendInvoice(ctx, next) {
          try {
            const { email, groupAttendeeId } = await ctx.request.body;
            const getAttendeeURL = `${MEDIQUEST_URL}/group_attendee:get?filterByTk=${parseInt(
              groupAttendeeId,
            )}&pageSize=1000&appends%5B%5D=Invoice
            `;
            const attendeeData = await fetch(getAttendeeURL, {
              method: 'GET',
              headers: {
                Authorization: COLLECTION_AUTH_TOKEN,
              },
            });
            const attendeeDataDataJSON = await attendeeData.json();
            const formValues = attendeeDataDataJSON.data;

            const attachment = [];
            if (formValues.Invoice.length > 0) {
              formValues.Invoice.map((obj) => {
                const newObj = {
                  filename: obj.filename,
                  path: `${MEDIQUEST_URL_IMG}${obj.url}`,
                };
                attachment.push(newObj);
              });
            }

            const AllEventsUrl = `${MEDIQUEST_URL}event:get?filterByTk=${formValues.eventId}&pageSize=100&appends%5B%5D=event_banner&appends%5B%5D=venue&appends%5B%5D=faculty&appends%5B%5D=agenda&appends%5B%5D=attendee&appends%5B%5D=createdBy&appends%5B%5D=updatedBy&appends%5B%5D=event_card_image&appends%5B%5D=chairpersons&appends%5B%5D=intl_faculty&filter=%7B%7D`;
            const AllEvent = await fetch(AllEventsUrl, {
              method: 'GET',
              headers: {
                Authorization: COLLECTION_AUTH_TOKEN,
              },
            });
            const AllEventDataJSON = await AllEvent.json();
            const accEvent = AllEventDataJSON.data;

            const payment_email_temp = await groupSendInvoiceEmailTemp(formValues.eventId);
            const placeholders = {
              banner_image: `<img style = "max-width: 560px;" src=${`${MEDIQUEST_URL_IMG}${payment_email_temp.email_banner_image[0].url}`} alt="" />`,
              full_name: `${formValues.attendee_first_name} ${formValues.attendee_last_name}`,
              reply: formValues.reply ? formValues.reply : '',
              event_name: accEvent.event_title,
            };
            let emailBody;
            emailBody = replacePlaceholders(payment_email_temp.email_description, placeholders);
            const subjectPlacehoders = {
              event_name: accEvent.event_title,
            };
            const subject = replacePlaceholders(payment_email_temp.email_subject, subjectPlacehoders);
            // ctx.body = emailBody;
            // return;
            const mailOptions = {
              from: payment_email_temp.email_from,
              to: email,
              subject: subject,
              html: `<!DOCTYPE html>
              <html lang="en">
              
              <head>
              <title>${accEvent.event_title}</title>
                  <meta name="viewport"
                      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no" />
              
              </head>
              
              <body>
                  <div style="max-width: 560px; width: 100%; margin: 0 auto;">
                      <table style="width: 100%" cellpadding="0" cellspacing="0"
                          style="font-family: Calibri, 'Gill Sans', 'Trebuchet MS', sans-serif; border: 1px solid #cccccc;">
                          ${emailBody}
                      </table>
                  </div>
              </body>
              
              </html>`,
              attachments: attachment ? attachment : null,
            };
            await transporter.sendMail(mailOptions);
            // ctx.body = {after_discount_value, registrationFee, registrationFeeToBePaid, myC};
            ctx.body = 'invoice email sent!';
          } catch (err) {
            ctx.body = err;
          }
        },
        async groupPaymentProofAttached(ctx, next) {
          try {
            const { email, groupAttendeeId } = await ctx.request.body;
            const getAttendeeURL = `${MEDIQUEST_URL}/group_attendee:get?filterByTk=${parseInt(
              groupAttendeeId,
            )}&pageSize=1000&appends%5B%5D=payment_proof&appends%5B%5D=new_payment_proof
            `;
            const attendeeData = await fetch(getAttendeeURL, {
              method: 'GET',
              headers: {
                Authorization: COLLECTION_AUTH_TOKEN,
              },
            });
            const attendeeDataDataJSON = await attendeeData.json();
            const formValues = attendeeDataDataJSON.data;

            const attachment = [];
            if (formValues.new_payment_proof.length > 0) {
              formValues.new_payment_proof.map((obj) => {
                const newObj = {
                  filename: obj.filename,
                  path: `${MEDIQUEST_URL_IMG}${obj.url}`,
                };
                attachment.push(newObj);
              });
            } else {
              if (formValues.payment_proof.length > 0) {
                formValues.payment_proof.map((obj) => {
                  const newObj = {
                    filename: obj.filename,
                    path: `${MEDIQUEST_URL_IMG}${obj.url}`,
                  };
                  attachment.push(newObj);
                });
              }
            }

            const AllEventsUrl = `${MEDIQUEST_URL}event:get?filterByTk=${formValues.eventId}&pageSize=100&appends%5B%5D=event_banner&appends%5B%5D=venue&appends%5B%5D=faculty&appends%5B%5D=agenda&appends%5B%5D=attendee&appends%5B%5D=createdBy&appends%5B%5D=updatedBy&appends%5B%5D=event_card_image&appends%5B%5D=chairpersons&appends%5B%5D=intl_faculty&filter=%7B%7D`;
            const AllEvent = await fetch(AllEventsUrl, {
              method: 'GET',
              headers: {
                Authorization: COLLECTION_AUTH_TOKEN,
              },
            });
            const AllEventDataJSON = await AllEvent.json();
            const accEvent = AllEventDataJSON.data;

            const payment_email_temp = await groupPaymentProofEmailTemp(formValues.eventId);
            const placeholders = {
              banner_image: `<img style = "max-width: 560px;" src=${`${MEDIQUEST_URL_IMG}${payment_email_temp.email_banner_image[0].url}`} alt="" />`,
              full_name: `${formValues.attendee_first_name} ${formValues.attendee_last_name}`,
              payment_proof_text: formValues.payment_proof_text ? formValues.payment_proof_text : '',
              event_name: accEvent.event_title,
            };
            let emailBody;
            emailBody = replacePlaceholders(payment_email_temp.email_description, placeholders);
            const subjectPlacehoders = {
              event_name: accEvent.event_title,
            };
            const subject = replacePlaceholders(payment_email_temp.email_subject, subjectPlacehoders);
            // ctx.body = emailBody;
            // return;
            const mailOptions = {
              from: payment_email_temp.email_from,
              to: email,
              subject: subject,
              html: `<!DOCTYPE html>
              <html lang="en">
              
              <head>
              <title>${accEvent.event_title}</title>
                  <meta name="viewport"
                      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no" />
              
              </head>
              
              <body>
                  <div style="max-width: 560px; width: 100%; margin: 0 auto;">
                      <table style="width: 100%" cellpadding="0" cellspacing="0"
                          style="font-family: Calibri, 'Gill Sans', 'Trebuchet MS', sans-serif; border: 1px solid #cccccc;">
                          ${emailBody}
                      </table>
                  </div>
              </body>
              
              </html>`,
              attachments: attachment ? attachment : null,
            };
            await transporter.sendMail(mailOptions);
            // ctx.body = {after_discount_value, registrationFee, registrationFeeToBePaid, myC};
            ctx.body = 'payment proof email sent!';
          } catch (err) {
            ctx.body = err;
          }
        },
        async groupPaymentProofAttachedBackend(ctx, next) {
          try {
            const { email, groupAttendeeId } = await ctx.request.body;
            const getAttendeeURL = `${MEDIQUEST_URL}/group_attendee:get?filterByTk=${parseInt(
              groupAttendeeId,
            )}&pageSize=1000&appends%5B%5D=payment_proof&appends%5B%5D=new_payment_proof
            `;
            const attendeeData = await fetch(getAttendeeURL, {
              method: 'GET',
              headers: {
                Authorization: COLLECTION_AUTH_TOKEN,
              },
            });
            const attendeeDataDataJSON = await attendeeData.json();
            const formValues = attendeeDataDataJSON.data;

            const attachment = [];
            if (formValues.new_payment_proof.length > 0) {
              formValues.new_payment_proof.map((obj) => {
                const newObj = {
                  filename: obj.filename,
                  path: `${MEDIQUEST_URL_IMG}${obj.url}`,
                };
                attachment.push(newObj);
              });
            } else {
              if (formValues.payment_proof.length > 0) {
                formValues.payment_proof.map((obj) => {
                  const newObj = {
                    filename: obj.filename,
                    path: `${MEDIQUEST_URL_IMG}${obj.url}`,
                  };
                  attachment.push(newObj);
                });
              }
            }

            const AllEventsUrl = `${MEDIQUEST_URL}event:get?filterByTk=${formValues.eventId}&pageSize=100&appends%5B%5D=event_banner&appends%5B%5D=venue&appends%5B%5D=faculty&appends%5B%5D=agenda&appends%5B%5D=attendee&appends%5B%5D=createdBy&appends%5B%5D=updatedBy&appends%5B%5D=event_card_image&appends%5B%5D=chairpersons&appends%5B%5D=intl_faculty&filter=%7B%7D`;
            const AllEvent = await fetch(AllEventsUrl, {
              method: 'GET',
              headers: {
                Authorization: COLLECTION_AUTH_TOKEN,
              },
            });
            const AllEventDataJSON = await AllEvent.json();
            const accEvent = AllEventDataJSON.data;

            const payment_email_temp = await groupPaymentProofBackendEmailTemp(formValues.eventId);
            const placeholders = {
              banner_image: `<img style = "max-width: 560px;" src=${`${MEDIQUEST_URL_IMG}${payment_email_temp.email_banner_image[0].url}`} alt="" />`,
              company_name: formValues.attendee_company_name ? formValues.attendee_company_name : '',
              full_name: `${formValues.attendee_first_name} ${formValues.attendee_last_name}`,
              payment_proof_text: formValues.payment_proof_text ? formValues.payment_proof_text : '',
              event_name: accEvent.event_title,
            };
            let emailBody;
            emailBody = replacePlaceholders(payment_email_temp.email_description, placeholders);
            const subjectPlacehoders = {
              event_name: accEvent.event_title,
            };
            const subject = replacePlaceholders(payment_email_temp.email_subject, subjectPlacehoders);
            // ctx.body = emailBody;
            // return;
            const mailOptions = {
              from: payment_email_temp.email_from,
              to: payment_email_temp.email_to,
              subject: subject,
              html: `<!DOCTYPE html>
              <html lang="en">
              
              <head>
              <title>${accEvent.event_title}</title>
                  <meta name="viewport"
                      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no" />
              
              </head>
              
              <body>
                  <div style="max-width: 560px; width: 100%; margin: 0 auto;">
                      <table style="width: 100%" cellpadding="0" cellspacing="0"
                          style="font-family: Calibri, 'Gill Sans', 'Trebuchet MS', sans-serif; border: 1px solid #cccccc;">
                          ${emailBody}
                      </table>
                  </div>
              </body>
              
              </html>`,
              attachments: attachment ? attachment : null,
            };
            await transporter.sendMail(mailOptions);
            // ctx.body = {after_discount_value, registrationFee, registrationFeeToBePaid, myC};
            ctx.body = 'payment proof notification sent!';
          } catch (err) {
            ctx.body = err;
          }
        },
        async groupPaymentProofApproved(ctx, next) {
          try {
            const { email, groupAttendeeId } = await ctx.request.body;
            const getAttendeeURL = `${MEDIQUEST_URL}/group_attendee:get?filterByTk=${parseInt(
              groupAttendeeId,
            )}&pageSize=1000&appends%5B%5D=payment_proof&appends%5B%5D=new_payment_proof
            `;
            const attendeeData = await fetch(getAttendeeURL, {
              method: 'GET',
              headers: {
                Authorization: COLLECTION_AUTH_TOKEN,
              },
            });
            const attendeeDataDataJSON = await attendeeData.json();
            const formValues = attendeeDataDataJSON.data;

            const AllEventsUrl = `${MEDIQUEST_URL}event:get?filterByTk=${formValues.eventId}&pageSize=100&appends%5B%5D=event_banner&appends%5B%5D=venue&appends%5B%5D=faculty&appends%5B%5D=agenda&appends%5B%5D=attendee&appends%5B%5D=createdBy&appends%5B%5D=updatedBy&appends%5B%5D=event_card_image&appends%5B%5D=chairpersons&appends%5B%5D=intl_faculty&filter=%7B%7D`;
            const AllEvent = await fetch(AllEventsUrl, {
              method: 'GET',
              headers: {
                Authorization: COLLECTION_AUTH_TOKEN,
              },
            });
            const AllEventDataJSON = await AllEvent.json();
            const accEvent = AllEventDataJSON.data;

            const payment_email_temp = await groupPaymentProofApprovedEmailTemp(formValues.eventId);
            const placeholders = {
              banner_image: `<img style = "max-width: 560px;" src=${`${MEDIQUEST_URL_IMG}${payment_email_temp.email_banner_image[0].url}`} alt="" />`,
              company_name: formValues.attendee_company_name ? formValues.attendee_company_name : '',
              full_name: `${formValues.attendee_first_name} ${formValues.attendee_last_name}`,
              event_name: accEvent.event_title ? accEvent.event_title : '',
            };
            let emailBody;
            emailBody = replacePlaceholders(payment_email_temp.email_description, placeholders);
            const subjectPlacehoders = {
              event_name: accEvent.event_title,
            };
            const subject = replacePlaceholders(payment_email_temp.email_subject, subjectPlacehoders);
            // ctx.body = emailBody;
            // return;
            const mailOptions = {
              from: payment_email_temp.email_from,
              to: email,
              subject: subject,
              html: `<!DOCTYPE html>
              <html lang="en">
              
              <head>
              <title>${accEvent.event_title}</title>
                  <meta name="viewport"
                      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no" />
              
              </head>
              
              <body>
                  <div style="max-width: 560px; width: 100%; margin: 0 auto;">
                      <table style="width: 100%" cellpadding="0" cellspacing="0"
                          style="font-family: Calibri, 'Gill Sans', 'Trebuchet MS', sans-serif; border: 1px solid #cccccc;">
                          ${emailBody}
                      </table>
                  </div>
              </body>
              
              </html>`,
            };
            await transporter.sendMail(mailOptions);
            // ctx.body = {after_discount_value, registrationFee, registrationFeeToBePaid, myC};
            ctx.body = 'payment proof notification sent!';
          } catch (err) {
            ctx.body = err;
          }
        },
        async queryRegistration(ctx, next) {
          try {
            const { queryId } = await ctx.request.body;
            const getAttendeeURL = `${MEDIQUEST_URL}/helpAndSupport:get?filterByTk=${parseInt(queryId)}&pageSize=1000`;
            const attendeeData = await fetch(getAttendeeURL, {
              method: 'GET',
              headers: {
                Authorization: COLLECTION_AUTH_TOKEN,
              },
            });
            const attendeeDataDataJSON = await attendeeData.json();
            const formValues = attendeeDataDataJSON.data;

            const payment_email_temp = await queryRegistrationTemp();
            const placeholders = {
              banner_image: `<img style = "max-width: 560px;" src=${
                payment_email_temp.email_banner_image &&
                payment_email_temp.email_banner_image.length > 0 &&
                payment_email_temp.email_banner_image[0].url
                  ? `${MEDIQUEST_URL_IMG}${payment_email_temp.email_banner_image[0].url}`
                  : ''
              } alt="" />`,
              full_name: formValues.registered_name,
              request_no: formValues.request_no,
              registered_name: formValues.registered_name,
              event_name: formValues.event_name,
              queries: formValues.queries,
              othersQuery: formValues.othersQuery ? `Message: ${formValues.othersQuery}` : '',
              status: formValues.status,
            };
            let emailBody;
            emailBody = replacePlaceholders(payment_email_temp.email_description, placeholders);
            const subjectPlacehoders = {
              event_name: formValues.event_name,
              request_no: formValues.request_no,
            };
            const subject = replacePlaceholders(payment_email_temp.email_subject, subjectPlacehoders);
            // ctx.body = emailBody;
            // return;
            const mailOptions = {
              from: payment_email_temp.email_from,
              to: formValues.registered_email,
              subject: subject ? subject : payment_email_temp.email_subject,
              html: `<!DOCTYPE html>
              <html lang="en">
              
              <head>
              <title>Email Temp</title>
                  <meta name="viewport"
                      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no" />
              
              </head>
              
              <body>
                  <div style="max-width: 560px; width: 100%; margin: 0 auto;">
                      <table style="width: 100%" cellpadding="0" cellspacing="0"
                          style="font-family: Calibri, 'Gill Sans', 'Trebuchet MS', sans-serif; border: 1px solid #cccccc;">
                          ${emailBody}
                      </table>
                  </div>
              </body>
              
              </html>`,
            };
            await transporter.sendMail(mailOptions);
            // ctx.body = {after_discount_value, registrationFee, registrationFeeToBePaid, myC};
            ctx.body = 'email sent from support!!';
          } catch (err) {
            ctx.body = err;
          }
        },
        async queryRegistrationBackend(ctx, next) {
          try {
            const { queryId } = await ctx.request.body;
            const getAttendeeURL = `${MEDIQUEST_URL}/helpAndSupport:get?filterByTk=${parseInt(queryId)}&pageSize=1000`;
            const attendeeData = await fetch(getAttendeeURL, {
              method: 'GET',
              headers: {
                Authorization: COLLECTION_AUTH_TOKEN,
              },
            });
            const attendeeDataDataJSON = await attendeeData.json();
            const formValues = attendeeDataDataJSON.data;

            const payment_email_temp = await queryRegistrationBackendTemp();
            const placeholders = {
              banner_image: `<img style = "max-width: 560px;" src=${
                payment_email_temp.email_banner_image &&
                payment_email_temp.email_banner_image.length > 0 &&
                payment_email_temp.email_banner_image[0].url
                  ? `${MEDIQUEST_URL_IMG}${payment_email_temp.email_banner_image[0].url}`
                  : ''
              } alt="" />`,
              request_no: formValues.request_no,
              registered_name: formValues.registered_name,
              event_name: formValues.event_name,
              queries: formValues.queries,
              othersQuery: formValues.othersQuery ? `Message: ${formValues.othersQuery}` : '',
              status: formValues.status,
            };
            let emailBody;
            emailBody = replacePlaceholders(payment_email_temp.email_description, placeholders);
            const subjectPlacehoders = {
              event_name: formValues.event_name,
              request_no: formValues.request_no,
            };
            const subject = replacePlaceholders(payment_email_temp.email_subject, subjectPlacehoders);
            // ctx.body = emailBody;
            // return;
            const mailOptions = {
              from: payment_email_temp.email_from,
              to: payment_email_temp.email_to,
              subject: subject ? subject : payment_email_temp.email_subject,
              html: `<!DOCTYPE html>
              <html lang="en">
              
              <head>
              <title>Email Temp</title>
                  <meta name="viewport"
                      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no" />
              
              </head>
              
              <body>
                  <div style="max-width: 560px; width: 100%; margin: 0 auto;">
                      <table style="width: 100%" cellpadding="0" cellspacing="0"
                          style="font-family: Calibri, 'Gill Sans', 'Trebuchet MS', sans-serif; border: 1px solid #cccccc;">
                          ${emailBody}
                      </table>
                  </div>
              </body>
              
              </html>`,
            };
            await transporter.sendMail(mailOptions);
            // ctx.body = {after_discount_value, registrationFee, registrationFeeToBePaid, myC};
            ctx.body = 'email sent from support!!';
          } catch (err) {
            ctx.body = err;
          }
        },
        async queryReplyBackend(ctx, next) {
          try {
            const { queryId } = await ctx.request.body;
            const getAttendeeURL = `${MEDIQUEST_URL}/helpAndSupport:get?filterByTk=${parseInt(
              queryId,
            )}&appends%5B%5D=attachment&pageSize=1000`;
            const attendeeData = await fetch(getAttendeeURL, {
              method: 'GET',
              headers: {
                Authorization: COLLECTION_AUTH_TOKEN,
              },
            });
            const attendeeDataDataJSON = await attendeeData.json();
            const formValues = attendeeDataDataJSON.data;
            const attachment = [];
            if (formValues.attachment.length > 0) {
              formValues.attachment.map((obj) => {
                const newObj = {
                  filename: obj.filename,
                  path: `${MEDIQUEST_URL_IMG}${obj.url}`,
                };
                attachment.push(newObj);
              });
            }

            const payment_email_temp = await queryReplyTemp();
            const placeholders = {
              banner_image: `<img style = "max-width: 560px;" src=${
                payment_email_temp.email_banner_image &&
                payment_email_temp.email_banner_image.length > 0 &&
                payment_email_temp.email_banner_image[0].url
                  ? `${MEDIQUEST_URL_IMG}${payment_email_temp.email_banner_image[0].url}`
                  : ''
              } alt="" />`,
              full_name: formValues.registered_name,
              request_no: formValues.request_no,
              event_name: formValues.event_name,
              queries: formValues.queries,
              othersQuery: formValues.othersQuery ? `Message: ${formValues.othersQuery}` : '',
              reply: formValues.reply ? formValues.reply : '',
              status: formValues.status,
            };
            let emailBody;
            emailBody = replacePlaceholders(payment_email_temp.email_description, placeholders);
            const subjectPlacehoders = {
              event_name: formValues.event_name,
              request_no: formValues.request_no,
            };
            const subject = replacePlaceholders(payment_email_temp.email_subject, subjectPlacehoders);
            // ctx.body = emailBody;
            // return;
            const mailOptions = {
              from: payment_email_temp.email_from,
              to: formValues.registered_email,
              subject: subject ? subject : payment_email_temp.email_subject,
              html: `<!DOCTYPE html>
              <html lang="en">
              
              <head>
              <title>Email Temp</title>
                  <meta name="viewport"
                      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no" />
              
              </head>
              
              <body>
                  <div style="max-width: 560px; width: 100%; margin: 0 auto;">
                      <table style="width: 100%" cellpadding="0" cellspacing="0"
                          style="font-family: Calibri, 'Gill Sans', 'Trebuchet MS', sans-serif; border: 1px solid #cccccc;">
                          ${emailBody}
                      </table>
                  </div>
              </body>
              
              </html>`,
              attachments: attachment ? attachment : null,
            };
            await transporter.sendMail(mailOptions);
            // ctx.body = {after_discount_value, registrationFee, registrationFeeToBePaid, myC};
            ctx.body = 'email sent from support!!';
          } catch (err) {
            ctx.body = err;
          }
        },
        async queryClosed(ctx, next) {
          try {
            const { queryId } = await ctx.request.body;
            const getAttendeeURL = `${MEDIQUEST_URL}/helpAndSupport:get?filterByTk=${parseInt(queryId)}&pageSize=1000`;
            const attendeeData = await fetch(getAttendeeURL, {
              method: 'GET',
              headers: {
                Authorization: COLLECTION_AUTH_TOKEN,
              },
            });
            const attendeeDataDataJSON = await attendeeData.json();
            const formValues = attendeeDataDataJSON.data;

            const payment_email_temp = await queryClosedTemp();
            const placeholders = {
              banner_image: `<img style = "max-width: 560px;" src=${
                payment_email_temp.email_banner_image &&
                payment_email_temp.email_banner_image.length > 0 &&
                payment_email_temp.email_banner_image[0].url
                  ? `${MEDIQUEST_URL_IMG}${payment_email_temp.email_banner_image[0].url}`
                  : ''
              } alt="" />`,
              full_name: formValues.registered_name,
              request_no: formValues.request_no,
              registered_name: formValues.registered_name,
              event_name: formValues.event_name,
              queries: formValues.queries,
              othersQuery: formValues.othersQuery ? `Message: ${formValues.othersQuery}` : '',
              status: formValues.status,
            };
            let emailBody;
            emailBody = replacePlaceholders(payment_email_temp.email_description, placeholders);
            const subjectPlacehoders = {
              event_name: formValues.event_name,
              request_no: formValues.request_no,
            };
            const subject = replacePlaceholders(payment_email_temp.email_subject, subjectPlacehoders);
            // ctx.body = emailBody;
            // return;
            const mailOptions = {
              from: payment_email_temp.email_from,
              to: formValues.registered_email,
              subject: subject ? subject : payment_email_temp.email_subject,
              html: `<!DOCTYPE html>
              <html lang="en">
              
              <head>
              <title>Email Temp</title>
                  <meta name="viewport"
                      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no" />
              
              </head>
              
              <body>
                  <div style="max-width: 560px; width: 100%; margin: 0 auto;">
                      <table style="width: 100%" cellpadding="0" cellspacing="0"
                          style="font-family: Calibri, 'Gill Sans', 'Trebuchet MS', sans-serif; border: 1px solid #cccccc;">
                          ${emailBody}
                      </table>
                  </div>
              </body>
              
              </html>`,
            };
            await transporter.sendMail(mailOptions);
            // ctx.body = {after_discount_value, registrationFee, registrationFeeToBePaid, myC};
            ctx.body = 'email sent from support!!';
          } catch (err) {
            ctx.body = err;
          }
        },
        async hello(ctx, next) {
          ctx.body = 'hey there!!';
        },
      },
    });
    this.app.resource({
      name: 'upload',
      middleware: async (ctx, next) => {
        if (ctx.action.actionName !== 'attachments') {
          return next();
        }
        const storage = multer.diskStorage({
          destination: 'storage/uploads',
          filename: function (req, file, cb) {
            const randomName = Date.now().toString() + Math.random().toString().slice(2); // 随机生成文件名
            cb(null, randomName);
          },
        });

        const upload = multer({ storage }).single('file');
        return upload(ctx, next);
      },
      actions: {
        async attachments(ctx, next) {
          const file = ctx.file;
          console.log(file);
          // const fileName = file.filename;
          const formData = new FormData();
          // formData.append('name','Nishant');
          try {
            if (file) {
              const filePath = file.path; // Use the file path to create a readable stream
              const fileStream = fs.createReadStream(filePath);
              formData.append('file', fileStream, { filename: file.originalname, contentType: file.mimetype });

              // const blob = await fetch(file.path).then((response) => response.blob()); // Convert file to Blob
              // formData.append('file', blob, file.originalname);
              // console.log(fileStream);
              const url = `${MEDIQUEST_URL}attachments:create`;
              const upload = await fetch(url, {
                method: 'POST',
                headers: {
                  Authorization: COLLECTION_AUTH_TOKEN,
                  Accept: '*/*',
                },
                body: formData,
              });
              const uploadedData = await upload.json();
              ctx.body = uploadedData.data;
            } else {
              ctx.body = 'no no';
            }
          } catch (err) {
            throw err;
          }
        },
      },
    });

    this.app.acl.allow('razorPay', 'createOrder');
    this.app.acl.allow('razorPay', 'getOrder');
    this.app.acl.allow('razorPay', 'verifyPayment');
    this.app.acl.allow('razorPay', 'paymentFailed');
    this.app.acl.allow('razorPay', 'paymentAuthorizedWebhook');
    this.app.acl.allow('razorPay', 'paymentCapturedWebhook');
    this.app.acl.allow('razorPay', 'paymentFailedWebhook');
    this.app.acl.allow('send', 'sms');
    this.app.acl.allow('send', 'paymentSMS');
    this.app.acl.allow('send', 'email');
    this.app.acl.allow('send', 'registrationEmail');
    this.app.acl.allow('send', 'groupPaymentEmailAll');
    this.app.acl.allow('send', 'groupPaymentEmailLeader');
    this.app.acl.allow('send', 'groupregistrationEmail');
    this.app.acl.allow('send', 'groupPaymentEmailBackend');
    this.app.acl.allow('send', 'groupPaymentConfirmationEmailBackend');
    this.app.acl.allow('send', 'groupInvoiceRequest');
    this.app.acl.allow('send', 'groupSendInvoice');
    this.app.acl.allow('send', 'groupPaymentProofAttached');
    this.app.acl.allow('send', 'groupPaymentProofAttachedBackend');
    this.app.acl.allow('send', 'groupPaymentProofApproved');
    this.app.acl.allow('send', 'queryRegistration');
    this.app.acl.allow('send', 'queryRegistrationBackend');
    this.app.acl.allow('send', 'queryReplyBackend');
    this.app.acl.allow('send', 'queryClosed');
    this.app.acl.allow('send', 'hello');
    this.app.acl.allow('upload', 'attachments');

    this.app.resourcer.use(
      cors({
        origin: () => '*',
      }),
    );
  }

  async install() {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default PluginMediquestUiServer;
