import React, { useEffect, useState } from "react";
import JsonFormatter from "../jsonFormatter";

interface ResultModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    content: string;
}

const ResultModal: React.FC<ResultModalProps> = ({ open, onClose, title, content }) => {
    const [show, setShow] = useState(false); // کنترل mount
    const [active, setActive] = useState(false); // کنترل کلاس transition

    useEffect(() => {
        if (open) {
            setShow(true); // mount modal
            setTimeout(() => setActive(true), 10); // فعال کردن transition بعد از mount
        } else {
            setActive(false); // شروع انیمیشن خروج
            setTimeout(() => setShow(false), 300); // بعد از انیمیشن، unmount
        }
    }, [open]);

    if (!show) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0"
                }`}
        >
            <div
                className={`bg-gray-900 rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg lg:max-w-xl max-h-[70vh] sm:max-h-[50vh] overflow-auto p-4 sm:p-6 relative transform transition-all duration-300 ${active ? "scale-100 opacity-100" : "scale-95 opacity-0"
                    }`}
            >
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <h2 className="text-lg sm:text-xl font-bold">{title || "نتیجه API"}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition text-sm sm:text-base"
                    >
                        ✕
                    </button>
                </div>

                <div className="text-gray-200 font-iryekan text-xs sm:text-sm p-2 sm:p-3 bg-gray-800 rounded-md 
                whitespace-pre-wrap break-words break-all overflow-x-auto text-right">
                    {(() => {
                        if (isJsonString(content)) {
                            return <JsonFormatter data={JSON.parse(content)} />;
                        } else {
                            return (
                                <pre className="text-gray-200 whitespace-pre-wrap break-words break-all text-right font-vazir">
                                    {content}
                                </pre>
                            );
                        }
                    })()}
                </div>
            </div>
        </div>
    );
};


function isJsonString(str: string) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

export default ResultModal;
