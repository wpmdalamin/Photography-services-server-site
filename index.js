const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express();
app.use(cors())
app.use(express.json());


const user = "mdphotography";
const password = "6gcPLg4U1o68YCkF";

const uri = `mongodb+srv://${user}:${password}@cluster0.hdi07kd.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const servicesCollection = client.db('photography-services').collection('services');
        const reviewsCollection = client.db('photography-services').collection('reviews');
        app.get('/services-home', async(req, res) => {
            const query = {}
            const cursor = servicesCollection.find(query);
            const servicesHome = await cursor.limit(3).toArray();
            res.send(servicesHome);
        });
        app.get('/services', async(req, res) => {
            const query = {}
            const cursor = servicesCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/services/:id', async(req, res) => {
            const id = req.params.id;
            console.log("services id md",id);
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            console.log(service);
            res.send(service);

        });

        app.post('/review', async(req, res) => {
            const review = req.body;
            console.log(review);
            const result = await reviewsCollection.insertOne(review);
            console.log(result)
        })



    }
    finally{

    }
}
run().catch(error => {
    console.log(error);
})

app.get('/', (req, res)=> {
    res.send("my services server is running...");
})

app.listen(port, () => {
    console.log("my services server..")
})