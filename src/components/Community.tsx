import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  where 
} from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { CommunityMessage } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Send, MessageSquare, Users, Globe, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Community() {
  const { user, userMarket } = useAuth();
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [view, setView] = useState<'market' | 'global'>('market');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const messagesRef = collection(db, 'messages');
    let q = query(
      messagesRef,
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    if (view === 'market') {
      q = query(
        messagesRef,
        where('market', '==', userMarket),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CommunityMessage)).reverse();
      setMessages(msgs);
    }, (error) => {
      console.error("Community fetch error:", error);
      // In prototype, if index is missing, we might see global but not market-filtered until index is built.
      // We handle it silently for now.
    });

    return () => unsubscribe();
  }, [view, userMarket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageText = newMessage;
    setNewMessage('');

    try {
      await addDoc(collection(db, 'messages'), {
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Vendor',
        text: messageText,
        market: userMarket,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'messages');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
      <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Users size={18} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-tight text-slate-800">Vendor Hub</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {view === 'market' ? `${userMarket} Chat` : 'Global Community'}
            </p>
          </div>
        </div>
        
        <div className="flex bg-white border border-slate-200 p-1 rounded-xl">
          <button 
            onClick={() => setView('market')}
            className={cn(
              "p-2 rounded-lg transition-all",
              view === 'market' ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
            title="Local Market Chat"
          >
            <MapPin size={16} />
          </button>
          <button 
            onClick={() => setView('global')}
            className={cn(
              "p-2 rounded-lg transition-all",
              view === 'global' ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
            title="Global Chat"
          >
            <Globe size={16} />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-slate-50/30"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center px-8">
              <MessageSquare size={32} className="mb-2 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest">No messages yet</p>
              <p className="text-[10px] mt-1">Be the first to ask a price query!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={cn(
                  "flex flex-col max-w-[85%]",
                  msg.userId === user?.uid ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase">
                    {msg.userId === user?.uid ? 'You' : msg.userName}
                  </span>
                  {view === 'global' && (
                    <span className="text-[8px] bg-slate-200 text-slate-500 px-1 py-0.5 rounded font-black uppercase">
                      {msg.market}
                    </span>
                  )}
                </div>
                <div className={cn(
                  "px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm",
                  msg.userId === user?.uid 
                    ? "bg-indigo-600 text-white rounded-tr-none" 
                    : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                )}>
                  {msg.text}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input 
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask a doubt or share a tip..."
            className="flex-1 bg-slate-50 border-0 focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-3 text-sm font-medium"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:shadow-none active:scale-95 transition-all"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
