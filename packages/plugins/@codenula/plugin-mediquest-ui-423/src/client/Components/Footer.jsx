import { Link } from 'react-router-dom';
import '../assets2/css/main.min.css';
import '../assets2/css/external.css';
import { MEDIQUEST_URL_IMG } from '../myvars';

const Footer = (props) => {
  return (
    <footer className="footer-cntr">
      {/* <div className="container">
        <div className="footer-logo">
          <Link to="/home2">
            {props.footerData && props.footerData.company_logo.length > 0 && (
              <img
                src={
                  props.footerData && props.footerData.company_logo.length > 0
                    ? `${MEDIQUEST_URL_IMG}${props.footerData.company_logo[0].url}`
                    : ''
                }
                alt=""
              />
            )}
            {props.footerData && props.footerData.company_logo.length <= 0 && props.footerData.company_name}
          </Link>
        </div>
        <nav className="footer-navbar">
          <ul className="menu-list">
            <li>
              <Link to="/policies#termsConditions">{props.footerData.terms_conditions}</Link>
            </li>
            <li>
              <Link to="/policies#privacyPolicy">{props.footerData.privacy_policy}</Link>
            </li>
            <li>
              <Link to="/policies#cancellationsRefund">{props.footerData.cancellation_refunds}</Link>
            </li>
            <li>
              <Link to="/about#aboutUsBegin">{props.footerData.abount_us}</Link>
            </li>
            <li>
              <Link to="/contact-us#contactUsBegin">{props.footerData.contact_us}</Link>
            </li>
          </ul>
        </nav>
      </div> */}

<div className="container">
        <div className="footer-logo">
          <Link to="https://www.accasia.in/">
            {props.footerData && props.footerData.company_logo && props.footerData.company_logo.length > 0 && (
              <img
                src={
                  props.footerData && props.footerData.company_logo.length > 0
                    ? `${MEDIQUEST_URL_IMG}${props.footerData.company_logo[0].url}`
                    : ''
                }
                alt=""
              />
            )}
            {props.footerData && props.footerData.company_logo && props.footerData.company_logo.length <= 0 && props.footerData.company_name}
          </Link>
        </div>
        <nav className="footer-navbar">
          <ul className="menu-list">
            <li>
              <Link to="https://www.accasia.in/terms-and-condition">{props.footerData.terms_conditions}</Link>
            </li>
            <li>
              <Link to="https://www.accasia.in/terms-and-condition">{props.footerData.privacy_policy}</Link>
            </li>
            <li>
              <Link to="https://www.accasia.in/terms-and-condition">{props.footerData.cancellation_refunds}</Link>
            </li>
            <li>
              <Link to="https://www.accasia.in/about">{props.footerData.abount_us}</Link>
            </li>
            <li>
              <Link to="https://www.accasia.in/contact">{props.footerData.contact_us}</Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="rights">
        <div className="container">
          <p>{props.footerData.rights_reserved}</p>
          <p>{props.footerData.owned_by}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
