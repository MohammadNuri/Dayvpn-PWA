import React, { useState, useEffect } from "react";
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

// --- NEW REFRESH ICON ---
const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.32 5.002l-.123-.123a.75.75 0 011.06-1.06l.123.123a4 4 0 006.706-3.642l-.184-.825a.75.75 0 011.472-.328l.184.825a5.5 5.5 0 01-1.921 4.907zM4.688 8.576a5.5 5.5 0 019.32-5.002l.123.123a.75.75 0 01-1.06 1.06l-.123-.123a4 4 0 00-6.706 3.642l.184.825a.75.75 0 01-1.472.328l-.184-.825a5.5 5.5 0 011.921-4.907z" clipRule="evenodd" />
    </svg>
);

// Define the shape of the status data
interface StatusData {
    balance: number;
    count_services: number;
    count_active_services: number;
    per_gb: number;
    per_day: number;
    system: string;
    ping: string;
}

const ClipLoader: React.FC<{ color: string; size: number }> = ({ color, size }) => (
    <div className="animate-spin rounded-full border-2 border-t-transparent"
        style={{ width: size, height: size, borderColor: color, borderTopColor: 'transparent' }} />
);

// Shield Icon for the header
const ShieldIcon: React.FC = () => (
    <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "rgb(34 211 238)", stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: "rgb(59 130 246)", stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <path
            d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V13H5V6.3l7-3.11v9.8z"
            fill="url(#shieldGradient)"
        />
    </svg>
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

// --- Status Card Component ---
const StatusCard: React.FC = () => {
    const [statusData, setStatusData] = useState<StatusData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStatus = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get("status");
            if (response.data.ok) {
                setStatusData(response.data.result);
            } else {
                setError(response.data.error || "خطای ناشناخته");
            }
        } catch (err: any) {
            setError(err.message || "خطا در اتصال به سرور");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const StatItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
        <div className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl border border-white/10">
            <span className="text-sm text-gray-300">{label}</span>
            <span className="text-xl md:text-2xl font-bold text-white">{value}</span>
        </div>
    );

    return (
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg p-2">
            <div className="flex flex-col md:flex-row items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white mb-4 md:mb-0">📊 وضعیت کل</h2>
                <button
                    onClick={fetchStatus}
                    disabled={isLoading}
                    title="به‌روزرسانی"
                    className={`flex items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-bold shadow-lg transition-all duration-200 active:scale-90 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed ${isLoading ? 'animate-spin' : ''}`}
                >
                    <span className="text-gray-300">
                        <RefreshIcon />
                    </span>
                </button>
            </div>

            {isLoading && !error && (
                <div className="flex justify-center items-center h-24">
                    <ClipLoader color="#fff" size={32} />
                </div>
            )}

            {error && (
                <div className="flex justify-center items-center h-24 text-red-400">
                    <span>خطا در بارگیری: {error}</span>
                </div>
            )}

            {!isLoading && statusData && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <StatItem label="موجودی" value={`${statusData.balance.toLocaleString()} ت`} />
                    <StatItem label="کل سرویس‌ها" value={statusData.count_services} />
                    <StatItem label="سرویس فعال" value={statusData.count_active_services} />
                    <StatItem label="هزینه گیگ" value={statusData.per_gb.toLocaleString()} />
                    <StatItem label="هزینه روز" value={statusData.per_day} />
                    <StatItem label="پینگ" value={`${statusData.ping}s`} />
                </div>
            )}
        </div>
    );
};


// --- Main Home PC Component ---
const HomePC: React.FC = () => {
    const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
    const [formData, setFormData] = useState<{ [key: string]: any }>({});
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState("");
    const [modalTitle, setModalTitle] = useState("");

    // Get auth state and functions
    const { expiryTime, logout } = useAuth();
    // Get the formatted countdown string
    const remainingTime = useCountDown(expiryTime);

    const handleInputChange = (index: number, field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [index]: { ...prev[index], [field]: value.trim() },
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

    return (
        <div className="min-h-screen flex flex-col text-white bg-gray-900/30 backdrop-blur-sm">
            {/* --- Header --- */}
            <header className="sticky top-0 z-10 bg-white/5 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                    <div className="flex items-center justify-between">
                        {/* Status (Left) */}
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                            آنلاین
                        </div>
                        {/* Title (Center) */}
                        <div className="flex items-center gap-3">
                            <ShieldIcon />
                            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                DayVPN
                            </h1>
                        </div>
                        {/* Timer & Logout (Right) */}
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
            </header>

            {/* --- Main Content --- */}
            <main className="w-full flex-grow">
                <div className="max-w-7xl mx-auto p-4 md:p-8">

                    {/* --- Status Card --- */}
                    <div className="mb-6">
                        <StatusCard />
                    </div>

                    {/* --- Main Grid (8 cards, 4 per row) --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {apiButtons.map((btn, idx) => {
                            const hasFields = btn.fields && btn.fields.length > 0;

                            return (
                                <div
                                    key={idx}
                                    className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 shadow-lg flex flex-col"
                                >
                                    <div
                                        className={`flex items-center justify-between p-4`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`text-2xl bg-gradient-to-br ${btn.color} p-2 rounded-xl`}>
                                                {btn.icon}
                                            </div>
                                            <span className="font-semibold text-base">{btn.label}</span>
                                        </div>
                                    </div>

                                    {hasFields ? (
                                        <div className="px-4 pb-4 space-y-2 pt-1 flex-grow">
                                            {btn.fields?.map((f: ApiField) => (
                                                <input
                                                    key={f.name}
                                                    type={f.type === "number" ? "text" : "text"}
                                                    inputMode={f.type === "number" ? "decimal" : "text"}
                                                    min={f.min}
                                                    placeholder={f.label}
                                                    value={formData[idx]?.[f.name] || ""}
                                                    onChange={(e) => handleInputChange(idx, f.name, e.target.value)}
                                                    className="w-full rounded-xl px-4 py-3 text-sm bg-white/5 text-white placeholder-gray-300 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
                                                    disabled={loadingIndex !== null}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex-grow"></div>
                                    )}

                                    <div className="px-4 pb-4 mt-2">
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
                                                    <span>{hasFields ? "ارسال درخواست" : "مشاهده"}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 shadow-lg flex flex-col">
                            <div className="p-4 flex-grow">
                                <h2 className="text-lg font-bold mb-4 text-cyan-400">محاسبه قیمت</h2>

                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        min={0.5}
                                        placeholder="حجم (گیگ)"
                                        value={formData["calcVolume"] || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, calcVolume: e.target.value.trim() }))}
                                        className="w-full rounded-xl px-4 py-3 text-sm bg-white/5 text-white placeholder-gray-300 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
                                    />
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        min={1}
                                        placeholder="ماه"
                                        value={formData["calcMonth"] || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, calcMonth: e.target.value.trim() }))}
                                        className="w-full rounded-xl px-4 py-3 text-sm bg-white/5 text-white placeholder-gray-300 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
                                    />
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        min={1}
                                        placeholder="تعداد کاربر"
                                        value={formData["calcUsers"] || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, calcUsers: e.target.value.trim() }))}
                                        className="w-full rounded-xl px-4 py-3 text-sm bg-white/5 text-white placeholder-gray-300 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <div className="px-4 pb-4 mt-2">
                                <button
                                    onClick={() => {
                                        const volume = parseFloat(formData.calcVolume) || 0;
                                        const month = parseInt(formData.calcMonth) || 0;
                                        const users = parseInt(formData.calcUsers) || 0;
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
                                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-3 text-sm font-bold shadow-lg transition-all duration-200 active:scale-95"
                                >
                                    محاسبه قیمت
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-white/5 backdrop-blur-lg border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                    <p className="text-center text-xs text-gray-400">
                        DayVPN Panel © 2026
                    </p>
                </div>
            </footer>

            <ResultModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalTitle}
                content={modalContent}
            />
        </div>
    );
};

export default HomePC;