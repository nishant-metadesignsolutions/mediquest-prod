import { COLLECTION_AUTH_TOKEN, MEDIQUEST_URL } from '../myvars';
const allStates = [
  {
    state_code: 'AN',
    state_name: 'Andaman and Nicobar Islands',
    countryId: 102,
  },
  {
    state_code: 'AP',
    state_name: 'Andhra Pradesh',
    countryId: 102,
  },
  {
    state_code: 'AR',
    state_name: 'Arunachal Pradesh',
    countryId: 102,
  },
  {
    state_code: 'AS',
    state_name: 'Assam',
    countryId: 102,
  },
  {
    state_code: 'BR',
    state_name: 'Bihar',
    countryId: 102,
  },
  {
    state_code: 'CH',
    state_name: 'Chandigarh',
    countryId: 102,
  },
  {
    state_code: 'CT',
    state_name: 'Chhattisgarh',
    countryId: 102,
  },
  {
    state_code: 'DH',
    state_name: 'Dadra and Nagar Haveli and Daman and Diu',
    countryId: 102,
  },
  {
    state_code: 'DL',
    state_name: 'Delhi',
    countryId: 102,
  },
  {
    state_code: 'GA',
    state_name: 'Goa',
    countryId: 102,
  },
  {
    state_code: 'GJ',
    state_name: 'Gujarat',
    countryId: 102,
  },
  {
    state_code: 'HR',
    state_name: 'Haryana',
    countryId: 102,
  },
  {
    state_code: 'HP',
    state_name: 'Himachal Pradesh',
    countryId: 102,
  },
  {
    state_code: 'JK',
    state_name: 'Jammu and Kashmir',
    countryId: 102,
  },
  {
    state_code: 'JH',
    state_name: 'Jharkhand',
    countryId: 102,
  },
  {
    state_code: 'KA',
    state_name: 'Karnataka',
    countryId: 102,
  },
  {
    state_code: 'KL',
    state_name: 'Kerala',
    countryId: 102,
  },
  {
    state_code: 'LA',
    state_name: 'Ladakh',
    countryId: 102,
  },
  {
    state_code: 'LD',
    state_name: 'Lakshadweep',
    countryId: 102,
  },
  {
    state_code: 'MP',
    state_name: 'Madhya Pradesh',
    countryId: 102,
  },
  {
    state_code: 'MH',
    state_name: 'Maharashtra',
    countryId: 102,
  },
  {
    state_code: 'MN',
    state_name: 'Manipur',
    countryId: 102,
  },
  {
    state_code: 'ML',
    state_name: 'Meghalaya',
    countryId: 102,
  },
  {
    state_code: 'MZ',
    state_name: 'Mizoram',
    countryId: 102,
  },
  {
    state_code: 'NL',
    state_name: 'Nagaland',
    countryId: 102,
  },
  {
    state_code: 'OR',
    state_name: 'Odisha',
    countryId: 102,
  },
  {
    state_code: 'PY',
    state_name: 'Puducherry',
    countryId: 102,
  },
  {
    state_code: 'PB',
    state_name: 'Punjab',
    countryId: 102,
  },
  {
    state_code: 'RJ',
    state_name: 'Rajasthan',
    countryId: 102,
  },
  {
    state_code: 'SK',
    state_name: 'Sikkim',
    countryId: 102,
  },
  {
    state_code: 'TN',
    state_name: 'Tamil Nadu',
    countryId: 102,
  },
  {
    state_code: 'TG',
    state_name: 'Telangana',
    countryId: 102,
  },
  {
    state_code: 'TR',
    state_name: 'Tripura',
    countryId: 102,
  },
  {
    state_code: 'UP',
    state_name: 'Uttar Pradesh',
    countryId: 102,
  },
  {
    state_code: 'UT',
    state_name: 'Uttarakhand',
    countryId: 102,
  },
  {
    state_code: 'WB',
    state_name: 'West Bengal',
    countryId: 102,
  },
];
export async function createTestState(mystate) {
  try {
    const testStateURL = `${MEDIQUEST_URL}test_states:create`;
    const stateData = await fetch(testStateURL, {
      method: 'POST',
      headers: {
        Authorization: COLLECTION_AUTH_TOKEN,
      },
      body: JSON.stringify(mystate),
    });
  } catch (err) {
    console.log(err);
  }
}
