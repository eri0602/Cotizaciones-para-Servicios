import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchConversations, fetchMessages, sendMessage } from '../store/slices/chatSlice';
import { socketService } from '../services/socket';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState as useReactState } from 'react';

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { conversations, messages, loading } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);
  const [newMessage, setNewMessage] = useReactState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(fetchMessages(id));
      socketService.joinConversation(id);
    }
  }, [dispatch, id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newMessage.trim()) return;

    try {
      await dispatch(sendMessage({ conversationId: id, message: newMessage })).unwrap();
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const currentConversation = id
    ? conversations.find((c) => c.id === id)
    : null;

  return (
    <div className="flex h-[calc(100vh-200px)]">
      <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900 p-4 border-b">
          Conversaciones
        </h2>
        {conversations.map((conversation) => {
          const otherParticipant =
            conversation.participant1.id === user?.id
              ? conversation.participant2
              : conversation.participant1;
          const otherName = otherParticipant.providerProfile?.businessName ||
            `${otherParticipant.profile?.firstName} ${otherParticipant.profile?.lastName}` ||
            otherParticipant.email;

          return (
            <a
              key={conversation.id}
              href={`/app/chat/${conversation.id}`}
              className={`block p-4 border-b hover:bg-gray-50 ${
                id === conversation.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="font-semibold text-blue-600">
                    {otherName.charAt(0)}
                  </span>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{otherName}</p>
                  {conversation.messages[0] && (
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.messages[0].message}
                    </p>
                  )}
                </div>
                {conversation.messages[0] && (
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(conversation.lastMessageAt || conversation.messages[0].createdAt), { locale: es })}
                  </span>
                )}
              </div>
            </a>
          );
        })}
      </div>

      <div className="flex-1 flex flex-col">
        {id && currentConversation ? (
          <>
            <div className="p-4 border-b bg-white">
              <h3 className="font-semibold text-gray-900">
                {currentConversation.participant1.id === user?.id
                  ? currentConversation.participant2.providerProfile?.businessName ||
                    currentConversation.participant2.profile?.firstName
                  : currentConversation.participant1.providerProfile?.businessName ||
                    currentConversation.participant1.profile?.firstName}
              </h3>
              {currentConversation.request && (
                <p className="text-sm text-gray-500">
                  Re: {currentConversation.request.title}
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isOwn = message.senderId === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwn
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p>{message.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwn ? 'text-blue-200' : 'text-gray-400'
                        }`}
                      >
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: es })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button type="submit" disabled={!newMessage.trim()}>
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Selecciona una conversación</p>
          </div>
        )}
      </div>
    </div>
  );
}
