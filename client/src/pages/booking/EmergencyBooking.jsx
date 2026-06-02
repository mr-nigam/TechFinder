import { useState } from 'react';

import {
    Navbar,
    Footer
} from '#components';


const EmergencyBooking = () => {
    const [formData, setFormData] = useState({
        emergencyType: "",
        description: "",
        location: "",
        contactName: "",
        contactPhone: "",
        accessInstructions: "",
        priority: "high",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log(formData);

        // API Call
        // POST /bookings/emergency
    };

    return (
        <>
            <Navbar />
            
            <div className="bg-slate-50 min-h-screen">
                {/* Hero */}
                <section className="bg-red-600 text-white">
                    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                        <div className="text-6xl mb-4">
                            🚨
                        </div>

                        <h1 className="text-5xl font-bold mb-4">
                            Emergency Service
                        </h1>

                        <p className="text-xl text-red-100">
                            24/7 urgent repair services with guaranteed response times
                        </p>

                        <div className="grid md:grid-cols-3 gap-6 mt-10">
                            <div>
                                <div className="text-3xl font-bold">
                                    &lt; 15 Min
                                </div>
                                <div>Response Time</div>
                            </div>

                            <div>
                                <div className="text-3xl font-bold">
                                    24/7
                                </div>
                                <div>Availability</div>
                            </div>

                            <div>
                                <div className="text-3xl font-bold">
                                    98%
                                </div>
                                <div>Success Rate</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Content */}
                <section className="max-w-7xl mx-auto px-4 py-12">
                    <div className="grid lg:grid-cols-3 gap-8">

                        {/* Form */}
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-8">
                            <h2 className="text-3xl font-bold mb-6">
                                Request Emergency Service
                            </h2>

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >
                                <select
                                    name="emergencyType"
                                    value={formData.emergencyType}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-3"
                                    required
                                >
                                    <option value="">
                                        Select Emergency Type
                                    </option>

                                    <option value="plumbing">
                                        Plumbing Emergency
                                    </option>

                                    <option value="electrical">
                                        Electrical Emergency
                                    </option>

                                    <option value="hvac">
                                        HVAC Emergency
                                    </option>

                                    <option value="computer">
                                        Computer Emergency
                                    </option>

                                    <option value="vehicle">
                                        Vehicle Emergency
                                    </option>

                                    <option value="other">
                                        Other Emergency
                                    </option>
                                </select>

                                <textarea
                                    name="description"
                                    rows="4"
                                    placeholder="Describe the emergency..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-3"
                                    required
                                />

                                <input
                                    type="text"
                                    name="location"
                                    placeholder="Emergency Location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-3"
                                    required
                                />

                                <div className="grid md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        name="contactName"
                                        placeholder="Contact Name"
                                        value={formData.contactName}
                                        onChange={handleChange}
                                        className="border rounded-lg p-3"
                                        required
                                    />

                                    <input
                                        type="tel"
                                        name="contactPhone"
                                        placeholder="Phone Number"
                                        value={formData.contactPhone}
                                        onChange={handleChange}
                                        className="border rounded-lg p-3"
                                        required
                                    />
                                </div>

                                <textarea
                                    name="accessInstructions"
                                    rows="3"
                                    placeholder="Access Instructions"
                                    value={
                                        formData.accessInstructions
                                    }
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-3"
                                />

                                <div>
                                    <h3 className="font-semibold mb-3">
                                        Priority Level
                                    </h3>

                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="priority"
                                                value="high"
                                                checked={
                                                    formData.priority ===
                                                    "high"
                                                }
                                                onChange={handleChange}
                                            />
                                            High
                                        </label>

                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="priority"
                                                value="critical"
                                                checked={
                                                    formData.priority ===
                                                    "critical"
                                                }
                                                onChange={handleChange}
                                            />
                                            Critical
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-semibold"
                                >
                                    Request Emergency Service
                                </button>
                            </form>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">

                            <div className="bg-white rounded-2xl shadow p-6">
                                <h3 className="text-xl font-bold mb-4">
                                    What Happens Next?
                                </h3>

                                <ul className="space-y-4 text-slate-600">
                                    <li>
                                        📞 Call confirmation within 2
                                        minutes
                                    </li>

                                    <li>
                                        🚗 Nearest technician assigned
                                    </li>

                                    <li>
                                        📍 Real-time technician tracking
                                    </li>

                                    <li>
                                        🔧 Emergency issue resolution
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white rounded-2xl shadow p-6">
                                <h3 className="text-xl font-bold mb-4">
                                    Emergency Hotline
                                </h3>

                                <div className="text-center">
                                    <div className="text-3xl mb-3">
                                        📞
                                    </div>

                                    <div className="text-2xl font-bold text-red-600">
                                        1-800-EMERGENCY
                                    </div>

                                    <p className="text-slate-500 mt-2">
                                        Available 24/7
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>
            </div>

            <Footer />
        </>
    );
};


export default EmergencyBooking;