import React, { useState } from 'react';
import './ResetPasswordPage.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { Link } from 'react-router-dom';
import back from '../images/back.png';

function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      window.location.replace('signin');
    } catch {
      alert('Could not send reset email');
    }
  };

  return (
    <div className="content">
      <Link to="/signin" className="link-panel">
        <img src={back} alt="back" />
      </Link>
      <div className="project-main">Reset Password</div>
      <div style={{ marginTop: '30px' }} className="project-description">
        Please enter your email address to
        request a password reset
      </div>
      <FontAwesomeIcon icon={faEnvelope} style={{ marginBottom: '50px' }} />
      <div className="input-wrapper">
        <input
          className="input-log height-67"
          type="text"
          placeholder="Email"
          onChange={(event) => setEmail(event.target.value)}
          value={email}
        />
      </div>
      <button type="button" onClick={onSubmit} className="btn btn-295">Send new password</button>
    </div>
  );
}

export default ResetPasswordPage;
