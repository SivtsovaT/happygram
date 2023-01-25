import React, {useEffect, useState} from "react";
import "./MyContactsPage.scss";
import {getAuth} from "firebase/auth";
import {db} from "../firebase";
import {doc, collection, getDocs, getDoc} from "firebase/firestore";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMagnifyingGlass} from "@fortawesome/free-solid-svg-icons/faMagnifyingGlass";
import {faRightFromBracket} from "@fortawesome/free-solid-svg-icons/faRightFromBracket";
import avatar from "../images/search-page/avatar.jpg";
import MessagesPage from "../messages-page/MessagesPage";

const MyContactsPage = () => {
	const [searchValue, setSearchValue] = useState('');
	const [currentAuth, setCurrentAuth] = useState(null);
	const [userData, setUserData] = useState([]);
	const [contacts, setContacts] = useState([]);
	const [filteredContacts, setFilteredContacts] = useState([]);
	const [contactDisplayName, setContactDisplayName] = useState('');
	const [invisibleHome, setInvisibleHome] = useState(false);
	const [contactId, setContactId] = useState('');

	const stylesHome = {
		display: invisibleHome ? "none" : "flex"
	}

	const getAuthUser = async () => {
		try {
			const auth = await getAuth();
			const userId = auth?.currentUser?.uid || null
			setCurrentAuth(userId);
			if (!userId) {
				setTimeout(() => {
					getAuthUser();
				}, 2000);
			}
		} catch (e) {
			console.log(e)
		}
	};

	useEffect(() => {
		if (!currentAuth) {
			return;
		}
		const getUser = async () => {
			const docRef = doc(db, "users", currentAuth);
			const docSnap = await getDoc(docRef);
			const data = docSnap.data();
			setUserData(data);
		}
		getUser();
	}, [currentAuth]);

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
		const getContacts = async () => {
			const data = await getDocs(collection(db, `users/${currentAuth}/contacts`));
			setContacts(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
		};
		getContacts();
	}, [currentAuth]);

	useEffect(() => {
		setFilteredContacts(
			contacts.filter(
				(contact) =>
					contact.displayName.toLowerCase().includes(searchValue.toLowerCase())
			)
		);
	}, [searchValue, contacts]);

	const showHome = () => {
		setInvisibleHome(prevState => !prevState)
	}

	const showContact = async (id) => {
		const contactId = id;
		const contactRef = doc(db, `users/${currentAuth}/contacts/${contactId}`);
		const docSnap = await getDoc(contactRef);
		await setContactDisplayName(docSnap.data().displayName);
		await setContactId(contactId);
		setInvisibleHome(true);
	}

	return (
		<>
			{
				invisibleHome && <MessagesPage contactDisplayName={contactDisplayName}
											   contactId={contactId}
											   showHome={showHome}
				/>
			}
			<div style={stylesHome} className="content">
				<div className="users-header">
					<div className="password-wrapper">
						<input
							style={{height:"36px", width:"100px"}}
							type="text"
							className="input-log"
							value={searchValue}
							onChange={(event) => setSearchValue(event.target.value)}
						/>
						<FontAwesomeIcon icon={faMagnifyingGlass} style={{marginLeft:"-30px"}}/>
					</div>
					<div className="project-main">
						Welcome, {userData.displayName}!
					</div>
					<FontAwesomeIcon style={{width:"30px", height:"30px"}} icon={faRightFromBracket}/>
				</div>
				<div className="users-list">
					{
						filteredContacts.map(contact => {
							return (
								<div key={contact.id}
									 className="user-wrapper"
								>
									<img onClick={() => showContact(contact.id)}
										 className="user-avatar" src={avatar} alt="avatar"/>
									<div className="user-info">
										<div className="project-main">{contact.displayName}</div>
										<div className="user-email">{contact.email}</div>
									</div>
								</div>
							)
						})
					}
				</div>
				<button className="btn btn-295">CONTINUE</button>
			</div>
		</>
	)
}

export default MyContactsPage;