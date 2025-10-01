import React, { useEffect, useState } from "react";
import { formatTelegramMessage } from "../formatter";

interface ResultModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    content: string;
}

const ResultModal: React.FC<ResultModalProps> = ({ open, onClose, title, content }) => {
    const [show, setShow] = useState(false);
    const [active, setActive] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (open) {
            setShow(true);
            setTimeout(() => setActive(true), 10);
        } else {
            setActive(false);
            setTimeout(() => setShow(false), 300);
            setCopied(false);
        }
    }, [open]);

    const handleCopy = async () => {
        try {
            const parsed = JSON.parse(content);
            const formatted = formatTelegramMessage(parsed);
            await navigator.clipboard.writeText(formatted);
        } catch {
            await navigator.clipboard.writeText(content);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!show) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm transition-all duration-300 ${
                active ? "opacity-100" : "opacity-0"
            }`}
            onClick={onClose}
        >
            <div
                className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg max-h-[85vh] sm:max-h-[75vh] flex flex-col relative border-t-4 border-cyan-500 transform transition-all duration-300 ${
                    active ? "translate-y-0 sm:scale-100 opacity-100" : "translate-y-full sm:translate-y-0 sm:scale-95 opacity-0"
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle Indicator برای موبایل */}
                <div className="sm:hidden flex justify-center pt-2">
                    <div className="w-12 h-1.5 bg-gray-600 rounded-full"></div>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between p-5 pb-3 border-b border-gray-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-lg">
                            📋
                        </div>
                        <h2 className="text-lg font-bold text-white">{title || "نتیجه درخواست"}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center bg-gray-700/50 hover:bg-gray-600/50 rounded-xl transition-all active:scale-95"
                    >
                        <span className="text-gray-300 text-xl">✕</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 pt-3">
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/30 shadow-inner">
                        {(() => {
                            try {
                                const parsed = JSON.parse(content);
                                const formatted = formatTelegramMessage(parsed);
                                return (
                                    <pre className="text-gray-200 text-sm whitespace-pre-wrap break-words text-right font-mono leading-relaxed">
                                        {formatted}
                                    </pre>
                                );
                            } catch {
                                return (
                                    <pre className="text-gray-200 text-sm whitespace-pre-wrap break-words text-right font-mono leading-relaxed">
                                        {content}
                                    </pre>
                                );
                            }
                        })()}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-700/50 bg-gray-800/30 backdrop-blur-sm">
                    <div className="flex gap-2">
                        <button
                            onClick={handleCopy}
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 py-3 rounded-xl font-bold text-sm shadow-lg transition-all duration-200 active:scale-95"
                        >
                            {copied ? (
                                <>
                                    <span>✓</span>
                                    <span>کپی شد!</span>
                                </>
                            ) : (
                                <>
                                    <span>📋</span>
                                    <span>کپی متن</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 flex items-center justify-center gap-2 bg-gray-700/50 hover:bg-gray-600/50 py-3 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95"
                        >
                            <span>🔙</span>
                            <span>بستن</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultModal;