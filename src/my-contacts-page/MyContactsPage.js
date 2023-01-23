import React, {useEffect, useState} from "react";
import "./MyContactsPage.scss";
import {getAuth} from "firebase/auth";
import {db} from "../firebase";
import {doc, collection, getDocs, query, setDoc, getDoc} from "firebase/firestore";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMagnifyingGlass} from "@fortawesome/free-solid-svg-icons/faMagnifyingGlass";
import logo from "../images/logo.png";
import {faRightFromBracket} from "@fortawesome/free-solid-svg-icons/faRightFromBracket";
import avatar from "../images/search-page/avatar.jpg";
import {faUserPlus} from "@fortawesome/free-solid-svg-icons/faUserPlus";
import {Link} from "react-router-dom";
import back from "../images/back.png";


const MyContactsPage = () => {
	const [users, setUsers] = useState([]);
	const [searchValue, setSearchValue] = useState('');
	const [currentAuth, setCurrentAuth] = useState(null);
	const [userData, setUserData] = useState([]);
	const [contacts, setContacts] = useState([]);
	const [filteredContacts, setFilteredContacts] = useState([]);


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
			const data = await getDocs(collection(db, `users/${currentAuth}/dialogs`));
			setContacts(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
		};
		getContacts();
	}, [currentAuth]);

	useEffect(() => {
		setFilteredContacts(
			contacts.filter(
				(contact) =>
					contact.contactName.toLowerCase().includes(searchValue.toLowerCase())
			)
		);
	}, [searchValue, contacts]);



	const showPreviousPage = (event) => {
		event.preventDefault();
		window.location.replace("search");
	}




	return (
		<div className="content">
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
							<div key={contact.id} className="user-wrapper">
								<img className="user-avatar" src={avatar} alt="avatar"/>
								<div className="user-info">
									<div className="project-main">{contact.contactName}</div>
									<div className="user-email">{contact.contactEmail}</div>
								</div>

							</div>
						)
					})
				}
			</div>
			<button onClick={showPreviousPage} className="btn btn-295">CONTINUE</button>

		</div>
	)
}

export default MyContactsPage;