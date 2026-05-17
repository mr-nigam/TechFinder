const profileCard = (profile)=>{
    return {
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        specialization: profile.specialization,
        experience_years: profile.experience_years,
        hourly_rate: profile.hourly_rate,
        profile_picture_url: profile.profile_picture_url,
        service_category_id: profile.service_category_id,
        average_rating: profile.average_rating,
        ranking_score: profile.ranking_score,
        total_reviews:  profile.total_reviews,
        distance_meters: profile.distance_meters,
    };
}


export default profileCard;