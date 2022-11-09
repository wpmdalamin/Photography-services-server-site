const express = require('express');
const cors = require('cors');
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

        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            console.log(result)
        })
        app.get('/reviews', async (req, res) => {
            const query = {}
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews)
        })
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) }
            const result = await reviewsCollection.deleteOne(query);
            console.log(result)
            res.send(result)
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


        app.get('/my-reviews', async (req, res) => {
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
            console.log(addService);
            const result = await servicesCollection.insertOne(addService);
            console.log(result)
        })



    }
    finally {

    }
}
run().catch(error => {
    console.log(error);
})

app.get('/', (req, res) => {
    res.send("my services server is running...");
})

app.listen(port, () => {
    console.log("my services server..")
})