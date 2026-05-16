const mapTechnicianProfiles = (
    redisResults,
    nearbyTechs
) => {
    return redisResults
        .map((result, index) => {

            if (!Array.isArray(result)) {
                return null;
            }

            const [err, data] = result;

            if (err || !data) {
                return null;
            }

            try {
                const profile = JSON.parse(data);

                return {
                    id: profile.id,
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    specialization: profile.specialization,
                    experience_years:
                        profile.experience_years,
                    average_rating:
                        profile.average_rating,
                    ranking_score:
                        profile.ranking_score,
                    hourly_rate:
                        profile.hourly_rate,
                    profile_picture_url:
                        profile.profile_picture_url,
                    service_category_id:
                        profile.service_category_id,
                    distance_meters: Number(
                        nearbyTechs[index].distance
                    )
                };

            } catch {
                return null;
            }
        })
        .filter(Boolean);
};


export default mapTechnicianProfiles;