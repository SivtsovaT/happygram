import React, { useEffect, useState } from 'react';
import './MessagesPage.scss';
import {
  addDoc, collection, getDocs, query, serverTimestamp, orderBy, doc, getDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons/faPaperPlane';
import moment from 'moment';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  faArrowTurnRight, faClose,
  faDownload, faFile, faImage, faPaperclip, faVideo,
} from '@fortawesome/free-solid-svg-icons';
// eslint-disable-next-line import/no-extraneous-dependencies
import { saveAs } from 'file-saver';
import back from '../images/back.png';
import docFlat from '../images/messages-page/doc-flat.png';
import { db, storage } from '../firebase';
import ImageComponent from '../image-component/ImageComponent';

function MessagesPage({ contactId, contactDisplayName, showHome }) {
  const [currentAuth] = useState(null);
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

  const stylesMessages = {
    display: invisibleMessages ? 'none' : 'flex',
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
      }, { merge: true });
      const q = query(collection(db, 'messages'), orderBy('created'));
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
      await addDoc(collection(db, 'messages'), {
        video: url,
        userId,
        contactId,
        created: serverTimestamp(),
        replyImg: replyImage || '',
        reply: replyText || '',
        replyVid: replyVideo || '',
        replyFile: replyFile || '',
      }, { merge: true });
      const q = query(collection(db, 'messages'), orderBy('created'));
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
      await addDoc(collection(db, 'messages'), {
        file: url,
        userId,
        contactId,
        created: serverTimestamp(),
        replyImg: replyImage || '',
        reply: replyText || '',
        replyVid: replyVideo || '',
        replyFile: replyFile || '',
      }, { merge: true });
      const q = query(collection(db, 'messages'), orderBy('created'));
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
      }, { merge: true });
      const q = query(collection(db, 'messages'), orderBy('created'));
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
        <div className="message-list">
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
                            <div className="message-text">{mes.text}</div>
                            <div
                              className="message-time"
                            >
                              {moment(mes.created.toDate()).calendar()}
                            </div>
                            {
                                  // eslint-disable-next-line jsx-a11y/img-redundant-alt
                                  mes.attachments ? (
                                    <button
                                      style={{ backgroundColor: 'rgba(28,28,28,0)', border: 'none' }}
                                      onClick={() => showImage(mes.id)}
                                      type="button"
                                    >
                                      {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                                      <img style={messageImageStyles} src={mes.attachments} alt="image" />
                                    </button>
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
                                </div>
                              ) : null
                            }

                            {
                              // eslint-disable-next-line jsx-a11y/img-redundant-alt
                              mes.video ? (
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

                              <div className="message-text">{mes.text}</div>
                              <div
                                className="message-time"
                              >
                                {moment(mes.created.toDate()).calendar()}
                              </div>
                              {
                                // eslint-disable-next-line jsx-a11y/img-redundant-alt
                                mes.attachments ? (
                                  <button
                                    style={{ backgroundColor: 'rgba(28,28,28,0)', border: 'none' }}
                                    onClick={() => showImage(mes.id)}
                                    type="button"
                                  >
                                    {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                                    <img style={messageImageStyles} src={mes.attachments} alt="image" />
                                  </button>
                                ) : null
                              }
                              {
                                // eslint-disable-next-line jsx-a11y/img-redundant-alt
                                mes.file ? (
                                  <div className="file-wrapper">
                                    <img src={docFlat} alt="doc" style={{ width: '30px', height: '30px', marginLeft: '10px' }} />
                                    {/* eslint-disable-next-line max-len */}
                                    <FontAwesomeIcon icon={faDownload} onClick={() => downloadFile(mes.file)} />
                                  </div>
                                ) : null
                              }

                              {
                                // eslint-disable-next-line jsx-a11y/img-redundant-alt
                                mes.video ? (
                                  <button
                                    style={{ backgroundColor: 'rgba(28,28,28,0)', border: 'none' }}
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
    </>
  );
}

export default MessagesPage;
