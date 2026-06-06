import { useEffect, useState } from "react";


const AddressSelector = ({
    addresses = [],
    selectedAddress,
    setSelectedAddress,
    onAddAddress,
}) => {
    const [currentLocation,
        setCurrentLocation] = useState(null);

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCurrentLocation({
                    id: "current_location",

                    label:
                        "📍 Current Location",

                    latitude:
                        position.coords.latitude,

                    longitude:
                        position.coords.longitude,
                });

                if (!selectedAddress) {
                    setSelectedAddress(
                        "current_location"
                    );
                }
            },
            (error) => {
                console.error(error);
            }
        );
    };

    useEffect(() => {
        getCurrentLocation();
    }, []);

    const allAddresses = currentLocation
        ? [
              currentLocation,
              ...addresses,
          ]
        : addresses;

    const selectedAddressData =
        allAddresses.find(
            (address) =>
                address.id ===
                selectedAddress
        );

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <label className="font-medium">
                    Service Address
                </label>

                <button
                    type="button"
                    onClick={onAddAddress}
                    className="text-blue-600 hover:text-blue-700"
                >
                    + Add New Address
                </button>
            </div>

            <select
                value={selectedAddress}
                onChange={(e) =>
                    setSelectedAddress(
                        e.target.value
                    )
                }
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-3"
            >
                {allAddresses.map(
                    (address) => (
                        <option
                            key={
                                address.id
                            }
                            value={
                                address.id
                            }
                        >
                            {
                                address.label
                            }
                        </option>
                    )
                )}
            </select>

            {selectedAddressData && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
                    {selectedAddressData.id ===
                    "current_location" ? (
                        <>
                            Latitude:{" "}
                            {
                                selectedAddressData.latitude
                            }
                            <br />
                            Longitude:{" "}
                            {
                                selectedAddressData.longitude
                            }
                        </>
                    ) : (
                        selectedAddressData.full_address
                    )}
                </div>
            )}
        </div>
    );
};

export default AddressSelector;