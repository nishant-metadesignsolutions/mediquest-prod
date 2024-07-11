import fetch from 'node-fetch';
import { COLLECTION_AUTH_TOKEN, MEDIQUEST_URL } from '../myvars';

export const transporterOptions = {
  host: 'smtp-relay.brevo.com',
  port: 587, // port for secure SMTP
  secure: false,
  auth: {
    user: 'info@mediquest.in',
    pass: 'b5YtcfG6yqB21mVx',
  },
};

export async function registrationEmailTemp() {
  try {
    // https://accasia2024.in/api/email_template:get?appends%5B%5D=email_banner_image&filterByTk=1
    const templateUrl = `${MEDIQUEST_URL}/email_template:get?filter={"email_purpose":"Registration Confirmation"}&appends%5B%5D=email_banner_image&pageSize=1000`;
    const templateData = await fetch(templateUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });
    if (!templateData.ok) {
      throw new Error('Failed to fetch agenda details');
    }
    const data = await templateData.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching agenda details:', error);
    throw error; // Rethrow the error to propagate it to the caller
  }
}
export async function paymentEmailTemp() {
  try {
    // https://accasia2024.in/api/email_template:get?appends%5B%5D=email_banner_image&filterByTk=1
    const templateUrl = `${MEDIQUEST_URL}/email_template:get?filter={"email_purpose":"Payment Confirmation"}&appends%5B%5D=email_banner_image&pageSize=1000`;
    const templateData = await fetch(templateUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });
    if (!templateData.ok) {
      throw new Error('Failed to fetch agenda details');
    }
    const data = await templateData.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching agenda details:', error);
    throw error; // Rethrow the error to propagate it to the caller
  }
}

export async function groupPaymentEmailTemp() {
  try {
    // https://accasia2024.in/api/email_template:get?appends%5B%5D=email_banner_image&filterByTk=1
    const templateUrl = `${MEDIQUEST_URL}/email_template:get?filter={"email_purpose":"Group Payment Confirmation Individual"}&appends%5B%5D=email_banner_image&pageSize=1000`;
    const templateData = await fetch(templateUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });
    if (!templateData.ok) {
      throw new Error('Failed to fetch agenda details');
    }
    const data = await templateData.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching agenda details:', error);
    throw error; // Rethrow the error to propagate it to the caller
  }
}

export async function groupPaymentLeaderEmailTemp() {
  try {
    // https://accasia2024.in/api/email_template:get?appends%5B%5D=email_banner_image&filterByTk=1
    const templateUrl = `${MEDIQUEST_URL}/email_template:get?filter={"email_purpose":"Group Payment Confirmation Leader"}&appends%5B%5D=email_banner_image&pageSize=1000`;
    const templateData = await fetch(templateUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });
    if (!templateData.ok) {
      throw new Error('Failed to fetch agenda details');
    }
    const data = await templateData.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching agenda details:', error);
    throw error; // Rethrow the error to propagate it to the caller
  }
}

export async function groupRegistrationEmailTemp() {
  try {
    // https://accasia2024.in/api/email_template:get?appends%5B%5D=email_banner_image&filterByTk=1
    const templateUrl = `${MEDIQUEST_URL}/email_template:get?filter={"email_purpose":"Group Registration Confirmation"}&appends%5B%5D=email_banner_image&pageSize=1000`;
    const templateData = await fetch(templateUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });
    if (!templateData.ok) {
      throw new Error('Failed to fetch agenda details');
    }
    const data = await templateData.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching agenda details:', error);
    throw error; // Rethrow the error to propagate it to the caller
  }
}

export async function groupRegistrationBackendEmailTemp() {
  try {
    // https://accasia2024.in/api/email_template:get?appends%5B%5D=email_banner_image&filterByTk=1
    const templateUrl = `${MEDIQUEST_URL}/email_template:get?filter={"email_purpose":"Group Registration Notify Support"}&appends%5B%5D=email_banner_image&pageSize=1000`;
    const templateData = await fetch(templateUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });
    if (!templateData.ok) {
      throw new Error('Failed to fetch agenda details');
    }
    const data = await templateData.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching agenda details:', error);
    throw error; // Rethrow the error to propagate it to the caller
  }
}

export async function groupPaymentBackendEmailTemp() {
  try {
    // https://accasia2024.in/api/email_template:get?appends%5B%5D=email_banner_image&filterByTk=1
    const templateUrl = `${MEDIQUEST_URL}/email_template:get?filter={"email_purpose":"Group Registration Payment Completed Notify Support"}&appends%5B%5D=email_banner_image&pageSize=1000`;
    const templateData = await fetch(templateUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });
    if (!templateData.ok) {
      throw new Error('Failed to fetch agenda details');
    }
    const data = await templateData.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching agenda details:', error);
    throw error; // Rethrow the error to propagate it to the caller
  }
}

export async function groupInvoiceRequestBackendEmailTemp(eventId) {
  try {
    // https://accasia2024.in/api/email_template:get?appends%5B%5D=email_banner_image&filterByTk=1
    const templateUrl = `${MEDIQUEST_URL}/email_template:get?filter={"email_purpose":"Group Registration Generate Invoice Request", "eventId": ${eventId} }&appends%5B%5D=email_banner_image&pageSize=1000`;
    const templateData = await fetch(templateUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });
    if (!templateData.ok) {
      throw new Error('Failed to fetch agenda details');
    }
    const data = await templateData.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching agenda details:', error);
    throw error; // Rethrow the error to propagate it to the caller
  }
}

export async function groupSendInvoiceEmailTemp(eventId) {
  try {
    // https://accasia2024.in/api/email_template:get?appends%5B%5D=email_banner_image&filterByTk=1
    const templateUrl = `${MEDIQUEST_URL}/email_template:get?filter={"email_purpose":"Group Registration Send Invoice", "eventId": ${eventId} }&appends%5B%5D=email_banner_image&pageSize=1000`;
    const templateData = await fetch(templateUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });
    if (!templateData.ok) {
      throw new Error('Failed to fetch agenda details');
    }
    const data = await templateData.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching agenda details:', error);
    throw error; // Rethrow the error to propagate it to the caller
  }
}

export async function groupPaymentProofEmailTemp(eventId) {
  try {
    // https://accasia2024.in/api/email_template:get?appends%5B%5D=email_banner_image&filterByTk=1
    const templateUrl = `${MEDIQUEST_URL}/email_template:get?filter={"email_purpose":"Group Registration Payment Proof Attached", "eventId": ${eventId} }&appends%5B%5D=email_banner_image&pageSize=1000`;
    const templateData = await fetch(templateUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });
    if (!templateData.ok) {
      throw new Error('Failed to fetch agenda details');
    }
    const data = await templateData.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching agenda details:', error);
    throw error; // Rethrow the error to propagate it to the caller
  }
}

export async function groupPaymentProofBackendEmailTemp(eventId) {
  try {
    // https://accasia2024.in/api/email_template:get?appends%5B%5D=email_banner_image&filterByTk=1
    const templateUrl = `${MEDIQUEST_URL}/email_template:get?filter={"email_purpose":"Group Registration Payment Proof Attached Notify Support", "eventId": ${eventId} }&appends%5B%5D=email_banner_image&pageSize=1000`;
    const templateData = await fetch(templateUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });
    if (!templateData.ok) {
      throw new Error('Failed to fetch agenda details');
    }
    const data = await templateData.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching agenda details:', error);
    throw error; // Rethrow the error to propagate it to the caller
  }
}

export async function groupPaymentProofApprovedEmailTemp(eventId) {
  try {
    // https://accasia2024.in/api/email_template:get?appends%5B%5D=email_banner_image&filterByTk=1
    const templateUrl = `${MEDIQUEST_URL}/email_template:get?filter={"email_purpose":"Group Registration Payment Approved", "eventId": ${eventId} }&appends%5B%5D=email_banner_image&pageSize=1000`;
    const templateData = await fetch(templateUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });
    if (!templateData.ok) {
      throw new Error('Failed to fetch agenda details');
    }
    const data = await templateData.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching agenda details:', error);
    throw error; // Rethrow the error to propagate it to the caller
  }
}

export async function queryRegistrationTemp() {
  try {
    // https://accasia2024.in/api/email_template:get?appends%5B%5D=email_banner_image&filterByTk=1
    const templateUrl = `${MEDIQUEST_URL}/email_template:get?filter={"email_purpose":"User Query Registration Confirmation"}&appends%5B%5D=email_banner_image&pageSize=1000`;
    const templateData = await fetch(templateUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });
    if (!templateData.ok) {
      throw new Error('Failed to fetch agenda details');
    }
    const data = await templateData.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching agenda details:', error);
    throw error; // Rethrow the error to propagate it to the caller
  }
}

export async function queryRegistrationBackendTemp() {
  try {
    // https://accasia2024.in/api/email_template:get?appends%5B%5D=email_banner_image&filterByTk=1
    const templateUrl = `${MEDIQUEST_URL}/email_template:get?filter={"email_purpose":"Backend Query Registration Confirmation"}&appends%5B%5D=email_banner_image&pageSize=1000`;
    const templateData = await fetch(templateUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });
    if (!templateData.ok) {
      throw new Error('Failed to fetch agenda details');
    }
    const data = await templateData.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching agenda details:', error);
    throw error; // Rethrow the error to propagate it to the caller
  }
}

export async function queryReplyTemp() {
  try {
    // https://accasia2024.in/api/email_template:get?appends%5B%5D=email_banner_image&filterByTk=1
    const templateUrl = `${MEDIQUEST_URL}/email_template:get?filter={"email_purpose":"Query Support Team Response"}&appends%5B%5D=email_banner_image&pageSize=1000`;
    // helpAndSupport:get?filterByTk=76&appends%5B%5D=attachment
    const templateData = await fetch(templateUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });
    if (!templateData.ok) {
      throw new Error('Failed to fetch agenda details');
    }
    const data = await templateData.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching agenda details:', error);
    throw error; // Rethrow the error to propagate it to the caller
  }
}

export async function queryClosedTemp() {
  try {
    // https://accasia2024.in/api/email_template:get?appends%5B%5D=email_banner_image&filterByTk=1
    const templateUrl = `${MEDIQUEST_URL}/email_template:get?filter={"email_purpose":"User Query Closed"}&appends%5B%5D=email_banner_image&pageSize=1000`;
    const templateData = await fetch(templateUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COLLECTION_AUTH_TOKEN,
      },
    });
    if (!templateData.ok) {
      throw new Error('Failed to fetch agenda details');
    }
    const data = await templateData.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching agenda details:', error);
    throw error; // Rethrow the error to propagate it to the caller
  }
}
