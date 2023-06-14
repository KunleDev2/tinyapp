const cookieParser = require("cookie-parser");
const express = require("express");
const bcrypt = require("bcryptjs");
const e = require("express");
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

let urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userId: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userId: "user2RandomID"
  },
  "dBujWO": {
    longURL: "http://localhost:3000/urls",
    userId: "dBujWO"
  }
};

const users = {
  userRandomID: {
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    email: "user2@example.com",
    password: "hello",
  },
  "dBujWO": {
    email: "user3@example.com",
    password: "hello",
  }
};

const generateRandomString = () => {
  let getRandChar = '';
  let randArray = [];
  let charForRand = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  const maxLength = 6;

  for (let i = 0; i < maxLength; i++) {
    let genRandomChar = Math.floor(Math.random() * charForRand.length);

    getRandChar = getRandChar + charForRand.charAt(genRandomChar);

    randArray.push(getRandChar);
  }

  return getRandChar;
};

const checkIfUserExists = (email) => {
  let isUserExisting = {};

  for (let key in users) {
    const userEmail = users[key].email;

    if (email === userEmail) {
      console.log("is email2" + users[key].email);
      isUserExisting[key] = users[key];
      
      console.log("is email" + isUserExisting[key]);
    }
  }

  console.log(isUserExisting);
  return isUserExisting;
};

const urlsForUser = (id) => {

  const loggedInUser = urlDatabase[id].userId;


  return loggedInUser;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {

  const getObjs = req.cookies["user_id"];
  let getKey = "";

  if (getObjs) {
    getKey = JSON.parse(getObjs);
  }

  const getSingleKey = Object.keys(getKey)[0];

  if (!getSingleKey) {
    res.send("<html><body>please login/register</body></html>\n");
  }

  const templateVars = {
    urls: urlDatabase,
    username: users[getSingleKey]
  };

  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const getObjs = req.cookies["user_id"];
  let getKey = "";

  if (getObjs) {
    getKey = JSON.parse(getObjs);
  }

  const getSingleKey = Object.keys(getKey)[0];

  const generateId = generateRandomString();
  let getUrlPosted = req.body;

  if (!getSingleKey) {
    res.send("<html><body>please login to shorten url</body></html>\n");
  }

  urlDatabase[generateId] = getUrlPosted.longURL;

  res.redirect("/urls/" + generateId);
});

app.post("/register", (req, res) => {
  console.log(req.body.email);

  const getIsUserExist = checkIfUserExists(req.body.email);
  console.log("I got here");
  console.log(getIsUserExist);

  if (req.body.email === "" || req.body.password === "") {
    res.sendStatus(400);
  }

  if (getIsUserExist !== null) {
    const generateId = generateRandomString();

    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = { id: generateId, email: req.body.email, password: hashedPassword };

    users[generateId] = newUser;

    const assignObj = {};

    assignObj[generateId] = {
      email: req.body.email,
      password: req.body.password
    };

    console.log(assignObj);
    console.log(users);
    const newStrngObject = JSON.stringify(assignObj);

    res.cookie("user_id", newStrngObject);

    res.redirect("/urls");
  } else {
    res.sendStatus(400);
  }

});

app.get("/login", (req, res) => {
  const getObjs = req.cookies["user_id"];
  let getKey = "";

  if (getObjs) {
    getKey = JSON.parse(getObjs);
  }

  const getSingleKey = Object.keys(getKey)[0];

  const templateVars = {
    username: users[getSingleKey],
  };

  if (getSingleKey) {
    res.redirect("/urls");
  }

  res.render("url_login", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id] === undefined) {
    res.send("<html><body>id does not exist</body></html>\n");
  }

  const getObjs = req.cookies["user_id"];
  let getKey = "";

  if (getObjs) {
    getKey = JSON.parse(getObjs);
  }

  const getSingleKey = Object.keys(getKey)[0];

  if (!getSingleKey) {
    res.send("<html><body>Please log in</body></html>\n");
  }

  const getUserUrl = urlsForUser(getSingleKey);

  if (getUserUrl !== req.params.id) {
    res.send("<html><body>You do not have permission to delete this url</body></html>\n");
  } else {

    const shortUrlId = req.params.id;

    delete urlDatabase[shortUrlId];

    res.redirect("/urls/");
  }
});

app.post("/urls/:id", (req, res) => {
  const shortUrlId = req.params.id;

  urlDatabase[shortUrlId] = req.body.longURL;

  res.redirect("/urls/");
});

// login route
app.post("/login", (req, res) => {
  const getIsUserExist = checkIfUserExists(req.body.email);
  const getUserDetails = Object.keys(getIsUserExist)[0];
  let getUserObj = getIsUserExist[getUserDetails];
  const assignObj = {};

  assignObj[getUserDetails] = {
    email: getUserObj.email,
    password: getUserObj.password
  };

  console.log("hello one");
  console.log(assignObj[getUserDetails].password);

  if (getUserDetails === null) {
    res.sendStatus(403);
  } else {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const isPassMatched = bcrypt.compareSync(assignObj[getUserDetails].password, hashedPassword);
    console.log("Pass: " + isPassMatched);

    if (isPassMatched === false) {
      res.sendStatus(403);
    } else if (isPassMatched === true) {

      const newStrngObject = JSON.stringify(assignObj);

      res.cookie("user_id", newStrngObject);

      res.redirect("/urls");
    }
  }
});

// logout route
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");

  res.redirect("/login");
});

app.get("/urls/new", (req, res) => {
  const getObjs = req.cookies["user_id"];
  let getKey = "";

  if (getObjs) {
    getKey = JSON.parse(getObjs);
  }

  const getSingleKey = Object.keys(getKey)[0];

  const templateVars = {
    username: users[getSingleKey],
  };

  if (!getSingleKey) {
    res.redirect("/login");
  }

  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const getObjs = req.cookies["user_id"];

  let getKey = "";

  if (getObjs) {
    getKey = JSON.parse(getObjs);
  }

  const getSingleKey = Object.keys(getKey)[0];

  console.log("I got here");

  const templateVars = {
    username: users[getSingleKey],
  };

  if (getSingleKey) {
    res.redirect("/urls");
  }

  res.render("urls_register", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortUrlId = req.params.id;
  const longURL = urlDatabase[shortUrlId];

  if (!(longURL)) {
    res.send("User Not Found");
  }

  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {

  const getObjs = req.cookies["user_id"];
  let getKey = "";

  if (getObjs) {
    getKey = JSON.parse(getObjs);
  }

  const getSingleKey = Object.keys(getKey)[0];

  if (!getSingleKey) {
    res.send("<html><body>please login to to access this url</body></html>\n");
  }

  if (req.params.id !== getSingleKey.userId) {
    res.send("<html><body>you do not have permission to view this url</body></html>\n");
  }

  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: users[getSingleKey] };

  const getUserUrl = urlsForUser(getSingleKey);

  if (!templateVars.longURL) {
    res.send("<html><body>url does not exist</body></html>\n");
  }

  if (!getUserUrl) {
    res.send("<html><body>you do not have permission to view this url</body></html>\n");
  }

  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});