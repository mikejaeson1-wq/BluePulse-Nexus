import assert from "node:assert/strict";
import test from "node:test";

import {
    createContactRateLimiter
} from "../src/contact/contactRateLimiter.js";

test(
    "Kontakt-Rate-Limit erlaubt Anfragen bis zum Grenzwert",
    () => {
        let currentTime = 1000;

        const limiter =
            createContactRateLimiter({
                maximumRequests: 2,
                windowMilliseconds: 10000,
                now: () => currentTime
            });

        const first =
            limiter.consume(
                "client-a"
            );

        const second =
            limiter.consume(
                "client-a"
            );

        const third =
            limiter.consume(
                "client-a"
            );

        assert.equal(
            first.allowed,
            true
        );

        assert.equal(
            first.remaining,
            1
        );

        assert.equal(
            second.allowed,
            true
        );

        assert.equal(
            second.remaining,
            0
        );

        assert.equal(
            third.allowed,
            false
        );

        assert.equal(
            third.remaining,
            0
        );
    }
);

test(
    "Kontakt-Rate-Limit beginnt nach Ablauf des Zeitfensters neu",
    () => {
        let currentTime = 1000;

        const limiter =
            createContactRateLimiter({
                maximumRequests: 1,
                windowMilliseconds: 5000,
                now: () => currentTime
            });

        assert.equal(
            limiter.consume(
                "client-a"
            ).allowed,
            true
        );

        assert.equal(
            limiter.consume(
                "client-a"
            ).allowed,
            false
        );

        currentTime = 7000;

        const nextWindow =
            limiter.consume(
                "client-a"
            );

        assert.equal(
            nextWindow.allowed,
            true
        );

        assert.equal(
            nextWindow.remaining,
            0
        );
    }
);
