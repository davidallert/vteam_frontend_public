import React from 'react';
import './App.css';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

import Login from './components/Login';
import Register from './components/Register';
import Mapscooter from './components/Mapscooter';
import UserInfo from './components/UserInfo';

import Balance from './components/Balance';
import GoogleCallback from './components/OauthCallback';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/userinfo" element={<UserInfo/>} />
                <Route path="/balance" element={<Balance />} />
                <Route path="/google/callback" element={< GoogleCallback/>} />

                <Route path="/mapscooter" element={<Mapscooter />} />
            </Routes>
        </Router>
    );
}

export default App;
