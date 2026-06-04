import { useState } from "react";

const AddPhoneModal = ({
    open,
    onClose,
    onSave,
}) => {
    const [formData, setFormData] =
        useState({
            phone: "",
            phone_type: "alternate",
        });

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        onSave({
            id: crypto.randomUUID(),
            ...formData,
        });

        setFormData({
            phone: "",
            phone_type: "alternate",
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                    Add Phone Number
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <input
                        type="tel"
                        placeholder="+919876543210"
                        className="w-full border p-3 rounded-lg"
                        value={formData.phone}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                phone:
                                    e.target.value,
                            })
                        }
                    />

                    <select
                        className="w-full border p-3 rounded-lg"
                        value={
                            formData.phone_type
                        }
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                phone_type:
                                    e.target.value,
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
                            onClick={onClose}
                            className="flex-1 border py-2 rounded-lg"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPhoneModal;