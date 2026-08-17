/**
 * نظام إدارة المستخدمين
 * محاكاة كاملة لـ API مع تخزين في الذاكرة
 */

// ============================================
// 1. قاعدة البيانات (ذاكرة مؤقتة)
// ============================================
let users = [];
let idCounter = 1;

// ============================================
// 2. دوال مساعدة
// ============================================
function findUser(id) {
    return users.find(u => u.id === id);
}

function findUserByEmail(email) {
    return users.find(u => u.email === email);
}

// ============================================
// 3. محرك معالجة الطلبات (API Simulator)
// ============================================
function handleRequest(method, path, query = {}, body = null) {
    // دالة مساعدة لبناء الاستجابة
    function res(success, data, errorMsg = null) {
        return {
            success,
            data,
            error: errorMsg,
            path,
            method
        };
    }

    // ----- مسار الصفحة الرئيسية -----
    if (path === '/' && method === 'GET') {
        return res(true, {
            api: "نظام تسجيل الدخول",
            endpoints: {
                "GET /signup": "إنشاء حساب {name, email, password}",
                "GET /login": "تسجيل دخول {email, password}",
                "GET /users": "عرض جميع المستخدمين",
                "GET /user/:id": "تعديل مستخدم {name, email, password}",
                "GET /user/:id/delete": "حذف مستخدم",
                "POST /signup": "إنشاء حساب (JSON)",
                "POST /login": "تسجيل دخول (JSON)",
                "PUT /user/:id": "تعديل مستخدم (JSON)",
                "DELETE /user/:id": "حذف مستخدم"
            }
        });
    }

    // ----- إنشاء حساب (GET) -----
    if (path === '/signup' && method === 'GET') {
        const { name, email, password } = query;
        if (!name || !email || !password) {
            return res(false, null, 'جميع الحقول مطلوبة');
        }
        if (findUserByEmail(email)) {
            return res(false, null, 'الإيميل مستخدم مسبقاً');
        }
        const newUser = {
            id: idCounter++,
            name,
            email,
            password,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        return res(true, {
            user: { id: newUser.id, name, email }
        });
    }

    // ----- تسجيل دخول (GET) -----
    if (path === '/login' && method === 'GET') {
        const { email, password } = query;
        if (!email || !password) {
            return res(false, null, '❌ إيميل أو كلمة مرور خاطئة');
        }
        const user = findUserByEmail(email);
        if (!user || user.password !== password) {
            return res(false, null, '❌ إيميل أو كلمة مرور خاطئة');
        }
        return res(true, {
            user: { id: user.id, name: user.name, email: user.email }
        });
    }

    // ----- عرض المستخدمين (GET) -----
    if (path === '/users' && method === 'GET') {
        const total = users.length;
        const userList = users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            createdAt: u.createdAt
        }));
        
        let text = `👥 *قائمة المستخدمين*\n\n📌 *إجمالي:* ${total}\n\n`;
        if (total === 0) {
            text += '❌ لا يوجد مستخدمين مسجلين';
        } else {
            userList.forEach((u, i) => {
                const date = new Date(u.createdAt).toLocaleDateString('ar-EG');
                text += `${i+1}. *${u.name}*\n   📧 ${u.email}\n   🆔 ${u.id}\n   📅 ${date}\n\n`;
            });
        }
        return res(true, { total, users: userList, text });
    }

    // ----- تعديل مستخدم (GET) -----
    if (path.startsWith('/user/') && !path.endsWith('/delete') && method === 'GET') {
        const id = parseInt(path.split('/')[2]);
        if (isNaN(id)) return res(false, null, 'معرف غير صالح');
        const user = findUser(id);
        if (!user) return res(false, null, 'المستخدم غير موجود');
        
        const { name, email, password } = query;
        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = password;
        return res(true, { user: { ...user } });
    }

    // ----- حذف مستخدم (GET) -----
    if (path.startsWith('/user/') && path.endsWith('/delete') && method === 'GET') {
        const id = parseInt(path.split('/')[2]);
        if (isNaN(id)) return res(false, null, 'معرف غير صالح');
        const idx = users.findIndex(u => u.id === id);
        if (idx === -1) return res(false, null, 'المستخدم غير موجود');
        users.splice(idx, 1);
        return res(true, { message: '✅ تم حذف المستخدم' });
    }

    // ----- إنشاء حساب (POST) -----
    if (path === '/signup' && method === 'POST') {
        const { name, email, password } = body || {};
        if (!name || !email || !password) {
            return res(false, null, 'جميع الحقول مطلوبة');
        }
        if (findUserByEmail(email)) {
            return res(false, null, 'الإيميل مستخدم مسبقاً');
        }
        const newUser = {
            id: idCounter++,
            name,
            email,
            password,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        return res(true, {
            user: { id: newUser.id, name, email }
        });
    }

    // ----- تسجيل دخول (POST) -----
    if (path === '/login' && method === 'POST') {
        const { email, password } = body || {};
        if (!email || !password) {
            return res(false, null, '❌ إيميل أو كلمة مرور خاطئة');
        }
        const user = findUserByEmail(email);
        if (!user || user.password !== password) {
            return res(false, null, '❌ إيميل أو كلمة مرور خاطئة');
        }
        return res(true, {
            user: { id: user.id, name: user.name, email: user.email }
        });
    }

    // ----- تعديل مستخدم (PUT) -----
    if (path.startsWith('/user/') && method === 'PUT') {
        const id = parseInt(path.split('/')[2]);
        if (isNaN(id)) return res(false, null, 'معرف غير صالح');
        const user = findUser(id);
        if (!user) return res(false, null, 'المستخدم غير موجود');
        
        const { name, email, password } = body || {};
        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = password;
        return res(true, { user: { ...user } });
    }

    // ----- حذف مستخدم (DELETE) -----
    if (path.startsWith('/user/') && method === 'DELETE') {
        const id = parseInt(path.split('/')[2]);
        if (isNaN(id)) return res(false, null, 'معرف غير صالح');
        const idx = users.findIndex(u => u.id === id);
        if (idx === -1) return res(false, null, 'المستخدم غير موجود');
        users.splice(idx, 1);
        return res(true, { message: '✅ تم حذف المستخدم' });
    }

    // مسار غير معروف
    return res(false, null, '⚠️ المسار غير معروف');
}

// ============================================
// 4. دالة اختبار وتنسيق النتائج
// ============================================
function testEndpoint(method, path, queryStr, bodyStr) {
    // تحويل query string إلى object
    const query = {};
    if (queryStr) {
        new URLSearchParams(queryStr).forEach((val, key) => {
            query[key] = val;
        });
    }
    
    // تحويل body إذا وجد
    let body = null;
    if (bodyStr) {
        try {
            body = JSON.parse(bodyStr);
        } catch (e) {
            body = {};
        }
    }

    const result = handleRequest(method, path, query, body);

    // تجهيز النص للعرض
    let responseText = '';
    if (result.success) {
        const data = result.data;
        if (method === 'GET' && path === '/users' && data.text) {
            responseText = data.text;
        } else {
            responseText = JSON.stringify(data, null, 2);
        }
    } else {
        responseText = result.error || 'خطأ غير معروف';
    }

    return {
        success: result.success,
        text: responseText
    };
}

// ============================================
// 5. إعداد البيانات الأولية
// ============================================
function seedData() {
    const existing = findUserByEmail('a@t.com');
    if (!existing) {
        users.push({
            id: idCounter++,
            name: 'أحمد',
            email: 'a@t.com',
            password: '123',
            createdAt: new Date('2026-01-15T12:00:00.000Z').toISOString()
        });
    }
}

// ============================================
// 6. بناء واجهة المستخدم
// ============================================
const endpoints = [
    { method: 'GET', path: '/signup', desc: 'إنشاء حساب', query: 'name=أحمد&email=a@t.com&password=123' },
    { method: 'GET', path: '/login', desc: 'تسجيل دخول', query: 'email=a@t.com&password=123' },
    { method: 'GET', path: '/users', desc: 'عرض المستخدمين', query: '' },
    { method: 'GET', path: '/user/123', desc: 'تعديل مستخدم', query: 'name=جديد&email=new@t.com' },
    { method: 'GET', path: '/user/123/delete', desc: 'حذف مستخدم', query: '' },
    { method: 'POST', path: '/signup', desc: 'إنشاء حساب (JSON)', body: '{"name":"أحمد","email":"a@t.com","password":"123"}' },
    { method: 'POST', path: '/login', desc: 'تسجيل دخول (JSON)', body: '{"email":"a@t.com","password":"123"}' },
    { method: 'PUT', path: '/user/123', desc: 'تعديل مستخدم (JSON)', body: '{"name":"جديد","email":"new@t.com","password":"123"}' },
    { method: 'DELETE', path: '/user/123', desc: 'حذف مستخدم (JSON)', body: '' },
    { method: 'GET', path: '/', desc: 'الصفحة الرئيسية', query: '' },
];

function buildUI() {
    const container = document.getElementById('endpointsContainer');
    if (!container) return;

    endpoints.forEach(ep => {
        const card = document.createElement('div');
        card.className = 'card';

        const methodClass = ep.method.toLowerCase();
        const queryDisplay = ep.query ? `?${ep.query}` : '';
        const bodyDisplay = ep.body ? `📦 ${ep.body}` : '';

        // تنفيذ الطلب للحصول على استجابة نموذجية
        const result = testEndpoint(ep.method, ep.path, ep.query, ep.body);

        // تنسيق الاستجابة
        let responseHtml = result.text;
        if (result.success) {
            responseHtml = `<span class="success">✅ نجاح</span>\n` + responseHtml;
        } else {
            responseHtml = `<span class="error">❌ فشل</span>\n` + responseHtml;
        }

        card.innerHTML = `
            <h3>
                <span>${ep.desc}</span>
                <span class="method ${methodClass}">${ep.method}</span>
            </h3>
            <div class="url">${ep.path}${queryDisplay}</div>
            ${bodyDisplay ? `<div class="body-data">${bodyDisplay}</div>` : ''}
            <div class="response">${responseHtml}</div>
            <div class="flex mt-2">
                <button class="btn-test" data-method="${ep.method}" data-path="${ep.path}" data-query="${ep.query || ''}" data-body="${ep.body || ''}">🔄 اختبار</button>
                <span class="badge">${ep.method === 'GET' ? '🔗 رابط' : '📨 بيانات'}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

// ============================================
// 7. أحداث الأزرار (اختبار)
// ============================================
function setupEventListeners() {
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('.btn-test');
        if (!btn) return;

        const card = btn.closest('.card');
        if (!card) return;

        const responseDiv = card.querySelector('.response');
        if (!responseDiv) return;

        const method = btn.dataset.method;
        const path = btn.dataset.path;
        const queryStr = btn.dataset.query;
        const bodyStr = btn.dataset.body;

        // إعادة تنفيذ الطلب
        const result = testEndpoint(method, path, queryStr, bodyStr);
        let responseHtml = result.text;
        if (result.success) {
            responseHtml = `<span class="success">✅ نجاح</span>\n` + responseHtml;
        } else {
            responseHtml = `<span class="error">❌ فشل</span>\n` + responseHtml;
        }
        responseDiv.innerHTML = responseHtml;

        // تأثير بصري مؤقت
        card.style.borderColor = '#4299e1';
        card.style.boxShadow = '0 4px 20px rgba(66, 153, 225, 0.3)';
        setTimeout(() => {
            card.style.borderColor = '#e2e8f0';
            card.style.boxShadow = 'none';
        }, 600);
    });
}

// ============================================
// 8. تهيئة التطبيق
// ============================================
function init() {
    seedData();
    buildUI();
    setupEventListeners();
}

// تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', init);
