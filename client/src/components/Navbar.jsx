import { Link, NavLink } from "react-router-dom";
import { useState } from "react";

const Navbar = () => {
    // Replace with AuthContext later
    const isLoggedIn = true;

    const [showProfileMenu, setShowProfileMenu] =
        useState(false);

    return (
        <nav className="sticky top-0 z-50 bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-2"
                    >
                        <span className="text-2xl">
                            🔧
                        </span>

                        <span className="text-2xl font-bold text-blue-600">
                            TechFinder
                        </span>
                    </Link>

                    {/* Navigation */}
                    <div className="flex items-center gap-8">

                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                isActive
                                    ? "text-blue-600 font-semibold"
                                    : "text-slate-600 hover:text-blue-600 transition"
                            }
                        >
                            Home
                        </NavLink>

                        <NavLink
                            to="/book-service"
                            className={({ isActive }) =>
                                isActive
                                    ? "text-blue-600 font-semibold"
                                    : "text-slate-600 hover:text-blue-600 transition"
                            }
                        >
                            Book Service
                        </NavLink>

                        {isLoggedIn && (
                            <>
                                <NavLink
                                    to="/bookings"
                                    className={({ isActive }) =>
                                        isActive
                                            ? "text-blue-600 font-semibold"
                                            : "text-slate-600 hover:text-blue-600 transition"
                                    }
                                >
                                    My Bookings
                                </NavLink>

                                <NavLink
                                    to="/chat"
                                    className={({ isActive }) =>
                                        isActive
                                            ? "text-blue-600 font-semibold"
                                            : "text-slate-600 hover:text-blue-600 transition"
                                    }
                                >
                                    Chat
                                </NavLink>
                            </>
                        )}

                        {!isLoggedIn ? (
                            <div className="flex items-center gap-3">
                                <NavLink
                                    to="/login"
                                    className="text-slate-600 hover:text-blue-600"
                                >
                                    Login
                                </NavLink>

                                <NavLink
                                    to="/register"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                                >
                                    Register
                                </NavLink>
                            </div>
                        ) : (
                            <div className="relative">

                                <button
                                    onClick={() =>
                                        setShowProfileMenu(
                                            !showProfileMenu
                                        )
                                    }
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-medium">
                                        US
                                    </div>

                                    <span className="font-medium">
                                        Profile
                                    </span>

                                    <svg
                                        className={`w-4 h-4 transition ${
                                            showProfileMenu
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>

                                {showProfileMenu && (
                                    <div className="absolute right-0 mt-3 w-56 bg-white border rounded-xl shadow-lg overflow-hidden">

                                        <Link
                                            to="/profile"
                                            className="block px-4 py-3 hover:bg-slate-50"
                                        >
                                            My Profile
                                        </Link>

                                        <Link
                                            to="/booking-history"
                                            className="block px-4 py-3 hover:bg-slate-50"
                                        >
                                            Booking History
                                        </Link>

                                        <Link
                                            to="/settings"
                                            className="block px-4 py-3 hover:bg-slate-50"
                                        >
                                            Settings
                                        </Link>

                                        <hr />

                                        <button
                                            className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50"
                                        >
                                            Logout
                                        </button>

                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;