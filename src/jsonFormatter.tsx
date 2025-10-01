import React from "react";

// نوع ورودی JSON
type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
interface JsonObject {
    [key: string]: JsonValue;
}

// Props برای کامپوننت
interface JsonFormatterProps {
    data: JsonObject | JsonValue;
    depth?: number; // برای indentation
}

// تابع چک کردن JSON معتبر
function isJsonString(str: string) {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
}

// دیکشنری ترجمه کلیدها
const translations: Record<string, string> = {
    balance: "موجودی",
    count_services: "تعداد سرویس‌ها",
    count_active_services: "تعداد سرویس‌های فعال",
    per_gb: "هزینه به ازای هر گیگ",
    per_day: "هزینه به ازای هر روز",
    system: "وضعیت سیستم",
    ping: "پینگ",
    count: "تعداد",
    list: "لیست",
    username: "نام کاربری",
    usage: "مصرف",
    gig: "مصرف (گیگ)",
    day: "روز باقی‌مانده",
    expiration_time: "زمان انقضا (timestamp)",
    package_size: "حجم بسته",
    sub_link: "لینک اشتراک",
    hash: "هش",
    online_info: "اطلاعات آنلاین",
    status: "وضعیت",
    tak_links: "لینک‌ها",
    usage_converted: "مصرف تبدیل‌شده",
    error: "خطا",
    latest_info: "آخرین اطلاعات",
    online_at: "زمان آنلاین شدن",
    sub_panel: "پنل اشتراک",
    expire_date: "تاریخ انقضا",
    created_at: "تاریخ ایجاد (timestamp)",
    uid: "شناسه کاربر",
};

// تابع اصلی برای نمایش داینامیک
const JsonFormatter: React.FC<JsonFormatterProps> = ({ data, depth = 0 }) => {
    if (data === null || data === undefined) {
        return <span className="text-gray-400">null</span>;
    }

    // اگر رشته باشه و JSON معتبر باشه → پارس کنیم
    if (typeof data === "string" && isJsonString(data)) {
        const parsed = JSON.parse(data);
        return <JsonFormatter data={parsed} depth={depth} />;
    }

    // مقدار ساده
    if (typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
        if (typeof data === "string" && data.startsWith("http")) {
            // لینک
            return (
                <a
                    href={data}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 underline break-all"
                >
                    {data}
                </a>
            );
        }

        // فقط متن ساده
        return <span className="text-gray-200">{data.toString()}</span>;
    }

    // آرایه
    if (Array.isArray(data)) {
        if (data.length === 0) return <span className="text-gray-400">[]</span>;

        return (
            <ul className="list-disc pr-5 space-y-1 text-right">
                {data.map((item, index) => (
                    <li key={index}>
                        <JsonFormatter data={item} depth={depth + 1} />
                    </li>
                ))}
            </ul>
        );
    }

    // آبجکت
    const entries = Object.entries(data);
    if (entries.length === 0) return <span className="text-gray-400">{`{}`}</span>;

    return (
        <div className={`pr-${depth * 4} space-y-1 text-right`}>
            {entries.map(([key, value]) => {
                const label = translations[key] || key;
                return (
                    <div
                        key={key}
                        className="flex flex-row items-center gap-2"
                    >
                        <span className="font-semibold text-gray-300">{label}:</span>
                        <div className="text-gray-200">
                            <JsonFormatter data={value} depth={depth + 1} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default JsonFormatter;
