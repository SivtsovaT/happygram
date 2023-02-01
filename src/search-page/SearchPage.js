import React, { useEffect, useState } from 'react';
import './SearchPage.scss';
import { getAuth } from 'firebase/auth';
import {
  doc, collection, getDocs, query, setDoc, getDoc,
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

  useEffect(() => {
    const getUsers = async () => {
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        setUsers(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
    };

    getUsers();
  }, []);

  useEffect(() => {
    setFilteredUsers(
      users.filter(
        (user) => user.displayName.toLowerCase().includes(searchValue.toLowerCase()),
      ),
    );
  }, [searchValue, users]);

  const addUserToContacts = async (id, displayName, email) => {
    const contactId = id;
    const contactRef = doc(db, `users/${currentAuth}/contacts/${contactId}`);
    await setDoc(contactRef, {
      displayName,
      email,
    }, { merge: true });
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
									filteredUser.displayName == myName ? <div className="project-main">(you)</div>
									  : (
  <button
    className="btn btn-28"
    style={{ marginLeft: '80px' }}
    onClick={() => addUserToContacts(
													  filteredUser.id,
													  filteredUser.displayName,
													  filteredUser.email,
												  )}
  >
    <FontAwesomeIcon icon={faUserPlus} />
  </button>
									  )
								}
  </div>
					))
				}
      </div>
      <img className="logo-image search-image" src={logo} alt="logo" />
      <button onClick={showNextPage} className="btn btn-295">CONTINUE</button>
    </div>
  );
}

export default SearchPage;
