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
    console.log(req.body.payload);
    console.log(req.headers);
    let push = req.body;
    let toTweet =
        `***GIT ${req.headers['x-github-event'].toUpperCase()} NOTIFICATION***
        
        git >> ${push.head_commit.message}
        Link: ${push.url}
        
        Last commit by: ${push.head_commit.author.name} (${push.head_commit.author.email}).
        
        There are a total of ${push.commits.length} commits in this push.
        
        (This stat was published by pushwatcher >> https://github.com/iambenkay/pushwatcher)`;

    client.post('statuses/update', { status: toTweet })
        .then(tweet => {
            res.send(tweet);
        })
        .catch(error => {
            throw error;
        });
});

app.listen(port);
