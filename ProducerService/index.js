// Import necessary libraries
const express = require('express');
const amqp = require('amqplib');
require('dotenv').config();
// Initialize an Express application
const app = express();
const PORT = 8000;

// Define the RabbitMQ server URL and the queue name
const rabbitMqUrl = process.env.AMQP_URL;

const queue = 'Task';

// Array of  names
const names = ['John', 'Alice', 'Michael', 'Sophia', 'David', 'Emma', 'James', 'Olivia', 'William', 'Ava'];
// Array of  items
const items = ['phone', 'laptop', 'tablet', 'smartwatch', 'camera', 'headphones', 'speaker'];

// Function to get a random name from the array
function getRandomName() {
  return names[Math.floor(Math.random() * names.length)];
}
// Function to get a random items from the array
function getRandomItem() {
    return items[Math.floor(Math.random() * items.length)];
  }
// Function to generate a random timestamp within a range
function getRandomTimestamp(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate random order data
const orderdata=()=>(
    {
  id: Math.floor(Math.random() * 1000), // Generate a random ID
  name: getRandomName(), // Generate a random name
  item: getRandomItem(), // Generate a random item
  timestamp: getRandomTimestamp(new Date(2020, 0, 1), new Date()) 
}
);

app.get('/send-to-queue', async (req, res) => {
    try {
        const connection = await amqp.connect(rabbitMqUrl);
        const channel = await connection.createChannel();
        await channel.assertQueue(queue);
        
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(orderdata())));
        
        console.log("Message sent to queue:");
        res.send("Message sent to RabbitMQ queue.");
    } catch (error) {
        console.log(error);
        res.status(500).send("Failed to send message.");
    }
});


// Start the HTTP server
app.listen(PORT, () => console.log(`Service B running on port ${PORT}`));