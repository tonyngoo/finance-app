import React, { useState, type KeyboardEvent } from 'react';
import ReactMarkdown from 'react-markdown';

import { getGeminiResponse } from 'loot-core/server/ai-handler/gemini-ai-handler';

import { styles } from '../../style';
import { Button } from '../common/Button2';
import { Input } from '../common/Input';
import { View } from '../common/View';

type Message = {
  role: 'user' | 'ai'; // We use these to determine the types of messages being sent/received
  text: string;
};

export function AiChat(): JSX.Element {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showDisclaimer, setShowDisclaimer] = useState(true); // NEW STATE
  const [recommendationsVisible, setRecommendationsVisible] = useState(true); // Track visibility of recommendations
  const [isThinking, setIsThinking] = useState(false); // Track AI thinking state

  // Handles the API Response that turns into an AI Chat Message
  // displayed to the user
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    if (showDisclaimer) setShowDisclaimer(false); // HIDE DISCLAIMER

    const userMessage: Message = { role: 'user', text: message };
    setMessages(prev => [...prev, userMessage]);

    setMessage('');
    setIsThinking(true); // Set thinking to true when the message is sent

    try {
      // Include the entire conversation history in the message sent to the AI
      const conversationHistory = messages
        .map(msg => `${msg.role}: ${msg.text}`)
        .join('\n');
      const fullMessage = `${conversationHistory}\nuser: ${message}`;

      const response = await getGeminiResponse(fullMessage);
      const aiMessage: Message = { role: 'ai', text: response.message };
      setMessages(prev => [...prev, aiMessage]);
      setIsThinking(false); // Set thinking to false once the response is received
    } catch (error) {
      console.error('Error fetching Gemini AI response:', error);
      setIsThinking(false); // Set thinking to false in case of an error
    }
  };

  const handleRecommendedQuestion = async (question: string) => {
    const userMessage: Message = { role: 'user', text: question };
    setMessages(prev => [...prev, userMessage]);

    setMessage('');
    setRecommendationsVisible(false); // Hide recommendations once the user clicks one
    setIsThinking(true); // Set thinking to true when the message is sent

    if (showDisclaimer) setShowDisclaimer(false); // HIDE DISCLAIMER

    try {
      // Include the entire conversation history in the message sent to the AI
      const conversationHistory = messages
        .map(msg => `${msg.role}: ${msg.text}`)
        .join('\n');
      const fullMessage = `${conversationHistory}\nuser: ${question}`;

      const response = await getGeminiResponse(fullMessage);
      const aiMessage: Message = { role: 'ai', text: response.message };
      setMessages(prev => [...prev, aiMessage]);
      setIsThinking(false); // Set thinking to false once the response is received
    } catch (error) {
      console.error('Error fetching Gemini AI response:', error);
      setIsThinking(false); // Set thinking to false in case of an error
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <View
      style={{
        ...styles.page,
        paddingLeft: 8,
        paddingRight: 8,
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {showDisclaimer && (
          <div
            style={{
              backgroundColor: '#283c54', // Matching the page color scheme
              color: '#fff',
              padding: '20px',
              borderRadius: '10px',
              textAlign: 'center',
              fontSize: '16px',
              fontWeight: 'bold',
              margin: '0', // Remove margins
              position: 'absolute', // Use absolute positioning
              top: '50%', // Vertically center
              left: '50%', // Horizontally center
              transform: 'translate(-50%, -50%)', // Adjust for exact centering
              width: '70%',
              maxWidth: '80%', // Limit the width to avoid it being too wide
            }}
          >
            <div
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '10px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <i
                className="fas fa-exclamation-triangle"
                style={{
                  marginRight: '10px',
                  fontSize: '28px',
                  color: 'yellow',
                }}
              />
              Disclaimer:
            </div>
            <div style={{ fontSize: '22px', fontWeight: 'normal' }}>
              Budget AI generates financial tips with the assistance of Google
              Gemini’s artificial intelligence. Avoid the use of sensitive and
              confidential information and send personal information at your own
              risk as the data is sent to Google. While we strive for relevance
              and accuracy, please note that Budget AI is not a substitute for
              professional financial advice. Use at your own risk and consult a
              professional for financial decisions.
            </div>
          </div>
        )}

        <div style={{ flexGrow: 1, overflow: 'auto', padding: '16px' }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                width: '100%',
              }}
            >
              <div
                style={{
                  backgroundColor: msg.role === 'user' ? '#283c54' : '#e0e0e0',
                  color: msg.role === 'user' ? '#fff' : '#000',
                  padding: '10px 14px',
                  borderRadius: '18px',
                  marginBottom: '8px',
                  maxWidth: '60%',
                  wordWrap: 'break-word',
                  display: 'inline-block',
                  fontSize: '16px',
                }}
              >
                <ReactMarkdown
                  components={{
                    p: ({ node, ...props }) => (
                      <p style={{ margin: 0 }} {...props} />
                    ),
                    a: ({ node, ...props }) => (
                      <a
                        style={{
                          color: msg.role === 'user' ? '#ffea00' : '#007bff',
                          textDecoration: 'underline',
                        }}
                        aria-label="Enter"
                        {...props}
                      />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong
                        style={{
                          color: msg.role === 'user' ? '#ffd700' : '#333',
                        }}
                        {...props}
                      />
                    ),
                    em: ({ node, ...props }) => (
                      <em
                        style={{
                          color: msg.role === 'user' ? '#ffcc00' : '#555',
                        }}
                        {...props}
                      />
                    ),
                    code: ({ node, ...props }) => (
                      <code
                        style={{
                          backgroundColor:
                            msg.role === 'user' ? '#0056b3' : '#d0d0d0',
                          color: msg.role === 'user' ? '#ffdd57' : '#333',
                          padding: '2px 5px',
                          borderRadius: '4px',
                          fontSize: '0.9em',
                        }}
                        {...props}
                      />
                    ),
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {/* Show "Budget AI is thinking..." when isThinking is true */}
          {isThinking && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '10px',
                fontSize: '18px',
                color: '#ffffff',
                font: 'bold',
                fontStyle: 'italic',
              }}
            >
              Budget AI is thinking...
            </div>
          )}
        </div>

        {recommendationsVisible && ( // Conditionally render recommendations
          <div
            style={{
              marginBottom: '4px',
              marginLeft: '15px',
            }}
          >
            <h2>Need some ideas? Try asking:</h2>
            <div>
              <button
                onClick={() =>
                  handleRecommendedQuestion('What are some ways to save money?')
                }
                style={{
                  backgroundColor: '#283c54',
                  color: '#fff',
                  padding: '10px 15px',
                  borderRadius: '18px',
                  marginBottom: '8px',
                  marginRight: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  maxWidth: '60%',
                  wordWrap: 'break-word',
                  display: 'inline-block',
                  fontSize: '16px',
                }}
              >
                What are some ways to save money?
              </button>
              <button
                onClick={() =>
                  handleRecommendedQuestion('How can I start investing?')
                }
                style={{
                  backgroundColor: '#283c54',
                  color: '#fff',
                  padding: '10px 15px',
                  borderRadius: '18px',
                  marginBottom: '8px',
                  marginRight: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  maxWidth: '60%',
                  wordWrap: 'break-word',
                  display: 'inline-block',
                  fontSize: '16px',
                }}
              >
                How can I start investing?
              </button>
              <button
                onClick={() =>
                  handleRecommendedQuestion(
                    'What is a budget and how do I create one?',
                  )
                }
                style={{
                  backgroundColor: '#283c54',
                  color: '#fff',
                  padding: '10px 15px',
                  borderRadius: '18px',
                  marginBottom: '8px',
                  marginRight: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  maxWidth: '60%',
                  wordWrap: 'break-word',
                  display: 'inline-block',
                  fontSize: '16px',
                }}
              >
                How can I start budgeting?
              </button>
            </div>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px',
          }}
        >
          <Input
            type="text"
            style={{
              flexGrow: 1,
              borderRadius: '10px',
              marginRight: '8px',
              fontSize: '16px',
              padding: '12px 16px',
            }}
            placeholder="Ask me finance tips!"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyPress} // Listener for enter key
          />
          <Button
            style={{
              padding: '12px 16px',
              fontSize: '16px',
            }}
            onPress={handleSendMessage}
          >
            Send
          </Button>
        </div>
      </div>
    </View>
  );
}

export default AiChat;
