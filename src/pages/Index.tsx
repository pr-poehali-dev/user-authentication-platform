import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';

// ─── Types ───────────────────────────────────────────────────────────────────
type Screen = 'auth' | 'app';
type AuthTab = 'login' | 'register';
type AppSection = 'chats' | 'contacts' | 'groups' | 'channels' | 'gifts' | 'notifications' | 'settings' | 'profile';

interface User {
  id: number;
  name: string;
  username: string;
  avatar: string;
  online: boolean;
  premium: boolean;
  diamonds: number;
  bio?: string;
}

interface Message {
  id: number;
  text: string;
  time: string;
  out: boolean;
  read: boolean;
}

interface Chat {
  id: number;
  user: User;
  lastMessage: string;
  time: string;
  unread: number;
  pinned?: boolean;
  typing?: boolean;
}

interface Gift {
  id: number;
  name: string;
  emoji: string;
  price: number;
  color: string;
  description: string;
}

interface Notification {
  id: number;
  type: 'message' | 'gift' | 'mention' | 'join' | 'premium';
  text: string;
  time: string;
  read: boolean;
  avatar?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockUsers: User[] = [
  { id: 1, name: 'Алиса Кравцова', username: 'alice_k', avatar: '👩‍💻', online: true, premium: true, diamonds: 1200, bio: 'Дизайнер интерфейсов' },
  { id: 2, name: 'Максим Орлов', username: 'max_o', avatar: '🧑‍🚀', online: true, premium: false, diamonds: 340, bio: 'Разработчик и геймер' },
  { id: 3, name: 'Соня Белова', username: 'sonya_b', avatar: '👩‍🎨', online: false, premium: true, diamonds: 2100, bio: 'Художник-иллюстратор' },
  { id: 4, name: 'Дима Нечаев', username: 'dima_n', avatar: '🧑‍💼', online: true, premium: false, diamonds: 150, bio: 'Менеджер проектов' },
  { id: 5, name: 'Катя Лисицына', username: 'katya_l', avatar: '👩‍🔬', online: false, premium: true, diamonds: 850, bio: 'Data scientist' },
  { id: 6, name: 'Артём Волков', username: 'artem_v', avatar: '🧑‍🎸', online: true, premium: false, diamonds: 60, bio: 'Музыкант' },
];

const mockChats: Chat[] = [
  { id: 1, user: mockUsers[0], lastMessage: 'Только что смотрела твой проект — огонь! 🔥', time: '12:41', unread: 3, pinned: true, typing: true },
  { id: 2, user: mockUsers[1], lastMessage: 'Окей, встретимся в 18:00', time: '11:20', unread: 0 },
  { id: 3, user: mockUsers[2], lastMessage: 'Отправила тебе новые иллюстрации', time: 'вчера', unread: 1 },
  { id: 4, user: mockUsers[3], lastMessage: 'Дедлайн перенесли на пятницу', time: 'вчера', unread: 0 },
  { id: 5, user: mockUsers[4], lastMessage: 'Модель обучилась на 94%! 🎉', time: 'пн', unread: 7 },
  { id: 6, user: mockUsers[5], lastMessage: 'Слышал новый трек?', time: 'пн', unread: 0 },
];

const mockMessages: Message[] = [
  { id: 1, text: 'Привет! Как дела?', time: '11:00', out: false, read: true },
  { id: 2, text: 'Всё отлично, спасибо! Работаю над новым дизайном', time: '11:01', out: true, read: true },
  { id: 3, text: 'Покажешь когда будет готово? 👀', time: '11:03', out: false, read: true },
  { id: 4, text: 'Конечно! Думаю к вечеру закончу первую версию', time: '11:05', out: true, read: true },
  { id: 5, text: 'Только что смотрела твой проект — огонь! 🔥', time: '12:41', out: false, read: false },
  { id: 6, text: 'Серьёзно, это лучшее что я видела в этом году!', time: '12:41', out: false, read: false },
];

const mockGifts: Gift[] = [
  { id: 1, name: 'Звезда', emoji: '⭐', price: 10, color: 'from-yellow-500 to-orange-500', description: 'Подари звезду другу' },
  { id: 2, name: 'Алмаз', emoji: '💎', price: 50, color: 'from-cyan-400 to-blue-600', description: 'Редкий подарок' },
  { id: 3, name: 'Корона', emoji: '👑', price: 200, color: 'from-yellow-400 to-amber-600', description: 'Для королей' },
  { id: 4, name: 'Сердце', emoji: '❤️‍🔥', price: 25, color: 'from-red-500 to-pink-600', description: 'С любовью' },
  { id: 5, name: 'Ракета', emoji: '🚀', price: 75, color: 'from-purple-500 to-violet-700', description: 'К звёздам!' },
  { id: 6, name: 'Кристалл', emoji: '🔮', price: 100, color: 'from-violet-400 to-fuchsia-600', description: 'Магический' },
  { id: 7, name: 'Торт', emoji: '🎂', price: 30, color: 'from-pink-400 to-rose-600', description: 'С Днём рождения' },
  { id: 8, name: 'Молния', emoji: '⚡', price: 15, color: 'from-yellow-400 to-orange-500', description: 'Энергия!' },
];

const mockNotifications: Notification[] = [
  { id: 1, type: 'message', text: 'Алиса написала тебе: "Только что смотрела твой проект"', time: '12:41', read: false, avatar: '👩‍💻' },
  { id: 2, type: 'gift', text: 'Соня подарила тебе Алмаз 💎', time: '10:30', read: false, avatar: '👩‍🎨' },
  { id: 3, type: 'mention', text: 'Максим упомянул тебя в "Команда Разработки"', time: 'вчера', read: true, avatar: '🧑‍🚀' },
  { id: 4, type: 'join', text: 'Катя присоединилась к твоей группе', time: 'вчера', read: true, avatar: '👩‍🔬' },
  { id: 5, type: 'premium', text: 'Твоя Premium подписка истекает через 3 дня', time: 'пн', read: true },
];

const currentUser: User = {
  id: 0,
  name: 'Ты',
  username: 'me',
  avatar: '😎',
  online: true,
  premium: true,
  diamonds: 480,
  bio: 'Пользуюсь Pulse'
};

// ─── Helper Components ────────────────────────────────────────────────────────
function Avatar({ user, size = 'md', showOnline = false }: { user: User; size?: 'sm' | 'md' | 'lg' | 'xl'; showOnline?: boolean }) {
  const sizes = { sm: 'w-8 h-8 text-lg', md: 'w-11 h-11 text-xl', lg: 'w-14 h-14 text-2xl', xl: 'w-20 h-20 text-4xl' };
  return (
    <div className={`relative inline-block`}>
      <div className={`${sizes[size]} rounded-2xl flex items-center justify-center glass border border-white/10 ${user.premium ? 'ring-2 ring-purple-500/50' : ''}`}>
        <span>{user.avatar}</span>
      </div>
      {showOnline && user.online && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-neon-green rounded-full border-2 border-background" />
      )}
    </div>
  );
}

function PremiumBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'linear-gradient(135deg, #a855f7, #22d3ee)', color: 'white' }}>
      ⭐ PRO
    </span>
  );
}

// ─── Auth Screen ──────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }: { onAuth: () => void }) {
  const [tab, setTab] = useState<AuthTab>('login');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'code'>('form');
  const [code, setCode] = useState(['', '', '', '']);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep('code'); }, 1200);
  };

  const handleCode = (idx: number, val: string) => {
    if (val.length > 1) return;
    const next = [...code];
    next[idx] = val;
    setCode(next);
    if (val && idx < 3) codeRefs.current[idx + 1]?.focus();
    if (next.filter(c => c).length === 4) {
      setTimeout(onAuth, 600);
    }
  };

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4" style={{ overflowY: 'auto' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #22d3ee, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #f472b6, transparent)' }} />
      </div>

      <div className="w-full max-w-sm animate-scale-in relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 rounded-3xl gradient-bg mx-auto mb-4 flex items-center justify-center text-4xl neon-glow animate-float">
            ⚡
          </div>
          <h1 className="text-4xl font-black font-display gradient-text mb-1">Pulse</h1>
          <p className="text-muted-foreground text-sm">мессенджер нового поколения</p>
        </div>

        <div className="glass rounded-3xl p-6 border border-white/10">
          {step === 'form' ? (
            <>
              <div className="flex rounded-2xl p-1 mb-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
                {(['login', 'register'] as AuthTab[]).map(t => (
                  <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${tab === t ? 'gradient-bg text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}>
                    {t === 'login' ? 'Войти' : 'Регистрация'}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {tab === 'register' && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block font-medium">Имя</label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Как тебя зовут?"
                      className="w-full px-4 py-3 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block font-medium">Номер телефона</label>
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+7 (999) 123-45-67"
                    type="tel"
                    className="w-full px-4 py-3 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block font-medium">Пароль</label>
                  <input
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    type="password"
                    className="w-full px-4 py-3 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-5 py-3.5 rounded-2xl font-bold text-white gradient-bg neon-glow hover:opacity-90 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Отправляю код...</span>
                  </>
                ) : (
                  <span>{tab === 'login' ? 'Войти' : 'Зарегистрироваться'}</span>
                )}
              </button>

              <p className="text-center text-xs text-muted-foreground mt-4">
                Нажимая, вы соглашаетесь с{' '}
                <span className="text-purple-400 cursor-pointer hover:underline">условиями использования</span>
              </p>
            </>
          ) : (
            <div className="text-center animate-scale-in">
              <div className="text-5xl mb-3">📱</div>
              <h3 className="font-bold text-lg mb-1">Введи код из SMS</h3>
              <p className="text-muted-foreground text-sm mb-6">Отправили на {phone || '+7 (999) ···-··-··'}</p>
              <div className="flex gap-3 justify-center mb-6">
                {code.map((c, i) => (
                  <input
                    key={i}
                    ref={el => { codeRefs.current[i] = el; }}
                    value={c}
                    onChange={e => handleCode(i, e.target.value)}
                    maxLength={1}
                    className="w-14 h-14 text-center text-2xl font-bold rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    style={{ background: 'rgba(255,255,255,0.07)', border: c ? '2px solid rgba(168,85,247,0.7)' : '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  />
                ))}
              </div>
              <button onClick={() => setStep('form')} className="text-sm text-muted-foreground hover:text-purple-400 transition-colors">
                ← Назад
              </button>
            </div>
          )}
        </div>

        <div className="text-center mt-6 text-xs text-muted-foreground/60">
          Pulse v1.0 • End-to-end encryption 🔐
        </div>
      </div>
    </div>
  );
}

// ─── Chat Window ──────────────────────────────────────────────────────────────
function ChatWindow({ chat, onBack }: { chat: Chat; onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const emojis = ['😊', '🔥', '💎', '❤️', '😎', '🚀', '✨', '🎉', '💜', '😂', '👍', '🙏'];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!text.trim()) return;
    const msg: Message = {
      id: Date.now(),
      text: text.trim(),
      time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
      out: true,
      read: false,
    };
    setMessages(p => [...p, msg]);
    setText('');
    setTimeout(() => {
      const reply: Message = {
        id: Date.now() + 1,
        text: 'Получила! 💜',
        time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
        out: false,
        read: false,
      };
      setMessages(p => [...p, reply]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full animate-slide-in-right">
      <div className="glass border-b border-white/10 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={onBack} className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-colors lg:hidden">
          <Icon name="ChevronLeft" size={20} />
        </button>
        <Avatar user={chat.user} showOnline />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm truncate">{chat.user.name}</span>
            {chat.user.premium && <PremiumBadge />}
          </div>
          <span className="text-xs text-neon-green flex items-center gap-1">
            {chat.typing ? (
              <>
                печатает
                <span className="flex gap-0.5 ml-1">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-1 h-1 bg-neon-green rounded-full typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </span>
              </>
            ) : chat.user.online ? 'онлайн' : 'был(а) недавно'}
          </span>
        </div>
        <div className="flex gap-1">
          <button className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-colors">
            <Icon name="Phone" size={16} />
          </button>
          <button className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-colors">
            <Icon name="Video" size={16} />
          </button>
          <button className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-colors">
            <Icon name="MoreVertical" size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 min-h-0">
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={`flex ${msg.out ? 'justify-end' : 'justify-start'}`}
            style={{ animation: `${msg.out ? 'slide-in-right' : 'slide-in-left'} 0.3s cubic-bezier(0.34,1.56,0.64,1) both`, animationDelay: `${i * 0.02}s` }}
          >
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${msg.out
              ? 'gradient-bg text-white rounded-br-sm'
              : 'glass border border-white/10 text-foreground rounded-bl-sm'
            }`}>
              <p className="leading-relaxed">{msg.text}</p>
              <div className={`flex items-center gap-1 mt-1 ${msg.out ? 'justify-end' : 'justify-start'}`}>
                <span className="text-[10px] opacity-60">{msg.time}</span>
                {msg.out && (
                  <Icon name={msg.read ? 'CheckCheck' : 'Check'} size={12} className={msg.read ? 'text-cyan-400' : 'opacity-60'} />
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {showEmoji && (
        <div className="glass border-t border-white/10 px-4 py-3 flex gap-3 flex-wrap flex-shrink-0">
          {emojis.map(e => (
            <button key={e} onClick={() => { setText(t => t + e); setShowEmoji(false); }} className="text-2xl hover:scale-125 transition-transform">
              {e}
            </button>
          ))}
        </div>
      )}

      <div className="glass border-t border-white/10 px-3 py-3 flex items-end gap-2 flex-shrink-0">
        <button onClick={() => setShowEmoji(p => !p)} className="w-10 h-10 rounded-2xl glass flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0">
          <Icon name="Smile" size={18} className="text-muted-foreground" />
        </button>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Напиши сообщение..."
          rows={1}
          className="flex-1 px-4 py-2.5 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none transition-all"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '120px', overflowY: 'auto' }}
        />
        <button onClick={send} className="w-10 h-10 rounded-2xl gradient-bg flex items-center justify-center neon-glow hover:opacity-90 active:scale-95 transition-all flex-shrink-0">
          <Icon name="Send" size={16} className="text-white" />
        </button>
      </div>
    </div>
  );
}

// ─── Chats Section ────────────────────────────────────────────────────────────
function ChatsSection() {
  const [search, setSearch] = useState('');
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const filtered = mockChats.filter(c => c.user.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-full">
      <div className={`flex flex-col ${activeChat ? 'hidden lg:flex' : 'flex'} w-full lg:w-80 xl:w-96 border-r border-white/10 flex-shrink-0`}>
        <div className="px-4 pt-4 pb-3 flex-shrink-0">
          <h2 className="text-xl font-bold mb-3">Чаты</h2>
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск чатов..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground outline-none"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((chat, i) => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left animate-fade-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="relative flex-shrink-0">
                <Avatar user={chat.user} showOnline />
                {chat.pinned && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-neon-purple rounded-full flex items-center justify-center">
                    <Icon name="Pin" size={8} className="text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm truncate">{chat.user.name}</span>
                    {chat.user.premium && <span className="text-purple-400 text-xs">⭐</span>}
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{chat.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground truncate flex-1">
                    {chat.typing ? <span className="text-neon-green">печатает...</span> : chat.lastMessage}
                  </span>
                  {chat.unread > 0 && (
                    <span className="ml-2 min-w-[20px] h-5 gradient-bg rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1.5 flex-shrink-0">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className={`flex-1 ${!activeChat ? 'hidden lg:flex' : 'flex'} flex-col`}>
        {activeChat ? (
          <ChatWindow chat={activeChat} onBack={() => setActiveChat(null)} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div className="animate-float">
              <div className="text-7xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-2">Выбери чат</h3>
              <p className="text-muted-foreground text-sm">Начни общение или выбери диалог слева</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Contacts Section ─────────────────────────────────────────────────────────
function ContactsSection() {
  const [search, setSearch] = useState('');
  const filtered = mockUsers.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Контакты</h2>
          <button className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center neon-glow">
            <Icon name="UserPlus" size={16} className="text-white" />
          </button>
        </div>
        <div className="relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Найти контакт..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-sm outline-none text-foreground placeholder:text-muted-foreground"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-4">
        {filtered.map((user, i) => (
          <div
            key={user.id}
            className="glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer animate-fade-in"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <Avatar user={user} showOnline />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold text-sm">{user.name}</span>
                {user.premium && <PremiumBadge />}
              </div>
              <span className="text-xs text-muted-foreground">@{user.username}</span>
              {user.bio && <p className="text-xs text-muted-foreground mt-0.5 truncate">{user.bio}</p>}
            </div>
            <div className="flex gap-1">
              <button className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-colors">
                <Icon name="MessageCircle" size={15} className="text-neon-purple" />
              </button>
              <button className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-colors">
                <Icon name="Phone" size={15} className="text-neon-blue" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Groups Section ───────────────────────────────────────────────────────────
const groups = [
  { id: 1, name: 'Команда Разработки', emoji: '🛠️', members: 24, lastMessage: 'Максим: дедлайн завтра!', time: '13:10', unread: 5, color: 'from-purple-500 to-blue-600' },
  { id: 2, name: 'Дизайн-студия', emoji: '🎨', members: 12, lastMessage: 'Соня прислала макеты', time: '11:45', unread: 0, color: 'from-pink-500 to-rose-600' },
  { id: 3, name: 'Книжный клуб', emoji: '📚', members: 45, lastMessage: 'Читаем "Мастер и Маргарита"', time: 'вчера', unread: 2, color: 'from-orange-500 to-amber-600' },
  { id: 4, name: 'Путешественники', emoji: '✈️', members: 89, lastMessage: 'Едем в Стамбул в марте?', time: 'пн', unread: 0, color: 'from-cyan-500 to-teal-600' },
];

function GroupsSection() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Группы</h2>
          <button className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center neon-glow">
            <Icon name="Plus" size={16} className="text-white" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
        {groups.map((g, i) => (
          <div key={g.id} className="glass rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition-colors animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${g.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                {g.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-semibold text-sm">{g.name}</span>
                  <span className="text-xs text-muted-foreground">{g.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground truncate flex-1">{g.lastMessage}</span>
                  {g.unread > 0 && (
                    <span className="ml-2 min-w-[20px] h-5 gradient-bg rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1.5">
                      {g.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Icon name="Users" size={13} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{g.members} участников</span>
              </div>
              <button className="text-xs text-neon-purple hover:underline">Открыть</button>
            </div>
          </div>
        ))}
        <div className="glass rounded-2xl p-4 border-dashed border-2 border-white/10 flex items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-colors">
          <Icon name="Plus" size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Создать группу</span>
        </div>
      </div>
    </div>
  );
}

// ─── Channels Section ─────────────────────────────────────────────────────────
const channels = [
  { id: 1, name: 'Tech News', emoji: '🔬', subscribers: 48200, lastPost: 'Новый iPhone анонсирован', time: '10:00', color: 'from-blue-500 to-cyan-500', verified: true },
  { id: 2, name: 'Дизайн Daily', emoji: '✏️', subscribers: 12800, lastPost: '10 трендов 2025 года', time: 'вчера', color: 'from-violet-500 to-purple-600', verified: true },
  { id: 3, name: 'Криптоновости', emoji: '₿', subscribers: 95400, lastPost: 'BTC пробил $100k', time: 'вчера', color: 'from-orange-400 to-yellow-500', verified: false },
  { id: 4, name: 'Кино и сериалы', emoji: '🎬', subscribers: 31600, lastPost: 'Обзор нового сезона', time: 'пн', color: 'from-rose-500 to-pink-600', verified: false },
];

function ChannelsSection() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Каналы</h2>
          <button className="text-xs text-neon-purple hover:underline">Каталог</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
        {channels.map((ch, i) => (
          <div key={ch.id} className="glass rounded-2xl overflow-hidden cursor-pointer hover:bg-white/5 transition-colors animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className={`h-2 bg-gradient-to-r ${ch.color}`} />
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${ch.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {ch.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-semibold text-sm">{ch.name}</span>
                    {ch.verified && <Icon name="BadgeCheck" size={14} className="text-neon-blue" />}
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <Icon name="Users" size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{ch.subscribers.toLocaleString('ru')} подписчиков</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{ch.lastPost}</p>
                </div>
                <button className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold gradient-bg text-white">
                  Читать
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Gifts Section ────────────────────────────────────────────────────────────
function GiftsSection() {
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [diamonds, setDiamonds] = useState(480);
  const [sent, setSent] = useState<number[]>([]);
  const [buying, setBuying] = useState(false);

  const diamondPacks = [
    { amount: 100, price: '99 ₽', bonus: null },
    { amount: 500, price: '449 ₽', bonus: '+50 бонус' },
    { amount: 1000, price: '849 ₽', bonus: '+150 бонус' },
    { amount: 5000, price: '3999 ₽', bonus: '+1000 бонус' },
  ];

  const sendGift = (gift: Gift) => {
    if (diamonds < gift.price) return;
    setDiamonds(p => p - gift.price);
    setSent(p => [...p, gift.id]);
    setSelectedGift(null);
    setTimeout(() => setSent(p => p.filter(id => id !== gift.id)), 3000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-bold">Подарки</h2>
          <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-2xl">
            <span className="text-neon-blue text-sm">💎</span>
            <span className="font-bold text-sm text-neon-blue">{diamonds}</span>
            <button onClick={() => setBuying(true)} className="text-xs text-muted-foreground hover:text-neon-purple transition-colors ml-1">+ купить</button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Порадуй друзей особенным подарком</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {buying ? (
          <div className="animate-scale-in">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setBuying(false)} className="w-8 h-8 glass rounded-xl flex items-center justify-center">
                <Icon name="ChevronLeft" size={16} />
              </button>
              <h3 className="font-bold">Купить алмазы 💎</h3>
            </div>
            <div className="space-y-3">
              {diamondPacks.map(pack => (
                <button key={pack.amount} className="w-full glass rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center text-2xl">💎</div>
                    <div>
                      <div className="font-bold">{pack.amount.toLocaleString('ru')} алмазов</div>
                      {pack.bonus && <div className="text-xs text-neon-green">{pack.bonus}</div>}
                    </div>
                  </div>
                  <div className="gradient-bg text-white font-bold px-4 py-2 rounded-xl text-sm">
                    {pack.price}
                  </div>
                </button>
              ))}
              <div className="glass rounded-2xl p-4 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">👑</span>
                  <div>
                    <div className="font-bold text-sm">Premium подписка</div>
                    <div className="text-xs text-muted-foreground">Неограниченные возможности</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-xs text-muted-foreground line-through">599 ₽/мес</div>
                    <div className="font-bold text-neon-purple">299 ₽/мес</div>
                  </div>
                </div>
                <button className="w-full py-2.5 gradient-bg-pink rounded-xl text-white font-bold text-sm neon-glow-pink">
                  Получить Premium
                </button>
              </div>
            </div>
          </div>
        ) : selectedGift ? (
          <div className="animate-scale-in">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setSelectedGift(null)} className="w-8 h-8 glass rounded-xl flex items-center justify-center">
                <Icon name="ChevronLeft" size={16} />
              </button>
              <h3 className="font-bold">Отправить подарок</h3>
            </div>
            <div className="text-center mb-6">
              <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${selectedGift.color} flex items-center justify-center text-5xl mx-auto mb-3 neon-glow animate-float`}>
                {selectedGift.emoji}
              </div>
              <h3 className="font-bold text-xl">{selectedGift.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedGift.description}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <span className="text-neon-blue">💎</span>
                <span className="font-bold text-neon-blue">{selectedGift.price}</span>
              </div>
            </div>
            <p className="text-sm font-semibold mb-3">Кому отправить?</p>
            <div className="space-y-2 mb-4">
              {mockUsers.slice(0, 4).map(u => (
                <button key={u.id} onClick={() => sendGift(selectedGift)} disabled={diamonds < selectedGift.price} className="w-full flex items-center gap-3 glass rounded-2xl p-3 hover:bg-white/10 transition-colors text-left disabled:opacity-50">
                  <Avatar user={u} size="sm" />
                  <div>
                    <div className="text-sm font-semibold">{u.name}</div>
                    <div className="text-xs text-muted-foreground">@{u.username}</div>
                  </div>
                  <div className="ml-auto text-neon-purple text-sm">Подарить →</div>
                </button>
              ))}
            </div>
            {diamonds < selectedGift.price && (
              <p className="text-center text-xs text-destructive">
                Недостаточно алмазов.{' '}
                <button onClick={() => setBuying(true)} className="text-neon-blue underline">Купить</button>
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {mockGifts.map((gift, i) => (
                <button
                  key={gift.id}
                  onClick={() => setSelectedGift(gift)}
                  className={`relative glass rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-all hover:scale-105 active:scale-95 animate-fade-in border ${sent.includes(gift.id) ? 'border-neon-green/50' : 'border-white/10'}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {sent.includes(gift.id) && (
                    <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/50 animate-scale-in">
                      <span className="text-2xl">✅</span>
                    </div>
                  )}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gift.color} flex items-center justify-center text-3xl`}>
                    {gift.emoji}
                  </div>
                  <span className="font-semibold text-sm">{gift.name}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-neon-blue text-xs">💎</span>
                    <span className="text-xs font-bold text-neon-blue">{gift.price}</span>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setBuying(true)} className="w-full py-3 glass rounded-2xl border border-dashed border-white/20 text-sm text-muted-foreground hover:bg-white/5 transition-colors">
              💎 Купить алмазы или Premium →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Notifications Section ────────────────────────────────────────────────────
const notifColors: Record<string, string> = {
  message: 'from-purple-500 to-blue-500',
  gift: 'from-pink-500 to-rose-500',
  mention: 'from-cyan-500 to-blue-500',
  join: 'from-green-500 to-emerald-500',
  premium: 'from-yellow-400 to-orange-500',
};
const notifIcons: Record<string, string> = {
  message: '💬', gift: '🎁', mention: '@', join: '👤', premium: '⭐',
};

function NotificationsSection() {
  const [notifs, setNotifs] = useState<Notification[]>(mockNotifications);
  const unreadCount = notifs.filter(n => !n.read).length;

  const markAll = () => setNotifs(p => p.map(n => ({ ...n, read: true })));

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Уведомления</h2>
            {unreadCount > 0 && (
              <span className="gradient-bg text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAll} className="text-xs text-neon-purple hover:underline">Прочитать все</button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-4">
        {notifs.map((n, i) => (
          <div
            key={n.id}
            onClick={() => setNotifs(p => p.map(x => x.id === n.id ? { ...x, read: true } : x))}
            className={`glass rounded-2xl p-4 flex items-start gap-3 cursor-pointer hover:bg-white/5 transition-colors animate-fade-in ${!n.read ? 'border border-purple-500/30' : 'border border-transparent'}`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${notifColors[n.type]} flex items-center justify-center text-lg flex-shrink-0`}>
              {n.avatar || notifIcons[n.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm leading-relaxed">{n.text}</p>
              <span className="text-xs text-muted-foreground">{n.time}</span>
            </div>
            {!n.read && <div className="w-2 h-2 rounded-full bg-neon-purple flex-shrink-0 mt-1" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Settings Section ─────────────────────────────────────────────────────────
function SettingsSection({ onNavigate }: { onNavigate: (s: AppSection) => void }) {
  const [darkMode, setDarkMode] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [online, setOnline] = useState(true);

  const ToggleRow = ({ label, icon, value, onChange, desc }: { label: string; icon: string; value: boolean; onChange: () => void; desc?: string }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <div className="text-sm font-medium">{label}</div>
          {desc && <div className="text-xs text-muted-foreground">{desc}</div>}
        </div>
      </div>
      <button
        onClick={onChange}
        className={`w-12 h-6 rounded-full transition-all duration-300 relative ${value ? 'gradient-bg' : 'bg-white/10'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${value ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );

  const settingGroups = [
    {
      title: 'Аккаунт',
      items: [
        { label: 'Профиль', icon: '👤', action: () => onNavigate('profile') },
        { label: 'Конфиденциальность', icon: '🔒', action: () => {} },
        { label: 'Безопасность', icon: '🛡️', action: () => {} },
      ]
    },
    {
      title: 'Подписки',
      items: [
        { label: 'Premium подписка', icon: '👑', action: () => {} },
        { label: 'Купить алмазы', icon: '💎', action: () => onNavigate('gifts') },
      ]
    },
    {
      title: 'Поддержка',
      items: [
        { label: 'Помощь', icon: '❓', action: () => {} },
        { label: 'О приложении', icon: 'ℹ️', action: () => {} },
      ]
    }
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <h2 className="text-xl font-bold">Настройки</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        <div className="glass rounded-2xl p-4">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Интерфейс</div>
          <div className="divide-y divide-white/5">
            <ToggleRow label="Тёмная тема" icon="🌙" value={darkMode} onChange={() => setDarkMode(p => !p)} />
            <ToggleRow label="Звуки" icon="🔔" value={sounds} onChange={() => setSounds(p => !p)} desc="Звуки сообщений и уведомлений" />
          </div>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Уведомления</div>
          <div className="divide-y divide-white/5">
            <ToggleRow label="Push-уведомления" icon="📲" value={pushNotifs} onChange={() => setPushNotifs(p => !p)} />
            <ToggleRow label="Онлайн-статус" icon="🟢" value={online} onChange={() => setOnline(p => !p)} desc="Показывать другим когда ты онлайн" />
          </div>
        </div>
        {settingGroups.map(g => (
          <div key={g.title} className="glass rounded-2xl p-4">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{g.title}</div>
            <div className="space-y-1">
              {g.items.map(item => (
                <button key={item.label} onClick={item.action} className="w-full flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-white/5 transition-colors text-left">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                  <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        ))}
        <button className="w-full py-3 rounded-2xl text-destructive glass border border-destructive/20 text-sm font-semibold hover:bg-destructive/10 transition-colors">
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}

// ─── Profile Section ──────────────────────────────────────────────────────────
function ProfileSection() {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [username, setUsername] = useState(currentUser.username);

  const stats = [
    { label: 'Сообщений', value: '1 284', icon: '💬' },
    { label: 'Контактов', value: '48', icon: '👥' },
    { label: 'Подарков', value: '23', icon: '🎁' },
    { label: 'Алмазов', value: String(currentUser.diamonds), icon: '💎' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex-shrink-0 flex items-center justify-between">
        <h2 className="text-xl font-bold">Профиль</h2>
        <button
          onClick={() => setEditing(p => !p)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${editing ? 'gradient-bg text-white' : 'glass border border-white/10 text-foreground'}`}
        >
          {editing ? 'Сохранить' : 'Изменить'}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        <div className="glass rounded-3xl p-6 flex flex-col items-center text-center animate-fade-in">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-3xl glass border-2 border-purple-500/50 flex items-center justify-center text-5xl neon-glow animate-float">
              {currentUser.avatar}
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 gradient-bg rounded-full flex items-center justify-center">
              <Icon name="Camera" size={14} className="text-white" />
            </button>
          </div>
          {editing ? (
            <div className="w-full space-y-2">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full text-center font-bold text-lg bg-transparent border-b border-purple-500/50 outline-none pb-1 text-foreground"
              />
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full text-center text-sm text-muted-foreground bg-transparent border-b border-white/20 outline-none pb-1"
              />
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="w-full text-center text-sm bg-transparent border border-white/10 rounded-xl p-2 outline-none resize-none text-foreground"
                rows={2}
                placeholder="О себе..."
              />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-xl">{name}</h3>
                <PremiumBadge />
              </div>
              <p className="text-muted-foreground text-sm mb-1">@{username}</p>
              {bio && <p className="text-sm">{bio}</p>}
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stats.map((s, i) => (
            <div key={s.label} className="glass rounded-2xl p-4 text-center animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-bold text-lg gradient-text">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm">Premium статус</span>
            <PremiumBadge />
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-2">
            <div className="h-full gradient-bg rounded-full" style={{ width: '67%' }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>20 дней осталось</span>
            <button className="text-neon-purple hover:underline">Продлить</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────
const navItems: { id: AppSection; icon: string; label: string; lucide: string }[] = [
  { id: 'chats', icon: '💬', label: 'Чаты', lucide: 'MessageCircle' },
  { id: 'contacts', icon: '👥', label: 'Контакты', lucide: 'Users' },
  { id: 'groups', icon: '🫂', label: 'Группы', lucide: 'UsersRound' },
  { id: 'channels', icon: '📡', label: 'Каналы', lucide: 'Radio' },
  { id: 'gifts', icon: '🎁', label: 'Подарки', lucide: 'Gift' },
  { id: 'notifications', icon: '🔔', label: 'Оповещения', lucide: 'Bell' },
  { id: 'settings', icon: '⚙️', label: 'Настройки', lucide: 'Settings' },
  { id: 'profile', icon: '👤', label: 'Профиль', lucide: 'User' },
];

function AppShell() {
  const [section, setSection] = useState<AppSection>('chats');
  const unreadNotifs = mockNotifications.filter(n => !n.read).length;
  const unreadChats = mockChats.reduce((acc, c) => acc + c.unread, 0);

  const badges: Partial<Record<AppSection, number>> = {
    chats: unreadChats,
    notifications: unreadNotifs,
  };

  return (
    <div className="h-screen mesh-bg flex overflow-hidden">
      {/* Sidebar (desktop) */}
      <div className="hidden md:flex flex-col w-64 glass border-r border-white/10 flex-shrink-0">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-bg rounded-2xl flex items-center justify-center text-xl neon-glow">⚡</div>
            <div>
              <div className="font-black text-lg font-display gradient-text leading-none">Pulse</div>
              <div className="text-[10px] text-muted-foreground">мессенджер</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const badge = badges[item.id];
            return (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 text-left ${section === item.id ? 'nav-item-active text-white' : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'}`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium text-sm flex-1">{item.label}</span>
                {badge ? (
                  <span className="gradient-bg text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button onClick={() => setSection('profile')} className="w-full flex items-center gap-2 px-2 py-2 rounded-2xl hover:bg-white/5 transition-colors">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl glass border border-purple-500/30 flex items-center justify-center text-lg">
                {currentUser.avatar}
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-neon-green rounded-full border-2 border-background" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-sm font-semibold truncate">{currentUser.name}</div>
              <div className="text-[10px] text-muted-foreground">@{currentUser.username}</div>
            </div>
            <PremiumBadge />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {section === 'chats' && <ChatsSection />}
          {section === 'contacts' && <ContactsSection />}
          {section === 'groups' && <GroupsSection />}
          {section === 'channels' && <ChannelsSection />}
          {section === 'gifts' && <GiftsSection />}
          {section === 'notifications' && <NotificationsSection />}
          {section === 'settings' && <SettingsSection onNavigate={setSection} />}
          {section === 'profile' && <ProfileSection />}
        </div>

        {/* Bottom nav (mobile) */}
        <div className="md:hidden glass border-t border-white/10 flex-shrink-0">
          <div className="grid grid-cols-8 py-2 px-1">
            {navItems.map(item => {
              const badge = badges[item.id];
              return (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id)}
                  className={`flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all relative ${section === item.id ? 'text-neon-purple' : 'text-muted-foreground'}`}
                >
                  <span className={`text-lg transition-transform ${section === item.id ? 'scale-110' : ''}`}>{item.icon}</span>
                  {badge ? (
                    <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 gradient-bg rounded-full text-white text-[8px] font-bold flex items-center justify-center">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Index() {
  const [screen, setScreen] = useState<Screen>('auth');

  return screen === 'auth'
    ? <AuthScreen onAuth={() => setScreen('app')} />
    : <AppShell />;
}
