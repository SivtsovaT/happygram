import React, { useEffect, useState } from 'react';
import './GroupPage.scss';
import { getAuth } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowTurnRight, faClose,
  faDownload,
  faFile, faHeart, faImage, faPaperclip, faTrash, faUserGroup, faVideo,
} from '@fortawesome/free-solid-svg-icons';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons/faPaperPlane';
import { saveAs } from 'file-saver';
import moment from 'moment/moment';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { faPersonWalking } from '@fortawesome/free-solid-svg-icons/faPersonWalking';
import avatar from '../images/create-group-page/group.png';
import { db, storage } from '../firebase';
import back from '../images/back.png';
import docFlat from '../images/messages-page/doc-flat.png';
import ImageComponent from '../image-component/ImageComponent';
import unpinMessage from '../images/my-contacts-page/unpin-icon.jpg';
import pinMessage from '../images/my-contacts-page/pin.svg';
import Popup from '../popup-page/Popup';
import backgroundMain from '../images/new-back.jpeg';
import likeIcon from '../images/like-icon.svg';
import GroupMessageLikePage from '../group-message-likes-page/GroupMessageLikePage';

function GroupPage({
  groupName, groupId, groupAvatar, showContactsList, adminEmail, adminName,
}) {
  const [currentAuth, setCurrentAuth] = useState(null);
  const [httpPending, setHttpPending] = useState(false);
  const [groupUsers, setGroupUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [userData, setUserData] = useState([]);
  const [usId, setUsId] = useState([]);
  const [sendButtonVisible, setSendButtonVisible] = useState(false);
  const [sendImageBlockVisible, setSendImageBlockVisible] = useState(false);
  const [sendVideoBlockVisible, setSendVideoBlockVisible] = useState(false);
  const [sendFileBlockVisible, setSendFileBlockVisible] = useState(false);
  const [image, setImage] = useState('');
  const [url, setUrl] = useState(null);
  const [downloadImageVisible, setDownloadImageVisible] = useState(false);
  const [messageImage, setMessageImage] = useState('');
  const [invisibleGroup, setInvisibleGroup] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyImage, setReplyImage] = useState('');
  const [replyVideo, setReplyVideo] = useState('');
  const [replyFile, setReplyFile] = useState('');
  const [mainSendInputVisible, setMainSendInputVisible] = useState(true);
  const [replySendInputVisible, setReplySendInputVisible] = useState(false);
  const [groupContactsVisible, setGroupContactsVisible] = useState(false);
  const [groupMessagesVisible, setGroupMessagesVisible] = useState(true);
  const [pinnedMessage, setPinnedMessage] = useState([]);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupVisible, setPopupVisible] = useState(false);
  const [pinnedMessageVisible, setPinnedMessageVisible] = useState(true);
  const [chooseButtonVisible, setChooseButtonVisible] = useState(true);
  const [backgroundsVisible, setBackgroundsVisible] = useState(false);
  // const [likes] = useState([]);
  const [mesLikes, setMesLikes] = useState([]);
  const [likesPageVisible, setLikesPageVisible] = useState(false);

  const sentStyles = {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  };
  const receivedStyles = {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  };
  const sentMessagesBackground = {
    background: '#FAEBD7',
  };
  const receivedMessagesBackground = {
    background: '#E0FFFF',
  };
  const messageImageStyles = {
    width: '40px',
    height: '40px',
    marginLeft: '10px',
    borderRadius: '50%',
  };

  const messageVideoStyles = {
    width: '200px',
    height: '60px',
    borderRadius: '10px',
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
    const auth = async () => {
      await getAuthUser();
    };
    auth();
  }, []);

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
  const myName = userData.displayName;
  const myBack = userData.background;
  const myAvatar = userData.userAvatar;

  const stylesMessages = {
    backgroundImage: `url(${myBack})`,
    position: 'relative',
  };

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

  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const getMessages = async () => {
      const q = query(collection(db, `groups/${groupId}/messages`), orderBy('created'));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setMessages(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
      await setUsId(userId);
    };
    getMessages();
  }, [currentAuth]);

  useEffect(() => {
    const getPinnedMessages = async () => {
      const q = query(collection(db, `groups/${groupId}/messages`), where('pin', '==', 1));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setPinnedMessage(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
    };
    getPinnedMessages();
  }, [currentAuth]);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };
  const handleSubmit = async () => {
    const imageId = new Date().toISOString();
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const imageRef = ref(storage, `images/${userId}/${groupId}/${image}/${imageId}`);
    uploadBytes(imageRef, image).then(() => {
      // eslint-disable-next-line no-shadow
      getDownloadURL(imageRef).then((url) => {
        setUrl(url);
      }).catch((error) => {
        console.log(error.message, 'error getting image url');
      }).catch((error) => {
        console.log(error.message, 'error getting image url');
      });
      setDownloadImageVisible(true);
    });
  };
  const toggleGroupContent = () => {
    setGroupContactsVisible((prevState) => !prevState);
    setGroupMessagesVisible((prevState) => !prevState);
  };

  const handleInput = (event) => {
    setInputMessage(event.target.value);
    if (inputMessage.length > 0) {
      setSendButtonVisible(true);
    }
  };
  const showSendImageBlock = () => {
    setSendVideoBlockVisible(false);
    setSendImageBlockVisible(true);
    setSendFileBlockVisible(false);
  };
  const showSendVideoBlock = () => {
    setSendVideoBlockVisible(true);
    setSendImageBlockVisible(false);
    setSendFileBlockVisible(false);
  };
  const showSendFileBlock = () => {
    setSendVideoBlockVisible(false);
    setSendImageBlockVisible(false);
    setSendFileBlockVisible(true);
  };
  const showGroup = () => {
    setInvisibleGroup((prevState) => !prevState);
  };

  const showImage = async (id) => {
    const imageRef = doc(db, `groups/${groupId}/messages/${id}`);
    const docSnap = await getDoc(imageRef);
    await setMessageImage(docSnap.data().attachments);
    setInvisibleGroup(true);
  };
  const hideReplyField = () => {
    setMainSendInputVisible(true);
    setReplySendInputVisible(false);
    setReplyText('');
    setReplyImage('');
    setReplyVideo('');
    setReplyFile('');
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    if (httpPending) {
      return;
    }
    setHttpPending(true);
    try {
      await addDoc(collection(db, `groups/${groupId}/messages`), {
        text: inputMessage,
        userId,
        userName: myName,
        created: serverTimestamp(),
        reply: replyText || '',
        replyImg: replyImage || '',
        replyVid: replyVideo || '',
        replyFile: replyFile || '',
        pin: 0,
      }, { merge: true });
      const q = query(collection(db, `groups/${groupId}/messages`), orderBy('created'));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setMessages(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
      setHttpPending(false);
      setInputMessage('');
      setSendButtonVisible(false);
      // eslint-disable-next-line no-shadow
    } catch (e) {
      console.log(e);
      setHttpPending(false);
    }
  };
  const sendImage = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    if (httpPending) {
      return;
    }
    setHttpPending(true);
    try {
      await addDoc(collection(db, `groups/${groupId}/messages`), {
        attachments: url,
        userId,
        userName: myName,
        created: serverTimestamp(),
        replyImg: replyImage || '',
        reply: replyText || '',
        replyVid: replyVideo || '',
        replyFile: replyFile || '',
        pin: 0,
      }, { merge: true });
      const q = query(collection(db, `groups/${groupId}/messages`), orderBy('created'));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setMessages(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
      setImage('');
      setDownloadImageVisible(false);
      setHttpPending(false);
      // eslint-disable-next-line no-shadow
    } catch (e) {
      console.log(e);
      setHttpPending(false);
    }
  };
  const sendVideo = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    if (httpPending) {
      return;
    }
    setHttpPending(true);
    try {
      await addDoc(collection(db, `groups/${groupId}/messages`), {
        video: url,
        userId,
        userName: myName,
        created: serverTimestamp(),
        replyImg: replyImage || '',
        reply: replyText || '',
        replyVid: replyVideo || '',
        replyFile: replyFile || '',
        pin: 0,
      }, { merge: true });
      const q = query(collection(db, `groups/${groupId}/messages`), orderBy('created'));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setMessages(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
      setImage('');
      setDownloadImageVisible(false);
      setHttpPending(false);
      // eslint-disable-next-line no-shadow
    } catch (e) {
      console.log(e);
      setHttpPending(false);
    }
  };
  const sendFile = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    if (httpPending) {
      return;
    }
    setHttpPending(true);
    try {
      await addDoc(collection(db, `groups/${groupId}/messages`), {
        file: url,
        userId,
        userName: myName,
        created: serverTimestamp(),
        replyImg: replyImage || '',
        reply: replyText || '',
        replyVid: replyVideo || '',
        replyFile: replyFile || '',
        pin: 0,
      }, { merge: true });
      const q = query(collection(db, `groups/${groupId}/messages`), orderBy('created'));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setMessages(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
      setImage('');
      setDownloadImageVisible(false);
      setHttpPending(false);
      // eslint-disable-next-line no-shadow
    } catch (e) {
      console.log(e);
      setHttpPending(false);
    }
  };
  const downloadFile = (file) => {
    saveAs(file);
  };
  const showReplyData = async (id) => {
    const contactRef = doc(db, `groups/${groupId}/messages/${id}`);
    const docSnap = await getDoc(contactRef);
    await setReplyText(docSnap.data().text);
    await setReplyImage(docSnap.data().attachments);
    await setReplyVideo(docSnap.data().video);
    await setReplyFile(docSnap.data().file);
    setMainSendInputVisible(false);
    setReplySendInputVisible(true);
  };
  const leaveTheGroup = async () => {
    const groupRef = doc(db, `users/${currentAuth}/groupContacts/${groupId}`);
    await deleteDoc(groupRef);
    const groupRef1 = doc(db, `groups/${groupId}/contacts/${currentAuth}`);
    await deleteDoc(groupRef1);
    const data = await getDocs(collection(db, `groups/${groupId}/contacts`));
    // eslint-disable-next-line no-shadow
    await setGroupUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    window.location.replace('/contacts');
  };
  const deleteMessage = async (id) => {
    const groupRef1 = doc(db, `groups/${groupId}/messages/${id}`);
    await deleteDoc(groupRef1);
    const q = query(collection(db, `groups/${groupId}/messages`), orderBy('created'));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(() => {
      // eslint-disable-next-line no-shadow
      setMessages(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });
  };
  const deleteChat = async () => {
    // eslint-disable-next-line no-restricted-syntax
    for (const message of messages) {
      const messageId = message.id;
      const itemRef = doc(db, `groups/${groupId}/messages/${messageId}`);
      /* eslint-disable */
      await deleteDoc(itemRef);
      const data = await getDocs(collection(db, `groups/${groupId}/messages`));
      setMessages(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    }
  };
  const addMessageToPin = async (id, text) => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    if (pinnedMessage.length === 0) {
      const messagesRef = doc(db, `groups/${groupId}/messages/${id}`);
      await setDoc(messagesRef, {
        text: text,
        userId,
        userName: myName,
        created: serverTimestamp(),
        reply: replyText || '',
        replyImg: replyImage || '',
        replyVid: replyVideo || '',
        replyFile: replyFile || '',
        pin: 1,
      }, { merge: true });
      const q = query(collection(db, `groups/${groupId}/messages`), where('pin', '==', 1));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setPinnedMessage(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
    } else {
      setPopupVisible(true);
      setPopupMessage('You can pin only one message');
      setTimeout(() => {
        setPopupVisible(false);
      }, 2000);
    }
  }
  const addImageToPin = async (id, attachments) => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    if (pinnedMessage.length === 0) {
      const messagesRef = doc(db, `groups/${groupId}/messages/${id}`);
      await setDoc(messagesRef, {
        attachments: attachments,
        userId,
        userName: myName,
        created: serverTimestamp(),
        reply: replyText || '',
        replyImg: replyImage || '',
        replyVid: replyVideo || '',
        replyFile: replyFile || '',
        pin: 1,
      }, { merge: true });
        const q = query(collection(db, `groups/${groupId}/messages`), where('pin', '==', 1));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(() => {
          // eslint-disable-next-line no-shadow
          setPinnedMessage(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        });
    } else {
      setPopupVisible(true);
      setPopupMessage('You can pin only one message');
      setTimeout(() => {
        setPopupVisible(false);
      }, 2000);
    }
  }
  const addFileToPin = async (id, file) => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    if (pinnedMessage.length === 0) {
      const messagesRef = doc(db, `groups/${groupId}/messages/${id}`);
      await setDoc(messagesRef, {
        file: file,
        userId,
        userName: myName,
        created: serverTimestamp(),
        reply: replyText || '',
        replyImg: replyImage || '',
        replyVid: replyVideo || '',
        replyFile: replyFile || '',
        pin: 1,
      }, { merge: true });
      const q = query(collection(db, `groups/${groupId}/messages`), where('pin', '==', 1));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setPinnedMessage(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
    } else {
      setPopupVisible(true);
      setPopupMessage('You can pin only one message');
      setTimeout(() => {
        setPopupVisible(false);
      }, 2000);
    }
  }
  const addVideoToPin = async (id, video) => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    if (pinnedMessage.length === 0) {
      const messagesRef = doc(db, `groups/${groupId}/messages/${id}`);
      await setDoc(messagesRef, {
        video: video,
        userId,
        userName: myName,
        created: serverTimestamp(),
        reply: replyText || '',
        replyImg: replyImage || '',
        replyVid: replyVideo || '',
        replyFile: replyFile || '',
        pin: 1,
      }, { merge: true });
      const q = query(collection(db, `groups/${groupId}/messages`), where('pin', '==', 1));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setPinnedMessage(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
    } else {
      setPopupVisible(true);
      setPopupMessage('You can pin only one message');
      setTimeout(() => {
        setPopupVisible(false);
      }, 2000);
    }
  }
  const removeMessageFromPin = async (id, text) => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const messagesRef = doc(db, `groups/${groupId}/messages/${id}`);
    await setDoc(messagesRef, {
      text: text,
      userId,
      userName: myName,
      created: serverTimestamp(),
      reply: replyText || '',
      replyImg: replyImage || '',
      replyVid: replyVideo || '',
      replyFile: replyFile || '',
      pin: 0,
    }, { merge: true });
    setPinnedMessageVisible(false);
    setTimeout(() => {
      window.location.replace('/contacts');
    }, 1000);
  };
  const removeImageFromPin = async (id, attachments) => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const messagesRef = doc(db, `groups/${groupId}/messages/${id}`);
    await setDoc(messagesRef, {
      attachments: attachments,
      userId,
      userName: myName,
      created: serverTimestamp(),
      reply: replyText || '',
      replyImg: replyImage || '',
      replyVid: replyVideo || '',
      replyFile: replyFile || '',
      pin: 0,
    }, { merge: true });
    setPinnedMessageVisible(false);
    setTimeout(() => {
      window.location.replace('/contacts');
    }, 1000);
  };
  const removeVideoFromPin = async (id, video) => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const messagesRef = doc(db, `groups/${groupId}/messages/${id}`);
    await setDoc(messagesRef, {
      video: video,
      userId,
      userName: myName,
      created: serverTimestamp(),
      reply: replyText || '',
      replyImg: replyImage || '',
      replyVid: replyVideo || '',
      replyFile: replyFile || '',
      pin: 0,
    }, { merge: true });
    setPinnedMessageVisible(false);
    setTimeout(() => {
      window.location.replace('/contacts');
    }, 1000);
  };
  const removeFileFromPin = async (id, file) => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const messagesRef = doc(db, `groups/${groupId}/messages/${id}`);
    await setDoc(messagesRef, {
      file: file,
      userId,
      userName: myName,
      created: serverTimestamp(),
      reply: replyText || '',
      replyImg: replyImage || '',
      replyVid: replyVideo || '',
      replyFile: replyFile || '',
      pin: 0,
    }, { merge: true });
    setPinnedMessageVisible(false);
    setTimeout(() => {
      window.location.replace('/contacts');
    }, 1000);
  };
  const showBackgrounds = () => {
    setChooseButtonVisible(false);
    setBackgroundsVisible(true);
  };
  const hideBackgrounds = () => {
    setChooseButtonVisible(true);
    setBackgroundsVisible(false);
  };
  const chooseBackGroundOne = async () => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const userRef = doc(db, `users/${userId}`);
    await setDoc(userRef, {
      ...userData,
      background: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__480.jpg',
    }, { merge: true });
    const userRef1 = doc(db, `users/${userId}`);
    const docSnap = await getDoc(userRef1);
    const data = docSnap.data();
    setUserData(data);
  };
  const chooseBackGroundTwo = async () => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const userRef = doc(db, `users/${userId}`);
    await setDoc(userRef, {
      ...userData,
      background: 'https://static6.depositphotos.com/1003369/659/i/600/depositphotos_6591667-stock-photo-close-up-of-beautiful-womanish.jpg',
    }, { merge: true });
    const userRef1 = doc(db, `users/${userId}`);
    const docSnap = await getDoc(userRef1);
    const data = docSnap.data();
    setUserData(data);
  };
  const chooseBackGroundThree = async () => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const userRef = doc(db, `users/${userId}`);
    await setDoc(userRef, {
      ...userData,
      background: 'https://www.canr.msu.edu/contentAsset/image/9c8f1a21-90e3-486d-9ca0-dd4a7b4b439d/fileAsset/filter/Resize,Jpeg/resize_w/750/jpeg_q/80',
    }, { merge: true });
    const userRef1 = doc(db, `users/${userId}`);
    const docSnap = await getDoc(userRef1);
    const data = docSnap.data();
    setUserData(data);
  };
  const chooseBackGroundFour = async () => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const userRef = doc(db, `users/${userId}`);
    await setDoc(userRef, {
      ...userData,
      background: 'https://bogatyr.club/uploads/posts/2021-11/thumbs/1636931398_64-bogatyr-club-p-fon-gradient-svetlii-64.png',
    }, { merge: true });
    const userRef1 = doc(db, `users/${userId}`);
    const docSnap = await getDoc(userRef1);
    const data = docSnap.data();
    setUserData(data);
  };
  const addLike = async (id) => {
    const auth = getAuth();
    const userLikedId = auth.currentUser.uid;
    const likesRef = doc(db, `groups/${groupId}/messages/${id}`);
    await updateDoc(likesRef, {
      likes: arrayUnion({
        userLikedId: userLikedId,
        userAvatar: myAvatar || '',
        userName: myName,
      }),
    }, {merge: true});
    const q = query(collection(db, `groups/${groupId}/messages`), orderBy('created'));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(() => {
      // eslint-disable-next-line no-shadow
      setMessages(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });
  }
  const showLikes = async (id) => {
    const likeRef = doc(db, 'groups', groupId, 'messages', id);
    const docSnap = await getDoc(likeRef);
    const data = docSnap.data().likes;
    await setMesLikes(data);
    setLikesPageVisible(true);
  }
  const hideLikesList = () => {
    setGroupMessagesVisible(true);
    setLikesPageVisible(false);
  }

  return (
    <>
      {
            invisibleGroup && (
            <ImageComponent
              showGroup={showGroup}
              messageImage={messageImage}
            />
            )
        }
      {
        !invisibleGroup && (
        <div className="content" style={stylesMessages}>
          <div className="group-header" key={groupId}>
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
            <div className="link-left" onClick={showContactsList} onKeyUp={showContactsList}>
              <img src={back} alt="back" />
            </div>
            <div className="group-title">
              <div className="project-main">{groupName}</div>
            </div>
            {
              groupAvatar ? <img className="group-image" src={groupAvatar} alt="avatar" /> : <img className="group-image" src={avatar} alt="avatar" />
            }
          </div>
          <div className="buttons-pannel">
            {/* eslint-disable-next-line max-len */}
            {
              adminName !== myName && (
              <button className="btn btn-28" type="button" onClick={leaveTheGroup}>
                <FontAwesomeIcon icon={faPersonWalking} />
              </button>
              )
            }
            {
                chooseButtonVisible && (
                    <button type="button" className="button-back-group" onClick={showBackgrounds}>Choose background</button>
                )
            }
            {
                backgroundsVisible && (
                    <div className="choose-back-wrapper-group">
                      <img src="https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__480.jpg"
                           alt="choose-img"
                           className="choose-img"
                           onClick={chooseBackGroundOne}
                           onKeyUp={chooseBackGroundOne}
                      />
                      <img src="https://static6.depositphotos.com/1003369/659/i/600/depositphotos_6591667-stock-photo-close-up-of-beautiful-womanish.jpg"
                           alt="choose-img"
                           className="choose-img"
                           onClick={chooseBackGroundTwo}
                           onKeyUp={chooseBackGroundTwo}
                      />
                      <img src="https://www.canr.msu.edu/contentAsset/image/9c8f1a21-90e3-486d-9ca0-dd4a7b4b439d/fileAsset/filter/Resize,Jpeg/resize_w/750/jpeg_q/80"
                           alt="choose-img"
                           className="choose-img"
                           onClick={chooseBackGroundThree}
                           onKeyUp={chooseBackGroundThree}
                      />
                      <img src={backgroundMain}
                           alt="choose-img"
                           className="choose-img"
                           onClick={chooseBackGroundFour}
                           onKeyUp={chooseBackGroundFour}
                      />
                      <FontAwesomeIcon icon={faClose}
                                       style={{cursor: 'pointer'}}
                                       onClick={hideBackgrounds}
                                       onKeyUp={hideBackgrounds}
                      />
                    </div>
                )
            }
            <FontAwesomeIcon icon={faUserGroup} onClick={toggleGroupContent} onKeyUp={toggleGroupContent} style={{ marginTop: '10px', marginLeft: '300px' }} />
          </div>
            {
              groupContactsVisible
                && (
                <div className="users-list">
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
                          </div>
                        ))
                      }
                </div>
                )
            }
          {
            groupMessagesVisible
              && (
              <div>
                {
                    pinnedMessageVisible && (
                        <div>
                          {
                            pinnedMessage.map((message) => (
                                <div key={message.id} className="pinned-message-wrapper">
                                  {
                                      message.text && (
                                          <div>
                                            <div className="pinned-message-text">{message.text}</div>
                                            <img src={unpinMessage}
                                                 alt="unpin-message"
                                                 className="unpin-message"
                                                 onClick={() => removeMessageFromPin(message.id, message.text)}
                                            />
                                          </div>
                                      )
                                  }
                                  {
                                      message.attachments && (
                                          <div>
                                            <img className="pinned-image" src={message.attachments} alt="mesImage"/>
                                            <img src={unpinMessage}
                                                 alt="unpin-message"
                                                 className="unpin-message"
                                                 onClick={() => removeImageFromPin(message.id, message.attachments)}
                                            />
                                          </div>
                                      )
                                  }
                                  {
                                      message.file && (
                                          <div className="file-wrapper">
                                            <img
                                                src={docFlat}
                                                alt="doc"
                                                style={{
                                                  width: '30px', height: '30px', marginLeft: '10px', marginRight: '10px',
                                                }}
                                            />
                                            {/* eslint-disable-next-line max-len */}
                                            <FontAwesomeIcon icon={faDownload} onClick={() => downloadFile(message.file)} />
                                            <img src={unpinMessage}
                                                 alt="unpin-message"
                                                 className="unpin-message"
                                                 onClick={() => removeFileFromPin(message.id, message.file)}
                                            />
                                          </div>
                                      )
                                  }
                                  {
                                      message.video && (
                                          <div>
                                            <video
                                                style={messageVideoStyles}
                                                src={message.video}
                                                autoPlay={message.video}
                                                controls
                                            />
                                            <img src={unpinMessage}
                                                 alt="unpin-message"
                                                 className="unpin-message"
                                                 onClick={() => removeVideoFromPin(message.id, message.video)}
                                            />
                                          </div>
                                      )
                                  }
                                </div>
                            ))
                          }
                        </div>
                    )
                }
                <div className="message-list">
                  {
                    adminName === myName && (
                    <FontAwesomeIcon
                      icon={faTrash}
                      onClick={deleteChat}
                      onKeyUp={deleteChat}
                      style={{ marginBottom: '10px', cursor: 'pointer' }}
                    />
                    )
                  }
                  {
                        messages.map((mes) => (
                          <div key={mes.id}>
                            {
                                // eslint-disable-next-line no-nested-ternary
                                mes.userId === usId
                                  ? (
                                    <div style={sentStyles}>
                                      <FontAwesomeIcon onClick={() => showReplyData(mes.id)} icon={faArrowTurnRight} style={{ marginRight: '5px' }} />
                                      <div style={sentMessagesBackground} className="message-wrapper">
                                        {
                                              mes.reply ? <div className="reply-content">{mes.reply}</div> : null
                                            }
                                        {
                                              mes.replyImg ? <img className="reply-image" src={mes.replyImg} alt="replay-img" /> : null
                                            }
                                        {
                                              // eslint-disable-next-line jsx-a11y/media-has-caption
                                              mes.replyVid ? <video className="reply-video" src={mes.replyVid} style={{ marginBottom: '10px' }} /> : null
                                            }
                                        {
                                              mes.replyFile ? (
                                                <img
                                                  src={docFlat}
                                                  alt="doc"
                                                  style={{
                                                    width: '20px', height: '20px', marginLeft: '10px', marginBottom: '10px',
                                                  }}
                                                />
                                              ) : null
                                            }
                                        <div className="message-user-name">{mes.userName}</div>
                                        {
                                          mes.text && (
                                                <div>
                                                  <img src={likeIcon}
                                                       alt="like-icon"
                                                       className="like-icon"
                                                       onClick={() => addLike(mes.id)}
                                                       onKeyUp={() => addLike(mes.id)}
                                                  />
                                                  <div className="message-text">{mes.text}</div>
                                                  {
                                                    mes.likes
                                                        ? <FontAwesomeIcon
                                                            icon={faHeart}
                                                        onClick={() => showLikes(mes.id)}
                                                        onKeyUp={() => showLikes(mes.id)}
                                                        className="favourites-icon"
                                                        />
                                                        : null
                                                  }
                                                  <div
                                                      className="message-time"
                                                  >
                                                    {moment(mes.created.toDate()).calendar()}
                                                  </div>
                                                  <div className="message-close">
                                                    <img src={pinMessage} alt="pin" className="pin-message" onClick={() => addMessageToPin(mes.id, mes.text)} />
                                                  </div>
                                                </div>
                                            )
                                        }
                                        {/* eslint-disable-next-line max-len */}
                                        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions,jsx-a11y/click-events-have-key-events */}
                                        <div
                                          className="group-message-close"
                                          onClick={() => deleteMessage(mes.id)}
                                        >
                                          <FontAwesomeIcon icon={faClose} />
                                        </div>

                                        {
                                              // eslint-disable-next-line jsx-a11y/img-redundant-alt
                                              mes.attachments ? (
                                                      <div>
                                                        <img src={likeIcon}
                                                             alt="like-icon"
                                                             className="like-icon"
                                                             onClick={() => addLike(mes.id)}
                                                             onKeyUp={() => addLike(mes.id)}
                                                        />
                                                        {
                                                          mes.likes
                                                              ? <FontAwesomeIcon
                                                                  icon={faHeart}
                                                                  onClick={() => showLikes(mes.id)}
                                                                  onKeyUp={() => showLikes(mes.id)}
                                                                  className="favourites-icon"
                                                              />
                                                              : null
                                                        }
                                                        <button
                                                            style={{ backgroundColor: 'rgba(28,28,28,0)', border: 'none', marginBottom: '5px' }}
                                                            onClick={() => showImage(mes.id)}
                                                            type="button"
                                                        >
                                                          {/* eslint-disable-next-line max-len */}
                                                          {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                                                          <img style={messageImageStyles} src={mes.attachments} alt="image" />
                                                        </button>
                                                        <div
                                                            className="message-time"
                                                        >
                                                          {moment(mes.created.toDate()).calendar()}
                                                        </div>
                                                        <div className="message-close">
                                                          <img src={pinMessage} alt="pin" className="pin-message" onClick={() => addImageToPin(mes.id, mes.attachments)} />
                                                        </div>
                                                      </div>
                                              ) : null
                                            }
                                        {
                                              // eslint-disable-next-line jsx-a11y/img-redundant-alt
                                              mes.file ? (
                                                <div className="file-wrapper">
                                                  <img src={likeIcon}
                                                       alt="like-icon"
                                                       className="like-icon"
                                                       onClick={() => addLike(mes.id)}
                                                       onKeyUp={() => addLike(mes.id)}
                                                  />
                                                  {
                                                    mes.likes
                                                        ? <FontAwesomeIcon
                                                            icon={faHeart}
                                                            onClick={() => showLikes(mes.id)}
                                                            onKeyUp={() => showLikes(mes.id)}
                                                            className="favourites-icon"
                                                        />
                                                        : null
                                                  }
                                                  <img
                                                    src={docFlat}
                                                    alt="doc"
                                                    style={{
                                                      width: '30px',
                                                      height: '30px',
                                                      marginLeft: '10px',
                                                      marginRight: '10px',
                                                      marginBottom: '15px',
                                                    }}
                                                  />
                                                  <div
                                                      className="message-time"
                                                  >
                                                    {moment(mes.created.toDate()).calendar()}
                                                  </div>
                                                  {/* eslint-disable-next-line max-len */}
                                                  <FontAwesomeIcon icon={faDownload} onClick={() => downloadFile(mes.file)} />
                                                  <div className="message-close">
                                                    <img src={pinMessage} alt="pin" className="pin-message" onClick={() => addFileToPin(mes.id, mes.file)} />
                                                  </div>
                                                </div>
                                              ) : null
                                            }
                                        {
                                              // eslint-disable-next-line jsx-a11y/img-redundant-alt
                                              mes.video ? (
                                                      <div>
                                                        <img src={likeIcon}
                                                             alt="like-icon"
                                                             className="like-icon"
                                                             onClick={() => addLike(mes.id)}
                                                             onKeyUp={() => addLike(mes.id)}
                                                        />
                                                        {
                                                          mes.likes
                                                              ? <FontAwesomeIcon
                                                                  icon={faHeart}
                                                                  onClick={() => showLikes(mes.id)}
                                                                  onKeyUp={() => showLikes(mes.id)}
                                                                  className="favourites-icon"
                                                              />
                                                              : null
                                                        }
                                                        <button
                                                            style={{ backgroundColor: 'rgba(28,28,28,0)', border: 'none', marginBottom: '10px' }}
                                                            type="button"
                                                        >
                                                          {/* eslint-disable-next-line max-len */}
                                                          { /* eslint-disable-next-line jsx-a11y/media-has-caption,max-len */ }
                                                          <video
                                                              style={messageVideoStyles}
                                                              src={mes.video}
                                                              autoPlay={mes.video}
                                                              controls
                                                          />
                                                        </button>
                                                        <div
                                                            className="message-time"
                                                        >
                                                          {moment(mes.created.toDate()).calendar()}
                                                        </div>
                                                        <div className="message-close">
                                                          <img src={pinMessage} alt="pin" className="pin-message" onClick={() => addVideoToPin(mes.id, mes.video)} />
                                                        </div>
                                                      </div>
                                              ) : null
                                            }
                                      </div>
                                    </div>
                                  )
                                  : mes.userId !== usId
                                    ? (
                                      <div style={receivedStyles}>
                                        <div style={receivedMessagesBackground} className="message-wrapper">
                                          {
                                                  mes.reply ? <div className="reply-content">{mes.reply}</div> : null
                                                }
                                          {
                                                  mes.replyImg ? <img className="reply-image" src={mes.replyImg} alt="replay-img" /> : null
                                                }
                                          {
                                            // eslint-disable-next-line max-len
                                                  // eslint-disable-next-line jsx-a11y/media-has-caption
                                                  mes.replyVid ? <video className="reply-video" src={mes.replyVid} style={{ marginBottom: '10px' }} /> : null
                                                }
                                          {
                                                  mes.replyFile ? (
                                                    <img
                                                      src={docFlat}
                                                      alt="doc"
                                                      style={{
                                                        width: '30px', height: '30px', marginLeft: '10px', marginBottom: '10px',
                                                      }}
                                                    />
                                                  ) : null
                                                }
                                          <div className="message-user-name">{mes.userName}</div>

                                          {
                                            mes.text && (
                                                  <div>
                                                    <img src={likeIcon}
                                                         alt="like-icon"
                                                         className="like-icon"
                                                         onClick={() => addLike(mes.id)}
                                                         onKeyUp={() => addLike(mes.id)}
                                                    />
                                                    <div className="message-text">{mes.text}</div>
                                                    <div className="message-user-name">{mes.userName}</div>
                                                    {
                                                      mes.likes
                                                          ? <FontAwesomeIcon
                                                              icon={faHeart}
                                                          onClick={() => showLikes(mes.id)}
                                                          onKeyUp={() => showLikes(mes.id)}
                                                          className="favourites-icon"
                                                          />
                                                          : null
                                                    }

                                                    <div
                                                        className="message-time"
                                                    >
                                                      {moment(mes.created.toDate()).calendar()}
                                                    </div>
                                                    <div className="message-close">
                                                      <img src={pinMessage} alt="pin" className="pin-message" onClick={() => addMessageToPin(mes.id, mes.text)} />
                                                    </div>

                                                  </div>
                                              )
                                          }
                                          {
                                            adminName === myName && (
                                            // eslint-disable-next-line max-len
                                            // eslint-disable-next-line jsx-a11y/no-static-element-interactions,jsx-a11y/click-events-have-key-events
                                            <div
                                              className="group-message-close"
                                              onClick={() => deleteMessage(mes.id)}
                                            >
                                              <FontAwesomeIcon icon={faClose} />
                                            </div>
                                            )
                                          }
                                          {
                                            // eslint-disable-next-line max-len
                                                  // eslint-disable-next-line jsx-a11y/img-redundant-alt
                                                  mes.attachments ? (
                                                          <div>
                                                            <img src={likeIcon}
                                                                 alt="like-icon"
                                                                 className="like-icon"
                                                                 onClick={() => addLike(mes.id)}
                                                                 onKeyUp={() => addLike(mes.id)}
                                                            />
                                                            {
                                                              mes.likes
                                                                  ? <FontAwesomeIcon
                                                                      icon={faHeart}
                                                                      onClick={() => showLikes(mes.id)}
                                                                      onKeyUp={() => showLikes(mes.id)}
                                                                      className="favourites-icon"
                                                                  />
                                                                  : null
                                                            }

                                                            <button
                                                                style={{ backgroundColor: 'rgba(28,28,28,0)', border: 'none', marginBottom: '5px' }}
                                                                onClick={() => showImage(mes.id)}
                                                                type="button"
                                                            >
                                                              {/* eslint-disable-next-line max-len */}
                                                              {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                                                              <img style={messageImageStyles} src={mes.attachments} alt="image" />
                                                            </button>
                                                            <div
                                                                className="message-time"
                                                            >
                                                              {moment(mes.created.toDate()).calendar()}
                                                            </div>
                                                            <div className="message-close">
                                                              <img src={pinMessage} alt="pin" className="pin-message" onClick={() => addImageToPin(mes.id, mes.attachments)} />
                                                            </div>

                                                          </div>
                                                  ) : null
                                                }
                                          {
                                            // eslint-disable-next-line max-len
                                                  // eslint-disable-next-line jsx-a11y/img-redundant-alt
                                                  mes.file ? (
                                                    <div className="file-wrapper">
                                                      <img src={likeIcon}
                                                           alt="like-icon"
                                                           className="like-icon"
                                                           onClick={() => addLike(mes.id)}
                                                           onKeyUp={() => addLike(mes.id)}
                                                      />
                                                      {
                                                        mes.likes
                                                            ? <FontAwesomeIcon
                                                                icon={faHeart}
                                                                onClick={() => showLikes(mes.id)}
                                                                onKeyUp={() => showLikes(mes.id)}
                                                                className="favourites-icon"
                                                            />
                                                            : null
                                                      }
                                                      <img src={docFlat}
                                                           alt="doc"
                                                           style={{
                                                             width: '30px',
                                                             height: '30px',
                                                             marginLeft: '10px',
                                                             marginRight: '10px',
                                                             marginBottom: '15px',
                                                      }}
                                                      />
                                                      <div
                                                          className="message-time"
                                                      >
                                                        {moment(mes.created.toDate()).calendar()}
                                                      </div>
                                                      {/* eslint-disable-next-line max-len */}
                                                      <FontAwesomeIcon icon={faDownload} onClick={() => downloadFile(mes.file)} />
                                                      <div className="message-close">
                                                        <img src={pinMessage} alt="pin" className="pin-message" onClick={() => addFileToPin(mes.id, mes.file)} />
                                                      </div>

                                                    </div>
                                                  ) : null
                                                }
                                          {
                                            // eslint-disable-next-line max-len
                                                  // eslint-disable-next-line jsx-a11y/img-redundant-alt
                                                  mes.video ? (
                                                          <div>
                                                            <img src={likeIcon}
                                                                 alt="like-icon"
                                                                 className="like-icon"
                                                                 onClick={() => addLike(mes.id)}
                                                                 onKeyUp={() => addLike(mes.id)}
                                                            />
                                                            {
                                                              mes.likes
                                                                  ? <FontAwesomeIcon
                                                                      icon={faHeart}
                                                                      onClick={() => showLikes(mes.id)}
                                                                      onKeyUp={() => showLikes(mes.id)}
                                                                      className="favourites-icon"
                                                                  />
                                                                  : null
                                                            }

                                                            <button
                                                                style={{ backgroundColor: 'rgba(28,28,28,0)', border: 'none', marginBottom: '10px' }}
                                                                onClick={() => showImage(mes.id)}
                                                                type="button"
                                                            >
                                                              {/* eslint-disable-next-line max-len */}
                                                              { /* eslint-disable-next-line jsx-a11y/media-has-caption,max-len */ }
                                                              <video
                                                                  style={messageVideoStyles}
                                                                  src={mes.video}
                                                                  autoPlay={mes.video}
                                                                  controls
                                                              />
                                                            </button>
                                                            <div
                                                                className="message-time"
                                                            >
                                                              {moment(mes.created.toDate()).calendar()}
                                                            </div>
                                                            <div className="message-close">
                                                              <img src={pinMessage} alt="pin" className="pin-message" onClick={() => addVideoToPin(mes.id, mes.video)} />
                                                            </div>

                                                          </div>

                                                  ) : null
                                                }
                                        </div>
                                        <FontAwesomeIcon onClick={() => showReplyData(mes.id)} icon={faArrowTurnRight} style={{ marginLeft: '5px' }} />
                                      </div>
                                    )
                                    : null
                              }
                          </div>
                        ))
                      }
                </div>
                {
                        replySendInputVisible
                        && (
                        <div className="send-input-wrapper">
                          <div className="reply-block">
                            {
                                    replyText && (
                                    <div className="reply-panel">
                                      <div className="reply-content">{replyText}</div>
                                      <FontAwesomeIcon onClick={hideReplyField} style={{ marginRight: '10px' }} icon={faClose} />
                                    </div>
                                    )
                                }
                            {
                                    replyImage
                                    && (
                                    <div className="reply-panel">
                                      {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                                      <img className="reply-image" src={replyImage} alt="reply-image" />
                                      <FontAwesomeIcon onClick={hideReplyField} style={{ marginRight: '10px' }} icon={faClose} />
                                    </div>
                                    )
                                }
                            {
                                    replyVideo
                                    && (
                                    <div className="reply-panel">
                                      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                                      <video className="reply-video" src={replyVideo} />
                                      <FontAwesomeIcon onClick={hideReplyField} style={{ marginRight: '10px' }} icon={faClose} />
                                    </div>
                                    )
                                }
                            {
                                    replyFile && (
                                    <div className="reply-panel">
                                      <img className="reply-image" src={docFlat} alt="doc-flat" />
                                      <FontAwesomeIcon onClick={hideReplyField} style={{ marginRight: '10px' }} icon={faClose} />
                                    </div>
                                    )
                                }

                            <div className="reply-input">
                              <input
                                type="text"
                                className="input-log"
                                style={{ height: '36px', width: '270px', borderRadius: '5px' }}
                                value={inputMessage}
                                placeholder="write your message"
                                onChange={handleInput}
                              />
                            </div>
                          </div>
                          {
                                sendButtonVisible ? (
                                  <button type="button" className="send-btn" onClick={sendMessage}>
                                    <FontAwesomeIcon style={{ width: '20px', height: '20px' }} icon={faPaperPlane} />
                                  </button>
                                ) : null
                              }
                        </div>
                        )
                    }
                {
                        mainSendInputVisible
                        && (
                        <div className="send-input-wrapper">
                          <input
                            type="text"
                            className="input-log"
                            style={{ height: '36px', width: '270px', borderRadius: '5px' }}
                            value={inputMessage}
                            placeholder="write your message"
                            onChange={handleInput}
                          />
                          {
                                sendButtonVisible ? (
                                  <button type="button" className="send-btn" onClick={sendMessage}>
                                    <FontAwesomeIcon style={{ width: '20px', height: '20px' }} icon={faPaperPlane} />
                                  </button>
                                ) : null
                              }
                        </div>
                        )
                    }
                <div className="media-wrapper">
                  <button style={{ backgroundColor: 'rgba(28,28,28,0)', border: 'none' }} onClick={showSendImageBlock} type="button">
                    <FontAwesomeIcon icon={faImage} style={{ width: '20px', height: '20px' }} />
                  </button>
                  <button style={{ backgroundColor: 'rgba(28,28,28,0)', border: 'none' }} onClick={showSendVideoBlock} type="button">
                    <FontAwesomeIcon icon={faVideo} style={{ width: '20px', height: '20px' }} />
                  </button>
                  <button style={{ backgroundColor: 'rgba(28,28,28,0)', border: 'none' }} onClick={showSendFileBlock} type="button">
                    <FontAwesomeIcon icon={faFile} style={{ width: '20px', height: '20px' }} />
                  </button>
                </div>
                {
                        sendImageBlockVisible && (
                        <div className="fileload">
                          <div className="file-load-block">
                            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                            <label className="input-label">
                              <FontAwesomeIcon style={{ width: '25px', height: '25px' }} icon={faPaperclip} />
                              <input style={{ opacity: '0' }} type="file" onChange={handleImageChange} value="" className="file-inp" />
                            </label>
                          </div>
                          <button className="input-btn" type="button" onClick={handleSubmit}>Download</button>
                          <button className="input-btn" type="button" onClick={sendImage}>Send image</button>
                          {
                                downloadImageVisible ? <img style={{ width: '30px', height: '30px', marginLeft: '5px' }} src={url} alt="img" /> : null
                              }
                        </div>
                        )
                    }
                {
                        sendVideoBlockVisible && (
                        <div className="fileload">
                          <div className="file-load-block">
                            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                            <label className="input-label">
                              <FontAwesomeIcon style={{ width: '25px', height: '25px' }} icon={faPaperclip} />
                              <input style={{ opacity: '0' }} type="file" onChange={handleImageChange} value="" className="file-inp" />
                            </label>
                          </div>
                          <button className="input-btn" type="button" onClick={handleSubmit}>Download</button>
                          <button className="input-btn" type="button" onClick={sendVideo}>Send video</button>
                          {
                                downloadImageVisible ? <FontAwesomeIcon style={{ width: '20px', height: '20px', marginLeft: '10px' }} icon={faDownload} /> : null
                              }
                        </div>
                        )
                    }
                {
                        sendFileBlockVisible && (
                        <div className="fileload">
                          <div className="file-load-block">
                            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                            <label className="input-label">
                              <FontAwesomeIcon style={{ width: '25px', height: '25px' }} icon={faPaperclip} />
                              <input style={{ opacity: '0' }} type="file" onChange={handleImageChange} value="" className="file-inp" />
                            </label>
                          </div>
                          <button className="input-btn" type="button" onClick={handleSubmit}>Download</button>
                          <button className="input-btn" type="button" onClick={sendFile}>Send file</button>
                          {
                                downloadImageVisible ? <FontAwesomeIcon style={{ width: '20px', height: '20px', marginLeft: '10px' }} icon={faDownload} /> : null
                              }
                        </div>
                        )
                    }
              </div>
              )
          }
          {
              popupVisible && <Popup text={popupMessage} />
          }
          {
              likesPageVisible && <GroupMessageLikePage messageLikes={mesLikes} hideLikesList={hideLikesList} />
          }

        </div>
        )
      }
    </>
  );
}

export default GroupPage;
