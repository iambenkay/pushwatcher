const express = require('express'), bodyParser = require('body-parser'), Twitter = require('twitter');
const config = require('./config');
const port = process.env.PORT || 3000;
const app = express();

var client = new Twitter({
    consumer_key: config.CONSUMER_KEY,
    consumer_secret: config.CONSUMER_SECRET,
    access_token_key: config.ACCESS_TOKEN_KEY,
    access_token_secret: config.ACCESS_TOKEN_SECRET,
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/git-twit", (req, res) => {
    let push = req.body;

    let toTweet = `Git ${req.headers['X-Github-Event']} notification\ngit >> ${push.head_commit.message}\n\nLast commit by: ${push.head_commit.author.name} ${push.head_commit.author.email}.\n\nThere are a total of ${push.size} commits in this push.`;

    client.post('statuses/update', { status: toTweet })
        .then(tweet => {
            res.send(tweet);
        })
        .catch(error => {
            throw error;
        });
});

app.listen(port);