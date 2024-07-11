import fetch from 'node-fetch';
import { COLLECTION_AUTH_TOKEN, MEDIQUEST_URL } from '../myvars';

export async function updateCoupon(couponCode) {
  try {
    const getCouponUrl = `${MEDIQUEST_URL}discount_coupon:get?filter={"coupon_code":"${couponCode}"}&pageSize=1000`;
    const couponURL = `${MEDIQUEST_URL}discount_coupon:update?filter={"coupon_code":"${couponCode}"}&pageSize=1000`;
    const couponDetails = await fetch(getCouponUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });
    const coupon_data = await couponDetails.json();
    const coupon_count = parseInt(coupon_data.data.coupon_user_count) - 1;

    await fetch(couponURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
      body: JSON.stringify({ coupon_user_count: parseInt(coupon_count) }),
    });
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
