import React, { useState } from 'react';
import './SignInPage.scss';
import { Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons/faPhone';
import { faFaceFrown } from '@fortawesome/free-solid-svg-icons/faFaceFrown';
import hide from '../images/hide.png';
import { auth } from '../firebase';

function SignInPage() {
  const [passwordShown, setPasswordShown] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const togglePassword = () => {
    setPasswordShown(!passwordShown);
  };

  const showPhonePage = () => {
    window.location.replace('/phone');
  };

  const login = async () => {
    try {
      const user = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword,
      );
      console.log(user);
      window.location.replace('/search');
    } catch {
      alert('Incorrect email or password');
    }
  };

  return (
    <div className="content">
      <div className="signup-wrapper">
        <div style={{ marginTop: '150px' }} className="project-main">Enter your email and password here</div>
        <div className="input-signup-wrapper">
          <input
            className="input-log height-67"
            name="email1"
            type="email"
            placeholder="Email"
            onChange={(event) => setLoginEmail(event.target.value)}
            value={loginEmail}
          />
          <div className="password-wrapper">
            <input
              className="input-log height-58"
              name="password"
              type={passwordShown ? 'text' : 'password'}
              placeholder="Password"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
            />
            <div className="password-image">
              <button style={{ backgroundColor: 'rgba(28,28,28,0)', border: 'none', width: '10px' }} type="button" onClick={togglePassword}>
                <img src={hide} alt="hide" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="have-account-signup-block">
        <div className="have-account-title">Don’t have an account?</div>
        <Link className="link" to="/signup">
          <div className="have-account-signup">Sign up</div>
        </Link>
      </div>
      <div className="forgot-pass-wrapper">
        <Link className="forgot-pass" to="/reset">Forgot Password?</Link>
        <div style={{ marginTop: '-12px', marginLeft: '5px' }}>
          <FontAwesomeIcon icon={faFaceFrown} />
        </div>
      </div>
      <button type="button" onClick={login} className="btn btn-295">Log In</button>
      <div className="project-main or-login">OR</div>
      <button type="button" onClick={showPhonePage} className="phone-btn">
        <div>Sign Up by phone</div>
        <FontAwesomeIcon icon={faPhone} />
      </button>

    </div>
  );
}

export default SignInPage;
