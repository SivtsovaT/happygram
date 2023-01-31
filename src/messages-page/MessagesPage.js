import React, {useEffect, useState} from "react";
import "./MessagesPage.scss";
import {addDoc, collection, getDocs, query, serverTimestamp, orderBy} from "firebase/firestore";
import {db} from "../firebase";
import {getAuth} from "firebase/auth";
import back from "../images/back.png";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPaperPlane} from "@fortawesome/free-solid-svg-icons/faPaperPlane";
import moment from "moment";

const MessagesPage = ({contactDisplayName, contactId, showHome}) => {
	const [currentAuth, setCurrentAuth] = useState(null);
	const [inputMessage, setInputMessage] = useState('');
	const [httpPending, setHttpPending] = useState(false);
	const [conId, setConId] = useState([]);
	const [usId, setUsId] = useState([]);
	const [messages, setMessages] = useState([]);

	const sentStyles = {
		display: "flex",
		justifyContent: "flex-end",

	}
	const receivedStyles = {
		display: "flex",
		justifyContent: "flex-start",
	}

	const sentMessagesBackground = {
		background: "#FAEBD7"
	}

	const receivedMessagesBackground = {
		background: "#E0FFFF"
	}
    const [date, setDate] = useState('');

	useEffect(() => {
		const auth = getAuth();
		const userId = auth.currentUser.uid;
		const getSeMessages = async () => {
			const q = query(collection(db, "messages"), orderBy("created"));
			const querySnapshot = await getDocs(q);
			querySnapshot.forEach((doc) => {
				setMessages(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
			});
			await setConId(contactId);
			await setUsId(userId);
		};
		getSeMessages();
	}, [currentAuth]);


	const sendMessage = async (e) => {
		e.preventDefault();
		 const auth = getAuth();
		const userId = auth.currentUser.uid;
		if (httpPending) {
			return
		}
		setHttpPending(true);
		try {
			if (inputMessage.length > 0) {
				await addDoc(collection(db, 'messages'), {
					text: inputMessage,
					userId: userId,
					contactId: contactId,
					created: serverTimestamp()
				}, {merge: true});
				const q = query(collection(db, "messages"), orderBy("created"));
				const querySnapshot = await getDocs(q);
				querySnapshot.forEach((doc) => {
					setMessages(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
				});

				setHttpPending(false);
				setInputMessage('');
			} else {
				alert('Please write something');
			}
		} catch (e) {
			console.log(e);
			setHttpPending(false);
		}
	}

	return (
		<div className="content">
			<div onClick={showHome} className="link-panel">
				<img src={back} alt="back"/>
			</div>
			<div className="project-header">{contactDisplayName}</div>
			<div className="message-list">
				{
					messages.map(mes => {
						return (
							<div key={mes.id}>
								{
									mes.userId == usId && mes.contactId == conId ?
										<div style={sentStyles}>
											<div style={sentMessagesBackground} className="message-wrapper">
												<div className="message-text">{mes.text}</div>
												<div
													className="message-time">{moment(mes.created.toDate()).calendar()}</div>
											</div>
										</div> :
										mes.userId == conId && mes.contactId == usId ?
											<div style={receivedStyles}>
												<div style={receivedMessagesBackground} className="message-wrapper">
													<div className="message-text">{mes.text}</div>
													<div
														className="message-time">{moment(mes.created.toDate()).calendar()}</div>
												</div>
											</div>
											: null
								}
							</div>
						)
					})
				}
			</div>
			<div className="send-input-wrapper">
				<input type="text"
					   className="input-log"
					   style={{height:"36px", width:"270px", borderRadius:"5px"}}
					   value={inputMessage}
					   placeholder="write your message"
					   onChange={(event) => setInputMessage(event.target.value)}
				/>
				<button className="send-btn" onClick={sendMessage}>
					<FontAwesomeIcon style={{width:"20px", height:"20px"}} icon={faPaperPlane}/>
				</button>
			</div>
		</div>
	)
}

export default MessagesPage;