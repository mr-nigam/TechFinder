import { useNavigate } from "react-router-dom";

import {
    Navbar,
    Footer
} from '#components';


const TechnicianProfile = () => {
    const navigate = useNavigate();

    const technician = {
        id: 1,
        name: "Ankul Dubey",
        rating: 4.9,
        reviews: 243,
        experience: "4 Years",
        completedJobs: 1240,
        location: "Jalandhar, Punjab",
        verified: true,
        about:
            "Experienced technician specializing in home repairs, electrical work, HVAC systems, and emergency maintenance.",
        services: [
            {
                name: "Electrical Repair",
                price: "$50/hr",
            },
            {
                name: "HVAC Maintenance",
                price: "$70/hr",
            },
            {
                name: "Plumbing Service",
                price: "$60/hr",
            },
        ],
    };

    return (
        <>
            <Navbar />

            <div className="bg-slate-50 min-h-screen">

                {/* Header */}
                <section className="bg-white border-b">
                    <div className="max-w-7xl mx-auto px-4 py-8">

                        <button
                            onClick={() => navigate(-1)}
                            className="mb-6 text-blue-600"
                        >
                            ← Back
                        </button>

                        <div className="flex flex-col md:flex-row gap-6">

                            <img
                                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43"
                                alt={technician.name}
                                className="w-36 h-36 rounded-full object-cover"
                            />

                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-4xl font-bold">
                                        {technician.name}
                                    </h1>

                                    {technician.verified && (
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                                            Verified
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-6 mt-4 text-slate-600">
                                    <span>
                                        ⭐ {technician.rating}
                                    </span>

                                    <span>
                                        {technician.reviews} Reviews
                                    </span>

                                    <span>
                                        {technician.experience}
                                    </span>

                                    <span>
                                        {technician.completedJobs} Jobs Completed
                                    </span>
                                </div>

                                <p className="mt-3 text-slate-500">
                                    📍 {technician.location}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Content */}
                <section className="max-w-7xl mx-auto px-4 py-10">
                    <div className="grid lg:grid-cols-3 gap-8">

                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* About */}
                            <div className="bg-white rounded-2xl p-6 shadow">
                                <h2 className="text-2xl font-bold mb-4">
                                    About
                                </h2>

                                <p className="text-slate-600">
                                    {technician.about}
                                </p>
                            </div>

                            {/* Services */}
                            <div className="bg-white rounded-2xl p-6 shadow">
                                <h2 className="text-2xl font-bold mb-4">
                                    Services & Pricing
                                </h2>

                                <div className="space-y-4">
                                    {technician.services.map(
                                        (service) => (
                                            <div
                                                key={service.name}
                                                className="flex justify-between border-b pb-3"
                                            >
                                                <span>
                                                    {service.name}
                                                </span>

                                                <span className="font-semibold">
                                                    {service.price}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Reviews */}
                            <div className="bg-white rounded-2xl p-6 shadow">
                                <h2 className="text-2xl font-bold mb-4">
                                    Reviews
                                </h2>

                                <div className="space-y-4">
                                    <div className="border-b pb-4">
                                        <div>
                                            ⭐⭐⭐⭐⭐
                                        </div>

                                        <p className="mt-2">
                                            Excellent service.
                                            Fixed my issue
                                            quickly.
                                        </p>
                                    </div>

                                    <div>
                                        <div>
                                            ⭐⭐⭐⭐⭐
                                        </div>

                                        <p className="mt-2">
                                            Professional and
                                            punctual.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Portfolio */}
                            <div className="bg-white rounded-2xl p-6 shadow">
                                <h2 className="text-2xl font-bold mb-4">
                                    Portfolio
                                </h2>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {[1, 2, 3, 4, 5, 6].map(
                                        (item) => (
                                            <div
                                                key={item}
                                                className="aspect-square bg-slate-200 rounded-lg"
                                            />
                                        )
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">

                            <div className="bg-white rounded-2xl p-6 shadow">
                                <h3 className="font-bold text-xl mb-4">
                                    Availability
                                </h3>

                                <p className="text-green-600 font-medium">
                                    ● Available Today
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow">

                                <button
                                    onClick={() =>
                                        navigate(
                                            `/booking/schedule/${technician.id}`
                                        )
                                    }
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
                                >
                                    Book Now
                                </button>

                                <button
                                    onClick={() =>
                                        navigate("/chat")
                                    }
                                    className="w-full mt-3 border py-3 rounded-lg"
                                >
                                    Chat
                                </button>

                                <button
                                    className="w-full mt-3 border py-3 rounded-lg"
                                >
                                    Call
                                </button>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                                <h3 className="font-bold text-red-600">
                                    Emergency Service
                                </h3>

                                <p className="mt-2 text-slate-600">
                                    Available 24/7 for urgent
                                    repairs.
                                </p>

                                <button
                                    onClick={() =>
                                        navigate(
                                            "/booking/emergency"
                                        )
                                    }
                                    className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg"
                                >
                                    Emergency Booking
                                </button>
                            </div>

                        </div>
                    </div>
                </section>
            </div>

            <Footer />
        </>
    );
};


export default TechnicianProfile;