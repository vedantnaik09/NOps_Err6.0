"use client";
import React, { useState, useEffect } from "react";
import { Send, Bot, Loader2, ArrowLeft, Mic, ChevronDown, ChevronRight, X, FileUp } from "lucide-react";
import Sidebar from "@/components/chat/sidebar";
import Link from "next/link";
import VoiceModal from '@/components/chat/VoiceModal';

// Helper function to get a cookie by name.
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

const ChatbotPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<
    { role: string; text: string; queryType?: string; data?: any; generatedQueries?: any; taskExecution?: any; pinecone?: any }[]
  >([
    { role: "bot", text: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [refreshChatHistory, setRefreshChatHistory] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set());
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Speech function using the browser API.
  const speak = (text: string) => {
    console.log(`Speaking: ${text}`);
    setIsSpeaking(true);
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Clean the text from HTML and special characters.
    const cleanText = text
      .replace(/<[^>]*>/g, '')
      .replace(/[`~@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, ' ')
      .replace(/\s+/g, ' ')
      .replace(/(\d+)/g, (match) => match.split('').join(' '))
      .trim();
    
    // Split into sentences.
    const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
    let currentIndex = 0;
    
    const speakNextSentence = () => {
      if (currentIndex < sentences.length) {
        const utterance = new SpeechSynthesisUtterance(sentences[currentIndex].trim());
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.onend = () => {
          currentIndex++;
          if (currentIndex >= sentences.length) {
            setIsSpeaking(false);
          }
          speakNextSentence();
        };
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          currentIndex++;
          if (currentIndex >= sentences.length) {
            setIsSpeaking(false);
          }
          speakNextSentence();
        };
        window.speechSynthesis.speak(utterance);
      }
    };
    
    speakNextSentence();
    
    const maintainSpeech = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else {
        clearInterval(maintainSpeech);
        setIsSpeaking(false);
      }
    }, 5000);
  };

  // Retrieve the user ID from localStorage on component mount.
  useEffect(() => {
    const persistRoot = localStorage.getItem("persist:root");
    if (persistRoot) {
      try {
        const parsedRoot = JSON.parse(persistRoot);
        const parsedRootAuth = JSON.parse(parsedRoot.auth);
        if (parsedRootAuth.user) {
          setUserId(parsedRootAuth.user.id);
        }
      } catch (error) {
        console.error("Error parsing persist:root", error);
      }
    }
  }, []);

  // Ref to scroll to the latest message.
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to format message content.
  const formatMessage = (text: string) => {
    const escapeHtml = (unsafe: string) =>
      unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    let formattedText = escapeHtml(text);
    formattedText = formattedText.replace(/\\boxed{(.*?)}/g, '<span class="boxed">$1</span>');
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formattedText = formattedText
      .split("\n")
      .map((line) => {
        if (line.trim().startsWith("-")) {
          return `<li>${line.trim().substring(1).trim()}</li>`;
        }
        return line;
      })
      .join("<br/>");
    return formattedText;
  };

  // Function to send a message.
  const sendMessage = async () => {
    if (!input.trim()) return;
    setVoiceTranscript(null);
    const userInput = input;
    setInput("");
    setIsLoading(true);
  
    const newMessages = [...messages, { role: "user", text: userInput }];
    setMessages(newMessages);
  
    const history = newMessages.map((msg) =>
      msg.role === "user" ? `User: ${msg.text}` : `Assistant: ${msg.text}`
    );
  
    try {
      const response = await fetch("http://localhost:5000/api/users/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          prompt: userInput,
          history: history,
          conversationId
        }),
      });
  
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
  
      const data = await response.json();
  
      if (!conversationId && data.conversationId) {
        setConversationId(data.conversationId);
        setRefreshChatHistory((prev) => !prev);
      }
  
      const assistantMessage = {
        role: "bot",
        text: data.content,
        queryType: data.queryType,
        data: data.data,
        generatedQueries: data.generatedQueries,
        taskExecution: data.taskExecution,
        pinecone: data.pinecone
      };
  
      setMessages((prev) => [...prev, assistantMessage]);
  
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "An error occurred while processing your message." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function for handling voice input.
  const handleVoiceInput = async (transcript: string) => {
    setVoiceTranscript(transcript);
    setInput(transcript);
    setIsVoiceModalOpen(false);
    if (!transcript.trim()) return;
    const userInput = transcript;
    setInput("");
    setIsLoading(true);

    const newMessages = [...messages, { role: "user", text: transcript }];
    setMessages(newMessages);

    const history = newMessages.map((msg) =>
      msg.role === "user" ? `User: ${msg.text}` : `Assistant: ${msg.text}`
    );

    try {
      const response = await fetch("http://localhost:5000/api/users/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          prompt: userInput,
          history: history,
          conversationId
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      if (!conversationId && data.conversationId) {
        setConversationId(data.conversationId);
        setRefreshChatHistory((prev) => !prev);
      }

      const assistantMessage = {
        role: "bot",
        text: data.content,
        queryType: data.queryType,
        data: data.data,
        generatedQueries: data.generatedQueries,
        taskExecution: data.taskExecution,
        pinecone: data.pinecone
      };

      setMessages((prev) => [...prev, assistantMessage]);

      let messageToSpeak = data.content;
      if (messageToSpeak.includes("<think>")) {
        messageToSpeak = messageToSpeak.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
      }
      speak(messageToSpeak);

    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "An error occurred while processing your message." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to start a new chat session.
  const startNewChat = () => {
    setMessages([{ role: "bot", text: "Hello! How can I assist you today?" }]);
    setConversationId(null);
    setRefreshChatHistory((prev) => !prev);
  };

  // Function to load a conversation by its ID.
  const loadConversation = async (convId: string) => {
    try {
      const accessToken = getCookie("accessToken");
      const response = await fetch(`http://localhost:5000/api/users/chat/${convId}`, {
        headers: {
          "Authorization": `Bearer ${accessToken || ""}`,
        },
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to load conversation");
      }
      const data = await response.json();
      if (data && data.data && data.data.messages) {
        setMessages(
          data.data.messages.map((msg: any) => ({
            role: msg.sender === "agent" ? "bot" : msg.sender,
            text: msg.message,
          }))
        );
        setConversationId(convId);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  // Callback for selecting a chat from the sidebar.
  const handleSelectChat = async (convId: string) => {
    console.log("Selected conversation:", convId);
    await loadConversation(convId);
  };

  const toggleMessageExpansion = (index: number) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleDiscardVoiceMessage = () => {
    setIsVoiceModalOpen(false);
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleDiscardInput = () => {
    setInput("");
    setVoiceTranscript(null);
  };

  // Function to handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/process_pdf/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process PDF");
      }

      const data = await response.json();
      
      // Store the response in localStorage
      localStorage.setItem("knowledgeGraphData", JSON.stringify(data));

      // Add a message to show the PDF was processed
      setMessages(prev => [...prev, {
        role: "bot",
        text: "PDF processed successfully! You can now ask questions about its content.",
        data: data
      }]);

    } catch (error) {
      console.error("Error processing PDF:", error);
      setMessages(prev => [...prev, {
        role: "bot",
        text: "An error occurred while processing the PDF file."
      }]);
    } finally {
      setIsLoading(false);
      setSelectedFile(null);
    }
  };

  return (
    <div className="flex">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelectChat={handleSelectChat}
        onNewChat={startNewChat}
        refreshChatHistory={refreshChatHistory}
      />

      <div className="flex flex-col h-screen w-full bg-[#0A0A0F]">
        <header className="shadow-lg border border-b-2 p-6 text-center text-2xl font-bold text-white flex gap-2 items-center">
          <Link href="/"><ArrowLeft /></Link>
          <span>AI Chat Assistant</span>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => {
            let thinkContent = null;
            let messageText = msg.text;
            if (msg.text.includes("<think>")) {
              const regex = /<think>([\s\S]*?)<\/think>/;
              const match = msg.text.match(regex);
              if (match) {
                thinkContent = match[1].trim();
                messageText = msg.text.replace(regex, "").trim();
              }
            }

            const isExpanded = expandedMessages.has(index);
            const hasDetails = msg.generatedQueries || msg.data || msg.pinecone;

            return (
              <div key={index} className="space-y-2">
                {thinkContent && (
                  <div className="text-white/60 italic text-sm max-w-3xl">
                    Thinking: {thinkContent}
                  </div>
                )}
                <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-3xl p-4 rounded-2xl shadow-lg border transition-transform hover:scale-105 ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                      : "bg-gray-800 text-white"
                  }`}>
                    <div className="flex items-start space-x-3">
                      {msg.role === "bot" && (
                        <Bot className="w-6 h-6 mt-1 text-white/80" />
                      )}
                      <div className="space-y-2 w-full">
                        <div
                          className="message-content"
                          dangerouslySetInnerHTML={{ __html: formatMessage(messageText) }}
                        />
                        {msg.queryType && (
                          <div className="mt-2 text-xs text-white/80 flex items-center justify-between">
                            <span>Source: {msg.queryType}</span>
                            {hasDetails && (
                              <button
                                onClick={() => toggleMessageExpansion(index)}
                                className="flex items-center gap-1 text-white/80 hover:text-white transition-colors"
                              >
                                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                <span>{isExpanded ? 'Hide Details' : 'Show Details'}</span>
                              </button>
                            )}
                          </div>
                        )}
                        {isExpanded && (
                          <div className="mt-2 space-y-3">
                            {msg.data && (
                              <div className="text-xs">
                                <div className="font-semibold text-white/80 mb-1">Results:</div>
                                <pre className="bg-gray-800 p-2 rounded-md overflow-x-auto text-white">
                                  {JSON.stringify(msg.data, null, 2)}
                                </pre>
                              </div>
                            )}
                            {msg.generatedQueries && (
                              <div className="text-xs">
                                <div className="font-semibold text-white/80 mb-1">Generated Queries:</div>
                                <pre className="bg-gray-800 p-2 rounded-md overflow-x-auto text-white">
                                  {JSON.stringify(msg.generatedQueries, null, 2)}
                                </pre>
                              </div>
                            )}
                            {msg.pinecone && (
                              <div className="text-xs">
                                <div className="font-semibold text-white/80 mb-1">
                                  Knowledge Base Results (Index: {msg.pinecone.index}):
                                </div>
                                <div className="bg-gray-800 p-2 rounded-md text-white">
                                  {msg.pinecone.matches.map((match: any, i: number) => (
                                    <div key={i} className="mb-2">
                                      <div className="text-white/70">Match {i + 1} (Score: {match.score.toFixed(4)})</div>
                                      <div className="text-white">{match.text}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {msg.taskExecution && (
                              <div className="text-xs">
                                <div className="font-semibold text-white/80 mb-1">Task Execution Results:</div>
                                <pre className="bg-gray-800 p-2 rounded-md overflow-x-auto text-white">
                                  {JSON.stringify(msg.taskExecution, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex justify-start">
              <Loader2 className="w-5 h-5 animate-spin text-white/60" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="bg-gray-900 p-4 flex items-center border-t border-gray-700">
          <div className="flex-1 relative">
            <input
              type="text"
              className="w-full p-3 bg-gray-800 text-white rounded-full border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            {voiceTranscript && (
              <button
                onClick={handleDiscardInput}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-white/80 hover:text-red-500"
                title="Discard voice input"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />
          <label
            htmlFor="file-upload"
            className="ml-2 p-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-colors cursor-pointer"
          >
            <FileUp className="w-5 h-5" />
          </label>
          {selectedFile && (
            <button
              onClick={handleFileUpload}
              className="ml-2 p-3 rounded-full bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 transition-colors"
              disabled={isLoading}
            >
              <Send className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={sendMessage}
            className="ml-2 p-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-colors"
            disabled={isLoading}
          >
            <Send className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="ml-2 p-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-colors"
            disabled={isLoading}
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>
        <VoiceModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          onTranscription={handleVoiceInput}
          isSpeaking={isSpeaking}
          onDiscard={handleDiscardVoiceMessage} 
        />
      </div>
    </div>
  );
};

export default ChatbotPage;