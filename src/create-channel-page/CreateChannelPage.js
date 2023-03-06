import React, { useEffect, useState } from 'react';
import './CreateChannelPage.scss';
import { getAuth } from 'firebase/auth';
import {
  addDoc, collection, doc, getDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import back from '../images/back.png';
import group from '../images/create-group-page/group.png';
import { db, storage } from '../firebase';

function CreateChannelPage() {
  const [channelName, setChannelName] = useState('');
  const [channelImage, setChannelImage] = useState('');
  const [httpPending, setHttpPending] = useState(false);
  const [url, setUrl] = useState(null);
  const [downloadImageVisible, setDownloadImageVisible] = useState(false);
  const [downloadButtonVisible, setDownloadButtonVisible] = useState(false);
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
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setChannelImage(e.target.files[0]);
      setDownloadButtonVisible(true);
    }
  };
  const handleSubmit = async () => {
    const imageId = new Date().toISOString();
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const imageRef = ref(storage, `images/channels/${userId}/${channelImage}/${imageId}`);
    uploadBytes(imageRef, channelImage).then(() => {
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
    });
  };
  const createChannel = async (event) => {
    event.preventDefault();
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    if (httpPending) {
      return;
    }
    setHttpPending(true);
    try {
      await addDoc(collection(db, 'channels'), {
        channelName,
        channelAdmin: userId,
        channelAvatar: url || '',
        adminName: myName,
        adminEmail: myEmail,
      }, { merge: true });
      setHttpPending(false);
      setChannelName('');
      window.location.replace('/search');
    } catch (e) {
      console.log(e);
      setHttpPending(false);
    }
  };

  return (
    <div className="content">
      <Link to="/contacts" className="link-panel">
        <img src={back} alt="back" />
      </Link>
      <div className="signup-wrapper" style={{ marginTop: '200px' }}>
        {
                // eslint-disable-next-line jsx-a11y/img-redundant-alt
                downloadImageVisible ? <img className="group-image" src={url} alt="group-image" />
                // eslint-disable-next-line jsx-a11y/img-redundant-alt
                  : <img className="group-image" src={group} alt="group-image" />
            }

        <div className="fileload-group">
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
        </div>
        <input
          className="input-log input-group"
          name="name"
          type="text"
          placeholder="Enter channel's name"
          value={channelName}
          onChange={(event) => setChannelName(event.target.value)}
        />
      </div>
      <button type="button" onClick={createChannel} className="btn btn-295">CREATE CHANNEL</button>
    </div>
  );
}

export default CreateChannelPage;
