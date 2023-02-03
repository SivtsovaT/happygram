import React from 'react';
import './Popup.scss';
import logo from '../images/logo.png';

function Popup({ text }) {
  return (
    <div className="popup-wrapper">
      <img style={{ marginTop: '20px', marginBottom: '30px' }} className="logo-image" src={logo} alt="logo" />
      <div className="project-main">{text}</div>
    </div>
  );
}

export default Popup;
