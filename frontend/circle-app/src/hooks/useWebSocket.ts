// src/hooks/useWebSocket.ts
import { useEffect, useRef, useState } from "react";

export const useWebSocket = (url: string) => {
    const [lastMessage, setLastMessage] = useState<any>(null);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Inisialisasi koneksi
        ws.current = new WebSocket(url);

        ws.current.onopen = () => console.log("WS Connected to", url);
        
        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setLastMessage(data);
            } catch (err) {
                console.log("Received non-JSON message:", event.data);
            }
        };

        ws.current.onclose = () => console.log("WS Disconnected");

        // Cleanup: Tutup koneksi saat aplikasi ditutup/unmount
        return () => {
            ws.current?.close();
        };
    }, [url]);

    // Fungsi untuk mengirim pesan
    const sendMessage = (data: any) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(data));
        }
    };

    return { lastMessage, sendMessage };
};