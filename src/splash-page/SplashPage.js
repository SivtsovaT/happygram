import React, { useState } from 'react';
import './SplashPage.scss';
import logo from '../images/logo.png';

function SplashPage() {
  const [buttonVisible, setButtonVisible] = useState(false);
  const showContinueButton = () => {
    setTimeout(() => {
      setButtonVisible(true);
    }, 2000);
  };
  showContinueButton();

  const showNextPage = () => {
    window.location.replace('/signin');
  };
  return (
    <div className="content">
      <img className="logo-image" src={logo} alt="logo" />
      <h1 className="project-header">HAPPYGRAM</h1>
      <div className="project-main">Welcome to the project</div>
      {
				buttonVisible && <button onClick={showNextPage} className="btn btn-295">CONTINUE</button>
			}
    </div>
  );
}

export default SplashPage;
