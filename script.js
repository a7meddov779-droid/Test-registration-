// إنشاء حساب عبر GET
app.get('/signup', async (req, res) => {
  const { name, email, password } = req.query; // من الرابط مباشرة

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'جميع الحقول مطلوبة: name, email, password' });
  }

  try {
    const getRes = await axios.get(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/users.json`, {
      headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
    });

    const content = Buffer.from(getRes.data.content, 'base64').toString('utf-8');
    const users = JSON.parse(content);

    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'الإيميل مستخدم مسبقاً' });
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    await axios.put(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/users.json`, {
      message: 'إضافة مستخدم جديد',
      content: Buffer.from(JSON.stringify(users, null, 2)).toString('base64'),
      sha: getRes.data.sha
    }, {
      headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
    });

    res.json({ success: true, message: '✅ تم إنشاء الحساب بنجاح', user: { id: newUser.id, name, email } });

  } catch (error) {
    if (error.response?.status === 404) {
      // إنشاء ملف users.json إذا لم يكن موجوداً
      try {
        const newUsers = [{
          id: Date.now(),
          name,
          email,
          password,
          createdAt: new Date().toISOString()
        }];

        await axios.put(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/users.json`, {
          message: 'إنشاء ملف users.json',
          content: Buffer.from(JSON.stringify(newUsers, null, 2)).toString('base64')
        }, {
          headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
        });

        res.json({ success: true, message: '✅ تم إنشاء الحساب بنجاح', user: { id: newUsers[0].id, name, email } });

      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// تسجيل الدخول عبر GET
app.get('/login', async (req, res) => {
  const { email, password } = req.query;

  if (!email || !password) {
    return res.status(400).json({ error: 'الإيميل وكلمة المرور مطلوبة' });
  }

  try {
    const getRes = await axios.get(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/users.json`, {
      headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
    });

    const content = Buffer.from(getRes.data.content, 'base64').toString('utf-8');
    const users = JSON.parse(content);
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return res.status(401).json({ error: '❌ إيميل أو كلمة مرور خاطئة' });
    }

    res.json({ success: true, message: '✅ تم تسجيل الدخول بنجاح', user: { id: user.id, name: user.name, email: user.email } });

  } catch (error) {
    if (error.response?.status === 404) {
      res.status(404).json({ error: '❌ لا يوجد مستخدمين مسجلين' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// تعديل مستخدم عبر GET
app.get('/user/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, email, password } = req.query;

  try {
    const getRes = await axios.get(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/users.json`, {
      headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
    });

    const content = Buffer.from(getRes.data.content, 'base64').toString('utf-8');
    let users = JSON.parse(content);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    if (name) users[userIndex].name = name;
    if (email) users[userIndex].email = email;
    if (password) users[userIndex].password = password;

    await axios.put(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/users.json`, {
      message: 'تعديل مستخدم',
      content: Buffer.from(JSON.stringify(users, null, 2)).toString('base64'),
      sha: getRes.data.sha
    }, {
      headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
    });

    res.json({ success: true, message: 'تم تعديل المستخدم', user: users[userIndex] });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// حذف مستخدم عبر GET
app.get('/user/:id/delete', async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const getRes = await axios.get(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/users.json`, {
      headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
    });

    const content = Buffer.from(getRes.data.content, 'base64').toString('utf-8');
    let users = JSON.parse(content);
    const userExists = users.find(u => u.id === userId);

    if (!userExists) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    users = users.filter(u => u.id !== userId);

    await axios.put(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/users.json`, {
      message: 'حذف مستخدم',
      content: Buffer.from(JSON.stringify(users, null, 2)).toString('base64'),
      sha: getRes.data.sha
    }, {
      headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
    });

    res.json({ success: true, message: 'تم حذف المستخدم' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
