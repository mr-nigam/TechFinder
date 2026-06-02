import { 
    useNavigate 
} from 'react-router-dom';

import {
    EmergencyBooking
} from '#pages';

import {
    Navbar,
    Footer
} from '#components';


const Home = () => {
    const navigate = useNavigate();

    const bookingTypes = [
        {
            title: "Emergency Booking",
            description:
                "Immediate assistance for urgent issues. Get connected to the nearest available technician within minutes.",
            icon: "🚨",
            route: "/booking/emergency",
            color: "red",
        },
        {
            title: "Instant Booking",
            description:
                "Need help today? Book a technician instantly and choose from available professionals near your location.",
            icon: "⚡",
            route: "/booking/instant",
            color: "blue",
        },
        {
            title: "Schedule For Later",
            description:
                "Plan ahead and schedule a technician for a specific date and time that works best for you.",
            icon: "📅",
            route: "/booking/schedule",
            color: "green",
        },
    ];

    const features = [
        {
            title: "Verified Technicians",
            description:
                "All technicians are background-checked and certified",
            icon: "🛡️",
        },
        {
            title: "Real-time Tracking",
            description:
                "Track your technician's location and estimated arrival time",
            icon: "📍",
        },
        {
            title: "Ratings & Reviews",
            description:
                "Read reviews from other customers and rate services",
            icon: "⭐",
        },
        {
            title: "24/7 Support",
            description:
                "Chat or call support available around the clock",
            icon: "💬",
        },
    ];

    return (
        <>
            <Navbar />

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <div className="max-w-7xl mx-auto px-4 py-24 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        Find Trusted Local Technicians
                    </h1>

                    <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto mb-10">
                        Quick, reliable repair services for your home,
                        computer, and vehicle needs.
                    </p>
                </div>
            </section>

            {/* Booking Types */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12 text-slate-800">
                        Choose Your Booking Type
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {bookingTypes.map((booking) => (
                            <div
                                key={booking.title}
                                onClick={() =>
                                    navigate(booking.route)
                                }
                                className={`cursor-pointer rounded-2xl bg-white p-8 shadow-md hover:shadow-xl hover:-translate-y-2 transition duration-300 border ${
                                    booking.color === "red"
                                        ? "border-red-200"
                                        : booking.color === "blue"
                                        ? "border-blue-200"
                                        : "border-green-200"
                                }`}
                            >
                                <div className="text-6xl mb-5">
                                    {booking.icon}
                                </div>

                                <h3
                                    className={`text-2xl font-semibold mb-4 ${
                                        booking.color === "red"
                                            ? "text-red-600"
                                            : booking.color === "blue"
                                            ? "text-blue-600"
                                            : "text-green-600"
                                    }`}
                                >
                                    {booking.title}
                                </h3>

                                <p className="text-slate-600 leading-relaxed">
                                    {booking.description}
                                </p>

                                <div
                                    className={`mt-6 font-semibold ${
                                        booking.color === "red"
                                            ? "text-red-600"
                                            : booking.color === "blue"
                                            ? "text-blue-600"
                                            : "text-green-600"
                                    }`}
                                >
                                    Continue →
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12 text-slate-800">
                        Why Choose TechFinder?
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="text-center p-6"
                            >
                                <div className="text-5xl mb-4">
                                    {feature.icon}
                                </div>

                                <h3 className="text-xl font-semibold text-slate-800 mb-3">
                                    {feature.title}
                                </h3>

                                <p className="text-slate-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
};


export default Home;