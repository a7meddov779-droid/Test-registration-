/**
 * نظام إدارة الحسابات - كامل مع تخزين محلي
 */

// ============================================
// 1. قاعدة البيانات
// ============================================
let users = [];
let currentUser = null;
let idCounter = 1;

// تحميل البيانات من localStorage
function loadData() {
    const saved = localStorage.getItem('usersData');
    if (saved) {
        const data = JSON.parse(saved);
        users = data.users || [];
        idCounter = data.idCounter || 1;
        currentUser = data.currentUser || null;
    } else {
        // إضافة مستخدم افتراضي للتجربة
        users.push({
            id: idCounter++,
            name: 'أحمد',
            email: 'a@t.com',
            password: '123',
            createdAt: new Date().toISOString()
        });
        saveData();
    }
}

// حفظ البيانات
function saveData() {
    localStorage.setItem('usersData', JSON.stringify({
        users,
        idCounter,
        currentUser
    }));
}

// ============================================
// 2. دوال مساعدة
// ============================================
function findUserByEmail(email) {
    return users.find(u => u.email === email);
}

function findUserById(id) {
    return users.find(u => u.id === id);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============================================
// 3. إدارة الصفحات
// ============================================
function showPage(page) {
    // إخفاء كل الصفحات
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // إظهار الصفحة المطلوبة
    const target = document.getElementById(`page${page.charAt(0).toUpperCase() + page.slice(1)}`);
    if (target) target.classList.add('active');
    
    // تحديث الروابط
    updateNav();
    
    // تحديث المحتوى
    if (page === 'users') renderUsers();
    if (page === 'dashboard') updateDashboard();
}

function updateNav() {
    const navUsers = document.getElementById('navUsers');
    const navLogout = document.getElementById('navLogout');
    const userNameDisplay = document.getElementById('userNameDisplay');
    
    if (currentUser) {
        navUsers.style.display = 'inline-block';
        navLogout.style.display = 'inline-block';
        userNameDisplay.textContent = `👋 ${currentUser.name}`;
        document.getElementById('statusText').textContent = `✅ مرحباً ${currentUser.name}`;
        document.getElementById('statusText').className = 'status-text logged-in';
    } else {
        navUsers.style.display = 'inline-block';
        navLogout.style.display = 'none';
        userNameDisplay.textContent = '❌ غير مسجل';
        document.getElementById('statusText').textContent = '❌ غير مسجل دخول';
        document.getElementById('statusText').className = 'status-text logged-out';
    }
    
    // تحديث عدد المستخدمين
    document.getElementById('usersCount').textContent = users.length;
}

// ============================================
// 4. عمليات الحسابات
// ============================================

// إنشاء حساب
function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const messageEl = document.getElementById('signupMessage');
    
    if (!name || !email || !password) {
        showMessage(messageEl, 'جميع الحقول مطلوبة', 'error');
        return;
    }
    
    if (findUserByEmail(email)) {
        showMessage(messageEl, '❌ هذا البريد مستخدم مسبقاً', 'error');
        return;
    }
    
    const newUser = {
        id: idCounter++,
        name,
        email,
        password,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveData();
    
    showMessage(messageEl, `✅ تم إنشاء الحساب بنجاح! مرحباً ${name}`, 'success');
    document.getElementById('signupForm').reset();
    updateNav();
    renderUsers();
}

// تسجيل دخول
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const messageEl = document.getElementById('loginMessage');
    
    if (!email || !password) {
        showMessage(messageEl, '❌ البريد وكلمة المرور مطلوبة', 'error');
        return;
    }
    
    const user = findUserByEmail(email);
    if (!user || user.password !== password) {
        showMessage(messageEl, '❌ بريد أو كلمة مرور خاطئة', 'error');
        return;
    }
    
    currentUser = user;
    saveData();
    
    showMessage(messageEl, `✅ مرحباً ${user.name}، تم تسجيل الدخول بنجاح`, 'success');
    document.getElementById('loginForm').reset();
    updateNav();
    showPage('dashboard');
}

// تسجيل خروج
function logout() {
    if (!confirm('هل أنت متأكد من تسجيل الخروج؟')) return;
    
    currentUser = null;
    saveData();
    updateNav();
    showPage('home');
    
    // تنظيف الرسائل
    document.querySelectorAll('.message').forEach(el => {
        el.style.display = 'none';
        el.className = 'message';
    });
}

// حذف الحساب
function handleDeleteAccount() {
    if (!currentUser) {
        alert('يجب تسجيل الدخول أولاً');
        return;
    }
    
    if (!confirm(`هل أنت متأكد من حذف حساب "${currentUser.name}" نهائياً؟`)) return;
    
    const index = users.findIndex(u => u.id === currentUser.id);
    if (index !== -1) {
        users.splice(index, 1);
        currentUser = null;
        saveData();
        updateNav();
        showPage('home');
        alert('✅ تم حذف الحساب بنجاح');
    }
}

// عرض رسالة
function showMessage(el, text, type) {
    el.textContent = text;
    el.className = `message ${type}`;
    el.style.display = 'block';
}

// ============================================
// 5. عرض المستخدمين
// ============================================
function renderUsers() {
    const container = document.getElementById('usersList');
    
    if (users.length === 0) {
        container.innerHTML = '<div class="empty-state">📭 لا يوجد مستخدمين مسجلين</div>';
        return;
    }
    
    container.innerHTML = users.map(user => `
        <div class="user-item">
            <div class="user-info">
                <span class="user-name">👤 ${user.name}</span>
                <span class="user-email">📧 ${user.email}</span>
                <span class="user-id">🆔 #${user.id}</span>
                <span class="user-date">📅 ${formatDate(user.createdAt)}</span>
            </div>
            ${currentUser && currentUser.id === user.id ? `
                <div class="user-actions">
                    <span style="background:#f0fff4;color:#38a169;padding:4px 12px;border-radius:30px;font-size:12px;">أنت</span>
                </div>
            ` : `
                <div class="user-actions">
                    <button class="btn-sm danger" onclick="deleteUser(${user.id})">🗑️</button>
                </div>
            `}
        </div>
    `).join('');
    
    document.getElementById('usersCount').textContent = users.length;
}

// حذف مستخدم من قبل المسؤول (حذف أي مستخدم)
function deleteUser(id) {
    if (!currentUser) {
        alert('يجب تسجيل الدخول أولاً');
        return;
    }
    
    const user = findUserById(id);
    if (!user) return;
    
    if (!confirm(`هل أنت متأكد من حذف المستخدم "${user.name}"؟`)) return;
    
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
        users.splice(index, 1);
        // إذا كان المحذوف هو المستخدم الحالي
        if (currentUser && currentUser.id === id) {
            currentUser = null;
        }
        saveData();
        renderUsers();
        updateNav();
        alert('✅ تم حذف المستخدم');
    }
}

// ============================================
// 6. لوحة التحكم
// ============================================
function updateDashboard() {
    if (!currentUser) {
        showPage('home');
        return;
    }
    
    document.getElementById('dashName').textContent = currentUser.name;
    document.getElementById('dashEmail').textContent = currentUser.email;
    document.getElementById('dashId').textContent = `#${currentUser.id}`;
    document.getElementById('dashDate').textContent = formatDate(currentUser.createdAt);
}

// ============================================
// 7. تهيئة التطبيق
// ============================================
function init() {
    loadData();
    updateNav();
    renderUsers();
    showPage('home');
}

// تشغيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', init);
