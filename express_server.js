const cookieSession = require("cookie-session");
const express = require("express");
const bcrypt = require("bcryptjs");
const checkIfUserExists = require("./helpers");
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000
}));

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

const urlsForUser = (id, idParam) => {
  const idOne = urlDatabase[idParam];
  const idTwo = id;

  if (idOne) {
    if (idOne.userId === idTwo) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
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

  const getObjs = req.session.user_id;
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
  const getObjs = req.session.user_id;
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

  urlDatabase[generateId] = {
    longURL: getUrlPosted.longURL,
    userId: getSingleKey
  };

  res.redirect("/urls/" + generateId);
});

app.post("/register", (req, res) => {

  const getIsUserExist = checkIfUserExists(req.body.email, users);

  if (req.body.email === "" || req.body.password === "") {
    res.sendStatus(400);
  }

  if (getIsUserExist === undefined) {
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

    const newStrngObject = JSON.stringify(assignObj);

    req.session.user_id = newStrngObject;

    res.redirect("/urls");
  } else {
    res.sendStatus(400);
  }

});

app.get("/login", (req, res) => {
  const getObjs = req.session.user_id;
  let getKey = "";

  if (getObjs) {
    getKey = JSON.parse(getObjs);
  }

  const getSingleKey = Object.keys(getKey)[0];

  const templateVars = {
    username: users[getSingleKey],
    error: ""
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

  const getObjs = req.session.user_id;
  let getKey = "";

  if (getObjs) {
    getKey = JSON.parse(getObjs);
  }

  const getSingleKey = Object.keys(getKey)[0];

  if (!getSingleKey) {
    res.send("<html><body>Please log in</body></html>\n");
  }

  const getUserUrl = urlsForUser(getSingleKey, req.params.id);

  if (!getUserUrl) {
    res.send("<html><body>You do not have permission to delete this url</body></html>\n");
  } else {

    const shortUrlId = req.params.id;

    delete urlDatabase[shortUrlId];

    res.redirect("/urls/");
  }
});

app.post("/urls/:id", (req, res) => {
  const shortUrlId = req.params.id;

  urlDatabase[shortUrlId].longURL = req.body.longURL;

  res.redirect("/urls/");
});

// login route
app.post("/login", (req, res) => {
  const getIsUserExist = checkIfUserExists(req.body.email, users);

  if (getIsUserExist === undefined) {
    res.sendStatus(403);
  } else {
    const getUserDetails = Object.keys(getIsUserExist)[0];
    let getUserObj = getIsUserExist[getUserDetails];
    const assignObj = {};

    assignObj[getUserDetails] = {
      email: getUserObj.email,
      password: getUserObj.password
    };

    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const isPassMatched = bcrypt.compareSync(assignObj[getUserDetails].password, hashedPassword);

    if (isPassMatched === false) {
      res.sendStatus(403);
    } else if (isPassMatched === true) {

      const newStrngObject = JSON.stringify(assignObj);
      req.session.user_id = newStrngObject;

      res.redirect("/urls");
    }
  }
});

// logout route
app.post("/logout", (req, res) => {
  res.session = null;
  res.clearCookie("session");

  res.redirect("/login");
});

app.get("/urls/new", (req, res) => {
  const getObjs = req.session.user_id;
  let getKey = "";

  if (getObjs) {
    getKey = JSON.parse(getObjs);
  }

  const getSingleKey = Object.keys(getKey)[0];

  const templateVars = {
    username: users[getSingleKey].email
  };

  templateVars[getSingleKey] = users[getSingleKey];

  if (!getSingleKey) {
    res.redirect("/login");
  }

  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  // const getObjs = req.cookies["user_id"];
  const getObjs = req.session.user_id;

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

  res.render("urls_register", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortUrlId = req.params.id;
  const longURL = urlDatabase[shortUrlId].longURL;

  if (!(longURL)) {
    res.send("User Not Found");
  }

  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {

  const getObjs = req.session.user_id;
  let getKey = "";
  let errorMsg = null;

  if (getObjs) {
    getKey = JSON.parse(getObjs);
  }

  const getSingleKey = Object.keys(getKey)[0];

  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, username: users[getSingleKey], error: errorMsg };

  if (getSingleKey === undefined) {
    templateVars.error = "Please login to view";
    res.render('url_login', templateVars);
    return;
  }

  if (urlDatabase[req.params.id].userId !== getSingleKey) {
    res.send('you are not the owner of the url');
    return;
  }

  const getUserUrl = urlsForUser(getSingleKey, req.params.id);

  if (!templateVars.longURL) {
    res.send("Url does not exist");
    return;
  }

  if (!getUserUrl) {
    res.send("You do not have permission to view this page");
    return;
  }

  res.render("urls_show", templateVars);

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});