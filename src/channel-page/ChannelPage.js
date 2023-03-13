import React, { useEffect, useState } from 'react';
import './ChannelPage.scss';
import { getAuth } from 'firebase/auth';
import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPersonWalking } from '@fortawesome/free-solid-svg-icons/faPersonWalking';
import {
  faArrowTurnRight,
  faClose,
  faDownload,
  faFile,
  faImage, faPaperclip,
  faUserGroup,
  faVideo,
} from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons/faPaperPlane';
import docFlat from '../images/messages-page/doc-flat.png';
import avatar from '../images/create-group-page/group.png';
import back from '../images/back.png';
import ImageComponent from '../image-component/ImageComponent';
import { db, storage } from '../firebase';

// eslint-disable-next-line max-len
function ChannelPage({
  channelName, channelId, channelAvatar, showContactsList, adminName,
}) {
  /* eslint-disable */

  const [currentAuth, setCurrentAuth] = useState(null);
  const [httpPending, setHttpPending] = useState(false);
  const [channelUsers, setChannelUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [userData, setUserData] = useState([]);
  const [sendButtonVisible, setSendButtonVisible] = useState(false);
  const [sendImageBlockVisible, setSendImageBlockVisible] = useState(false);
  const [sendVideoBlockVisible, setSendVideoBlockVisible] = useState(false);
  const [sendFileBlockVisible, setSendFileBlockVisible] = useState(false);
  const [image, setImage] = useState('');
  const [url, setUrl] = useState(null);
  const [downloadImageVisible, setDownloadImageVisible] = useState(false);
  const [messageImage, setMessageImage] = useState('');
  const [invisibleChannel, setInvisibleChannel] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyImage, setReplyImage] = useState('');
  const [replyVideo, setReplyVideo] = useState('');
  const [replyFile, setReplyFile] = useState('');
  const [mainSendInputVisible, setMainSendInputVisible] = useState(true);
  const [replySendInputVisible, setReplySendInputVisible] = useState(false);
  const [channelContactsVisible, setChannelContactsVisible] = useState(false);
  const [channelMessagesVisible, setChannelMessagesVisible] = useState(true);

  const sentMessagesBackground = {
    background: '#FAEBD7',
    width: '300px',
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

  useEffect(() => {
    const getMessages = async () => {
      const q = query(collection(db, `channels/${channelId}/messages`), orderBy('created'));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setMessages(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
    };
    getMessages();
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
    const imageRef = ref(storage, `images/${userId}/${channelId}/${image}/${imageId}`);
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
    setChannelContactsVisible((prevState) => !prevState);
    setChannelMessagesVisible((prevState) => !prevState);
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
  const showChannel = () => {
    setInvisibleChannel((prevState) => !prevState);
  };

  const showImage = async (id) => {
    const contactRef = doc(db, `channels/${channelId}/messages/${id}`);
    const docSnap = await getDoc(contactRef);
    await setMessageImage(docSnap.data().attachments);
    setInvisibleChannel(true);
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
      await addDoc(collection(db, `channels/${channelId}/messages`), {
        text: inputMessage,
        userId,
        userName: myName,
        created: serverTimestamp(),
        reply: replyText || '',
        replyImg: replyImage || '',
        replyVid: replyVideo || '',
        replyFile: replyFile || '',
      }, { merge: true });
      const q = query(collection(db, `channels/${channelId}/messages`), orderBy('created'));
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
      await addDoc(collection(db, `channels/${channelId}/messages`), {
        attachments: url,
        userId,
        userName: myName,
        created: serverTimestamp(),
        replyImg: replyImage || '',
        reply: replyText || '',
        replyVid: replyVideo || '',
        replyFile: replyFile || '',
      }, { merge: true });
      const q = query(collection(db, `channels/${channelId}/messages`), orderBy('created'));
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
      await addDoc(collection(db, `channels/${channelId}/messages`), {
        video: url,
        userId,
        userName: myName,
        created: serverTimestamp(),
        replyImg: replyImage || '',
        reply: replyText || '',
        replyVid: replyVideo || '',
        replyFile: replyFile || '',
      }, { merge: true });
      const q = query(collection(db, `channels/${channelId}/messages`), orderBy('created'));
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
      await addDoc(collection(db, `channels/${channelId}/messages`), {
        file: url,
        userId,
        userName: myName,
        created: serverTimestamp(),
        replyImg: replyImage || '',
        reply: replyText || '',
        replyVid: replyVideo || '',
        replyFile: replyFile || '',
      }, { merge: true });
      const q = query(collection(db, `channels/${channelId}/messages`), orderBy('created'));
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
    // eslint-disable-next-line no-undef
    saveAs(file);
  };
  const showReplyData = async (id) => {
    const contactRef = doc(db, `channels/${channelId}/messages/${id}`);
    const docSnap = await getDoc(contactRef);
    await setReplyText(docSnap.data().text);
    await setReplyImage(docSnap.data().attachments);
    await setReplyVideo(docSnap.data().video);
    await setReplyFile(docSnap.data().file);
    setMainSendInputVisible(false);
    setReplySendInputVisible(true);
  };
  const leaveTheChannel = async () => {
    const groupRef = doc(db, `users/${currentAuth}/channelContacts/${channelId}`);
    await deleteDoc(groupRef);
    const groupRef1 = doc(db, `channels/${channelId}/contacts/${currentAuth}`);
    await deleteDoc(groupRef1);
    const data = await getDocs(collection(db, `channels/${channelId}/contacts`));
    // eslint-disable-next-line no-shadow
    await setChannelUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    window.location.replace('/contacts');
  };

  return (
    <>
      {
                invisibleChannel && (
                <ImageComponent
                  showChannel={showChannel}
                  messageImage={messageImage}
                />
                )
            }
      {
                !invisibleChannel && (
                <div className="content">
                  <div className="group-header" key={channelId}>
                    {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                    <div className="link-left" onClick={showContactsList} onKeyUp={showContactsList}>
                      <img src={back} alt="back" />
                    </div>
                    <div className="group-title">
                      <div className="project-main">{channelName}</div>
                    </div>
                    {
                                channelAvatar ? <img className="group-image" src={channelAvatar} alt="avatar" /> : <img className="group-image" src={avatar} alt="avatar" />
                            }
                  </div>
                  <div className="buttons-pannel">
                    {/* eslint-disable-next-line max-len */}
                    {
                                adminName !== myName && (
                                <button className="btn btn-28" type="button" onClick={leaveTheChannel}>
                                  <FontAwesomeIcon icon={faPersonWalking} />
                                </button>
                                )
                            }
                    <FontAwesomeIcon icon={faUserGroup} onClick={toggleGroupContent} onKeyUp={toggleGroupContent} style={{ marginTop: '10px', marginLeft: '300px' }} />
                  </div>
                  {
                            channelContactsVisible
                            && (
                            <div className="users-list">
                              {
                                        channelUsers.map((channelUser) => (
                                          <div key={channelUser.id} className="user-wrapper">
                                            <img className="user-avatar" src={avatar} alt="avatar" />
                                            <div className="user-info">
                                              {
                                                channelUser.displayName === adminName
                                                ? <div className="project-main">{channelUser.displayName} (admin)</div>
                                                : <div className="project-main">{channelUser.displayName}</div>
                                              }
                                              <div className="user-email">{channelUser.email}</div>
                                            </div>
                                          </div>
                                        ))
                                    }
                            </div>
                            )
                        }
                  {
                            channelMessagesVisible
                            && (
                            <div>
                              <div className="message-list">
                                {
                                messages.map((mes) => (
                                  <div key={mes.id}>
                                    <div className="channel-message">
                                      <div style={sentMessagesBackground} className="message-wrapper">
                                        {
                                          mes.reply ? <div className="reply-content">{mes.reply}</div> : null
                                        }
                                        {
                                          mes.replyImg ? (
                                              <img
                                                  className="reply-image"
                                                  src={mes.replyImg}
                                                  alt="replay-img"
                                              />
                                          ) : null
                                        }
                                        {
                                          // eslint-disable-next-line max-len
                                          // eslint-disable-next-line jsx-a11y/media-has-caption
                                          mes.replyVid ? (
                                              // eslint-disable-next-line max-len
                                              // eslint-disable-next-line jsx-a11y/media-has-caption
                                              <video
                                                  className="reply-video"
                                                  src={mes.replyVid}
                                                  style={{ marginBottom: '10px' }}
                                              />
                                          ) : null
                                        }
                                        {
                                          mes.replyFile ? (
                                              <img
                                                  src={docFlat}
                                                  alt="doc"
                                                  style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    marginLeft: '10px',
                                                    marginBottom: '10px',
                                                  }}
                                              />
                                          ) : null
                                        }
                                        <div className="message-text">{mes.text}</div>
                                        <div className="message-user-name">{mes.userName}</div>
                                        <div
                                            className="message-time"
                                        >
                                          {moment(mes.created.toDate()).calendar()}
                                        </div>
                                        {
                                          // eslint-disable-next-line max-len
                                          // eslint-disable-next-line jsx-a11y/img-redundant-alt
                                          mes.attachments ? (
                                              <button
                                                  style={{ backgroundColor: 'rgba(28,28,28,0)', border: 'none' }}
                                                  onClick={() => showImage(mes.id)}
                                                  type="button"
                                              >
                                                {/* eslint-disable-next-line max-len */}
                                                {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                                                <img style={messageImageStyles} src={mes.attachments} alt="image" />
                                              </button>
                                          ) : null
                                        }
                                        {
                                          // eslint-disable-next-line max-len
                                          // eslint-disable-next-line jsx-a11y/img-redundant-alt
                                          mes.file ? (
                                              <div className="file-wrapper">
                                                <img
                                                    src={docFlat}
                                                    alt="doc"
                                                    style={{
                                                      width: '30px',
                                                      height: '30px',
                                                      marginLeft: '10px',
                                                      marginRight: '10px',
                                                    }}
                                                />
                                                {/* eslint-disable-next-line max-len */}
                                                <FontAwesomeIcon
                                                    icon={faDownload}
                                                    onClick={() => downloadFile(mes.file)}
                                                />
                                              </div>
                                          ) : null
                                        }

                                        {
                                          // eslint-disable-next-line max-len
                                          // eslint-disable-next-line jsx-a11y/img-redundant-alt
                                          mes.video ? (
                                              <button
                                                  style={{ backgroundColor: 'rgba(28,28,28,0)', border: 'none' }}
                                                  type="button"
                                              >
                                                {/* eslint-disable-next-line max-len */}
                                                { /* eslint-disable-next-line jsx-a11y/media-has-caption,max-len */}
                                                <video
                                                    style={messageVideoStyles}
                                                    src={mes.video}
                                                    autoPlay={mes.video}
                                                    controls
                                                />
                                              </button>
                                          ) : null
                                        }
                                      </div>
                                      <FontAwesomeIcon
                                          onClick={() => showReplyData(mes.id)}
                                          icon={faArrowTurnRight}
                                          style={{ marginLeft: '5px' }}
                                      />
                                    </div>
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
                                              <FontAwesomeIcon
                                                onClick={hideReplyField}
                                                style={{ marginRight: '10px' }}
                                                icon={faClose}
                                              />
                                            </div>
                                            )
                                        }
                                    {
                                            replyImage
                                            && (
                                            <div className="reply-panel">
                                              {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                                              <img className="reply-image" src={replyImage} alt="reply-image" />
                                              <FontAwesomeIcon
                                                onClick={hideReplyField}
                                                style={{ marginRight: '10px' }}
                                                icon={faClose}
                                              />
                                            </div>
                                            )
                                        }
                                    {
                                            replyVideo
                                            && (
                                            <div className="reply-panel">
                                              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                                              <video className="reply-video" src={replyVideo} />
                                              <FontAwesomeIcon
                                                onClick={hideReplyField}
                                                style={{ marginRight: '10px' }}
                                                icon={faClose}
                                              />
                                            </div>
                                            )
                                        }
                                    {
                                            replyFile && (
                                            <div className="reply-panel">
                                              <img className="reply-image" src={docFlat} alt="doc-flat" />
                                              <FontAwesomeIcon
                                                onClick={hideReplyField}
                                                style={{ marginRight: '10px' }}
                                                icon={faClose}
                                              />
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
                </div>
                )
            }
    </>
  );
}

export default ChannelPage;
