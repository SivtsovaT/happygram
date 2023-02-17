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
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import avatar from '../images/search-page/avatar.jpg';
import MessagesPage from '../messages-page/MessagesPage';
import { db } from '../firebase';
import back from '../images/back.png';
import GroupPage from '../group-page/GroupPage';

function MyContactsPage() {
  const [searchValue, setSearchValue] = useState('');
  const [currentAuth, setCurrentAuth] = useState(null);
  const [userData, setUserData] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [contactDisplayName, setContactDisplayName] = useState('');
  const [invisibleHome, setInvisibleHome] = useState(false);
  const [invisibleGroup, setInvisibleGroup] = useState(true);
  const [contactId, setContactId] = useState('');
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [groupAdmin, setGroupAdmin] = useState('');
  const [groupAdminName, setGroupAdminName] = useState('');
  const [groupAdminEmail, setGroupAdminEmail] = useState('');
  const [groupId, setGroupId] = useState('');
  const [groupAvatar, setGroupAvatar] = useState('');

  const stylesHome = {
    display: invisibleHome || !invisibleGroup ? 'none' : 'flex',
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
    if (!currentAuth) {
      return;
    }
    const getGroups = async () => {
      const data = await getDocs(collection(db, `users/${currentAuth}/groupContacts`));
      // eslint-disable-next-line no-shadow
      setGroups(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    getGroups();
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
  const showContactsList = () => {
    setInvisibleGroup(true);
    setInvisibleHome(false);
  };

  const showContact = async (id) => {
    // eslint-disable-next-line no-shadow
    const contactId = id;
    const contactRef = doc(db, `users/${currentAuth}/contacts/${contactId}`);
    const docSnap = await getDoc(contactRef);
    await setContactDisplayName(docSnap.data().displayName);
    await setContactId(contactId);
    setInvisibleHome(true);
    setInvisibleGroup(true);
  };
  const showGroup = async (id) => {
    const groupRef = doc(db, `groups/${id}`);
    const docSnap = await getDoc(groupRef);
    await setGroupName(docSnap.data().groupName);
    await setGroupAdmin(docSnap.data().groupAdmin);
    await setGroupAdminName(docSnap.data().adminName);
    await setGroupAvatar(docSnap.data().groupAvatar);
    await setGroupAdminEmail(docSnap.data().adminEmail);
    setGroupId(id);
    setInvisibleHome(false);
    setInvisibleGroup(false);
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
      {
          !invisibleGroup && (
          <GroupPage
            groupName={groupName}
            groupAdmin={groupAdmin}
            adminName={groupAdminName}
            adminEmail={groupAdminEmail}
            groupId={groupId}
            groupAvatar={groupAvatar}
            showContactsList={showContactsList}
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
        <div className="contacts-panel">
          <Link to="/search" className="link-left">
            <img src={back} alt="back" />
          </Link>
          <div className="my-groups-wrapper">
            <div className="my-groups-title">My groups</div>
            <Link to="/groupslist">
              <FontAwesomeIcon icon={faUserGroup} />
            </Link>
          </div>
          <div className="my-groups-wrapper">
            <div className="my-groups-title">Create group</div>
            <Link to="/group">
              <FontAwesomeIcon icon={faUserGroup} />
            </Link>
          </div>
        </div>

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
          {
            groups.map((group) => (
              <div key={group.id} className="user-wrapper">
                {
                  group.groupAvatar
                  // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                    ? <img className="user-avatar" src={group.groupAvatar} alt="avatar" onClick={() => showGroup(group.id)} onKeyUp={() => showGroup(group.id)} />
                  // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                    : <img className="user-avatar" src={avatar} alt="avatar" onClick={() => showGroup(group.id)} onKeyUp={() => showGroup(group.id)} />
                }
                <div className="user-info">
                  <div className="project-main">{group.groupName}</div>
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
