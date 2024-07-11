// ErrorPage.jsx

import './ErrorPage.css';

const ErrorPage = ({ errorMessage }) => {
  return (
    <div className="error-container">
      <h1>Error</h1>
      <p>{errorMessage}</p>
    </div>
  );
};

export default ErrorPage;
