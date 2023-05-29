const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.luk9jtm.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();



    const userCollections = client.db("bistroBD").collection("user");
    const menuCollection = client.db("bistroBD").collection("menu");
    const reviewCollection = client.db("bistroBD").collection("reviews");
    const cardsCollection = client.db("bistroBD").collection("cards");

    // user collection

    app.get('/user', async (req, res) => {
      const result = await userCollections.find().toArray();
      res.send(result);
    })

    app.post('/users', async (req, res) => {
      const user = req.body;
      console.log(user);
      const query = { email: user.email }
      const existingUser = await userCollections.findOne(query);
      console.log("existing user: " + existingUser);
      if (existingUser) {
        return res.send({message: 'user already exists'})
      }
      const result = await userCollections.insertOne(user)
      res.send(result)
    })


    app.get('/menu', async (req, res) => {
      const result = await menuCollection.find().toArray();
      res.send(result);
    })

    app.get('/review', async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    })

    // cart collection

    app.get('/carts', async (req, res) => { 
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await cardsCollection.find(query).toArray();
      res.send(result);
    })


    app.post('/carts', async (req, res) => { 
      const item = req.body;
      // console.log(item);
      const result = await cardsCollection.insertOne(item);
      res.send(result);
    })

    app.delete('/carts/:id', async (req, res) => { 
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cardsCollection.deleteOne(query);
      res.send(result);
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('boss is running')
})

app.listen(port, () => {
  console.log(`Bistro boss running on ${port}`);
})