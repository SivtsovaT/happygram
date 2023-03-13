import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import {
  collection, deleteDoc, doc, getDoc, getDocs, query, where,
} from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlass';
import { Link } from 'react-router-dom';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { db } from '../firebase';
import back from '../images/back.png';
import avatar from '../images/create-group-page/group.png';
import AdminChannelPage from '../admin-channel-page/AdminChannelPage';

function ChannelsListPage() {
  const [channels, setChannels] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [filteredChannels, setFilteredChannels] = useState([]);
  const [currentAuth, setCurrentAuth] = useState(null);
  const [userData, setUserData] = useState([]);
  const [channelName, setChannelName] = useState('');
  const [invisibleHome, setInvisibleHome] = useState(false);
  const [channelAdmin, setChannelAdmin] = useState('');
  const [channelAdminName, setChannelAdminName] = useState('');
  const [channelAdminEmail, setChannelAdminEmail] = useState('');
  const [channelId, setChannelId] = useState('');
  const [channelAvatar, setChannelAvatar] = useState('');

  const stylesHome = {
    display: invisibleHome ? 'none' : 'flex',
  };
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

  useEffect(() => {
    if (!currentAuth) {
      return;
    }
    const getChannels = async () => {
      const q = query(collection(db, 'channels'), where('channelAdmin', '==', currentAuth));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setChannels(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
    };
    getChannels();
  }, [currentAuth]);

  useEffect(() => {
    setFilteredChannels(
      channels.filter(
        (channel) => channel.channelName.toLowerCase().includes(searchValue.toLowerCase()),
      ),
    );
  }, [searchValue, channels]);

  const showGroup = async (id) => {
    const groupRef = doc(db, `channels/${id}`);
    const docSnap = await getDoc(groupRef);
    await setChannelName(docSnap.data().channelName);
    await setChannelAdmin(docSnap.data().channelAdmin);
    await setChannelAdminName(docSnap.data().adminName);
    await setChannelAvatar(docSnap.data().channelAvatar);
    await setChannelAdminEmail(docSnap.data().adminEmail);
    setChannelId(id);
    setInvisibleHome(true);
  };
  const showHome = () => {
    setInvisibleHome((prevState) => !prevState);
  };
  const deleteGroup = async (id) => {
    const groupRef = doc(db, `channels/${id}`);
    await deleteDoc(groupRef);
    const q = query(collection(db, 'channels'), where('channelAdmin', '==', currentAuth));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(() => {
      // eslint-disable-next-line no-shadow
      setChannels(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });
  };

  return (
    <>
      {
                invisibleHome && (
                <AdminChannelPage
                  channelName={channelName}
                  channelAdmin={channelAdmin}
                  adminName={channelAdminName}
                  adminEmail={channelAdminEmail}
                  channelId={channelId}
                  channelAvatar={channelAvatar}
                  showHome={showHome}
                />
                )
            }
      <div style={stylesHome} className="content">
        <div className="users-header">
          <div className="password-wrapper">
            <input
              style={{ height: '36px', width: '100px' }}
              type="text"
              className="input-log"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
            <FontAwesomeIcon icon={faMagnifyingGlass} style={{ marginLeft: '-30px' }} />
          </div>
          <div className="project-main">
            Welcome,
            {' '}
            {userData.displayName}
            !
          </div>
        </div>
        <Link to="/contacts" className="link-panel">
          <img src={back} alt="back" />
        </Link>
        <div className="users-list">
          {
                        filteredChannels.map((filteredChannel) => (
                          // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                          <div key={filteredChannel.id} className="user-wrapper" style={{ position: 'relative' }}>
                            {/* eslint-disable-next-line jsx-a11y/alt-text */}
                            {
                                    filteredChannel.channelAvatar ? (
                                    // eslint-disable-next-line max-len
                                    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                                      <img
                                        className="user-avatar"
                                        src={filteredChannel.channelAvatar}
                                        alt="avatar"
                                        onClick={() => showGroup(filteredChannel.id)}
                                        onKeyUp={() => showGroup(filteredChannel.id)}
                                      />
                                    )
                                      : (
                                    // eslint-disable-next-line max-len
                                    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                                        <img
                                          className="user-avatar"
                                          src={avatar}
                                          alt="avatar"
                                          onClick={() => showGroup(filteredChannel.id)}
                                          onKeyUp={() => showGroup(filteredChannel.id)}
                                        />
                                      )
                                }
                            <div className="user-info">
                              <div className="project-main">{filteredChannel.channelName}</div>
                            </div>
                            <button type="button" style={{ position: 'absolute', right: '10px' }} className="btn btn-28" onClick={() => deleteGroup(filteredChannel.id)}>
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        ))
                    }
        </div>
      </div>
    </>
  );
}
export default ChannelsListPage;
