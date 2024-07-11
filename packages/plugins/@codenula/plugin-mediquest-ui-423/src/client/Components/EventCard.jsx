
import { Link } from 'react-router-dom';
import '../assets2/css/main.min.css';
import '../assets2/css/external.css';
import StyledText from './StyledText';
import { MEDIQUEST_URL_IMG } from '../myvars';

const EventCard = (props) => {
  return (
    <div className="program-row">
      <div className="program-left">
        <div className="pro-img">
          <img src={`${MEDIQUEST_URL_IMG}${props.event.event_card_image[0].url}`} alt="" />
        </div>
      </div>
      <div className="program-right">
        <span className="program-date">
          {new Date(new Date(props.event.event_date).toISOString().split('T')[0]).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </span>
        <span className="program-year">{props.event.event_title}</span>
        <StyledText htmlContent={props.event.event_description} />
        <div className="pro-btns">
          <Link to={`/events/${props.event.id}`} className="pro-btns">
            <button className="btn btn-blue text-uppercare">Read More</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
