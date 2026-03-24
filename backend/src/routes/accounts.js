/**
 * src/routes/accounts.js
 * Account lookup and balance endpoints.
 */

"use strict";

const express = require("express");
const router = express.Router();
const { strictLimiter } = require("../middleware/rateLimit");
const { sanitizePublicKey, sanitizeUsername } = require("../middleware/sanitization");
const accountController = require("../controllers/accountController");

/**
 * GET /api/accounts/:publicKey
 * Fetch account info and balances from Horizon.
 */
router.get("/:publicKey", strictLimiter, sanitizePublicKey, accountController.getAccount);

/**
 * GET /api/accounts/:publicKey/balance
 * Fetch just the XLM balance for an account.
 */
router.get("/:publicKey/balance", strictLimiter, sanitizePublicKey, accountController.getBalance);

/**
 * POST /api/accounts/register
 * Register a new username with a public key.
 */
router.post("/register", strictLimiter, accountController.registerUsername);

/**
 * GET /api/accounts/resolve/:username
 * Resolve a username to a Stellar public key.
 */
router.get("/resolve/:username", strictLimiter, sanitizeUsername, accountController.resolveUsername);

module.exports = router;
