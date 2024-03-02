import { useEffect, useState } from 'react';
import './App.css'; // Import the CSS file for styling

function App() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3002');

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    return () => {
      ws.close();
    };
  }, []);

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    // const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString();
    return `${formattedTime}`;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Real-time Updates</h1>
      </header>
      <div className="grid-container">
        {messages.map((msg, index) => (
          <div className="grid-item" key={index}>
            <div className="message">
              <h3 className="message-name">{msg.name}</h3>
              <p className="message-item">Item: {msg.item}</p>
              <p className="message-timestamp">Time: {formatTimestamp(msg.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;