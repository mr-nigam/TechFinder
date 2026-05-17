/**
    Exponential distance decay
    0m  -> 1.0
    1km -> 0.71
    3km -> 0.36
    5km -> 0.18
**/

const rankTechnicians = (
    nearbyTechs
) => {

    const rankednearbyTechnicians = nearbyTechs.map(
        tech => {

            const [
                technicianId,
                rankingScore
            ] =
            tech.id.split("|");

            const distanceMeters =
                Number(tech.distance);;

            const proximity =
                Math.exp(
                    -distanceMeters / 3000
                );

            const randomBoost =
                Math.random() * 0.05;

            const finalScore =
                (rankingScore * 0.66) +
                (proximityScore * 0.29) +
                randomBoost;

            return {
                technicianId: Number(
                    technicianId
                ),

                final_score: Number(
                    finalScore.toFixed(5)
                ),

                distance_km:
                    Number(
                        (
                            distanceMeters / 1000
                        ).toFixed(2)
                    ),
            };
        }
    );

    rankednearbyTechnicians.sort(
        (a, b) =>
            b.final_score - a.final_score
    );

    return rankednearbyTechnicians;
};


export default rankTechnicians;