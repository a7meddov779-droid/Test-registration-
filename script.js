// =====================
//  إعدادات الـ API
// =====================
const API_BASE = 'https://al-coral.vercel.app';

// =====================
//  إدارة التبويبات
// =====================
const tabs = document.querySelectorAll('.tab-btn');
const contents = {
    signup: document.getElementById('signup'),
    login: document.getElementById('login'),
    users: document.getElementById('users'),
};

tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        // إزالة التفعيل من الكل
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        // إخفاء الكل
        Object.values(contents).forEach((c) => c.classList.add('hidden'));

        // إظهار المطلوب
        const target = tab.dataset.tab;
        if (contents[target]) {
            contents[target].classList.remove('hidden');
        }
    });
});

// =====================
//  دالة مساعدة لعرض النتائج
// =====================
function showResult(element, data, isError = false) {
    element.innerHTML = '';
    element.className = 'result';

    let output = '';

    if (typeof data === 'string') {
        output = data;
    } else if (data && typeof data === 'object') {
        try {
            output = JSON.stringify(data, null, 2);
            // تلوين الـ JSON
            output = output.replace(
                /"([^"]+)":/g,
                '<span style="color:#a78bfa;">"$1"</span>:'
            );
            output = output.replace(
                /: "([^"]+)"/g,
                ': <span style="color:#34d399;">"$1"</span>'
            );
            output = output.replace(
                /: (\d+)/g,
                ': <span style="color:#fbbf24;">$1</span>'
            );
            output = output.replace(
                /: (true|false)/g,
                ': <span style="color:#f472b6;">$1</span>'
            );
        } catch (e) {
            output = String(data);
        }
    } else {
        output = String(data);
    }

    element.innerHTML = `<div class="json">${output}</div>`;

    if (isError) {
        element.classList.add('error');
    } else {
        element.classList.add('success');
    }
}

function showError(element, message) {
    element.innerHTML = '';
    element.className = 'result error';
    element.innerHTML = `<div style="color:#f87171;">❌ ${message}</div>`;
}

// =====================
//  1. إنشاء حساب (Signup)
// =====================
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const resultDiv = document.getElementById('signupResult');

    if (!name || !email || !password) {
        showError(resultDiv, 'جميع الحقول مطلوبة');
        return;
    }

    resultDiv.innerHTML = '⏳ جاري الإرسال...';
    resultDiv.className = 'result';

    try {
        const response = await fetch(`${API_BASE}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showResult(resultDiv, data);
            // مسح الحقول بعد النجاح
            document.getElementById('signupName').value = '';
            document.getElementById('signupEmail').value = '';
            document.getElementById('signupPassword').value = '';
        } else {
            showError(resultDiv, data.error || data.message || 'حدث خطأ');
        }
    } catch (error) {
        showError(resultDiv, 'فشل الاتصال بالخادم: ' + error.message);
    }
});

// =====================
//  2. تسجيل الدخول (Login)
// =====================
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const resultDiv = document.getElementById('loginResult');

    if (!email || !password) {
        showError(resultDiv, 'البريد الإلكتروني وكلمة المرور مطلوبان');
        return;
    }

    resultDiv.innerHTML = '⏳ جاري الإرسال...';
    resultDiv.className = 'result';

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showResult(resultDiv, data);
            document.getElementById('loginEmail').value = '';
            document.getElementById('loginPassword').value = '';
        } else {
            showError(resultDiv, data.error || data.message || 'حدث خطأ');
        }
    } catch (error) {
        showError(resultDiv, 'فشل الاتصال بالخادم: ' + error.message);
    }
});

// =====================
//  3. عرض المستخدمين (Users)
// =====================
document.getElementById('fetchUsersBtn').addEventListener('click', async () => {
    const resultDiv = document.getElementById('usersResult');

    resultDiv.innerHTML = '⏳ جاري التحميل...';
    resultDiv.className = 'result';

    try {
        const response = await fetch(`${API_BASE}/users`);
        const data = await response.json();

        if (response.ok && data.success) {
            showResult(resultDiv, data);
        } else {
            showError(resultDiv, data.error || 'حدث خطأ');
        }
    } catch (error) {
        showError(resultDiv, 'فشل الاتصال بالخادم: ' + error.message);
    }
});

// =====================
//  تشغيل تلقائي لعرض المستخدمين عند فتح التبويب
// =====================
// (اختياري) نحمّل المستخدمين تلقائياً عند فتح التبويب
// يمكنك تفعيله بإزالة التعليق
/*
document.querySelector('[data-tab="users"]').addEventListener('click', () => {
    setTimeout(() => {
        document.getElementById('fetchUsersBtn').click();
    }, 300);
});
*/

console.log('✅ موقع اختبار الـ API جاهز!');
console.log(`📍 API Base: ${API_BASE}`);
