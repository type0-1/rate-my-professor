import Chatbot from './components/chatbot';

export default function Home() {
  return (
    <div>
      <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Chatbot />
      </main>
    </div>
  );
}
