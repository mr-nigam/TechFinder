const PhoneCard = ({
    phone,
    selected,
    onSelect,
}) => {
    return (
        <label className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer hover:border-blue-500">
            <input
                type="radio"
                checked={selected}
                onChange={() =>
                    onSelect(phone.id)
                }
            />

            <div>
                <h4 className="font-semibold capitalize">
                    {phone.phone_type}
                </h4>

                <p className="text-sm text-slate-500">
                    {phone.phone}
                </p>
            </div>
        </label>
    );
};

export default PhoneCard;