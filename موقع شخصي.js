// بيانات الموقع
const siteData = {
    files: [],
    courses: [],
    notifications: [],
    user: null,
    currentTheme: 'light'
};

// تهيئة الموقع
document.addEventListener('DOMContentLoaded', function() {
    initializeSite();
    setupEventListeners();
    generateFiles();
    setupNotifications();
});

// تهيئة الموقع
function initializeSite() {
    // تعيين النسق الحالي
    if (localStorage.getItem('theme')) {
        siteData.currentTheme = localStorage.getItem('theme');
        document.documentElement.setAttribute('data-theme', siteData.currentTheme);
        updateThemeButton();
    }
    
    // إخفاء المحمل
    setTimeout(() => {
        document.getElementById('loader').style.display = 'none';
    }, 1000);
}

// إعداد المستمعين للأحداث
function setupEventListeners() {
    // زر التحكم في النسق
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleTheme);
    }
    
    // إغلاق شريط التنبيهات
    const closeAlert = document.querySelector('.close-alert');
    if (closeAlert) {
        closeAlert.addEventListener('click', function() {
            this.parentElement.parentElement.style.display = 'none';
        });
    }
    
    // التنقل بين الشعب
    const branchTabs = document.querySelectorAll('.branch-tab');
    branchTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const branch = this.dataset.branch;
            const year = this.closest('.year-container').id;
            
            // تحديث التبويبات النشطة
            branchTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // إظهار المحتوى المناسب
            const contents = document.querySelectorAll(`#${year} .branch-content`);
            contents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${branch}-branch` || content.id === `${branch}4-branch`) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // تبويبات الكورسات
    const catTabs = document.querySelectorAll('.cat-tab');
    catTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // تحديث التبويبات النشطة
            catTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // تصفية الكورسات
            const courseCards = document.querySelectorAll('.course-card');
            courseCards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });
        });
    });
    
    // فتح مودال تسجيل الدخول
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            document.getElementById('loginModal').style.display = 'flex';
        });
    }
    
    // إغلاق المودالات
    const closeButtons = document.querySelectorAll('.close-modal, .close-login');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.file-modal, .login-modal').style.display = 'none';
        });
    });
    
    // زر العودة للأعلى
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTop.style.display = 'flex';
            } else {
                backToTop.style.display = 'none';
            }
        });
        
        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // النقر على الملفات
    const materialItems = document.querySelectorAll('.material-item');
    materialItems.forEach(item => {
        item.addEventListener('click', function() {
            const fileName = this.querySelector('span').textContent;
            const fileSize = this.querySelector('.file-size').textContent;
            openFileModal(fileName, fileSize, this.dataset.pdf);
        });
    });
    
    // البحث في المكتبة
    const searchInput = document.getElementById('librarySearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchFiles(this.value);
        });
    }
    
    // مرشحات المكتبة
    const filters = document.querySelectorAll('#fileTypeFilter, #yearFilter');
    filters.forEach(filter => {
        filter.addEventListener('change', filterFiles);
    });
    
    // نموذج تسجيل الدخول
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    // التنقل في القائمة المتنقلة
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    mobileNavItems.forEach(item => {
        item.addEventListener('click', function() {
            mobileNavItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // أزرار تحميل الترم
    const termDownloadBtns = document.querySelectorAll('.term-download-btn');
    termDownloadBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const termCard = this.closest('.term-card');
            const materials = termCard.querySelectorAll('.material-item');
            const fileUrls = Array.from(materials).map(item => item.dataset.pdf);
            downloadMultipleFiles(fileUrls, `term-materials-${Date.now()}.zip`);
        });
    });
    
    // أزرار مركز التحميل السريع
    const downloadOptionBtns = document.querySelectorAll('.download-option-btn');
    downloadOptionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const option = this.dataset.download;
            handleBulkDownload(option);
        });
    });
}

// تبديل النسق
function toggleTheme() {
    siteData.currentTheme = siteData.currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', siteData.currentTheme);
    localStorage.setItem('theme', siteData.currentTheme);
    updateThemeButton();
}

// تحديث زر النسق
function updateThemeButton() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        const icon = darkModeToggle.querySelector('i');
        if (siteData.currentTheme === 'dark') {
            icon.className = 'fas fa-sun';
            darkModeToggle.title = 'النسق الفاتح';
        } else {
            icon.className = 'fas fa-moon';
            darkModeToggle.title = 'النسق الداكن';
        }
    }
}

// فتح مودال الملف
function openFileModal(fileName, fileSize, fileUrl) {
    const modal = document.getElementById('fileModal');
    const modalFileName = document.getElementById('modalFileName');
    const modalFileSize = document.getElementById('modalFileSize');
    const modalDownloadLink = document.getElementById('modalDownloadLink');
    
    modalFileName.textContent = fileName;
    modalFileSize.textContent = fileSize;
    modalDownloadLink.href = fileUrl;
    modalDownloadLink.download = `${fileName}.pdf`;
    
    // تعبئة معلومات إضافية
    const fileDate = new Date().toLocaleDateString('ar-SA');
    const fileDownloads = Math.floor(Math.random() * 1000) + 100;
    
    document.getElementById('modalFileDate').textContent = fileDate;
    document.getElementById('modalFileDownloads').textContent = fileDownloads.toLocaleString();
    
    // تحديد الفئة
    let category = 'مواد دراسية';
    if (fileUrl.includes('courses')) {
        category = 'كورسات برمجة';
    }
    document.getElementById('modalFileCategory').textContent = category;
    
    // إظهار المودال
    modal.style.display = 'flex';
    
    // تحديث عداد التحميلات (محاكاة)
    updateDownloadCount(fileUrl);
}

// البحث في الملفات
function searchFiles(query) {
    const fileCards = document.querySelectorAll('.file-card');
    const normalizedQuery = query.trim().toLowerCase();
    
    fileCards.forEach(card => {
        const fileName = card.querySelector('h4').textContent.toLowerCase();
        const fileDesc = card.querySelector('p')?.textContent?.toLowerCase() || '';
        
        if (normalizedQuery === '' || fileName.includes(normalizedQuery) || fileDesc.includes(normalizedQuery)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// تصفية الملفات
function filterFiles() {
    const fileType = document.getElementById('fileTypeFilter').value;
    const yearFilter = document.getElementById('yearFilter').value;
    
    const fileCards = document.querySelectorAll('.file-card');
    
    fileCards.forEach(card => {
        const fileYear = card.dataset.year;
        const fileCategory = card.dataset.category;
        
        let typeMatch = true;
        let yearMatch = true;
        
        if (fileType !== 'all') {
            typeMatch = fileCategory === fileType;
        }
        
        if (yearFilter !== 'all') {
            yearMatch = fileYear === yearFilter;
        }
        
        if (typeMatch && yearMatch) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// توليد بيانات الملفات
function generateFiles() {
    const filesGrid = document.getElementById('filesGrid');
    if (!filesGrid) return;
    
    const sampleFiles = [
        {
            id: 1,
            name: "كتاب الرياضيات الجامعي",
            description: "الكتاب الكامل للفرقة الأولى - الجزء الأول",
            size: "45.2 MB",
            type: "pdf",
            year: "year1",
            downloads: 1248,
            icon: "fa-file-pdf"
        },
        {
            id: 2,
            name: "عرض محاسبة التكاليف",
            description: "شرح كامل لمحاسبة التكاليف مع أمثلة عملية",
            size: "12.7 MB",
            type: "ppt",
            year: "year2",
            downloads: 856,
            icon: "fa-file-powerpoint"
        },
        {
            id: 3,
            name: "دليل HTML و CSS",
            description: "مرجع شامل لتعلم تطوير الويب للمبتدئين",
            size: "8.9 MB",
            type: "pdf",
            year: "courses",
            downloads: 2310,
            icon: "fa-file-code"
        },
        {
            id: 4,
            name: "فيديو شرح قواعد البيانات",
            description: "شرح مفصل لقواعد البيانات العلائقية",
            size: "156.3 MB",
            type: "video",
            year: "year2",
            downloads: 945,
            icon: "fa-file-video"
        },
        {
            id: 5,
            name: "ملخص نظم المعلومات",
            description: "ملخص شامل لمادة نظم المعلومات الإدارية",
            size: "5.2 MB",
            type: "doc",
            year: "year3",
            downloads: 674,
            icon: "fa-file-word"
        },
        {
            id: 6,
            name: "كتاب الذكاء الاصطناعي",
            description: "أساسيات الذكاء الاصطناعي وتعلم الآلة",
            size: "22.8 MB",
            type: "pdf",
            year: "year4",
            downloads: 432,
            icon: "fa-file-pdf"
        }
    ];
    
    filesGrid.innerHTML = '';
    sampleFiles.forEach(file => {
        const fileCard = document.createElement('div');
        fileCard.className = 'file-card';
        fileCard.dataset.year = file.year;
        fileCard.dataset.category = file.type;
        
        fileCard.innerHTML = `
            <div class="file-icon">
                <i class="fas ${file.icon}"></i>
            </div>
            <h4>${file.name}</h4>
            <p>${file.description}</p>
            <div class="file-meta">
                <span><i class="fas fa-hdd"></i> ${file.size}</span>
                <span><i class="fas fa-download"></i> ${file.downloads.toLocaleString()}</span>
                <span><i class="fas fa-calendar"></i> ${file.year.replace('year', 'الفرقة ')}</span>
            </div>
            <div class="file-actions">
                <button class="file-action-btn download-btn-file" onclick="downloadFile(${file.id})">
                    <i class="fas fa-download"></i> تحميل
                </button>
                <button class="file-action-btn view-btn" onclick="previewFile(${file.id})">
                    <i class="fas fa-eye"></i> معاينة
                </button>
            </div>
        `;
        
        filesGrid.appendChild(fileCard);
    });
    
    siteData.files = sampleFiles;
}

// تحميل ملف
function downloadFile(fileId) {
    const file = siteData.files.find(f => f.id === fileId);
    if (!file) return;
    
    // محاكاة التحميل
    showNotification(`جاري تحميل: ${file.name}`, 'info');
    
    // زيادة عداد التحميلات
    file.downloads++;
    updateFileCard(fileId);
    
    // في تطبيق حقيقي، هنا سيكون رابط التحميل الفعلي
    setTimeout(() => {
        showNotification(`تم تحميل: ${file.name} بنجاح`, 'success');
    }, 1500);
}

// معاينة ملف
function previewFile(fileId) {
    const file = siteData.files.find(f => f.id === fileId);
    if (!file) return;
    
    openFileModal(file.name, file.size, `files/${file.id}.${file.type}`);
}

// تحديث بطاقة الملف
function updateFileCard(fileId) {
    const file = siteData.files.find(f => f.id === fileId);
    if (!file) return;
    
    const fileCard = document.querySelector(`.file-card[data-year="${file.year}"][data-category="${file.type}"]`);
    if (fileCard) {
        const downloadCount = fileCard.querySelector('.file-meta span:nth-child(2)');
        if (downloadCount) {
            downloadCount.innerHTML = `<i class="fas fa-download"></i> ${file.downloads.toLocaleString()}`;
        }
    }
}

// تحديث عداد التحميلات
function updateDownloadCount(fileUrl) {
    // محاكاة تحديث العداد على الخادم
    console.log(`زيادة عداد التحميلات لـ: ${fileUrl}`);
}

// معالجة تسجيل الدخول
function handleLogin() {
    const studentId = document.getElementById('studentId').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // التحقق الأساسي
    if (!studentId || !password) {
        showNotification('يرجى ملء جميع الحقول', 'error');
        return;
    }
    
    // محاكاة تسجيل الدخول
    showNotification('جاري التحقق من البيانات...', 'info');
    
    setTimeout(() => {
        siteData.user = {
            id: studentId,
            name: 'طالب JOKER_972005'
        };
        
        if (rememberMe) {
            localStorage.setItem('studentId', studentId);
        }
        
        showNotification(`مرحباً ${siteData.user.name}!`, 'success');
        document.getElementById('loginModal').style.display = 'none';
        
        // تحديث واجهة المستخدم
        updateUserInterface();
    }, 2000);
}

// تحديث واجهة المستخدم بعد تسجيل الدخول
function updateUserInterface() {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn && siteData.user) {
        loginBtn.innerHTML = `<i class="fas fa-user"></i> ${siteData.user.name}`;
        loginBtn.classList.add('logged-in');
    }
}

// تحميل عدة ملفات
function downloadMultipleFiles(fileUrls, zipName) {
    showNotification('جاري تجهيز الملفات للتحميل...', 'info');
    
    // محاكاة إنشاء ملف ZIP
    setTimeout(() => {
        showNotification('تم تجهيز الملفات للتحميل', 'success');
        
        // في تطبيق حقيقي، هنا سيتم إنشاء وتحميل ملف ZIP
        console.log(`إنشاء ملف ${zipName} يحتوي على:`, fileUrls);
    }, 3000);
}

// تحميل مجمّع
function handleBulkDownload(option) {
    let message = '';
    
    switch(option) {
        case 'all_pdfs':
            message = 'جاري تحضير جميع ملفات PDF للتحميل (450 MB)...';
            break;
        case 'year1_all':
            message = 'جاري تحضير جميع مواد الفرقة الأولى للتحميل (85 MB)...';
            break;
        case 'programming_courses':
            message = 'جاري تحضير كورسات البرمجة للتحميل (220 MB)...';
            break;
    }
    
    showNotification(message, 'info');
    
    setTimeout(() => {
        showNotification('تم تجهيز الملفات للتحميل', 'success');
    }, 4000);
}

// إعداد الإشعارات
function setupNotifications() {
    const notificationItems = document.querySelectorAll('.notification-item');
    notificationItems.forEach(item => {
        item.addEventListener('click', function() {
            this.classList.remove('new');
        });
    });
}

// عرض الإشعارات
function showNotification(message, type = 'info') {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `floating-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <p>${message}</p>
        </div>
        <button class="close-notification"><i class="fas fa-times"></i></button>
    `;
    
    // إضافة الإشعار للصفحة
    document.body.appendChild(notification);
    
    // إغلاق الإشعار
    const closeBtn = notification.querySelector('.close-notification');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // إزالة الإشعار تلقائياً بعد 5 ثواني
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
    
    // إضافة أنماط الإشعار
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .floating-notification {
                position: fixed;
                top: 100px;
                left: 20px;
                background: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                gap: 15px;
                z-index: 9999;
                animation: slideIn 0.3s ease;
                border-right: 4px solid;
            }
            
            .floating-notification.success {
                border-right-color: var(--joker-success);
            }
            
            .floating-notification.error {
                border-right-color: var(--joker-danger);
            }
            
            .floating-notification.info {
                border-right-color: var(--joker-info);
            }
            
            .floating-notification.warning {
                border-right-color: var(--joker-warning);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
                flex: 1;
            }
            
            .notification-content i {
                font-size: 1.2rem;
            }
            
            .success .notification-content i { color: var(--joker-success); }
            .error .notification-content i { color: var(--joker-danger); }
            .info .notification-content i { color: var(--joker-info); }
            .warning .notification-content i { color: var(--joker-warning); }
            
            .notification-content p {
                margin: 0;
                font-weight: 500;
            }
            
            .close-notification {
                background: none;
                border: none;
                color: var(--joker-gray);
                cursor: pointer;
                padding: 5px;
                border-radius: 5px;
                transition: all 0.3s;
            }
            
            .close-notification:hover {
                background: #f8f9fa;
                color: var(--joker-danger);
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(-100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styles);
    }
}

// الحصول على أيقونة الإشعار المناسبة
function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

// إدارة التنزيلات
function trackDownload(fileName) {
    // حفظ في localStorage
    let downloads = JSON.parse(localStorage.getItem('downloads') || '[]');
    downloads.push({
        file: fileName,
        date: new Date().toISOString()
    });
    localStorage.setItem('downloads', JSON.stringify(downloads.slice(-50))); // حفظ آخر 50 تحميل
}

// إعادة تعيين النماذج
function resetForms() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => form.reset());
}

// توليد ملفات PDF افتراضية
function generateSamplePDFs() {
    // هذه الدالة تحاكي وجود ملفات PDF فعلية
    console.log('توليد ملفات PDF افتراضية...');
}

// تحديث العداد في الوقت الفعلي
function updateRealTimeCounters() {
    setInterval(() => {
        // محاكاة زيادة أعداد التحميل
        if (Math.random() > 0.7) { // 30% احتمال زيادة
            const randomCard = document.querySelector('.file-card');
            if (randomCard) {
                const downloadSpan = randomCard.querySelector('.file-meta span:nth-child(2)');
                if (downloadSpan) {
                    const current = parseInt(downloadSpan.textContent.replace(/,/g, ''));
                    downloadSpan.innerHTML = `<i class="fas fa-download"></i> ${(current + 1).toLocaleString()}`;
                }
            }
        }
    }, 10000); // كل 10 ثواني
}

// بدء تحديث العدادات
setTimeout(updateRealTimeCounters, 5000);

// توليد ملفات PDF عند التحميل
generateSamplePDFs();

// تهيئة بيانات المستخدم
if (localStorage.getItem('studentId')) {
    document.getElementById('studentId').value = localStorage.getItem('studentId');
}