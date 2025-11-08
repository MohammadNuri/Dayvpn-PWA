type ServiceListItem = {
    username: string;
    usage: number;
    gig: number;
    day: number;
    expiration_time: number;
    package_size: number;
    sub_link: string;
};

export const formatTelegramMessage = (data: any): string => {
    const now = Math.floor(Date.now() / 1000);

    // مدل ۱: لیست سرویس‌ها
    if (data.list && Array.isArray(data.list)) {
        let msg = `📋 لیست سرویس‌ها\n`;
        msg += `━━━━━━━━━━━━━━━\n`;
        msg += `📦 تعداد کل: ${data.count} سرویس\n\n`;

        data.list.forEach((item: ServiceListItem, idx: number) => {
            const remainBytes = item.package_size - item.usage;
            const remainGB = (remainBytes / (1024 ** 3)).toFixed(2);
            const usedGB = (item.usage / (1024 ** 3)).toFixed(2);
            const remainDays = ((item.expiration_time - now) / (60 * 60 * 24)).toFixed(1);

            // محاسبه روزهای گذشته از شروع سرویس
            const totalDays = item.day;
            const passedDays = totalDays - parseFloat(remainDays);
            const usagePerDay = passedDays > 0 ? (item.usage / (1024 ** 3) / passedDays).toFixed(2) : '0.00';

            msg += `🔷 سرویس ${idx + 1}\n`;
            msg += `┣ 👤 نام: ${item.username}\n`;
            msg += `┣ 💾 حجم کل: ${item.gig}GB\n`;
            msg += `┣ ⏱ مدت: ${item.day} روز\n`;
            msg += `┣ 📊 مصرف شده: ${usedGB}GB\n`;
            msg += `┣ ✅ باقیمانده: ${remainGB}GB\n`;
            msg += `┣ ⏳ انقضا: ${remainDays} روز دیگر\n`;
            msg += `┣ 📈 میانگین روزانه: ${usagePerDay}GB\n`;
            msg += `┗ 🔗 لینک: ${item.sub_link}\n\n`;
        });
        return msg;
    }

    // مدل ۲: سرویس جدید
    if (data.tak_links && Array.isArray(data.tak_links) && data.gig && data.day) {
        const remainDays = ((data.expiryTime - now) / (60 * 60 * 24)).toFixed(1);
        const createdDate = new Date(data.created_at * 1000).toLocaleDateString("fa-IR");

        let msg = `🎉 سرویس جدید ساخته شد!\n`;
        msg += `━━━━━━━━━━━━━━━\n\n`;
        msg += `👤 نام سرویس: ${data.username}\n`;
        msg += `⏱ مدت زمان: ${data.day} روز\n`;
        msg += `💾 حجم کل: ${data.gig}GB\n`;
        msg += `👥 تعداد کاربر: 1 نفر\n`;
        msg += `📅 تاریخ ساخت: ${createdDate}\n`;
        msg += `⏳ انقضا: ${remainDays} روز دیگر\n\n`;
        msg += `━━━━━━━━━━━━━━━\n`;
        msg += `🌐 لینک اصلی:\n${data.sub_link}\n\n`;

        // فقط اگر لینک‌های تکی وجود داشت نمایش بده
        if (data.tak_links && data.tak_links.length > 0) {
            msg += `🔑 لینک‌های اختصاصی:\n`;
            data.tak_links.forEach((link: any, index: number) => {
                const tag = link.split("#")[1] || link;
                msg += `${index + 1}. ${decodeURIComponent(String(tag))}\n`;
            });
        }

        return msg;
    }

    // مدل ۳: اطلاعات کلی سیستم
    if (data.balance !== undefined && data.count_services !== undefined) {
        let msg = `📊 وضعیت کلی سیستم\n`;
        msg += `━━━━━━━━━━━━━━━\n\n`;
        msg += `💰 موجودی کیف پول: ${data.balance.toLocaleString()} تومان\n`;
        msg += `📦 تعداد کل سرویس‌ها: ${data.count_services}\n`;
        msg += `✅ سرویس‌های فعال: ${data.count_active_services}\n\n`;
        msg += `💵 تعرفه:\n`;
        msg += `┣ 💾 هر گیگ: ${data.per_gb.toLocaleString()} تومان\n`;
        msg += `┗ ⏱ هر روز: ${data.per_day} تومان\n\n`;
        msg += `🌐 وضعیت سیستم: ${data.system}\n`;
        msg += `📡 پینگ: ${data.ping} ثانیه\n`;
        return msg;
    }

    // مدل ۴: سرویس جستجو شده (single service)
    if (data.username && data.latest_info) {
        // چک می‌کنیم آیا online_info معتبر هست یا خیر
        const hasValidOnlineInfo = data.online_info && !data.online_info.error;

        const usage = hasValidOnlineInfo ? (data.online_info.usage || 0) : (data.latest_info.usage || 0);
        const remainBytes = data.latest_info.package_size - usage;
        const remainGB = (remainBytes / (1024 ** 3)).toFixed(2);
        const usedMB = (usage / (1024 ** 2)).toFixed(2);
        const remainDays = ((data.latest_info.expiration_time - now) / (60 * 60 * 24)).toFixed(1);

        // محاسبه میانگین روزانه
        const totalDays = data.latest_info.day;
        const passedDays = totalDays - parseFloat(remainDays);
        const usagePerDay = passedDays > 0 ? (usage / (1024 ** 3) / passedDays).toFixed(2) : '0.00';


        let msg = `🔍 جزئیات سرویس\n`;
        msg += `━━━━━━━━━━━━━━━\n\n`;
        msg += `👤 نام سرویس: ${data.username}\n\n`;

        // اگر online_info معتبر بود، وضعیت آنلاین رو نشون بده
        if (hasValidOnlineInfo && data.online_info.status) {
            msg += `🟢 وضعیت: ${data.online_info.status}\n`;
        }

        msg += `📊 حجم مصرفی: ${data.latest_info.usage_converted || usedMB + " مگابایت"}\n`;
        msg += `✅ باقیمانده: ${remainGB}GB\n`;
        msg += `📈 میانگین روزانه: ${usagePerDay}GB\n`;
        msg += `⏳ انقضا: ${remainDays} روز دیگر\n`;
        msg += `📅 تاریخ انقضا: ${data.latest_info.expire_date}\n`;
        msg += `💾 حجم کل: ${data.latest_info.gig}GB\n`;
        msg += `⏱ مدت: ${data.latest_info.day} روز\n\n`;
        msg += `━━━━━━━━━━━━━━━\n`;
        msg += `🌐 لینک اصلی:\n${data.latest_info.sub_link}\n\n`;

        // چک می‌کنیم tak_links وجود داره یا نه
        const takLinks = (hasValidOnlineInfo && data.online_info.tak_links) ||
            (data.latest_info.tak_links) ||
            [];

        if (takLinks.length > 0) {
            msg += `🔑 لینک‌های اختصاصی:\n`;
            takLinks.forEach((link: any, index: number) => {
                const tag = link.split("#")[1] || link;
                msg += `${index + 1}. ${decodeURIComponent(String(tag))}\n`;
            });
        }

        return msg;
    }

    // 🆕 مدل ۵: افزایش زمان
    if (data.new_exp && data.day_added) {
        const newExpireDate = new Date(data.new_exp * 1000).toLocaleDateString("fa-IR");
        let msg = `⏱ تمدید زمان سرویس\n`;
        msg += `━━━━━━━━━━━━━━━\n\n`;
        msg += `✅ مدت زمان سرویس با موفقیت افزایش یافت.\n\n`;
        msg += `➕ روزهای افزوده‌شده: ${data.day_added} روز\n`;
        msg += `📅 تاریخ انقضای جدید: ${newExpireDate}\n\n`;
        msg += `🎯 سرویس شما اکنون فعال است.`;
        return msg;
    }

    // 🆕 مدل ۶: افزایش حجم
    if (data.new_size && data.gig_added) {
        const newSizeGB = (data.new_size / (1024 ** 3)).toFixed(2);
        let msg = `💾 افزایش حجم سرویس\n`;
        msg += `━━━━━━━━━━━━━━━\n\n`;
        msg += `✅ حجم سرویس با موفقیت افزایش یافت.\n\n`;
        msg += `➕ حجم افزوده‌شده: ${data.gig_added}GB\n`;
        msg += `📊 حجم کل جدید: ${data.new_gig || newSizeGB}GB\n\n`;
        msg += `🎯 سرویس شما اکنون آماده استفاده است.`;
        return msg;
    }

    return "❌ داده نامعتبر یا فرمت ناشناخته";
};