import { 
    Routes,
    Route 
} from "react-router-dom";

import './App.css';

import {
    Home,
    Login,
    Register,
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
                path="/booking/emergency"
                element={<EmergencyBooking />}
            />

            <Route
                path="/technician/:id"
                element={<TechnicianProfile />}
            />
        </Routes>
    );
}

export default App;
