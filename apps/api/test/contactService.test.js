import assert from "node:assert/strict";
import test from "node:test";

import {
    hashContactIp,
    normalizeContactSubmission
} from "../src/services/contactService.js";

test(
    "Kontaktanfrage wird normalisiert",
    () => {
        const result =
            normalizeContactSubmission({
                name:
                    "  Mike   Beispiel  ",
                email:
                    " MIKE@EXAMPLE.DE ",
                subject:
                    "  Anfrage zur Mitgliedschaft  ",
                message:
                    "  Hallo BluePulse,\r\nich interessiere mich für eure Arbeit.  ",
                privacyAccepted:
                    true,
                sourcePath:
                    " /kontakt "
            });

        assert.equal(
            result.name,
            "Mike Beispiel"
        );

        assert.equal(
            result.email,
            "mike@example.de"
        );

        assert.equal(
            result.subject,
            "Anfrage zur Mitgliedschaft"
        );

        assert.equal(
            result.message,
            "Hallo BluePulse,\nich interessiere mich für eure Arbeit."
        );

        assert.equal(
            result.sourcePath,
            "/kontakt"
        );
    }
);

test(
    "Kontaktanfrage lehnt ungültige E-Mail-Adressen ab",
    () => {
        assert.throws(
            () =>
                normalizeContactSubmission({
                    name: "Mike",
                    email: "ungueltig",
                    subject: "Testanfrage",
                    message:
                        "Diese Testnachricht ist lang genug.",
                    privacyAccepted: true
                }),
            /gültige E-Mail-Adresse/
        );
    }
);

test(
    "Kontaktanfrage benötigt eine Datenschutzbestätigung",
    () => {
        assert.throws(
            () =>
                normalizeContactSubmission({
                    name: "Mike",
                    email: "mike@example.de",
                    subject: "Testanfrage",
                    message:
                        "Diese Testnachricht ist lang genug.",
                    privacyAccepted: false
                }),
            /Datenschutzhinweise/
        );
    }
);

test(
    "IP-Adressen werden ausschließlich als deterministischer HMAC gespeichert",
    () => {
        const first =
            hashContactIp(
                "127.0.0.1",
                "secret-a"
            );

        const second =
            hashContactIp(
                "127.0.0.1",
                "secret-a"
            );

        const differentSecret =
            hashContactIp(
                "127.0.0.1",
                "secret-b"
            );

        assert.match(
            first,
            /^[0-9a-f]{64}$/
        );

        assert.equal(
            first,
            second
        );

        assert.notEqual(
            first,
            differentSecret
        );

        assert.notEqual(
            first,
            "127.0.0.1"
        );
    }
);
