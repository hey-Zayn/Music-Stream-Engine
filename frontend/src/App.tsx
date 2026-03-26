// import { Button } from "@/components/ui/button"
// import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/page/HomePage";
import ChatPage from "./pages/chat/page/ChatPage";
import AuthCallbackPage from "./pages/auth-callback/AuthCallbackPage";
// import { axiosInstance } from './lib/axios.js'
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import MainLayout from "./components/layout/MainLayout";
import AlbumPage from "./pages/album/AlbumPage";
import AdminPage from "./pages/admin/AdminPage";
import PlaylistPage from "./pages/playlists/PlaylistPage";
import NotFoundPage from "./pages/404/NotFoundPage";

const App = () => {
  return (
    <>
      {/* this main file */}
      <Routes>
        <Route
          path="/sso-callback"
          element={
            <AuthenticateWithRedirectCallback
              signUpForceRedirectUrl={"/auth-callback"}
            />
          }
        />
        <Route path="/auth-callback" element={<AuthCallbackPage />} />
        <Route path="/dashboard" element={<AdminPage />} />

        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          {/* <Route path='/' element={HomePage}/> */}
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/albums/:albumId" element={<AlbumPage />} />
          <Route path="/playlists/:id" element={<PlaylistPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
