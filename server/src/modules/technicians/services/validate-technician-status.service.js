import { 
    ApiError 
} from '#shared';


const validateTechnicianStatus = (technician) => {

    if(
        technician.verification_status !==
        "approved"
    ){
        throw new ApiError(
            403,
            "Technician account is not verified"
        );
    }

    if(technician.status !== "online"){
        throw new ApiError(
            403,
            "Technician is offline"
        );
    }

    if(
        technician.availability_status !==
        "available"
    ){
        throw new ApiError(
            403,
            "Technician is unavailable"
        );
    }

    if(
        technician.account_status !==
        "active"
    ){
        throw new ApiError(
            403,
            "Technician account is suspended"
        );
    }

    if(!technician.current_location) {
        throw new ApiError(
            400,
            "Current location not found"
        );
    }

    return true;
};


export default validateTechnicianStatus;