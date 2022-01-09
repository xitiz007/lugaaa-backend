const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

router.get("/", isAuthenticated, isAdmin, userController.getUsers);
router.get("/orderCount", isAuthenticated, userController.getUserOrderCount);
router.get("/:id", isAuthenticated, isAdmin, userController.getUser);
router.delete("/:id", isAuthenticated, isAdmin, userController.deleteUser);
router.put(
  "/updateRole/:id",
  isAuthenticated,
  isAdmin,
  userController.updateRole
);
router.put('/updateProfile', isAuthenticated, userController.updateProfile);

module.exports = router;
