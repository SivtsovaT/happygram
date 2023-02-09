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

  const stylesMessages = {
    display: invisibleMessages ? 'none' : 'flex',
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
    const messageId = id;
    const contactRef = doc(db, `messages/${messageId}`);
    const docSnap = await getDoc(contactRef);
    await setMessageImage(docSnap.data().attachments);
    setInvisibleMessages(true);
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
  const sendImage = async () => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    await addDoc(collection(db, 'messages'), {
      attachments: url,
      userId,
      contactId,
      created: serverTimestamp(),
    }, { merge: true });
    const q = query(collection(db, 'messages'), orderBy('created'));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(() => {
      // eslint-disable-next-line no-shadow
      setMessages(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });
    setImage('');
    setDownloadImageVisible(false);
  };
  const sendVideo = async () => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    await addDoc(collection(db, 'messages'), {
      video: url,
      userId,
      contactId,
      created: serverTimestamp(),
    }, { merge: true });
    const q = query(collection(db, 'messages'), orderBy('created'));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(() => {
      // eslint-disable-next-line no-shadow
      setMessages(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });
    setImage('');
    setDownloadImageVisible(false);
  };
  const sendFile = async () => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    await addDoc(collection(db, 'messages'), {
      file: url,
      userId,
      contactId,
      created: serverTimestamp(),
    }, { merge: true });
    const q = query(collection(db, 'messages'), orderBy('created'));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(() => {
      // eslint-disable-next-line no-shadow
      setMessages(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });
    setImage('');
    setDownloadImageVisible(false);
  };

  const sentStyles = {
    display: 'flex',
    justifyContent: 'flex-end',

  };
  const receivedStyles = {
    display: 'flex',
    justifyContent: 'flex-start',
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

  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const getSeMessages = async () => {
      const q = query(collection(db, 'messages'), orderBy('created'));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(() => {
        // eslint-disable-next-line no-shadow
        setMessages(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      });
      await setConId(contactId);
      await setUsId(userId);
    };
    getSeMessages();
  }, [currentAuth]);
  const handleInput = (event) => {
    setInputMessage(event.target.value);
    if (inputMessage.length > 0) {
      setSendButtonVisible(true);
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
    const messageFile = file;
    saveAs(messageFile);
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
        {/* <div className="image-large" /> */}
        <div className="message-list">
          {
            messages.map((mes) => (
              <div key={mes.id}>
                {
                    // eslint-disable-next-line no-nested-ternary
                    mes.userId === usId && mes.contactId === conId
                      ? (
                        <div style={sentStyles}>
                          <div style={sentMessagesBackground} className="message-wrapper">
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
                                  // onClick={() => showImage(mes.id)}
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
                          </div>
                        )
                        : null
                  }
              </div>
            ))
          }
        </div>
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
