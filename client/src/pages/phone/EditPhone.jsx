import { useState } from "react";
// import { useParams } from "react-router-dom";

const EditPhone = () => {
    // const { id } = useParams();

    const [formData, setFormData] =
        useState({
            phone: "+919876543210",
            phoneType: "whatsapp",
        });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                phone: formData.phone,
                phone_type:
                    formData.phoneType,
            };

            // await api.patch(
            //     `/phones/${id}`,
            //     payload
            // );

            console.log(payload);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6">
            <div className="bg-white rounded-xl shadow p-6">

                <h1 className="text-2xl font-bold mb-6">
                    Edit Phone
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                phone:
                                    e.target.value,
                            })
                        }
                        className="w-full border rounded-lg p-3"
                    />

                    <select
                        value={
                            formData.phoneType
                        }
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                phoneType:
                                    e.target.value,
                            })
                        }
                        className="w-full border rounded-lg p-3"
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

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-lg"
                    >
                        Save Changes
                    </button>
                </form>

            </div>
        </div>
    );
};

export default EditPhone;