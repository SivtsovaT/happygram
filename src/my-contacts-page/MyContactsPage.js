import React, { useEffect, useState } from 'react';
import './MyContactsPage.scss';
import { getAuth } from 'firebase/auth';
import {
  doc, collection, getDocs, getDoc,
} from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlass';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons/faRightFromBracket';
import { Link } from 'react-router-dom';
import avatar from '../images/search-page/avatar.jpg';
import MessagesPage from '../messages-page/MessagesPage';
import { db } from '../firebase';
import back from '../images/back.png';

function MyContactsPage() {
  const [searchValue, setSearchValue] = useState('');
  const [currentAuth, setCurrentAuth] = useState(null);
  const [userData, setUserData] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [contactDisplayName, setContactDisplayName] = useState('');
  const [invisibleHome, setInvisibleHome] = useState(false);
  const [contactId, setContactId] = useState('');

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
    const getContacts = async () => {
      const data = await getDocs(collection(db, `users/${currentAuth}/contacts`));
      // eslint-disable-next-line no-shadow
      setContacts(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    getContacts();
  }, [currentAuth]);

  useEffect(() => {
    setFilteredContacts(
      contacts.filter(
        (contact) => contact.displayName.toLowerCase().includes(searchValue.toLowerCase()),
      ),
    );
  }, [searchValue, contacts]);

  const showHome = () => {
    setInvisibleHome((prevState) => !prevState);
  };

  const showContact = async (id) => {
    // eslint-disable-next-line no-shadow
    const contactId = id;
    const contactRef = doc(db, `users/${currentAuth}/contacts/${contactId}`);
    const docSnap = await getDoc(contactRef);
    await setContactDisplayName(docSnap.data().displayName);
    await setContactId(contactId);
    setInvisibleHome(true);
  };

  const logout = () => {
    window.location.replace('/signin');
  };

  return (
    <>
      {
            invisibleHome && (
            <MessagesPage
              contactDisplayName={contactDisplayName}
              contactId={contactId}
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
          <FontAwesomeIcon onClick={logout} style={{ width: '30px', height: '30px' }} icon={faRightFromBracket} />
        </div>
        <Link to="/search" className="link-panel">
          <img src={back} alt="back" />
        </Link>

        <div className="users-list">
          {
              filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="user-wrapper"
                >
                  <button style={{ backgroundColor: 'rgba(28,28,28,0)', border: 'none' }} type="button" onClick={() => showContact(contact.id)}>
                    <img className="user-avatar" src={avatar} alt="avatar" />
                  </button>
                  <div className="user-info">
                    <div className="project-main">{contact.displayName}</div>
                    <div className="user-email">{contact.email}</div>
                  </div>
                </div>
              ))
            }
        </div>
        <button type="button" className="btn btn-295">CONTINUE</button>
      </div>
    </>
  );
}

export default MyContactsPage;
