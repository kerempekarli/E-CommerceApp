const express = require("express");
const {
  getAllProducts,
  addProduct,
  updateProduct,
  commentToProduct,
  getProduct,
  removeProduct,
  likeTheProduct,
  addToWishlist,
  addToCart,
  getProductLikes,
  decreaseFromCart,
  getCommentsOfProduct,
  updateComment,
  deleteCommentOfProduct,
  getSellersOfProduct,
  checkStock,
} = require("../controllers/product");
const { authenticateToken } = require("../middlewares/authenticate");
const { storage } = require("../scripts/utils/fileHelper");
const multer = require("multer");
const uploadFile = multer({ storage: storage });
const router = express.Router();
router.route("/").get(getAllProducts);
router.route("/check-stock").post(checkStock);
router
  .route("/add")
  .post(authenticateToken, uploadFile.single("photo"), addProduct);
router.route("/likes").get(authenticateToken, getProductLikes);
router.route("/:id/get-sellers-of-product").get(getSellersOfProduct);
router.route("/:id").put(authenticateToken, updateProduct);
router.get("/:id", getProduct);
router.delete("/:id", removeProduct);
router.route("/:id/add-comment").post(authenticateToken, commentToProduct);
router.route("/:id/get-comments").get(getCommentsOfProduct);
router.route("/:id/comments/:commentId").put(authenticateToken, updateComment);
router
  .route("/:id/comments/:commentId")
  .delete(authenticateToken, deleteCommentOfProduct);
router
  .route("/:id/get-comments-of-user")
  .get(authenticateToken, commentToProduct);
router.route("/:id/like").post(authenticateToken, likeTheProduct);
router.route("/:id/add-to-wishlist").post(authenticateToken, addToWishlist);
router.route("/:id/add-to-cart").post(authenticateToken, addToCart);
router
  .route("/:id/decrease-cart-item-quantity")
  .put(authenticateToken, decreaseFromCart);
router.route("/id/get-sellers-of-product").get(getSellersOfProduct);
module.exports = router;
