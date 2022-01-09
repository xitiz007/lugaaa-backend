const express = require('express');
const orderController = require("../controller/orderController");
const {isAuthenticated, isAdmin} = require('../middleware/auth');
const router = express.Router();

router.get('/', isAuthenticated, orderController.getOrders);
router.post('/create', isAuthenticated, orderController.createOrder);
router.put('/:id/delivered', isAuthenticated, isAdmin, orderController.setOrderDelivered);
router.get('/payments', isAuthenticated, isAdmin, orderController.getPayments);
router.post('/verifyRequest', isAuthenticated, orderController.verifyRequest);
router.delete('/:id/paymentRequest', isAuthenticated, isAdmin, orderController.deletePaymentRequest);
router.put(
  "/:id/orderPaid",
  isAuthenticated,
  isAdmin,
  orderController.setOrderPaid
);
router.put(
  "/:id/orderReceived",
  isAuthenticated,
  orderController.setOrderReceived
);
router.get("/:id", isAuthenticated, orderController.getOrder);
router.delete("/:id", isAuthenticated, orderController.deleteOrder);

module.exports = router;