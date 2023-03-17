import React, { useEffect, useState } from 'react';
import './AdminGroupPage.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlass';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons/faUserPlus';
import {
  collection, doc, getDocs, setDoc, deleteDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { faUserGroup, faTrash } from '@fortawesome/free-solid-svg-icons';
import avatar from '../images/create-group-page/group.png';
import { db } from '../firebase';
import back from '../images/back.png';

function AdminGroupPage({
  groupName, groupId, showHome, groupAvatar, adminEmail, adminName,
}) {
  const [searchValue, setSearchValue] = useState('');
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [currentAuth, setCurrentAuth] = useState(null);
  const [groupUsers, setGroupUsers] = useState([]);
  const [findPanelVisible, setFindPanelVisible] = useState(false);
  const [groupMembersVisible, setGroupMembersVisible] = useState(true);

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

  useEffect(() => {
    if (!currentAuth) {
      return;
    }
    const getGroupUsers = async () => {
      const data = await getDocs(collection(db, `groups/${groupId}/contacts`));
      // eslint-disable-next-line no-shadow
      await setGroupUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    getGroupUsers();
  }, [currentAuth]);
  const addAdminToGroupContacts = async () => {
    const groupRef = doc(db, `users/${currentAuth}/groupContacts/${groupId}`);
    await setDoc(groupRef, {
      groupName,
      groupAvatar,
      pin: 0,
    }, { merge: true });
    const data = await getDocs(collection(db, `groups/${groupId}/contacts`));
    // eslint-disable-next-line no-shadow
    await setGroupUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  const toggleGroupContent = () => {
    setFindPanelVisible((prevState) => !prevState);
    setGroupMembersVisible((prevState) => !prevState);
  };

  const addContactToGroup = async (id, displayName, email) => {
    const groupRef = doc(db, `users/${id}/groupContacts/${groupId}`);
    await setDoc(groupRef, {
      groupName,
      groupAvatar,
      pin: 0,
    }, { merge: true });
    const groupRef1 = doc(db, `groups/${groupId}/contacts/${id}`);
    await setDoc(groupRef1, {
      id, displayName, email,
    }, { merge: true });
    const data = await getDocs(collection(db, `groups/${groupId}/contacts`));
    // eslint-disable-next-line no-shadow
    await setGroupUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };
  const deleteContact = async (id) => {
    const groupRef = doc(db, `users/${id}/groupContacts/${groupId}`);
    await deleteDoc(groupRef);
    const groupRef1 = doc(db, `groups/${groupId}/contacts/${id}`);
    await deleteDoc(groupRef1);
    const data = await getDocs(collection(db, `groups/${groupId}/contacts`));
    // eslint-disable-next-line no-shadow
    await setGroupUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  return (
    <div className="content">
      {
        findPanelVisible
          && (
          <div>
            <div className="group-header">
              {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
              <div className="link-left" onClick={showHome} onKeyUp={showHome} style={{ marginRight: '10px' }}>
                <img src={back} alt="back" />
              </div>
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
              <div className="group-name-contacts">{groupName}</div>
              {
                groupAvatar ? <img className="group-image" src={groupAvatar} alt="avatar" /> : <img className="group-image" src={avatar} alt="avatar" />
              }
              <FontAwesomeIcon icon={faUserGroup} onClick={toggleGroupContent} onKeyUp={toggleGroupContent} style={{ marginLeft: '5px' }} />
            </div>
            <div className="users-list" style={{ marginLeft: '30px' }}>
              <div className="user-wrapper">
                <img className="user-avatar" src={avatar} alt="avatar" />
                <div className="user-info">
                  <div className="project-main">{adminName}</div>
                  <div className="user-email">{adminEmail}</div>
                </div>
                {' '}
                (admin)
                <button type="button" className="btn btn-28" style={{ marginLeft: '40px' }} onClick={addAdminToGroupContacts}>
                  <FontAwesomeIcon icon={faUserPlus} />
                </button>
              </div>
              {
                    filteredContacts.map((contact) => (
                      <div key={contact.id} className="user-wrapper">
                        <img className="user-avatar" src={avatar} alt="avatar" />
                        <div className="user-info">
                          <div className="project-main">{contact.displayName}</div>
                          <div className="user-email">{contact.email}</div>
                        </div>
                        <button type="button" className="btn btn-28" style={{ marginLeft: '80px' }} onClick={() => addContactToGroup(contact.id, contact.displayName, contact.email)}>
                          <FontAwesomeIcon icon={faUserPlus} />
                        </button>
                      </div>
                    ))
                  }
            </div>
          </div>
          )
      }
      {
        groupMembersVisible
          && (
          <div>
            <div className="group-header">
              {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
              <div className="link-left" onClick={showHome} onKeyUp={showHome}>
                <img src={back} alt="back" />
              </div>
              <div className="group-name-members">{groupName}</div>
              {
                groupAvatar ? <img className="group-image" src={groupAvatar} alt="avatar" /> : <img className="group-image" src={avatar} alt="avatar" />
              }
              <FontAwesomeIcon icon={faUserGroup} onClick={toggleGroupContent} onKeyUp={toggleGroupContent} style={{ marginLeft: '50px' }} />
            </div>
            <div className="group-members">Members of the group</div>
            <div className="users-list" style={{ marginLeft: '30px' }}>
              <div className="user-wrapper">
                <img className="user-avatar" src={avatar} alt="avatar" />
                <div className="user-info">
                  <div className="project-main">{adminName}</div>
                  <div className="user-email">{adminEmail}</div>
                </div>
                {' '}
                (admin)
              </div>
              {
                    groupUsers.map((groupUser) => (
                      <div key={groupUser.id} className="user-wrapper">
                        <img className="user-avatar" src={avatar} alt="avatar" />
                        <div className="user-info">
                          <div className="project-main">{groupUser.displayName}</div>
                          <div className="user-email">{groupUser.email}</div>
                        </div>
                        <button type="button" className="btn btn-28" style={{ marginLeft: '80px' }} onClick={() => deleteContact(groupUser.id, groupUser.displayName, groupUser.email)}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    ))
                  }
            </div>
          </div>
          )
      }
    </div>
  );
}

export default AdminGroupPage;
