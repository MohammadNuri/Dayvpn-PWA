import React, { useState } from "react";
import { apiClient, sendTelegramMessage } from "../api";
import ResultModal from "./ResultModal";

const ClipLoader: React.FC<{ color: string; size: number }> = ({ color, size }) => (
    <div className="animate-spin rounded-full border-2 border-t-transparent"
        style={{ width: size, height: size, borderColor: color, borderTopColor: 'transparent' }} />
);

// const ResultModal: React.FC<{ open: boolean; onClose: () => void; title: string; content: string }> = ({ open, onClose, title, content }) => {
//     if (!open) return null;
//     return (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
//             <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
//                 <h3 className="text-xl font-bold mb-4">{title}</h3>
//                 <pre className="text-sm bg-gray-900 p-4 rounded-lg overflow-auto text-right whitespace-pre-wrap">{content}</pre>
//                 <button onClick={onClose} className="mt-4 w-full bg-cyan-500 hover:bg-cyan-600 py-2 rounded-lg font-semibold">بستن</button>
//             </div>
//         </div>
//     );
// };

interface ApiField {
    name: string;
    label: string;
    required?: boolean;
    type?: "text" | "number";
    min?: number;
}

interface ApiButton {
    label: string;
    method: "GET" | "POST";
    endpoint: string;
    fields?: ApiField[];
    icon?: string;
    color?: string;
}

const apiButtons: ApiButton[] = [
    { label: "وضعیت کل", method: "GET", endpoint: "status", icon: "📊", color: "from-blue-500 to-cyan-500" },
    {
        label: "لیست سرویس‌ها", method: "GET", endpoint: "clients", icon: "📋", color: "from-purple-500 to-pink-500",
        fields: [{ name: "limit", label: "تعداد سرویس", type: "number" }]
    },
    {
        label: "ساخت سرویس", method: "POST", endpoint: "create", icon: "➕", color: "from-green-500 to-emerald-500",
        fields: [
            { name: "gig", label: "حجم (گیگ)", type: "number", min: 0.5 },
            { name: "day", label: "تعداد روز", type: "number", min: 1 },
            { name: "test", label: "نوع (0=پولی, 1=تست)", type: "number", required: true },
        ]
    },
    {
        label: "جستجو", method: "POST", endpoint: "find", icon: "🔍", color: "from-yellow-500 to-orange-500",
        fields: [{ name: "username", label: "نام سرویس", required: true }]
    },
    {
        label: "تغییر لینک", method: "POST", endpoint: "change_link", icon: "🔗", color: "from-indigo-500 to-blue-500",
        fields: [{ name: "username", label: "نام سرویس", required: true }]
    },
    {
        label: "افزایش زمان", method: "POST", endpoint: "upg_time", icon: "⏰", color: "from-cyan-500 to-teal-500",
        fields: [
            { name: "username", label: "نام سرویس", required: true },
            { name: "day", label: "تعداد روز", type: "number", required: true, min: 1 },
        ]
    },
    {
        label: "افزایش حجم", method: "POST", endpoint: "upg_size", icon: "💾", color: "from-violet-500 to-purple-500",
        fields: [
            { name: "username", label: "نام سرویس", required: true },
            { name: "gig", label: "حجم (گیگ)", type: "number", required: true, min: 0.5 },
        ]
    },
    {
        label: "تغییر وضعیت", method: "POST", endpoint: "reverse_mode", icon: "🔄", color: "from-pink-500 to-rose-500",
        fields: [{ name: "username", label: "نام سرویس", required: true }]
    },
];

const Home: React.FC = () => {
    const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
    const [formData, setFormData] = useState<{ [key: string]: any }>({});
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState("");
    const [modalTitle, setModalTitle] = useState("");
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const handleInputChange = (index: number, field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [index]: { ...prev[index], [field]: value },
        }));
    };

    const handleApiCall = async (btn: ApiButton, index: number) => {
        if (loadingIndex !== null) return;

        const fields = btn.fields || [];
        for (let f of fields) {
            if (
                f.required &&
                (!formData[index] ||
                    formData[index][f.name] === undefined ||
                    formData[index][f.name] === "")
            ) {
                setModalContent(`فیلد ${f.label} اجباری است!`);
                setModalTitle("خطای اعتبارسنجی");
                setModalOpen(true);
                return;
            }
        }

        setLoadingIndex(index);

        try {
            let response;
            if (btn.method === "GET") {
                response = await apiClient.get(btn.endpoint, { params: formData[index] });
            } else {
                const formDataObj = new FormData();
                for (const key in formData[index]) {
                    formDataObj.append(key, formData[index][key]);
                }
                response = await apiClient.post(btn.endpoint, formDataObj);
            }

            const data = response.data;
            // برای مودال
            const message = data.ok
                ? JSON.stringify(data.result, null, 2)
                : data.error;

            setModalContent(message);
            setModalTitle(btn.label);
            setModalOpen(true);

            // برای تلگرام - کل دیتا رو ارسال کن
            await sendTelegramMessage(JSON.stringify(data, null, 2));

        } catch (error: any) {
            const message = error?.response?.data?.message || error.message;
            setModalContent(message);
            setModalTitle(`خطای ${btn.label}`);
            setModalOpen(true);
            await sendTelegramMessage(message);
        } finally {
            setLoadingIndex(null);
        }
    };

    const toggleExpand = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            {/* Header با طراحی مدرن */}
            <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50">
                <div className="px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            DayVPN
                        </h1>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            آنلاین
                        </div>
                    </div>
                </div>
            </div>

            {/* محتوای اصلی با padding مناسب */}
            <div className="px-4 py-6 pb-24 space-y-3">
                {apiButtons.map((btn, idx) => {
                    const isExpanded = expandedIndex === idx;
                    const hasFields = btn.fields && btn.fields.length > 0;

                    return (
                        <div
                            key={idx}
                            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 shadow-lg"
                        >
                            {/* Header قابل کلیک */}
                            <div
                                onClick={() => hasFields && toggleExpand(idx)}
                                className={`flex items-center justify-between p-4 ${hasFields ? 'cursor-pointer active:bg-gray-700/50' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`text-2xl bg-gradient-to-br ${btn.color} p-2 rounded-xl`}>
                                        {btn.icon}
                                    </div>
                                    <span className="font-semibold text-base">{btn.label}</span>
                                </div>
                                {hasFields && (
                                    <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                        ▼
                                    </div>
                                )}
                            </div>

                            {/* فیلدها و دکمه */}
                            {hasFields ? (
                                <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                                    <div className="px-4 pb-4 space-y-2 pt-1">
                                        {btn.fields?.map((f: ApiField) => (
                                            <input
                                                key={f.name}
                                                type={f.type === "number" ? "number" : "text"}
                                                min={f.min}
                                                placeholder={f.label}
                                                value={formData[idx]?.[f.name] || ""}
                                                onChange={(e) => handleInputChange(idx, f.name, e.target.value)}
                                                className="w-full rounded-xl px-4 py-3 text-sm bg-gray-700/50 text-white placeholder-gray-400 border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
                                                disabled={loadingIndex !== null}
                                            />
                                        ))}

                                        <button
                                            onClick={() => handleApiCall(btn, idx)}
                                            disabled={loadingIndex !== null}
                                            className={`w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${btn.color} px-4 py-3 text-sm font-bold shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100`}
                                        >
                                            {loadingIndex === idx ? (
                                                <ClipLoader color="#fff" size={18} />
                                            ) : (
                                                <>
                                                    <span>{btn.icon}</span>
                                                    <span>ارسال درخواست</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="px-4 pb-4">
                                    <button
                                        onClick={() => handleApiCall(btn, idx)}
                                        disabled={loadingIndex !== null}
                                        className={`w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${btn.color} px-4 py-3 text-sm font-bold shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100`}
                                    >
                                        {loadingIndex === idx ? (
                                            <ClipLoader color="#fff" size={18} />
                                        ) : (
                                            <>
                                                <span>{btn.icon}</span>
                                                <span>مشاهده</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <ResultModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalTitle}
                content={modalContent}
            />
        </div>
    );
};

export default Home;