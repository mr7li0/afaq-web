// ===== ADMIN DASHBOARD =====
(function () {
  'use strict';

  var STORAGE_KEY = 'afaq_gallery_data';

  // Load data from localStorage or fall back to gallery-data.js
  function loadData() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return typeof galleryData !== 'undefined' ? galleryData : [];
  }

  function saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      alert('حدث خطأ أثناء الحفظ. قد تكون الصور كبيرة جداً.');
    }
  }

  function nextId(data) {
    var max = 0;
    data.forEach(function (d) { if (d.id > max) max = d.id; });
    return max + 1;
  }

  var data = loadData();

  // ===== RENDER =====
  function renderStats() {
    var total = data.length;
    var series = data.filter(function (d) { return d.type === 'series'; }).length;
    var individual = data.filter(function (d) { return d.type === 'individual'; }).length;
    var carousel = data.filter(function (d) { return d.type === 'carousel'; }).length;
    var heroCount = 0;
    data.forEach(function (d) {
      if (d.hero) heroCount++;
      else if (d.images && d.images.length > 0) {
        // Default: first 6 items show in hero if not explicitly set
      }
    });

    document.getElementById('stats').innerHTML =
      '<div class="admin-stat"><p class="num">' + total + '</p><p class="label">إجمالي العناصر</p></div>' +
      '<div class="admin-stat"><p class="num">' + individual + '</p><p class="label">فردي</p></div>' +
      '<div class="admin-stat"><p class="num">' + series + '</p><p class="label">سلسلة</p></div>' +
      '<div class="admin-stat"><p class="num">' + carousel + '</p><p class="label">كاروسيل</p></div>' +
      '<div class="admin-stat"><p class="num">' + countTotalImages() + '</p><p class="label">إجمالي الصور</p></div>';
  }

  function countTotalImages() {
    var count = 0;
    data.forEach(function (d) { count += (d.images ? d.images.length : 1); });
    return count;
  }

  function renderGrid() {
    var grid = document.getElementById('admin-grid');
    if (!grid) return;
    if (data.length === 0) {
      grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--ivory-dark);opacity:0.5;padding:60px 0;">لا توجد عناصر بعد. اضغط "+ إضافة صورة" للبدء.</p>';
      return;
    }

    grid.innerHTML = '';
    data.forEach(function (item) {
      var card = document.createElement('div');
      card.className = 'admin-card';

      var imgHtml = '';
      if (item.images && item.images.length > 0) {
        var src = item.images[0];
        // If it's a local file (no http), prefix with assets/gallery/
        if (src.indexOf('data:') !== 0 && src.indexOf('http') !== 0) {
          src = 'assets/gallery/' + src;
        }
        imgHtml = '<img class="admin-card-img" src="' + src + '" alt="' + esc(item.title) + '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'"><div class="admin-card-placeholder" style="display:none">' + esc(item.title) + '</div>';
      } else {
        imgHtml = '<div class="admin-card-placeholder">' + esc(item.title) + '</div>';
      }

      var tags = '';
      if (item.type === 'series') tags += '<span class="admin-tag admin-tag-series">سلسلة</span>';
      else if (item.type === 'carousel') tags += '<span class="admin-tag admin-tag-carousel">كاروسيل</span>';
      else tags += '<span class="admin-tag admin-tag-individual">فردي</span>';

      if (item.hero) tags += '<span class="admin-tag admin-tag-hero">كاروسيل رئيسي</span>';

      var imgCount = item.images ? item.images.length : 1;
      if (imgCount > 1) tags += '<span class="admin-tag" style="background:rgba(233,227,211,0.06);color:var(--ivory-dark);border-color:rgba(233,227,211,0.1);">' + imgCount + ' صور</span>';

      card.innerHTML =
        imgHtml +
        '<div class="admin-card-body">' +
          '<p class="admin-card-title">' + esc(item.title) + '</p>' +
          '<p class="admin-card-desc">' + esc(item.desc || '') + '</p>' +
          '<div class="admin-card-meta">' + tags + '</div>' +
          '<div class="admin-card-actions">' +
            '<button onclick="adminEdit(' + item.id + ')">تعديل</button>' +
            '<button onclick="adminToggleHero(' + item.id + ')">' + (item.hero ? 'إزالة من الكاروسيل' : 'إضافة للكاروسيل') + '</button>' +
            '<button class="del-btn" onclick="adminDelete(' + item.id + ')">حذف</button>' +
          '</div>' +
        '</div>';

      grid.appendChild(card);
    });
  }

  function esc(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function render() {
    renderStats();
    renderGrid();
  }

  // ===== MODAL =====
  window.openAddModal = function () {
    document.getElementById('modal-title').textContent = 'إضافة صورة جديدة';
    document.getElementById('edit-id').value = '';
    document.getElementById('item-title').value = '';
    document.getElementById('item-desc').value = '';
    document.getElementById('item-type').value = 'individual';
    document.getElementById('item-hero').value = '0';
    document.getElementById('item-image').value = '';
    document.getElementById('item-file').value = '';
    document.getElementById('item-modal').classList.add('open');
  };

  window.adminEdit = function (id) {
    var item = data.find(function (d) { return d.id === id; });
    if (!item) return;
    document.getElementById('modal-title').textContent = 'تعديل الصورة';
    document.getElementById('edit-id').value = id;
    document.getElementById('item-title').value = item.title;
    document.getElementById('item-desc').value = item.desc || '';
    document.getElementById('item-type').value = item.type || 'individual';
    document.getElementById('item-hero').value = item.hero ? '1' : '0';
    document.getElementById('item-image').value = (item.images && item.images[0]) ? item.images[0] : '';
    document.getElementById('item-file').value = '';
    document.getElementById('item-modal').classList.add('open');
  };

  window.closeModal = function () {
    document.getElementById('item-modal').classList.remove('open');
  };

  // Close modal on overlay click
  document.getElementById('item-modal').addEventListener('click', function (e) {
    if (e.target === this) window.closeModal();
  });

  // Close modal on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') window.closeModal();
  });

  // ===== SAVE =====
  window.saveItem = function () {
    var title = document.getElementById('item-title').value.trim();
    var desc = document.getElementById('item-desc').value.trim();
    var type = document.getElementById('item-type').value;
    var hero = document.getElementById('item-hero').value === '1';
    var imageUrl = document.getElementById('item-image').value.trim();
    var fileInput = document.getElementById('item-file');
    var editId = document.getElementById('edit-id').value;

    if (!title) {
      alert('العنوان مطلوب');
      return;
    }

    // Handle file upload
    if (fileInput.files && fileInput.files.length > 0) {
      var files = Array.from(fileInput.files);
      var promises = files.map(function (file) {
        return new Promise(function (resolve) {
          var reader = new FileReader();
          reader.onload = function (e) { resolve(e.target.result); };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(promises).then(function (base64Images) {
        if (editId) {
          // Edit existing
          var item = data.find(function (d) { return d.id === parseInt(editId); });
          if (item) {
            item.title = title;
            item.desc = desc;
            item.type = type;
            item.hero = hero;
            item.images = base64Images;
          }
        } else {
          // Add new
          data.push({
            id: nextId(data),
            title: title,
            desc: desc,
            type: type,
            hero: hero,
            images: base64Images
          });
        }
        saveData(data);
        render();
        window.closeModal();
      });
    } else {
      // Use URL
      if (!imageUrl) {
        alert('أدخل رابط الصورة أو ارفع ملفاً');
        return;
      }
      // Support comma-separated multiple URLs
      var images = imageUrl.split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s; });

      if (editId) {
        var item = data.find(function (d) { return d.id === parseInt(editId); });
        if (item) {
          item.title = title;
          item.desc = desc;
          item.type = type;
          item.hero = hero;
          item.images = images;
        }
      } else {
        data.push({
          id: nextId(data),
          title: title,
          desc: desc,
          type: type,
          hero: hero,
          images: images
        });
      }
      saveData(data);
      render();
      window.closeModal();
    }
  };

  // ===== DELETE =====
  window.adminDelete = function (id) {
    var item = data.find(function (d) { return d.id === id; });
    if (!item) return;
    if (!confirm('هل أنت متأكد من حذف "' + item.title + '"؟')) return;
    data = data.filter(function (d) { return d.id !== id; });
    saveData(data);
    render();
  };

  // ===== TOGGLE HERO =====
  window.adminToggleHero = function (id) {
    var item = data.find(function (d) { return d.id === id; });
    if (!item) return;
    item.hero = !item.hero;
    saveData(data);
    render();
  };

  // ===== CLEAR ALL =====
  window.clearAll = function () {
    if (!confirm('هل أنت متأكد من مسح جميع العناصر؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    data = [];
    saveData(data);
    render();
  };

  // ===== EXPORT =====
  window.exportData = function () {
    var json = JSON.stringify(data, null, 2);
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'gallery-data-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ===== IMPORT =====
  window.importData = function () {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (ev) {
        try {
          var imported = JSON.parse(ev.target.result);
          if (!Array.isArray(imported)) {
            alert('الملف غير صحيح. يجب أن يحتوي على مصفوفة JSON.');
            return;
          }
          if (!confirm('سيتم استيراد ' + imported.length + ' عنصر. سيتم دمجها مع البيانات الحالية. متابعة؟')) return;
          // Merge: add imported items, avoid duplicates by id
          var existingIds = {};
          data.forEach(function (d) { existingIds[d.id] = true; });
          imported.forEach(function (item) {
            if (existingIds[item.id]) {
              // Change id if duplicate
              item.id = nextId(data);
            }
            data.push(item);
            existingIds[item.id] = true;
          });
          saveData(data);
          render();
          alert('تم الاستيراد بنجاح!');
        } catch (err) {
          alert('خطأ في قراءة الملف: ' + err.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // ===== INIT =====
  render();
})();
