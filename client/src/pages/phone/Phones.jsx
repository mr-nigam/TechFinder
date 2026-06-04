import { useNavigate } from "react-router-dom";

const Phones = () => {
    const navigate = useNavigate();

    const phones = [
        {
            id: 1,
            phone: "+919876543210",
            phone_type: "whatsapp",
        },
        {
            id: 2,
            phone: "+918888888888",
            phone_type: "emergency",
        },
    ];

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Delete this phone number?"
        );

        if (!confirmed) return;

        try {
            // await api.delete(`/phones/${id}`);

            console.log("deleted", id);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6">

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">
                    Phone Numbers
                </h1>

                <button
                    onClick={() =>
                        navigate(
                            "/profile/phones/add"
                        )
                    }
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                    Add Phone
                </button>
            </div>

            <div className="space-y-4">
                {phones.map((phone) => (
                    <div
                        key={phone.id}
                        className="bg-white border rounded-xl p-4 flex justify-between items-center"
                    >
                        <div>
                            <div className="font-semibold">
                                {phone.phone}
                            </div>

                            <div className="text-slate-500 capitalize">
                                {phone.phone_type}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() =>
                                    navigate(
                                        `/profile/phones/${phone.id}/edit`
                                    )
                                }
                                className="px-4 py-2 border rounded-lg"
                            >
                                Edit
                            </button>

                            <button
                                onClick={() =>
                                    handleDelete(
                                        phone.id
                                    )
                                }
                                className="px-4 py-2 bg-red-600 text-white rounded-lg"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default Phones;