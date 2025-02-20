"use client";
import React, { useState, useEffect } from "react";
import { openDB, saveToDB } from "@/utils/indexedDB";
import { Send, Bot, Loader2, ArrowLeft, Mic, ChevronDown, ChevronRight, X, FileUp } from "lucide-react";
import Sidebar from "@/components/chat/sidebar";
import Link from "next/link";
import VoiceModal from "@/components/chat/VoiceModal";

// Helper function to get a cookie by name.
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

const ChatbotPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<
    { role: string; text: string; queryType?: string; data?: any; generatedQueries?: any; taskExecution?: any; pinecone?: any }[]
  >([{ role: "system", text: "Please upload a PDF to start the conversation. After uploading click on go to dashboard to get more insights." }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [anomalyLoading, setIsAnomalyLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [refreshChatHistory, setRefreshChatHistory] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set());
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [attachedFileNames, setAttachedFileNames] = useState<string[]>([]);
  const [isPdfUploaded, setIsPdfUploaded] = useState<boolean>(false);
  const [anomalyData, setAnomalyData] = useState<any>(null); // New state for anomaly data

  // Speech function using the browser API.
  const speak = (text: string) => {
    console.log(`Speaking: ${text}`);
    setIsSpeaking(true);

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Clean the text from HTML and special characters.
    const cleanText = text
      .replace(/<[^>]*>/g, "")
      .replace(/[`~@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, " ")
      .replace(/\s+/g, " ")
      .replace(/(\d+)/g, (match) => match.split("").join(" "))
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
          console.error("Speech synthesis error:", event);
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
    const userDataString = localStorage.getItem("userData");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setUserId(userData.id);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
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

  // Function to send a message.
  const sendMessage = async () => {
    if (!input.trim()) return;
    setVoiceTranscript(null);
    const userInput = input;
    setInput("");
    setIsLoading(true);

    const newMessages = [...messages, { role: "user", text: userInput }];
    setMessages(newMessages);

    try {
      const formData = new FormData();
      formData.append("query", userInput);
      formData.append("user_id", userId || "");
      if (conversationId) {
        formData.append("conversation_id", conversationId);
      }

      // Get token from localStorage
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8000/api/users/query/", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      if (!conversationId && data.conversation_id) {
        setConversationId(data.conversation_id);
        setRefreshChatHistory((prev) => !prev);
      }

      const assistantMessage = {
        role: "bot",
        text: data.response, // Change from data.content to data.response
        queryType: data.queryType,
        data: data.data,
        generatedQueries: data.generatedQueries,
        taskExecution: data.taskExecution,
        pinecone: data.pinecone,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [...prev, { role: "bot", text: "An error occurred while processing your message." }]);
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
  
    try {
      const formData = new FormData();
      formData.append("query", userInput);
      formData.append("user_id", userId || "");
      if (conversationId) {
        formData.append("conversation_id", conversationId);
      }
  
      const token = localStorage.getItem("token");
  
      const response = await fetch("http://localhost:8000/api/users/query/", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
  
      const data = await response.json();
  
      if (!conversationId && data.conversation_id) {
        setConversationId(data.conversation_id);
        setRefreshChatHistory((prev) => !prev);
      }
  
      const assistantMessage = {
        role: "bot",
        text: data.response,
        queryType: data.queryType,
        data: data.data,
        generatedQueries: data.generatedQueries,
        taskExecution: data.taskExecution,
        pinecone: data.pinecone,
      };
  
      setMessages((prev) => [...prev, assistantMessage]);
  
      let messageToSpeak = data.response;
      if (messageToSpeak.includes("<think>")) {
        messageToSpeak = messageToSpeak.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
      }
      speak(messageToSpeak);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [...prev, { role: "bot", text: "An error occurred while processing your message." }]);
    } finally {
      setIsLoading(false);
    }
  };
  

  // Function to start a new chat session.
  const startNewChat = () => {
    setMessages([{ role: "system", text: "Please upload a PDF to start the conversation. After uploading click on go to dashboard to get more insights." }]);
    setConversationId(null);
    setRefreshChatHistory((prev) => !prev);
    setIsPdfUploaded(false);
    setAnomalyData(null); // Reset anomaly data on new chat
  };

  // Update the loadConversation function in ChatbotPage
  const loadConversation = async (convId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/users/chat/${convId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to load conversation");

      const data = await response.json();
      if (data && data.messages) {
        setMessages(
          data.messages.map((msg: any) => ({
            role: msg.role === "assistant" ? "bot" : msg.role, // Keep system role as-is
            text: msg.content,
            timestamp: msg.timestamp,
          }))
        );
        setConversationId(convId);

        // Load any associated PDF files
        if (data.pdf_files && data.pdf_files.length > 0) {
          setIsPdfUploaded(true);
          setAttachedFileNames([]);
        }
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
    setExpandedMessages((prev) => {
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
    if (selectedFiles.length === 0) return;
    setIsLoading(true);
    setIsAnomalyLoading(true);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append(`files`, file);
    });
    formData.append("user_id", userId || "");
    if (conversationId) {
      formData.append("conversation_id", conversationId);
    }

    try {
      const token = localStorage.getItem("token");

      // Step 1: Process PDFs
      const processResponse = await fetch("http://localhost:8000/api/users/process-pdfs/", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!processResponse.ok) {
        throw new Error("Failed to process PDFs");
      }

      const processData = await processResponse.json();

      if (!conversationId && processData.conversation_id) {
        setConversationId(processData.conversation_id);
        setRefreshChatHistory((prev) => !prev);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: processData.message || `${selectedFiles.length} PDF(s) processed successfully!`,
          data: {
            status: processData.status,
            message: processData.message,
          },
        },
      ]);

      setIsPdfUploaded(true);
      setIsLoading(false);

      // Step 2: Call the analysis route to generate visualizations
      const analysisFormData = new FormData();
      selectedFiles.forEach((file) => {
        analysisFormData.append(`files`, file);
      });
      analysisFormData.append("user_id", userId || "");
      analysisFormData.append("conversation_id", processData.conversation_id || "");

      const analysisResponse = await fetch("http://localhost:8000/api/analysis/structured_json/", {
        method: "POST",
        body: analysisFormData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!analysisResponse.ok) {
        throw new Error("Failed to fetch analysis data");
      }

      const analysisData = await analysisResponse.json();

      // Save analysis data to IndexedDB
      const db = await openDB("ChatbotDB", "analysisData");
      await saveToDB(db, "analysisData", {
        id: `analysisData_${processData.conversation_id}`,
        value: analysisData,
      });

      // Step 3: Fetch anomaly data
      const anomalyFormData = new FormData();
      selectedFiles.forEach((file) => {
        anomalyFormData.append(`files`, file);
      });
      anomalyFormData.append("user_id", userId || "");
      anomalyFormData.append("conversation_id", processData.conversation_id || "");

      const anomalyResponse = await fetch("http://localhost:8000/api/anomaly/anomaly-processing", {
        method: "POST",
        body: anomalyFormData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!anomalyResponse.ok) {
        throw new Error("Failed to fetch anomaly data");
      }

      const anomalyData = await anomalyResponse.json();
      localStorage.setItem(`anomalyData_${processData.conversation_id}`, JSON.stringify(anomalyData));
    } catch (error) {
      console.error("Error processing PDFs:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "An error occurred while processing the PDF files.",
        },
      ]);
    } finally {
      setIsAnomalyLoading(false);
      setSelectedFiles([]);
      setAttachedFileNames([]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Filter only PDF files
      const pdfFiles = files.filter((file) => file.type === "application/pdf");
      setSelectedFiles((prevFiles) => [...prevFiles, ...pdfFiles]);
      setAttachedFileNames((prevNames) => [...prevNames, ...pdfFiles.map((file) => file.name)]);
      setInput(""); // Clear any text input when files are attached
    }
  };

  const handleSend = async () => {
    if (selectedFiles.length > 0) {
      await handleFileUpload();
      setAttachedFileNames([]); // Clear the file names after upload
    } else {
      await sendMessage();
    }
  };

  return (
    <div className="flex">
      <Sidebar
        userId={userId || ""}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelectChat={handleSelectChat}
        onNewChat={startNewChat}
        refreshChatHistory={refreshChatHistory}
      />

      <div className="flex flex-col h-screen w-full bg-[#0A0A0F]">
        <header className="shadow-lg border border-b-2 p-6 text-center text-2xl font-bold text-white flex gap-2 justify-between">
          <div className="flex">
            <Link href="/">
              <ArrowLeft />
            </Link>
            <Link href="/">AI Chat Assistant</Link>
          </div>
          {isPdfUploaded && (
            <div className="flex gap-2">
              <Link
                href={`/dashboard/${conversationId}`}
                className={`bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 p-2 rounded-xl text-sm ${
                  anomalyLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={(e) => anomalyLoading && e.preventDefault()}
              >
                Dashboard
              </Link>
              {isPdfUploaded && !anomalyLoading ? (
                <Link
                  href={{
                    pathname: `/anomaly`,
                    query: { user_id: userId, conversation_id: conversationId },
                  }}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 p-2 rounded-xl text-sm"
                >
                  Anomalies
                </Link>
              ) : (
                <Loader2 className="w-5 h-5 animate-spin text-white/60 self-center items-center" />
              )}
            </div>
          )}
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className="space-y-2">
              <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-3xl p-4 rounded-2xl shadow-lg border transition-transform hover:scale-[1.02] ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                      : msg.role === "system"
                      ? "bg-gray-800 text-green-400" // System messages in green
                      : "bg-gray-800 text-white" // Bot messages in gray
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {(msg.role === "bot" || msg.role === "system") && <Bot className="w-6 h-6 mt-1 text-white/80" />}
                    <div className="space-y-2 w-full">
                      {msg.data && msg.data.status === "success" ? (
                        <div className="text-green-400">{msg.data.message || msg.text}</div>
                      ) : (
                        <div className="message-content">{msg.text}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <Loader2 className="w-5 h-5 animate-spin text-white/60" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="bg-gray-900 p-4 flex items-center border-t border-gray-700">
          <div className="flex-1 relative flex items-center">
            <label htmlFor="file-upload" className="p-3 text-white/80 hover:text-white cursor-pointer" title="Attach PDFs">
              <FileUp className="w-5 h-5" />
            </label>
            <input type="file" id="file-upload" className="hidden" accept=".pdf" multiple onChange={handleFileSelect} />
            <div className="flex-1 relative">
              {attachedFileNames.length > 0 ? (
                <div className="w-full p-3 bg-gray-800 text-white rounded-full border border-gray-700">
                  <span className="text-gray-400">Selected files: </span>
                  {attachedFileNames.join(", ")}
                </div>
              ) : (
                <input
                  type="text"
                  className={`w-full p-3 bg-gray-800 text-white rounded-full border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                    !isPdfUploaded && selectedFiles.length === 0 ? "cursor-not-allowed" : ""
                  }`}
                  placeholder={!isPdfUploaded && selectedFiles.length === 0 ? "Please upload PDFs first" : "Type your message..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (isPdfUploaded || selectedFiles.length > 0) && handleSend()}
                  disabled={!isPdfUploaded && selectedFiles.length === 0}
                />
              )}
              {(voiceTranscript || attachedFileNames.length > 0) && (
                <button
                  onClick={() => {
                    handleDiscardInput();
                    setSelectedFiles([]);
                    setAttachedFileNames([]);
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-white/80 hover:text-red-500"
                  title="Clear input"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
          <button
            onClick={handleSend}
            className={`ml-2 p-3 rounded-full ${
              isPdfUploaded || selectedFiles.length > 0
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                : "bg-gray-600 cursor-not-allowed"
            } transition-colors`}
            disabled={isLoading || (!input.trim() && selectedFiles.length === 0) || (!isPdfUploaded && selectedFiles.length === 0)}
            title={!isPdfUploaded && selectedFiles.length === 0 ? "Upload a PDF first" : "Send message"}
          >
            <Send className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className={`ml-2 p-3 rounded-full ${
              isPdfUploaded
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                : "bg-gray-600 cursor-not-allowed"
            } transition-colors`}
            disabled={isLoading || selectedFiles.length > 0 || !isPdfUploaded}
            title={!isPdfUploaded ? "Upload a PDF first" : "Voice input"}
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
