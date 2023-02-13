import React from 'react';
import './ImageComponent.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';

function ImageComponent({ showMessages, messageImage }) {
  return (
    <div className="content-messages">
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div className="image-btn" onClick={showMessages} onKeyUp={showMessages}>
        <FontAwesomeIcon icon={faClose} style={{ width: '20px', height: '20px' }} />
      </div>
      <img className="message-image" src={messageImage} alt="message_image" />
    </div>
  );
}

export default ImageComponent;
