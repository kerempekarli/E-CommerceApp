const {
  getAll,
  add,
  update,
  get,
  remove,
  addComment,
  likeTheProductService,
  addToWishlistService,
  getProductLikesService,
  getCommentsOfProductService,
  updateCommentService,
  deleteCommentOfProductService,
  getSellersOfProductService,
  checkStockService,
} = require("../services/product");
const { addSellerProduct } = require("../services/sellers_products_join");
const cartService = require("../services/cart");
const getAllProducts = async (req, res) => {
  try {
    const data = await getAll(req, res);
    res.status(200).send(data.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
const addProduct = async (req, res) => {
  try {
    const data = await add(req, res);
    const product_id = data.rows[0].id;
    const seller_products = await addSellerProduct(req, product_id);
    res.status(201).send("Ekleme işlemi başarılı");
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
const updateProduct = async (req, res) => {
  const result = await update(req, res);
  res.status(200).send(result);
};
const getProduct = async (req, res) => {
  const sellers = await getSellersOfProductService(req.params.id);
  const products = [];
  for (const seller of sellers) {
    const product = await get(req, res, seller.id);
    products.push(product);
  }
  return res.status(200).send({ products: products, success: true });
};
const removeProduct = async (req, res) => {
  return await remove(req, res);
};
const getProductsOfSeller = async (req, res) => {};
const commentToProduct = async (req, res) => {
  await addComment(req);
  res.status(200).send("Yorum başarıyla eklendi");
};
const likeTheProduct = async (req, res) => {
  const productId = req.params.id;
  const userId = req.user.id;
  await likeTheProductService(productId, userId, res);
};
const addToWishlist = async (req, res) => {
  const productId = req.params.id; // URL'deki productId parametresini alın
  const userId = req.user.id; // İstekteki kullanıcı ID'si
  await addToWishlistService(productId, userId, res);
};
const addToCart = async (req, res) => {
  try {
    const cardId = await cartService.getOrCreateCart(req.user.id);
    const result = await cartService.addToCart(
      cardId,
      req.params.id,
      1,
      req.body.seller_id
    );
    res.status(200).send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};
const decreaseFromCart = async (req, res) => {
  try {
    const cardId = await cartService.getOrCreateCart(req.user.id);
    const result = await cartService.decreaseCartItemQuantity(
      cardId,
      req.params.id,
      1
    );
    res.status(200).send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};
const getProductLikes = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(userId);
    const data = await getProductLikesService(userId);
    res.status(200).send(data);
  } catch (error) {
    console.error(error);
    res.status(400).send("Hata");
    throw error;
  }
};
const getCommentsOfProduct = async (req, res) => {
  await getCommentsOfProductService(req, res);
};
const updateComment = async (req, res) => {
  updateCommentService(req, res);
};
const deleteCommentOfProduct = async (req, res) => {
  deleteCommentOfProductService(req, res);
};
const getSellersOfProduct = async (req, res) => {
  try {
    console.log("ÇALIŞTI");
    const product_id = req.params.id;

    const data = await getSellersOfProductService(product_id);

    res.status(200).json(data);
  } catch (error) {
    console.error("Error getting sellers of product:", error);
    res.status(500).json({ error: "Failed to get sellers of product" });
  }
};
const checkStock = async (req, res) => {
  try {
    const { productId, sellerId } = req.body;
    const result = await checkStockService(productId, sellerId);
    res.status(200).send(result);
  } catch (err) {
    res.status(400).send("Başarısız");
    console.log(err);
  }
};

module.exports = {
  getAllProducts,
  addProduct,
  updateProduct,
  getProduct,
  removeProduct,
  likeTheProduct,
  commentToProduct,
  addToWishlist,
  addToCart,
  decreaseFromCart,
  getProductLikes,
  getCommentsOfProduct,
  updateComment,
  deleteCommentOfProduct,
  getSellersOfProduct,
  checkStock,
};
