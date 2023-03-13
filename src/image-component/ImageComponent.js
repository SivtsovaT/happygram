import React from 'react';
import './ImageComponent.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';

function ImageComponent({
  showMessages, messageImage, showGroup, showChannel,
}) {
  return (
    <div className="content-messages">
      <img className="message-image" src={messageImage} alt="message_image" />
      {
            showMessages && (
              // eslint-disable-next-line jsx-a11y/no-static-element-interactions
              <div className="image-btn" onClick={showMessages} onKeyUp={showMessages}>
                <FontAwesomeIcon icon={faClose} style={{ width: '20px', height: '20px' }} />
              </div>
            )
        }
      {
            showGroup && (
              // eslint-disable-next-line jsx-a11y/no-static-element-interactions
              <div className="image-btn" onClick={showGroup} onKeyUp={showGroup}>
                <FontAwesomeIcon icon={faClose} style={{ width: '20px', height: '20px' }} />
              </div>
            )

      }
      {
            showChannel && (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <div className="image-btn" onClick={showChannel} onKeyUp={showChannel}>
              <FontAwesomeIcon icon={faClose} style={{ width: '20px', height: '20px' }} />
            </div>
            )
        }
    </div>
  );
}

export default ImageComponent;
