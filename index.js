const express = require('express'), bodyParser = require('body-parser'), Twitter = require('twitter');
const port = process.env.PORT || 3000;
const app = express();

var client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/git-twit", (req, res) => {
    let push = req.body;

    let toTweet = `***GIT ${req.headers['x-github-event'].toUpperCase()} NOTIFICATION***\n\ngit >> ${push.head_commit.message}\n\n\t\tLast commit by: ${push.head_commit.author.name}\n\t\t${push.head_commit.author.email}.\n\nThere are a total of ${push.commits.length()} commits in this push.\n\n(This stat was published by pushwatcher)`;

    client.post('statuses/update', { status: toTweet })
        .then(tweet => {
            res.send(tweet);
        })
        .catch(error => {
            throw error;
        });
});

app.listen(port);