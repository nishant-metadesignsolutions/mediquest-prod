import { Link } from 'react-router-dom';
import StyledText from './StyledText.jsx';
import '../assets2/css/external.css';
import '../assets2/css/main.min.css';
import '../assets2/css/override.css';

export const Venue = (props) => {
  return (
    <>
      <section className="venue-box">
        <div className="container">
          <h4>{props.event.venue_title}</h4>
          <p className="heading24">{props.event.venue[0].venue_name}</p>
          <div className="row-flex">
            <div className="col-left">
              <div className="mapimg">
                <StyledText className="pdf-view" htmlContent={props.event ? props.event.venue_map_img_link : ''} />
              </div>
            </div>
            <div className="col-right">
              <p className="size24 font-geometos">{props.event.venue[0].venue_name}</p>
              <p className="size20 textwhite"><strong>Address:</strong></p>
              <p className="size20 textwhite">
              <StyledText className="venue-address" htmlContent={props.event ? props.event.venue[0].venue_address : ''} />
                <br />
                Phone: <a href={props.event.venue[0].venue_phone_number}>{props.event.venue[0].venue_phone_number}</a>
              </p>
              <Link to={props.event.venue[0].venue_map_link}>
                <button className="btn btn-white mg-t-20">Get Directions</button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
