import { useState } from "react";

import {
    Navbar,
    Footer
} from '#components';


const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        }

        if (!formData.password.trim()) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            console.log(formData);

            // await loginUser(formData);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <Navbar/>
            <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 px-4 py-10">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">

                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-slate-800">
                                Welcome Back
                            </h2>

                            <p className="text-slate-500 mt-2">
                                Sign in to your account
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            <div>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                                />

                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                                />

                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <a
                                    href="/forgot-password"
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    Forgot Password?
                                </a>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition duration-300 shadow-md hover:shadow-lg"
                            >
                                Sign In
                            </button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-300"></div>
                            </div>

                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-3 text-slate-500">
                                    OR
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                type="button"
                                className="w-full flex items-center justify-center gap-3 border border-slate-300 py-3 rounded-lg hover:bg-slate-50 transition"
                            >
                                <img
                                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                                    alt="Google"
                                    className="w-5 h-5"
                                />
                                Continue with Google
                            </button>

                            <button
                                type="button"
                                className="w-full flex items-center justify-center gap-3 border border-slate-300 py-3 rounded-lg hover:bg-slate-50 transition"
                            >
                                Continue with Facebook
                            </button>
                        </div>

                        <div className="mt-6 pt-6 border-t text-center">
                            <p className="text-slate-600">
                                Don't have an account?{" "}
                                <a
                                    href="/register"
                                    className="text-blue-600 hover:text-blue-700 font-semibold"
                                >
                                    Sign Up
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <Footer/>
        </>
    );
};


export default Login;