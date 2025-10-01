import React, { useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { apiClient, sendTelegramMessage } from "../api";
import ResultModal from "./ResultModal";

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
}

const apiButtons: ApiButton[] = [
    { label: "وضعیت کل", method: "GET", endpoint: "status" },
    {
        label: "لیست سرویس‌ها", method: "GET", endpoint: "clients",
        fields: [{ name: "limit", label: "تعداد سرویس (اختیاری)", type: "number" }]
    },
    {
        label: "ساخت سرویس", method: "POST", endpoint: "create",
        fields: [
            { name: "gig", label: "مقدار حجم (گیگ)", type: "number", min: 0.5 },
            { name: "day", label: "تعداد روز", type: "number", min: 1 },
            { name: "test", label: "نوع سرویس (0=پولی,1=تست)", type: "number", required: true },
        ]
    },
    {
        label: "جستجوی سرویس", method: "POST", endpoint: "find",
        fields: [{ name: "username", label: "نام سرویس", required: true }]
    },
    {
        label: "تغییر لینک سرویس", method: "POST", endpoint: "change_link",
        fields: [{ name: "username", label: "نام سرویس", required: true }]
    },
    {
        label: "افزایش زمان سرویس", method: "POST", endpoint: "upg_time",
        fields: [
            { name: "username", label: "نام سرویس", required: true },
            { name: "day", label: "تعداد روز", type: "number", required: true, min: 1 },
        ]
    },
    {
        label: "افزایش حجم سرویس", method: "POST", endpoint: "upg_size",
        fields: [
            { name: "username", label: "نام سرویس", required: true },
            { name: "gig", label: "مقدار حجم (گیگ)", type: "number", required: true, min: 0.5 },
        ]
    },
    {
        label: "تغییر وضعیت سرویس (خاموش/روشن)", method: "POST", endpoint: "reverse_mode",
        fields: [{ name: "username", label: "نام سرویس", required: true }]
    },
];

const Home: React.FC = () => {
    const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
    const [formData, setFormData] = useState<{ [key: string]: any }>({});
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState("");
    const [modalTitle, setModalTitle] = useState("");

    const handleInputChange = (index: number, field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [index]: { ...prev[index], [field]: value },
        }));
    };

    const handleApiCall = async (btn: any, index: number) => {
        if (loadingIndex !== null) return; // جلوگیری از spam

        // اعتبارسنجی فیلدهای required
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
            let message = "";

            if (data.ok) {
                message = JSON.stringify(data.result, null, 2);
            } else {
                message = data.error;
            }

            // باز کردن Modal
            setModalContent(message);
            setModalTitle(btn.label);
            setModalOpen(true);

            await sendTelegramMessage(message);

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

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">داشبورد DayVPN</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {apiButtons.map((btn, idx) => (
                    <div key={idx} className="bg-gray-800 p-3 sm:p-4 rounded-xl shadow-md flex flex-col">
                        <h2 className="font-semibold mb-3 text-sm sm:text-base">{btn.label}</h2>

                        {btn.fields?.map((f: any) => (
                            <input
                                key={f.name}
                                type={f.type === "number" ? "number" : "text"}
                                min={f.min}
                                placeholder={f.label}
                                value={formData[idx]?.[f.name] || ""}
                                onChange={(e) => handleInputChange(idx, f.name, e.target.value)}
                                className="w-full mb-2 rounded-md px-3 py-2 text-sm sm:text-base bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/70"
                                disabled={loadingIndex !== null}
                            />
                        ))}

                        <button
                            onClick={() => handleApiCall(btn, idx)}
                            disabled={loadingIndex !== null}
                            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold shadow-md transition duration-300 hover:scale-[1.02] hover:shadow-cyan-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loadingIndex === idx ? <ClipLoader color="#fff" size={18} /> : "ارسال"}
                        </button>
                    </div>
                ))}
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