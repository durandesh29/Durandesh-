import React, { useState, useRef, useEffect } from 'react';
import { useBarbershop } from '../context/BarbershopContext';
import {
  MessageSquare,
  X,
  Send,
  User,
  Scissors,
  Calendar,
  Sparkles,
  Check,
  CheckCheck,
  Phone,
  Image as ImageIcon,
  Minimize2,
  Maximize2,
  ShieldCheck,
  HelpCircle,
  MessageCircle,
} from 'lucide-react';

export const ChatWidget: React.FC = () => {
  const {
    chatThreads,
    activeChatThreadId,
    setActiveChatThreadId,
    isChatOpen,
    openChat,
    closeChat,
    sendMessage,
    chatRole,
    setChatRole,
    openBookingModal,
    masters,
    user,
  } = useBarbershop();

  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active thread
  const activeThread =
    chatThreads.find((t) => t.id === activeChatThreadId) ||
    chatThreads[0];

  // Total unread count across all threads
  const totalUnread = chatThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isChatOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThread?.messages?.length, isChatOpen, isMinimized]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeThread) return;
    sendMessage(activeThread.id, inputText);
    setInputText('');
  };

  const handleSendQuickPrompt = (promptText: string) => {
    if (!activeThread) return;
    sendMessage(activeThread.id, promptText);
  };

  const quickPrompts = [
    'Какая стрижка лучше подойдет для моей формы лица?',
    'Есть ли свободные окна на сегодня или завтра?',
    'Сколько по времени длится стрижка с укладкой?',
    'Как работает скидка для постоянных клиентов?',
    'Можно ли показать мастеру фото стрижки из интернета?',
  ];

  return (
    <>
      {/* FLOATING TRIGGER BUTTON (Bottom Right) */}
      {!isChatOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
          <button
            onClick={() => openChat()}
            className="group relative flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 font-bold shadow-2xl shadow-amber-500/30 transition-all duration-300 border border-amber-400/60"
            title="Чат с мастерами и администрацией"
          >
            <div className="relative">
              <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {totalUnread > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                  {totalUnread}
                </span>
              )}
            </div>

            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold leading-tight">Чат с мастером</span>
              <span className="text-[10px] text-zinc-900/80 font-medium">Онлайн-консультация</span>
            </div>

            {/* Pulse beacon */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
          </button>
        </div>
      )}

      {/* CHAT MODAL / DRAWER */}
      {isChatOpen && (
        <div
          className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
            isMinimized
              ? 'w-80 h-16'
              : 'w-[94vw] sm:w-[460px] md:w-[680px] h-[85vh] sm:h-[620px] max-h-[85vh]'
          }`}
        >
          <div className="w-full h-full bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl">
            
            {/* CHAT HEADER */}
            <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
                    <img
                      src={activeThread?.targetAvatar || '/src/assets/images/barber_alex_1790180895959.jpg'}
                      alt={activeThread?.targetName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                      {activeThread?.targetName}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      В сети
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate max-w-[200px] sm:max-w-[260px]">
                    {activeThread?.targetTitle}
                  </div>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-1.5">
                
                {/* Book button directly in chat */}
                {activeThread?.targetType === 'master' && (
                  <button
                    onClick={() => {
                      closeChat();
                      openBookingModal({ masterId: activeThread.targetId });
                    }}
                    className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-[11px] font-semibold transition-colors"
                    title="Записаться к этому мастеру"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Записаться</span>
                  </button>
                )}

                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                  title={isMinimized ? 'Развернуть' : 'Свернуть'}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={closeChat}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                  title="Закрыть чат"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CHAT BODY (Hidden if minimized) */}
            {!isMinimized && (
              <div className="flex-1 flex overflow-hidden">
                
                {/* LEFT COLUMN: DIALOG LIST (Visible on md+ screens) */}
                <div className="hidden md:flex flex-col w-56 border-r border-zinc-800 bg-zinc-950/60 shrink-0">
                  <div className="p-3 border-b border-zinc-800/80 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Диалоги ({chatThreads.length})
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {chatThreads.map((thread) => {
                      const isSelected = thread.id === activeThread?.id;
                      return (
                        <button
                          key={thread.id}
                          onClick={() => setActiveChatThreadId(thread.id)}
                          className={`w-full p-2.5 rounded-2xl text-left transition-all flex items-center gap-2.5 ${
                            isSelected
                              ? 'bg-amber-500/10 border border-amber-500/30 text-white'
                              : 'text-zinc-300 hover:bg-zinc-800/60 border border-transparent'
                          }`}
                        >
                          <div className="relative shrink-0">
                            <div className="w-8 h-8 rounded-xl overflow-hidden bg-zinc-800">
                              <img
                                src={thread.targetAvatar || '/src/assets/images/barber_alex_1790180895959.jpg'}
                                alt={thread.targetName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {thread.isOnline && (
                              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-zinc-950" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold truncate">{thread.targetName}</span>
                              <span className="text-[10px] text-zinc-500 font-mono">{thread.lastMessageTime}</span>
                            </div>
                            <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                              {thread.lastMessage || 'Нажмите, чтобы открыть диалог'}
                            </div>
                          </div>

                          {thread.unreadCount > 0 && (
                            <span className="w-4 h-4 rounded-full bg-amber-500 text-zinc-950 text-[9px] font-bold flex items-center justify-center shrink-0">
                              {thread.unreadCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* RIGHT COLUMN: ACTIVE CONVERSATION */}
                <div className="flex-1 flex flex-col bg-zinc-900/90 overflow-hidden">
                  
                  {/* Top Mobile Dialog Selector & Role Switcher */}
                  <div className="px-4 py-2 border-b border-zinc-800/80 bg-zinc-950/40 flex flex-wrap items-center justify-between gap-2 shrink-0">
                    
                    {/* Mobile Dialog Switcher dropdown */}
                    <div className="md:hidden flex-1 min-w-[140px]">
                      <select
                        value={activeThread?.id}
                        onChange={(e) => setActiveChatThreadId(e.target.value)}
                        className="w-full px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-[11px]"
                      >
                        {chatThreads.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.targetName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Interactive Role Switcher Toggle */}
                    <div className="flex items-center gap-1.5 p-0.5 bg-zinc-900 border border-zinc-800 rounded-xl text-[11px]">
                      <button
                        type="button"
                        onClick={() => setChatRole('client')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                          chatRole === 'client'
                            ? 'bg-amber-500 text-zinc-950 font-bold'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <User className="w-3 h-3" />
                        <span>Я клиент</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setChatRole('master')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                          chatRole === 'master'
                            ? 'bg-amber-500 text-zinc-950 font-bold'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                        title="Отвечать от лица мастера или администратора"
                      >
                        <Scissors className="w-3 h-3" />
                        <span>Режим мастера</span>
                      </button>
                    </div>

                  </div>

                  {/* MESSAGES SCROLL AREA */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    
                    {/* Welcome Notice */}
                    <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-center text-xs text-zinc-400 space-y-1">
                      <div className="text-amber-400 font-semibold text-[11px] flex items-center justify-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Прямой диалог со специалистом салона</span>
                      </div>
                      <p className="text-[11px]">
                        Вы можете задать любые вопросы о длине стрижки, подборе формы, уходе за бородой или окрашивании.
                      </p>
                    </div>

                    {/* Message stream */}
                    {activeThread?.messages?.map((msg) => {
                      const isClientMsg = msg.senderRole === 'client';

                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-2 ${
                            isClientMsg ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {!isClientMsg && (
                            <div className="w-7 h-7 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700">
                              <img
                                src={activeThread.targetAvatar || '/src/assets/images/barber_alex_1790180895959.jpg'}
                                alt={msg.senderName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                              isClientMsg
                                ? 'bg-amber-500 text-zinc-950 rounded-br-none shadow-md font-medium'
                                : 'bg-zinc-800 text-zinc-100 rounded-bl-none border border-zinc-700'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4 mb-1">
                              <span
                                className={`text-[10px] font-bold ${
                                  isClientMsg ? 'text-zinc-900' : 'text-amber-400'
                                }`}
                              >
                                {msg.senderName}
                              </span>
                              <span
                                className={`text-[9px] font-mono ${
                                  isClientMsg ? 'text-zinc-800' : 'text-zinc-400'
                                }`}
                              >
                                {msg.timestamp}
                              </span>
                            </div>

                            <p>{msg.text}</p>

                            {msg.imageUrl && (
                              <div className="mt-2 rounded-xl overflow-hidden max-h-40 border border-zinc-700/50">
                                <img
                                  src={msg.imageUrl}
                                  alt="Вложение"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            {isClientMsg && (
                              <div className="text-right mt-1">
                                <CheckCheck className="w-3 h-3 inline text-zinc-900" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* QUICK PROMPT CHIPS */}
                  <div className="px-4 py-2 border-t border-zinc-800/60 bg-zinc-950/40 overflow-x-auto shrink-0">
                    <div className="flex items-center gap-1.5 w-max">
                      <span className="text-[10px] text-zinc-500 mr-1 flex items-center gap-1">
                        <HelpCircle className="w-3 h-3 text-amber-500" />
                        <span>Частые вопросы:</span>
                      </span>
                      {quickPrompts.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendQuickPrompt(q)}
                          className="text-[10px] px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-colors whitespace-nowrap"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* INPUT BAR */}
                  <form
                    onSubmit={handleSend}
                    className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center gap-2 shrink-0"
                  >
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={
                        chatRole === 'client'
                          ? `Напишите сообщение для ${activeThread?.targetName}...`
                          : `Ответить клиенту от лица ${activeThread?.targetName}...`
                      }
                      className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                    />

                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-zinc-950 transition-all font-bold"
                      title="Отправить сообщение"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>

                </div>

              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
};
