const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors')
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

// middlewarwe
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b7kaf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri)
async function run(){
    try{
        await client.connect();
        console.log('database connet')
        const database = client.db('emajhonShop');
        const productCollection = database.collection('products')
        const orderCollection = database.collection('orders')
        // get products
        app.get('/products',async(req,res)=>{
            const cursor = productCollection.find({})
            const page = req.query.page
            const size = parseInt(req.query.size)
            
            let products;
            const count = await cursor.count();
            if(page){
                products = await cursor.skip(page*size).limit(size).toArray();

            }
            else{
                const products = await cursor.toArray();
            }
            
            
            res.send({
                count,
                products,
            })
        })

        app.post('/products/bykeys',async(req,res)=>{
            console.log(req.body)
            const keys = req.body
            const query = {key:{$in:keys}}
            const products = await productCollection.find(query).toArray()

            res.json(products)
        })

        // add order api
        app.post('/orders',async(req,res)=>{
            const order = req.body;
            const result = await orderCollection.insertOne(order)
            res.json(result)
        })
    }
    finally{

    }
}
run().catch(console.dir)


app.get('/',(req,res)=>{
    res.send('emon jhon ok')
})

app.listen(port,()=>{
    console.log('server running',port)
})