function normalizePositiveInteger(
    value,
    fallback
) {
    const numericValue =
        Number.parseInt(
            String(
                value ?? ""
            ),
            10
        );

    return Number.isInteger(
        numericValue
    ) &&
        numericValue > 0
        ? numericValue
        : fallback;
}

function normalizeKey(
    value
) {
    return String(
        value ??
        "unknown"
    )
        .trim()
        .slice(
            0,
            200
        ) ||
        "unknown";
}

export function createContactRateLimiter({
    maximumRequests = 5,
    windowMilliseconds =
        15 * 60 * 1000,
    now = () => Date.now()
} = {}) {
    const normalizedMaximumRequests =
        normalizePositiveInteger(
            maximumRequests,
            5
        );

    const normalizedWindowMilliseconds =
        normalizePositiveInteger(
            windowMilliseconds,
            15 * 60 * 1000
        );

    const buckets =
        new Map();

    let consumeCount = 0;

    function cleanup(
        currentTime
    ) {
        for (
            const [
                key,
                bucket
            ]
            of buckets
        ) {
            if (
                bucket.resetAt <=
                currentTime
            ) {
                buckets.delete(
                    key
                );
            }
        }
    }

    function consume(
        keyValue
    ) {
        const key =
            normalizeKey(
                keyValue
            );

        const currentTime =
            Number(
                now()
            );

        consumeCount += 1;

        if (
            consumeCount % 100 ===
                0 ||
            buckets.size >
                2000
        ) {
            cleanup(
                currentTime
            );
        }

        const existingBucket =
            buckets.get(
                key
            );

        const bucket =
            !existingBucket ||
            existingBucket.resetAt <=
                currentTime
                ? {
                    count: 0,
                    resetAt:
                        currentTime +
                        normalizedWindowMilliseconds
                }
                : existingBucket;

        bucket.count += 1;

        buckets.set(
            key,
            bucket
        );

        const allowed =
            bucket.count <=
            normalizedMaximumRequests;

        const remaining =
            Math.max(
                normalizedMaximumRequests -
                    bucket.count,
                0
            );

        const retryAfterSeconds =
            Math.max(
                Math.ceil(
                    (
                        bucket.resetAt -
                        currentTime
                    ) /
                    1000
                ),
                1
            );

        return {
            allowed,
            limit:
                normalizedMaximumRequests,
            remaining,
            resetAt:
                bucket.resetAt,
            retryAfterSeconds
        };
    }

    function clear() {
        buckets.clear();
    }

    return {
        consume,
        clear
    };
}

export default createContactRateLimiter;
