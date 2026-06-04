import PhoneCard from "./PhoneCard";

const PhoneSelector = ({
    phones,
    selectedPhone,
    setSelectedPhone,
    onAdd,
}) => {
    return (
        <div>
            <div className="flex justify-between mb-3">
                <h3 className="font-semibold">
                    Contact Number
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
                {phones.map((phone) => (
                    <PhoneCard
                        key={phone.id}
                        phone={phone}
                        selected={
                            selectedPhone ===
                            phone.id
                        }
                        onSelect={
                            setSelectedPhone
                        }
                    />
                ))}
            </div>
        </div>
    );
};

export default PhoneSelector;