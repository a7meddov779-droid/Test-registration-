const API = 'https://al-coral.vercel.app';

// ===== التبويبات =====
const tabSignup = document.getElementById('tabSignup');
const tabLogin = document.getElementById('tabLogin');
const tabUsers = document.getElementById('tabUsers');

const pageSignup = document.getElementById('pageSignup');
const pageLogin = document.getElementById('pageLogin');
const pageUsers = document.getElementById('pageUsers');

function showTab(tabName) {
    // إخفاء الكل
    pageSignup.classList.add('hidden');
    pageLogin.classList.add('hidden');
    pageUsers.classList.add('hidden');
    
    // إزالة التفعيل من الكل
    tabSignup.classList.remove('active');
    tabLogin.classList.remove('active');
    tabUsers.classList.remove('active');
    
    // إظهار المطلوب
    if (tabName === 'signup') {
        pageSignup.classList.remove('hidden');
        tabSignup.classList.add('active');
    } else if (tabName === 'login') {
        pageLogin.classList.remove('hidden');
        tabLogin.classList.add('active');
    } else if (tabName === 'users') {
        pageUsers.classList.remove('hidden');
        tabUsers.classList.add('active');
    }
}

tabSignup.addEventListener('click', () => showTab('signup'));
tabLogin.addEventListener('click', () => showTab('login'));
tabUsers.addEventListener('click', () => showTab('users'));

// ===== إنشاء حساب =====
document.getElementById('btnSignup').addEventListener('click', async function() {
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
    result.className = '';

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
});

// ===== تسجيل الدخول =====
document.getElementById('btnLogin').addEventListener('click', async function() {
    const email = document.getElementById('lEmail').value;
    const password = document.getElementById('lPass').value;
    const result = document.getElementById('lResult');

    if (!email || !password) {
        result.className = 'error';
        result.textContent = '❌ البريد وكلمة المرور مطلوبة';
        return;
    }

    result.textContent = '⏳ جاري...';
    result.className = '';

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
});

// ===== عرض المستخدمين =====
document.getElementById('btnUsers').addEventListener('click', async function() {
    const result = document.getElementById('uResult');
    result.textContent = '⏳ جاري...';
    result.className = '';

    try {
        const res = await fetch(`${API}/users`);
        const data = await res.json();
        result.className = 'success';
        result.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
        result.className = 'error';
        result.textContent = '❌ خطأ: ' + err.message;
    }
});

console.log('✅ API Tester Ready');
