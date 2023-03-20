import React, { useEffect, useState } from 'react';
import './MessagesPage.scss';
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  orderBy,
  doc,
  getDoc,
  where,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons/faPaperPlane';
import moment from 'moment';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  faArrowTurnRight, faClose,
  faDownload, faFile, faImage, faPaperclip, faTrash, faVideo,
} from '@fortawesome/free-solid-svg-icons';
// eslint-disable-next-line import/no-extraneous-dependencies
import { saveAs } from 'file-saver';
import back from '../images/back.png';
import docFlat from '../images/messages-page/doc-flat.png';
import pinMessage from '../images/my-contacts-page/pin.svg';
import unpinMessage from '../images/my-contacts-page/unpin-icon.jpg';
import backgroundMain from '../images/new-back.jpeg';
import { db, storage } from '../firebase';
import ImageComponent from '../image-component/ImageComponent';
import Popup from '../popup-page/Popup';

function MessagesPage({ contactId, contactDisplayName, showHome }) {
  const [currentAuth, setCurrentAuth] = useState(null);
  const [userData, setUserData] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [httpPending, setHttpPending] = useState(false);
  const [conId, setConId] = useState([]);
  const [usId, setUsId] = useState([]);
  const [messages, setMessages] = useState([]);
  const [sendButtonVisible, setSendButtonVisible] = useState(false);
  const [image, setImage] = useState('');
  const [url, setUrl] = useState(null);
  const [downloadImageVisible, setDownloadImageVisible] = useState(false);
  const [invisibleMessages, setInvisibleMessages] = useState(false);
  const [messageImage, setMessageImage] = useState('');
  const [sendImageBlockVisible, setSendImageBlockVisible] = useState(false);
  const [sendVideoBlockVisible, setSendVideoBlockVisible] = useState(false);
  const [sendFileBlockVisible, setSendFileBlockVisible] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyImage, setReplyImage] = useState('');
  const [replyVideo, setReplyVideo] = useState('');
  const [replyFile, setReplyFile] = useState('');
  const [mainSendInputVisible, setMainSendInputVisible] = useState(true);
  const [replySendInputVisible, setReplySendInputVisible] = useState(false);
  const [sentMes, setSentMes] = useState([]);
  const [resMes, setResMes] = useState([]);
  const [pinnedMessage, setPinnedMessage] = useState([]);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupVisible, setPopupVisible] = useState(false);
  const [pinnedMessageVisible, setPinnedMessageVisible] = useState(true);
  const [chooseButtonVisible, setChooseButtonVisible] = useState(true);
  const [backgroundsVisible, setBackgroundsVisible] = useState(false);

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
  const myBack = userData.background;

  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const getMessages = async () => {
      const q = query(collection(db, 'messages'), orderBy('created'));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setMessages(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
      await setConId(contactId);
      await setUsId(userId);
    };
    getMessages();
  }, [currentAuth]);

  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const getSentMessages = async () => {
      const q = query(collection(db, 'messages'), where('userId', '==', userId), where('contactId', '==', contactId));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setSentMes(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
    };
    getSentMessages();
  }, [currentAuth]);

  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const getPinnedMessages = async () => {
      const q = query(collection(db, 'messages'), where('userId', '==', userId), where('contactId', '==', contactId), where('pin', '==', 1));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setPinnedMessage(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
      const q2 = query(collection(db, 'messages'), where('userId', '==', contactId), where('contactId', '==', userId), where('pin', '==', 1));
      const querySnapshot2 = await getDocs(q2);
      querySnapshot2.forEach(() => {
        // eslint-disable-next-line no-shadow
        setPinnedMessage(querySnapshot2.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
    };
    getPinnedMessages();
  }, [currentAuth]);

  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const getReceivedMessages = async () => {
      const q = query(collection(db, 'messages'), where('userId', '==', contactId), where('contactId', '==', userId));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setResMes(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
    };
    getReceivedMessages();
  }, [currentAuth]);

  const stylesMessages = {
    display: invisibleMessages ? 'none' : 'flex',
    backgroundImage: `url(${myBack})`,
    position: 'relative',
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

  const showMessages = () => {
    setInvisibleMessages((prevState) => !prevState);
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };
  const showImage = async (id) => {
    const contactRef = doc(db, `messages/${id}`);
    const docSnap = await getDoc(contactRef);
    await setMessageImage(docSnap.data().attachments);
    setInvisibleMessages(true);
  };
  const showReplyData = async (id) => {
    const contactRef = doc(db, `messages/${id}`);
    const docSnap = await getDoc(contactRef);
    await setReplyText(docSnap.data().text);
    await setReplyImage(docSnap.data().attachments);
    await setReplyVideo(docSnap.data().video);
    await setReplyFile(docSnap.data().file);
    setMainSendInputVisible(false);
    setReplySendInputVisible(true);
  };
  const hideReplyField = () => {
    setMainSendInputVisible(true);
    setReplySendInputVisible(false);
    setReplyText('');
    setReplyImage('');
    setReplyVideo('');
    setReplyFile('');
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

  const downloadFile = (file) => {
    saveAs(file);
  };

  const handleInput = (event) => {
    setInputMessage(event.target.value);
    if (inputMessage.length > 0) {
      setSendButtonVisible(true);
    }
  };

  const handleSubmit = async () => {
    const imageId = new Date().toISOString();
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const imageRef = ref(storage, `images/${userId}/${contactId}/${image}/${imageId}`);
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
  const sendImage = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    if (httpPending) {
      return;
    }
    setHttpPending(true);
    try {
      await addDoc(collection(db, 'messages'), {
        attachments: url,
        userId,
        contactId,
        created: serverTimestamp(),
        replyImg: replyImage || '',
        reply: replyText || '',
        replyVid: replyVideo || '',
        replyFile: replyFile || '',
        pin: 0,
      }, { merge: true });
      const q = query(collection(db, 'messages'), orderBy('created'));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setMessages(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
      setImage('');
      setDownloadImageVisible(false);
      const q1 = query(collection(db, 'messages'), where('userId', '==', userId), where('contactId', '==', contactId));
      const querySnapshot1 = await getDocs(q1);
      querySnapshot1.forEach(() => {
        // eslint-disable-next-line no-shadow
        setSentMes(querySnapshot1.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
      const q2 = query(collection(db, 'messages'), where('userId', '==', contactId), where('contactId', '==', userId));
      const querySnapshot2 = await getDocs(q2);
      querySnapshot2.forEach(() => {
        // eslint-disable-next-line no-shadow
        setResMes(querySnapshot2.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });

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
      await addDoc(collection(db, 'messages'), {
        video: url,
        userId,
        contactId,
        created: serverTimestamp(),
        replyImg: replyImage || '',
        reply: replyText || '',
        replyVid: replyVideo || '',
        replyFile: replyFile || '',
        pin: 0,
      }, { merge: true });
      const q = query(collection(db, 'messages'), orderBy('created'));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setMessages(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
      setImage('');
      setDownloadImageVisible(false);
      const q1 = query(collection(db, 'messages'), where('userId', '==', userId), where('contactId', '==', contactId));
      const querySnapshot1 = await getDocs(q1);
      querySnapshot1.forEach(() => {
        // eslint-disable-next-line no-shadow
        setSentMes(querySnapshot1.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
      const q2 = query(collection(db, 'messages'), where('userId', '==', contactId), where('contactId', '==', userId));
      const querySnapshot2 = await getDocs(q2);
      querySnapshot2.forEach(() => {
        // eslint-disable-next-line no-shadow
        setResMes(querySnapshot2.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });

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
      await addDoc(collection(db, 'messages'), {
        file: url,
        userId,
        contactId,
        created: serverTimestamp(),
        replyImg: replyImage || '',
        reply: replyText || '',
        replyVid: replyVideo || '',
        replyFile: replyFile || '',
        pin: 0,
      }, { merge: true });
      const q = query(collection(db, 'messages'), orderBy('created'));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setMessages(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
      setImage('');
      setDownloadImageVisible(false);
      const q1 = query(collection(db, 'messages'), where('userId', '==', userId), where('contactId', '==', contactId));
      const querySnapshot1 = await getDocs(q1);
      querySnapshot1.forEach(() => {
        // eslint-disable-next-line no-shadow
        setSentMes(querySnapshot1.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
      const q2 = query(collection(db, 'messages'), where('userId', '==', contactId), where('contactId', '==', userId));
      const querySnapshot2 = await getDocs(q2);
      querySnapshot2.forEach(() => {
        // eslint-disable-next-line no-shadow
        setResMes(querySnapshot2.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });

      setHttpPending(false);
      // eslint-disable-next-line no-shadow
    } catch (e) {
      console.log(e);
      setHttpPending(false);
    }
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
      await addDoc(collection(db, 'messages'), {
        text: inputMessage,
        userId,
        contactId,
        created: serverTimestamp(),
        reply: replyText || '',
        replyImg: replyImage || '',
        replyVid: replyVideo || '',
        replyFile: replyFile || '',
        pin: 0,
      }, { merge: true });
      const q = query(collection(db, 'messages'), orderBy('created'));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setMessages(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
      const q1 = query(collection(db, 'messages'), where('userId', '==', userId), where('contactId', '==', contactId));
      const querySnapshot1 = await getDocs(q1);
      querySnapshot1.forEach(() => {
        // eslint-disable-next-line no-shadow
        setSentMes(querySnapshot1.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
      const q2 = query(collection(db, 'messages'), where('userId', '==', contactId), where('contactId', '==', userId));
      const querySnapshot2 = await getDocs(q2);
      querySnapshot2.forEach(() => {
        // eslint-disable-next-line no-shadow
        setResMes(querySnapshot2.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
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
  // eslint-disable-next-line no-unused-vars,no-shadow
  async function deleteCollection() {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const q = query(collection(db, 'messages'), where('userId', '==', userId), where('contactId', '==', contactId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(() => {
      // eslint-disable-next-line no-shadow
      setSentMes(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });
    // eslint-disable-next-line no-restricted-syntax
    for (const message of sentMes) {
      const messageId = message.id;
      const itemRef = doc(db, `messages/${messageId}`);
      /* eslint-disable */
      await deleteDoc(itemRef);
      const q = query(collection(db, 'messages'), orderBy('created'));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setMessages(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
    }
    const q1 = query(collection(db, 'messages'), where('userId', '==', contactId), where('contactId', '==', userId));
    const querySnapshot1 = await getDocs(q1);
    querySnapshot1.forEach(() => {
      // eslint-disable-next-line no-shadow
      setResMes(querySnapshot1.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });
    // eslint-disable-next-line no-restricted-syntax
    for (const message of resMes) {
      const messageId = message.id;
      const itemRef = doc(db, `messages/${messageId}`);
      /* eslint-disable */
      await deleteDoc(itemRef);
      const q = query(collection(db, 'messages'), orderBy('created'));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setMessages(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
    }
    window.location.replace('/contacts');
  }
  const deleteMessage = async (id) => {
    const messageRef = doc(db, `messages/${id}`);
    await deleteDoc(messageRef);
    const q = query(collection(db, 'messages'), orderBy('created'));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(() => {
      // eslint-disable-next-line no-shadow
      setMessages(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });
  };
  const addMessageToPin = async (id, text) => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    if (pinnedMessage.length === 0) {
      const messagesRef = doc(db, `messages/${id}`);
      await setDoc(messagesRef, {
        text: text,
        userId,
        contactId,
        created: serverTimestamp(),
        reply: replyText || '',
        replyImg: replyImage || '',
        replyVid: replyVideo || '',
        replyFile: replyFile || '',
        pin: 1,
      }, { merge: true });
      const q = query(collection(db, 'messages'), where('userId', '==', userId), where('contactId', '==', contactId), where('pin', '==', 1));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setPinnedMessage(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
      const q2 = query(collection(db, 'messages'), where('userId', '==', contactId), where('contactId', '==', userId), where('pin', '==', 1));
      const querySnapshot2 = await getDocs(q2);
      querySnapshot2.forEach(() => {
        // eslint-disable-next-line no-shadow
        setPinnedMessage(querySnapshot2.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
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
      const messagesRef = doc(db, `messages/${id}`);
      await setDoc(messagesRef, {
        attachments: attachments,
        userId,
        contactId,
        created: serverTimestamp(),
        reply: replyText || '',
        replyImg: replyImage || '',
        replyVid: replyVideo || '',
        replyFile: replyFile || '',
        pin: 1,
      }, { merge: true });
      const q = query(collection(db, 'messages'), where('userId', '==', userId), where('contactId', '==', contactId), where('pin', '==', 1));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setPinnedMessage(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
      const q2 = query(collection(db, 'messages'), where('userId', '==', contactId), where('contactId', '==', userId), where('pin', '==', 1));
      const querySnapshot2 = await getDocs(q2);
      querySnapshot2.forEach(() => {
        // eslint-disable-next-line no-shadow
        setPinnedMessage(querySnapshot2.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
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
      const messagesRef = doc(db, `messages/${id}`);
      await setDoc(messagesRef, {
        file: file,
        userId,
        contactId,
        created: serverTimestamp(),
        reply: replyText || '',
        replyImg: replyImage || '',
        replyVid: replyVideo || '',
        replyFile: replyFile || '',
        pin: 1,
      }, { merge: true });
      const q = query(collection(db, 'messages'), where('userId', '==', userId), where('contactId', '==', contactId), where('pin', '==', 1));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setPinnedMessage(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
      const q2 = query(collection(db, 'messages'), where('userId', '==', contactId), where('contactId', '==', userId), where('pin', '==', 1));
      const querySnapshot2 = await getDocs(q2);
      querySnapshot2.forEach(() => {
        // eslint-disable-next-line no-shadow
        setPinnedMessage(querySnapshot2.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
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
      const messagesRef = doc(db, `messages/${id}`);
      await setDoc(messagesRef, {
        video: video,
        userId,
        contactId,
        created: serverTimestamp(),
        reply: replyText || '',
        replyImg: replyImage || '',
        replyVid: replyVideo || '',
        replyFile: replyFile || '',
        pin: 1,
      }, { merge: true });
      const q = query(collection(db, 'messages'), where('userId', '==', userId), where('contactId', '==', contactId), where('pin', '==', 1));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setPinnedMessage(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
      const q2 = query(collection(db, 'messages'), where('userId', '==', contactId), where('contactId', '==', userId), where('pin', '==', 1));
      const querySnapshot2 = await getDocs(q2);
      querySnapshot2.forEach(() => {
        // eslint-disable-next-line no-shadow
        setPinnedMessage(querySnapshot2.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
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
    const messagesRef = doc(db, `messages/${id}`);
    await setDoc(messagesRef, {
      text: text,
      userId,
      contactId,
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
    const messagesRef = doc(db, `messages/${id}`);
    await setDoc(messagesRef, {
      attachments: attachments,
      userId,
      contactId,
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
    const messagesRef = doc(db, `messages/${id}`);
    await setDoc(messagesRef, {
      video: video,
      userId,
      contactId,
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
    const messagesRef = doc(db, `messages/${id}`);
    await setDoc(messagesRef, {
      file: file,
      userId,
      contactId,
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

  return (
    <>
      {
        invisibleMessages && (
        <ImageComponent
          showMessages={showMessages}
          messageImage={messageImage}
        />
        )
      }
      <div style={stylesMessages} className="content">
        <button style={{ backgroundColor: 'rgba(28,28,28,0)', border: 'none' }} type="button" onClick={showHome} className="link-panel">
          <img src={back} alt="back" />
        </button>
        <div className="project-header">{contactDisplayName}</div>
        {
          chooseButtonVisible && (
                <button type="button" className="button-back" onClick={showBackgrounds}>Choose background</button>
            )
        }
        {
          backgroundsVisible && (
                <div className="choose-back-wrapper">
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
          {/*<button type="button" onClick={deleteCollection}>delete</button>*/}
          <FontAwesomeIcon
              icon={faTrash}
              onClick={deleteCollection}
              onKeyUp={deleteCollection}
              style={{marginBottom: '10px', cursor: 'pointer'}}
          />
          {
            messages.map((mes) => (
              <div key={mes.id}>
                {
                    // eslint-disable-next-line no-nested-ternary
                    mes.userId === usId && mes.contactId === conId
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
                            {
                              mes.text && (
                                    <div>
                                      <div className="message-text">{mes.text}</div>
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
                            <div className="message-close" onClick={() => deleteMessage(mes.id)}>
                              <FontAwesomeIcon icon={faClose} />
                            </div>
                            {
                                  // eslint-disable-next-line jsx-a11y/img-redundant-alt
                                  mes.attachments ? (
                                          <div>
                                            <button
                                                style={{ backgroundColor: 'rgba(28,28,28,0)', border: 'none' }}
                                                onClick={() => showImage(mes.id)}
                                                type="button"
                                            >
                                              {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                                              <img style={messageImageStyles} src={mes.attachments} alt="image" />
                                            </button>
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
                                  <img
                                    src={docFlat}
                                    alt="doc"
                                    style={{
                                      width: '30px', height: '30px', marginLeft: '10px', marginRight: '10px',
                                    }}
                                  />
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
                                        <button
                                            style={{ backgroundColor: 'rgba(28,28,28,0)', border: 'none' }}
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
                                        <div className="message-close">
                                          <img src={pinMessage} alt="pin" className="pin-message" onClick={() => addVideoToPin(mes.id, mes.video)} />
                                        </div>
                                      </div>
                              ) : null
                            }
                          </div>
                        </div>
                      )
                      : mes.userId === conId && mes.contactId === usId
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
                              {
                                mes.text && (
                                      <div>
                                        <div className="message-text">{mes.text}</div>
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
                              <div className="message-close" onClick={() => deleteMessage(mes.id)}>
                                <FontAwesomeIcon icon={faClose} />
                              </div>
                              {
                                // eslint-disable-next-line jsx-a11y/img-redundant-alt
                                mes.attachments ? (
                                    <div>
                                      <button
                                          style={{ backgroundColor: 'rgba(28,28,28,0)', border: 'none' }}
                                          onClick={() => showImage(mes.id)}
                                          type="button"
                                      >
                                        {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                                        <img style={messageImageStyles} src={mes.attachments} alt="image" />
                                      </button>
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
                                    <img src={docFlat} alt="doc" style={{ width: '30px', height: '30px', marginLeft: '10px' }} />
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
                                      <button
                                          style={{ backgroundColor: 'rgba(28,28,28,0)', border: 'none' }}
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
        {
            popupVisible && <Popup text={popupMessage} />
        }
      </div>
    </>
  );
}

export default MessagesPage;
