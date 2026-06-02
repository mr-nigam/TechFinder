import {
    ApiError
} from "#shared";

import {
    verifyUserPassword
} from './index.js';


const processAccountStatusChange = async ({
    user,
    technician,
    password,
    client,

    statusField,
    actionName,
    
    cleanupQueue,
    cleanupJobName,
    cleanupDelay,
    
    emailQueue,
    emailJobName,
    emailQueueJobId,
    
    invalidateCaches,

    successMessage
}) => {

    await verifyUserPassword(
        user.id,
        password
    );

    try{
        await client.query("BEGIN");

        const query = `
            UPDATE users
            SET ${statusField} = NOW(),
                refresh_token = NULL
            WHERE id = $1;
        `;

        const result = await client.query(
            query,
            [user.id]
        );

        if (result.rowCount === 0) {
            throw new ApiError(
                400,
                `Failed to ${actionName} user account`
            );
        }

        if (technician.id) {

            const query = `
                UPDATE technicians
                SET ${statusField} = NOW()
                WHERE id = $1;
            `;

            const result =
                await client.query(
                    query,
                    [technician.id]
                );

            if (result.rowCount === 0) {
                throw new ApiError(
                    400,
                    `Failed to ${actionName} technician account`
                );
            }
        }

        await client.query("COMMIT");

    }catch(err){

        try{
            await client.query("ROLLBACK");
        }catch (_) {}

        throw new ApiError(
            err.statusCode || 500,
            err.message ||
            `Failed to ${actionName} account`
        );

    }finally{
        client.release();
    }

    try{
        await cleanupQueue.add(
            cleanupJobName,
            {
                userId: user.id
            },
            {
                jobId: `${cleanupJobName}:${user.id}`,
                delay: cleanupDelay
            }
        );

        console.log( `${actionName} email queued`);

    }catch(err){
        console.error(
            "Cleanup queue error:",
            err.message
        );
    }

    try{
        await emailQueue.add(
            emailJobName,
            {
                userId: user.id
            },
            {
                jobId: `${emailQueueJobId}:${user.id}`
            }
        );

        console.log( `${actionName} email queued`);

    }catch(err){
        console.error(
            "Email queue error:",
            err.message
        );
    }

    await invalidateCaches(
        user.id,
        technician?.id || null
    );

    return successMessage;
};


export default processAccountStatusChange;