const express = require('express'), bodyParser = require('body-parser'), Twitter = require('twitter'), crypto = require('crypto');
const port = process.env.PORT || 3000;
const app = express();

// Iniitialize twitter client
var client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
})

// initialize express middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// create POST request handler for /git-twit
app.post("/git-twit", (req, res) => {
    const payload = JSON.parse(req.body.payload);
    const owner = payload.repository.owner;

    if(owner.login !== "iambenkay" && owner.email !== "benjamin.node@gmail.com") return;

    let push = JSON.parse(req.body.payload);
    let toTweet =
        `GIT ${req.headers['x-github-event'].toUpperCase()}!!\nmessage: ${push.head_commit.message}\nLink: ${push.repository.url}\nLast commit by: ${push.head_commit.author.name}.\n(powered by pushwatcher)`;

    client.post('statuses/update', { status: toTweet.substring(0, 140), })
        .then(tweet => {
        })
        .catch(error => {
            reject(error);
        });
});

app.listen(port);
