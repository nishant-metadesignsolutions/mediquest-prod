import { COLLECTION_AUTH_TOKEN, MEDIQUEST_URL } from '../myvars';

export async function updateCoupon(couponId, newCount) {
  try {
    const couponURL = `${MEDIQUEST_URL}discount_coupon:update?filterByTk=${parseInt(
      couponId,
    )}&pageSize=1000`;
    await fetch(couponURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
      body: JSON.stringify({ coupon_user_count: parseInt(newCount) }),
    });
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
