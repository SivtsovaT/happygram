import React from 'react';
import './ImageComponent.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';

function ImageComponent({ showMessages, messageImage }) {
  return (
    <div className="content-messages">
      <button className="image-btn" type="button" onClick={showMessages}>
        <FontAwesomeIcon icon={faClose} style={{ width: '20px', height: '20px' }} />
      </button>
      <img className="message-image" src={messageImage} alt="message_image" />
    </div>
  );
}

export default ImageComponent;
