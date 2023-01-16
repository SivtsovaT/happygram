import React from "react";
import './index.scss';
import {Route, Routes} from "react-router-dom";
import SplashPage from "./splash-page/SplashPage";
const App = () => {
  return (
      <>
          <Routes>
              <Route path="/" element={<SplashPage/>}/>
          </Routes>
      </>
  )
}
export default App;
