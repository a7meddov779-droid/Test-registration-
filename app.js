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
        showMessage(messageEl, '❌ حدث خطأ، حاول مرة أخرى', 'error
