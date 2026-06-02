import { Link } from "react-router-dom";


const Footer = () => {
    return (
        <footer className="bg-slate-800 text-slate-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-12">

                <div className="grid md:grid-cols-3 gap-8">

                    <div>
                        <h4 className="text-white text-xl font-bold mb-4">
                            TechFinder
                        </h4>

                        <p className="text-slate-400">
                            Connecting you with trusted local
                            technicians for all your repair needs.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white text-xl font-bold mb-4">
                            Quick Links
                        </h4>

                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/services"
                                    className="hover:text-blue-400"
                                >
                                    Services
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/emergency"
                                    className="hover:text-blue-400"
                                >
                                    Emergency
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/support"
                                    className="hover:text-blue-400"
                                >
                                    Support
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white text-xl font-bold mb-4">
                            Contact
                        </h4>

                        <div className="space-y-2 text-slate-400">
                            <p>📞 1-800-TECH-FIND</p>
                            <p>✉️ support@techfinder.com</p>
                        </div>
                    </div>

                </div>

                <div className="border-t border-slate-700 mt-8 pt-6 text-center text-slate-500">
                    © 2026 TechFinder. All rights reserved.
                </div>
            </div>
        </footer>
    );
};


export default Footer;