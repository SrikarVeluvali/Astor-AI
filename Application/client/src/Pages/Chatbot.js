import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import axios from 'axios';
import chatboticon from '../assets/chatbot.png';
import page1 from '../assets/Page1.png';
import page2 from '../assets/Page2.png';
import page3 from '../assets/Page3.png';import usericon from '../assets/user.png';
import { Link } from 'react-router-dom';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [showInstModal, setShowInstModal] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [showChatHistoryModal, setShowChatHistoryModal] = useState(false);
  const [isSessionSelected, setIsSessionSelected] = useState(false);
  // const [currentSession, setCurrentSession] = useState(null);
  const [tempSession, setTempSession] = useState(null);
  const messagesEndRef = useRef(null);
  
  
  const handleCloseModal = () => {
    setShowInstModal(false);
  };
  
  const name = localStorage.getItem('name');
  const firstName = name?.split(' ')[0];
  useEffect(() => {
    document.title = 'Astor AI: Chatbot';
}, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prevMessages) => [...prevMessages, { id: prevMessages.length + 1, text: input, type: "user" }]);
    setInput("");

    if(localStorage.getItem('mode') === '0')
    {
    try {
      const result = await axios.post(`http://127.0.0.1:5000/queryFineTune`, {
        query_text: input,
      });

      setMessages((prevMessages) => [...prevMessages, { id: prevMessages.length + 2, text: result.data.response, type: "bot" }]);
    } catch (error) {
      setMessages((prevMessages) => [...prevMessages, { id: prevMessages.length + 2, text: error.response?.data?.error || 'There was an error processing your request.', type: "bot" }]);
    }
    }

    else {
      try {
        const result = await axios.post(`http://127.0.0.1:5000/queryRAG`, {
          query_text: input,
        });
  
        setMessages((prevMessages) => [...prevMessages, { id: prevMessages.length + 2, text: result.data.response, type: "bot" }]);
      } catch (error) {
        setMessages((prevMessages) => [...prevMessages, { id: prevMessages.length + 2, text: error.response?.data?.error || 'There was an error processing your request.', type: "bot" }]);
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSessionSubmit = (e) => {
    e.preventDefault();
    if (!sessionName.trim()) return;
    setShowModal(false);
    setSessionActive(true);
    setMessages([{ id: 1, text: "Thanks for getting in touch with Astor today! 😊 We are here to help you build your wellness so that you are healthy today and tomorrow.", type: "bot" }]);
  };

  const handleEndSession = async () => {
    const email = localStorage.getItem('email');
    if (!email) {
      console.error('No user email found in local storage.');
      return;
    }

    try {
      await axios.post(`http://127.0.0.1:5000/saveSession`, {
        email,
        sessionName,
        messages
      });
      setSessionActive(false);
    } catch (error) {
      console.error('There was an error ending the session:', error);
    }
  };

  const handleStartNewSession = () => {
    setMessages([]);
    setSessionName("");
    setShowModal(true);
    setIsSessionSelected(false);
  };

  const handleUserIconClick = () => {
    setShowUserMenu((prev) => !prev);
  };
  
  const handleChatHistory = async () => {
    const email = localStorage.getItem('email');
    if (!email) {
      console.error('No user email found in local storage.');
      return;
    }

    try {
      const result = await axios.post(`http://127.0.0.1:5000/getSessions`, { email });
      setSessions(result.data.sessions);
      setShowUserMenu(false);
      setShowChatHistoryModal(true);
      console.log(result)
    } catch (error) {
      console.error('There was an error retrieving the sessions:', error);
    }
  };

  const handleSessionSelect = (selectedSession) => {
    if (sessionActive && !isSessionSelected) {
      setTempSession({ sessionName, messages });
    }
    setMessages(selectedSession.messages);
    setSessionName(selectedSession.sessionName);
    setIsSessionSelected(true);
    setShowModal(false);
    setShowChatHistoryModal(false);
  };

  const handleGoToCurrentSession = () => {
    if (tempSession) {
      setMessages(tempSession.messages);
      setSessionName(tempSession.sessionName);
      setTempSession(null);
      setIsSessionSelected(false);
    }
  };
  const handleLogout = () => {
    localStorage.clear();
  }
  return (
    <div className="chatbot">

      {showInstModal && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
          zIndex: '1000',
          maxWidth: '90%',
          width: '800px', /* Adjusted width for a wider modal */
          maxHeight: '80vh',
          overflowY: 'auto',
          textAlign: 'center', /* Center align content */
          marginTop: '2%',
          paddingTop: '2%'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.5em', marginBottom: '10px', color: '#242424' }}>Welcome to Astor!</h2>
          </div>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <h4 style={{ fontSize: '1.2em', marginBottom: '8px', color: '#333' }}>Step 1: Start a New Session</h4>
            <p style={{ fontSize: '1em', lineHeight: '1.6', color: '#555' }}>
              Click on "Start New Session" to begin your interaction with Astor's chatbot.
            </p>
            <img src={page1} alt="Step 1" style={{ width: '100%', maxWidth: '300px', height: 'auto', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.2)' }} />
          </div>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <h4 style={{ fontSize: '1.2em', marginBottom: '8px', color: '#333' }}>Step 2: Enter the name of your session</h4>
            <p style={{ fontSize: '1em', lineHeight: '1.6', color: '#555' }}>
              Enter the name of your session and press 'Enter'.
            </p>
            <img src={page2} alt="Step 2" style={{ width: '100%', maxWidth: '300px', height: 'auto', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.2)' }} />
          </div>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <h4 style={{ fontSize: '1.2em', marginBottom: '8px', color: '#333' }}>Step 3: Chat with the AI</h4>
            <p style={{ fontSize: '1em', lineHeight: '1.6', color: '#555' }}>
              Type your query in the text box and talk to the AI.
            </p>
            <img src={page3} alt="Step 3" style={{ width: '100%', maxWidth: '300px', height: 'auto', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.2)' }} />
          </div>
          <div style={{ marginTop: '20px' }}>
            <button onClick={handleCloseModal} style={{ backgroundColor: '#242424', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 25px', fontSize: '1em', cursor: 'pointer' }}>
              Got It!
            </button>
          </div>
        </div>
      )}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Enter Your Session Name</h2>
            <form onSubmit={handleSessionSubmit}>
              <input 
                type="text" 
                value={sessionName} 
                onChange={(e) => setSessionName(e.target.value)} 
                placeholder="Session Name" 
              />
              <div className="sesbut">
              <button className="sesbut1" type="submit">Start Session</button>
              <button className="sesbut2" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* {showChatHistoryModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Select a Session</h2>
            <ul>
              {sessions.map((session) => (
                <li key={session.sessionName} onClick={() => handleSessionSelect(session)}>
                  {session.sessionName}
                </li>
              ))}
            </ul>
            <button onClick={() => setShowChatHistoryModal(false)}>Cancel</button>
          </div>
        </div>
      )} */
        showChatHistoryModal && (
        <div className="modal" style={{ position: 'fixed', zIndex: '1', left: '0', top: '0', width: '100%', height: '100%', overflow: 'auto', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="modal-content" style={{ backgroundColor: '#fefefe', padding: '30px', border: '1px solid #ccc', width: '80%', maxWidth: '600px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#242424', fontSize: '1.5em' }}>Select a Session</h2>
            <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
              {sessions.map((session) => (
                <button key={session.sessionName} onClick={() => handleSessionSelect(session)} style={{ display: 'block', width: '100%', padding: '12px', marginBottom: '12px', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', color: '#242424' }}>
                  {session.sessionName}
                </button>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => setShowChatHistoryModal(false)} style={{ padding: '12px 24px', backgroundColor: '#242424', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px', fontSize: '1em' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <header className="navbar">
        <Link to='/'>
          <img src={chatboticon} alt="chatbot-icon" className="logo" />
        </Link>
          <div className='title'>Astor - {((localStorage.getItem("mode") === '0') ? "Flagship" : "Augmented" )}</div>
        <ul>
          <li style={{fontSize:'20px'}}>Session Name: {sessionName}</li>
        </ul>
        <div>
          {sessionActive && isSessionSelected ? (<>
            {/* <button className='end-session' onClick={handleEndSession}>End Session</button> */}
            <button className='end-session' onClick={handleChatHistory}>View Previous Sessions</button>
          </>
            
          ) : ( sessionActive ? (<>
            <button className='end-session' onClick={handleEndSession}>End Session</button>
            {/* <button className='end-session' onClick={handleStartNewSession}>Start New Session</button> */}
            <button className='end-session' onClick={handleChatHistory}>View Previous Sessions</button>
          </>
          ) : (<>
            <button className='end-session' onClick={handleStartNewSession}>Start New Session</button>
            <button className='end-session' onClick={handleChatHistory}>View Previous Sessions</button>
          </>
          ))}
        </div>
        <div className='name'>{firstName}</div>
        <img src={usericon} alt="user-icon" className='toggle-icon' onClick={handleUserIconClick} />
        {showUserMenu && (
          <div className="flex flex-col user-menu">
            <ul className='flex flex-col gap-4'>
              <li>Name: {name}</li>
              
              <Link to='/auth' onClick={handleLogout}>
              <li>Logout</li>
              </Link>
            </ul>
            {/* <button onClick={handleChatHistory}>Show Chat History</button> */}
          </div>
        )}
      </header>
      <div className="chatbot-messages">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.type}`}>
            <p>{message.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chatbot-footer">
        {sessionActive && !isSessionSelected ? (
          <div className="message-input-container">
            <input 
              className="message-input"
              type='text'
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Type your message..." 
            />
            <button className="send-button" onClick={handleSend} disabled={!sessionActive}>Send</button>
          </div>
        ) : (
          !isSessionSelected && <></>
        )}
        {isSessionSelected && sessionActive && (
          <button className="end-session b1" onClick={handleGoToCurrentSession}>Go to Current Session</button>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
