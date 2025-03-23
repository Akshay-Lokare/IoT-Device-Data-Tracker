import React from "react";

const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-container">
      {/* <img src="/assets/404.jpg" alt="Background" className="not-found-bg" /> */}
      <div className="not-found-content">
        <h1>404</h1>
        <p>Page Not Found</p>
        <a href="/" className="home-button">Go Home</a>
      </div>
    </div>
  );
};

export default NotFoundPage;
