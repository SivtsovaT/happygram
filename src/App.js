import React from "react";
import './index.scss';
import {Route, Routes} from "react-router-dom";
import SplashPage from "./splash-page/SplashPage";
import SignUpPage from "./signup-page/SignUpPage";
import SignInPage from "./signin-page/SignInPage";
const App = () => {
  return (
      <>
          <Routes>
              <Route path="/" element={<SplashPage/>}/>
              <Route path="signup" element={<SignUpPage/>}/>
              <Route path="signin" element={<SignInPage/>}/>
          </Routes>
      </>
  )
}
export default App;
