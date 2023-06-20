const cookieSession = require("cookie-session");
const express = require("express");
const bcrypt = require("bcryptjs");
const exportHelpers = require("./helpers");
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
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {

  const getObjs = req.session.user_id;
  let getKey = "";
  let userUrl = {};

  if (getObjs) {
    getKey = JSON.parse(getObjs);
  }

  const getSingleKey = Object.keys(getKey)[0];

  if (!getSingleKey) {
    res.send("<html><body>please login/register</body></html>\n");
    return;
  }

  for (const key in urlDatabase) {
    if (urlDatabase[key].userId === getSingleKey) {
      userUrl[key] = urlDatabase[key];
    }
  }

  const templateVars = {
    urls: userUrl,
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

  const generateId = exportHelpers.generateRandomString();
  let getUrlPosted = req.body;

  if (!getSingleKey) {
    res.send("<html><body>please login to shorten url</body></html>\n");
    return;
  }

  urlDatabase[generateId] = {
    longURL: getUrlPosted.longURL,
    userId: getSingleKey
  };

  res.redirect("/urls/" + generateId);
});

app.post("/register", (req, res) => {

  const getIsUserExist = exportHelpers.checkIfUserExists(req.body.email, users);

  if (req.body.email === "" || req.body.password === "") {
    res.sendStatus(400);
  }

  if (getIsUserExist === undefined) {
    const generateId = exportHelpers.generateRandomString();

    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = { id: generateId, email: req.body.email, password: hashedPassword };

    users[generateId] = newUser;

    res.redirect("/login");
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
    return;
  }

  const getObjs = req.session.user_id;
  let getKey = "";

  if (getObjs) {
    getKey = JSON.parse(getObjs);
  }

  const getSingleKey = Object.keys(getKey)[0];

  if (!getSingleKey) {
    res.send("<html><body>Please log in</body></html>\n");
    return;
  }

  const getUserUrl = exportHelpers.urlsForUser(getSingleKey, req.params.id, urlDatabase);

  if (!getUserUrl) {
    res.send("<html><body>You do not have permission to delete this url</body></html>\n");
    return;
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
  const getIsUserExist = exportHelpers.checkIfUserExists(req.body.email, users);

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

    const isPassMatched = bcrypt.compareSync(req.body.password, assignObj[getUserDetails].password);

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
  res.clearCookie("session.sig");

  res.redirect("/login");
});

app.get("/urls/new", (req, res) => {
  const getObjs = req.session.user_id;
  let getKey = "";

  if (getObjs) {
    getKey = JSON.parse(getObjs);
  }

  const getSingleKey = Object.keys(getKey)[0];

  if (!getSingleKey) {
    res.redirect("/login");
    return;
  }

  const templateVars = {
    username: users[getSingleKey].email
  };

  templateVars[getSingleKey] = users[getSingleKey];

  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
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
  const longURL = urlDatabase[shortUrlId];

  if (!(longURL)) {
    res.send("Url not found Not Found");
    return;
  }

  res.redirect(longURL.longURL);
});

app.get("/urls/:id", (req, res) => {

  const getObjs = req.session.user_id;
  let getKey = "";
  let errorMsg = null;

  if (getObjs) {
    getKey = JSON.parse(getObjs);
  }

  const getSingleKey = Object.keys(getKey)[0];

  const templateVars = { id: req.params.id, getLongURL: urlDatabase[req.params.id], username: users[getSingleKey], error: errorMsg };

  if (getSingleKey === undefined) {
    templateVars.error = "Please login to view";
    res.render('url_login', templateVars);
    return;
  }

  if (urlDatabase[req.params.id] !== undefined) {
    if (urlDatabase[req.params.id].userId !== getSingleKey) {
      res.send('you are not the owner of the url');
      return;
    }
  } else {
    res.send('Url does not exist');
    return;
  }

  const getUserUrl = exportHelpers.urlsForUser(getSingleKey, req.params.id, urlDatabase);

  if (!getUserUrl) {
    res.send("You do not have permission to view this page");
    return;
  }

  res.render("urls_show", templateVars);

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});