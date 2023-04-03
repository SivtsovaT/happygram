import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import avatar from '../images/search-page/avatar.jpg';

function GroupMessageLikePage({ messageLikes, hideLikesList }) {
  return (
    <div className="likes-page-wrapper">
      <FontAwesomeIcon
        icon={faClose}
        onClick={hideLikesList}
        onKeyUp={hideLikesList}
        className="close-icon"
      />
      {
        messageLikes.map((messageLike) => (
          <div key={messageLike.id} className="user-wrapper">
            {
                messageLike.userAvatar
                  ? <img src={messageLike.userAvatar} alt="avatar" className="user-avatar" />
                  : <img src={avatar} alt="avatar" className="user-avatar" />
              }

            <div className="project-main">{messageLike.userName}</div>
          </div>
        ))
      }
    </div>
  );
}

export default GroupMessageLikePage;
