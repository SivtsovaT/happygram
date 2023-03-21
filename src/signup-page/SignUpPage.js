import React, { useState } from 'react';
import './SignUpPage.scss';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons/faPhone';
import back from '../images/back.png';
import hide from '../images/hide.png';
import { db, auth } from '../firebase';
import Popup from '../popup-page/Popup';

function SignUpPage() {
  const [passwordShown, setPasswordShown] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupVisible, setPopupVisible] = useState(false);

  const togglePassword = () => {
    setPasswordShown(!passwordShown);
  };
  const showPhonePage = () => {
    window.location.replace('/phone');
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    if (name.length === 0) {
      setPopupVisible(true);
      setPopupMessage('The field "name" cannot be empty');
      setTimeout(() => {
        setPopupVisible(false);
      }, 2000);
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
      setPopupVisible(true);
      setPopupMessage('Please enter a valid email');
      setTimeout(() => {
        setPopupVisible(false);
      }, 2000);
    } else if (password.length < 6) {
      setPopupVisible(true);
      setPopupMessage('Password length cannot be less than 6 characters');
      setTimeout(() => {
        setPopupVisible(false);
      }, 2000);
    } else if (password.valueOf() !== confirmPassword.valueOf()) {
      setPopupVisible(true);
      setPopupMessage('Confirm your password please');
      setTimeout(() => {
        setPopupVisible(false);
      }, 2000);
    } else {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, `users/${userCredential.user.uid}`);
      await setDoc(userRef, {
        displayName: name,
        email,
        background: 'https://bogatyr.club/uploads/posts/2021-11/thumbs/1636931398_64-bogatyr-club-p-fon-gradient-svetlii-64.png',
      });
      setPopupVisible(true);
      setPopupMessage('Account has been created');
      setTimeout(() => {
        setPopupVisible(false);
      }, 3000);
      setTimeout(() => {
        window.location.replace('/search');
      }, 1000);
    }
  };
  return (
    <div className="content">
      <Link to="/signin" className="link-panel">
        <img src={back} alt="back" />
      </Link>
      <div className="signup-wrapper">
        <div className="project-main">Create your account here</div>
        <div className="input-signup-wrapper">
          <input
            className="input-log height-67"
            name="name"
            type="text"
            placeholder="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <input
            className="input-log height-67"
            name="email1"
            type="email"
            placeholder="Email"
            onChange={(event) => setEmail(event.target.value)}
            value={email}
          />
          <div className="password-wrapper">
            <input
              className="input-log height-58"
              name="password"
              type={passwordShown ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <div className="password-image">
              <button style={{ backgroundColor: 'rgba(28,28,28,0)', border: 'none', width: '10px' }} type="button" onClick={togglePassword}>
                <img src={hide} alt="hide" />
              </button>
            </div>
          </div>
          <div className="password-wrapper">
            <input
              className="input-log height-58"
              type={passwordShown ? 'text' : 'password'}
              placeholder=" Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="password-image">
              <button style={{ backgroundColor: 'rgba(28,28,28,0)', border: 'none', width: '10px' }} type="button" onClick={togglePassword}>
                <img src={hide} alt="hide" />
              </button>
            </div>
          </div>
        </div>
        <button type="button" onClick={showPhonePage} className="phone-btn">
          <div>Sign Up by phone</div>
          <FontAwesomeIcon icon={faPhone} />
        </button>
        {
            popupVisible && <Popup text={popupMessage} />
        }
      </div>
      <button type="button" onClick={handleSignup} className="btn btn-295">Sign up</button>
    </div>
  );
}

export default SignUpPage;
