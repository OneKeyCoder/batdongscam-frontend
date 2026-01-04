'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, StopCircle, Eraser, Sparkles, Database, ChevronDown, ChevronRight, EyeOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// Đảm bảo đường dẫn import đúng
import { streamChatResponse, ChatEvent } from '@/lib/api/services/ai.service';

// --- TYPES ---
interface Message {
  id: number | string;
  role: 'user' | 'ai';
  type: 'text' | 'table' | 'error';
  content: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

// --- 1. COMPONENT HIỂN THỊ TRẠNG THÁI ---
const TypingIndicator = () => (
  <div className="flex space-x-1 p-2">
    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
  </div>
);

// --- 2. COMPONENT BẢNG THÔNG MINH (Ẩn cột rác) ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SmartTable = ({ data }: { data: any }) => {
  if (!data || !data.columns || !data.data) return null;

  // Lọc bỏ các cột kỹ thuật không cần thiết cho người dùng cuối
  const hiddenColumns = ['id', '_id', 'uuid', 'guid', 'password', 'token', 'created_at', 'updated_at', 'deleted_at'];
  const isHidden = (col: string) => {
    const lower = col.toLowerCase();
    // Ẩn nếu tên cột nằm trong blacklist HOẶC kết thúc bằng _id (trừ khi bảng chỉ có 1 cột)
    return (hiddenColumns.includes(lower) || (lower.endsWith('_id') && data.columns.length > 1));
  };

  const visibleColumns = data.columns.filter((col: string) => !isHidden(col));
  // Nếu lọc hết thì hiển thị lại tất cả (fallback)
  const columnsToShow = visibleColumns.length > 0 ? visibleColumns : data.columns;

  const formatValue = (val: any, colName: string) => {
    if (val === null || val === undefined) return '-';
    const lowerCol = colName.toLowerCase();

    // Format tiền tệ
    if (['price', 'amount', 'total', 'revenue', 'salary', 'doanh thu', 'giá'].some(k => lowerCol.includes(k)) && typeof val === 'number') {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    }
    // Format ngày tháng đơn giản
    if (['date', 'day', 'time'].some(k => lowerCol.includes(k)) && typeof val === 'string') {
      try {
        const d = new Date(val);
        if (!isNaN(d.getTime())) return d.toLocaleDateString('vi-VN');
      } catch { }
    }
    return val;
  };

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
        <Database className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-xs font-bold text-gray-700 uppercase">Kết quả tra cứu</span>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 font-medium text-gray-600">
            <tr>
              {columnsToShow.map((col: string) => (
                <th key={col} className="px-4 py-3 whitespace-nowrap capitalize border-b border-gray-200">
                  {col.replace(/_/g, ' ')} {/* Bỏ dấu gạch dưới cho đẹp */}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {data.data.map((row: any, i: number) => (
              <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                {columnsToShow.map((col: string) => (
                  <td key={col} className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {formatValue(row[col], col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.data.length === 0 && (
        <div className="p-4 text-center text-gray-400 text-sm italic">Không tìm thấy dữ liệu phù hợp.</div>
      )}
    </div>
  );
};

// --- 3. COMPONENT TIN NHẮN (Ẩn SQL & Debug) ---
const ChatMessageItem = ({ msg }: { msg: Message }) => {
  const isUser = msg.role === 'user';
  const [showDebug, setShowDebug] = useState(false);

  // Logic phát hiện nội dung kỹ thuật (SQL)
  const isTechnicalContent = !isUser && msg.type === 'text' && (
    msg.content.includes('SELECT') ||
    msg.content.includes('```sql') ||
    msg.content.length > 500 // Nội dung quá dài thường là giải thích rườm rà
  );

  return (
    <div className={`group flex gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-md mt-1 border border-white/20 ${isUser ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-white border-gray-200'
        }`}>
        {isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-blue-600" />}
      </div>

      <div className={`flex flex-col max-w-[90%] sm:max-w-[80%]`}>
        <div className={`relative px-5 py-3.5 rounded-2xl shadow-sm text-[15px] leading-relaxed border ${isUser
            ? 'bg-gradient-to-br from-red-500 to-red-600 text-white rounded-tr-sm border-transparent'
            : 'bg-white text-gray-800 border-gray-100 rounded-tl-sm'
          }`}>
          {msg.type === 'error' && (
            <div className="flex items-center gap-2 text-red-600 font-medium bg-red-50 -mx-2 -my-1 p-2 rounded">
              <span>⚠️ {msg.content}</span>
            </div>
          )}

          {msg.type === 'text' && (
            <div className="w-full">
              {/* Nếu là nội dung kỹ thuật/SQL -> Ẩn đi mặc định */}
              {isTechnicalContent ? (
                <div className="mb-2">
                  <button
                    onClick={() => setShowDebug(!showDebug)}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 px-2 py-1 rounded border border-gray-200"
                  >
                    {showDebug ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    {showDebug ? 'Thu gọn chi tiết kỹ thuật' : 'Xem chi tiết xử lý (SQL)'}
                  </button>
                  {showDebug && (
                    <div className={`prose prose-sm max-w-none mt-2 p-3 bg-gray-50 rounded-lg text-xs font-mono border border-gray-200 overflow-x-auto ${isUser ? 'prose-invert' : ''}`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              ) : (
                // Nội dung hội thoại bình thường
                <div className={`prose prose-sm max-w-none break-words ${isUser ? 'prose-invert prose-p:text-white prose-headings:text-white' : 'prose-headings:text-gray-800 prose-a:text-blue-600'}`}>
                  {msg.content ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  ) : (
                    <span className="opacity-50 italic text-sm">Đang phân tích yêu cầu...</span>
                  )}
                </div>
              )}
            </div>
          )}

          {msg.type === 'table' && msg.data && (
            <SmartTable data={msg.data} />
          )}
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
export default function AdminAIChatPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const streamBufferRef = useRef(''); // FIX LỖI LẶP CHỮ

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    streamBufferRef.current = ''; // Reset buffer
    const userMsg: Message = { id: Date.now(), role: 'user', type: 'text', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    const aiMsgId = Date.now() + 1;
    setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', type: 'text', content: '' }]);

    await streamChatResponse(
      userMsg.content,
      (event: ChatEvent) => {
        if (event.type === 'text') streamBufferRef.current += event.content;

        setMessages((prev) => prev.map((msg) => {
          if (msg.id !== aiMsgId) return msg;
          const updated = { ...msg };

          if (event.type === 'text') {
            updated.content = streamBufferRef.current;
          }
          else if (event.type === 'dataframe') {
            updated.type = 'table';
            updated.data = event.data;
            // Xóa text thừa nếu có bảng dữ liệu để giao diện sạch hơn
            if (updated.content.includes('SELECT') || updated.content.length < 50) {
              updated.content = '';
            }
          }
          else if (event.type === 'error') {
            updated.type = 'error';
            updated.content = event.content || 'Lỗi xử lý';
          }
          return updated;
        }));
      },
      () => setIsStreaming(false)
    );
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="flex flex-col h-[calc(100vh-1rem)] bg-gray-50/50">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-2 px-6 py-4 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-600 fill-red-50" />
            Trợ lý Dữ liệu Thông minh
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Tra cứu thông tin Bất động sản & Doanh thu</p>
        </div>
        <button onClick={clearChat} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
          <Eraser className="w-4 h-4" /> Làm mới
        </button>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar scroll-smooth">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full space-y-5 opacity-70">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-red-50 rounded-3xl transform rotate-6 scale-90 -z-10"></div>
              <Bot className="w-10 h-10 text-red-500" />
            </div>
            <p className="text-gray-500 text-sm">Sẵn sàng hỗ trợ phân tích dữ liệu...</p>
          </div>
        )}

        {messages.map((msg) => <ChatMessageItem key={msg.id} msg={msg} />)}

        {isStreaming && messages[messages.length - 1]?.role === 'ai' && !messages[messages.length - 1]?.data && !streamBufferRef.current && (
          <div className="flex gap-3 w-full animate-in fade-in duration-300 pl-1">
            <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div className="bg-white border border-gray-100 px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm flex items-center">
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={scrollRef} className="h-2" />
      </div>

      {/* INPUT */}
      <div className="p-4 bg-white/90 backdrop-blur-md border-t border-gray-200">
        <div className="max-w-4xl mx-auto relative flex items-center bg-gray-50 border border-gray-300 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-red-500 transition-all">
          <input
            type="text"
            className="flex-1 px-4 py-3.5 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
            placeholder="Ví dụ: Top 5 dự án có doanh thu cao nhất tại TP.HCM..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isStreaming}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className={`p-2 mr-2 rounded-lg transition-all ${input.trim() && !isStreaming ? 'bg-red-600 text-white hover:bg-red-700 shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            {isStreaming ? <StopCircle className="w-5 h-5 animate-pulse" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}