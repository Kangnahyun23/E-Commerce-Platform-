import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import AIChatBox from '../chat/AIChatBox';

export default function Layout() {
  const [aiChatOpen, setAiChatOpen] = useState(false);

  useEffect(() => {
    const openChat = () => setAiChatOpen(true);
    window.addEventListener('open-ai-chat', openChat);
    return () => window.removeEventListener('open-ai-chat', openChat);
  }, []);

  return (
    <>
      <Navbar onOpenAIChat={() => setAiChatOpen(true)} />
      <main>
        <Outlet />
      </main>
      <Footer onOpenAIChat={() => setAiChatOpen(true)} />
      <AIChatBox open={aiChatOpen} onClose={() => setAiChatOpen(false)} />
    </>
  );
}
