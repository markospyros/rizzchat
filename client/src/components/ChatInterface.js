import React, { useState, useEffect } from "react";
import axios from "axios";

function ChatInterface() {
  // State variables to manage messages and input
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [ws, setWs] = useState(null);

  // useEffect hook for fetching messages and initializing WebSocket
  useEffect(() => {
    // Async function to fetch existing messages from the server
    const fetchMessages = async () => {
      const result = await axios.get("http://your-ip-address/rizzagges/");
      const formattedMessages = result.data.map((msg) => ({
        type: msg.user === "machine" ? "receiver" : "sender",
        text: msg.content,
      }));
      setMessages(formattedMessages);
    };

    // Invoke the fetchMessages function
    fetchMessages();

    // Initialize WebSocket connection
    const websocket = new WebSocket("ws://your-ip-address/ws/");
    websocket.onopen = () => {
      console.log("Connected to the WebSocket");
    };

    // Handle incoming WebSocket messages
    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.type === "response") {
          setMessages((prevMessages) => [
            ...prevMessages,
            { type: "receiver", text: data.content },
          ]);
        }
      } catch (error) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "receiver", text: event.data },
        ]);
      }
    };

    // Store WebSocket object in state
    setWs(websocket);

    // Cleanup function to close WebSocket on unmount
    return () => {
      websocket.close();
    };
  }, []);

  // Function to send a message through WebSocket
  const handleSend = (message) => {
    if (message && ws) {
      ws.send(message);
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "sender", text: message },
      ]);
      setInputMessage("");
    }
  };

  return (
    // Chat interface layout and structure
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col w-full max-w-md bg-white p-4 rounded-lg shadow">
        <div className="flex-1 overflow-y-auto pb-12">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.type === "sender" ? "justify-end" : "justify-start"
              } m-2`}
            >
              <span
                className={`px-3 py-1 rounded-xl ${
                  message.type === "sender"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-black"
                }`}
              >
                {message.text}
              </span>
            </div>
          ))}
        </div>
        <div
          style={{
            position: "fixed",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: 0,
          }}
          className="flex m-2 bg-white shadow-lg max-w-md"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-1 rounded-l-xl border border-gray-300 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={() => handleSend(inputMessage)}
            className="bg-blue-500 text-white px-4 py-1 rounded-r-xl"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
