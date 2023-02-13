import React from 'react';
import './index.scss';
import { Route, Routes } from 'react-router-dom';
import SplashPage from './splash-page/SplashPage';
import SignUpPage from './signup-page/SignUpPage';
import SignInPage from './signin-page/SignInPage';
import SignInByPhonePage from './signIn-by-phone-page/SignInByPhonePage';
import SearchPage from './search-page/SearchPage';
import ResetPasswordPage from './reset-password-page/ResetPasswordPage';
import MyContactsPage from './my-contacts-page/MyContactsPage';
import CreateGroupPage from './create-group-page/CreateGroupPage';
import GroupsListPage from './groups-list-page/GroupsListPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="signup" element={<SignUpPage />} />
      <Route path="signin" element={<SignInPage />} />
      <Route path="phone" element={<SignInByPhonePage />} />
      <Route path="search" element={<SearchPage />} />
      <Route path="reset" element={<ResetPasswordPage />} />
      <Route path="contacts" element={<MyContactsPage />} />
      <Route path="group" element={<CreateGroupPage />} />
      <Route path="groupslist" element={<GroupsListPage />} />
    </Routes>
  );
}
export default App;
