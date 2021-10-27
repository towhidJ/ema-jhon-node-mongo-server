const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT||5000;

//middelwere
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5cmdn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('online_shop');
        const productCollection = database.collection('products');
        const ordersCollection = database.collection('orders');


        //Get Products
        app.get('/products',async (req,res)=>{
            const cursor = productCollection.find({});
            const count =await cursor.count();
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let products;
            if (page)
            {
                products = await cursor.skip(page*size).limit(size).toArray();
            }
            else {
                products =await cursor.toArray();
            }


            res.send({
                count,
                products});
        })


        //use post to Get Products By Key
        app.post('/products/byKeys',async (req,res)=>{
            const keys = req.body;
            const query = {key:{$in:keys}}
            const products = await productCollection.find(query).toArray();
            res.json(products)
        })


        //Orders
        app.post('/orders',async (req,res)=>{
            const data = req.body;
            const order = await ordersCollection.insertOne(data);
            res.json(order);
        })
    }
    finally
    {

    }
}

run().catch(console.dir)

app.get('/', (req,res)=>{

    res.send("Server start");
})
app.listen(port,()=>{
    console.log('port listening at ',port)
})