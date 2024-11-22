import { create } from "zustand";
import { axiosInstance } from "../libs/axios";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

interface AuthUser {
  _id: string;
  name: string;
  email: string;
  profilePic: string;
  fullName: string;
  createdAt?: string;

}

export interface SignupData {
  fullName: string;
  email: string;
  password: string;

}

interface LoginData {
  email: string;
  password: string;
}

interface UpdateProfileData {
  name?: string;
  fullName?: string,
  email?: string;
  profilePic: string;

}

interface AuthStore {
  authUser: AuthUser | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  onlineUsers: string[];
  isCheckingAuth: boolean;
  socket: Socket | null;
  checkAuth: () => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  onlineUsers: [],
  isCheckingAuth: true,
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get<AuthUser>("/auth/verify");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error: any) {
      console.error("Error in check auth: ", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post<AuthUser>("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error signing up");
    } finally {
      set({ isSigningUp: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error logging out");
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post<AuthUser>("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error logging in");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put<AuthUser>("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error in update profile:", error);
      toast.error(error.response?.data?.message || "Error updating profile");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const newSocket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });

    set({ socket: newSocket });

    newSocket.on("connect", () => {
      console.log("Socket connected");
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    newSocket.on("getOnlineUsers", (userIds: string[]) => {
      set({ onlineUsers: userIds || [] });
    });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) socket.disconnect();
    set({ socket: null });
  },
}));
