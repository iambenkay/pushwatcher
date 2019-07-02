const express = require('express'), bodyParser = require('body-parser'), Twitter = require('twitter'), crypto = require('crypto');
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
    let secrets = process.env.GITHUB_HOOK_SECRETS.split(',');
    let hmacs = [];
    
    for(let s of secrets){
        let hmac = crypto.createHmac('sha1', s);
        hmac.update(JSON.stringify(req.body));
        hmacs.push(`sha1=${hmac.digest('hex')}`);
    }
    if(req.headers['x-hub-signature'] in hmacs) {
        let push = req.body;
    
        let toTweet = 
        `***GIT ${req.headers['x-github-event'].toUpperCase()} NOTIFICATION***
        
        git >> ${push.head_commit.message}
        Link: ${push.url}
        
        Last commit by: ${push.head_commit.author.name}
        ${push.head_commit.author.email}.
        
        There are a total of ${push.commits.length} commits in this push.
        
        (This stat was published by pushwatcher)`;
    
        client.post('statuses/update', { status: toTweet })
            .then(tweet => {
                res.send(tweet);
            })
            .catch(error => {
                throw error;
            });
    } else {
        console.log("The github repo you're trying to use is not registered with this instance of pushwatcher and is unauthorized.");
        res.send("The github repo you're trying to use is not registered with this instance of pushwatcher and is unauthorized.");
    }
});

app.listen(port);