export function validatePhoneNumber() {
  if (document.getElementById('phoneNumber')) {
    const phoneNumberInput = document.getElementById('phoneNumber');
    const phoneNumberError = document.getElementById('phoneNumber-error');

    // Phone Number Validation
    const phoneNumberPattern = /^[0-9]{10}$/;
    if (!phoneNumberPattern.test(phoneNumberInput.value)) {
      phoneNumberError.textContent = 'Enter a valid 10-digit phone number';
      return false;
    } else {
      phoneNumberError.textContent = '';
    }
  }

  if (document.getElementById('registered_phone')) {
    const phoneNumberInput = document.getElementById('registered_phone');
    const phoneNumberError = document.getElementById('registered_phone-error');

    // Phone Number Validation
    const phoneNumberPattern = /^[0-9]{10}$/;
    if (!phoneNumberPattern.test(phoneNumberInput.value)) {
      phoneNumberError.textContent = 'Enter a valid 10-digit phone number';
      return false;
    } else {
      phoneNumberError.textContent = '';
    }
  }

  return true;
}

export function validatePhoneNumberInternational() {
  if (document.getElementById('phoneNumber')) {
    const phoneNumberInput = document.getElementById('phoneNumber');
    const phoneNumberError = document.getElementById('phoneNumber-error');

    // Phone Number Validation
    const phoneNumberPattern = /^\+?[0-9\s-]{10,15}$/;
    if (!phoneNumberPattern.test(phoneNumberInput.value)) {
      phoneNumberError.textContent = 'Enter a valid phone number';
      return false;
    } else {
      phoneNumberError.textContent = '';
    }
  }

  if (document.getElementById('registered_phone')) {
    const phoneNumberInput = document.getElementById('registered_phone');
    const phoneNumberError = document.getElementById('registered_phone-error');

    // Phone Number Validation
    const phoneNumberPattern = /^\+?[0-9\s-]{10,15}$/;
    if (!phoneNumberPattern.test(phoneNumberInput.value)) {
      phoneNumberError.textContent = 'Enter a valid phone number';
      return false;
    } else {
      phoneNumberError.textContent = '';
    }
  }

  return true;
}

export function validateEmail() {
  if (document.getElementById('email')) {
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('email-error');

    // Email Validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(emailInput.value)) {
      emailError.textContent = 'Enter a valid email address';
      return false;
    } else {
      emailError.textContent = '';
    }
  }

  if (document.getElementById('registered_email')) {
    const emailInput = document.getElementById('registered_email');
    const emailError = document.getElementById('registered_email-error');

    // Email Validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(emailInput.value)) {
      emailError.textContent = 'Enter a valid email address';
      return false;
    } else {
      emailError.textContent = '';
    }
  }

  return true;
}

export function validatePincodeInternational() {
  if (document.getElementById('pincode')) {
    const pincodeInput = document.getElementById('pincode');
    const pincodeError = document.getElementById('pincode-error');

    // Pincode Validation
    const pincodePattern = /^[0-9a-zA-Z\s-]{3,10}$/;
    if (!pincodePattern.test(pincodeInput.value)) {
      pincodeError.textContent = 'Enter a valid postal code';
      return false;
    } else {
      pincodeError.textContent = '';
    }
  }

  return true;
}

export function validatePincode() {
  if (document.getElementById('pincode')) {
    const pincodeInput = document.getElementById('pincode');
    const pincodeError = document.getElementById('pincode-error');

    // Pincode Validation
    const pincodePattern = /^[0-9]{6}$/;
    if (!pincodePattern.test(pincodeInput.value)) {
      pincodeError.textContent = 'Enter a valid 6-digit pincode';
      return false;
    } else {
      pincodeError.textContent = '';
    }
  }

  return true;
}

export function validateFirstName() {
  if (document.getElementById('first_name')) {
    const nameInput = document.getElementById('first_name');
    const nameError = document.getElementById('first_name-error');

    // Name Validation
    const namePattern = /^[A-Za-z]+$/;
    if (!namePattern.test(nameInput.value)) {
      nameError.textContent = 'Please input a valid first name';
      return false;
    } else {
      nameError.textContent = '';
    }
  }

  return true;
}

export function validateLastName() {
  if (document.getElementById('last_name')) {
    const nameInput = document.getElementById('last_name');
    const nameError = document.getElementById('last_name-error');

    // Name Validation
    const namePattern = /^[A-Za-z]+$/;
    if (!namePattern.test(nameInput.value)) {
      nameError.textContent = 'Please input a valid last name';
      return false;
    } else {
      nameError.textContent = '';
    }
  }

  return true;
}

export function validateDOB(formValues) {
  if (document.getElementById('date_of_birth_input')) {
    const dobInput = document.getElementById('date_of_birth_input');
    const dobError = document.getElementById('date_of_birth_input-error');

    // DOB Validation
    if (formValues.date_of_birth && new Date(formValues.date_of_birth) > new Date()) {
      dobError.textContent = 'Please input a valid Date of birth';
      return false;
    } else {
      dobError.textContent = '';
    }
  }

  return true;
}

export function validateCoupon(isCoupon) {
  if (document.getElementById('coupon')) {
    const couponInput = document.getElementById('coupon');
    const couponError = document.getElementById('coupon-error');

    // Coupon Validation
    if (!isCoupon && couponInput.textContent) {
      couponError.textContent = 'Please enter a valid coupon';
      return false;
    } else if (!couponInput.textContent) {
      couponError.textContent = '';
    } else {
      couponError.textContent = '';
    }

    return true;
  }
}

export const clearErrorMessage = () => {
  if (document.getElementById('phoneNumber-error')) {
    document.getElementById('phoneNumber-error').textContent = '';
  }

  if (document.getElementById('email-error')) {
    document.getElementById('email-error').textContent = '';
  }

  if (document.getElementById('pincode-error')) {
    document.getElementById('pincode-error').textContent = '';
  }

  if (document.getElementById('coupon-error')) {
    document.getElementById('coupon-error').textContent = '';
  }
};

export function emptyFieldCheck(formValues) {
  let firstEmptyField = null;

  if (document.getElementById('paymentId')) {
    if (!formValues.paymentId) {
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('paymentId');
        // document.getElementById('paymentId-error').textContent = 'Please fill required field';
      }
    } else {
      document.getElementById('paymentId-error').textContent = '';
    }
  }

  if (document.getElementById('csi_member_id')) {
    if (formValues.paymentId == 'CSI Member' && !formValues.csi_member_id) {
      if (document.getElementById('csi_member_id-error')) {
        if (!firstEmptyField) {
          firstEmptyField = document.getElementById('csi_member_id');
          // document.getElementById('csi_member_id-error').textContent = 'Please fill required field';
        }
      }
    } else {
      if (document.getElementById('csi_member_id-error')) {
        document.getElementById('csi_member_id-error').textContent =
          'Please carry your CSI Membership Card to the event.';
      }
    }
  }

  if (document.getElementById('csi_chapter_name')) {
    if (formValues.paymentId == 'CSI Member' && !formValues.csi_chapter_name) {
      if (document.getElementById('csi_chapter_name-error')) {
        if (!firstEmptyField) {
          firstEmptyField = document.getElementById('csi_chapter_name');
          // document.getElementById('csi_chapter_name-error').textContent = 'Please fill required field';
        }
      }
      // isError = true;
    } else {
      if (document.getElementById('csi_chapter_name-error')) {
        document.getElementById('csi_chapter_name-error').textContent =
          'Please carry your CSI Membership Card to the event.';
      }
    }
  }

  if (document.getElementById('name_of_institution')) {
    if (
      formValues.paymentId == 'Reduced (Residents, Students, Nurses, Allied Health Professional)' &&
      !formValues.name_of_institution
    ) {
      if (document.getElementById('name_of_institution-error')) {
        if (!firstEmptyField) {
          firstEmptyField = document.getElementById('name_of_institution');
          // document.getElementById('name_of_institution-error').textContent = 'Please fill required field';
        }
      }
      // isError = true;
    } else {
      if (document.getElementById('name_of_institution-error')) {
        document.getElementById('name_of_institution-error').textContent =
          'Please carry your Student Enrollment/ID Card to the event.';
      }
    }
  }

  if (document.getElementById('enrollment_number_or_student_id')) {
    if (
      formValues.paymentId == 'Reduced (Residents, Students, Nurses, Allied Health Professional)' &&
      !formValues.enrollment_number_or_student_id
    ) {
      if (document.getElementById('enrollment_number_or_student_id-error')) {
        if (!firstEmptyField) {
          firstEmptyField = document.getElementById('enrollment_number_or_student_id');
          // document.getElementById('enrollment_number_or_student_id-error').textContent = 'Please fill required field';
        }
      }
      // isError = true;
    } else {
      if (document.getElementById('enrollment_number_or_student_id-error')) {
        document.getElementById('enrollment_number_or_student_id-error').textContent =
          'Please carry your Student Enrollment/ID Card to the event.';
      }
    }
  }

  if (document.getElementById('first_name')) {
    if (!formValues.first_name) {
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('first_name');
        // document.getElementById('first_name-error').textContent = 'Please fill required field';
      }
    } else {
      document.getElementById('first_name-error').textContent = '';
    }
  }

  if (document.getElementById('last_name')) {
    if (!formValues.last_name) {
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('last_name');
        // document.getElementById('last_name-error').textContent = 'Please fill required field';
      }
    } else {
      document.getElementById('last_name-error').textContent = '';
    }
  }

  if (document.getElementById('company_name')) {
    if (!formValues.company_name) {
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('company_name');
        // document.getElementById('company_name-error').textContent = 'Please fill required field';
      }
    } else {
      document.getElementById('company_name-error').textContent = '';
    }
  }

  if (document.getElementById('registration_id_prefix')) {
    if (!formValues.registration_id_prefix) {
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('registration_id_prefix');
        // document.getElementById('company_name-error').textContent = 'Please fill required field';
      }
    } else {
      document.getElementById('registration_id_prefix-error').textContent = '';
    }
  }

  if (document.getElementById('pincode')) {
    if (!formValues.pincode) {
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('pincode');
        // document.getElementById('pincode-error').textContent = 'Please fill required field';
      }
    } else {
      document.getElementById('pincode-error').textContent = '';
    }
  }

  if (document.getElementById('countryId')) {
    if (!formValues.countryId) {
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('countryId');
        // document.getElementById('countryId-error').textContent = 'Please fill required field';
      }
    } else {
      document.getElementById('countryId-error').textContent = '';
    }
  }

  if (document.getElementById('stateId')) {
    if (document.getElementById('stateId-error') && !formValues.stateId) {
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('stateId');
        // document.getElementById('stateId-error').textContent = 'Please fill required field';
      }
    } else {
      if (document.getElementById('stateId-error')) {
        document.getElementById('stateId-error').textContent = '';
      }
    }
  }

  if (document.getElementById('cityId')) {
    if (!formValues.cityId) {
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('cityId');
        // document.getElementById('cityId-error').textContent = 'Please fill required field';
      }
    } else {
      document.getElementById('cityId-error').textContent = '';
    }
  }

  if (document.getElementById('phoneNumber')) {
    if (!formValues.contact_number) {
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('phoneNumber');
        // document.getElementById('phoneNumber-error').textContent = 'Please fill required field';
      }
    } else {
      document.getElementById('phoneNumber-error').textContent = '';
    }
  }

  if (document.getElementById('email')) {
    if (!formValues.email_id) {
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('email');
        // document.getElementById('email-error').textContent = 'Please fill required field';
      }
    } else {
      document.getElementById('email-error').textContent = '';
    }
  }

  if (document.getElementById('registered_email')) {
    if (!formValues.registered_email) {
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('registered_email');
        // document.getElementById('registered_email-error').textContent = 'Please fill required field';
      }
    } else {
      document.getElementById('registered_email-error').textContent = '';
    }
  }

  if (document.getElementById('registered_phone')) {
    if (formValues.registered_phone && !formValues.country_code) {
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('registered_phone');
        // document.getElementById('registered_email-error').textContent = 'Please fill required field';
      }
    } else if (!formValues.registered_phone && formValues.country_code) {
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('registered_phone');
        // document.getElementById('registered_email-error').textContent = 'Please fill required field';
      }
    } else {
      document.getElementById('registered_phone-error').textContent = '';
    }
  }

  if (document.getElementById('event_name')) {
    if (!formValues.event_name) {
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('event_name');
        // document.getElementById('event_name-error').textContent = 'Please fill required field';
      }
    } else {
      document.getElementById('event_name-error').textContent = '';
    }
  }

  if (document.getElementById('registered_name')) {
    if (!formValues.registered_name) {
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('registered_name');
        // document.getElementById('registered_name-error').textContent = 'Please fill required field';
      }
    } else {
      document.getElementById('registered_name-error').textContent = '';
    }
  }

  if (document.getElementById('registration_id')) {
    if (!formValues.registration_id) {
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('registration_id');
        // document.getElementById('registration_id-error').textContent = 'Please fill required field';
      }
    } else {
      document.getElementById('registration_id-error').textContent = '';
    }
  }

  if (document.getElementById('queries')) {
    if (!formValues.queries) {
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('queries');
        // document.getElementById('queries-error').textContent = 'Please fill required field';
      }
    } else {
      document.getElementById('queries-error').textContent = '';
    }
  }

  if (document.getElementById('othersQuery')) {
    if (formValues.queries == 'Others (please fill below)' && !formValues.othersQuery) {
      if (document.getElementById('othersQuery-error')) {
        if (!firstEmptyField) {
          firstEmptyField = document.getElementById('othersQuery');
          // document.getElementById('csi_member_id-error').textContent = 'Please fill required field';
        }
      }
    }
  }

  if (document.getElementById('currentPaymentCategory')) {
    if (formValues.queries == 'Change request in registration category' && !formValues.currentPaymentCategory) {
      if (document.getElementById('currentPaymentCategory-error')) {
        if (!firstEmptyField) {
          firstEmptyField = document.getElementById('currentPaymentCategory');
          // document.getElementById('csi_member_id-error').textContent = 'Please fill required field';
        }
      }
    }
  }

  if (document.getElementById('newPaymentCategory')) {
    if (formValues.queries == 'Change request in registration category' && !formValues.newPaymentCategory) {
      if (document.getElementById('newPaymentCategory-error')) {
        if (!firstEmptyField) {
          firstEmptyField = document.getElementById('newPaymentCategory');
          // document.getElementById('csi_member_id-error').textContent = 'Please fill required field';
        }
      }
    }
  }

  if (document.getElementById('event_start_date')) {
    if (formValues.queries == 'Raise Cancellation Request' && !formValues.event_start_date) {
      if (document.getElementById('event_start_date-error')) {
        if (!firstEmptyField) {
          firstEmptyField = document.getElementById('event_start_date');
          // document.getElementById('csi_member_id-error').textContent = 'Please fill required field';
        }
      }
    }
  }

  if (document.getElementById('event_end_date')) {
    if (formValues.queries == 'Raise Cancellation Request' && !formValues.event_end_date) {
      if (document.getElementById('event_end_date-error')) {
        if (!firstEmptyField) {
          firstEmptyField = document.getElementById('event_end_date');
          // document.getElementById('csi_member_id-error').textContent = 'Please fill required field';
        }
      }
    }
  }

  if (document.getElementById('refundPaymentCategory')) {
    if (formValues.queries == 'Refund status' && !formValues.refundPaymentCategory) {
      if (document.getElementById('refundPaymentCategory-error')) {
        if (!firstEmptyField) {
          firstEmptyField = document.getElementById('refundPaymentCategory');
          // document.getElementById('csi_member_id-error').textContent = 'Please fill required field';
        }
      }
    }
  }

  if (document.getElementById('transaction_id')) {
    if (formValues.queries == 'Refund status' && !formValues.transaction_id) {
      if (document.getElementById('transaction_id-error')) {
        if (!firstEmptyField) {
          firstEmptyField = document.getElementById('transaction_id');
          // document.getElementById('csi_member_id-error').textContent = 'Please fill required field';
        }
      }
    }
  }

  if (document.getElementById('rrn_number')) {
    if (formValues.queries == 'Refund status' && !formValues.rrn_number) {
      if (document.getElementById('rrn_number-error')) {
        if (!firstEmptyField) {
          firstEmptyField = document.getElementById('rrn_number');
          // document.getElementById('csi_member_id-error').textContent = 'Please fill required field';
        }
      }
    }
  }

  return firstEmptyField;
}

export function emptyFieldCheckOnSubmit(formValues) {
  // let isError = false;
  let firstEmptyField = null;
  if (document.getElementById('paymentId')) {
    if (!formValues.paymentId) {
      document.getElementById('paymentId-error').textContent = 'Please fill required field';
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('paymentId');
      }
      // isError = true;
    } else {
      document.getElementById('paymentId-error').textContent = '';
    }
  }

  if (document.getElementById('csi_member_id')) {
    if (formValues.paymentId == 'CSI Member' && !formValues.csi_member_id) {
      if (document.getElementById('csi_member_id-error')) {
        document.getElementById('csi_member_id-error').textContent = 'Please fill required field';
        if (!firstEmptyField) {
          firstEmptyField = document.getElementById('csi_member_id');
        }
      }
      // isError = true;
    } else {
      if (document.getElementById('csi_member_id-error')) {
        document.getElementById('csi_member_id-error').textContent =
          'Please carry your CSI Membership Card to the event.';
      }
    }
  }

  if (document.getElementById('csi_chapter_name')) {
    if (formValues.paymentId == 'CSI Member' && !formValues.csi_chapter_name) {
      if (document.getElementById('csi_chapter_name-error')) {
        document.getElementById('csi_chapter_name-error').textContent = 'Please fill required field';
        if (!firstEmptyField) {
          firstEmptyField = document.getElementById('csi_chapter_name');
        }
      }
      // isError = true;
    } else {
      if (document.getElementById('csi_chapter_name-error')) {
        document.getElementById('csi_chapter_name-error').textContent =
          'Please carry your CSI Membership Card to the event.';
      }
    }
  }

  if (document.getElementById('name_of_institution')) {
    if (
      formValues.paymentId == 'Reduced (Residents, Students, Nurses, Allied Health Professional)' &&
      !formValues.name_of_institution
    ) {
      if (document.getElementById('name_of_institution-error')) {
        document.getElementById('name_of_institution-error').textContent = 'Please fill required field';
        if (!firstEmptyField) {
          firstEmptyField = document.getElementById('name_of_institution');
        }
      }
      // isError = true;
    } else {
      if (document.getElementById('name_of_institution-error')) {
        document.getElementById('name_of_institution-error').textContent =
          'Please carry your Student Enrollment/ID Card to the event.';
      }
    }
  }

  if (document.getElementById('enrollment_number_or_student_id')) {
    if (
      formValues.paymentId == 'Reduced (Residents, Students, Nurses, Allied Health Professional)' &&
      !formValues.enrollment_number_or_student_id
    ) {
      if (document.getElementById('enrollment_number_or_student_id-error')) {
        document.getElementById('enrollment_number_or_student_id-error').textContent = 'Please fill required field';
        if (!firstEmptyField) {
          firstEmptyField = document.getElementById('enrollment_number_or_student_id');
        }
      }
      // isError = true;
    } else {
      if (document.getElementById('enrollment_number_or_student_id-error')) {
        document.getElementById('enrollment_number_or_student_id-error').textContent =
          'Please carry your Student Enrollment/ID Card to the event.';
      }
    }
  }

  if (document.getElementById('first_name')) {
    if (!formValues.first_name) {
      document.getElementById('first_name-error').textContent = 'Please fill required field';
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('first_name');
      }
      // isError = true;
    } else {
      document.getElementById('first_name-error').textContent = '';
    }
  }

  if (document.getElementById('last_name')) {
    if (!formValues.last_name) {
      document.getElementById('last_name-error').textContent = 'Please fill required field';
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('last_name');
      }
      // isError = true;
    } else {
      document.getElementById('last_name-error').textContent = '';
    }
  }

  if (document.getElementById('company_name')) {
    if (!formValues.company_name) {
      document.getElementById('company_name-error').textContent = 'Please fill required field';
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('company_name');
      }
      // isError = true;
    } else {
      document.getElementById('company_name-error').textContent = '';
    }
  }

  if (document.getElementById('registration_id_prefix')) {
    if (!formValues.registration_id_prefix) {
      document.getElementById('registration_id_prefix-error').textContent = 'Please fill required field';
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('registration_id_prefix');
      }
      // isError = true;
    } else {
      document.getElementById('registration_id_prefix-error').textContent = '';
    }
  }

  if (document.getElementById('pincode')) {
    if (!formValues.pincode) {
      document.getElementById('pincode-error').textContent = 'Please fill required field';
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('pincode');
      }
      // isError = true;
    } else {
      document.getElementById('pincode-error').textContent = '';
    }
  }

  if (document.getElementById('countryId')) {
    if (!formValues.countryId) {
      document.getElementById('countryId-error').textContent = 'Please fill required field';
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('countryId');
      }
      // isError = true;
    } else {
      document.getElementById('countryId-error').textContent = '';
    }
  }

  if (document.getElementById('stateId')) {
    if (document.getElementById('stateId-error') && !formValues.stateId) {
      document.getElementById('stateId-error').textContent = 'Please fill required field';
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('stateId');
      }
      // isError = true;
    } else {
      if (document.getElementById('stateId-error')) {
        document.getElementById('stateId-error').textContent = '';
      }
    }
  }

  if (document.getElementById('cityId')) {
    if (!formValues.cityId) {
      document.getElementById('cityId-error').textContent = 'Please fill required field';
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('cityId');
      }
      // isError = true;
    } else {
      document.getElementById('cityId-error').textContent = '';
    }
  }

  if (document.getElementById('phoneNumber')) {
    if (!formValues.contact_number) {
      document.getElementById('phoneNumber-error').textContent = 'Please fill required field';
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('phoneNumber');
      }
      // isError = true;
    } else {
      document.getElementById('phoneNumber-error').textContent = '';
    }
  }

  if (document.getElementById('email')) {
    if (!formValues.email_id) {
      document.getElementById('email-error').textContent = 'Please fill required field';
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('email');
      }
      // isError = true;
    } else {
      document.getElementById('email-error').textContent = '';
    }
  }

  if (document.getElementById('registered_email')) {
    if (!formValues.registered_email) {
      document.getElementById('registered_email-error').textContent = 'Please fill required field';
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('registered_email');
        // document.getElementById('registered_email-error').textContent = 'Please fill required field';
      }
    } else {
      document.getElementById('registered_email-error').textContent = '';
    }
  }

  if (document.getElementById('registered_phone')) {
    if (formValues.registered_phone && !formValues.country_code) {
      document.getElementById('registered_phone-error').textContent = 'Country code is required';
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('registered_phone');
        // document.getElementById('registered_email-error').textContent = 'Please fill required field';
      }
    } else if (!formValues.registered_phone && formValues.country_code) {
      document.getElementById('registered_phone-error').textContent = 'Phone number is required';
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('registered_phone');
        // document.getElementById('registered_email-error').textContent = 'Please fill required field';
      }
    } else {
      document.getElementById('registered_phone-error').textContent = '';
    }
  }

  if (document.getElementById('event_name')) {
    if (!formValues.event_name) {
      document.getElementById('event_name-error').textContent = 'Please fill required field';
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('event_name');
        // document.getElementById('event_name-error').textContent = 'Please fill required field';
      }
    } else {
      document.getElementById('event_name-error').textContent = '';
    }
  }

  if (document.getElementById('registered_name')) {
    if (!formValues.registered_name) {
      document.getElementById('registered_name-error').textContent = 'Please fill required field';
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('registered_name');
        // document.getElementById('registered_name-error').textContent = 'Please fill required field';
      }
    } else {
      document.getElementById('registered_name-error').textContent = '';
    }
  }

  if (document.getElementById('registration_id')) {
    if (!formValues.registration_id) {
      document.getElementById('registration_id-error').textContent = 'Please fill required field';
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('registration_id');
        // document.getElementById('registration_id-error').textContent = 'Please fill required field';
      }
    } else {
      document.getElementById('registration_id-error').textContent = '';
    }
  }

  if (document.getElementById('queries')) {
    if (!formValues.queries) {
      document.getElementById('queries-error').textContent = 'Please fill required field';
      if (!firstEmptyField) {
        firstEmptyField = document.getElementById('queries');
        // document.getElementById('queries-error').textContent = 'Please fill required field';
      }
    } else {
      document.getElementById('queries-error').textContent = '';
    }
  }

  if (document.getElementById('othersQuery')) {
    if (formValues.queries == 'Others (please fill below)' && !formValues.othersQuery) {
      if (document.getElementById('othersQuery-error')) {
        document.getElementById('othersQuery-error').textContent = 'Please fill required field';
        if (!firstEmptyField) {
          firstEmptyField = document.getElementById('othersQuery');
          // document.getElementById('csi_member_id-error').textContent = 'Please fill required field';
        }
      }
    } else {
      document.getElementById('othersQuery-error').textContent = '';
    }
  }

  if (document.getElementById('currentPaymentCategory')) {
    if (formValues.queries == 'Change request in registration category' && !formValues.currentPaymentCategory) {
      if (document.getElementById('currentPaymentCategory-error')) {
        document.getElementById('currentPaymentCategory-error').textContent = 'Please fill required field';
        if (!firstEmptyField) {
          firstEmptyField = document.getElementById('currentPaymentCategory');
          // document.getElementById('csi_member_id-error').textContent = 'Please fill required field';
        }
      }
    } else {
      document.getElementById('currentPaymentCategory-error').textContent = '';
    }
  }

  if (document.getElementById('newPaymentCategory')) {
    if (formValues.queries == 'Change request in registration category' && !formValues.newPaymentCategory) {
      if (document.getElementById('newPaymentCategory-error')) {
        document.getElementById('newPaymentCategory-error').textContent = 'Please fill required field';
        if (!firstEmptyField) {
          firstEmptyField = document.getElementById('newPaymentCategory');
          // document.getElementById('csi_member_id-error').textContent = 'Please fill required field';
        }
      }
    } else {
      document.getElementById('newPaymentCategory-error').textContent = '';
    }
  }

  if (document.getElementById('event_start_date')) {
    if (formValues.queries == 'Raise Cancellation Request' && !formValues.event_start_date) {
      if (document.getElementById('event_start_date-error')) {
        document.getElementById('event_start_date-error').textContent = 'Please fill required field';
        if (!firstEmptyField) {
          firstEmptyField = document.getElementById('event_start_date');
          // document.getElementById('csi_member_id-error').textContent = 'Please fill required field';
        }
      }
    } else {
      document.getElementById('event_start_date-error').textContent = '';
    }
  }

  if (document.getElementById('event_end_date')) {
    if (formValues.queries == 'Raise Cancellation Request' && !formValues.event_end_date) {
      if (document.getElementById('event_end_date-error')) {
        document.getElementById('event_end_date-error').textContent = 'Please fill required field';
        if (!firstEmptyField) {
          firstEmptyField = document.getElementById('event_end_date');
          // document.getElementById('csi_member_id-error').textContent = 'Please fill required field';
        }
      }
    } else {
      document.getElementById('event_end_date-error').textContent = '';
    }
  }

  if (document.getElementById('refundPaymentCategory')) {
    if (formValues.queries == 'Refund status' && !formValues.refundPaymentCategory) {
      if (document.getElementById('refundPaymentCategory-error')) {
        document.getElementById('refundPaymentCategory-error').textContent = 'Please fill required field';
        if (!firstEmptyField) {
          firstEmptyField = document.getElementById('refundPaymentCategory');
          // document.getElementById('csi_member_id-error').textContent = 'Please fill required field';
        }
      }
    } else {
      document.getElementById('refundPaymentCategory-error').textContent = '';
    }
  }

  if (document.getElementById('transaction_id')) {
    if (formValues.queries == 'Refund status' && !formValues.transaction_id) {
      if (document.getElementById('transaction_id-error')) {
        document.getElementById('transaction_id-error').textContent = 'Please fill required field';
        if (!firstEmptyField) {
          firstEmptyField = document.getElementById('transaction_id');
          // document.getElementById('csi_member_id-error').textContent = 'Please fill required field';
        }
      }
    } else {
      document.getElementById('transaction_id-error').textContent = '';
    }
  }

  if (document.getElementById('rrn_number')) {
    if (formValues.queries == 'Refund status' && !formValues.rrn_number) {
      if (document.getElementById('rrn_number-error')) {
        document.getElementById('rrn_number-error').textContent = 'Please fill required field';
        if (!firstEmptyField) {
          firstEmptyField = document.getElementById('rrn_number');
          // document.getElementById('csi_member_id-error').textContent = 'Please fill required field';
        }
      }
    } else {
      document.getElementById('rrn_number-error').textContent = '';
    }
  }

  return firstEmptyField;
}
