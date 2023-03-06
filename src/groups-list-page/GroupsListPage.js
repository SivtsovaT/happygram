import React, { useEffect, useState } from 'react';
import './GroupsListPage.scss';
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
import AdminGroupPage from '../admin-group-page/AdminGroupPage';

function GroupsListPage() {
  const [groups, setGroups] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [currentAuth, setCurrentAuth] = useState(null);
  const [userData, setUserData] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [invisibleHome, setInvisibleHome] = useState(false);
  const [groupAdmin, setGroupAdmin] = useState('');
  const [groupAdminName, setGroupAdminName] = useState('');
  const [groupAdminEmail, setGroupAdminEmail] = useState('');
  const [groupId, setGroupId] = useState('');
  const [groupAvatar, setGroupAvatar] = useState('');

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
    const getGroups = async () => {
      const q = query(collection(db, 'groups'), where('groupAdmin', '==', currentAuth));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setGroups(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
    };
    getGroups();
  }, [currentAuth]);

  useEffect(() => {
    setFilteredGroups(
      groups.filter(
        (group) => group.groupName.toLowerCase().includes(searchValue.toLowerCase()),
      ),
    );
  }, [searchValue, groups]);

  const showGroup = async (id) => {
    const groupRef = doc(db, `groups/${id}`);
    const docSnap = await getDoc(groupRef);
    await setGroupName(docSnap.data().groupName);
    await setGroupAdmin(docSnap.data().groupAdmin);
    await setGroupAdminName(docSnap.data().adminName);
    await setGroupAvatar(docSnap.data().groupAvatar);
    await setGroupAdminEmail(docSnap.data().adminEmail);
    setGroupId(id);
    setInvisibleHome(true);
  };

  const showHome = () => {
    setInvisibleHome((prevState) => !prevState);
  };
  const deleteGroup = async (id) => {
    const groupRef = doc(db, `groups/${id}`);
    await deleteDoc(groupRef);
    const q = query(collection(db, 'groups'), where('groupAdmin', '==', currentAuth));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(() => {
      // eslint-disable-next-line no-shadow
      setGroups(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });
    const groupRef1 = doc(db, `users/${currentAuth}/groupContacts/${id}`);
    await deleteDoc(groupRef1);
    const groupRef2 = doc(db, `groups/${id}/contacts/${currentAuth}`);
    await deleteDoc(groupRef2);
  };

  return (
    <>
      {
        invisibleHome && (
        <AdminGroupPage
          groupName={groupName}
          groupAdmin={groupAdmin}
          adminName={groupAdminName}
          adminEmail={groupAdminEmail}
          groupId={groupId}
          groupAvatar={groupAvatar}
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
              filteredGroups.map((filteredGroup) => (
                // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                <div key={filteredGroup.id} className="user-wrapper" style={{ position: 'relative' }}>
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  {
                    filteredGroup.groupAvatar ? (
                    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                      <img
                        className="user-avatar"
                        src={filteredGroup.groupAvatar}
                        alt="avatar"
                        onClick={() => showGroup(filteredGroup.id)}
                        onKeyUp={() => showGroup(filteredGroup.id)}
                      />
                    )
                      : (
                    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                        <img
                          className="user-avatar"
                          src={avatar}
                          alt="avatar"
                          onClick={() => showGroup(filteredGroup.id)}
                          onKeyUp={() => showGroup(filteredGroup.id)}
                        />
                      )
                  }
                  <div className="user-info">
                    <div className="project-main">{filteredGroup.groupName}</div>
                  </div>
                  <button type="button" style={{ position: 'absolute', right: '10px' }} className="btn btn-28" onClick={() => deleteGroup(filteredGroup.id)}>
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

export default GroupsListPage;
