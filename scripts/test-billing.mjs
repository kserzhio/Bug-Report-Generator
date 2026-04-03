import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";

const servicePath = path.resolve("src/domain/services/stripe-billing-service.ts");
const source = fs.readFileSync(servicePath, "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  },
  fileName: servicePath
}).outputText;

const sandboxModule = { exports: {} };
const requireForVm = createRequire(import.meta.url);
const sandbox = {
  module: sandboxModule,
  exports: sandboxModule.exports,
  require: requireForVm,
  process,
  console
};

vm.runInNewContext(transpiled, sandbox, { filename: servicePath });

const {
  mapStripeStatus,
  mapPlanFromPriceId,
  extractWorkspaceContextFromMetadata
} = sandboxModule.exports;

assert.equal(mapStripeStatus("trialing"), "TRIALING");
assert.equal(mapStripeStatus("past_due"), "PAST_DUE");
assert.equal(mapStripeStatus("unpaid"), "PAST_DUE");
assert.equal(mapStripeStatus("incomplete"), "PAST_DUE");
assert.equal(mapStripeStatus("incomplete_expired"), "PAST_DUE");
assert.equal(mapStripeStatus("canceled"), "CANCELED");
assert.equal(mapStripeStatus("active"), "ACTIVE");

assert.equal(mapPlanFromPriceId("price_pro_123", "price_pro_123"), "PRO");
assert.equal(mapPlanFromPriceId("price_other", "price_pro_123"), "FREE");
assert.equal(mapPlanFromPriceId(null, "price_pro_123"), "FREE");
assert.equal(mapPlanFromPriceId("price_pro_123", null), "FREE");

const validContext = extractWorkspaceContextFromMetadata({
  userId: "user_1",
  workspaceId: "ws_1"
});
assert.equal(validContext?.userId, "user_1");
assert.equal(validContext?.workspaceId, "ws_1");
assert.equal(extractWorkspaceContextFromMetadata(undefined), null);
assert.equal(extractWorkspaceContextFromMetadata(null), null);
assert.equal(extractWorkspaceContextFromMetadata({ userId: "user_1" }), null);
assert.equal(extractWorkspaceContextFromMetadata({ workspaceId: "ws_1" }), null);
assert.equal(extractWorkspaceContextFromMetadata({ userId: " ", workspaceId: "ws_1" }), null);

console.log("Billing webhook mapping checks passed.");
