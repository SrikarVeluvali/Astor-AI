import React, { useEffect } from 'react';
import './HomePage.css';
import { Link } from 'react-router-dom';
import { useState } from 'react';
// import axios from 'axios';
import usericon from '../assets/user.png';
import chatboticon from '../assets/chatbot.png';

const HomePage = () => {
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  // const [sessions, setSessions] = useState([]);
  // const [showChatHistoryModal, setShowChatHistoryModal] = useState(false);
  const name = localStorage.getItem('name');
  const firstName = name?.split(' ')[0];
  useEffect(() => {
    document.title = 'Astor AI';
}, []);
  // const handleChatHistory = async () => {
  //   const email = localStorage.getItem('email');
  //   if (!email) {
  //     console.error('No user email found in local storage.');
  //     return;
  //   }

  //   try {
  //     const result = await axios.post(`http://127.0.0.1:5000/getSessions`, { email });
  //     setSessions(result.data.sessions);
  //     setShowUserMenu(false);
  //     setShowChatHistoryModal(true);
  //     console.log(result)
  //   } catch (error) {
  //     console.error('There was an error retrieving the sessions:', error);
  //   }
  // };
  const setMode = (mode) => {
    localStorage.setItem('mode', mode);
  };
  const handleUserIconClick = () => {
    setShowUserMenu((prev) => !prev);
  };
  const handleLogout = () => {
    localStorage.clear();
  }
  
  return (
    <div className="app">
      <header className="navbar">
      <Link to='/'>
          <img src={chatboticon} alt="chatbot-icon" className="logo" />
        </Link>
        <div className="logo">Astor</div>
        <nav className="nav">
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
          </div>
        )}
        </nav>
        
      </header>

      <section className="hero">
        <div className="hero-content">
          <h2> Astor AI <br />A Chatbot For Medical Queries</h2>
          <p>Talk to our one-of-a-kind chatbot for 24/7 assistance in medical queries!</p>
          <Link to="/chatbot" className="">
          <button onClick={() => setMode(0)} className="talkbutton">
              <span className="talkbutton-content">Flagship Model</span>
            </button>
            <button onClick={() => setMode(1)} className="talkbutton">
              <span className="talkbutton-content">Augmented Model</span>
            </button>
</Link>
        </div>
      </section>

      <section className="about-section">
        <div className="section-content">
          <h3>About the Website</h3>
          <p>Welcome to the AstorAI website, your gateway to accurate and reliable medical information. Our user-friendly interface and retrieval augmented generation make it easy for you to navigate and find the answers you need. Engage with AstorAI through our interactive chatbot for real-time, detailed responses to your medical questions. We prioritize your privacy and security, ensuring all interactions and personal information are kept confidential. Explore & Discover how AstorAI can assist you on your health journey.</p>
        </div>
      </section>

      <section className="features-section">
        <div className="section-content">
          <h3>Features of Chatbot</h3>
          <p>Discover how our chatbot can assist you:</p>
          <div className="features-list">
            <div className="feature-card">
              <h4>Medical Information</h4>
              <p>AstorAI provides reliable answers to a wide range of medical questions, leveraging the power of the advanced LLama 3 model and a <a style={{textDecoration:'none', color: 'black', fontStyle:'italic', fontWeight:'bold'}} href="https://huggingface.co/datasets/lavita/ChatDoctor-HealthCareMagic-100k" target='blank'>custom-trained dataset</a>.</p>
            </div>
            <div className="feature-card">
              <h4>Real-Time Responses</h4>
              <p>Get immediate, detailed responses to your queries with AstorAI's interactive chatbot, available 24/7 to assist you whenever you need it.</p>
            </div>
            <div className="feature-card">
              <h4>User-Friendly Interface</h4>
              <p>Our chatbot is designed with simplicity in mind, offering a clean and intuitive interface that makes it easy to ask questions and receive answers.</p>
            </div>
            <div className="feature-card">
              <h4>Privacy and Security</h4>
              <p>AstorAI prioritizes your privacy, ensuring that only you can view your, so you can trust that your information is secure.</p>
            </div>
            <div className="feature-card">
              <h4>Wide Range of Topics</h4>
              <p>From symptoms and treatments to medications and general health advice, AstorAI covers a broad spectrum of medical topics to help you find the information you need.</p>
            </div>
          </div>
        </div>
      </section>

      

      <section className="team-section">
        <div className="section-content">
          <h3>Team Description</h3>
          <p>Meet our dedicated team members who ensure your care and support.</p>
          <div className="team-members">
            <div className="team-member">
              <h4>Srikar Veluvali</h4>
              <div className="contact-info">
              <a href="https://github.com/SrikarVeluvali">GitHub</a>
              </div>
            </div>
            <div className="team-member">
              <h4>Anpur Phani Charan</h4>
              <div className="contact-info">
              <a href="https://github.com/Anpur2005">GitHub</a>
              </div>
            </div>
            <div className="team-member">
              <h4>Aka Meher Archana</h4>
              <div className="contact-info">
              <a href="https://github.com/Meher-10">GitHub</a>
              </div>
            </div>
            <div className="team-member">
              <h4>Vardhan Udayagiri</h4>
              <div className="contact-info">
              <a href="https://github.com/vardhan-21505">GitHub</a>
              </div>
            </div>
            <div className="team-member">
              <h4>Sesha Sai Pratiek Yeggina</h4>
              <div className="contact-info">
              <a href="https://github.com/PR4TIEK">GitHub</a>
              </div>
            </div>
            <div className="team-member">
              <h4>Srikar Narsingoju</h4>
              <div className="contact-info">
                <a href="https://github.com/N-Srikar">GitHub</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <p>© 2024 AstorAI. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;
