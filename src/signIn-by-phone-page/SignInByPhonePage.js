import React, { useEffect, useState } from 'react';
import './SignInByPhonePage.scss';
import { Link } from 'react-router-dom';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import back from '../images/back.png';
import app from '../firebase';

function SignInByPhonePage() {
  const countryCode = '+38';
  const [phoneNumber, setPhoneNumber] = useState(countryCode);
  const [OTP, setOTP] = useState('');
  const [otpVisible, setOtpVisible] = useState(false);
  const [phoneVisible, setPhoneVisible] = useState(true);
  const [counter, setCounter] = useState(60);

  const otpStyles = {
    display: otpVisible ? 'block' : 'none',
  };

  const phoneStyles = {
    display: phoneVisible ? 'block' : 'none',
  };

  const showPhone = () => {
    setOtpVisible(false);
    setPhoneVisible(true);
  };

  const handleChange = (event) => {
    setPhoneNumber(event.target.value);
  };

  const auth = getAuth(app);

  const generateRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      },
    }, auth);
  };
  const requestOtp = (event) => {
    event.preventDefault();
    if (phoneNumber.length === 13) {
      generateRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      signInWithPhoneNumber(auth, phoneNumber, appVerifier)
        .then((confirmationResult) => {
          window.confirmationResult = confirmationResult;
          setOtpVisible(true);
          setPhoneVisible(false);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };
  const verifyOtp = (event) => {
    const otp = event.target.value;
    setOTP(otp);
    if (otp.length === 6) {
      const { confirmationResult } = window;
      confirmationResult.confirm(otp).then((result) => {
        const { user } = result;
        console.log(user);
        setTimeout(() => {
          window.location.replace('home');
        }, 1000);
      }).catch(((error) => {
        console.log(error.message);
      }));
    }
  };
  useEffect(() => {
    if (counter > 1) {
      setTimeout(() => setCounter(counter - 1), 1000);
    } else {
      window.location.replace('signin');
    }
  }, [counter]);

  return (
    <div className="content">
      <Link to="/signin" className="link-panel">
        <img src={back} alt="back" />
      </Link>

      <div style={phoneStyles} className="signup-wrapper">

        <div id="recaptcha-container" />
        <div className="project-main">
          <div className="enter-phone">Enter your phone number here</div>
        </div>
        <div style={{ position: 'relative' }} className="input-phone-wrapper">
          <input
            className="input-log height-67"
            type="text"
            placeholder="Enter phone number"
            value={phoneNumber}
            onChange={handleChange}
          />
          <button type="button" style={{ top: '570px', left: '6px' }} onClick={requestOtp} className="btn btn-295">Send phone number</button>
        </div>
      </div>
      <div style={otpStyles} className="signup-wrapper">
        <button type="button" className="link-panel" onClick={showPhone}>
          <img src={back} alt="back" />
        </button>

        <div className="otp-header">
          <div className="otp-title">
            <div className="otp-value">00</div>
            <div className="otp-value">:</div>
            {
              counter < 10 ? <div className="otp-value">0</div> : null
            }
            <div className="otp-value">{counter}</div>
          </div>
          <div className="descr">
            Type the verification code
            we’ve sent you
          </div>
        </div>
        <div className="otp-input-wrapper">
          <input
            className="input-log height-67"
            type="text"
            placeholder="Otp"
            value={OTP}
            onChange={verifyOtp}
          />
        </div>
        <button type="button" onClick={showPhone} className="send-again">Send again</button>
      </div>

    </div>
  );
}

export default SignInByPhonePage;
