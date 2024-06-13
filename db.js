const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://mohitraipr:hbci0CisMVtokc61@cluster0.8ltm7y4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {    
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});

client.connect(err => {
    if (err) {
        console.error('Failed to connect to MongoDB Atlas:', err);
    } else {
        console.log('Connected to MongoDB Atlas');
    }
});

module.exports = client;
