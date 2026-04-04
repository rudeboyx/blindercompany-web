"use client";
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: '¡Hola! Soy el asistente de Blinder Company. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [stockData, setStockData] = useState([]);
  const [currentSuggestion, setCurrentSuggestion] = useState('');
  const [isSuggestionVisible, setIsSuggestionVisible] = useState(false);
  const [isVibrating, setIsVibrating] = useState(true);

  const chatBodyRef = useRef(null);
  const suggestionInterval = useRef(null);

  const suggestions = [
    "Hace frío 🥶 ? Climaticemos tu hogar",
    "Hace calor 🥵 ? te instalamos un Split de aire",
    "Protegemos tus espacios de los amigos de lo ajeno 🥷🏻"
  ];

  useEffect(() => {
    loadStock();
    startSuggestions();
    return () => clearInterval(suggestionInterval.current);
  }, []);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const loadStock = async () => {
    try {
      const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vS_p0-S96_9f9v9_9f9v9_9f9v9_9f9v9_9f9v9_9f9v9_9f9v9_9f9v9_9f9v9_9f9v9/pub?output=csv');
      const data = await response.text();
      const rows = data.split('\n').slice(1);
      const parsed = rows.map(row => {
        const cols = row.split(',');
        return {
          nombre: cols[0],
          tipo: cols[1],
          capacidad: cols[2],
          stock: cols[3],
          valor: cols[4]
        };
      });
      setStockData(parsed);
    } catch (error) {
      console.error('Error loading stock:', error);
    }
  };

  const startSuggestions = () => {
    let index = 0;
    suggestionInterval.current = setInterval(() => {
      setIsSuggestionVisible(false);
      setTimeout(() => {
        setCurrentSuggestion(suggestions[index]);
        setIsSuggestionVisible(true);
        index = (index + 1) % suggestions.length;
      }, 500);
    }, 5000);
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    setIsVibrating(false);
    setIsSuggestionVisible(false);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMsg = { role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    
    const query = inputValue.toLowerCase();
    setInputValue('');

    setTimeout(() => {
      const stopWords = ['busco', 'necesito', 'quiero', 'tienen', 'hay', 'un', 'una', 'de', 'el', 'la', 'en', 'para'];
      const cleanQuery = query.split(' ').filter(word => !stopWords.includes(word)).join(' ');
      
      const results = stockData.filter(item => {
        const nameMatch = item.nombre.toLowerCase().includes(cleanQuery);
        const capacityMatch = item.capacidad.toLowerCase().replace(/\./g, '').includes(cleanQuery.replace(/\./g, ''));
        return nameMatch || capacityMatch;
      });

      let botResponse = '';
      if (results.length > 0) {
        botResponse = 'He encontrado lo siguiente en nuestro inventario:\n\n' + 
          results.map(item => `📦 **${item.nombre}**\n• Tipo: ${item.tipo}\n• Capacidad: ${item.capacidad}\n• Stock: ${item.stock} unidades\n• Valor: ${item.valor}`).join('\n\n') +
          '\n\n¿Te gustaría solicitar una cotización formal?';
      } else {
        botResponse = 'Actualmente no encuentro ese modelo específico en stock, pero podemos importarlo o buscar una alternativa. ¿Te gustaría hablar con un técnico?';
      }

      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    }, 800);
  };

  return (
    <div style={{ backgroundColor: '#00050a', color: 'white', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Estilos Globales */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .vibrate {
          animation: pulse 1.5s infinite;
        }

        .suggestion-bubble {
          position: fixed;
          bottom: 115px;
          right: 30px;
          background: white;
          color: #1a1a1a;
          padding: 14px 24px;
          border-radius: 50px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          max-width: 400px;
          z-index: 10000;
          transition: all 0.5s ease;
          opacity: 0;
          transform: translateY(20px);
          visibility: hidden;
          border: 1px solid rgba(255, 45, 85, 0.2);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .suggestion-bubble.visible {
          opacity: 1;
          transform: translateY(0);
          visibility: visible;
        }

        .suggestion-bubble::after {
          content: "";
          position: absolute;
          bottom: -8px;
          right: 40px;
          width: 15px;
          height: 15px;
          background: white;
          transform: rotate(45deg);
          border-right: 1px solid rgba(255, 45, 85, 0.2);
          border-bottom: 1px solid rgba(255, 45, 85, 0.2);
        }
      `}</style>

      {/* Header / Nav */}
      <nav style={{ padding: '24px 0', position: 'fixed', width: '100%', top: 0, z-index: 1000, background: 'rgba(0, 5, 10, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="assets/blinder-logo-ultra-final-v8.png?v=1.8" alt="Logo" style={{ height: '45px', background: 'white', padding: '5px', borderRadius: '8px' }} />
          </div>
          <div style={{ display: 'flex', gap: '32px' }}>
            <a href="#servicios" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 600 }}>Servicios</a>
            <a href="#nosotros" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 600 }}>Nosotros</a>
            <a href="#contacto" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 600 }}>Contacto</a>
          </div>
          <a href="mailto:blinderspa@gmail.com" style={{ background: '#00f2ff', color: '#00050a', padding: '12px 24px', borderRadius: '12px', textDecoration: 'none', fontWeight: 800 }}>Cotizar proyecto</a>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ padding: '180px 24px 100px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '80px', alignItems: 'center' }}>
          <div>
            <span style={{ padding: '8px 16px', background: 'rgba(0, 242, 255, 0.1)', color: '#00f2ff', borderRadius: '100px', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase' }}>Ingeniería • Climatización • Seguridad</span>
            <h1 style={{ fontSize: '4rem', fontWeight: 800, margin: '24px 0', lineHeight: 1.1, background: 'linear-gradient(to right, #fff, #00f2ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Soluciones de ingeniería para empresas que necesitan resultados.</h1>
            <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', marginBottom: '48px' }}>En Blinder Company desarrollamos soluciones en climatización, seguridad electrónica y soporte técnico para empresas que exigen orden, eficiencia y una ejecución confiable.</p>
            <div style={{ display: 'flex', gap: '20px' }}>
              <a href="https://wa.me/56981260066" style={{ background: '#00f2ff', color: '#00050a', padding: '16px 32px', borderRadius: '12px', textDecoration: 'none', fontWeight: 800 }}>Hablar por WhatsApp</a>
              <a href="#servicios" style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '16px 32px', borderRadius: '12px', textDecoration: 'none', fontWeight: 800 }}>Ver servicios</a>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {['Respuesta comercial clara', 'Implementación ordenada', 'Soporte y seguimiento'].map((title, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '32px', borderRadius: '24px' }}>
                <h3 style={{ color: '#00f2ff', marginBottom: '12px' }}>{title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>{i === 0 ? 'Atención rápida para clientes que buscan una propuesta seria y bien presentada.' : i === 1 ? 'Ejecución técnica enfocada en terminaciones, seguridad y buena presencia operativa.' : 'Acompañamiento para que cada proyecto tenga continuidad y respaldo.'}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Chatbot Widget */}
      <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 10000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        {/* Suggestion Bubble */}
        <div className={`suggestion-bubble ${isSuggestionVisible ? 'visible' : ''}`}>
          {currentSuggestion}
        </div>

        {/* Chat Window */}
        {isChatOpen && (
          <div style={{ width: '350px', height: '500px', background: '#001529', borderRadius: '20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ background: '#00f2ff', padding: '20px', color: '#00050a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontWeight: 800 }}>🤖 Asistente Blinder IA</h4>
              <button onClick={toggleChat} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            <div ref={chatBodyRef} style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ padding: '10px 15px', borderRadius: '15px', maxWidth: '85%', fontSize: '0.9rem', alignSelf: msg.role === 'bot' ? 'flex-start' : 'flex-end', background: msg.role === 'bot' ? 'rgba(255,255,255,0.05)' : '#00f2ff', color: msg.role === 'bot' ? 'white' : '#00050a', borderBottomLeftRadius: msg.role === 'bot' ? '2px' : '15px', borderBottomRightRadius: msg.role === 'user' ? '2px' : '15px', whiteSpace: 'pre-wrap' }}>
                  {msg.text}
                </div>
              ))}
            </div>
            <div style={{ padding: '15px', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '10px' }}>
              <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Escribe tu mensaje..." style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', color: 'white', outline: 'none' }} />
              <button onClick={handleSend} style={{ background: '#00f2ff', border: 'none', padding: '0 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>➤</button>
            </div>
          </div>
        )}

        {/* Chat Button */}
        <div onClick={toggleChat} className={isVibrating ? 'vibrate' : ''} style={{ width: '65px', height: '65px', background: '#00f2ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0, 242, 255, 0.4)', fontSize: '1.8rem' }}>
          🤖
        </div>
      </div>

      {/* WhatsApp Button */}
      <a href="https://wa.me/56981260066" style={{ position: 'fixed', bottom: '110px', right: '32px', width: '60px', height: '60px', background: '#25d366', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontSize: '2rem', boxShadow: '0 10px 30px rgba(37, 211, 102, 0.3)', zIndex: 999, transition: 'all 0.3s' }}>
        ✆
      </a>
    </div>
  );
}
"
