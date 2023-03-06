import React, { useEffect, useState } from 'react';
import './MyContactsPage.scss';
import { getAuth } from 'firebase/auth';
import {
  doc, collection, getDocs, getDoc, setDoc,
} from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlass';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons/faRightFromBracket';
import { Link } from 'react-router-dom';
import { faUserGroup, faUserLock } from '@fortawesome/free-solid-svg-icons';
import avatar from '../images/search-page/avatar.jpg';
import unlockIcon from '../images/my-contacts-page/unlock-icon.svg';
import youBlocked from '../images/my-contacts-page/you-blocked.jpg';
import unknown from '../images/my-contacts-page/unknown.jpg';
import MessagesPage from '../messages-page/MessagesPage';
import { db } from '../firebase';
import back from '../images/back.png';
import GroupPage from '../group-page/GroupPage';
import ChannelPage from '../channel-page/ChannelPage';

function MyContactsPage() {
  const [searchValue, setSearchValue] = useState('');
  const [currentAuth, setCurrentAuth] = useState(null);
  const [userData, setUserData] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [contactDisplayName, setContactDisplayName] = useState('');
  const [invisibleHome, setInvisibleHome] = useState(false);
  const [invisibleGroup, setInvisibleGroup] = useState(true);
  const [invisibleChannel, setInvisibleChannel] = useState(true);
  const [contactId, setContactId] = useState('');
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [groupAdmin, setGroupAdmin] = useState('');
  const [groupAdminName, setGroupAdminName] = useState('');
  const [groupAdminEmail, setGroupAdminEmail] = useState('');
  const [groupId, setGroupId] = useState('');
  const [groupAvatar, setGroupAvatar] = useState('');
  const [channels, setChannels] = useState([]);
  const [filteredChannels, setFilteredChannels] = useState([]);
  const [channelName, setChannelName] = useState('');
  const [channelAdmin, setChannelAdmin] = useState('');
  const [channelAdminName, setChannelAdminName] = useState('');
  const [channelAdminEmail, setChannelAdminEmail] = useState('');
  const [channelId, setChannelId] = useState('');
  const [channelAvatar, setChannelAvatar] = useState('');

  const stylesHome = {
    display: invisibleHome || !invisibleGroup || !invisibleChannel ? 'none' : 'flex',
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
  const myName = userData.displayName;
  const myEmail = userData.email;

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
    const getChannels = async () => {
      const data = await getDocs(collection(db, `users/${currentAuth}/channelContacts`));
      // eslint-disable-next-line no-shadow
      setChannels(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
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
    setInvisibleChannel(true);
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
  const blockContact = async (id, displayName, email) => {
    const blockDialogsRef = doc(db, `users/${id}/contacts/${currentAuth}`);
    await setDoc(blockDialogsRef, {
      displayName: myName,
      email: myEmail,
      blocked: 1,
    }, { merge: true });
    const blockDialogsRef1 = doc(db, `users/${currentAuth}/contacts/${id}`);
    await setDoc(blockDialogsRef1, {
      displayName,
      email,
      icon: 0,
    }, { merge: true });
    const data = await getDocs(collection(db, `users/${currentAuth}/contacts`));
    // eslint-disable-next-line no-shadow
    setContacts(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };
  const unLockContact = async (id, displayName, email) => {
    const blockRef = doc(db, `users/${id}/contacts/${currentAuth}`);
    await setDoc(blockRef, {
      displayName: myName,
      email: myEmail,
      blocked: 0,
    }, { merge: true });
    const blockDialogsRef1 = doc(db, `users/${currentAuth}/contacts/${id}`);
    await setDoc(blockDialogsRef1, {
      displayName,
      email,
      icon: 1,
    }, { merge: true });
    const data = await getDocs(collection(db, `users/${currentAuth}/contacts`));
    // eslint-disable-next-line no-shadow
    setContacts(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
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
  const showChannel = async (id) => {
    const groupRef = doc(db, `channels/${id}`);
    const docSnap = await getDoc(groupRef);
    await setChannelName(docSnap.data().channelName);
    await setChannelAdmin(docSnap.data().channelAdmin);
    await setChannelAdminName(docSnap.data().adminName);
    await setChannelAvatar(docSnap.data().channelAvatar);
    await setChannelAdminEmail(docSnap.data().adminEmail);
    setChannelId(id);
    setInvisibleHome(false);
    setInvisibleChannel(false);
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
      {
          !invisibleChannel && (
          <ChannelPage
            channelName={channelName}
            channelAdmin={channelAdmin}
            adminName={channelAdminName}
            adminEmail={channelAdminEmail}
            channelId={channelId}
            channelAvatar={channelAvatar}
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
            <div className="my-groups-title">My channels</div>
            <Link to="/channelslist">
              <FontAwesomeIcon icon={faUserGroup} />
            </Link>
          </div>

          <div className="my-groups-wrapper">
            <div className="my-groups-title">Create group</div>
            <Link to="/group">
              <FontAwesomeIcon icon={faUserGroup} />
            </Link>
          </div>
          <div className="my-groups-wrapper">
            <div className="my-groups-title">Create channel</div>
            <Link to="/channel">
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
                  {
                    contact.blocked === 1
                      ? (
                        <div className="user-info-blocked">
                          <div className="user-blocked-image">
                            <img src={youBlocked} alt="blocked" />
                          </div>
                          <div className="blocked-info">
                            <div className="project-main">{contact.displayName}</div>
                            <div className="blocked-info-title">you cannot see this contact</div>
                          </div>
                        </div>
                      )
                      : (
                        <div className="user-info-unlocked">
                          {
                            contact.icon === 0
                              ? <img className="user-avatar" src={unknown} alt="unknown" />
                              : (
                                <button style={{ backgroundColor: 'rgba(28,28,28,0)', border: 'none' }} type="button" onClick={() => showContact(contact.id)}>
                                  <img className="user-avatar" src={avatar} alt="avatar" />
                                </button>
                              )

                          }
                          <div className="user-info">
                            <div className="project-main">{contact.displayName}</div>
                            <div className="user-email">{contact.email}</div>
                            {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
                          </div>
                          <div>
                            {
                              contact.icon === 0 && (
                              <div>
                                {/* eslint-disable-next-line max-len */}
                                {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                                <img
                                  className="image-block"
                                  src={unlockIcon}
                                  alt="unlock"
                                    /* eslint-disable-next-line max-len */
                                  onClick={() => unLockContact(contact.id, contact.displayName, contact.email)}
                                    /* eslint-disable-next-line max-len */
                                  onKeyUp={() => unLockContact(contact.id, contact.displayName, contact.email)}
                                />
                              </div>
                              )
                            }
                            {
                                contact.icon === 1 && (
                                <div>
                                  <FontAwesomeIcon
                                    className="image-block"
                                    icon={faUserLock}
                                      /* eslint-disable-next-line max-len */
                                    onClick={() => blockContact(contact.id, contact.displayName, contact.email)}
                                      /* eslint-disable-next-line max-len */
                                    onKeyUp={() => blockContact(contact.id, contact.displayName, contact.email)}
                                  />
                                </div>
                                )
                            }

                          </div>
                        </div>
                      )
                  }
                </div>
              ))
            }
          {
            filteredChannels.map((channel) => (
              <div
                key={channel.id}
                className="user-wrapper"
              >
                {
                  channel.blocked === 1
                    ? (
                      <div className="user-info-blocked">
                        <div className="user-blocked-image">
                          <img src={youBlocked} alt="blocked" />
                        </div>
                        <div className="blocked-info">
                          <div className="project-main">{channel.channelName}</div>
                          <div className="blocked-info-title">you cannot see this channel</div>
                        </div>
                      </div>
                    )
                    : (
                      <div className="channel-unlocked-wrapper">
                        {
                          !channel.channelAvatar ? (
                          // eslint-disable-next-line max-len
                          // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                            <img
                              className="user-avatar"
                              src={avatar}
                              alt="avatar"
                              onClick={() => showChannel(channel.id)}
                              onKeyUp={() => showGroup(channel.id)}
                            />
                          ) : (
                          // eslint-disable-next-line max-len
                          // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                            <img
                              className="user-avatar"
                              src={channel.channelAvatar}
                              alt="avatar"
                                   /* eslint-disable-next-line max-len */
                              onClick={() => showChannel(channel.id)}
                              onKeyUp={() => showChannel(channel.id)}
                            />
                          )
}
                        <div className="user-info">
                          <div className="project-main">{channel.channelName}</div>
                        </div>
                      </div>
                    )
                }
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
