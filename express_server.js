const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

function generateRandomString() {
  let getRandChar = '';
  let randArray = [];
  let charForRand = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  const maxLength = 6;

  for (let i = 0; i < maxLength; i++) {
    let genRandomChar = Math.floor(Math.random() * charForRand.length);

    getRandChar = getRandChar + charForRand.charAt(genRandomChar);

    randArray.push(getRandChar);
  };

  return getRandChar;
};

function checkIfUserExists(email) {
  let isUserExisting = null;

  for (let key in users) {
    const userEmail = users[key].email;
    console.log(email);
    console.log(userEmail);
    if (email === userEmail) {
      console.log("I am not available");
      isUserExisting = users[key];
    };
  };

  return isUserExisting;
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
  const templateVars = {
    urls: urlDatabase,
    username: users[req.cookies["user_id"]]
  };

  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const generateId = generateRandomString();
  let getUrlPosted = req.body;

  urlDatabase[generateId] = getUrlPosted.longURL;

  res.redirect("/urls/" + generateId);
});

app.post("/register", (req, res) => {

  const getIsUserExist = checkIfUserExists(req.body.email);

  if (req.body.email === "" || req.body.password === "") {
    res.sendStatus(400);
  };

  if (getIsUserExist === null) {
    const generateId = generateRandomString();

    const newUser = { id: generateId, email: req.body.email, password: req.body.password };

    users[generateId] = newUser;

    res.cookie("user_id", generateId);

    res.redirect("/urls");
  } else {
    res.sendStatus(400);
  }

});

app.post("/login", (req, res) => {


});

app.get("/login", (req, res) => {
  const templateVars = {
    username: users[req.cookies["user_id"]]
  };

  res.render("url_login", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  const shortUrlId = req.params.id;

  delete urlDatabase[shortUrlId];

  res.redirect("/urls/");
});

app.post("/urls/:id", (req, res) => {
  const shortUrlId = req.params.id;

  urlDatabase[shortUrlId] = req.body.longURL;

  res.redirect("/urls/");
});

// login route
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);

  res.redirect("/urls/");
});

// logout route
app.post("/logout", (req, res) => {
  res.clearCookie("username");

  res.redirect("/urls/");
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: users[req.cookies["user_id"]],
  };

  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    username: users[req.cookies["user_id"]],
  };

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
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});