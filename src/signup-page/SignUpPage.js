import React, {useState} from "react";
import "./SignUpPage.scss";
import {auth} from "../firebase";
import {createUserWithEmailAndPassword} from "firebase/auth";
import {db} from "../firebase";
import { doc, setDoc} from "firebase/firestore";
import {Link} from "react-router-dom";
import back from "../images/back.png";
import hide from "../images/hide.png";
const SignUpPage = () => {
	const [passwordShown, setPasswordShown] = useState(false);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const togglePassword = () => {
		setPasswordShown(!passwordShown);
	};
	const handleSignup = async (event) => {
		event.preventDefault();
		if (name.length === 0) {
			alert('The field "name" cannot be empty')
		} else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
			alert('Please enter a valid email')
		} else if (password.length < 6) {
			alert("Password length cannot be less than 6 characters")
		} else if (password.valueOf() !== confirmPassword.valueOf()) {
			alert("Confirm your password please")
		} else {
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			let userRef = doc(db, `users/${userCredential.user.uid}`);
			await setDoc(userRef, {displayName: name, email: email});
			alert("Account has been created");
		}
	}
	return (
		<div className="content">
			<Link to="/signin" className="link-panel">
					<img src={back} alt="back"/>
			</Link>
			<div className="signup-wrapper">
				<div className="project-main">Create your account here</div>
				<div className="input-signup-wrapper">
						<input className="input-log height-67"
							   name="name"
							   type="text"
							   placeholder="Name"
							   value={name}
							   onChange={(event) => setName(event.target.value)}
						/>
						<input className="input-log height-67"
							   name="email1"
							   type="email"
							   placeholder="Email"
							   onChange={(event) => setEmail(event.target.value)}
							   value={email}
						/>
						<div  className='password-wrapper'>
							<input className="input-log height-58"
								   name="password"
								   type={passwordShown ? "text" : "password"}
								   placeholder="Password"
								   value={password}
								   onChange={(event) => setPassword(event.target.value)}
							/>
							<div className='password-image'>
								<img onClick={togglePassword} src={hide} alt='hide'/>
							</div>
						</div>
						<div  className='password-wrapper'>
							<input className="input-log height-58"
								   type={passwordShown ? "text" : "password"}
								   placeholder=" Confirm password"
								   value={confirmPassword}
								   onChange={(e) => setConfirmPassword(e.target.value)}
							/>
							<div className='password-image'>
								<img onClick={togglePassword} src={hide} alt='hide'/>
							</div>
						</div>
					</div>
				</div>
			<button onClick={handleSignup} className="btn btn-295">Sign up</button>
		</div>
	)
}

export default SignUpPage;