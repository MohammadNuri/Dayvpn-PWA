import React, { useState } from "react";
import { apiClient, sendTelegramMessage } from "../api";
import ResultModal from "./ResultModal";
import { showErrorToast } from "../toast";

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
                // setModalContent(`فیلد ${f.label} اجباری است!`);
                // setModalTitle("خطای اعتبارسجنجی");
                // setModalOpen(true);
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            {/* Wrap content in a max-width container for desktop */}
            <div className="w-full max-w-7xl mx-auto">
                {/* Header with enhanced glass effect and desktop padding */}
                <div className="sticky top-0 z-10 bg-white/5 backdrop-blur-lg border-b border-white/10">
                    <div className="px-4 md:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                DayVPN
                            </h1>
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                آنلاین
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main content area with responsive padding and layout */}
                <div className="p-4 md:p-8 pb-24">
                    {/* Responsive Grid for Desktop */}
                    <div className="lg:grid lg:grid-cols-3 lg:gap-6">

                        {/* Column 1 & 2: API Buttons */}
                        <div className="lg:col-span-2">
                            {/* Grid for the buttons themselves on medium screens up */}
                            <div className="grid md:grid-cols-2 gap-4">
                                {apiButtons.map((btn, idx) => {
                                    const isExpanded = expandedIndex === idx;
                                    const hasFields = btn.fields && btn.fields.length > 0;

                                    return (
                                        <div
                                            key={idx}
                                            // Enhanced glass effect for cards
                                            className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 shadow-lg"
                                        >
                                            {/* Header قابل کلیک */}
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
                                                                // Enhanced glass effect for inputs
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

                        {/* Column 3: Price Calculator */}
                        {/* Added margin-top for mobile, but lg:mt-0 resets it on desktop */}
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

                                            // =========================
                                            // محاسبه قیمت فروش از وب سرویس
                                            // =========================
                                            let priceSellWeb = 0;
                                            if (volume <= 30) priceSellWeb += volume * 2400;
                                            else if (volume <= 75) priceSellWeb += volume * 2100;
                                            else priceSellWeb += volume * 1800;
                                            priceSellWeb += month * 20000 + users * 10000;

                                            // =========================
                                            // محاسبه قیمت خرید از ربات
                                            // =========================
                                            let priceBuyBot = volume * 1500 + month * 20000 + users * 10000;
                                            priceBuyBot = Math.round(priceBuyBot * 0.8);

                                            // =========================
                                            // محاسبه قیمت خرید از وب سرویس
                                            // =========================
                                            let priceBuyWeb = volume * 1600 + month * 3000; // کاربران هزینه ندارند

                                            // =========================
                                            // محاسبه قیمت فروش از ربات
                                            // =========================
                                            let priceSellBot = priceBuyBot + 40000;

                                            // نمایش در مودال
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