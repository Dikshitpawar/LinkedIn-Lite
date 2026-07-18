const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth.middleware");
const { connectionController } = require("../controllers/index");
const validate = require("../middlewares/validateRequest");
const { connectionSchema } = require("../validation");

router.get(
  "/send/:id",
  auth,
  validate(connectionSchema.idSchema),
  connectionController.sendRequest,
);
router.get(
  "/accept/:id",
  auth,
  validate(connectionSchema.idSchema),
  connectionController.acceptRequest,
);
router.get(
  "/reject/:id",
  auth,
  validate(connectionSchema.idSchema),
  connectionController.rejectRequest,
);
router.get(
  "/remove/:id",
  auth,
  validate(connectionSchema.idSchema),
  connectionController.removeConnection,
);
router.get(
  "/",
  auth,
  validate(connectionSchema.getConnectionsSchema),
  connectionController.getConnections,
);
router.get(
  "/suggestions",
  auth,
  validate(connectionSchema.getSuggestionsSchema),
  connectionController.getSuggestions,
);

module.exports = router;
