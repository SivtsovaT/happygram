import React, { useEffect, useState } from 'react';
import './SearchPage.scss';
import { getAuth } from 'firebase/auth';
import {
  doc, collection, getDocs, query, setDoc, getDoc, where,
} from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlass';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons/faRightFromBracket';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons/faUserPlus';
import logo from '../images/logo.png';
import avatar from '../images/search-page/avatar.jpg';
import { db } from '../firebase';

function SearchPage() {
  const [users, setUsers] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [channels, setChannels] = useState([]);
  const [filteredChannels, setFilteredChannels] = useState([]);
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
  useEffect(() => {
    if (!currentAuth) {
      return;
    }
    const getNut = async () => {
      const q = query(collection(db, 'channels', 'contacts'), where('channelAdmin', '==', currentAuth));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setChannels(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
    };
    getNut();
  }, [currentAuth]);

  const myName = userData.displayName;
  const myEmail = userData.email;

  useEffect(() => {
    const getUsers = async () => {
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setUsers(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
    };
    getUsers();
  }, []);
  useEffect(() => {
    const getChannels = async () => {
      const q = query(collection(db, 'channels'));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setChannels(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
    };
    getChannels();
  }, []);

  useEffect(() => {
    setFilteredUsers(
      users.filter(
        (user) => user.displayName.toLowerCase().includes(searchValue.toLowerCase()),
      ),
    );
  }, [searchValue, users]);

  useEffect(() => {
    setFilteredChannels(
      channels.filter(
        (channel) => channel.channelName.toLowerCase().includes(searchValue.toLowerCase()),
      ),
    );
  }, [searchValue, users]);

  const addUserToContacts = async (id, displayName, email) => {
    const contactRef = doc(db, `users/${currentAuth}/contacts/${id}`);
    await setDoc(contactRef, {
      displayName,
      email,
      id,
      blocked: 0,
      icon: 1,
      pin: 0,
    }, { merge: true });
  };
  const subscrube = async (id, channelName, channelAvatar) => {
    const contactRef = doc(db, `users/${currentAuth}/channelContacts/${id}`);
    await setDoc(contactRef, {
      channelName,
      channelAvatar,
      pin: 0,
    }, { merge: true });
    const groupRef1 = doc(db, `channels/${id}/contacts/${currentAuth}`);
    await setDoc(groupRef1, {
      id: currentAuth,
      displayName: myName,
      email: myEmail,
    }, { merge: true });
    window.location.replace('/contacts');
  };

  const showNextPage = (event) => {
    event.preventDefault();
    window.location.replace('contacts');
  };

  const logout = () => {
    window.location.replace('/signin');
  };

  return (
    <div className="content">
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
        <FontAwesomeIcon onClick={logout} style={{ width: '30px', height: '30px' }} icon={faRightFromBracket} />
      </div>
      <div className="users-list">
        {
          filteredUsers.map((filteredUser) => (
            <div key={filteredUser.id} className="user-wrapper">
              <img className="user-avatar" src={avatar} alt="avatar" />
              <div className="user-info">
                <div className="project-main">{filteredUser.displayName}</div>
                <div className="user-email">{filteredUser.email}</div>
              </div>
              {
                  filteredUser.displayName === myName ? <div className="project-main">(you)</div>
                    : (
                      <button type="button" className="btn btn-28" style={{ marginLeft: '80px' }} onClick={() => addUserToContacts(filteredUser.id, filteredUser.displayName, filteredUser.email)}>
                        <FontAwesomeIcon icon={faUserPlus} />
                      </button>
                    )
                }
            </div>
          ))
        }
        {
          filteredChannels.map((filteredChannel) => (
            <div key={filteredChannel.id} className="user-wrapper">
              <img className="user-avatar" src={avatar} alt="avatar" />
              <div className="user-info">
                <div className="project-main">{filteredChannel.channelName}</div>
              </div>
              <button
                className="btn phone-btn"
                type="button"
                  // className="btn btn-28"
                style={{ marginLeft: '80px', background: '#86cc18', color: 'white' }}
                onClick={() => {
                  // eslint-disable-next-line max-len
                  subscrube(filteredChannel.id, filteredChannel.channelName, filteredChannel.channelAvatar);
                }}
              >
                Subscribe
              </button>
            </div>
          ))
        }
      </div>
      <img className="logo-image search-image" src={logo} alt="logo" />
      <button type="button" onClick={showNextPage} className="btn btn-295">CONTINUE</button>
    </div>
  );
}

export default SearchPage;
