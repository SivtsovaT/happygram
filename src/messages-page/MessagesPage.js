import React, {useEffect, useState} from "react";
import "./MessagesPage.scss";
import {addDoc, collection, getDocs, query, serverTimestamp, where, orderBy} from "firebase/firestore";
import {db} from "../firebase";
import {getAuth} from "firebase/auth";

const MessagesPage = ({contactDisplayName, contactId, showHome}) => {
	//const [users, setUsers] = useState([]);
	const [currentAuth, setCurrentAuth] = useState(null);
	//const [userData, setUserData] = useState([]);
	const [inputMessage, setInputMessage] = useState('');
	const [httpPending, setHttpPending] = useState(false);
	const [message, setMessage] = useState([]);
	const [sentMessages, setSentMessages] = useState([]);
	//const [messages, setMessages] = useState([]);

	useEffect(() => {
		const getSentMessages = async () => {
			const q = query(collection(db, "messages"), where("contactId", "==", contactId), orderBy("created"));
			const querySnapshot = await getDocs(q);
			querySnapshot.forEach((doc) => {
				setSentMessages(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
			});
		};
		getSentMessages();
	}, [currentAuth]);

	const sendMessage = async (e) => {
		e.preventDefault();
		const items = message.push(inputMessage);
		 const auth = getAuth();
		const userId = auth.currentUser.uid;
		if (httpPending) {
			return
		}
		setHttpPending(true);
		try {
			if (inputMessage.length > 0) {
				await addDoc(collection(db, 'messages'), {
					items,
					text: inputMessage,
					userId: userId,
					contactId: contactId,
					created: serverTimestamp()
				}, {merge: true});
				const q = query(collection(db, "messages"), where("contactId", "==", contactId), orderBy("created"));
				const querySnapshot = await getDocs(q);
				querySnapshot.forEach((doc) => {
					setSentMessages(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
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
			<button onClick={showHome}>BACK</button>
			<div>{contactDisplayName}</div>
			<button onClick={sendMessage}>send</button>
			<input type="text"
				   value={inputMessage}
				   placeholder="write your message"
				   onChange={(event) => setInputMessage(event.target.value)}
			/>
			{
				sentMessages.map(message => {
					return (
						<div key={message.id}>
							{
								httpPending && <div>Wait...</div>
							}
							{
								!httpPending && <div>{message.text}</div>
							}
						</div>
					)
				})
			}
		</div>
	)
}

export default MessagesPage;