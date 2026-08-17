const API = 'https://al-coral.vercel.app';

// ===== التبويبات =====
function showTab(name) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(name).classList.remove('hidden');
    event.target.classList.add('active');
}

// ===== إنشاء حساب =====
async function signup() {
    const name = document.getElementById('sName').value;
    const email = document.getElementById('sEmail').value;
    const password = document.getElementById('sPass').value;
    const result = document.getElementById('sResult');

    if (!name || !email || !password) {
        result.className = 'error';
        result.textContent = '❌ جميع الحقول مطلوبة';
        return;
    }

    result.textContent = '⏳ جاري...';

    try {
        const res = await fetch(`${API}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        result.className = 'success';
        result.textContent = JSON.stringify(data, null, 2);
        if (data.success) {
            document.getElementById('sName').value = '';
            document.getElementById('sEmail').value = '';
            document.getElementById('sPass').value = '';
        }
    } catch (err) {
        result.className = 'error';
        result.textContent = '❌ خطأ: ' + err.message;
    }
}

// ===== تسجيل الدخول =====
async function login() {
    const email = document.getElementById('lEmail').value;
    const password = document.getElementById('lPass').value;
    const result = document.getElementById('lResult');

    if (!email || !password) {
        result.className = 'error';
        result.textContent = '❌ البريد وكلمة المرور مطلوبة';
        return;
    }

    result.textContent = '⏳ جاري...';

    try {
        const res = await fetch(`${API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        result.className = 'success';
        result.textContent = JSON.stringify(data, null, 2);
        if (data.success) {
            document.getElementById('lEmail').value = '';
            document.getElementById('lPass').value = '';
        }
    } catch (err) {
        result.className = 'error';
        result.textContent = '❌ خطأ: ' + err.message;
    }
}

// ===== عرض المستخدمين =====
async function getUsers() {
    const result = document.getElementById('uResult');
    result.textContent = '⏳ جاري...';

    try {
        const res = await fetch(`${API}/users`);
        const data = await res.json();
        result.className = 'success';
        result.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
        result.className = 'error';
        result.textContent = '❌ خطأ: ' + err.message;
    }
}

console.log('✅ API Tester Ready');
