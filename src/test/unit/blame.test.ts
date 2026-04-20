/*
 * MIT License
 *
 * Copyright (c) 2026 Rich Markdown Diff Authors
 */

import * as assert from "assert";
import { BlameInfo } from "../../gitBlameResolver";

describe("Git Blame Data Structure", () => {
    it("should be JSON-serializable (plain object, not Map)", () => {
        const info: BlameInfo = {
            lines: {
                "1": {
                    hash: "abc1234",
                    author: "Author Name",
                    authorTime: 1234567890,
                    summary: "Commit message"
                }
            }
        };

        const json = JSON.stringify(info);
        const parsed = JSON.parse(json);

        assert.strictEqual(parsed.lines["1"].hash, "abc1234");
        assert.strictEqual(typeof parsed.lines, "object");
        assert.strictEqual(Array.isArray(parsed.lines), false);
        
        // Ensure it's not a Map that became {}
        assert.ok(Object.keys(parsed.lines).length > 0, "Lines should not be empty after serialization");
    });
});
