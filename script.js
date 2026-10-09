const STORAGE_KEY = "teacher-group-tracker-v1";

const DAYS = [
  { value: 1, short: "Пн", full: "Понеділок" },
  { value: 2, short: "Вт", full: "Вівторок" },
  { value: 3, short: "Ср", full: "Середа" },
  { value: 4, short: "Чт", full: "Четвер" },
  { value: 5, short: "Пт", full: "П'ятниця" },
  { value: 6, short: "Сб", full: "Субота" },
  { value: 0, short: "Нд", full: "Неділя" },
];

const LEVELS = {
  scratch_start: {
    title: "1. Scratch Start",
    topics: [
      "Знайомство зі Scratch та сценою",
      "Рух спрайта і перші команди",
      "Лінійний алгоритм",
      "Цикли: повторення дій",
      "Розгалуження: якщо / інакше",
      "Координати X та Y",
      "Образи та проста анімація",
      "Звуки й події",
      "Діалог персонажів",
      "Випадкові числа",
      "Змінні: рахунок і таймер",
      "Клони",
      "Олівець і малювання",
      "Колізії та умови перемоги",
      "Меню гри",
      "Фінальний Scratch-проєкт",
    ],
  },
  scratch_games: {
    title: "2. Scratch Games",
    topics: [
      "Ідея гри та правила",
      "Керування персонажем",
      "Перешкоди",
      "Рахунок",
      "Життя гравця",
      "Таймер",
      "Рівні складності",
      "Бонуси",
      "Вороги та рух",
      "Клони ворогів",
      "Стартове меню",
      "Екран програшу",
      "Екран перемоги",
      "Баланс гри",
      "Тестування",
      "Фінальна гра",
    ],
  },
  construct: {
    title: "3. Construct",
    topics: [
      "Інтерфейс Construct",
      "Спрайти та сцена",
      "Рух гравця",
      "Події та умови",
      "Платформи",
      "Колізії",
      "Очки",
      "Життя",
      "Вороги",
      "Бонуси",
      "Рівні",
      "Меню",
      "Звуки",
      "Ефекти",
      "Тестування гри",
      "Фінальний Construct-проєкт",
    ],
  },
  roblox_start: {
    title: "4. Roblox Start",
    topics: [
      "Знайомство з Roblox Studio",
      "Parts, Move, Scale, Rotate",
      "Anchor та фізика",
      "Матеріали й кольори",
      "Платформи та перешкоди",
      "Spawn і checkpoint",
      "Terrain",
      "Моделі",
      "Світло",
      "Прості пастки",
      "Інструменти Toolbox",
      "Організація сцени",
      "Командна робота з об'єктами",
      "Тестування рівня",
      "Покращення карти",
      "Фінальний Roblox-рівень",
    ],
  },
  roblox_lua: {
    title: "5. Roblox Lua",
    topics: [
      "Що таке скрипт",
      "Print та перші команди",
      "Змінні",
      "Властивості об'єктів",
      "Події",
      "If / else",
      "Функції",
      "GUI: кнопки й текст",
      "Таймер",
      "Здоров'я гравця",
      "Бонуси",
      "Двері та ключ",
      "NPC",
      "Магазин",
      "Мінігра",
      "Фінальний Lua-проєкт",
    ],
  },
  web: {
    title: "6. Web HTML/CSS/JS",
    topics: [
      "Як працює сайт",
      "HTML-структура",
      "Тексти, посилання, картинки",
      "CSS: кольори й шрифти",
      "Box model",
      "Flexbox",
      "Grid",
      "Адаптивність",
      "Кнопки та стани",
      "JavaScript: змінні",
      "Події",
      "DOM",
      "Форми",
      "localStorage",
      "Мініпроєкт",
      "Фінальний сайт",
    ],
  },
};

const app = document.querySelector("#app");
const groupDialog = document.querySelector("#groupDialog");
const groupForm = document.querySelector("#groupForm");
const groupDialogTitle = document.querySelector("#groupDialogTitle");
const courseDialog = document.querySelector("#courseDialog");
const courseForm = document.querySelector("#courseForm");
const courseDialogTitle = document.querySelector("#courseDialogTitle");
const ui = { search: "", dashboardView: "today" };

let state = loadState();

init();

function init() {
  renderLevelOptions();
  renderDayOptions();
  renderCourseLessonFields();
  render();

  window.addEventListener("hashchange", render);
  document.addEventListener("click", handleClick);
  document.addEventListener("change", handleChange);
  document.addEventListener("input", handleInput);
  groupForm.addEventListener("submit", handleGroupSubmit);
  courseForm.addEventListener("submit", handleCourseSubmit);
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { groups: [], students: [], courses: getDefaultCourses() };
    const parsed = JSON.parse(saved);
    return {
      groups: Array.isArray(parsed.groups) ? parsed.groups : [],
      students: Array.isArray(parsed.students) ? parsed.students : [],
      courses: normalizeCourses(parsed.courses),
    };
  } catch (error) {
    console.warn("Не вдалося прочитати localStorage:", error);
    return { groups: [], students: [], courses: getDefaultCourses() };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getDefaultCourses() {
  return Object.entries(LEVELS).map(([id, course]) => ({
    id,
    name: course.title,
    topics: [...course.topics],
    createdAt: new Date().toISOString(),
  }));
}

function normalizeCourses(courses) {
  const source = Array.isArray(courses) ? courses : getDefaultCourses();

  return source.map((course) => ({
    id: course.id || createId("course"),
    name: course.name || course.title || "Курс без назви",
    topics: normalizeCourseTopics(course.topics),
    createdAt: course.createdAt || new Date().toISOString(),
  }));
}

function normalizeCourseTopics(topics) {
  const safeTopics = Array.isArray(topics) ? topics : [];
  return Array.from({ length: 16 }, (_, index) => safeTopics[index] || `Урок ${index + 1}`);
}

function render() {
  const route = getRoute();

  if (route.page === "group") {
    renderGroupPage(route.id);
    return;
  }

  if (route.page === "student") {
    renderStudentPage(route.id);
    return;
  }

  renderDashboard();
}

function getRoute() {
  const [page, id] = location.hash.replace("#", "").split("/");
  return { page: page || "dashboard", id };
}

function renderDashboard() {
  const query = ui.search.trim().toLowerCase();
  const groups = state.groups.filter((group) => group.name.toLowerCase().includes(query));
  const courses = state.courses.filter((course) => course.name.toLowerCase().includes(query));
  const todayGroups = groups.filter((group) => group.active && isTodayGroup(group));
  const activeGroups = groups.filter((group) => group.active);
  const archivedGroups = groups.filter((group) => !group.active);
  const allTodayGroups = state.groups.filter((group) => group.active && isTodayGroup(group));
  const allActiveGroups = state.groups.filter((group) => group.active);
  const allArchivedGroups = state.groups.filter((group) => !group.active);

  app.innerHTML = `
    <div class="dashboard-layout">
      <aside class="dashboard-sidebar" aria-label="Розділи">
        ${renderSidebarButton("today", "Сьогоднішні групи", allTodayGroups.length)}
        ${renderSidebarButton("active", "Активні групи", allActiveGroups.length)}
        ${renderSidebarButton("archive", "Архів груп", allArchivedGroups.length)}
        ${renderSidebarButton("courses", "Курси", state.courses.length)}
      </aside>

      <section class="dashboard-main">
        <div class="toolbar">
          <input class="search-input" data-role="group-search" type="search" value="${escapeHtml(ui.search)}" placeholder="Пошук групи або курсу..." />
          <button class="ghost-btn" type="button" data-action="open-course-modal">+ Додати курс</button>
          <button class="primary-btn" type="button" data-action="open-group-modal">+ Додати групу</button>
        </div>

        ${renderDashboardPanel({ todayGroups, activeGroups, archivedGroups, courses })}
      </section>
    </div>
  `;
}

function renderSidebarButton(view, label, count) {
  const activeClass = ui.dashboardView === view ? "active" : "";

  return `
    <button class="sidebar-btn ${activeClass}" type="button" data-action="set-dashboard-view" data-view="${view}">
      <span>${label}</span>
      <strong>${count}</strong>
    </button>
  `;
}

function renderDashboardPanel({ todayGroups, activeGroups, archivedGroups, courses }) {
  if (ui.dashboardView === "active") {
    return renderGroupSection("Активні групи", activeGroups, "Активних груп поки немає.");
  }

  if (ui.dashboardView === "archive") {
    return renderGroupSection("Архів груп", archivedGroups, "Архів порожній.");
  }

  if (ui.dashboardView === "courses") {
    return renderCourseSection(courses);
  }

  return renderGroupSection("Сьогоднішні групи", todayGroups, "На сьогодні груп не знайдено.");
}

function renderCourseSection(courses = state.courses) {
  return `
    <section class="section">
      <div class="section-head">
        <div>
          <h2>Курси</h2>
          <p class="muted">Курс = назва + 16 уроків. Потім курс вибирається при створенні групи.</p>
        </div>
        <span class="tag">${courses.length}</span>
      </div>
      ${
        courses.length
          ? `<div class="grid">${courses.map(renderCourseCard).join("")}</div>`
          : `<div class="empty-state">Курсів поки немає. Додай курс, щоб створювати групи.</div>`
      }
    </section>
  `;
}

function renderCourseCard(course) {
  const usedCount = state.groups.filter((group) => group.level === course.id).length;

  return `
    <article class="course-card">
      <div>
        <h3 class="card-title">${escapeHtml(course.name)}</h3>
        <div class="tag-row">
          <span class="tag">16 уроків</span>
          <span class="tag ${usedCount ? "green" : ""}">Груп: ${usedCount}</span>
        </div>
      </div>
      <p class="muted">${escapeHtml(course.topics.slice(0, 3).join(" / "))}${course.topics.length > 3 ? "..." : ""}</p>
      <div class="card-actions">
        <button class="ghost-btn" type="button" data-action="edit-course" data-course-id="${course.id}">Редагувати</button>
        <button class="danger-btn" type="button" data-action="delete-course" data-course-id="${course.id}">Видалити</button>
      </div>
    </article>
  `;
}

function renderGroupSection(title, groups, emptyText) {
  return `
    <section class="section">
      <div class="section-head">
        <h2>${title}</h2>
        <span class="tag">${groups.length}</span>
      </div>
      ${
        groups.length
          ? `<div class="grid">${groups.map(renderGroupCard).join("")}</div>`
          : `<div class="empty-state">${emptyText}</div>`
      }
    </section>
  `;
}

function renderGroupCard(group) {
  const level = getCourseTitle(group.level);
  const schedule = formatSchedule(group.schedule);
  const stats = getGroupStats(group);

  return `
    <article class="group-card">
      <div class="card-top">
        <div>
          <h3 class="card-title">${escapeHtml(group.name)}</h3>
          <div class="tag-row">
            <span class="tag">${escapeHtml(level)}</span>
            <span class="tag green">${escapeHtml(schedule || "Графік не задано")}</span>
            ${group.active ? `<span class="tag green">Активна</span>` : `<span class="tag red">Архів</span>`}
          </div>
        </div>
      </div>
      <div class="tag-row">
        <span class="tag">Учнів: ${group.studentIds.length}</span>
        <span class="tag">Проведено: ${stats.heldLessons}</span>
        <span class="tag yellow">Пропуски: ${stats.totalMisses}</span>
      </div>
      <div class="card-actions">
        <button class="primary-btn" type="button" data-action="open-group" data-group-id="${group.id}">Відкрити</button>
        <button class="ghost-btn" type="button" data-action="edit-group" data-group-id="${group.id}">Редагувати</button>
        <button class="ghost-btn" type="button" data-action="toggle-group-active" data-group-id="${group.id}">
          ${group.active ? "В архів" : "Активувати"}
        </button>
      </div>
    </article>
  `;
}

function renderGroupPage(groupId) {
  const group = findGroup(groupId);
  if (!group) {
    app.innerHTML = renderNotFound("Групу не знайдено");
    return;
  }

  const level = getCourseTitle(group.level);
  const stats = getGroupStats(group);
  const availableStudents = state.students.filter((student) => !group.studentIds.includes(student.id));

  app.innerHTML = `
    <section class="group-page">
      <div class="group-page-head">
        <div>
          <button class="ghost-btn" type="button" data-action="go-dashboard">← На головну</button>
          <p class="eyebrow">група</p>
          <h2>${escapeHtml(group.name)}</h2>
          <div class="tag-row">
            <span class="tag">${escapeHtml(level)}</span>
            <span class="tag green">${escapeHtml(formatSchedule(group.schedule) || "Графік не задано")}</span>
            ${group.active ? `<span class="tag green">Активна</span>` : `<span class="tag red">Архів</span>`}
          </div>
        </div>
        <div class="inline-actions">
          <button class="ghost-btn" type="button" data-action="edit-group" data-group-id="${group.id}">Редагувати групу</button>
          <button class="ghost-btn" type="button" data-action="toggle-group-active" data-group-id="${group.id}">
            ${group.active ? "В архів" : "Активувати"}
          </button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card"><span class="stat-value">${stats.heldLessons}</span><span class="stat-label">проведених уроків</span></div>
        <div class="stat-card"><span class="stat-value">${group.studentIds.length}</span><span class="stat-label">учнів у групі зараз</span></div>
        <div class="stat-card"><span class="stat-value">${stats.totalMisses}</span><span class="stat-label">пропусків загалом</span></div>
        <div class="stat-card"><span class="stat-value">${stats.totalHomeworkMissing}</span><span class="stat-label">незданих домашок</span></div>
      </div>

      <section class="section panel">
        <div class="section-head">
          <div>
            <h2>Учні в групі</h2>
            <p class="muted">Учень може бути в кількох групах одночасно. Його картка лишається загальною.</p>
          </div>
        </div>
        ${renderAddStudentPanel(group, availableStudents)}
        ${renderCurrentStudents(group)}
      </section>

      <section class="section">
        <div class="section-head">
          <h2>Уроки</h2>
          <span class="tag">16 уроків</span>
        </div>
        <div class="lessons-list">
          ${group.lessons.map((lesson, index) => renderLesson(group, lesson, index)).join("")}
        </div>
      </section>

      <section class="section panel">
        <div class="section-head">
          <div>
            <h2>Статистика групи</h2>
            <p class="muted">Рахується тільки за уроками, де увімкнено “Урок проведено”.</p>
          </div>
        </div>
        ${renderGroupWarnings(group)}
        ${renderGroupStatsTable(group)}
      </section>
    </section>
  `;
}

function renderAddStudentPanel(group, availableStudents) {
  return `
    <div class="add-student-grid">
      <label class="field">
        <span>Додати існуючого учня</span>
        <select data-role="existing-student-select" data-group-id="${group.id}">
          <option value="">Обери учня</option>
          ${availableStudents.map((student) => `<option value="${student.id}">${escapeHtml(student.name)}</option>`).join("")}
        </select>
      </label>
      <button class="ghost-btn" type="button" data-action="add-existing-student" data-group-id="${group.id}">Додати</button>

      <label class="field">
        <span>Створити нового учня</span>
        <input data-role="new-student-name" data-group-id="${group.id}" type="text" placeholder="Ім'я учня" />
      </label>
      <button class="primary-btn" type="button" data-action="create-student" data-group-id="${group.id}">Створити</button>
    </div>
  `;
}

function renderCurrentStudents(group) {
  if (!group.studentIds.length) {
    return `<div class="empty-state" style="margin-top: 14px;">У цій групі ще немає учнів.</div>`;
  }

  return `
    <div class="student-list" style="margin-top: 14px;">
      ${group.studentIds
        .map((studentId) => findStudent(studentId))
        .filter(Boolean)
        .map(
          (student) => `
            <article class="student-card">
              <strong>${escapeHtml(student.name)}</strong>
              <div class="card-actions">
                <button class="ghost-btn" type="button" data-action="open-student" data-student-id="${student.id}">Картка</button>
                <button class="danger-btn" type="button" data-action="remove-student-from-group" data-group-id="${group.id}" data-student-id="${student.id}">Прибрати з групи</button>
              </div>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderLesson(group, lesson, index) {
  const open = index === getFirstOpenLessonIndex(group);

  return `
    <details class="lesson-card" ${open ? "open" : ""}>
      <summary>
        <span class="lesson-summary-title">Урок ${lesson.order}. ${escapeHtml(lesson.topic)}</span>
        <span class="lesson-summary-meta">
          <span class="tag">${lesson.date ? formatDate(lesson.date) : "Дата не задана"}</span>
          ${lesson.held ? `<span class="tag green">Проведено</span>` : `<span class="tag yellow">План</span>`}
        </span>
      </summary>

      <div class="lesson-body">
        <div class="lesson-editor">
          <label class="field">
            <span>Дата уроку</span>
            <input type="date" value="${escapeHtml(lesson.date || "")}" data-group-id="${group.id}" data-lesson-id="${lesson.id}" data-lesson-field="date" />
          </label>
          <label class="field">
            <span>Тема уроку</span>
            <input type="text" value="${escapeHtml(lesson.topic)}" data-group-id="${group.id}" data-lesson-id="${lesson.id}" data-lesson-field="topic" />
          </label>
          <label class="check-row">
            <input type="checkbox" ${lesson.held ? "checked" : ""} data-group-id="${group.id}" data-lesson-id="${lesson.id}" data-lesson-field="held" />
            <span>Урок проведено</span>
          </label>
        </div>

        ${
          group.studentIds.length
            ? renderLessonTable(group, lesson)
            : `<div class="empty-state">Додай учнів у групу, щоб відмічати присутність і домашки.</div>`
        }
      </div>
    </details>
  `;
}

function renderLessonTable(group, lesson) {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Учень</th>
            <th>Присутній</th>
            <th>ДЗ здано</th>
            <th>Екран</th>
            <th>Активність</th>
            <th>Поведінка</th>
            <th>Коментар</th>
          </tr>
        </thead>
        <tbody>
          ${group.studentIds
            .map((studentId) => {
              const student = findStudent(studentId);
              if (!student) return "";
              const record = getRecord(lesson, student.id);

              return `
                <tr>
                  <td>
                    <button class="student-link" type="button" data-action="open-student" data-student-id="${student.id}">
                      ${escapeHtml(student.name)}
                    </button>
                  </td>
                  <td><input type="checkbox" ${record.present ? "checked" : ""} data-group-id="${group.id}" data-lesson-id="${lesson.id}" data-student-id="${student.id}" data-record-field="present" /></td>
                  <td><input type="checkbox" ${record.homework ? "checked" : ""} data-group-id="${group.id}" data-lesson-id="${lesson.id}" data-student-id="${student.id}" data-record-field="homework" /></td>
                  <td><input type="checkbox" ${record.screen ? "checked" : ""} data-group-id="${group.id}" data-lesson-id="${lesson.id}" data-student-id="${student.id}" data-record-field="screen" /></td>
                  <td>
                    <select class="table-select" data-group-id="${group.id}" data-lesson-id="${lesson.id}" data-student-id="${student.id}" data-record-field="activity">
                      ${renderOptions(["", "Активний", "Середній", "Низький"], record.activity)}
                    </select>
                  </td>
                  <td>
                    <select class="table-select" data-group-id="${group.id}" data-lesson-id="${lesson.id}" data-student-id="${student.id}" data-record-field="behavior">
                      ${renderOptions(["", "Добра", "Нормальна", "Потребує уваги"], record.behavior)}
                    </select>
                  </td>
                  <td>
                    <input class="table-input" type="text" value="${escapeHtml(record.comment)}" placeholder="Коментар..." data-group-id="${group.id}" data-lesson-id="${lesson.id}" data-student-id="${student.id}" data-record-field="comment" />
                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderGroupWarnings(group) {
  const rows = getGroupStudentRows(group);
  const weakRows = rows.filter((row) => row.missed > 0 || row.homeworkMissing > 0 || row.screenOff > 0);

  if (!weakRows.length) {
    return `<div class="empty-state">Поки немає проблемних пунктів. Краса.</div>`;
  }

  return `
    <div class="warning-list">
      ${weakRows
        .map(
          (row) => `
            <div class="warning-item">
              <strong>${escapeHtml(row.name)}</strong>:
              пропуски — ${row.missed}, нездані ДЗ — ${row.homeworkMissing}, без екрана — ${row.screenOff}
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderGroupStatsTable(group) {
  const rows = getGroupStudentRows(group);

  if (!rows.length) return `<div class="empty-state">Ще немає статистики.</div>`;

  return `
    <div class="table-wrap" style="margin-top: 14px;">
      <table>
        <thead>
          <tr>
            <th>Учень</th>
            <th>Відвідав</th>
            <th>Пропустив</th>
            <th>ДЗ не здано</th>
            <th>Екран не вмикав</th>
            <th>Низька активність</th>
            <th>Поведінка</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  <td><button class="student-link" type="button" data-action="open-student" data-student-id="${row.id}">${escapeHtml(row.name)}</button></td>
                  <td>${row.attended}</td>
                  <td>${row.missed}</td>
                  <td>${row.homeworkMissing}</td>
                  <td>${row.screenOff}</td>
                  <td>${row.lowActivity}</td>
                  <td>${row.behaviorAttention}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderStudentPage(studentId) {
  const student = findStudent(studentId);
  if (!student) {
    app.innerHTML = renderNotFound("Учня не знайдено");
    return;
  }

  const stats = getStudentStats(student.id);

  app.innerHTML = `
    <section class="student-page">
      <div class="student-page-head">
        <div>
          <button class="ghost-btn" type="button" data-action="go-dashboard">← На головну</button>
          <p class="eyebrow">картка учня</p>
          <h2>${escapeHtml(student.name)}</h2>
          <p class="muted">Статистика з усіх груп, де учень зараз є або вже мав записи.</p>
        </div>
        <label class="field" style="min-width: 260px;">
          <span>Змінити ім'я</span>
          <input type="text" value="${escapeHtml(student.name)}" data-student-id="${student.id}" data-student-field="name" />
        </label>
      </div>

      <div class="stats-grid">
        <div class="stat-card"><span class="stat-value">${stats.heldLessons}</span><span class="stat-label">уроків у статистиці</span></div>
        <div class="stat-card"><span class="stat-value">${stats.attended}</span><span class="stat-label">відвідав</span></div>
        <div class="stat-card"><span class="stat-value">${stats.missed}</span><span class="stat-label">пропустив</span></div>
        <div class="stat-card"><span class="stat-value">${stats.homeworkMissing}</span><span class="stat-label">ДЗ не здано</span></div>
        <div class="stat-card"><span class="stat-value">${stats.screenOff}</span><span class="stat-label">без екрана</span></div>
        <div class="stat-card"><span class="stat-value">${stats.behaviorAttention}</span><span class="stat-label">поведінка потребувала уваги</span></div>
      </div>

      <section class="section panel">
        <div class="section-head">
          <h2>Групи учня</h2>
        </div>
        ${
          stats.groups.length
            ? `<div class="tag-row">${stats.groups.map((group) => `<button class="ghost-btn" type="button" data-action="open-group" data-group-id="${group.id}">${escapeHtml(group.name)}</button>`).join("")}</div>`
            : `<div class="empty-state">Поки немає прив'язки до груп або записів.</div>`
        }
      </section>

      <section class="section">
        <div class="section-head">
          <h2>Історія уроків</h2>
          <span class="tag">${stats.entries.length}</span>
        </div>
        ${
          stats.entries.length
            ? `<div class="student-timeline">${stats.entries.map(renderStudentTimelineItem).join("")}</div>`
            : `<div class="empty-state">Ще немає уроків у статистиці.</div>`
        }
      </section>
    </section>
  `;
}

function renderStudentTimelineItem(entry) {
  return `
    <article class="timeline-item">
      <div>
        <strong>${entry.date ? formatDate(entry.date) : "Без дати"}</strong>
        <p class="muted">${escapeHtml(entry.groupName)}</p>
      </div>
      <div>
        <strong>Урок ${entry.order}: ${escapeHtml(entry.topic)}</strong>
        <div class="tag-row" style="margin-top: 8px;">
          <span class="tag ${entry.record.present ? "green" : "red"}">${entry.record.present ? "Був/була" : "Пропуск"}</span>
          <span class="tag ${entry.record.homework ? "green" : "yellow"}">${entry.record.homework ? "ДЗ здано" : "ДЗ не здано"}</span>
          <span class="tag ${entry.record.screen ? "green" : "yellow"}">${entry.record.screen ? "Екран був" : "Без екрана"}</span>
          ${entry.record.activity ? `<span class="tag">${escapeHtml(entry.record.activity)}</span>` : ""}
          ${entry.record.behavior ? `<span class="tag">${escapeHtml(entry.record.behavior)}</span>` : ""}
        </div>
        ${entry.record.comment ? `<p style="margin: 10px 0 0;">${escapeHtml(entry.record.comment)}</p>` : ""}
      </div>
    </article>
  `;
}

function renderNotFound(message) {
  return `
    <div class="empty-state">
      <h2>${escapeHtml(message)}</h2>
      <button class="primary-btn" type="button" data-action="go-dashboard">На головну</button>
    </div>
  `;
}

function handleClick(event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;

  const { action, groupId, studentId, courseId, view } = target.dataset;

  if (action === "open-group-modal") openGroupModal();
  if (action === "close-group-modal") closeGroupModal();
  if (action === "open-course-modal") openCourseModal();
  if (action === "close-course-modal") closeCourseModal();
  if (action === "edit-course") openCourseModal(courseId);
  if (action === "delete-course") deleteCourse(courseId);
  if (action === "set-dashboard-view") setDashboardView(view);
  if (action === "open-group") location.hash = `group/${groupId}`;
  if (action === "open-student") location.hash = `student/${studentId}`;
  if (action === "go-dashboard") location.hash = "";
  if (action === "edit-group") openGroupModal(groupId);
  if (action === "toggle-group-active") toggleGroupActive(groupId);
  if (action === "add-existing-student") addExistingStudent(groupId);
  if (action === "create-student") createStudent(groupId);
  if (action === "remove-student-from-group") removeStudentFromGroup(groupId, studentId);
}

function setDashboardView(view) {
  ui.dashboardView = view || "today";
  renderDashboard();
}

function handleChange(event) {
  const target = event.target;

  if (target.dataset.lessonField) {
    updateLessonField(target);
  }

  if (target.dataset.recordField) {
    updateRecordField(target);
  }
}

function handleInput(event) {
  const target = event.target;

  if (target.dataset.role === "group-search") {
    ui.search = target.value;
    renderDashboard();
    const searchInput = document.querySelector('[data-role="group-search"]');
    searchInput?.focus();
    searchInput?.setSelectionRange(ui.search.length, ui.search.length);
    return;
  }

  if (target.dataset.recordField) {
    updateRecordField(target);
  }

  if (target.dataset.studentField === "name") {
    const student = findStudent(target.dataset.studentId);
    if (!student) return;
    student.name = target.value.trim() || "Без імені";
    saveState();
  }
}

function handleGroupSubmit(event) {
  event.preventDefault();

  const id = document.querySelector("#groupId").value;
  const name = document.querySelector("#groupName").value.trim();
  const level = document.querySelector("#groupLevel").value;
  const active = document.querySelector("#groupActive").checked;
  const schedule = {
    days: [...document.querySelectorAll('[name="scheduleDay"]:checked')].map((input) => Number(input.value)),
    time: document.querySelector("#groupTime").value,
  };

  if (!name) return;
  if (!level) {
    alert("Спочатку додай курс, а потім створюй групу.");
    return;
  }

  if (id) {
    const group = findGroup(id);
    if (!group) return;
    group.name = name;
    group.level = level;
    group.active = active;
    group.schedule = schedule;
  } else {
    state.groups.push({
      id: createId("group"),
      name,
      level,
      active,
      schedule,
      studentIds: [],
      studentJoin: {},
      lessons: buildLessons(level, schedule),
      createdAt: new Date().toISOString(),
    });
  }

  saveState();
  closeGroupModal();
  render();
}

function handleCourseSubmit(event) {
  event.preventDefault();

  const id = document.querySelector("#courseId").value;
  const name = document.querySelector("#courseName").value.trim();
  const topics = [...document.querySelectorAll("[data-course-lesson]")]
    .map((input, index) => input.value.trim() || `Урок ${index + 1}`)
    .slice(0, 16);

  if (!name) return;

  if (id) {
    const course = findCourse(id);
    if (!course) return;
    course.name = name;
    course.topics = normalizeCourseTopics(topics);
  } else {
    state.courses.push({
      id: createId("course"),
      name,
      topics: normalizeCourseTopics(topics),
      createdAt: new Date().toISOString(),
    });
  }

  saveState();
  renderLevelOptions();
  closeCourseModal();
  render();
}

function openGroupModal(groupId) {
  const group = groupId ? findGroup(groupId) : null;

  groupDialogTitle.textContent = group ? "Редагувати групу" : "Нова група";
  document.querySelector("#groupId").value = group?.id || "";
  document.querySelector("#groupName").value = group?.name || "";
  document.querySelector("#groupLevel").value = group?.level || state.courses[0]?.id || "";
  document.querySelector("#groupTime").value = group?.schedule?.time || "18:00";
  document.querySelector("#groupActive").checked = group?.active ?? true;

  const selectedDays = new Set(group?.schedule?.days || [1]);
  document.querySelectorAll('[name="scheduleDay"]').forEach((input) => {
    input.checked = selectedDays.has(Number(input.value));
  });

  groupDialog.showModal();
}

function openCourseModal(courseId) {
  const course = courseId ? findCourse(courseId) : null;

  courseDialogTitle.textContent = course ? "Редагувати курс" : "Новий курс";
  document.querySelector("#courseId").value = course?.id || "";
  document.querySelector("#courseName").value = course?.name || "";
  renderCourseLessonFields(course?.topics);
  courseDialog.showModal();
}

function closeGroupModal() {
  groupDialog.close();
  groupForm.reset();
}

function closeCourseModal() {
  courseDialog.close();
  courseForm.reset();
  renderCourseLessonFields();
}

function deleteCourse(courseId) {
  const course = findCourse(courseId);
  if (!course) return;

  const usedCount = state.groups.filter((group) => group.level === courseId).length;
  if (usedCount > 0) {
    alert("Цей курс вже використовується в групах. Спочатку зміни курс у цих групах або залиш його, щоб не втратити зв'язок.");
    return;
  }

  if (!confirm(`Видалити курс "${course.name}"?`)) return;

  state.courses = state.courses.filter((item) => item.id !== courseId);
  saveState();
  renderLevelOptions();
  render();
}

function toggleGroupActive(groupId) {
  const group = findGroup(groupId);
  if (!group) return;
  group.active = !group.active;
  saveState();
  render();
}

function addExistingStudent(groupId) {
  const group = findGroup(groupId);
  const select = document.querySelector(`[data-role="existing-student-select"][data-group-id="${groupId}"]`);
  const studentId = select?.value;
  if (!group || !studentId || group.studentIds.includes(studentId)) return;

  group.studentJoin ||= {};
  group.studentJoin[studentId] = getNextLessonOrder(group);
  group.studentIds.push(studentId);
  saveState();
  render();
}

function createStudent(groupId) {
  const group = findGroup(groupId);
  const input = document.querySelector(`[data-role="new-student-name"][data-group-id="${groupId}"]`);
  const name = input?.value.trim();
  if (!group || !name) return;

  const student = {
    id: createId("student"),
    name,
    createdAt: new Date().toISOString(),
  };

  state.students.push(student);
  group.studentJoin ||= {};
  group.studentJoin[student.id] = getNextLessonOrder(group);
  group.studentIds.push(student.id);
  saveState();
  render();
}

function removeStudentFromGroup(groupId, studentId) {
  const group = findGroup(groupId);
  if (!group) return;

  group.studentIds = group.studentIds.filter((id) => id !== studentId);
  saveState();
  render();
}

function updateLessonField(target) {
  const group = findGroup(target.dataset.groupId);
  const lesson = findLesson(group, target.dataset.lessonId);
  if (!lesson) return;

  const field = target.dataset.lessonField;
  lesson[field] = target.type === "checkbox" ? target.checked : target.value;
  saveState();

  if (field !== "topic") render();
}

function updateRecordField(target) {
  const group = findGroup(target.dataset.groupId);
  const lesson = findLesson(group, target.dataset.lessonId);
  if (!lesson) return;

  const record = ensureRecord(lesson, target.dataset.studentId);
  const field = target.dataset.recordField;
  record[field] = target.type === "checkbox" ? target.checked : target.value;
  saveState();
}

function getRecord(lesson, studentId) {
  return lesson.records?.[studentId] || emptyRecord();
}

function ensureRecord(lesson, studentId) {
  lesson.records ||= {};
  lesson.records[studentId] ||= emptyRecord();
  return lesson.records[studentId];
}

function emptyRecord() {
  return {
    present: false,
    homework: false,
    screen: false,
    activity: "",
    behavior: "",
    comment: "",
  };
}

function buildLessons(level, schedule) {
  const topics = getCourseTopics(level);
  const dates = generateLessonDates(schedule.days, topics.length);

  return topics.map((topic, index) => ({
    id: createId("lesson"),
    order: index + 1,
    topic,
    date: dates[index] || "",
    held: false,
    records: {},
  }));
}

function generateLessonDates(days, count) {
  if (!days?.length) return [];

  const normalizedDays = new Set(days.map(Number));
  const dates = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  let guard = 0;
  while (dates.length < count && guard < 240) {
    if (normalizedDays.has(cursor.getDay())) {
      dates.push(toDateInputValue(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
    guard += 1;
  }

  return dates;
}

function isTodayGroup(group) {
  const today = new Date();
  const todayIso = toDateInputValue(today);
  const hasScheduleToday = group.schedule?.days?.includes(today.getDay());
  const hasLessonToday = group.lessons?.some((lesson) => lesson.date === todayIso && !lesson.held);
  return hasScheduleToday || hasLessonToday;
}

function getFirstOpenLessonIndex(group) {
  const nextIndex = group.lessons.findIndex((lesson) => !lesson.held);
  return nextIndex === -1 ? group.lessons.length - 1 : nextIndex;
}

function getGroupStats(group) {
  const rows = getGroupStudentRows(group);
  return {
    heldLessons: group.lessons.filter((lesson) => lesson.held).length,
    totalMisses: rows.reduce((sum, row) => sum + row.missed, 0),
    totalHomeworkMissing: rows.reduce((sum, row) => sum + row.homeworkMissing, 0),
  };
}

function getGroupStudentRows(group) {
  const studentIds = new Set(group.studentIds);
  group.lessons.forEach((lesson) => {
    Object.keys(lesson.records || {}).forEach((studentId) => studentIds.add(studentId));
  });

  return [...studentIds]
    .map((studentId) => {
      const student = findStudent(studentId);
      if (!student) return null;

      const row = {
        id: student.id,
        name: student.name,
        attended: 0,
        missed: 0,
        homeworkMissing: 0,
        screenOff: 0,
        lowActivity: 0,
        behaviorAttention: 0,
      };

      group.lessons
        .filter((lesson) => lesson.held)
        .forEach((lesson) => {
          if (!shouldCountStudentLesson(group, lesson, student.id)) return;

          const record = getRecord(lesson, student.id);
          if (record.present) row.attended += 1;
          else row.missed += 1;

          if (!record.homework) row.homeworkMissing += 1;
          if (!record.screen) row.screenOff += 1;
          if (record.activity === "Низький") row.lowActivity += 1;
          if (record.behavior === "Потребує уваги") row.behaviorAttention += 1;
        });

      return row;
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name, "uk"));
}

function getStudentStats(studentId) {
  const groups = [];
  const entries = [];
  const stats = {
    heldLessons: 0,
    attended: 0,
    missed: 0,
    homeworkMissing: 0,
    screenOff: 0,
    behaviorAttention: 0,
    groups,
    entries,
  };

  state.groups.forEach((group) => {
    const hasGroupRecords = group.lessons.some((lesson) => lesson.records?.[studentId]);
    if (group.studentIds.includes(studentId) || hasGroupRecords) {
      groups.push(group);
    }

    group.lessons
      .filter((lesson) => lesson.held)
      .forEach((lesson) => {
        if (!shouldCountStudentLesson(group, lesson, studentId)) return;

        const record = getRecord(lesson, studentId);
        stats.heldLessons += 1;
        if (record.present) stats.attended += 1;
        else stats.missed += 1;
        if (!record.homework) stats.homeworkMissing += 1;
        if (!record.screen) stats.screenOff += 1;
        if (record.behavior === "Потребує уваги") stats.behaviorAttention += 1;

        entries.push({
          groupId: group.id,
          groupName: group.name,
          order: lesson.order,
          topic: lesson.topic,
          date: lesson.date,
          record,
        });
      });
  });

  entries.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return stats;
}

function shouldCountStudentLesson(group, lesson, studentId) {
  if (lesson.records?.[studentId]) return true;
  if (!group.studentIds.includes(studentId)) return false;
  return lesson.order >= getStudentJoinOrder(group, studentId);
}

function getStudentJoinOrder(group, studentId) {
  return group.studentJoin?.[studentId] || 1;
}

function getNextLessonOrder(group) {
  const nextLesson = group.lessons.find((lesson) => !lesson.held);
  return nextLesson?.order || group.lessons.length + 1;
}

function renderLevelOptions() {
  const select = document.querySelector("#groupLevel");
  select.innerHTML = state.courses
    .map((course) => `<option value="${course.id}">${escapeHtml(course.name)}</option>`)
    .join("");
}

function renderCourseLessonFields(topics = []) {
  const container = document.querySelector("#courseLessons");
  if (!container) return;

  const safeTopics = normalizeCourseTopics(topics);
  container.innerHTML = safeTopics
    .map(
      (topic, index) => `
        <label class="lesson-name-field">
          <span>Урок ${index + 1}</span>
          <input type="text" data-course-lesson="${index}" value="${escapeHtml(topic)}" placeholder="Назва уроку ${index + 1}" />
        </label>
      `
    )
    .join("");
}

function renderDayOptions() {
  const container = document.querySelector("#scheduleDays");
  container.innerHTML = DAYS.map(
    (day) => `
      <label class="day-pill" title="${escapeHtml(day.full)}">
        <input type="checkbox" name="scheduleDay" value="${day.value}" />
        <span>${day.short}</span>
      </label>
    `
  ).join("");
}

function renderOptions(options, selected) {
  return options
    .map((option) => {
      const label = option || "Не вказано";
      return `<option value="${escapeHtml(option)}" ${option === selected ? "selected" : ""}>${escapeHtml(label)}</option>`;
    })
    .join("");
}

function findGroup(groupId) {
  return state.groups.find((group) => group.id === groupId);
}

function findCourse(courseId) {
  return state.courses.find((course) => course.id === courseId);
}

function getCourseTitle(courseId) {
  return findCourse(courseId)?.name || LEVELS[courseId]?.title || "Курс видалено";
}

function getCourseTopics(courseId) {
  return normalizeCourseTopics(findCourse(courseId)?.topics || LEVELS[courseId]?.topics);
}

function findLesson(group, lessonId) {
  return group?.lessons.find((lesson) => lesson.id === lessonId);
}

function findStudent(studentId) {
  return state.students.find((student) => student.id === studentId);
}

function formatSchedule(schedule) {
  if (!schedule?.days?.length) return "";
  const days = schedule.days
    .map((dayValue) => DAYS.find((day) => day.value === Number(dayValue))?.short)
    .filter(Boolean)
    .join(", ");
  return `${days}${schedule.time ? ` о ${schedule.time}` : ""}`;
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createId(prefix) {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
