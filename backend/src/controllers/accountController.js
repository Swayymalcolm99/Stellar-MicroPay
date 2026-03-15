/**
 * src/controllers/accountController.js
 * Handles account-related requests.
 */

"use strict";

const stellarService = require("../services/stellarService");

/**
 * GET /api/accounts/:publicKey
 */
async function getAccount(req, res, next) {
  try {
    const { publicKey } = req.params;
    const account = await stellarService.getAccount(publicKey);
    res.json({ success: true, data: account });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/accounts/:publicKey/balance
 */
async function getBalance(req, res, next) {
  try {
    const { publicKey } = req.params;
    const balance = await stellarService.getXLMBalance(publicKey);
    res.json({ success: true, data: { publicKey, xlm: balance } });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/accounts/resolve/:username
 *
 * PLACEHOLDER — Username → wallet address resolution.
 * This will be implemented in v1.2 (see ROADMAP.md).
 *
 * Future implementation ideas:
 *   - Store username→publicKey mapping in a database
 *   - Integrate with Stellar's Federation protocol
 *   - Support ENS-style resolution
 */
async function resolveUsername(req, res) {
  const { username } = req.params;
  // TODO: implement username resolution (ROADMAP v1.2)
  res.status(501).json({
    success: false,
    error: "Username resolution is not yet implemented.",
    docs: "See ROADMAP.md for v1.2 — Username Payments",
    username,
  });
}

module.exports = { getAccount, getBalance, resolveUsername };
