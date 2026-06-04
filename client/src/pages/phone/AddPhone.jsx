import { useState } from "react";

import {
    Navbar,
    Footer,
} from "#components";


const AddPhone = () => {
    const [formData, setFormData] = useState({
        phone: "",
        phoneType: "alternate",
    });

    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (
            !/^\+[1-9][0-9]{6,14}$/.test(
                formData.phone
            )
        ) {
            newErrors.phone =
                "Phone must be in E.164 format (+919876543210)";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSuccess("");

        if (!validate()) return;

        try {
            const payload = {
                phone: formData.phone,
                phone_type: formData.phoneType,
            };

            console.log(payload);

            // await api.post("/phones", payload);

            setSuccess(
                "Phone number added successfully."
            );

            setFormData({
                phone: "",
                phoneType: "alternate",
            });

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <Navbar />

            <section className="min-h-screen bg-slate-50 py-12">
                <div className="max-w-lg mx-auto px-4">

                    <div className="bg-white rounded-2xl shadow-lg p-8">

                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-bold text-slate-800">
                                Add Phone Number
                            </h1>

                            <p className="text-slate-500 mt-2">
                                Add an alternate, family,
                                WhatsApp or emergency contact.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >

                            <div>
                                <label className="block mb-2 font-medium text-slate-700">
                                    Phone Number
                                </label>

                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="+919876543210"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-600"
                                />

                                {errors.phone && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-slate-700">
                                    Phone Type
                                </label>

                                <select
                                    name="phoneType"
                                    value={
                                        formData.phoneType
                                    }
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-600"
                                >
                                    <option value="alternate">
                                        Alternate
                                    </option>

                                    <option value="family">
                                        Family
                                    </option>

                                    <option value="whatsapp">
                                        WhatsApp
                                    </option>

                                    <option value="emergency">
                                        Emergency
                                    </option>
                                </select>
                            </div>

                            {success && (
                                <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg">
                                    {success}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
                            >
                                Add Phone Number
                            </button>

                        </form>

                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
};


export default AddPhone;