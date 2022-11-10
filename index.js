const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;

const app = express();
app.use(cors())
app.use(express.json());


const user = process.env.USER_NAME;
const password = process.env.PASSWORD;

const uri = `mongodb+srv://${user}:${password}@cluster0.hdi07kd.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verfiyJwt(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        res.status(401).send({message: "Unauthorized Access"})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function(error, decoded){
        if(error){
            res.status(401).send({message: "Unauthorized Access"})
        }
        req.decoded = decoded;
        next()
    })

}

async function run() {
    try {
        const servicesCollection = client.db('photography-services').collection('services');
        const reviewsCollection = client.db('photography-services').collection('reviews');
        app.get('/services-home', async (req, res) => {
            const query = {}
            const cursor = servicesCollection.find(query);
            const servicesHome = await cursor.limit(3).toArray();
            res.send(servicesHome);
        });
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = servicesCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.send(service);

        });

        app.get('/reviews', async (req, res) => {
            const query = {}
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews)
        })

        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            console.log(result)
        })
        
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await reviewsCollection.deleteOne(query);
            res.send(result)
        })

        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await reviewsCollection.findOne(query);
            res.send(result)
        })

        app.put('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const review = req.body;
            const options = { upsert: true };
            console.log(review)
            const updatereview = {
                $set: {
                    name: review.name,
                    email: review.email,
                    reviewtext: review.reviewtext,
                    reating: review.reating,
                    title: review.title,
                },
            }
            const result = await reviewsCollection.updateOne(filter, updatereview, options)
            console.log(result)
        })

        app.get('/service-reviews', async (req, res) => {
            let query = {}
            if (req.query.title) {
                query = {
                    title: req.query.title
                }
            }
            const cursor = reviewsCollection.find(query);
            const serviceReviews = await cursor.toArray();
            res.send(serviceReviews);
        })

        app.get('/my-reviews', verfiyJwt, async (req, res) => {
            
            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewsCollection.find(query);
            const myReviews = await cursor.toArray();
            res.send(myReviews)
        })

        app.post('/add-service', async (req, res) => {
            const addService = req.body;
            const result = await servicesCollection.insertOne(addService);
            res.send(result)
        })

    }
    finally {

    }
}
run().catch(error => {
    console.log(error);
})

app.post('/jwt', (req, res) => {
    const user = req.body;
    const token = jwt.sign( user, process.env.ACCESS_TOKEN, {expiresIn: '1h'})
    res.send({token})
})
app.get('/', (req, res) => {
    res.send("my services server is running...");
})

app.listen(port, () => {
    console.log("my services server..")
})