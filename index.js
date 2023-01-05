const express = require('express');
require('./db/config');
const Jwt = require('jsonwebtoken');
const jwtKey = 'mad';
const cors = require('cors');
const User = require('./db/user');
const app = express();
const Wallet = require('./db/wallet');


app.use(express.json())
app.use(cors())


app.post('/register', async (req, res) => {
    let existingUser = await User.findOne({ username: req.body.username }).select('-password');
    if (!existingUser) {
        let user = new User(req.body);
        let result = await user.save();
        result = result.toObject();
        delete result.password;
        if (result) {
            res.send({ output: result })
        } else {
            res.send({ result: 'There was some error' })
        }
    }
    else {
        res.send({ result: "user already exists", userExists: true })
    }
})

const verifyToken = (req, res, next) => {
    let token = req.headers['authorization'];
    if (token) {
        token = token.split(' ')[1];
        Jwt.verify(token, jwtKey, (err, valid) => {
            if (err) {
                res.status(400).send({ result: 'please provide valid token', err });
            } else {
                next();
            }
        })
    } else {
        res.status(403).send({ result: 'please add token with header' });
    }
}

app.post('/login', async (req, res) => {
    if (req.body.username && req.body.password) {
        let user = await User.findOne({ username: req.body.username }).select('-password');
        if (user) {
            let passwordOfuser = await User.findOne({ password: req.body.password });
            if (passwordOfuser) {
                Jwt.sign(
                    { user },
                    jwtKey,
                    (err, token) => {
                        if (err) {
                            res.send({ result: 'something went wrong in jwt' })
                        } else {
                            res.send({
                                user, auth: token,
                            })
                        }
                    }
                )
            } else {
                res.send({ result: 'Password is incorrect', passwordIncorrect: true })
            }
        } else {
            res.send({ result: 'User not found', userNotFound: true })
        }
    } else {
        res.send({ result: "both field required" })
    }
})


app.post('/get-wallet', verifyToken, async (req, res) => {
    console.log(req.body.username)
    let user = await Wallet.findOne({ username: req.body.username });
    if (user) {
        res.send(user);
    } else {
        res.send({ noWallet: true })
    }
})


app.put('/update-balance', verifyToken, async (req, res) => {
    let username = req.body.username;
    let result = await Wallet.updateOne(
        { username: username },
        {
            $set: { balance: req.body.balance }
        }
    )
    result = await Wallet.findOne({ username: username });

    if (result) {
        res.send(result);
    } else {
        res.send({
            result: 'Something went wrong!!!'
        })
    }
})


app.post('/add-new-balance', async (req, res) => {
    let username = req.body.username;
    let existingUser = await Wallet.findOne({ username: req.body.username });
    if (!existingUser) {
        let wallet = new Wallet({ username: username, balance: '0' });
        let result = await wallet.save();
        if (result) {
            res.send(result);
        } else {
            res.send({
                result: 'Something went wrong!!!'
            })
        }
    } else {
        res.send({ result: 'wallet already exists' })
    }
})


app.listen(5000);