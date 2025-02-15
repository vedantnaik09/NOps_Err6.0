import React, { useEffect, useState } from "react";
import { History, Settings, Sun, LogOut, MessageSquare, User as UserIcon, X, Plus } from "lucide-react";

interface ChatHistoryItem {
  id: string;
  title: string;
  date: string;
}

interface SidebarProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectChat?: (chatId: string) => void;
  onNewChat?: () => void;
  refreshChatHistory: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ userId, isOpen, onClose, onSelectChat, onNewChat, refreshChatHistory }) => {
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  interface AuthObject {
    address: string;
  email: string;
  id: string;
  name: string;
  phoneNumber: string;
  user_type: string;
  }
  const [authObject, setAuthObject] = useState<AuthObject | null>(null);

    useEffect(() => {
      const userDataString = localStorage.getItem('userData');
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          console.log("userData", userData); 
          setAuthObject(userData);
        } catch (error) {
          console.error("Error parsing user data from localStorage:", error);
        }
      }
    }, []);

  useEffect(() => {
    console.log("userId", userId);
    if (userId) {
      const fetchChats = async () => {
        try {
          const accessToken = localStorage.getItem("token");
          const response = await fetch(`http://localhost:8000/api/users/chats`, {
            headers: {
              Authorization: `Bearer ${accessToken || ""}`,
            },
            credentials: "include",
          });

          if (!response.ok) throw new Error("Failed to fetch chats");

          const data = await response.json();
          setChatHistory(data.data || []);
        } catch (err) {
          console.error("Error fetching chat history:", err);
        }
      };

      fetchChats();
    }
  }, [userId, refreshChatHistory]);

  return (
    <div
      className={`top-0 left-0 min-h-screen max-h-screen w-64 bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-700 shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } z-50`}
    >
      <button onClick={onClose} className="md:hidden absolute right-2 top-2 p-2 text-gray-300 hover:text-white transition-colors">
        <X className="w-5 h-5" />
      </button>

      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#e0a943] flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-white">{authObject?.name}</h3>
            <p className="text-sm text-gray-400">{authObject?.email}</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-300 flex items-center">
            <History className="w-4 h-4 mr-2" />
            Chat History
          </h4>
          <button onClick={onNewChat} className="p-1 rounded hover:bg-gray-700">
            <Plus className="w-4 h-4 text-gray-300" />
          </button>
        </div>
        <div className="space-y-2 overflow-auto max-h-[60vh]">
          {chatHistory.length > 0 ? (
            chatHistory.map((chat) => (
              <button
                key={chat.id}
                onClick={() => {
                  onSelectChat && onSelectChat(chat.id);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-gray-700 transition-colors group flex items-center"
              >
                <MessageSquare className="w-4 h-4 text-gray-400 mr-2" />
                <div className="flex-1 truncate">
                  <p className="text-sm text-white truncate">{chat.title}</p>
                  <p className="text-xs text-gray-400">{chat.date}</p>
                </div>
              </button>
            ))
          ) : (
            <p className="text-sm text-gray-400">No chats found</p>
          )}
        </div>
      </div>

      <div className="p-4 space-y-2">
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </h4>
        <button className="w-full text-left p-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center">
          <Sun className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-sm text-white">Theme</span>
        </button>
        <button className="w-full text-left p-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center text-red-500">
          <LogOut className="w-4 h-4 mr-2" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
