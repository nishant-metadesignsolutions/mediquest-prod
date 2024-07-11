// @ts-nocheck
import { Plugin } from '@nocobase/client';
import './assets2/css/main.min.css';
import './assets2/css/external.css';
import './assets2/css/override.css';
import Navbar from './Components/Navbar';
import About from './Pages/About';
import Login from './Pages/Login';
import PaymentPage from './Pages/PaymentPage';
import EventDetails from './Pages/EventDetails';
import { RegistrationForm } from './Pages/RegistrationForm';
import { PolicyPage } from './Pages/PolicyPage';
import { ContactUs } from './Pages/ContactUs';
import RegistrationCompletePage from './Pages/RegistrationCompletePage';
import PaymentSuccessPage from './Pages/PaymentSuccessPage';
import PaymentFailurePage from './Pages/PaymentFailurePage';
import PaymentPendingPage from './Pages/PaymentPendingPage';
import PaymentSuccessOnMakePayment from './Pages/PaymentSuccessOnMakePayment';
import { Home2 } from './Pages/Home2';
//import { Home2 } from './Pages/test';
import { EventDetailsProvider } from './context/EventDetailsProvider';
import { LocationDetailsProvider } from './context/LocationDetailsProvider';
import { FacultyDetailsProvider } from './context/FacultyDetailsProvider';
import React from 'react';
import { FacultyDetailsPage } from './Pages/FacultyDetailsPage';
import { addMetaTags } from './utils/getData';
import { AttendeeSuccess } from './Pages/AttendeeSuccess';
import { ErrorPage } from './Pages/ErrorPage';
// import { Hello } from './Components/Hello';
import { GroupReg } from './Pages/GroupReg';
import { GroupRegComplete } from './Pages/GroupRegComplete';
import { HelpAndSupport } from './Pages/HelpAndSupport';
import { CancellationRegistration } from './Pages/CancellationRegistration';
import { GroupAttendeeSuccess } from './Pages/GroupAttendeeSuccess';

export class PluginMediquestUiClient extends Plugin {
  async afterAdd() {
    // await this.app.pm.add()
  }

  async beforeLoad() {}

  // You can get and modify the app instance here
  async load() {
    // console.log(this.app);
    // this.app.addComponents({})
    // this.app.addScopes({})
    // this.app.addProvider()
    // this.app.addProviders()
    // this.app.router.add()
    // Find the favicon link element
    // Find all favicon link elements
    const faviconLinks = document.querySelectorAll('link[rel="icon"]');

    // Remove each favicon link element from the DOM
    faviconLinks.forEach((link) => {
      link.remove();
    });

    // Find all shortcut icon link elements
    const shortcutIconLinks = document.querySelectorAll('link[rel="shortcut icon"]');

    // Remove each shortcut icon link element from the DOM
    shortcutIconLinks.forEach((link) => {
      link.remove();
    });

    // Find all Apple touch icon link elements
    const appleTouchIconLinks = document.querySelectorAll('link[rel="apple-touch-icon"]');

    // Remove each Apple touch icon link element from the DOM
    appleTouchIconLinks.forEach((link) => {
      link.remove();
    });
    // Find all manifest link elements
    const manifestLinks = document.querySelectorAll('link[rel="manifest"]');

    // Remove each manifest link element from the DOM
    manifestLinks.forEach((link) => {
      link.remove();
    });
    addMetaTags();

    // this.app.addComponents({ Navbar });

    this.app.router.add('/about', {
      path: '/about',
      element: <About />,
    });

    this.app.router.add('login', {
      path: '/login',
      element: <Login />,
    });

    this.router.add('not-found', {
      path: '*',
      element: <ErrorPage />,
    });
    this.app.router.add('/faculty-details', {
      path: '/faculty-details',
      element: <FacultyDetailsPage />,
    });
    this.app.router.add('/events/:eventId', {
      path: '/events/:eventId',
      element: <EventDetails />,
    });
    this.app.router.add(`/events/:eventId/register`, {
      path: '/events/:eventId/register',
      element: <RegistrationForm />,
    });

    this.app.router.add(`/events/:eventId/groupregistration`, {
      path: '/events/:eventId/groupregistration',
      element: <GroupReg />,
    });

    this.app.router.add(`/events/query`, {
      path: '/events/query',
      element: <HelpAndSupport />,
    });

    // this.app.router.add(`/events/cancellation`, {
    //   path: '/events/cancellation',
    //   element: <CancellationRegistration />,
    // });

    this.app.router.add(`/events/:eventId/register/payment/:formValues/:amtToPay/:attendeeId/:orderId`, {
      path: '/events/:eventId/register/payment/:formValues/:amtToPay/:attendeeId/:orderId',
      element: <PaymentPage />,
    });
    this.app.router.add(`/events/:eventId/registration-completed/:attendeeId`, {
      path: '/events/:eventId/registration-completed/:attendeeId',
      element: <RegistrationCompletePage />,
    });

    this.app.router.add(`/events/:eventId/group-registration-completed/:attendeeId`, {
      path: '/events/:eventId/group-registration-completed/:attendeeId',
      element: <GroupRegComplete />,
    });

    this.app.router.add(`/events/:eventId/payment-successfull/:attendeeId`, {
      path: '/events/:eventId/payment-successfull/:attendeeId',
      element: <PaymentSuccessPage />,
    });
    this.app.router.add(`/payment-success`, {
      path: '/payment-success',
      element: <PaymentSuccessOnMakePayment />,
    });
    this.app.router.add(`/events/:eventId/payment-failed/:attendeeId`, {
      path: '/events/:eventId/payment-failed/:attendeeId',
      element: <PaymentFailurePage />,
    });
    this.app.router.add(`/payment-pending`, {
      path: '/payment-pending',
      element: <PaymentPendingPage />,
    });
    this.app.router.add(`/home2`, {
      path: '/home2',
      element: <Home2 />,
    });
    this.app.router.add(`/policies`, {
      path: '/policies',
      element: <PolicyPage />,
    });
    this.app.router.add(`/contact-us`, {
      path: '/contact-us',
      element: <ContactUs />,
    });
    this.app.router.add(`/events/:eventId/registered/:attendeeId`, {
      path: '/events/:eventId/registered/:attendeeId',
      element: <AttendeeSuccess />,
    });
    this.app.router.add(`/events/:eventId/registered-group/:attendeeId`, {
      path: '/events/:eventId/registered-group/:attendeeId',
      element: <GroupAttendeeSuccess />,
    });
    this.app.addProviders([EventDetailsProvider, LocationDetailsProvider, FacultyDetailsProvider]);
  }
}

export default PluginMediquestUiClient;
