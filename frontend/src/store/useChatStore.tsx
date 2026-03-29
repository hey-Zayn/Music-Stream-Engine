import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import type { Message, User } from "@/types";
import { io, type Socket } from "socket.io-client";
import toast from "react-hot-toast";

interface chatStore {
  users: User[];
  isLoading: boolean;
  error: string | null;
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
  userActivities: Map<string, string>;
  messages: Message[];
  selectedUser: User | null;
  pollingInterval: number | null;

  fetchUsers: () => Promise<void>;
  initSocket: (userId: string) => void;
  disconnectSocket: () => void;
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  fetchMessages: (userId: string) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
  startPolling: (userId: string) => void;
  stopPolling: () => void;
}

const baseURL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "https://music-bd.vercel.app";

const socket = io(baseURL, {
  autoConnect: false,
  withCredentials: true,
});

export const useChatStore = create<chatStore>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,
  socket: null,
  isConnected: false,
  onlineUsers: new Set(),
  userActivities: new Map(),
  messages: [],
  selectedUser: null,
  pollingInterval: null,

  setSelectedUser: (user) => set({ selectedUser: user }),

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get("/users");
      set({ users: res.data.user });
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error fetching users";
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  initSocket: (userId) => {
    if (!get().isConnected) {
      socket.auth = { userId };
      socket.connect();

      // Clear existing listeners
      const events = ["user_online", "activities", "user_connected", "user_disconnected", "receive_message", "message_sent", "activity_updated"];
      events.forEach(event => socket.off(event));

      socket.emit("user_connected", userId);
      set({ socket, isConnected: true });

      socket.on("user_online", (users: string[]) => {
        set({ onlineUsers: new Set(users) });
      });

      socket.on("activities", (activities: [string, string][]) => {
        set({ userActivities: new Map(activities) });
      });

      socket.on("user_connected", (id: string) => {
        set((state) => ({
          onlineUsers: new Set([...state.onlineUsers, id]),
        }));
      });

      socket.on("user_disconnected", (id: string) => {
        set((state) => {
          const newOnlineUsers = new Set(state.onlineUsers);
          newOnlineUsers.delete(id);
          return { onlineUsers: newOnlineUsers };
        });
      });

      const handleNewMessage = (message: Message) => {
        set((state) => {
          if (state.messages.some(m => m._id === message._id)) return state;
          const newMessages = [...state.messages, message].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          return { messages: newMessages };
        });
      };

      socket.on("receive_message", handleNewMessage);
      socket.on("message_sent", handleNewMessage);

      socket.on("connect_error", (error) => {
        console.error("Socket Connection Error:", error.message);
        if (import.meta.env.MODE !== "development") {
          // In production (Vercel), if socket fails, stop retrying and rely on polling
          socket.disconnect();
          set({ isConnected: false, socket: null });
        }
      });

      socket.on("activity_updated", ({ userId: id, activity }) => {
        set((state) => {
          const newActivities = new Map(state.userActivities);
          newActivities.set(id, activity);
          return { userActivities: newActivities };
        });
      });
    }
  },

  disconnectSocket: () => {
    if (get().isConnected) {
      socket.disconnect();
      set({ isConnected: false, socket: null });
    }
    get().stopPolling();
  },

  sendMessage: async (receiverId, content) => {
    if (!content.trim()) return;
    
    try {
      const response = await axiosInstance.post("/messages/send", {
        receiverId,
        content: content.trim(),
      });

      if (response.data.success) {
        const newMessage = response.data.data;
        set((state) => {
           if (state.messages.some(m => m._id === newMessage._id)) return state;
           const newMessages = [...state.messages, newMessage].sort(
             (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
           );
           return { messages: newMessages };
        });
        
        const sock = get().socket;
        if (sock && sock.connected) {
          sock.emit("send_message", { receiverId, content });
        }
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to send message";
      toast.error(errorMessage);
    }
  },

  fetchMessages: async (userId: string) => {
    const isFirstFetch = get().messages.length === 0;
    if (isFirstFetch) set({ isLoading: true, error: null });
    
    try {
      const response = await axiosInstance.get(`/users/message/${userId}`);
      const messagesPayload = Array.isArray(response.data)
        ? response.data
        : response.data?.messages ?? [];
      
      const sortedMessages = messagesPayload.sort(
        (a: Message, b: Message) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      if (JSON.stringify(sortedMessages) !== JSON.stringify(get().messages)) {
         set({ messages: sortedMessages });
      }
    } catch (error: unknown) {
      if (isFirstFetch) {
        const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error fetching messages";
        set({ error: errorMessage });
      }
    } finally {
      if (isFirstFetch) set({ isLoading: false });
    }
  },

  startPolling: (userId) => {
    get().stopPolling();
    const interval = window.setInterval(() => {
      if (!get().isConnected || !get().socket?.connected) {
         get().fetchMessages(userId);
      }
    }, 4000);
    set({ pollingInterval: interval });
  },

  stopPolling: () => {
    const interval = get().pollingInterval;
    if (interval !== null) {
      window.clearInterval(interval);
      set({ pollingInterval: null });
    }
  },
}));
