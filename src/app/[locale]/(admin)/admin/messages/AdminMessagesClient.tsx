'use client';

import { useState } from 'react';
import { markMessageAsRead, deleteContactMessage } from '@/app/actions/admin';

export interface AdminMessageItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminMessagesClient({
  initialMessages,
}: {
  initialMessages: AdminMessageItem[];
}) {
  const [messages, setMessages] = useState<AdminMessageItem[]>(initialMessages);
  const [selectedId, setSelectedId] = useState<string>(
    initialMessages.length > 0 ? initialMessages[0].id : ''
  );
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replySuccess, setReplySuccess] = useState(false);

  const filteredMessages = messages.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.subject && m.subject.toLowerCase().includes(search.toLowerCase())) ||
      m.message.toLowerCase().includes(search.toLowerCase())
  );

  const selectedMessage = messages.find((m) => m.id === selectedId);

  const handleSelect = async (msg: AdminMessageItem) => {
    setSelectedId(msg.id);
    setReplySuccess(false);
    if (!msg.isRead) {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m))
      );
      try {
        await markMessageAsRead(msg.id);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous supprimer ce message ?')) return;
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selectedId === id) {
      const remaining = messages.filter((m) => m.id !== id);
      setSelectedId(remaining.length > 0 ? remaining[0].id : '');
    }
    try {
      await deleteContactMessage(id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedMessage) return;
    setReplySuccess(true);
    setTimeout(() => {
      setReplyText('');
      setReplySuccess(false);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-3">
            <span>✉️</span>
            <span>Messages & Demandes de Contact</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Consultez les messages reçus depuis le formulaire de contact du site.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-amber-50 text-amber-800 font-bold px-3 py-1.5 rounded-full border border-amber-200">
            {messages.filter((m) => !m.isRead).length} non lu(s)
          </span>
          <span className="text-xs bg-gray-100 text-gray-700 font-semibold px-3 py-1.5 rounded-full">
            Total : {messages.length}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 min-h-[580px] overflow-hidden">
        {/* Messages List Sidebar */}
        <div className="border-r border-gray-100 flex flex-col bg-gray-50/30">
          <div className="p-4 border-b border-gray-100 bg-white">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom, email, mot..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#D4A72C] focus:bg-white transition"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                Aucun message trouvé
              </div>
            ) : (
              filteredMessages.map((m) => {
                const dateStr = new Date(m.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div
                    key={m.id}
                    onClick={() => handleSelect(m)}
                    className={`p-4 cursor-pointer transition relative ${
                      m.id === selectedId
                        ? 'bg-amber-50/70 border-l-4 border-[#D4A72C]'
                        : !m.isRead
                        ? 'bg-white font-semibold hover:bg-gray-50'
                        : 'bg-white hover:bg-gray-50 opacity-75'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs font-bold text-gray-900 truncate pr-2">
                        {m.name}
                      </p>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {dateStr}
                      </span>
                    </div>
                    <p className="text-xs text-gray-800 font-medium truncate mb-1">
                      {m.subject || 'Message sans objet'}
                    </p>
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                      {m.message}
                    </p>
                    {!m.isRead && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4A72C] text-[#111827]">
                        Nouveau
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Message Details Preview */}
        <div className="col-span-2 p-6 md:p-8 flex flex-col justify-between bg-white">
          {selectedMessage ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-gray-100 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedMessage.subject || 'Message de contact'}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="font-semibold text-xs text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md">
                      👤 {selectedMessage.name}
                    </span>
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="text-xs text-blue-600 hover:underline bg-blue-50 px-2.5 py-1 rounded-md"
                    >
                      ✉️ {selectedMessage.email}
                    </a>
                    {selectedMessage.phone && (
                      <a
                        href={`tel:${selectedMessage.phone}`}
                        className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md hover:underline font-mono"
                      >
                        📞 {selectedMessage.phone}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {new Date(selectedMessage.createdAt).toLocaleString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                    title="Supprimer ce message"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Message body */}
              <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line bg-gray-50/80 p-6 rounded-2xl border border-gray-100">
                {selectedMessage.message}
              </div>

              {/* Reply section */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Répondre à {selectedMessage.name}
                  </h3>
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                      selectedMessage.subject || 'Votre demande ILYMED CAR'
                    )}`}
                    className="text-xs text-[#D4A72C] font-semibold hover:underline"
                  >
                    ↗ Ouvrir dans votre client Email
                  </a>
                </div>

                {replySuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 text-xs mb-3 font-semibold">
                    ✓ Réponse simulée enregistrée avec succès ! (Un email a été préparé pour {selectedMessage.email})
                  </div>
                )}

                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Bonjour ${selectedMessage.name},\nMerci pour votre message...`}
                  className="w-full border border-gray-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-[#D4A72C] focus:border-transparent resize-none bg-gray-50/50 focus:bg-white transition"
                />
                <div className="flex justify-end gap-3 mt-3">
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className="bg-[#111827] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#D4A72C] hover:text-[#111827] transition shadow disabled:opacity-40"
                  >
                    Envoyer la réponse
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
              <span className="text-4xl">📬</span>
              <p>Sélectionnez un message dans la liste pour le consulter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
