const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 5000;

//firebase imports
const admin = require("firebase-admin");
const serviceAccount = require("./firestore.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

/* setup and logger */
app.listen(port, () => {
  console.log(`Book library app listening at http://localhost:${port}`);
});

const logger = (req, res, next) => {
  console.log(`${req.protocol}://${req.get("host")}${req.originalUrl}`);
  next();
};
app.use(logger);

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* react pages */
app.use(express.static(path.join(__dirname, "./build")));

// add to library
app.post("/api/user/add", (req, res) => {
  const data = req.body.bookData;
  const user = req.body.uid;
  if (!data) res.status(400).send({ msg: "Error occurred" });
  if (!user) res.status(400).send({ msg: "Account error occurred" });

  db_createUser(user); // make sure user is added to firestore

  db_addBook(req.body.uid, data)
    .then((result) => {
      if (result == 1) {
        return res.status(227).send({ msg: "book already in library" });
      } else {
        return res.json({ msg: "book added" });
      }
    })
    .catch((err) => {});
});

// remove from library
app.post("/api/user/remove", (req, res) => {
  const data = req.body.bookData;
  const user = req.body.uid;

  if (!data) res.status(400).send({ msg: "Error occurred" });
  if (!user) res.status(400).send({ msg: "Account error occurred" });
  db_createUser(user); // make sure user is added to firestore
  db_removeBook(user, data).catch((err) => {
    res.status(400).send({ msg: "error occurred" });
  });
  res.json({ msg: "book removed" });
});

// load library contents
app.get("/api/library", (req, res) => {
  const user = req.query.uid;
  if (!user) res.status(400).send({ msg: "Account error occurred" });
  db_createUser(user); // make sure user is added to firestore
  const libraryData = db_data(user)
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.status(400).send({ msg: "error occurred" });
    });
});

// load book details
app.get("/api/user/book", async (req, res) => {
  const user = req.query.uid; // Lấy user từ query params
  const bookTitle = req.query.title; // Lấy title của sách từ query params

  try {
    if (!user) {
      throw new Error("Account error occurred: User ID is required");
    }

    if (!bookTitle) {
      throw new Error("Book title is required");
    }

    // Đảm bảo rằng user đã được thêm vào Firestore
    await db_createUser(user);

    // Truy vấn dữ liệu từ Firestore để lấy thông tin về thư viện của người dùng
    const libraryData = await db_data(user);

    // Kiểm tra xem nếu không có dữ liệu trả về từ Firestore
    if (!libraryData) {
      return res
        .status(404)
        .json({ msg: "Library is empty or user not found" });
    }

    // Tìm quyển sách trong thư viện của người dùng dựa trên title
    const book = libraryData.find((item) => item.title === bookTitle);

    // Kiểm tra xem quyển sách có tồn tại trong thư viện hay không
    if (!book) {
      return res
        .status(404)
        .json({ msg: `Book "${bookTitle}" not found in library` });
    }

    // Trả về thông tin về quyển sách
    res.json(book);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
});

/*
 * FIREBASE FUNCTIONS
 */
async function db_createUser(data) {
  const userRef = db.collection("users").doc(data);
  const doc = await userRef.get();
  if (!doc.exists) {
    const res = await db.collection("users").doc(data).set({
      library: [],
    });
  }
}

async function db_addBook(user, data) {
  const userRef = db.collection("users").doc(user);

  const library = await userRef.get().then((doc) => doc.get("library"));

  // check if book is already in user library
  for (let i = 0; i < library.length; i++) {
    if (library[i].title === data.title) {
      return 1;
    }
  }

  // update database
  const update = await userRef.update({
    library: FieldValue.arrayUnion(data),
  });
}

async function db_removeBook(user, data) {
  const userRef = db.collection("users").doc(user);
  const update = await userRef.update({
    library: FieldValue.arrayRemove({
      authors: data.authors,
      subtitle: data.subtitle,
      thumbnail: data.thumbnail,
      title: data.title,
    }),
  });
  return 0;
}

async function db_data(body) {
  const userRef = db.collection("users").doc(body);
  const data = await userRef.get().then((doc) => doc.get("library"));
  if (data) return data;
}
