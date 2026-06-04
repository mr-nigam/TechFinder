import AddressCard from "./AddressCard";

const AddressSelector = ({
    addresses,
    selectedAddress,
    setSelectedAddress,
    onAdd,
}) => {
    return (
        <div>
            <div className="flex justify-between mb-3">
                <h3 className="font-semibold">
                    Service Address
                </h3>

                <button
                    type="button"
                    onClick={onAdd}
                    className="text-blue-600"
                >
                    + Add New
                </button>
            </div>

            <div className="space-y-3">
                {addresses.map((address) => (
                    <AddressCard
                        key={address.id}
                        address={address}
                        selected={
                            selectedAddress ===
                            address.id
                        }
                        onSelect={
                            setSelectedAddress
                        }
                    />
                ))}
            </div>
        </div>
    );
};

export default AddressSelector;