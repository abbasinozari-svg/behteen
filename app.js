// وضعیت (State) برنامه با بارگذاری فوری داده‌های پیش‌فرض
let appData = JSON.parse(JSON.stringify(FALLBACK_DATA));
let isAdmin = false;
let currentAdminPassword = "";
let activeFilterCategory = 'all';
let activeGoalFilter = null;
let searchKeyword = '';
let basket = [];

// ساخت تصویر گرافیکی داخلی (بدون نیاز به اینترنت یا سایت‌های خارجی فیلترشده)
function getLocalPlaceholderSvg(title) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#f3f4f6"/>
    <circle cx="200" cy="115" r="36" fill="#d1fae5"/>
    <text x="200" y="125" font-family="Tahoma, sans-serif" font-size="24" font-weight="bold" fill="#065f46" text-anchor="middle">به‌تین</text>
    <text x="200" y="195" font-family="Tahoma, sans-serif" font-size="17" font-weight="bold" fill="#15803d" text-anchor="middle">${title}</text>
    <text x="200" y="225" font-family="Tahoma, sans-serif" font-size="12" fill="#78716c" text-anchor="middle">محصول ممتاز باغ‌های استهبان</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

window.addEventListener('DOMContentLoaded', () => {
  // ۱. ابتدا بلافاصله رابط کاربری را با داده‌های آماده نمایش می‌دهیم تا کاربر منتظر نماند
  renderUI();
  renderFigComparison(figDetails[0].id);
  // ۲. سپس در پس‌زمینه آخرین تغییرات را از دیتابیس Supabase می‌گیریم
  loadDatabase();
});

// دریافت داده‌ها از دیتابیس Supabase در پس‌زمینه
async function loadDatabase() {
  if (!supabaseClient) return;
  try {
    const [settingsRes, productsRes] = await Promise.all([
      supabaseClient.from('settings').select('*'),
      supabaseClient.from('products').select('*').order('sort_order', { ascending: true })
    ]);

    if (settingsRes.error) throw settingsRes.error;
    if (productsRes.error) throw productsRes.error;

    if (productsRes.data && productsRes.data.length > 0) {
      const settings = {};
      (settingsRes.data || []).forEach(row => {
        // نادیده گرفتن لینک‌های قدیمی Unsplash که در ایران فیلتر هستند
        if (row.key === 'logo_url' && row.value && row.value.includes('unsplash.com')) {
          settings[row.key] = '';
        } else {
          settings[row.key] = row.value || '';
        }
      });

      const products = productsRes.data.map(r => ({
        id: String(r.id),
        category: r.category_id,
        categoryLabel: r.category_label,
        title: r.title,
        badge: r.badge,
        badgeColor: r.badge_color,
        goals: r.goals ? String(r.goals).split(',').map(s => s.trim()).filter(Boolean) : ['daily'],
        shortDesc: r.short_desc || '',
        flavors: r.flavors ? String(r.flavors).split(',').map(s => s.trim()).filter(Boolean) : [],
        highlights: r.highlights ? String(r.highlights).split(',').map(s => s.trim()).filter(Boolean) : [],
        visualType: r.visual_type || 'custom',
        imageUrl: r.image_url || ''
      }));

      appData = { settings, products };
      renderUI();
    }
  } catch (err) {
    console.warn('ارتباط با سرور برقرار نشد؛ نمایش از روی حافظه داخلی ادامه دارد:', err.message);
  }
}

function renderUI() {
  const s = appData.settings;
  if (s.brand_title) document.getElementById('text-brand-title').innerText = s.brand_title;
  if (s.brand_name) document.getElementById('text-brand-name').innerText = s.brand_name;
  if (s.brand_tag) document.getElementById('text-brand-tag').innerText = s.brand_tag;
  if (s.about_text) document.getElementById('text-about').innerText = s.about_text;
  if (s.phone_display) document.getElementById('text-phone').innerText = s.phone_display;
  if (s.phone) document.getElementById('btn-phone-call').href = 'tel:' + s.phone;
  if (s.eitaa_url) document.getElementById('btn-eitaa').href = s.eitaa_url;
  if (s.bale_url) document.getElementById('btn-bale').href = s.bale_url;

  const logoImg = document.getElementById('nav-logo-img');
  const logoIcon = document.getElementById('nav-logo-icon');
  if (s.logo_url && s.logo_url.trim() !== '') {
    logoImg.src = s.logo_url;
    logoImg.classList.remove('hidden');
    logoIcon.classList.add('hidden');
  } else {
    logoImg.classList.add('hidden');
    logoIcon.classList.remove('hidden');
  }

  document.getElementById('heroCountBrick').innerText = appData.products.length + ' محصول کاتالوگ';

  const heroCatContainer = document.getElementById('heroCategoryList');
  heroCatContainer.innerHTML = categoriesMeta.map(c => `
    <div class="bg-white/10 p-3 rounded-2xl border border-white/10">
      <div class="text-xl mb-1">${c.icon}</div>
      <div class="font-black text-xs text-amber-200">${c.title}</div>
    </div>
  `).join('');

  renderCategoryTabs();
  renderProductsGrid();
}

function renderCategoryTabs() {
  const bar = document.getElementById('categoryTabsBar');
  let html = `
    <button onclick="setCategoryFilter('all')" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition ${activeFilterCategory === 'all' ? 'bg-emerald-800 text-white shadow-md' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}">
      همه محصولات (${appData.products.length})
    </button>
  `;
  categoriesMeta.forEach(c => {
    const count = appData.products.filter(p => p.category === c.id).length;
    const active = activeFilterCategory === c.id;
    html += `
      <button onclick="setCategoryFilter('${c.id}')" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-1.5 ${active ? 'bg-emerald-800 text-white shadow-md' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}">
        <span>${c.icon}</span>
        <span>${c.title}</span>
        <span class="text-[11px] opacity-75">(${count})</span>
      </button>
    `;
  });
  bar.innerHTML = html;
}

function renderProductsGrid() {
  const grid = document.getElementById('productsCardsGrid');
  const filtered = appData.products.filter(p => {
    const matchCat = activeFilterCategory === 'all' || p.category === activeFilterCategory;
    const matchGoal = !activeGoalFilter || (p.goals && p.goals.includes(activeGoalFilter));
    const q = searchKeyword.trim().toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.shortDesc.toLowerCase().includes(q);
    return matchCat && matchGoal && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="col-span-full py-12 text-center text-stone-400 font-bold">محصولی با این مشخصات یافت نشد.</div>`;
    return;
  }

  grid.innerHTML = filtered.map((prod) => {
    const realIdx = appData.products.findIndex(item => item.id === prod.id);
    const editableAttr = isAdmin ? 'contenteditable="true" data-editable="true"' : '';
    const fallbackSvg = getLocalPlaceholderSvg(prod.title);
    const imgSrc = prod.imageUrl && prod.imageUrl.trim() !== '' ? prod.imageUrl : fallbackSvg;

    return `
      <div class="material-card bg-white rounded-3xl border border-stone-200 overflow-hidden flex flex-col justify-between">
        <div>
          <div class="relative h-48 bg-stone-100 overflow-hidden">
            <img src="${imgSrc}" onerror="this.onerror=null; this.src='${fallbackSvg}';" alt="${prod.title}" class="w-full h-full object-cover">
            <span class="absolute top-3 right-3 text-xs font-black px-3 py-1 rounded-full border shadow-sm ${prod.badgeColor || 'bg-amber-100 text-amber-900 border-amber-300'}">
              ${prod.badge || 'ویژه'}
            </span>
            ${isAdmin ? `
              <button onclick="promptProductImageChange(${realIdx})" class="absolute bottom-2 left-2 bg-stone-900/80 text-white text-[11px] px-2.5 py-1 rounded-lg">
                تغییر لینک عکس
              </button>
            ` : ''}
          </div>
          <div class="p-5 space-y-2">
            <div class="text-[11px] font-black text-emerald-800">${prod.categoryLabel || 'خشکبار'}</div>
            <h3 ${editableAttr} onblur="updateProductField(${realIdx}, 'title', this.innerText)" class="font-black text-stone-900 text-base sm:text-lg">${prod.title}</h3>
            <p ${editableAttr} onblur="updateProductField(${realIdx}, 'shortDesc', this.innerText)" class="text-xs sm:text-sm text-stone-600 leading-relaxed">${prod.shortDesc}</p>
            
            ${prod.flavors && prod.flavors.length ? `
              <div class="pt-2 flex flex-wrap gap-1.5">
                ${prod.flavors.map(f => `<span class="bg-stone-100 text-stone-700 text-[11px] font-bold px-2.5 py-1 rounded-lg">${f}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        </div>
        <div class="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
          <span class="text-xs font-black text-emerald-900">محصول باغدار استهبان</span>
          <button onclick="addToBasket('${prod.title}')" class="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm">
            <i class="fa-solid fa-plus text-[10px]"></i>
            <span>افزودن به لیست</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function setCategoryFilter(catId) {
  activeFilterCategory = catId;
  renderCategoryTabs();
  renderProductsGrid();
}

function applyGoalFilter(goal) {
  activeGoalFilter = goal;
  document.getElementById('resetFilterBtn').classList.remove('hidden');
  renderProductsGrid();
  document.getElementById('catalogSection').scrollIntoView({ behavior: 'smooth' });
}

function resetFilters() {
  activeGoalFilter = null;
  searchKeyword = '';
  document.getElementById('productSearchInput').value = '';
  document.getElementById('resetFilterBtn').classList.add('hidden');
  activeFilterCategory = 'all';
  renderCategoryTabs();
  renderProductsGrid();
}

function handleSearch(val) {
  searchKeyword = val;
  renderProductsGrid();
}

function renderFigComparison(selectedId) {
  const nav = document.getElementById('figCompareNav');
  nav.innerHTML = figDetails.map(f => `
    <button onclick="renderFigComparison('${f.id}')" class="p-3 rounded-2xl text-right transition ${f.id === selectedId ? 'bg-amber-400 text-stone-950 font-black shadow-lg' : 'bg-white/5 hover:bg-white/10 text-stone-300 font-bold'}">
      <div class="text-xs sm:text-sm">${f.name}</div>
      <div class="text-[10px] opacity-80 mt-1">${f.grade}</div>
    </button>
  `).join('');

  const curr = figDetails.find(f => f.id === selectedId);
  document.getElementById('figCompareDetailsBox').innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      <div class="space-y-3">
        <span class="bg-amber-400/20 text-amber-300 text-xs px-3 py-1 rounded-full font-black">${curr.grade}</span>
        <h4 class="text-xl sm:text-2xl font-black">${curr.name} استهبان</h4>
        <p class="text-xs sm:text-sm text-stone-300 leading-relaxed font-medium">${curr.note}</p>
      </div>
      <div class="space-y-3 bg-black/30 p-5 rounded-2xl border border-white/10">
        <div>
          <div class="flex justify-between text-xs font-black mb-1">
            <span>درصد خندان و دهان‌باز بودن:</span>
            <span class="text-amber-300">${curr.openPct}٪</span>
          </div>
          <div class="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div class="h-full bg-amber-400" style="width:${curr.openPct}%"></div>
          </div>
        </div>
        <div>
          <div class="flex justify-between text-xs font-black mb-1">
            <span>میزان شهد و شیرینی طبیعی:</span>
            <span class="text-rose-400">${curr.sweetPct}٪</span>
          </div>
          <div class="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div class="h-full bg-rose-500" style="width:${curr.sweetPct}%"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function handleAdminLoginClick() {
  if (isAdmin) {
    logoutAdmin();
  } else {
    document.getElementById('adminAuthModal').classList.remove('hidden');
    document.getElementById('adminPasswordInput').value = '';
    document.getElementById('adminPasswordInput').focus();
  }
}

function closeAdminAuthModal() {
  document.getElementById('adminAuthModal').classList.add('hidden');
}

async function submitAdminPassword() {
  const pass = document.getElementById('adminPasswordInput').value.trim();
  if (!pass) return;

  try {
    const { data: isValid, error } = await supabaseClient.rpc('check_admin_auth', {
      pass_input: pass
    });

    if (error) throw error;

    if (isValid) {
      isAdmin = true;
      currentAdminPassword = pass;
      closeAdminAuthModal();
      document.body.classList.add('admin-mode');
      document.getElementById('adminLiveBar').classList.remove('hidden');
      document.getElementById('adminLoginBtn').innerHTML = '<i class="fa-solid fa-lock-open text-emerald-400"></i><span>خروج مدیر</span>';
      enableInlineEditing();
      renderProductsGrid();
      alert('حالت ویرایش فعال شد. می‌توانید مستقیماً متن‌ها را روی صفحه تغییر دهید.');
    } else {
      alert('رمز عبور وارد شده نادرست است!');
    }
  } catch (err) {
    alert('خطا در ارتباط با سرور دیتابیس (برای ورود مدیریت اتصال اینترنت خود را بررسی کنید): ' + err.message);
  }
}

function logoutAdmin() {
  isAdmin = false;
  currentAdminPassword = "";
  document.body.classList.remove('admin-mode');
  document.getElementById('adminLiveBar').classList.add('hidden');
  document.getElementById('adminLoginBtn').innerHTML = '<i class="fa-solid fa-user-gear"></i><span>ورود مدیر</span>';
  document.querySelectorAll('[data-editable="true"]').forEach(el => {
    el.removeAttribute('contenteditable');
  });
  renderProductsGrid();
}

function enableInlineEditing() {
  document.querySelectorAll('[data-editable="true"]').forEach(el => {
    el.setAttribute('contenteditable', 'true');
    el.onblur = function() {
      const key = el.getAttribute('data-key');
      if (key) appData.settings[key] = el.innerText.trim();
    };
  });
}

function updateProductField(index, field, value) {
  if (appData.products[index]) {
    appData.products[index][field] = value.trim();
  }
}

function promptLogoChange() {
  const cur = appData.settings.logo_url || '';
  const url = prompt('لینک مستقیم تصویر لوگو را وارد کنید:', cur);
  if (url !== null) {
    appData.settings.logo_url = url.trim();
    renderUI();
  }
}

function promptProductImageChange(index) {
  const cur = appData.products[index].imageUrl || '';
  const url = prompt('لینک مستقیم تصویر محصول را وارد کنید:', cur);
  if (url !== null) {
    appData.products[index].imageUrl = url.trim();
    renderProductsGrid();
  }
}

function openAddProductModal() {
  const title = prompt('نام محصول جدید:');
  if (title) {
    appData.products.unshift({
      id: 'custom-' + Date.now(),
      category: 'figs',
      categoryLabel: 'انجیر و فرآورده‌ها',
      title: title,
      badge: 'تازه',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      goals: ['daily'],
      shortDesc: 'محصول باکیفیت و دستچین شده باغات استهبان',
      flavors: ['سفارشی'],
      imageUrl: ''
    });
    renderProductsGrid();
  }
}

async function saveAllChangesToSheet(event) {
  if (!isAdmin) return;
  const btn = event.currentTarget;
  const prevHtml = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> در حال ذخیره...';

  try {
    const { error } = await supabaseClient.rpc('commit_catalog_changes', {
      pass_input: currentAdminPassword,
      new_settings: appData.settings,
      new_products: appData.products
    });

    if (error) throw error;

    alert('تمام تغییرات با موفقیت در دیتابیس Supabase ذخیره گردید.');
  } catch (err) {
    alert('خطا در ذخیره‌سازی: ' + err.message);
  } finally {
    btn.innerHTML = prevHtml;
  }
}

function addToBasket(title) {
  basket.push(title);
  document.getElementById('basketCountBadge').innerText = basket.length;
  alert(`«${title}» به لیست استعلام افزوده شد.`);
}

function openBasketModal() {
  const c = document.getElementById('basketListItems');
  if (basket.length === 0) {
    c.innerHTML = '<div class="text-center py-6 text-stone-400 font-bold text-xs">لیست استعلام خالی است.</div>';
  } else {
    c.innerHTML = basket.map((item, idx) => `
      <div class="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold">
        <span>${item}</span>
        <button onclick="basket.splice(${idx}, 1); openBasketModal(); document.getElementById('basketCountBadge').innerText=basket.length;" class="text-rose-600">✕</button>
      </div>
    `).join('');
  }
  document.getElementById('basketModal').classList.remove('hidden');
}

function closeBasketModal() {
  document.getElementById('basketModal').classList.add('hidden');
}

function copyBasketToClipboard() {
  if (basket.length === 0) return;
  const text = `سلام، استعلام کاتالوگ به‌تین:\n` + basket.map((b, i) => `${i+1}. ${b}`).join('\n');
  navigator.clipboard.writeText(text);
  alert('متن استعلام کپی شد. می‌توانید در ایتا یا بله ارسال کنید.');
}

function openPdfModal() {
  buildA4PagesPreview();
  document.getElementById('pdfExportModal').classList.remove('hidden');
}

function closePdfModal() {
  document.getElementById('pdfExportModal').classList.add('hidden');
}

function buildA4PagesPreview() {
  const container = document.getElementById('pdfCaptureContainer');
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(appData.products.length / ITEMS_PER_PAGE);
  let pagesHtml = '';

  for (let p = 0; p < totalPages; p++) {
    const pageItems = appData.products.slice(p * ITEMS_PER_PAGE, (p + 1) * ITEMS_PER_PAGE);
    
    pagesHtml += `
      <div class="pdf-a4-page p-8" id="pdfPage_${p}">
        <div>
          <div class="flex items-center justify-between border-b-2 border-emerald-900 pb-4 mb-6">
            <div>
              <h2 class="text-2xl font-black text-emerald-950">${appData.settings.brand_title || 'کاتالوگ به‌تین'}</h2>
              <p class="text-xs text-stone-600 font-bold mt-1">محصولی از بهشت استهبان • عرضه مستقیم بدون واسطه</p>
            </div>
            <div class="text-left text-xs font-black text-emerald-900 space-y-0.5">
              <div>تلفن: ${appData.settings.phone_display || '۰۹۱۷۱۳۰۵۷۶۶'}</div>
              <div class="text-orange-600">ایتا: ${appData.settings.eitaa_handle || 'eitaa.com/behteen'}</div>
              <div class="text-emerald-700">بله: ${appData.settings.bale_handle || 'ble.ir/behteen'}</div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            ${pageItems.map(item => `
              <div style="height: 250px;" class="border border-stone-300 rounded-2xl p-3 bg-stone-50 flex flex-col justify-between">
                <div>
                  <div class="flex justify-between items-center text-[10px] font-black mb-1.5">
                    <span class="text-emerald-900 font-black">${item.categoryLabel || 'خشکبار'}</span>
                    <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">${item.badge || 'ویژه'}</span>
                  </div>
                  <div class="font-black text-sm text-stone-900 mb-1">${item.title}</div>
                  <div class="text-[11px] text-stone-600 line-clamp-3 leading-relaxed">${item.shortDesc}</div>
                </div>
                ${item.imageUrl ? `
                  <img src="${item.imageUrl}" crossorigin="anonymous" class="w-full h-24 object-cover rounded-xl mt-2">
                ` : `
                  <div class="w-full h-24 bg-white border border-stone-200 rounded-xl flex items-center justify-center text-xs font-black text-emerald-900 mt-2">
                    به‌تین استهبان
                  </div>
                `}
              </div>
            `).join('')}
          </div>
        </div>

        <div class="border-t border-stone-300 pt-3 flex justify-between items-center text-xs text-stone-500 font-black">
          <span>کیفیت ممتاز و ارگانیک استهبان</span>
          <span class="bg-emerald-900 text-white px-3 py-1 rounded-full">صفحه ${p + 1} از ${totalPages}</span>
          <span>تلفن سفارش: ${appData.settings.phone_display || '۰۹۱۷۱۳۰۵۷۶۶'}</span>
        </div>
      </div>
    `;
  }

  container.innerHTML = pagesHtml;
}

async function generatePdfFromSnapshot() {
  const btn = document.getElementById('pdfDownloadTrigger');
  const status = document.getElementById('pdfGenStatus');
  const prevHtml = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> در حال ساخت PDF...';

  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pages = document.querySelectorAll('.pdf-a4-page');

    for (let i = 0; i < pages.length; i++) {
      status.innerText = `در حال ثبت عکس از صفحه ${i + 1} از ${pages.length}...`;
      const canvas = await html2canvas(pages[i], {
        scale: 2,
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      if (i > 0) pdf.addPage('a4', 'p');
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    }

    pdf.save('کاتالوگ_خشکبار_به_تین.pdf');
    status.innerText = 'فایل PDF با موفقیت دانلود شد!';
  } catch (err) {
    alert('خطا در تبدیل تصویر به PDF: ' + err.message);
  } finally {
    btn.innerHTML = prevHtml;
  }
}
