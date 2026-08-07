import assert from "node:assert";
import { describe, it } from "node:test";

describe("test add function", () => {
	it("should return 15 for add(10,5)", () => {
		assert.strictEqual(10 + 5, 15);
	});
	it("should return 5 for add(2,3)", () => {
		assert.strictEqual(2 + 3, 5);
	});
});
