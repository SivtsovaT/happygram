import React, { useEffect, useState } from 'react';
import './MyContactsPage.scss';
import { getAuth } from 'firebase/auth';
import {
  doc, collection, getDocs, getDoc, setDoc, query, where,
} from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlass';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons/faRightFromBracket';
import { Link } from 'react-router-dom';
import { faUserLock } from '@fortawesome/free-solid-svg-icons';
import avatar from '../images/search-page/avatar.jpg';
import unlockIcon from '../images/my-contacts-page/unlock-icon.svg';
import youBlocked from '../images/my-contacts-page/you-blocked.jpg';
import unknown from '../images/my-contacts-page/unknown.jpg';
import pinIcon from '../images/my-contacts-page/pin.svg';
import unpinIcon from '../images/my-contacts-page/unpin-icon.jpg';
import MessagesPage from '../messages-page/MessagesPage';
import { db } from '../firebase';
import back from '../images/back.png';
import GroupPage from '../group-page/GroupPage';
import ChannelPage from '../channel-page/ChannelPage';

function MyContactsPage() {
  const [searchValue, setSearchValue] = useState('');
  const [currentAuth, setCurrentAuth] = useState(null);
  const [userData, setUserData] = useState([]);
  const [contactDisplayName, setContactDisplayName] = useState('');
  const [invisibleHome, setInvisibleHome] = useState(false);
  const [invisibleGroup, setInvisibleGroup] = useState(true);
  const [invisibleChannel, setInvisibleChannel] = useState(true);
  const [contactId, setContactId] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupAdmin, setGroupAdmin] = useState('');
  const [groupAdminName, setGroupAdminName] = useState('');
  const [groupAdminEmail, setGroupAdminEmail] = useState('');
  const [groupId, setGroupId] = useState('');
  const [groupAvatar, setGroupAvatar] = useState('');
  const [pinnedChannels, setPinnedChannels] = useState([]);
  const [pinnedGroups, setPinnedGroups] = useState([]);
  const [unpinnedContacts, setUnpinnedContacts] = useState([]);
  const [filteredUnpinnedContacts, setFilteredUnpinnedContacts] = useState([]);
  const [unpinnedGroups, setUnpinnedGroups] = useState([]);
  const [filteredUnpinnedGroups, setFilteredUnpinnedGroups] = useState([]);
  const [unpinnedChannels, setUnpinnedChannels] = useState([]);
  const [filteredUnpinnedChannels, setFilteredUnpinnedChannels] = useState([]);
  const [pinnedContacts, setPinnedContacts] = useState([]);
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
  const myAvatar = userData.userAvatar;

  useEffect(() => {
    if (!currentAuth) {
      return;
    }
    const getPinnedContacts = async () => {
      const q = query(collection(db, `users/${currentAuth}/contacts`), where('pin', '==', 1));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setPinnedContacts(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
    };
    getPinnedContacts();
  }, [currentAuth]);

  useEffect(() => {
    if (!currentAuth) {
      return;
    }
    const getPinnedGroups = async () => {
      const q = query(collection(db, `users/${currentAuth}/groupContacts`), where('pin', '==', 1));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setPinnedGroups(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
    };
    getPinnedGroups();
  }, [currentAuth]);

  useEffect(() => {
    if (!currentAuth) {
      return;
    }
    const getPinnedChannels = async () => {
      const q = query(collection(db, `users/${currentAuth}/channelContacts`), where('pin', '==', 1));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setPinnedChannels(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
    };
    getPinnedChannels();
  }, [currentAuth]);
  useEffect(() => {
    if (!currentAuth) {
      return;
    }
    const getUnpinnedChannels = async () => {
      const q = query(collection(db, `users/${currentAuth}/channelContacts`), where('pin', '==', 0));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setUnpinnedChannels(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
    };
    getUnpinnedChannels();
  }, [currentAuth]);

  useEffect(() => {
    if (!currentAuth) {
      return;
    }
    const getUnpinnedGroups = async () => {
      const q = query(collection(db, `users/${currentAuth}/groupContacts`), where('pin', '==', 0));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setUnpinnedGroups(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
    };
    getUnpinnedGroups();
  }, [currentAuth]);

  useEffect(() => {
    setFilteredUnpinnedChannels(
      unpinnedChannels.filter(
        // eslint-disable-next-line max-len
        (unpinnedChannel) => unpinnedChannel.channelName.toLowerCase().includes(searchValue.toLowerCase()),
      ),
    );
  }, [searchValue, unpinnedChannels]);

  useEffect(() => {
    if (!currentAuth) {
      return;
    }
    const getUnpinnedContacts = async () => {
      const q = query(collection(db, `users/${currentAuth}/contacts`), where('pin', '==', 0));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setUnpinnedContacts(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
    };
    getUnpinnedContacts();
  }, [currentAuth]);

  useEffect(() => {
    setFilteredUnpinnedContacts(
      unpinnedContacts.filter(
        // eslint-disable-next-line max-len
        (unpinnedContact) => unpinnedContact.displayName.toLowerCase().includes(searchValue.toLowerCase()),
      ),
    );
  }, [searchValue, unpinnedContacts]);

  useEffect(() => {
    setFilteredUnpinnedGroups(
      unpinnedGroups.filter(
        // eslint-disable-next-line max-len
        (unpinnedGroup) => unpinnedGroup.groupName.toLowerCase().includes(searchValue.toLowerCase()),
      ),
    );
  }, [searchValue, unpinnedContacts]);

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
  const blockUnpinnedContact = async (id, displayName, email, pin) => {
    const blockDialogsRef = doc(db, `users/${id}/contacts/${currentAuth}`);
    await setDoc(blockDialogsRef, {
      displayName: myName,
      email: myEmail,
      blocked: 1,
      pin,
    }, { merge: true });
    const blockDialogsRef1 = doc(db, `users/${currentAuth}/contacts/${id}`);
    await setDoc(blockDialogsRef1, {
      displayName,
      email,
      icon: 0,
    }, { merge: true });
    const q = query(collection(db, `users/${currentAuth}/contacts`), where('pin', '==', 0));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(() => {
      // eslint-disable-next-line no-shadow
      setFilteredUnpinnedContacts(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });
  };
  const blockPinnedContact = async (id, displayName, email, pin) => {
    const blockDialogsRef = doc(db, `users/${id}/contacts/${currentAuth}`);
    await setDoc(blockDialogsRef, {
      displayName: myName,
      email: myEmail,
      blocked: 1,
      pin,
    }, { merge: true });
    const blockDialogsRef1 = doc(db, `users/${currentAuth}/contacts/${id}`);
    await setDoc(blockDialogsRef1, {
      displayName,
      email,
      icon: 0,
    }, { merge: true });
    const q = query(collection(db, `users/${currentAuth}/contacts`), where('pin', '==', 1));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(() => {
      // eslint-disable-next-line no-shadow
      setPinnedContacts(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });
  };

  const unlockUnpinnedContact = async (id, displayName, email, pin) => {
    const blockDialogsRef = doc(db, `users/${id}/contacts/${currentAuth}`);
    await setDoc(blockDialogsRef, {
      displayName: myName,
      email: myEmail,
      blocked: 0,
    }, { merge: true });
    const blockDialogsRef1 = doc(db, `users/${currentAuth}/contacts/${id}`);
    await setDoc(blockDialogsRef1, {
      displayName,
      email,
      icon: 1,
      pin,
    }, { merge: true });
    const q = query(collection(db, `users/${currentAuth}/contacts`), where('pin', '==', 0));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(() => {
      // eslint-disable-next-line no-shadow
      setFilteredUnpinnedContacts(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });
  };
  const unlockPinnedContact = async (id, displayName, email, pin) => {
    const blockDialogsRef = doc(db, `users/${id}/contacts/${currentAuth}`);
    await setDoc(blockDialogsRef, {
      displayName: myName,
      email: myEmail,
      blocked: 0,
    }, { merge: true });
    const blockDialogsRef1 = doc(db, `users/${currentAuth}/contacts/${id}`);
    await setDoc(blockDialogsRef1, {
      displayName,
      email,
      icon: 1,
      pin,
    }, { merge: true });
    const q = query(collection(db, `users/${currentAuth}/contacts`), where('pin', '==', 1));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(() => {
      // eslint-disable-next-line no-shadow
      setPinnedContacts(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });
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
  const pinContact = async (id, displayName, email, icon) => {
    const blockDialogsRef1 = doc(db, `users/${currentAuth}/contacts/${id}`);
    await setDoc(blockDialogsRef1, {
      displayName,
      email,
      icon,
      pin: 1,
    }, { merge: true });
    window.location.replace('/contacts');
  };
  const unpinContact = async (id, displayName, email, icon) => {
    const blockDialogsRef1 = doc(db, `users/${currentAuth}/contacts/${id}`);
    await setDoc(blockDialogsRef1, {
      displayName,
      email,
      icon,
      pin: 0,
    }, { merge: true });
    window.location.replace('/contacts');
  };
  // eslint-disable-next-line no-shadow
  const pinChannel = async (id, channelName, channelAvatar) => {
    const blockDialogsRef1 = doc(db, `users/${currentAuth}/channelContacts/${id}`);
    await setDoc(blockDialogsRef1, {
      channelName,
      channelAvatar,
      pin: 1,
    }, { merge: true });
    window.location.replace('/contacts');
  };
  // eslint-disable-next-line no-shadow
  const pinGroup = async (id, groupName, groupAvatar) => {
    const blockDialogsRef1 = doc(db, `users/${currentAuth}/groupContacts/${id}`);
    await setDoc(blockDialogsRef1, {
      groupName,
      groupAvatar,
      pin: 1,
    }, { merge: true });
    window.location.replace('/contacts');
  };

  // eslint-disable-next-line no-shadow
  const unpinChannel = async (id, channelName, channelAvatar) => {
    const blockDialogsRef1 = doc(db, `users/${currentAuth}/channelContacts/${id}`);
    await setDoc(blockDialogsRef1, {
      channelName,
      channelAvatar,
      pin: 0,
    }, { merge: true });
    window.location.replace('/contacts');
  };
  // eslint-disable-next-line no-shadow
  const unpinGroup = async (id, groupName, groupAvatar) => {
    const blockDialogsRef1 = doc(db, `users/${currentAuth}/groupContacts/${id}`);
    await setDoc(blockDialogsRef1, {
      groupName,
      groupAvatar,
      pin: 0,
    }, { merge: true });
    window.location.replace('/contacts');
  };
  const showProfile = () => {
    window.location.replace('/profile');
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
              style={{ height: '36px', width: '70px' }}
              type="text"
              className="input-log"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
            <FontAwesomeIcon icon={faMagnifyingGlass} style={{ marginLeft: '-30px' }} />
          </div>
          <div className="project-main" style={{ marginLeft: '10px' }}>
            Welcome,
            {' '}
            {userData.displayName}
            !
          </div>
          {
            myAvatar
              ? (
            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                <img
                  src={myAvatar}
                  alt="userAvatar"
                  className="profile-image"
                  style={{ width: '40px', height: '40px', cursor: 'pointer' }}
                  onClick={showProfile}
                  onKeyUp={showProfile}
                />
              )
              : (
            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                <img
                  className="profile-image"
                  src={avatar}
                  alt="userAvatar"
                  style={{ width: '40px', height: '40px', cursor: 'pointer' }}
                  onClick={showProfile}
                  onKeyUp={showProfile}
                />
              )
          }
          <FontAwesomeIcon onClick={logout} style={{ width: '30px', height: '30px' }} icon={faRightFromBracket} />
        </div>
        <div className="contacts-panel">
          <Link to="/search" className="link-left">
            <img src={back} alt="back" />
          </Link>
        </div>
        <div className="users-list" style={{ height: '600px' }}>
          {
            pinnedContacts.map((pinnedContact) => (
              <div
                key={pinnedContact.id}
                className="user-wrapper"
              >
                {
                    pinnedContact.blocked === 1
                      ? (
                        <div className="user-info-blocked">
                          <div className="user-blocked-image">
                            <img src={youBlocked} alt="blocked" />
                          </div>
                          <div className="blocked-info">
                            <div className="project-main">{pinnedContact.displayName}</div>
                            {/* eslint-disable-next-line max-len */}
                            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                            <img
                              src={unpinIcon}
                              alt="pin-icon-"
                              className="pin-icon-blocked"
                              onClick={() => unpinContact(
                                pinnedContact.id,
                                pinnedContact.displayName,
                                pinnedContact.email,
                                pinnedContact.icon,
                              )}
                              onKeyUp={() => unpinContact(
                                pinnedContact.id,
                                pinnedContact.displayName,
                                pinnedContact.email,
                                pinnedContact.icon,
                              )}
                            />
                            <div className="blocked-info-title">you cannot see this contact</div>
                          </div>
                        </div>
                      )
                      : (
                        <div className="user-info-unlocked">
                          {
                                pinnedContact.icon === 0
                                  ? <img className="user-avatar" src={unknown} alt="unknown" />
                                  : (
                                    <button style={{ backgroundColor: 'rgba(28,28,28,0)', border: 'none' }} type="button" onClick={() => showContact(pinnedContact.id)}>
                                      {
                                        pinnedContact.userAvatar
                                          ? <img className="user-avatar" src={pinnedContact.userAvatar} alt="avatar" />
                                          : <img className="user-avatar" src={avatar} alt="avatar" />
                                      }
                                    </button>
                                  )
                              }
                          <div className="user-info">
                            <div className="project-main">{pinnedContact.displayName}</div>
                            {/* eslint-disable-next-line max-len */}
                            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                            <img
                              src={unpinIcon}
                              alt="pin-icon"
                              className="pin-icon"
                              onClick={() => unpinContact(
                                pinnedContact.id,
                                pinnedContact.displayName,
                                pinnedContact.email,
                                pinnedContact.icon,
                              )}
                              onKeyUp={() => unpinContact(
                                pinnedContact.id,
                                pinnedContact.displayName,
                                pinnedContact.email,
                                pinnedContact.icon,
                              )}
                            />
                            <div className="user-email">{pinnedContact.email}</div>
                            {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
                          </div>
                          <div>
                            {
                                    pinnedContact.icon === 0 && (
                                    <div>
                                      {/* eslint-disable-next-line max-len */}
                                      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                                      <img
                                        className="image-block"
                                        src={unlockIcon}
                                        alt="unlock"
                                              /* eslint-disable-next-line max-len */
                                        onClick={() => unlockPinnedContact(pinnedContact.id, pinnedContact.displayName, pinnedContact.email, pinnedContact.pin)}
                                              /* eslint-disable-next-line max-len */
                                        onKeyUp={() => unlockPinnedContact(pinnedContact.id, pinnedContact.displayName, pinnedContact.email, pinnedContact.pin)}
                                      />
                                    </div>
                                    )
                                }
                            {
                                    pinnedContact.icon === 1 && (
                                    <div>
                                      <FontAwesomeIcon
                                        className="image-block"
                                        icon={faUserLock}
                                              /* eslint-disable-next-line max-len */
                                        onClick={() => blockPinnedContact(pinnedContact.id, pinnedContact.displayName, pinnedContact.email, pinnedContact.pin)}
                                              /* eslint-disable-next-line max-len */
                                        onKeyUp={() => blockPinnedContact(pinnedContact.id, pinnedContact.displayName, pinnedContact.email, pinnedContact.pin)}
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
            pinnedChannels.map((pinnedChannel) => (
              <div
                key={pinnedChannel.id}
                className="user-wrapper"
              >
                {
                    pinnedChannel.blocked === 1
                      ? (
                        <div className="user-info-blocked">
                          <div className="user-blocked-image">
                            <img src={youBlocked} alt="blocked" />
                          </div>
                          <div className="blocked-info">
                            <div className="project-main">{pinnedChannel.channelName}</div>
                            {/* eslint-disable-next-line max-len */}
                            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                            <img
                              src={unpinIcon}
                              alt="pin-icon-"
                              className="channel-pin-icon-blocked"
                              onClick={() => unpinChannel(
                                pinnedChannel.id,
                                pinnedChannel.channelName,
                                pinnedChannel.channelAvatar,
                              )}
                              onKeyUp={() => unpinChannel(
                                pinnedChannel.id,
                                pinnedChannel.channelName,
                                pinnedChannel.channelAvatar,
                              )}
                            />
                            <div className="blocked-info-title">you cannot see this channel</div>
                          </div>
                        </div>
                      )
                      : (
                        <div className="channel-unlocked-wrapper">
                          {
                                !pinnedChannel.channelAvatar ? (
                                // eslint-disable-next-line max-len
                                // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                                  <img
                                    className="user-avatar"
                                    src={avatar}
                                    alt="avatar"
                                    onClick={() => showChannel(pinnedChannel.id)}
                                    onKeyUp={() => showGroup(pinnedChannel.id)}
                                  />
                                ) : (
                                // eslint-disable-next-line max-len
                                // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                                  <img
                                    className="user-avatar"
                                    src={pinnedChannel.channelAvatar}
                                    alt="avatar"
                                        /* eslint-disable-next-line max-len */
                                    onClick={() => showChannel(pinnedChannel.id)}
                                    onKeyUp={() => showChannel(pinnedChannel.id)}
                                  />
                                )
                              }
                          <div className="user-info">
                            <div className="project-main">{pinnedChannel.channelName}</div>
                            {/* eslint-disable-next-line max-len */}
                            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                            <img
                              src={unpinIcon}
                              alt="pin-icon-"
                              className="channel-pin-icon"
                              onClick={() => unpinChannel(
                                pinnedChannel.id,
                                pinnedChannel.channelName,
                                pinnedChannel.channelAvatar,
                              )}
                              onKeyUp={() => unpinChannel(
                                pinnedChannel.id,
                                pinnedChannel.channelName,
                                pinnedChannel.channelAvatar,
                              )}
                            />
                          </div>
                        </div>
                      )
                  }
              </div>
            ))
          }
          {
            pinnedGroups.map((pinnedGroup) => (
              <div key={pinnedGroup.id} className="user-wrapper">
                {
                    pinnedGroup.groupAvatar
                    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                      ? (
                    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                        <img
                          className="user-avatar"
                          src={pinnedGroup.groupAvatar}
                          alt="avatar"
                          onClick={() => showGroup(pinnedGroup.id)}
                          onKeyUp={() => showGroup(pinnedGroup.id)}
                        />
                      )
                    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                      : (
                    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                        <img
                          className="user-avatar"
                          src={avatar}
                          alt="avatar"
                          onClick={() => showGroup(pinnedGroup.id)}
                          onKeyUp={() => showGroup(pinnedGroup.id)}
                        />
                      )
                  }
                <div className="group-info">
                  <div className="project-main">{pinnedGroup.groupName}</div>
                  {/* eslint-disable-next-line max-len */}
                  {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                  <img
                    src={unpinIcon}
                    alt="pin-icon-"
                    className="pin-group-icon"
                    onClick={() => unpinGroup(
                      pinnedGroup.id,
                      pinnedGroup.groupName,
                      pinnedGroup.groupAvatar,
                    )}
                    onKeyUp={() => unpinGroup(
                      pinnedGroup.id,
                      pinnedGroup.groupName,
                      pinnedGroup.groupAvatar,
                    )}
                  />
                </div>
              </div>
            ))
          }
          {
            filteredUnpinnedContacts.map((unpinnedContact) => (
              <div
                key={unpinnedContact.id}
                className="user-wrapper"
              >
                {
                    unpinnedContact.blocked === 1
                      ? (
                        <div className="user-info-blocked">
                          <div className="user-blocked-image">
                            <img src={youBlocked} alt="blocked" />
                          </div>
                          <div className="blocked-info">
                            <div className="project-main">{unpinnedContact.displayName}</div>
                            {/* eslint-disable-next-line max-len */}
                            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                            <img
                              src={pinIcon}
                              alt="pin-icon"
                              className="pin-icon"
                              onClick={() => pinContact(
                                unpinnedContact.id,
                                unpinnedContact.displayName,
                                unpinnedContact.email,
                                unpinnedContact.icon,
                              )}
                              onKeyUp={() => pinContact(
                                unpinnedContact.id,
                                unpinnedContact.displayName,
                                unpinnedContact.email,
                                unpinnedContact.icon,
                              )}
                            />
                            <div className="blocked-info-title">you cannot see this contact</div>
                          </div>
                        </div>
                      )
                      : (
                        <div className="user-info-unlocked">
                          {
                                unpinnedContact.icon === 0
                                  ? <img className="user-avatar" src={unknown} alt="unknown" />
                                  : (
                                    <button style={{ backgroundColor: 'rgba(28,28,28,0)', border: 'none' }} type="button" onClick={() => showContact(unpinnedContact.id)}>
                                      {
                                        unpinnedContact.userAvatar
                                          ? <img className="user-avatar" src={unpinnedContact.userAvatar} alt="avatar" />
                                          : <img className="user-avatar" src={avatar} alt="avatar" />
                                      }
                                    </button>
                                  )
                              }
                          <div className="user-info">
                            <div className="project-main">{unpinnedContact.displayName}</div>
                            {/* eslint-disable-next-line max-len */}
                            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                            <img
                              src={pinIcon}
                              alt="pin-icon"
                              className="pin-icon"
                              onClick={() => pinContact(
                                unpinnedContact.id,
                                unpinnedContact.displayName,
                                unpinnedContact.email,
                                unpinnedContact.icon,
                              )}
                              onKeyUp={() => pinContact(
                                unpinnedContact.id,
                                unpinnedContact.displayName,
                                unpinnedContact.email,
                                unpinnedContact.icon,
                              )}
                            />
                            <div className="user-email">{unpinnedContact.email}</div>
                            {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
                          </div>
                          <div>
                            {
                                    unpinnedContact.icon === 0 && (
                                    <div>
                                      {/* eslint-disable-next-line max-len */}
                                      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                                      <img
                                        className="image-block"
                                        src={unlockIcon}
                                        alt="unlock"
                                              /* eslint-disable-next-line max-len */
                                        onClick={() => unlockUnpinnedContact(unpinnedContact.id, unpinnedContact.displayName, unpinnedContact.email, unpinnedContact.pin)}
                                              /* eslint-disable-next-line max-len */
                                        onKeyUp={() => unlockUnpinnedContact(unpinnedContact.id, unpinnedContact.displayName, unpinnedContact.email, unpinnedContact.pin)}
                                      />
                                    </div>
                                    )
                                }
                            {
                                    unpinnedContact.icon === 1 && (
                                    <div>
                                      <FontAwesomeIcon
                                        className="image-block"
                                        icon={faUserLock}
                                              /* eslint-disable-next-line max-len */
                                        onClick={() => blockUnpinnedContact(unpinnedContact.id, unpinnedContact.displayName, unpinnedContact.email, unpinnedContact.pin)}
                                              /* eslint-disable-next-line max-len */
                                        onKeyUp={() => blockUnpinnedContact(unpinnedContact.id, unpinnedContact.displayName, unpinnedContact.email, unpinnedContact.pin)}
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
            filteredUnpinnedChannels.map((unpinnedChannel) => (
              <div
                key={unpinnedChannel.id}
                className="user-wrapper"
              >
                {
                    unpinnedChannel.blocked === 1
                      ? (
                        <div className="user-info-blocked">
                          <div className="user-blocked-image">
                            <img src={youBlocked} alt="blocked" />
                          </div>
                          <div className="blocked-info">
                            <div className="channel-info-wrapper">
                              <div className="project-main">{unpinnedChannel.channelName}</div>
                              {/* eslint-disable-next-line max-len */}
                              {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                              <img
                                src={pinIcon}
                                alt="pin-icon-"
                                className="channel-pin-icon-blocked"
                                onClick={() => pinChannel(
                                  unpinnedChannel.id,
                                  unpinnedChannel.channelName,
                                  unpinnedChannel.channelAvatar,
                                )}
                                onKeyUp={() => pinChannel(
                                  unpinnedChannel.id,
                                  unpinnedChannel.channelName,
                                  unpinnedChannel.channelAvatar,
                                )}
                              />
                            </div>
                            <div className="blocked-info-title">you cannot see this channel</div>
                          </div>
                        </div>
                      )
                      : (
                        <div className="channel-unlocked-wrapper">
                          {
                                !unpinnedChannel.channelAvatar ? (
                                // eslint-disable-next-line max-len
                                // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                                  <img
                                    className="user-avatar"
                                    src={avatar}
                                    alt="avatar"
                                    onClick={() => showChannel(unpinnedChannel.id)}
                                    onKeyUp={() => showGroup(unpinnedChannel.id)}
                                  />
                                ) : (
                                // eslint-disable-next-line max-len
                                // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                                  <img
                                    className="user-avatar"
                                    src={unpinnedChannel.channelAvatar}
                                    alt="avatar"
                                        /* eslint-disable-next-line max-len */
                                    onClick={() => showChannel(unpinnedChannel.id)}
                                    onKeyUp={() => showChannel(unpinnedChannel.id)}
                                  />
                                )
                              }
                          <div className="user-info">
                            <div className="project-main">{unpinnedChannel.channelName}</div>
                            {/* eslint-disable-next-line max-len */}
                            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                            <img
                              src={pinIcon}
                              alt="pin-icon-"
                              className="channel-pin-icon"
                              onClick={() => pinChannel(
                                unpinnedChannel.id,
                                unpinnedChannel.channelName,
                                unpinnedChannel.channelAvatar,
                              )}
                              onKeyUp={() => pinChannel(
                                unpinnedChannel.id,
                                unpinnedChannel.channelName,
                                unpinnedChannel.channelAvatar,
                              )}
                            />
                          </div>
                        </div>
                      )
                  }
              </div>
            ))
          }
          {
            filteredUnpinnedGroups.map((unpinnedGroup) => (
              <div key={unpinnedGroup.id} className="user-wrapper">
                {
                  unpinnedGroup.groupAvatar
                  // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                    ? (
                  // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                      <img
                        className="user-avatar"
                        src={unpinnedGroup.groupAvatar}
                        alt="avatar"
                        onClick={() => showGroup(unpinnedGroup.id)}
                        onKeyUp={() => showGroup(unpinnedGroup.id)}
                      />
                    )
                  // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                    : (
                  // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                      <img
                        className="user-avatar"
                        src={avatar}
                        alt="avatar"
                        onClick={() => showGroup(unpinnedGroup.id)}
                        onKeyUp={() => showGroup(unpinnedGroup.id)}
                      />
                    )
                }
                <div className="group-info">
                  <div className="project-main">{unpinnedGroup.groupName}</div>
                  {/* eslint-disable-next-line max-len */}
                  {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                  <img
                    src={pinIcon}
                    alt="pin-icon-"
                    className="pin-group-icon"
                    onClick={() => pinGroup(
                      unpinnedGroup.id,
                      unpinnedGroup.groupName,
                      unpinnedGroup.groupAvatar,
                    )}
                    onKeyUp={() => pinGroup(
                      unpinnedGroup.id,
                      unpinnedGroup.groupName,
                      unpinnedGroup.groupAvatar,
                    )}
                  />
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </>
  );
}

export default MyContactsPage;
