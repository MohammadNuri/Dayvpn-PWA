import React, { useState } from "react";
import { apiClient, sendTelegramMessage } from "../api.ts";
import ResultModal from "./ResultModal.tsx";
import { showErrorToast } from "../toast.tsx";
import { useAuth } from "../AuthContext.tsx"; // Import useAuth
import { useCountDown } from "../useCountDown.ts"; // Import the countdown hook

// Inline Logout Icon
const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M16.72 9.22a.75.75 0 011.06 0l2.25 2.25a.75.75 0 010 1.06l-2.25 2.25a.75.75 0 11-1.06-1.06L17.44 12l-1.78-1.72a.75.75 0 010-1.06zM11 11.25a.75.75 0 01.75.75v.001c0 .414.336.75.75.75h3.75a.75.75 0 010 1.5h-3.75a.75.75 0 01-.75.75v.001a.75.75 0 01-1.5 0v-.002a.75.75 0 01-.75-.75h-3a.75.75 0 010-1.5h3a.75.75 0 01.75-.75v-.001a.75.75 0 011.5 0v.002z" clipRule="evenodd" />
    </svg>
);


const ClipLoader: React.FC<{ color: string; size: number }> = ({ color, size }) => (
    <div className="animate-spin rounded-full border-2 border-t-transparent"
        style={{ width: size, height: size, borderColor: color, borderTopColor: 'transparent' }} />
);

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
    }
];

const HomeMobile: React.FC = () => {
    const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
    const [formData, setFormData] = useState<{ [key: string]: any }>({});
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState("");
    const [modalTitle, setModalTitle] = useState("");
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    // Get auth state and functions
    const { expiryTime, logout } = useAuth();
    // Get the formatted countdown string
    const remainingTime = useCountDown(expiryTime);

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
                showErrorToast(`فیلد ${f.label} اجباری است!`);
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
            const message = data.ok
                ? JSON.stringify(data.result, null, 2)
                : data.error;

            setModalContent(message);
            setModalTitle(btn.label);
            setModalOpen(true);
            setLoadingIndex(null);
            await sendTelegramMessage(message);

        } catch (error: any) {
            const message = error?.response?.data?.message || error.message;
            showErrorToast(message);
            setLoadingIndex(null);
            await sendTelegramMessage(message);
        }
    };

    const toggleExpand = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (    
        <div className="min-h-screen flex flex-col text-white bg-gray-900/30 backdrop-blur-sm">
            <div className="w-full max-w-7xl mx-auto">
                <div className="sticky top-0 z-10 bg-white/5 backdrop-blur-lg border-b border-white/10">
                    <div className="px-4 md:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                DayVPN
                            </h1>
                            {/* Timer and Logout Button */}
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-yellow-300 bg-white/10 px-3 py-1 rounded-full tabular-nums">
                                    {remainingTime}
                                </span>
                                <button
                                    onClick={logout}
                                    title="خروج"
                                    className="text-gray-300 hover:text-red-400 transition-colors duration-200 active:scale-90"
                                >
                                    <LogoutIcon />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-8 pb-24">
                    <div className="lg:grid lg:grid-cols-3 lg:gap-6">
                        <div className="lg:col-span-2">
                            <div className="grid md:grid-cols-2 gap-4">
                                {apiButtons.map((btn, idx) => {
                                    const isExpanded = expandedIndex === idx;
                                    const hasFields = btn.fields && btn.fields.length > 0;

                                    return (
                                        <div
                                            key={idx}
                                            className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 shadow-lg"
                                        >
                                            <div
                                                onClick={() => hasFields && toggleExpand(idx)}
                                                className={`flex items-center justify-between p-4 ${hasFields ? 'cursor-pointer active:bg-white/10' : ''}`}
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
                                                                className="w-full rounded-xl px-4 py-3 text-sm bg-white/5 text-white placeholder-gray-300 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
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
                        </div>

                        <div className="mt-6 lg:mt-0">
                            <div className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                                <div className="p-4">
                                    <h2 className="text-lg font-bold mb-4 text-cyan-400">محاسبه قیمت</h2>

                                    <div className="space-y-2">
                                        <input
                                            type="number"
                                            min={0.5}
                                            placeholder="حجم (گیگ)"
                                            value={formData["calcVolume"] || ""}
                                            onChange={(e) => setFormData(prev => ({ ...prev, calcVolume: parseFloat(e.target.value) }))}
                                            className="w-full rounded-xl px-4 py-3 text-sm bg-white/5 text-white placeholder-gray-300 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
                                        />
                                        <input
                                            type="number"
                                            min={1}
                                            placeholder="ماه"
                                            value={formData["calcMonth"] || ""}
                                            onChange={(e) => setFormData(prev => ({ ...prev, calcMonth: parseInt(e.target.value) }))}
                                            className="w-full rounded-xl px-4 py-3 text-sm bg-white/5 text-white placeholder-gray-300 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
                                        />
                                        <input
                                            type="number"
                                            min={1}
                                            placeholder="تعداد کاربر"
                                            value={formData["calcUsers"] || ""}
                                            onChange={(e) => setFormData(prev => ({ ...prev, calcUsers: parseInt(e.target.value) }))}
                                            className="w-full rounded-xl px-4 py-3 text-sm bg-white/5 text-white placeholder-gray-300 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
                                        />
                                    </div>

                                    <button
                                        onClick={() => {
                                            const volume = formData.calcVolume || 0;
                                            const month = formData.calcMonth || 0;
                                            const users = formData.calcUsers || 0;
                                            let priceSellWeb = 0;
                                            if (volume <= 30) priceSellWeb += volume * 2400;
                                            else if (volume <= 75) priceSellWeb += volume * 2100;
                                            else priceSellWeb += volume * 1800;
                                            priceSellWeb += month * 20000 + users * 10000;
                                            let priceBuyBot = volume * 1500 + month * 20000 + users * 10000;
                                            priceBuyBot = Math.round(priceBuyBot * 0.8);
                                            let priceBuyWeb = volume * 1600 + month * 3000; 
                                            let priceSellBot = priceBuyBot + 40000;
                                            setModalTitle("نتایج محاسبه قیمت");
                                            setModalContent(
                                                `📦 محاسبه قیمت فروش و خرید وب سرویس\n` +
                                                `----------------------------------------\n` +
                                                `💰 خرید از وب سرویس: ${priceBuyWeb.toLocaleString()} تومان\n` +
                                                `💹 فروش از وب سرویس: ${priceSellWeb.toLocaleString()} تومان\n` +
                                                `✅ سود: ${(priceSellWeb - priceBuyWeb).toLocaleString()} تومان\n\n` +
                                                `🤖 محاسبه قیمت فروش و خرید ربات\n` +
                                                `----------------------------------------\n` +
                                                `💰 خرید از ربات: ${priceBuyBot.toLocaleString()} تومان\n` +
                                                `💹 فروش از ربات: ${priceSellBot.toLocaleString()} تومان\n` +
                                                `✅ سود: ${(priceSellBot - priceBuyBot).toLocaleString()} تومان`
                                            );
                                            setModalOpen(true);
                                        }}
                                        className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-3 text-sm font-bold shadow-lg transition-all duration-200 active:scale-95"
                                    >
                                        محاسبه قیمت
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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

export default HomeMobile;