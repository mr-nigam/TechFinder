import { 
    Routes,
    Route 
} from "react-router-dom";

import './App.css';

import {
    Home,
    Login,
    AddPhone,
    Register,
    InstantBooking,
    EmergencyBooking,
    TechnicianProfile
} from '#pages';

// import ForgotPassword from "./pages/auth/ForgotPassword";


function App() {
    return (
        <Routes>
            <Route
                path="/"
                element={<Home />}
            />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            {/* <Route
                path="/forgot-password"
                element={<ForgotPassword />}
            /> */}

            <Route
                path="/booking/instant"
                element={<InstantBooking />}
            />
            
            <Route
                path="/booking/emergency"
                element={<EmergencyBooking />}
            />

            <Route
                path="/technician/:id"
                element={<TechnicianProfile />}
            />

            <Route
                path="/profile/phones/add"
                element={<AddPhone />}
            />

        </Routes>
    );
}

export default App;
