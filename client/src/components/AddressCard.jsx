const AddressCard = ({
    address,
    selected,
    onSelect,
}) => {
    return (
        <label className="flex items-start gap-3 border rounded-lg p-4 cursor-pointer hover:border-blue-500">
            <input
                type="radio"
                checked={selected}
                onChange={() =>
                    onSelect(address.id)
                }
            />

            <div>
                <h4 className="font-semibold">
                    {address.label}
                </h4>

                <p className="text-sm text-slate-500">
                    {address.full_address}
                </p>
            </div>
        </label>
    );
};

export default AddressCard;