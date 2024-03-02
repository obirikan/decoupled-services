// // Import necessary libraries
// const WebSocket = require('ws');
// const express = require('express');
// const amqp = require('amqplib');
// require('dotenv').config();

// // Initialize an Express application
// const app = express();
// const PORT = 3002;

// // Create a new WebSocket server that doesn't attach itself automatically to an HTTP server
// const wss = new WebSocket.Server({ noServer: true });

// // Define the RabbitMQ server URL and the data to be sent
// const rabbitMqUrl = process.env.AMQP_URL;
// const message = "hello";
// const queue = 'real';

// /**
//  * Connects to RabbitMQ, sets up a consumer for a specified queue, and 
//  * broadcasts any received messages to all connected WebSocket clients.
//  */

// async function connectRabbitMQ() {
//   try {
//     // Establish a connection to RabbitMQ
//     const connection = await amqp.connect(rabbitMqUrl); 
//     // Create a channel on this connection
//     const channel = await connection.createChannel(); 

//     // Ensure the queue exists, if not it's created
//     await channel.assertQueue(queue);

//     // Listen for messages on the queue, broadcasting any received messages to WebSocket clients
//     channel.consume(queue, (msg) => {
//         console.log(`Received message from RabbitMQ: ${msg.content.toString()}`)
//       wss.clients.forEach((client) => {
//         if (client.readyState === WebSocket.OPEN) {
//           console.log(`Received message from RabbitMQ: ${msg.content.toString()}`);
//           client.send(msg.content.toString()); 
//         }
//       });
//     }, {
//       noAck: true 
//     });

//     console.log('Connected to RabbitMQ, awaiting messages...');
//   } catch (error) {
//     console.error('Failed to connect to RabbitMQ', error);
//   }
// }
// // Call the function to connect to RabbitMQ and set up the message consumer
// connectRabbitMQ();

// /**
//  * Define a route for the Express application. When this route is accessed,
//  * a message is sent to the specified RabbitMQ queue.
//  */

// // Start the HTTP server and listen on the specified port
// const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// /**
//  * Handle the HTTP upgrade requests to WebSocket. This is necessary because the WebSocket
//  * server was created with noServer: true, meaning it doesn't automatically handle upgrade requests.
//  */
// server.on('upgrade', (request, socket, head) => {
//   // Use the WebSocket server to handle the upgrade request
//   wss.handleUpgrade(request, socket, head, (ws) => {
//     // Emit a 'connection' event on successful WebSocket connection
//     wss.emit('connection', ws, request);
//   });
// });

// Import necessary libraries
const WebSocket = require('ws');
const express = require('express');
const amqp = require('amqplib');
require('dotenv').config();

// Initialize an Express application and WebSocket server
const app = express();
const PORT = 3002; // Port for the HTTP server
const wss = new WebSocket.Server({ noServer: true });

// Define the RabbitMQ server URL and the queue name
const rabbitMqUrl = process.env.AMQP_URL;
const queue = 'Task';

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(rabbitMqUrl);
        const channel = await connection.createChannel();
        await channel.assertQueue(queue);

        channel.consume(queue, (msg) => {
                const messageContent = msg.content.toString();

                // Broadcast message to all connected WebSocket clients
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(messageContent);
                        console.log(`Received message from RabbitMQ and sent: ${messageContent}`);
                    }
                });
        });

        console.log('Connected to RabbitMQ, awaiting messages...');
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
    }
}

connectRabbitMQ();

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});