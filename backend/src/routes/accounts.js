/**
 * src/routes/accounts.js
 * Account lookup and balance endpoints.
 */

"use strict";

const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");

/**
 * GET /api/accounts/:publicKey
 * Fetch account info and balances from Horizon.
 */
router.get("/:publicKey", accountController.getAccount);

/**
 * GET /api/accounts/:publicKey/balance
 * Fetch just the XLM balance for an account.
 */
router.get("/:publicKey/balance", accountController.getBalance);

/**
 * GET /api/accounts/resolve/:username
 * [PLACEHOLDER] Resolve a username to a Stellar public key.
 * See ROADMAP.md v1.2 — Username Payments.
 */
router.get("/resolve/:username", accountController.resolveUsername);

module.exports = router;
