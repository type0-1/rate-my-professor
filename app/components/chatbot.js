"use client";

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './chatbot.module.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! How can I assist you in finding the best professors today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = { role: 'user', content: input };

    // Add the user's message to the chat
    setMessages((messages) => [
      ...messages,
      userMessage,
      { role: 'assistant', content: '' },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, userMessage]),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';

      const processText = ({ done, value }) => {
        if (done) return result;

        const text = decoder.decode(value || new Uint8Array(), { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
        return reader.read().then(processText);
      };

      await reader.read().then(processText);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: 'There was an error processing your request.' },
      ]);
    }

    setInput(''); // Clear the input field
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
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.role === 'user' ? '#4f46e5' : '#e4e7eb',
              color: msg.role === 'user' ? '#fff' : '#333',
              boxShadow: msg.role === 'user' ? '0 4px 14px 0 rgba(31, 38, 135, 0.37)' : '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
            }}
          >
            <ReactMarkdown>{msg.content}</ReactMarkdown>
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
