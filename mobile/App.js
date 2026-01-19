import React from "react";

import Login from './screens/Auth/Login';
import SignUp from './screens/Auth/signup';
import Dashboard from './screens/UserInformation/Dashboard';
import NewDebate from "./screens/Debate/NewDebate";
import StartDebate from "./screens/Debate/StartDebate";
import Subject from "./screens/Debate/Subject";
import Chat from "./screens/Debate/Chat";
import Categories from "./screens/Debate/Categories";
import RootStack from "./navigators/RootStack";

export default function App() {
  return <RootStack/>;
}
