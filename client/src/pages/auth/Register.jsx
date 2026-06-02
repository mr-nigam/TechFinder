import { useState } from 'react';

import {
    Navbar,
    Footer
} from '#components';


const Register = ()=> {
    const [formData, setFormData] = useState({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        gender: "not_shared",
        dateOfBirth: "",
        bio: "",
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

        if(
            !/^[a-zA-Z0-9_]{3,25}$/.test(formData.username)
        ){
            newErrors.username =
                "Username must be 3-25 chars and contain only letters, numbers and underscores";
        }

        if(
            !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
                formData.email
            )
        ){
            newErrors.email = "Invalid email";
        }

        if(
            !/^\+[1-9][0-9]{6,14}$/.test(formData.phone)
        ){
            newErrors.phone =
                "Phone must be in E.164 format (+919876543210)";
        }

        if(formData.password.length < 8) {
            newErrors.password =
                "Password must be at least 8 characters";
        }

        if(
            formData.password !== formData.confirmPassword
        ){
            newErrors.confirmPassword =
                "Passwords do not match";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!validate()) return;

        const payload = {
            username: formData.username,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            gender: formData.gender,
            date_of_birth:
                formData.dateOfBirth || null,
            bio: formData.bio || null,
        };

        try{
            console.log(payload);

            // await api.post('/auth/register', payload)
        }catch(error){
            console.error(error);
        }
    };

    return (
        <>
            <Navbar/>
            <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 px-4 py-10">
                <div className="w-full max-w-lg">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">

                        {/* Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-slate-800">
                                Create Account
                            </h2>
                            <p className="text-slate-500 mt-2">
                                Join TechFinder to access our services
                            </p>
                        </div>

                        {/* Form */}
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4"
                        >
                            {/* Username */}
                            <div>
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                                />

                                {errors.username && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.username}
                                    </p>
                                )}
                            </div>

                            {/* First Name */}
                            <input
                                type="text"
                                name="firstName"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                            />

                            {/* Last Name */}
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                            />

                            {/* Email */}
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

                            {/* Phone */}
                            <div>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="+919876543210"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                                />

                                {errors.phone && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>

                            {/* Gender */}
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-600"
                            >
                                <option value="not_shared">
                                    Prefer not to say
                                </option>
                                <option value="male">
                                    Male
                                </option>
                                <option value="female">
                                    Female
                                </option>
                                <option value="other">
                                    Other
                                </option>
                            </select>

                            {/* DOB */}
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-600"
                            />

                            {/* Bio */}
                            <textarea
                                name="bio"
                                placeholder="Tell us about yourself"
                                rows="4"
                                value={formData.bio}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-600 resize-none"
                            />

                            {/* Password */}
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

                            {/* Confirm Password */}
                            <div>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                                />

                                {errors.confirmPassword && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>

                            {/* Button */}
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition duration-300 shadow-md hover:shadow-lg"
                            >
                                Create Account
                            </button>
                        </form>

                        {/* Login Link */}
                        <div className="mt-6 pt-6 border-t text-center">
                            <p className="text-slate-600">
                                Already have an account?{" "}
                                <a
                                    href="/login"
                                    className="text-blue-600 hover:text-blue-700 font-semibold"
                                >
                                    Sign In
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <Footer/>
        </>
);

}


export default Register;