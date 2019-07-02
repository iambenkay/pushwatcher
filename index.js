const express = require('express'), bodyParser = require('body-parser'), Twitter = require('twitter'), crypto = require('crypto');
const port = process.env.PORT || 3000;
const app = express();

const createSignatures = body => {
    createdSignatures = [];
    for (let secret of process.env.GITHUB_HOOK_SECRETS.split(',')) {
        const hmac = crypto.createHmac('sha1', secret);
        const signature = hmac.update(JSON.stringify(body)).digest('hex');
        createdSignatures.push(signature);
    }
    return createdSignatures;
}

const validateSignature = (signature, createdSignature) => {
    const source = Buffer.from(signature);
    const verifier = Buffer.from(createdSignature);

    return crypto.timingSafeEqual(source, verifier);
}

const verifyGithub = (req, res, next) => {
    const { headers, body } = req;
    let valid = false;

    const signature = headers['x-hub-signature'];

    for (let sign of createSignatures(body)) {
        if (validateSignature(signature, sign)) {
            valid = true;
            break;
        }
    }
    console.log(valid);
    if (!valid) {
        return res.status(401).send("Mismatched Signatures");
    }
    next();
}

var client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/git-twit", verifyGithub, (req, res) => {

    let toTweet =
        `***GIT ${req.headers[''].toUpperCase()} NOTIFICATION***
        
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
});

app.listen(port);