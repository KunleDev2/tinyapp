const express = require("express");
const app = express();
const PORT = 3000;

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
}

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  const templateVars = { urls: urlDatabase };

  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const generateId = generateRandomString();
  let getUrlPosted = req.body;

  urlDatabase[generateId] = getUrlPosted.longURL;

  res.redirect("/urls/" + generateId);
});

app.post("/urls", (req, res) => {

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
  res.cookie("username", "test");

  res.redirect("/urls/");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});