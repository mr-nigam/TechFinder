import { useState } from "react";

const AddAddressModal = ({
    open,
    onClose,
    onSave,
}) => {
    const [formData, setFormData] =
        useState({
            label: "",
            full_address: "",
        });

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        onSave({
            id: crypto.randomUUID(),
            ...formData,
        });

        setFormData({
            label: "",
            full_address: "",
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                    Add Address
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <input
                        placeholder="Home, Office..."
                        className="w-full border p-3 rounded-lg"
                        value={formData.label}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                label:
                                    e.target.value,
                            })
                        }
                    />

                    <textarea
                        placeholder="Full Address"
                        rows="4"
                        className="w-full border p-3 rounded-lg"
                        value={
                            formData.full_address
                        }
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                full_address:
                                    e.target.value,
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

export default AddAddressModal;