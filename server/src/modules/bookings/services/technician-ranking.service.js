const rankTechnicians = (
    profiles
) => {

    const rankedProfiles = profiles.map(
        profile => {

            const distanceMeters =
                profile.distance_meters;

            /**
             * Exponential distance decay
             *
             * 0m  -> 1.0
             * 1km -> 0.71
             * 3km -> 0.36
             * 5km -> 0.18
             */

            const proximityScore =
                Math.exp(
                    -distanceMeters / 3000
                );

            const rankingScore =
                Number(
                    profile.ranking_score || 0
                );

            /**
             * Small randomness
             * for rotation
             */

            const randomBoost =
                Math.random() * 0.03;

            const finalScore =
                (rankingScore * 0.7) +
                (proximityScore * 0.27) +
                randomBoost;

            return {
                ...profile,

                distance_km: Number(
                    (
                        distanceMeters / 1000
                    ).toFixed(2)
                ),

                proximity_score: Number(
                    proximityScore.toFixed(4)
                ),

                final_score: Number(
                    finalScore.toFixed(4)
                )
            };
        }
    );

    rankedProfiles.sort(
        (a, b) =>
            b.final_score - a.final_score
    );

    return rankedProfiles;
};


export default rankTechnicians;