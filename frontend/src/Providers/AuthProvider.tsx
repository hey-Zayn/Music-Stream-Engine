import { axiosInstance } from '@/lib/axios'
import { useAuth } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
// import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';

// Replaced updateApiToken with an Axios interceptor pattern for fresh tokens
// const updateApiToken = (token: string | null) => {
//     if (token) axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//     else delete axiosInstance.defaults.headers.common["Authorization"];
// };




const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { getToken, userId } = useAuth();
    const [loading, setLoading] = useState(true);
    // const { checkAdminStatus } = useAuthStore()
    const { initSocket, disconnectSocket } = useChatStore();
    useEffect(() => {
        const interceptor = axiosInstance.interceptors.request.use(
            async (config) => {
                try {
                    const token = await getToken();
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                } catch (error) {
                    console.error("Error setting auth token:", error);
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const initAuth = async () => {
            try {
                if (userId) {
                    initSocket(userId);
                }
            } catch (error) {
                console.log("Error in auth provider init:", error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // Clean up: disconnect socket AND remove interceptor
        return () => {
            disconnectSocket();
            axiosInstance.interceptors.request.eject(interceptor);
        };
    }, [getToken, userId, initSocket, disconnectSocket]);

    if (loading) {
        return (
            <>
                <div className='h-screen w-full flex items-center justify-center'>
                    <LoaderCircle className='size-20 text-emerald-500 animate-spin' />
                </div>
            </>
        )
    }
    return (
        <div>{children}</div>
    )
}

export default AuthProvider