const STORAGE_KEY = 'career-canvas-v1';
const state = { active: 'resume', resume: {}, career: {}, companies: [] };

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const display = (value, fallback = '未入力') => value ? escapeHtml(value) : `<span class="empty-copy">${fallback}</span>`;
const today = () => new Date().toISOString().slice(0, 10);
const dateJa = value => {
  if (!value) return '';
  const [y, m, d] = value.split('-');
  return `${y}年${Number(m)}月${Number(d)}日`;
};

function parseRows(value) {
  return (value || '').split('\n').filter(Boolean).map(line => {
    const [date, ...content] = line.split(/[｜|]/);
    return [date.trim(), content.join('｜').trim() || ''];
  });
}

function historyRows(title, value) {
  const rows = parseRows(value);
  return `<tr class="history-title"><td colspan="2">${title}</td></tr>${rows.length
    ? rows.map(([date, text]) => `<tr><th>${escapeHtml(date)}</th><td>${escapeHtml(text)}</td></tr>`).join('')
    : '<tr><th></th><td class="empty-copy">入力するとここに表示されます</td></tr>'}`;
}

function renderResume() {
  const d = state.resume;
  $('#resumePreview').innerHTML = `
    <h1>履 歴 書</h1>
    <div class="doc-meta">${dateJa(today())} 現在</div>
    <dl class="profile-grid">
      <dt>ふりがな</dt><dd>${display(d.kana)}</dd>
      <dt>氏名</dt><dd style="font-size:15pt">${display(d.name)}</dd>
      <dt>生年月日</dt><dd>${display(dateJa(d.birthday))}${d.gender ? `　（${escapeHtml(d.gender)}）` : ''}</dd>
      <dt>住所</dt><dd>${display(d.address)}</dd>
      <dt>連絡先</dt><dd>${display([d.phone, d.email].filter(Boolean).join(' ／ '))}</dd>
    </dl>
    <h2>学歴・職歴</h2>
    <table class="history-table">${historyRows('学歴', d.education)}${historyRows('職歴', d.workHistory)}</table>
    <h2>免許・資格</h2>
    <table class="history-table">${parseRows(d.licenses).length ? parseRows(d.licenses).map(([date, text]) => `<tr><th>${escapeHtml(date)}</th><td>${escapeHtml(text)}</td></tr>`).join('') : '<tr><th></th><td class="empty-copy">入力するとここに表示されます</td></tr>'}</table>
    <h2>志望動機</h2><p class="text-box">${display(d.motivation, '志望動機を入力してください')}</p>
    <h2>本人希望記入欄</h2><p class="text-box">${display(d.requests, '貴社規定に従います。')}</p>`;
}

function renderCareer() {
  const d = state.career;
  const companies = state.companies.map(c => `
    <section class="career-company">
      <header><strong>${display(c.company, '会社名')}</strong><span>${display(c.period, '在籍期間')}</span></header>
      <p class="business">${display(c.business, '事業内容・規模')}</p>
      <p class="details">${display(c.details, '担当業務・実績を入力してください')}</p>
    </section>`).join('');
  $('#careerPreview').innerHTML = `
    <h1>職 務 経 歴 書</h1>
    <div class="doc-meta">${display(dateJa(d.createdAt || today()), '作成日')}<br>${display(d.careerName, '氏名')}</div>
    <section class="career-section"><h2>職務要約</h2><p>${display(d.summary, 'これまでの職務経験を簡潔に入力してください')}</p></section>
    <section class="career-section"><h2>職務経歴</h2>${companies || '<p class="empty-copy">職歴を追加してください</p>'}</section>
    <section class="career-section"><h2>活かせる経験・知識・スキル</h2><p>${display(d.skills, '経験やスキルを入力してください')}</p></section>
    <section class="career-section"><h2>自己PR</h2><p>${display(d.selfPr, '自己PRを入力してください')}</p></section>`;
}

function readForms() {
  state.resume = Object.fromEntries(new FormData($('#resumeForm')));
  state.career = Object.fromEntries(new FormData($('#careerForm')));
  state.companies = $$('.company-card').map(card => Object.fromEntries($$('[data-company]', card).map(el => [el.dataset.company, el.value])));
}

let saveTimer;
function update() {
  readForms();
  renderResume();
  renderCareer();
  clearTimeout(saveTimer);
  $('#saveStatus').textContent = '保存中…';
  $('#saveStatus').classList.remove('saved');
  saveTimer = setTimeout(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    $('#saveStatus').textContent = 'この端末に保存しました';
    $('#saveStatus').classList.add('saved');
  }, 350);
}

function addCompany(data = {}) {
  const node = $('#companyTemplate').content.cloneNode(true);
  const card = $('.company-card', node);
  $$('[data-company]', card).forEach(el => { el.value = data[el.dataset.company] || ''; });
  $('.remove-company', card).addEventListener('click', () => { card.remove(); update(); });
  card.addEventListener('input', update);
  $('#companies').append(node);
}

function fillForm(form, data) {
  Object.entries(data || {}).forEach(([name, value]) => {
    const field = form.elements.namedItem(name);
    if (field) field.value = value;
  });
}

function switchDocument(documentName) {
  state.active = documentName;
  $$('.doc-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.document === documentName));
  $('#resumeForm').classList.toggle('hidden', documentName !== 'resume');
  $('#careerForm').classList.toggle('hidden', documentName !== 'career');
  $('#resumePreview').classList.toggle('hidden', documentName !== 'resume');
  $('#careerPreview').classList.toggle('hidden', documentName !== 'career');
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function applyState(data) {
  fillForm($('#resumeForm'), data.resume);
  fillForm($('#careerForm'), data.career);
  $('#companies').innerHTML = '';
  (data.companies?.length ? data.companies : [{}]).forEach(addCompany);
  switchDocument(data.active || 'resume');
  update();
}

const sample = {
  active: 'resume',
  resume: {
    name: '山田 太郎', kana: 'やまだ たろう', birthday: '1995-04-12', gender: '',
    address: '〒100-0001 東京都千代田区千代田1-1', phone: '090-1234-5678', email: 'taro.yamada@example.com',
    education: '2014年4月｜東京都立〇〇高等学校 入学\n2017年3月｜東京都立〇〇高等学校 卒業\n2017年4月｜〇〇大学 経済学部 入学\n2021年3月｜〇〇大学 経済学部 卒業',
    workHistory: '2021年4月｜株式会社みらい製作所 入社\n2021年4月｜生産管理部に配属\n2024年6月｜業務改善プロジェクトのリーダーを担当\n現在に至る',
    licenses: '2018年8月｜普通自動車第一種運転免許 取得\n2023年11月｜日商簿記検定2級 合格',
    motivation: '製造現場と管理部門の橋渡し役として業務改善に取り組んだ経験を活かし、貴社の生産性向上に貢献したいと考え志望いたしました。',
    requests: '貴社規定に従います。'
  },
  career: {
    careerName: '山田 太郎', createdAt: today(),
    summary: '製造業の生産管理として5年間、工程管理、在庫最適化、業務改善に従事してきました。現場への丁寧なヒアリングとデータ分析を組み合わせ、部門横断の改善プロジェクトを推進してきました。',
    skills: '・生産計画の立案、進捗管理（5年）\n・Excelを用いたデータ集計、分析\n・部門横断プロジェクトの進行管理\n・業務マニュアルの作成、社内研修',
    selfPr: '私の強みは、現場の声を具体的な改善につなげる実行力です。課題を数値と対話の両面から整理し、関係者が納得して動ける形に落とし込むことを大切にしています。'
  },
  companies: [{ company: '株式会社みらい製作所', period: '2021年4月〜現在', business: '産業機械部品の製造／従業員250名', details: '【担当業務】\n・月次生産計画の立案と進捗管理\n・在庫数、納期の管理\n・業務改善プロジェクトの推進\n\n【実績】\n・集計業務を自動化し、月20時間の作業を削減\n・仕掛在庫を前年比15％削減' }]
};

$$('.doc-tab').forEach(tab => tab.addEventListener('click', () => switchDocument(tab.dataset.document)));
$('#resumeForm').addEventListener('input', update);
$('#careerForm').addEventListener('input', update);
$('#addCompanyBtn').addEventListener('click', () => { addCompany(); update(); });
$('#printBtn').addEventListener('click', () => window.print());
$('#sampleBtn').addEventListener('click', () => applyState(sample));
$('#clearBtn').addEventListener('click', () => {
  if (confirm('入力内容をすべて消去しますか？')) {
    localStorage.removeItem(STORAGE_KEY);
    $('#resumeForm').reset(); $('#careerForm').reset();
    applyState({ active: 'resume', resume: {}, career: { createdAt: today() }, companies: [{}] });
  }
});

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  applyState(saved || { active: 'resume', resume: {}, career: { createdAt: today() }, companies: [{}] });
} catch {
  applyState({ active: 'resume', resume: {}, career: { createdAt: today() }, companies: [{}] });
}
