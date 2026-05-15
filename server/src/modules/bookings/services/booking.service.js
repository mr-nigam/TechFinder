import pool from '#config/database/postgres.js';

import infraRedis from '#config/redis/infra.redis.js';

import {
    ApiError
} from '#shared';

import {
    geoSearch
} from '#infra';


const MAX_DISTANCE_METERS = 10000; // 10km

const searchNearbyTechnicians = async (
    userId,
    bookingData
) => {

    const addressQuery = `
        SELECT
            ST_X(location::geometry) AS longitude,
            ST_Y(location::geometry) AS latitude
        FROM addresses
        WHERE id = $1
            AND user_id = $2
            AND deleted_at IS NULL
    `;

    const result = await pool.query(
        addressQuery,
        [
            bookingData.addressId,
            userId
        ]
    );

    if (result.rowCount === 0) {
        throw new ApiError(
            400,
            'Address not found'
        );
    }

    const lng = Number(result.rows[0].longitude);
    const lat = Number(result.rows[0].latitude);

    /**
     * Expected format from geoSearch:
     * [
     *   id: 'tech-id',
     *   distance: '2450.32' // meters
     * ]
     */

    const nearbyTechs = await geoSearch(
        bookingData.serviceCategoryId,
        lng,
        lat
    );

    if(!nearbyTechs.length) return [];

    const pipeline = infraRedis.pipeline();

    nearbyTechs.forEach(({ id }) => {
        pipeline.get(`tech:card:${id}`);
    });

    const redisResults = await pipeline.exec();

    const profiles = redisResults
        .map((result, index) => {

            if(!Array.isArray(result)){
                return null;
            }

            const [err, data] = result;
            
            if(err || !data) return null;

            try{
                const parsed = JSON.parse(data);

                return {
                    ...parsed,
                    distance_meters:
                        Number(
                            nearbyTechs[index]
                                .distance
                        )
                };

            } catch {
                return null;
            }

        })
        .filter(Boolean);

    const rankedProfiles = 
        profiles.map(profile => {

            const distanceMeters  =
                profile.distance_meters;

            /**
             * Exponential distance decay
             *
             * 0m    -> 1.0
             * 1km   -> 0.71
             * 3km   -> 0.36
             * 5km   -> 0.18
             */

            // Closer technician => higher score
            const proximityScore = Math.exp(
                    -distanceMeters / 3000
                );
                
            /**
                Expected normalized
                score between 0-1
            */
            
            const rankingScore =
                Number(
                    profile.ranking_score || 0
                );

            // Small randomness for rotation

            const randomBoost =
                Math.random() * 0.03;

            const finalScore =
                (rankingScore * 0.7) +
                (proximityScore * 0.27) +
                randomBoost;

            return {
                ...profile,
                distance_km:
                    Number(
                        (
                            distanceMeters / 1000
                        ).toFixed(2)
                    ),
                proximity_score:
                    Number(
                        proximityScore
                            .toFixed(4)
                    ),

                final_score:
                    Number(
                        finalScore
                            .toFixed(4)
                    )
            };

    });

    rankedProfiles.sort(
        (a, b) =>
            b.final_score - a.final_score
    );

    return rankedProfiles;
};


export default searchNearbyTechnicians;