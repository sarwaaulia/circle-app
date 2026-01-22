import type React from "react";
import { CircleX } from "lucide-react";

export interface ModalProps {
    children: React.ReactNode
    open: boolean,
    isClose: () => void,
}

export default function PostModal({children, open, isClose}: ModalProps) {
    if(!open) return null

    return (
        <div className="fixed inset-0 bg-blue items-start justify-center pt-20">
            <div onClick={isClose} className="max-w-lg relative bg-zinc-800 rounded-xl">
                <button className="top-3 right-3 absolute flex items-center justify-center rounded-fullcursor-pointer text-zinc-200 transition w-7 h-7">{CircleX}</button>
                {children}
            </div>
        </div>
    )
}