const express = require("express");
const app = express()
const cors = require("cors");
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config()
const URL = process.env.DB
const DBC = "gmail"



app.use(express.json());
app.use(cors());


app.get("/emails",  async function (req, res) {

    try {
        
        const connection = await mongoClient.connect(URL)
        
        const db = connection.db(DBC);
        
        let reUser = await db.collection("mail").find().toArray();
        
        await connection.close();
        
        res.json(reUser);
    } catch (error) {
        res.status(500).json({
            messege: "Somthig went wrong"
        });
    }
});

app.post("/email", async function (req, res) {

    try {

        const connection = await mongoClient.connect(URL)

        const db = connection.db(DBC)

        await db.collection("mail").insertOne(req.body)

        await connection.close()

        res.status(200).json({ messege: "Done" })
    } catch (error) {
        res.status(500).json({
            messege: "Somthig went wrong"
        })
    }
});

app.get("/email/:id",  async function (req, res) {

    try {

        const connection = await mongoClient.connect(URL)

        const db = connection.db(DBC)

        let user = await db.collection("mail").findOne({ _id: mongodb.ObjectId(req.params.id) });

        await connection.close()

        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({
            messege: "Somthig went wrong"
        })
    }
});

app.delete("/email/:id",  async function (req, res) {

    try {

        const connection = await mongoClient.connect(URL)

        const db = connection.db(DBC)

        let user = await db.collection("mail").findOneAndDelete({ _id: mongodb.ObjectId(req.params.id) });

        await connection.close()

        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({
            messege: "Somthig went wrong"
        })
    }
});

app.post("/register", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db(DBC)

        let salt = await bcrypt.genSalt(10);
        console.log(salt)
        let hash = await bcrypt.hash(req.body.password, salt);
        console.log(hash)

        req.body.password = hash

        await db.collection("user").insertOne(req.body);

        await connection.close()
        res.json({ messege: "user registered" })
    } catch (error) {
        console.log(error)
        res.json(error)
    }
});

app.post("/login", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db(DBC);

        let user = await db.collection("user").findOne({ email: req.body.email })
        console.log(user)
        if (user) {
            let compare = await bcrypt.compare(req.body.password, user.password)
            if (compare) {
                // res.json({messege : "login succesefully"})
                let token = jwt.sign({ email: user.email }, process.env.SECRET, { expiresIn: "24h" });
                res.json({ token })
            } else {
                res.json({ messege: "user name/password is wrong" })
            }
        } else {
            res.status(401).json({ messege: "user name/password is wrong" })
        }
    } catch (error) {
        console.log(error);
        res.status(600).json({ messege: "somthing went wrong" })
    }
});


app.get('/',(req,res) => {
    res.send(`server connected`)
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`server running on port ${port}`)
});