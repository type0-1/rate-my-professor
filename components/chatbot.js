"use client";

import { useState } from 'react';
import styles from './chatbot.module.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = { sender: 'user', text: input };
    setMessages([...messages, userMessage]);

    // Placeholder bot response
    const botMessage = { sender: 'bot', text: 'This is a placeholder response' };
    setMessages((prevMessages) => [...prevMessages, botMessage]);
    setInput('');
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>AI Rate My Professor</h2>
      </div>
      <div className={styles.chatBox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={styles.message}
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.sender === 'user' ? '#4f46e5' : '#e4e7eb',
              color: msg.sender === 'user' ? '#fff' : '#333',
              boxShadow: msg.sender === 'user' ? '0 4px 14px 0 rgba(31, 38, 135, 0.37)' : '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className={styles.inputContainer}>
        <input
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message..."
        />
        <button className={styles.button} onClick={handleSendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
