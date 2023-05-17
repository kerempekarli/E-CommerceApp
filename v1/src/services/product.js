const db = require("../loaders/db");

const getAll = async (req, res) => {
  return db.query("SELECT * FROM products");
};
const addProduct = async (req, res) => {
  const { name, description, price } = req.body;

  return await db.query(
    "INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING *",
    [name, description, price]
  );
};
const update = async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;

  try {
    const result = await db.query(
      "UPDATE products SET name = $1, description = $2, price = $3 WHERE id = $4 RETURNING *",
      [name, description, price, id]
    );
    return result.rows[0];
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
const get = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("SELECT * FROM products WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: "Product not found" });
    } else {
      return result.rows[0];
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
const remove = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("DELETE FROM products WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: "Product not found" });
    } else {
      return res.status(204).send("Başarıyla silindi");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getAllSellerProductsBySellerId = async (req) => {
  const query = `
  SELECT p.*
  FROM products AS p
  JOIN sellers_products_join AS spj ON p.id = spj.product_id
  WHERE spj.seller_id = $1
`;
  const values = [req.params.sellerId];
  const result = await db.query(query, values);

  // Return the products
  return result.rows;
};
const addComment = async (req) => {
  const query =
    "INSERT INTO product_comments (product_id, user_id, comment) VALUES ($1, $2, $3) RETURNING id";
  const values = [req.params.id, req.user.id, req.body.comment];
  const result = await db.query(query, values);
  return result.rows[0].id;
};
const likeTheProductService = async (productId, userId, res) => {
  try {
    // Kullanıcının ilgili ürünü daha önce beğenip beğenmediğini kontrol et
    const likeCheckQuery =
      "SELECT * FROM product_likes WHERE product_id = $1 AND user_id = $2";
    const likeCheckValues = [productId, userId];
    const likeCheckResult = await db.query(likeCheckQuery, likeCheckValues);

    if (likeCheckResult.rowCount > 0) {
      // Kullanıcı daha önce beğenmişse beğeniyi geri al
      const unlikeQuery =
        "DELETE FROM product_likes WHERE product_id = $1 AND user_id = $2";
      const unlikeValues = [productId, userId];
      await db.query(unlikeQuery, unlikeValues);

      res
        .status(200)
        .json({ success: true, message: "Ürün beğenisi geri alındı" });
    } else {
      // Kullanıcı daha önce beğenmemişse yeni bir beğeni ekle
      const likeQuery =
        "INSERT INTO product_likes (product_id, user_id) VALUES ($1, $2)";
      const likeValues = [productId, userId];
      await db.query(likeQuery, likeValues);

      res.status(200).json({ success: true, message: "Ürün beğenisi eklendi" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Beğeni işlemi sırasında bir hata oluştu",
    });
  }
};
const addToWishlistService = async (productId, userId,res) => {
  try {
    const wishlistId = await getOrCreateWishlist(userId); // Kullanıcının mevcut wishlist ID'sini al veya yeni bir tane oluştur

    // Wishlist_items tablosunda, aynı kullanıcının aynı ürünü ekleyip eklemediğini kontrol edin
    const checkQuery =
      "SELECT id FROM wishlist_items WHERE wishlist_id = $1 AND product_id = $2";
    const checkValues = [wishlistId, productId];
    const checkResult = await db.query(checkQuery, checkValues);

    if (checkResult.rows.length > 0) {
      // Kullanıcının wishlist'inde ürün zaten varsa, geri alın
      const deleteQuery = "DELETE FROM wishlist_items WHERE id = $1";
      const deleteValues = [checkResult.rows[0].id];
      await db.query(deleteQuery, deleteValues);

      res.status(200).json({ message: "Product removed from wishlist" });
    } else {
      // Wishlist_items tablosuna yeni bir wishlist öğesi ekleyin
      const insertQuery =
        "INSERT INTO wishlist_items (wishlist_id, product_id) VALUES ($1, $2)";
      const insertValues = [wishlistId, productId];
      await db.query(insertQuery, insertValues);

      res.status(200).json({ message: "Product added to wishlist" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred" });
  }
};
// Kullanıcının mevcut wishlist ID'sini al veya yeni bir tane oluşturan yardımcı fonksiyon
async function getOrCreateWishlist(userId) {
  const query = "SELECT id FROM wishlists WHERE user_id = $1";
  const values = [userId];
  const result = await db.query(query, values);

  if (result.rows.length > 0) {
    // Kullanıcının mevcut wishlist ID'sini döndür
    return result.rows[0].id;
  } else {
    // Yeni bir wishlist oluştur ve ID'sini döndür
    const createQuery =
      "INSERT INTO wishlists (user_id) VALUES ($1) RETURNING id";
    const createValues = [userId];
    const createResult = await db.query(createQuery, createValues);
    return createResult.rows[0].id;
  }
}

module.exports = {
  getAll,
  addProduct,
  update,
  get,
  remove,
  getAllSellerProductsBySellerId,
  addComment,
  likeTheProductService,
  addToWishlistService,
};