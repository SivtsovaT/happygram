import React, { useEffect, useState } from 'react';
import './AdminChannelPage.scss';
import { getAuth } from 'firebase/auth';
import {
  collection, deleteDoc, doc, getDocs, setDoc,
} from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlass';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons/faUserPlus';
import { faUserLock } from '@fortawesome/free-solid-svg-icons/faUserLock';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';
import avatar from '../images/create-group-page/group.png';
import back from '../images/back.png';
import { db } from '../firebase';
import unlockIcon from '../images/my-contacts-page/unlock-icon.svg';

// eslint-disable-next-line max-len
function AdminChannelPage({
  channelName, channelId, showHome, channelAvatar, adminEmail, adminName,
}) {
  const [searchValue, setSearchValue] = useState('');
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [currentAuth, setCurrentAuth] = useState(null);
  const [channelUsers, setChannelUsers] = useState([]);
  const [findPanelVisible, setFindPanelVisible] = useState(false);
  const [channelMembersVisible, setChannelMembersVisible] = useState(true);

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
    const getChannelUsers = async () => {
      const data = await getDocs(collection(db, `channels/${channelId}/contacts`));
      // eslint-disable-next-line no-shadow
      await setChannelUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    getChannelUsers();
  }, [currentAuth]);

  const toggleChannelContent = () => {
    setFindPanelVisible((prevState) => !prevState);
    setChannelMembersVisible((prevState) => !prevState);
  };

  const addContactToChannel = async (id, displayName, email) => {
    const channelRef = doc(db, `users/${id}/channelContacts/${channelId}`);
    await setDoc(channelRef, {
      channelName,
      channelAvatar,
      blocked: 0,
    }, { merge: true });
    const channelRef1 = doc(db, `channels/${channelId}/contacts/${id}`);
    await setDoc(channelRef1, {
      id, displayName, email, icon: 1,
    }, { merge: true });
    const data = await getDocs(collection(db, `channels/${channelId}/contacts`));
    // eslint-disable-next-line no-shadow
    await setChannelUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };
  const deleteContact = async (id) => {
    const channelRef = doc(db, `users/${id}/channelContacts/${channelId}`);
    await deleteDoc(channelRef);
    const channelRef1 = doc(db, `channels/${channelId}/contacts/${id}`);
    await deleteDoc(channelRef1);
    const data = await getDocs(collection(db, `channels/${channelId}/contacts`));
    // eslint-disable-next-line no-shadow
    await setChannelUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };
  const blockContact = async (id, displayName, email) => {
    const blockChannelRef = doc(db, `users/${id}/channelContacts/${channelId}`);
    await setDoc(blockChannelRef, {
      channelName,
      channelAvatar,
      blocked: 1,
    }, { merge: true });
    const blockChannelRef1 = doc(db, `channels/${channelId}/contacts/${id}`);
    await setDoc(blockChannelRef1, {
      displayName,
      email,
      id,
      icon: 0,
    }, { merge: true });
    const data = await getDocs(collection(db, `channels/${channelId}/contacts`));
    // eslint-disable-next-line no-shadow
    await setChannelUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };
  const unlockContact = async (id, displayName, email) => {
    const blockChannelRef = doc(db, `users/${id}/channelContacts/${channelId}`);
    await setDoc(blockChannelRef, {
      channelName,
      channelAvatar,
      blocked: 0,
    }, { merge: true });
    const blockChannelRef1 = doc(db, `channels/${channelId}/contacts/${id}`);
    await setDoc(blockChannelRef1, {
      displayName,
      email,
      id,
      icon: 1,
    }, { merge: true });
    const data = await getDocs(collection(db, `channels/${channelId}/contacts`));
    // eslint-disable-next-line no-shadow
    await setChannelUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
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
                    <div className="group-name-contacts">{channelName}</div>
                    {
                                channelAvatar ? <img className="group-image" src={channelAvatar} alt="avatar" /> : <img className="group-image" src={avatar} alt="avatar" />
                            }
                    <FontAwesomeIcon icon={faUserGroup} onClick={toggleChannelContent} onKeyUp={toggleChannelContent} style={{ marginLeft: '5px' }} />
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
                    </div>
                    {
                                filteredContacts.map((contact) => (
                                  <div key={contact.id} className="user-wrapper">
                                    <img className="user-avatar" src={avatar} alt="avatar" />
                                    <div className="user-info">
                                      <div className="project-main">{contact.displayName}</div>
                                      <div className="user-email">{contact.email}</div>
                                    </div>
                                    <button type="button" className="btn btn-28" style={{ marginLeft: '80px' }} onClick={() => addContactToChannel(contact.id, contact.displayName, contact.email)}>
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
                channelMembersVisible
                && (
                <div>
                  <div className="group-header">
                    {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                    <div className="link-left" onClick={showHome} onKeyUp={showHome}>
                      <img src={back} alt="back" />
                    </div>
                    <div className="group-name-members">{channelName}</div>
                    {
                                channelAvatar ? <img className="group-image" src={channelAvatar} alt="avatar" /> : <img className="group-image" src={avatar} alt="avatar" />
                            }
                    <FontAwesomeIcon icon={faUserGroup} onClick={toggleChannelContent} onKeyUp={toggleChannelContent} style={{ marginLeft: '50px' }} />
                  </div>
                  <div className="group-members">Members of channel</div>
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
                                channelUsers.map((channelUser) => (
                                  <div>
                                    {
                                      channelUser.displayName !== adminName && (
                                      <div key={channelUser.id} className="user-wrapper" style={{ position: 'relative' }}>
                                        <img className="user-avatar" src={avatar} alt="avatar" />
                                        <div className="user-info">
                                          <div className="project-main">{channelUser.displayName}</div>
                                          <div className="user-email">{channelUser.email}</div>
                                        </div>
                                        <div className="icons-wrapper">
                                          {
                                              channelUser.icon === 0 && (
                                              <div>
                                                {/* eslint-disable-next-line max-len */}
                                                {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                                                <img
                                                  className="image-block-channel"
                                                  src={unlockIcon}
                                                  alt="unlock"
                                                        /* eslint-disable-next-line max-len */
                                                  onClick={() => unlockContact(channelUser.id, channelUser.displayName, channelUser.email)}
                                                        /* eslint-disable-next-line max-len */
                                                  onKeyUp={() => unlockContact(channelUser.id, channelUser.displayName, channelUser.email)}
                                                />
                                              </div>
                                              )
                                          }
                                          {
                                              channelUser.icon === 1 && (
                                              <div>
                                                <FontAwesomeIcon
                                                  className="image-block-channel"
                                                  icon={faUserLock}
                                                        /* eslint-disable-next-line max-len */
                                                  onClick={() => blockContact(channelUser.id, channelUser.displayName, channelUser.email)}
                                                        /* eslint-disable-next-line max-len */
                                                  onKeyUp={() => blockContact(channelUser.id, channelUser.displayName, channelUser.email)}
                                                />
                                              </div>
                                              )
                                          }
                                          <FontAwesomeIcon
                                            icon={faTrash}
                                              /* eslint-disable-next-line max-len */
                                            onClick={() => deleteContact(channelUser.id, channelUser.displayName, channelUser.email)}
                                              /* eslint-disable-next-line max-len */
                                            onKeyUp={() => deleteContact(channelUser.id, channelUser.displayName, channelUser.email)}
                                          />
                                        </div>
                                      </div>
                                      )
                                    }
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

export default AdminChannelPage;
