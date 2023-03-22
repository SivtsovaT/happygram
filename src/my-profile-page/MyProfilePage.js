import React, { useEffect, useState } from 'react';
import './MyProfilePage.scss';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import back from '../images/back.png';
import avatar from '../images/search-page/avatar.jpg';
import { db, storage } from '../firebase';

function MyProfilePage() {
  const [userImage, setUserImage] = useState('');
  const [url, setUrl] = useState(null);
  const [downloadImageVisible, setDownloadImageVisible] = useState(false);
  const [downloadButtonVisible, setDownloadButtonVisible] = useState(false);
  const [saveButtonVisible, setSaveButtonVisible] = useState(false);
  const [currentAuth, setCurrentAuth] = useState(null);
  const [userData, setUserData] = useState([]);

  const getAuthUser = async () => {
    try {
      const auth = await getAuth();
      const userId = auth?.currentUser?.uid || null;
      setCurrentAuth(userId);
      if (!userId) {
        setTimeout(() => {
          getAuthUser();
        }, 2000);
      }
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    if (!currentAuth) {
      return;
    }
    const getUser = async () => {
      const docRef = doc(db, 'users', currentAuth);
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();
      setUserData(data);
    };
    getUser();
  }, [currentAuth]);
  useEffect(() => {
    const auth = async () => {
      await getAuthUser();
    };
    auth();
  }, []);
  const myName = userData.displayName;
  const myEmail = userData.email;
  const myAvatar = userData.userAvatar;
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setUserImage(e.target.files[0]);
      setDownloadButtonVisible(true);
    }
  };
  const handleSubmit = async () => {
    const imageId = new Date().toISOString();
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const imageRef = ref(storage, `images/users/${userId}/${imageId}`);
    uploadBytes(imageRef, userImage).then(() => {
      // eslint-disable-next-line no-shadow
      getDownloadURL(imageRef).then((url) => {
        setUrl(url);
      }).catch((error) => {
        console.log(error.message, 'error getting image url');
      }).catch((error) => {
        console.log(error.message, 'error getting image url');
      });
      setDownloadImageVisible(true);
      setDownloadButtonVisible(false);
      setSaveButtonVisible(true);
    });
  };
  const saveImage = async () => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const userRef = doc(db, `users/${userId}`);
    await setDoc(userRef, {
      ...userData,
      userAvatar: url,
    }, { merge: true });
    const userRef1 = doc(db, `users/${userId}`);
    const docSnap = await getDoc(userRef1);
    const data = docSnap.data();
    setUserData(data);
    setSaveButtonVisible(false);
  };
  return (
    <div className="content">
      <Link to="/contacts" className="link-panel">
        <img src={back} alt="back" />
      </Link>
      <div className="profile-wrapper">
        <div className="avatar-wrapper">
          {
            // eslint-disable-next-line jsx-a11y/img-redundant-alt,no-nested-ternary
            downloadImageVisible ? <img className="profile-image" src={url} alt="profile-image" />
            // eslint-disable-next-line jsx-a11y/img-redundant-alt
              : (
            // eslint-disable-next-line jsx-a11y/img-redundant-alt
                myAvatar ? <img src={myAvatar} alt="avatar" className="profile-image" />
                // eslint-disable-next-line jsx-a11y/img-redundant-alt
                  : <img className="profile-image" src={avatar} alt="profile-image" />
              )
          }

          <div className="fileload-group-profile">
            <div className="file-load-block">
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label className="input-label">
                <FontAwesomeIcon style={{ width: '20px', height: '20px' }} icon={faCamera} />
                <input style={{ opacity: '0' }} type="file" onChange={handleImageChange} value="" className="file-inp" />
              </label>
            </div>
            {
                downloadButtonVisible && <button className="input-btn" type="button" onClick={handleSubmit}>Download</button>
            }
            {
                saveButtonVisible && (
                <button type="button" onClick={saveImage}>save</button>
                )
            }
          </div>
        </div>
        <div className="profile-user-info">
          <div className="project-main">{myName}</div>
          <div className="user-email">{myEmail}</div>
        </div>
        <div className="profile-main">
          <div className="profile-block">
            <Link to="/contacts" className="profile-link">
              <div className="my-groups-title">MY CONTACTS</div>
            </Link>
          </div>
          <div className="profile-block">
            <div className="profile-create">
              <Link to="/groupslist" className="profile-link">
                <div className="my-groups-title">MY GROUPS</div>
              </Link>
              <div className="my-groups-wrapper" style={{ marginLeft: '85px' }}>
                <div className="my-groups-title">Create group</div>
                <Link to="/group">
                  <FontAwesomeIcon icon={faUserGroup} />
                </Link>
              </div>
            </div>
          </div>
          <div className="profile-block">
            <div className="profile-create">
              <Link to="/channelslist" className="profile-link">
                <div className="my-groups-title">MY CHANNELS</div>
              </Link>
              <div className="my-groups-wrapper" style={{ marginLeft: '70px' }}>
                <div className="my-groups-title">Create group</div>
                <Link to="/channel">
                  <FontAwesomeIcon icon={faUserGroup} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyProfilePage;
