import React from 'react';
import './App.css';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

import Login from './components/Login';
import Register from './components/Register';
import Mapscooter from './components/Mapscooter';
import UserInfo from './components/UserInfo';
import TripsHistory from './components/Trips';
import Help from './components/Help'
import Receipts from './components/Receipts';


import Balance from './components/Balance';
import GoogleCallback from './components/OauthCallback';
import PrivateRoute from './components/PrivateRoutes';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/google/callback" element={< GoogleCallback/>} />
                <Route path="/userinfo" element={<PrivateRoute element={UserInfo} />} />
                <Route path="/balance" element={<PrivateRoute element={Balance} />} />
                <Route path="/mapscooter" element={<PrivateRoute element={Mapscooter} />} />
                <Route path="/trips" element={<PrivateRoute element={TripsHistory} />} />
                <Route path="/help" element={<PrivateRoute element={Help} />} />
                <Route path="/receipts" element={<PrivateRoute element={Receipts} />} />
            </Routes>
        </Router>
    );
}

export default App;
