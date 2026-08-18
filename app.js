/**
 * نظام الحسابات المتكامل - مع API محلي وأنيميشن
 */

// ============================================
// 1. قاعدة البيانات (localStorage)
// ============================================
let users = [];
let currentUser = null;
let idCounter = 1;

// تحميل البيانات
function loadData() {
    const saved = localStorage.getItem('usersData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            users = data.users || [];
            idCounter = data.idCounter || 1;
            currentUser = data.currentUser || null;
        } catch (e) {
            resetData();
        }
    } else {
        resetData();
    }
}

// إعادة تعيين البيانات مع مستخدم افتراضي
function resetData() {
    users = [{
        id: idCounter++,
        name: 'أحمد',
        email: 'a@t.com',
        password: '123',
        createdAt: new Date().toISOString()
    }];
    currentUser = null;
    saveData();
}

// حفظ البيانات
function saveData() {
    localStorage.setItem('usersData', JSON.stringify({
        users,
        idCounter,
        currentUser
    }));
}

// دوال مساعدة
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
// 2. إدارة الصفحات مع أنيميشن
// ============================================
function showPage(page) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => {
        p.classList.remove('active');
        p.style.animation = 'none';
        p.offsetHeight; // إعادة تشغيل الأنيميشن
    });
    
    const target = document.getElementById(`page${page.charAt(0).toUpperCase() + page.slice(1)}`);
    if (target) {
        target.classList.add('active');
        target.style.animation = 'fadeSlideIn 0.5s ease forwards';
    }
    
    // تحديث المحتوى حسب الصفحة
    if (page === 'dashboard') updateDashboard();
    if (page === 'users') renderUsers();
}

// ============================================
// 3. عمليات الحسابات (API)
// ============================================

// إنشاء حساب
async function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const messageEl = document.getElementById('signupMessage');
    const btn = e.target.querySelector('.btn-login');
    
    // التحقق من الحقول
    if (!name || !email || !password) {
        showMessage(messageEl, '⚠️ جميع الحقول مطلوبة', 'error');
        return;
    }
    
    if (name.length < 2) {
        showMessage(messageEl, '⚠️ الاسم يجب أن يكون حرفين على الأقل', 'error');
        return;
    }
    
    if (password.length < 3) {
        showMessage(messageEl, '⚠️ كلمة المرور يجب أن تكون 3 أحرف على الأقل', 'error');
        return;
    }
    
    // تعطيل الزر
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإنشاء...';
    
    try {
        // محاكاة تأخير الشبكة
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // التحقق من وجود البريد
        if (findUserByEmail(email)) {
            showMessage(messageEl, '❌ هذا البريد مستخدم مسبقاً', 'error');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-user-plus"></i> إنشاء حساب';
            return;
        }
        
        // إنشاء المستخدم
        const newUser = {
            id: idCounter++,
            name,
            email,
            password,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        saveData();
        
        showMessage(messageEl, `✅ تم إنشاء الحساب بنجاح! مرحباً ${name} 🎉`, 'success');
        document.getElementById('signupForm').reset();
        
        // إعادة تعيين الزر
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-user-plus"></i> إنشاء حساب';
        
        // الانتقال لتسجيل الدخول بعد ثانيتين
        setTimeout(() => {
            showPage('login');
            document.getElementById('loginEmail').value = email;
            document.getElementById('loginPassword').value = password;
            showMessage(document.getElementById('loginMessage'), '🎉 تم إنشاء الحساب! يمكنك تسجيل الدخول الآن', 'success');
        }, 1500);
        
    } catch (error) {
        showMessage(messageEl, '❌ حدث خطأ، حاول مرة أخرى', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-user-plus"></i> إنشاء حساب';
    }
}

// تسجيل دخول
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const messageEl = document.getElementById('loginMessage');
    const btn = e.target.querySelector('.btn-login');
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!email || !password) {
        showMessage(messageEl, '⚠️ البريد وكلمة المرور مطلوبة', 'error');
        return;
    }
    
    // تعطيل الزر
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تسجيل الدخول...';
    
    try {
        // محاكاة تأخير الشبكة
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const user = findUserByEmail(email);
        
        if (!user || user.password !== password) {
            showMessage(messageEl, '❌ بريد أو كلمة مرور خاطئة', 'error');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> تسجيل دخول';
            
            // هز الحقل
            document.querySelector('.input-wrapper').style.animation = 'shake 0.5s ease';
            setTimeout(() => {
                document.querySelector('.input-wrapper').style.animation = '';
            }, 500);
            return;
        }
        
        currentUser = user;
        if (rememberMe) {
            saveData();
        } else {
            // حفظ مؤقت فقط
            localStorage.setItem('usersData', JSON.stringify({ users, idCounter, currentUser }));
        }
        
        showMessage(messageEl, `✅ مرحباً ${user.name}، تم تسجيل الدخول بنجاح 🎉`, 'success');
        document.getElementById('loginForm').reset();
        
        // إعادة تعيين الزر
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> تسجيل دخول';
        
        // الانتقال للوحة التحكم
        setTimeout(() => {
            showPage('dashboard');
        }, 1000);
        
    } catch (error) {
        showMessage(messageEl, '❌ حدث خطأ، حاول مرة أخرى', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> تسجيل دخول';
    }
}

// تسجيل خروج
function logout() {
    if (!confirm('هل أنت متأكد من تسجيل الخروج؟')) return;
    
    currentUser = null;
    saveData();
    showPage('login');
    
    // تنظيف الرسائل
    document.querySelectorAll('.message').forEach(el => {
        el.style.display = 'none';
        el.className = 'message';
    });
    
    showMessage(document.getElementById('loginMessage'), '👋 تم تسجيل الخروج بنجاح', 'success');
}

// حذف الحساب
function handleDeleteAccount() {
    if (!currentUser) {
        alert('⚠️ يجب تسجيل الدخول أولاً');
        return;
    }
    
    if (!confirm(`⚠️ هل أنت متأكد من حذف حساب "${currentUser.name}" نهائياً؟\nهذا الإجراء لا يمكن التراجع عنه!`)) return;
    
    const index = users.findIndex(u => u.id === currentUser.id);
    if (index !== -1) {
        users.splice(index, 1);
        const deletedName = currentUser.name;
        currentUser = null;
        saveData();
        showPage('login');
        showMessage(document.getElementById('loginMessage'), `🗑️ تم حذف حساب "${deletedName}" بنجاح`, 'success');
    }
}

// نسيت كلمة المرور
function handleForgotPassword() {
    const email = document.getElementById('forgotEmail').value.trim();
    const btn = event.target;
    
    if (!email) {
        alert('⚠️ الرجاء إدخال البريد الإلكتروني');
        return;
    }
    
    const user = findUserByEmail(email);
    if (!user) {
        alert('❌ هذا البريد غير مسجل');
        return;
    }
    
    // تأثير الزر
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
    btn.disabled = true;
    
    setTimeout(() => {
        alert(`✅ تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}`);
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال الرابط';
        btn.disabled = false;
        showPage('login');
    }, 1000);
}

// ============================================
// 4. عرض البيانات
// ============================================

// عرض لوحة التحكم
function updateDashboard() {
    if (!currentUser) {
        showPage('login');
        return;
    }
    
    document.getElementById('dashName').textContent = currentUser.name;
    document.getElementById('dashEmail').textContent = currentUser.email;
    document.getElementById('dashId').textContent = `#${currentUser.id}`;
    document.getElementById('dashDate').textContent = formatDate(currentUser.createdAt);
}

// عرض المستخدمين مع أنيميشن
function renderUsers() {
    const container = document.getElementById('usersList');
    const countEl = document.getElementById('usersCount');
    
    countEl.textContent = users.length;
    
    if (users.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; color:#a0aec0; padding:30px;">
                <i class="fas fa-users" style="font-size:40px; display:block; margin-bottom:10px;"></i>
                📭 لا يوجد مستخدمين
            </div>
        `;
        return;
    }
    
    container.innerHTML = users.map((user, index) => {
        const isCurrent = currentUser && currentUser.id === user.id;
        return `
            <div class="user-item" style="animation-delay: ${index * 0.05}s">
                <div class="name">
                    <i class="fas fa-user-circle"></i> ${user.name}
                    ${isCurrent ? '<span class="badge"><i class="fas fa-check-circle"></i> أنت</span>' : ''}
                </div>
                <div class="email"><i class="fas fa-envelope"></i> ${user.email}</div>
                <div class="meta">
                    <i class="fas fa-id-badge"></i> #${user.id} 
                    <i class="fas fa-calendar-alt" style="margin-right:10px;"></i> ${formatDate(user.createdAt)}
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// 5. إظهار الرسائل
// ============================================
function showMessage(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.className = `message ${type}`;
    el.style.display = 'block';
    
    // إخفاء تلقائي بعد 5 ثواني (للنجاح فقط)
    if (type === 'success') {
        setTimeout(() => {
            if (el) {
                el.style.display = 'none';
            }
        }, 5000);
    }
}

// ============================================
// 6. إضافة أنيميشن shake
// ============================================
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// ============================================
// 7. إظهار/إخفاء كلمة المرور
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('toggleBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            const pwInput = document.getElementById('loginPassword');
            const icon = this.querySelector('i');
            if (pwInput.type === 'password') {
                pwInput.type = 'text';
                icon.className = 'fas fa-eye-slash';
                this.classList.add('active');
            } else {
                pwInput.type = 'password';
                icon.className = 'fas fa-eye';
                this.classList.remove('active');
            }
        });
    }
});

// ============================================
// 8. تهيئة التطبيق
// ============================================
function init() {
    loadData();
    
    // إذا كان هناك مستخدم مسجل، افتح لوحة التحكم
    if (currentUser) {
        showPage('dashboard');
    } else {
        showPage('login');
    }
}

// تشغيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', init);
