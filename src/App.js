import React from 'react';
import './App.css';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

import Login from './components/Login';
import Register from './components/Register';
import Mapscooter from './components/Mapscooter';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/mapscooter" element={<Mapscooter />} />
            </Routes>
        </Router>
    );
}

export default App;
