import { useState } from "react";

import {
    Navbar,
    Footer,
} from "#components";

const InstantBooking = () => {
    const [formData, setFormData] = useState({
        category: "",
        service: "",
        description: "",
    });

    const [addresses, setAddresses] = useState([
        {
            id: "1",
            label: "Home",
            full_address: "123 Main Street, Delhi",
        },
        {
            id: "2",
            label: "Office",
            full_address: "Sector 18, Noida",
        },
    ]);

    const [phones, setPhones] = useState([
        {
            id: "1",
            phone: "+919876543210",
            phone_type: "primary",
        },
        {
            id: "2",
            phone: "+918888888888",
            phone_type: "whatsapp",
        },
    ]);

    const [selectedAddress, setSelectedAddress] =
        useState("1");

    const [selectedPhone, setSelectedPhone] =
        useState("1");

    const [errors, setErrors] = useState({});

    const [showAddressModal,
        setShowAddressModal] =
        useState(false);

    const [showPhoneModal,
        setShowPhoneModal] =
        useState(false);

    const [newAddress,
        setNewAddress] = useState({
        label: "",
        full_address: "",
    });

    const [newPhone,
        setNewPhone] = useState({
        phone: "",
        phone_type: "alternate",
    });

    // const [currentLocation, setCurrentLocation] = 
    //     useState(null);

    // const [isFetchingLocation, 
    //     setIsFetchingLocation] = 
    //     useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.category) {
            newErrors.category =
                "Category is required";
        }

        if (!formData.service.trim()) {
            newErrors.service =
                "Service is required";
        }

        if (!selectedAddress) {
            newErrors.address =
                "Please select an address";
        }

        if (!selectedPhone) {
            newErrors.phone =
                "Please select a contact number";
        }

        if (!formData.description.trim()) {
            newErrors.description =
                "Description is required";
        }

        setErrors(newErrors);

        return (
            Object.keys(newErrors).length === 0
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            const payload = {
                booking_type: "instant",

                category: formData.category,

                service: formData.service,

                description:
                    formData.description,

                address_id:
                    selectedAddress,

                phone_id:
                    selectedPhone,
            };

            console.log(payload);

            // navigate("/technicians")
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddAddress = (e) => {
        e.preventDefault();

        const address = {
            id: crypto.randomUUID(),
            ...newAddress,
        };

        setAddresses((prev) => [
            ...prev,
            address,
        ]);

        setSelectedAddress(address.id);

        setNewAddress({
            label: "",
            full_address: "",
        });

        setShowAddressModal(false);
    };

    const handleAddPhone = (e) => {
        e.preventDefault();

        const phone = {
            id: crypto.randomUUID(),
            ...newPhone,
        };

        setPhones((prev) => [
            ...prev,
            phone,
        ]);

        setSelectedPhone(phone.id);

        setNewPhone({
            phone: "",
            phone_type: "alternate",
        });

        setShowPhoneModal(false);
    };

    return (
        <>
            <Navbar />

            <section className="min-h-screen bg-slate-50 py-12">
                <div className="max-w-4xl mx-auto px-4">

                    <div className="bg-white rounded-2xl shadow-lg p-8">

                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="text-6xl mb-4">
                                ⚡
                            </div>

                            <h1 className="text-3xl font-bold text-slate-800">
                                Instant Booking
                            </h1>

                            <p className="text-slate-500 mt-2">
                                Get a technician assigned immediately.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-8"
                        >

                            {/* Category */}
                            <div>
                                <label className="block mb-2 font-medium">
                                    Category
                                </label>

                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full border-2 border-slate-200 rounded-lg px-4 py-3"
                                >
                                    <option value="">
                                        Select Category
                                    </option>

                                    <option value="home">
                                        Home Repair
                                    </option>

                                    <option value="computer">
                                        Computer Repair
                                    </option>

                                    <option value="vehicle">
                                        Vehicle Repair
                                    </option>
                                </select>

                                {errors.category && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.category}
                                    </p>
                                )}
                            </div>

                            {/* Service */}
                            <div>
                                <label className="block mb-2 font-medium">
                                    Service
                                </label>

                                <input
                                    type="text"
                                    name="service"
                                    placeholder="AC Repair, Plumbing, Laptop Repair..."
                                    value={formData.service}
                                    onChange={handleChange}
                                    className="w-full border-2 border-slate-200 rounded-lg px-4 py-3"
                                />

                                {errors.service && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.service}
                                    </p>
                                )}
                            </div>

                            {/* Address Selection */}
                            <div>
                                <label className="block mb-2 font-medium">
                                    Service Address
                                </label>

                                <select
                                    value={selectedAddress}
                                    onChange={(e) =>
                                        setSelectedAddress(
                                            e.target.value
                                        )
                                    }
                                    className="w-full border-2 border-slate-200 rounded-lg px-4 py-3"
                                >
                                    {addresses.map((address) => (
                                        <option
                                            key={address.id}
                                            value={address.id}
                                        >
                                            {address.label}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowAddressModal(true)
                                    }
                                    className="mt-2 text-blue-600 hover:text-blue-700"
                                >
                                    + Add New Address
                                </button>

                                {selectedAddress && (
                                    <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
                                        {
                                            addresses.find(
                                                (a) =>
                                                    a.id ===
                                                    selectedAddress
                                            )?.full_address
                                        }
                                    </div>
                                )}
                            </div>
                            
                            {/* Phone Selection */}
                            <div>
                                <label className="block mb-2 font-medium">
                                    Contact Number
                                </label>

                                <select
                                    value={selectedPhone}
                                    onChange={(e) =>
                                        setSelectedPhone(
                                            e.target.value
                                        )
                                    }
                                    className="w-full border-2 border-slate-200 rounded-lg px-4 py-3"
                                >
                                    {phones.map((phone) => (
                                        <option
                                            key={phone.id}
                                            value={phone.id}
                                        >
                                            {phone.phone_type} - {phone.phone}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPhoneModal(true)
                                    }
                                    className="mt-2 text-blue-600 hover:text-blue-700"
                                >
                                    + Add New Number
                                </button>
                            </div>
                            {/* Description */}
                            <div>
                                <label className="block mb-2 font-medium">
                                    Problem Description
                                </label>

                                <textarea
                                    rows="4"
                                    name="description"
                                    placeholder="Describe the issue..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full border-2 border-slate-200 rounded-lg px-4 py-3"
                                />

                                {errors.description && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            {/* Info */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-semibold text-blue-700">
                                    How Instant Booking Works
                                </h3>

                                <ul className="mt-2 text-sm text-slate-600 space-y-1">
                                    <li>
                                        • We find available technicians near you.
                                    </li>

                                    <li>
                                        • Compare ratings, reviews and pricing.
                                    </li>

                                    <li>
                                        • Technician arrives as soon as possible.
                                    </li>
                                </ul>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
                            >
                                Find Available Technicians
                            </button>

                        </form>
                    </div>
                </div>
            </section>

            {/* Add Address Modal */}
            {showAddressModal && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            Add Address
                        </h2>

                        <form
                            onSubmit={
                                handleAddAddress
                            }
                            className="space-y-4"
                        >
                            <input
                                placeholder="Home, Office..."
                                className="w-full border p-3 rounded-lg"
                                value={
                                    newAddress.label
                                }
                                onChange={(e) =>
                                    setNewAddress({
                                        ...newAddress,
                                        label:
                                            e.target
                                                .value,
                                    })
                                }
                            />

                            <textarea
                                rows="4"
                                placeholder="Full Address"
                                className="w-full border p-3 rounded-lg"
                                value={
                                    newAddress.full_address
                                }
                                onChange={(e) =>
                                    setNewAddress({
                                        ...newAddress,
                                        full_address:
                                            e.target
                                                .value,
                                    })
                                }
                            />

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
                                >
                                    Save
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowAddressModal(
                                            false
                                        )
                                    }
                                    className="flex-1 border py-2 rounded-lg"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Phone Modal */}
            {showPhoneModal && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            Add Phone Number
                        </h2>

                        <form
                            onSubmit={handleAddPhone}
                            className="space-y-4"
                        >
                            <input
                                type="tel"
                                placeholder="+919876543210"
                                className="w-full border p-3 rounded-lg"
                                value={
                                    newPhone.phone
                                }
                                onChange={(e) =>
                                    setNewPhone({
                                        ...newPhone,
                                        phone:
                                            e.target
                                                .value,
                                    })
                                }
                            />

                            <select
                                className="w-full border p-3 rounded-lg"
                                value={
                                    newPhone.phone_type
                                }
                                onChange={(e) =>
                                    setNewPhone({
                                        ...newPhone,
                                        phone_type:
                                            e.target
                                                .value,
                                    })
                                }
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

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
                                >
                                    Save
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPhoneModal(
                                            false
                                        )
                                    }
                                    className="flex-1 border py-2 rounded-lg"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
};

export default InstantBooking;