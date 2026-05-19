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

                finalScore: Number(
                    finalScore.toFixed(5)
                ),

                distanceKM:
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
            b.finalScore - a.finalScore
    );

    return rankednearbyTechnicians;
};


export default rankTechnicians;