/**
 * 中华传统历法 · 纯原生 JavaScript 应用控制层
 * 100% 纯原生 DOM 操作，零框架依赖，无后端，无数据库。
 * 完全自适应屏幕，杜绝任何页面溢出。
 */

import {
  solarToLunar,
  lunarToSolar,
  getSolarDaysInMonth,
  getYearGanZhi,
  getHourGanZhi,
  getYearSolarTerms,
  getSunApparentLongitude,
  getMoonApparentLongitude,
  gregorianToJulianDay,
  LUNAR_MONTH_NAMES,
  LUNAR_DAY_NAMES,
  getLeapMonthFromTable
} from './calendarCore.js';
import { ICONS } from './icons.js';

// 应用全局状态
const state = {
  currentTab: 'calendar',
  currentDate: new Date(),
  viewYear: new Date().getFullYear(),
  viewMonth: new Date().getMonth() + 1,
  selectedShichen: 12,
  isDark: false,

  // 公农互转子状态
  converterMode: 'solar2lunar',
  sYear: new Date().getFullYear(),
  sMonth: new Date().getMonth() + 1,
  sDay: new Date().getDate(),
  lYear: new Date().getFullYear(),
  lMonth: 1,
  lDay: 1,
  lIsLeap: false,
  festYear: new Date().getFullYear(),

  // 节气物候子状态
  stYear: new Date().getFullYear(),
  selectedTermIdx: 2, // 默认立春

  // 历法科学模拟器子状态
  simYear: new Date().getFullYear(),
  simMonth: new Date().getMonth() + 1,
  simDay: new Date().getDate()
};

// 应用主题状态并更新 DOM
function applyTheme(isDark) {
  state.isDark = isDark;
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  updateThemeIcon();
}

// 初始化主题（根据设备系统切换，也可手动切换并记忆）
function initTheme() {
  const mediaQuery = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  const saved = localStorage.getItem('chinacal_theme');

  if (saved === 'dark') {
    applyTheme(true);
  } else if (saved === 'light') {
    applyTheme(false);
  } else {
    // 默认直接跟随设备操作系统
    applyTheme(Boolean(mediaQuery && mediaQuery.matches));
  }

  // 监听设备系统深浅主题切换事件，实现随系统自动切换
  if (mediaQuery && mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', (e) => {
      // 当系统切换时，若用户没有强制锁定或跟随系统，则实时响应切换
      const userSaved = localStorage.getItem('chinacal_theme_manual');
      if (!userSaved) {
        applyTheme(e.matches);
      }
    });
  }
}

// 用户手动切换主题
function toggleTheme() {
  const nextTheme = !state.isDark;
  applyTheme(nextTheme);
  localStorage.setItem('chinacal_theme', nextTheme ? 'dark' : 'light');
  localStorage.setItem('chinacal_theme_manual', 'true');
}

function updateThemeIcon() {
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.innerHTML = state.isDark
      ? `<span class="text-[#E5A93C] flex items-center">${ICONS.sun}</span>`
      : `<span class="text-[#7A6E5F] flex items-center">${ICONS.moon}</span>`;
  }
}

// 切换顶层选项卡
function setTab(tabId) {
  state.currentTab = tabId;
  document.querySelectorAll('.tab-content').forEach((el) => {
    el.classList.add('hidden');
  });
  const activeView = document.getElementById(`view-${tabId}`);
  if (activeView) activeView.classList.remove('hidden');

  // 更新桌面端与移动端导航样式
  document.querySelectorAll('.nav-tab-btn').forEach((btn) => {
    const isTarget = btn.getAttribute('data-tab') === tabId;
    if (isTarget) {
      btn.classList.add('text-[#9B1B1B]', 'dark:text-[#E05353]', 'font-bold');
      btn.classList.remove('text-[#655E53]', 'dark:text-[#A89F91]');
    } else {
      btn.classList.remove('text-[#9B1B1B]', 'dark:text-[#E05353]', 'font-bold');
      btn.classList.add('text-[#655E53]', 'dark:text-[#A89F91]');
    }
  });

  // 渲染对应视图
  if (tabId === 'calendar') renderCalendar();
  if (tabId === 'almanac') renderAlmanac();
  if (tabId === 'converter') renderConverter();
  if (tabId === 'solarterms') renderSolarTerms();
  if (tabId === 'science') renderScience();
}

// ==================== 1. 主历视图渲染 ====================
function renderCalendar() {
  const container = document.getElementById('view-calendar');
  if (!container) return;

  const yInfo = getYearGanZhi(state.viewYear);
  const daysInMonth = getSolarDaysInMonth(state.viewYear, state.viewMonth);
  const firstDayOfWeek = new Date(state.viewYear, state.viewMonth - 1, 1).getDay();

  const prevM = state.viewMonth === 1 ? 12 : state.viewMonth - 1;
  const prevY = state.viewMonth === 1 ? state.viewYear - 1 : state.viewYear;
  const daysInPrevMonth = getSolarDaysInMonth(prevY, prevM);

  const cells = [];
  // 上月天
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    cells.push({ y: prevY, m: prevM, d, isCurrent: false });
  }
  // 当月天
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ y: state.viewYear, m: state.viewMonth, d, isCurrent: true });
  }
  // 下月天补足35或42格
  const total = cells.length > 35 ? 42 : 35;
  const remaining = total - cells.length;
  const nextM = state.viewMonth === 12 ? 1 : state.viewMonth + 1;
  const nextY = state.viewMonth === 12 ? state.viewYear + 1 : state.viewYear;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ y: nextY, m: nextM, d, isCurrent: false });
  }

  // 当前选定日期详情
  const selLunar = solarToLunar(state.currentDate.getFullYear(), state.currentDate.getMonth() + 1, state.currentDate.getDate());
  const selHourGz = getHourGanZhi(selLunar.dayGanZhi[0], state.selectedShichen);

  // 组装 HTML
  let html = `
    <div class="space-y-4 sm:space-y-6 w-full max-w-full">
      <!-- 顶部控制栏：左侧年柱生肖，中侧年月日统一数字输入，右侧精简世纪跃迁(-100,本月,+100) -->
      <div class="bg-[#FAF7F0] dark:bg-[#1A1715] p-3 sm:p-4 rounded-xl border border-[#E3DCD0] dark:border-[#2D2824] shadow-2xs">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <!-- 左右切换<>已去除，替换为年柱生肖，随后是统一的数字选择 -->
          <div class="flex flex-wrap items-center gap-2 sm:gap-3">
            <span class="text-base sm:text-lg font-bold text-[#9B1B1B] dark:text-[#E25353] whitespace-nowrap">
              ${yInfo.ganZhi}年【${yInfo.zodiac}年】
            </span>

            <!-- 年月数字选择：数字显示在框内，年和月显示在外面 -->
            <div class="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#4F483D] dark:text-[#C5BDB0]">
              <input id="cal-year-select-input" type="number" min="1600" max="3500" value="${state.viewYear}" class="w-18 sm:w-20 px-2 py-1 text-center bg-white dark:bg-[#13110F] border border-[#D0C6B4] dark:border-[#3A332B] rounded-lg text-sm sm:text-base font-bold text-[#24211D] dark:text-[#EDE8DE] focus:outline-none focus:ring-1 focus:ring-[#9B1B1B]" title="修改年份" />
              <span>年</span>
              <select id="cal-month-select" class="px-2 py-1 bg-white dark:bg-[#13110F] border border-[#D0C6B4] dark:border-[#3A332B] rounded-lg text-sm sm:text-base font-bold text-[#24211D] dark:text-[#EDE8DE] focus:outline-none focus:ring-1 focus:ring-[#9B1B1B]" title="选择月份">
                ${Array.from({ length: 12 }, (_, i) => i + 1).map(m => `<option value="${m}" ${state.viewMonth === m ? 'selected' : ''}>${m}</option>`).join('')}
              </select>
              <span>月</span>
            </div>
          </div>

          <!-- 世纪跃迁快捷测试 (已去除10年，仅保留-100年、本月、+100年) -->
          <div class="flex flex-wrap items-center gap-1.5 text-xs">
            <span class="text-[#807668] dark:text-[#9A9082] shrink-0">世纪跃迁：</span>
            <button class="cal-jump-btn px-2.5 py-1 rounded bg-[#EFE9DC] dark:bg-[#24201C] hover:bg-[#E2DAC9] text-[#524B40] dark:text-[#C5BDB0] border border-[#D5CCBC] dark:border-[#352F28] cursor-pointer" data-delta="-100">-100年</button>
            <button id="cal-jump-today" class="px-3 py-1 rounded bg-[#9B1B1B] text-white hover:bg-[#801414] font-medium cursor-pointer">本月</button>
            <button class="cal-jump-btn px-2.5 py-1 rounded bg-[#EFE9DC] dark:bg-[#24201C] hover:bg-[#E2DAC9] text-[#524B40] dark:text-[#C5BDB0] border border-[#D5CCBC] dark:border-[#352F28] cursor-pointer" data-delta="100">+100年</button>
          </div>
        </div>
      </div>

      <!-- 核心双栏：月历网格与所选日详情 -->
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 items-start w-full">
        <!-- 月历网格 -->
        <div class="xl:col-span-8 bg-[#FAF7F0] dark:bg-[#1A1715] rounded-xl border border-[#E3DCD0] dark:border-[#2D2824] overflow-hidden shadow-xs w-full">
          <!-- 星期表头 -->
          <div class="grid grid-cols-7 border-b border-[#E3DCD0] dark:border-[#2D2824] bg-[#F2EDE1] dark:bg-[#201C19] text-center text-xs font-semibold py-2">
            <span class="text-[#9B1B1B] dark:text-[#E55353]">日</span>
            <span class="text-[#4F483D] dark:text-[#C5BDB0]">一</span>
            <span class="text-[#4F483D] dark:text-[#C5BDB0]">二</span>
            <span class="text-[#4F483D] dark:text-[#C5BDB0]">三</span>
            <span class="text-[#4F483D] dark:text-[#C5BDB0]">四</span>
            <span class="text-[#4F483D] dark:text-[#C5BDB0]">五</span>
            <span class="text-[#9B1B1B] dark:text-[#E55353]">六</span>
          </div>

          <!-- 日历格子列表 (解决左右红线缺失问题：使用内部 inset 边框) -->
          <div class="grid grid-cols-7 divide-x divide-y divide-[#E9E2D4] dark:divide-[#2A2520] w-full">
  `;

  const today = new Date();
  cells.forEach((cell) => {
    const lun = solarToLunar(cell.y, cell.m, cell.d);
    const isSelected = cell.y === state.currentDate.getFullYear() && cell.m === (state.currentDate.getMonth() + 1) && cell.d === state.currentDate.getDate();
    const isToday = cell.y === today.getFullYear() && cell.m === (today.getMonth() + 1) && cell.d === today.getDate();
    const hasSolarTerm = Boolean(lun.solarTerm);
    const primaryFestival = lun.festivals[0];

    html += `
      <button
        class="cal-day-cell min-h-[58px] sm:min-h-[76px] p-1 sm:p-1.5 text-left flex flex-col justify-between transition-all cursor-pointer relative min-w-0 overflow-hidden ${
          isSelected
            ? 'is-selected bg-[#EFE5D3] dark:bg-[#2C251F]'
            : cell.isCurrent
            ? 'bg-transparent hover:bg-[#F3ECE0] dark:hover:bg-[#221E1A]'
            : 'bg-[#F4EFE5]/40 dark:bg-[#141210]/40 opacity-40 hover:opacity-70'
        }"
        data-year="${cell.y}" data-month="${cell.m}" data-day="${cell.d}"
      >
        <div class="flex items-center justify-between w-full">
          <span class="text-xs sm:text-sm font-bold tabular-nums ${
            isSelected
              ? 'text-[#9B1B1B] dark:text-[#E25353]'
              : isToday
              ? 'inline-block w-5 h-5 rounded-full bg-[#9B1B1B] text-white text-center leading-5 text-[11px]'
              : cell.isCurrent
              ? 'text-[#24211D] dark:text-[#E8E3D9]'
              : 'text-[#8A8173] dark:text-[#6E665A]'
          }">
            ${cell.d}
          </span>
          ${lun.lunarDay === 1 ? `<span class="text-[9px] px-0.5 rounded bg-[#9B1B1B]/10 text-[#9B1B1B] dark:text-[#E25353] font-semibold truncate">${lun.lunarMonthName}</span>` : ''}
        </div>

        <div class="w-full truncate text-[10px] sm:text-xs my-0.5">
          ${hasSolarTerm
            ? `<span class="font-bold text-[#B91C1C] dark:text-[#F87171] truncate block">● ${lun.solarTerm}</span>`
            : primaryFestival
            ? `<span class="font-medium text-[#1E3A8A] dark:text-[#60A5FA] truncate block">${primaryFestival}</span>`
            : `<span class="text-[#6F6658] dark:text-[#A89E90] truncate block">${lun.lunarDayName}</span>`
          }
        </div>

        <div class="text-[9px] text-[#8C8273] dark:text-[#766E63] truncate hidden sm:block">
          ${lun.dayGanZhi}日 · ${lun.jianChu}
        </div>
      </button>
    `;
  });

  html += `
          </div>
        </div>

        <!-- 所选日全息详情卡 -->
        <div class="xl:col-span-4 bg-[#FAF7F0] dark:bg-[#1A1715] rounded-xl border border-[#E3DCD0] dark:border-[#2D2824] p-4 sm:p-5 shadow-xs space-y-4 w-full">
          <div class="border-b border-[#E3DCD0] dark:border-[#2D2824] pb-3">
            <div class="flex items-center justify-between text-xs text-[#807668] dark:text-[#9A9082]">
              <span>${state.currentDate.getFullYear()}-${String(state.currentDate.getMonth() + 1).padStart(2, '0')}-${String(state.currentDate.getDate()).padStart(2, '0')}</span>
              <span>星期${['日', '一', '二', '三', '四', '五', '六'][state.currentDate.getDay()]}</span>
            </div>

            <div class="mt-2 flex items-baseline justify-between">
              <div>
                <div class="text-4xl sm:text-5xl font-black tracking-tight text-[#9B1B1B] dark:text-[#E25353] tabular-nums">
                  ${state.currentDate.getDate()}
                </div>
                <div class="text-sm font-bold text-[#24211D] dark:text-[#E8E3D9] mt-1">
                  农历 ${selLunar.lunarMonthName} ${selLunar.lunarDayName}
                </div>
              </div>

              <!-- 仿朱砂印章 -->
              <div class="w-12 h-12 rounded-lg border-2 border-[#9B1B1B] dark:border-[#E25353] text-[#9B1B1B] dark:text-[#E25353] flex flex-col items-center justify-center font-bold text-[11px] rotate-[-2deg] select-none shadow-2xs">
                <span>${selLunar.solarTerm || '华夏'}</span>
                <span>${selLunar.zodiac}年</span>
              </div>
            </div>

            ${selLunar.festivals.length > 0 ? `
              <div class="mt-2 flex flex-wrap gap-1">
                ${selLunar.festivals.map(f => `<span class="text-[11px] px-1.5 py-0.2 bg-[#9B1B1B]/10 text-[#9B1B1B] dark:text-[#F87171] rounded font-medium">✦ ${f}</span>`).join('')}
              </div>
            ` : ''}
          </div>

          <!-- 四柱干支 -->
          <div class="space-y-2">
            <div class="text-xs font-semibold text-[#665D4F] dark:text-[#A89E90] flex items-center justify-between">
              <span>四柱八字</span>
              <span class="text-[10px] text-[#9B1B1B] dark:text-[#E25353]">五行：${selLunar.naYin}</span>
            </div>

            <div class="grid grid-cols-4 gap-1.5 text-center text-xs">
              <div class="p-1.5 bg-[#F2EDE1] dark:bg-[#221D1A] rounded border border-[#E3DCD0] dark:border-[#2D2824]">
                <div class="text-[10px] text-[#7C7263] dark:text-[#908677]">年柱</div>
                <div class="font-bold text-[#24211D] dark:text-[#EDE8DE]">${selLunar.yearGanZhi}</div>
              </div>
              <div class="p-1.5 bg-[#F2EDE1] dark:bg-[#221D1A] rounded border border-[#E3DCD0] dark:border-[#2D2824]">
                <div class="text-[10px] text-[#7C7263] dark:text-[#908677]">月柱</div>
                <div class="font-bold text-[#24211D] dark:text-[#EDE8DE]">${selLunar.monthGanZhi}</div>
              </div>
              <div class="p-1.5 bg-[#F2EDE1] dark:bg-[#221D1A] rounded border border-[#E3DCD0] dark:border-[#2D2824]">
                <div class="text-[10px] text-[#7C7263] dark:text-[#908677]">日柱</div>
                <div class="font-bold text-[#9B1B1B] dark:text-[#E25353]">${selLunar.dayGanZhi}</div>
              </div>
              <div class="p-1.5 bg-[#F2EDE1] dark:bg-[#221D1A] rounded border border-[#E3DCD0] dark:border-[#2D2824]">
                <div class="text-[10px] text-[#7C7263] dark:text-[#908677]">时柱</div>
                <div class="font-bold text-[#24211D] dark:text-[#EDE8DE]">${selHourGz}</div>
              </div>
            </div>

            <!-- 时辰切换 -->
            <div class="pt-1 flex items-center justify-between text-xs text-[#7A7061] dark:text-[#968C7E]">
              <span>时辰测算：</span>
              <select id="cal-shichen-select" class="bg-[#F2EDE1] dark:bg-[#221D1A] border border-[#D5CCBC] dark:border-[#38322B] rounded px-1.5 py-0.5 text-xs text-[#24211D] dark:text-[#E8E3D9]">
                ${[0,2,4,6,8,10,12,14,16,18,20,22].map(h => {
                  const bName = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][h/2];
                  return `<option value="${h}" ${state.selectedShichen === h ? 'selected' : ''}>${bName}时 (${(h+23)%24}-${(h+1)%24}点)</option>`;
                }).join('')}
              </select>
            </div>
          </div>

          <!-- 宜忌 -->
          <div class="space-y-2 pt-2 border-t border-[#E3DCD0] dark:border-[#2D2824] text-xs">
            <div class="flex items-start gap-2">
              <span class="w-5 h-5 rounded bg-[#15803D] text-white flex items-center justify-center font-bold text-[10px] shrink-0">宜</span>
              <span class="text-[#2F2921] dark:text-[#D5CEC2] leading-tight">祭祀 祈福 沐浴 嫁娶 扫舍 开市 裁衣 交易 纳财</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="w-5 h-5 rounded bg-[#B91C1C] text-white flex items-center justify-center font-bold text-[10px] shrink-0">忌</span>
              <span class="text-[#2F2921] dark:text-[#D5CEC2] leading-tight">动土 破土 安葬 伐木 探病 词讼 作灶 针灸</span>
            </div>
          </div>

          <!-- 冲煞与吉神方位 -->
          <div class="space-y-1.5 pt-2 border-t border-[#E3DCD0] dark:border-[#2D2824] text-xs">
            <div class="flex justify-between">
              <span class="text-[#7A7061] dark:text-[#968C7E]">冲煞生肖：</span>
              <span class="font-bold text-[#B91C1C] dark:text-[#F87171]">${selLunar.clash}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#7A7061] dark:text-[#968C7E]">喜神/财神/福神：</span>
              <span class="font-medium text-[#24211D] dark:text-[#E8E3D9]">${selLunar.godDirections.xiShen} / ${selLunar.godDirections.caiShen} / ${selLunar.godDirections.fuShen}</span>
            </div>
          </div>

          <!-- 彭祖百忌 -->
          ${selLunar.pengZuStem ? `
            <div class="p-2.5 bg-[#F2EDE1]/70 dark:bg-[#1E1916] rounded-lg border border-[#E3DCD0] dark:border-[#2D2824] text-[11px] space-y-0.5 text-[#6F6658] dark:text-[#A89E90]">
              <div class="font-semibold text-[#24211D] dark:text-[#EDE8DE]">彭祖百忌：</div>
              <div>• ${selLunar.pengZuStem}</div>
              <div>• ${selLunar.pengZuBranch}</div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // 绑定事件
  document.getElementById('cal-year-select-input')?.addEventListener('change', (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      state.viewYear = val;
      renderCalendar();
    }
  });

  document.getElementById('cal-month-select')?.addEventListener('change', (e) => {
    state.viewMonth = parseInt(e.target.value, 10);
    renderCalendar();
  });

  document.getElementById('cal-jump-today')?.addEventListener('click', () => {
    const now = new Date();
    state.viewYear = now.getFullYear();
    state.viewMonth = now.getMonth() + 1;
    state.currentDate = now;
    renderCalendar();
  });

  document.querySelectorAll('.cal-jump-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const delta = parseInt(e.currentTarget.getAttribute('data-delta'), 10);
      state.viewYear += delta;
      renderCalendar();
    });
  });

  document.getElementById('cal-shichen-select')?.addEventListener('change', (e) => {
    state.selectedShichen = parseInt(e.target.value, 10);
    renderCalendar();
  });

  document.querySelectorAll('.cal-day-cell').forEach((cell) => {
    cell.addEventListener('click', (e) => {
      const target = e.currentTarget;
      const y = parseInt(target.getAttribute('data-year'), 10);
      const m = parseInt(target.getAttribute('data-month'), 10);
      const d = parseInt(target.getAttribute('data-day'), 10);
      state.currentDate = new Date(y, m - 1, d);
      if (m !== state.viewMonth) {
        state.viewYear = y;
        state.viewMonth = m;
      }
      renderCalendar();
    });
  });
}

// ==================== 2. 今日老黄历挂历渲染 ====================
function renderAlmanac() {
  const container = document.getElementById('view-almanac');
  if (!container) return;

  const d = state.currentDate;
  const lun = solarToLunar(d.getFullYear(), d.getMonth() + 1, d.getDate());
  const jd = gregorianToJulianDay(d.getFullYear(), d.getMonth() + 1, d.getDate());

  // 十二时辰黄道吉凶神煞
  const spirits = ['青龙','明堂','天刑','朱雀','金匮','天德','白虎','玉堂','天牢','玄武','司命','勾陈'];
  const isAuspicious = [true, true, false, false, true, true, false, true, false, false, true, false];
  const dayBranch = lun.dayGanZhi[1];
  const startSpirits = { '子': 8, '午': 8, '丑': 10, '未': 10, '寅': 0, '申': 0, '卯': 2, '酉': 2, '辰': 4, '戌': 4, '巳': 6, '亥': 6 };
  const spiritStart = startSpirits[dayBranch] ?? 0;

  const curYear = d.getFullYear();
  const curMonth = d.getMonth() + 1;
  const curDay = d.getDate();
  const daysInCurMonth = getSolarDaysInMonth(curYear, curMonth);

  let html = `
    <div class="max-w-4xl mx-auto space-y-4 sm:space-y-6 w-full">
      <!-- 居中统一数字选择栏：年、月、日显示与年份一致，下拉选项仅显示纯数字，去除前后翻页与提示词 -->
      <div class="flex items-center justify-center bg-[#FAF7F0] dark:bg-[#1A1715] p-3 px-4 rounded-xl border border-[#E3DCD0] dark:border-[#2D2824]">
        <div class="flex flex-wrap items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-[#4F483D] dark:text-[#C5BDB0]">
          <input id="alm-year-input" type="number" min="1600" max="3500" value="${curYear}" class="w-18 sm:w-20 px-2 py-1 text-center bg-white dark:bg-[#13110F] border border-[#D0C6B4] dark:border-[#3A332B] rounded-lg text-sm sm:text-base font-bold text-[#24211D] dark:text-[#EDE8DE] focus:outline-none focus:ring-1 focus:ring-[#9B1B1B]" title="修改年份" />
          <span>年</span>
          <select id="alm-month-select" class="px-2 py-1 bg-white dark:bg-[#13110F] border border-[#D0C6B4] dark:border-[#3A332B] rounded-lg text-sm sm:text-base font-bold text-[#24211D] dark:text-[#EDE8DE] focus:outline-none focus:ring-1 focus:ring-[#9B1B1B]" title="选择月份">
            ${Array.from({ length: 12 }, (_, i) => i + 1).map(m => `<option value="${m}" ${curMonth === m ? 'selected' : ''}>${m}</option>`).join('')}
          </select>
          <span>月</span>
          <select id="alm-day-select" class="px-2 py-1 bg-white dark:bg-[#13110F] border border-[#D0C6B4] dark:border-[#3A332B] rounded-lg text-sm sm:text-base font-bold text-[#24211D] dark:text-[#EDE8DE] focus:outline-none focus:ring-1 focus:ring-[#9B1B1B]" title="选择日期">
            ${Array.from({ length: daysInCurMonth }, (_, i) => i + 1).map(dayNum => `<option value="${dayNum}" ${curDay === dayNum ? 'selected' : ''}>${dayNum}</option>`).join('')}
          </select>
          <span>日</span>
          <span class="text-xs text-[#807668] dark:text-[#9A9082] ml-2 font-medium">星期${['日', '一', '二', '三', '四', '五', '六'][d.getDay()]}</span>
        </div>
      </div>

      <!-- 宣纸古典撕历卡 -->
      <div class="bg-[#FCFAF5] dark:bg-[#181513] rounded-2xl border-2 border-[#D6CDBC] dark:border-[#352F28] p-5 sm:p-8 shadow-sm space-y-5">
        <div class="flex items-center justify-between border-b-2 border-[#9B1B1B] pb-3">
          <span class="text-sm sm:text-base font-bold tracking-widest text-[#9B1B1B] dark:text-[#E25353]">
            华夏钦定老皇历 · 岁次${lun.yearGanZhi}
          </span>
          <span class="text-xs font-semibold px-2 py-0.5 rounded bg-[#9B1B1B] text-white">
            ${lun.zodiac}年
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div class="md:col-span-5 text-center md:text-left border-b md:border-b-0 md:border-r border-[#E3DCD0] dark:border-[#2D2824] pb-5 md:pb-0 md:pr-6">
            <div class="text-6xl sm:text-8xl font-black text-[#9B1B1B] dark:text-[#E25353] tabular-nums leading-none">
              ${d.getDate()}
            </div>
            <div class="text-base font-semibold text-[#3D372E] dark:text-[#DDD5C7] mt-3">
              ${d.getFullYear()}年 ${d.getMonth() + 1}月
            </div>
            <div class="text-xs text-[#807668] dark:text-[#9A9082]">
              星期${['日', '一', '二', '三', '四', '五', '六'][d.getDay()]} · 儒略日：${Math.floor(jd)}
            </div>
          </div>

          <div class="md:col-span-7 space-y-3">
            <div>
              <div class="text-xs uppercase text-[#857B6C] dark:text-[#A09687]">农历</div>
              <div class="text-2xl sm:text-3xl font-bold text-[#24211D] dark:text-[#EDE8DE] mt-0.5">
                ${lun.lunarMonthName} ${lun.lunarDayName}
              </div>
              ${lun.solarTerm ? `<div class="mt-1 inline-block text-xs font-semibold text-[#9B1B1B] dark:text-[#F87171] bg-[#9B1B1B]/10 px-2 py-0.5 rounded">✦ 节气：${lun.solarTerm} ${lun.phenology ? `(${lun.phenology})` : ''}</div>` : ''}
            </div>

            <div class="grid grid-cols-4 gap-2 pt-2 border-t border-[#E3DCD0] dark:border-[#2D2824] text-xs">
              <div><span class="text-[#857B6C]">年柱：</span><strong>${lun.yearGanZhi}</strong></div>
              <div><span class="text-[#857B6C]">月柱：</span><strong>${lun.monthGanZhi}</strong></div>
              <div><span class="text-[#857B6C]">日柱：</span><strong class="text-[#9B1B1B] dark:text-[#E25353]">${lun.dayGanZhi}</strong></div>
              <div><span class="text-[#857B6C]">建除：</span><strong>${lun.jianChu}日</strong></div>
            </div>
          </div>
        </div>

        <!-- 宜忌红黑双榜 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div class="bg-[#F0FDF4] dark:bg-[#14261B] border border-[#BBF7D0] dark:border-[#1E3E2B] rounded-xl p-3.5">
            <div class="flex items-center gap-2 mb-1.5 font-bold text-xs text-[#16A34A]">
              <span class="w-5 h-5 rounded bg-[#16A34A] text-white flex items-center justify-center">宜</span>
              <span>吉神当值 · 诸事大吉</span>
            </div>
            <p class="text-xs text-[#14532D] dark:text-[#86EFAC] leading-relaxed">
              祭祀 祈福 求嗣 开光 出行 嫁娶 纳采 修造 动土 移徙 入宅
            </p>
          </div>

          <div class="bg-[#FEF2F2] dark:bg-[#281616] border border-[#FECACA] dark:border-[#442323] rounded-xl p-3.5">
            <div class="flex items-center gap-2 mb-1.5 font-bold text-xs text-[#DC2626]">
              <span class="w-5 h-5 rounded bg-[#DC2626] text-white flex items-center justify-center">忌</span>
              <span>黑煞相值 · 慎行避忌</span>
            </div>
            <p class="text-xs text-[#7F1D1D] dark:text-[#FCA5A5] leading-relaxed">
              开市 交易 安葬 破土 作灶 栽种 掘井 词讼 针灸 出火
            </p>
          </div>
        </div>

        <!-- 十二时辰黄黑道吉凶全览 -->
        <div class="space-y-2 pt-3 border-t border-[#E3DCD0] dark:border-[#2D2824]">
          <div class="text-xs font-bold uppercase text-[#544C3F] dark:text-[#B6ACA0]">
            今日十二时辰黄黑道吉凶明细
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 text-xs">
  `;

  ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'].forEach((b, i) => {
    const hHour = i * 2;
    const hGz = getHourGanZhi(lun.dayGanZhi[0], hHour);
    const sIdx = (i - spiritStart + 12) % 12;
    const sName = spirits[sIdx];
    const sGood = isAuspicious[sIdx];

    html += `
      <div class="p-2 rounded-lg bg-[#F6F1E6] dark:bg-[#1F1B18] border border-[#E3DCD0] dark:border-[#2D2824]">
        <div class="flex justify-between font-bold">
          <span>${b}时</span>
          <span class="text-[10px] px-1 rounded ${sGood ? 'bg-[#15803D]/15 text-[#15803D]' : 'bg-[#B91C1C]/15 text-[#B91C1C]'}">${sGood ? '吉' : '凶'}</span>
        </div>
        <div class="text-[10px] text-[#807668] mt-0.5">${hGz} · ${sName}</div>
        <div class="text-[9px] text-[#A09687] mt-0.5">${(hHour + 23) % 24}:00 - ${(hHour + 1) % 24}:00</div>
      </div>
    `;
  });

  html += `
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  document.getElementById('alm-year-input')?.addEventListener('change', (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      state.currentDate = new Date(val, state.currentDate.getMonth(), Math.min(state.currentDate.getDate(), getSolarDaysInMonth(val, state.currentDate.getMonth() + 1)));
      renderAlmanac();
    }
  });

  document.getElementById('alm-month-select')?.addEventListener('change', (e) => {
    const newM = parseInt(e.target.value, 10) - 1;
    const maxDays = getSolarDaysInMonth(state.currentDate.getFullYear(), newM + 1);
    state.currentDate = new Date(state.currentDate.getFullYear(), newM, Math.min(state.currentDate.getDate(), maxDays));
    renderAlmanac();
  });

  document.getElementById('alm-day-select')?.addEventListener('change', (e) => {
    const newD = parseInt(e.target.value, 10);
    state.currentDate = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth(), newD);
    renderAlmanac();
  });
}

// ==================== 3. 公农互转与传统节日 ====================
function renderConverter() {
  const container = document.getElementById('view-converter');
  if (!container) return;

  const solResult = solarToLunar(state.sYear, state.sMonth, state.sDay);
  const lunResult = lunarToSolar(state.lYear, state.lMonth, state.lDay, state.lIsLeap);
  const leapM = getLeapMonthFromTable(state.lYear);

  const festNames = [
    { name: '除夕', lM: 12, lD: 30, poem: '千门万户曈曈日，总把新桃换旧符。' },
    { name: '春节', lM: 1, lD: 1, poem: '爆竹声中一岁除，春风送暖入屠苏。' },
    { name: '元宵节', lM: 1, lD: 15, poem: '东风夜放花千树。更吹落、星如雨。' },
    { name: '龙抬头', lM: 2, lD: 2, poem: '二月二，龙抬头，大仓满，小仓流。' },
    { name: '端午节', lM: 5, lD: 5, poem: '彩线轻缠红玉臂，小符斜挂绿云鬟。' },
    { name: '七夕节', lM: 7, lD: 7, poem: '迢迢牵牛星，皎皎河汉女。' },
    { name: '中元节', lM: 7, lD: 15, poem: '万树凉生霜气清，中元月上九衢明。' },
    { name: '中秋节', lM: 8, lD: 15, poem: '但愿人长久，千里共婵娟。' },
    { name: '重阳节', lM: 9, lD: 9, poem: '遥知兄弟登高处，遍插茱萸少一人。' },
    { name: '腊八节', lM: 12, lD: 8, poem: '今朝佛粥更相馈，更觉江天万里宽。' }
  ];

  let html = `
    <div class="max-w-4xl mx-auto space-y-4 sm:space-y-6 w-full">
      <!-- 三选项卡 -->
      <div class="flex items-center gap-1 sm:gap-2 p-1.5 bg-[#FAF7F0] dark:bg-[#1A1715] rounded-xl border border-[#E3DCD0] dark:border-[#2D2824]">
        <button class="conv-mode-btn flex-1 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${state.converterMode === 'solar2lunar' ? 'bg-[#9B1B1B] text-white' : 'text-[#6F6658] dark:text-[#A89E90]'}" data-mode="solar2lunar">公历转农历</button>
        <button class="conv-mode-btn flex-1 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${state.converterMode === 'lunar2solar' ? 'bg-[#9B1B1B] text-white' : 'text-[#6F6658] dark:text-[#A89E90]'}" data-mode="lunar2solar">农历转公历</button>
        <button class="conv-mode-btn flex-1 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${state.converterMode === 'festivals' ? 'bg-[#9B1B1B] text-white' : 'text-[#6F6658] dark:text-[#A89E90]'}" data-mode="festivals">跨世纪节日大典</button>
      </div>
  `;

  if (state.converterMode === 'solar2lunar') {
    html += `
      <div class="bg-[#FCFAF5] dark:bg-[#181513] rounded-2xl border border-[#DCD3C3] dark:border-[#322C26] p-4 sm:p-6 shadow-sm space-y-4">
        <h3 class="text-sm sm:text-base font-bold text-[#24211D] dark:text-[#EDE8DE]">公历日期转换转为农历与四柱八字</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-medium text-[#655D50] mb-1">公历年份</label>
            <input id="conv-s-year" type="number" min="1600" max="3500" value="${state.sYear}" class="w-full px-3 py-1.5 bg-white dark:bg-[#13110F] border border-[#D5CCBC] dark:border-[#38322B] rounded-lg text-sm text-[#24211D] dark:text-[#E8E3D9]" />
          </div>
          <div>
            <label class="block text-xs font-medium text-[#655D50] mb-1">公历月份</label>
            <select id="conv-s-month" class="w-full px-3 py-1.5 bg-white dark:bg-[#13110F] border border-[#D5CCBC] dark:border-[#38322B] rounded-lg text-sm text-[#24211D] dark:text-[#E8E3D9]">
              ${Array.from({ length: 12 }, (_, i) => i + 1).map(m => `<option value="${m}" ${state.sMonth === m ? 'selected' : ''}>${m}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-[#655D50] mb-1">公历日期</label>
            <select id="conv-s-day" class="w-full px-3 py-1.5 bg-white dark:bg-[#13110F] border border-[#D5CCBC] dark:border-[#38322B] rounded-lg text-sm text-[#24211D] dark:text-[#E8E3D9]">
              ${Array.from({ length: 31 }, (_, i) => i + 1).map(d => `<option value="${d}" ${state.sDay === d ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="bg-[#FAF7F0] dark:bg-[#1F1B18] rounded-xl border border-[#D5CCBC] dark:border-[#38322B] p-4 space-y-2">
          <div class="text-xs text-[#9B1B1B] dark:text-[#E25353] font-bold">转换结果：</div>
          <div class="text-xl sm:text-2xl font-bold text-[#24211D] dark:text-[#EDE8DE]">
            农历 ${solResult.lunarMonthName} ${solResult.lunarDayName}
          </div>
          <div class="text-xs sm:text-sm text-[#9B1B1B] dark:text-[#F87171]">
            岁次${solResult.yearGanZhi}年【${solResult.zodiac}年】 · ${solResult.monthGanZhi}月 · ${solResult.dayGanZhi}日
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
            <div>纳音：${solResult.naYin}</div>
            <div>建除：${solResult.jianChu}日</div>
            <div>冲煞：${solResult.clash}</div>
            <div>节气：${solResult.solarTerm || '无'}</div>
          </div>
        </div>
      </div>
    `;
  } else if (state.converterMode === 'lunar2solar') {
    html += `
      <div class="bg-[#FCFAF5] dark:bg-[#181513] rounded-2xl border border-[#DCD3C3] dark:border-[#322C26] p-4 sm:p-6 shadow-sm space-y-4">
        <h3 class="text-sm sm:text-base font-bold text-[#24211D] dark:text-[#EDE8DE]">农历日期反推公历</h3>
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label class="block text-xs font-medium text-[#655D50] mb-1">农历年份</label>
            <input id="conv-l-year" type="number" min="1600" max="3500" value="${state.lYear}" class="w-full px-3 py-1.5 bg-white dark:bg-[#13110F] border border-[#D5CCBC] dark:border-[#38322B] rounded-lg text-sm text-[#24211D] dark:text-[#E8E3D9]" />
          </div>
          <div>
            <label class="block text-xs font-medium text-[#655D50] mb-1">农历月份</label>
            <select id="conv-l-month" class="w-full px-3 py-1.5 bg-white dark:bg-[#13110F] border border-[#D5CCBC] dark:border-[#38322B] rounded-lg text-sm text-[#24211D] dark:text-[#E8E3D9]">
              ${LUNAR_MONTH_NAMES.map((name, i) => `<option value="${i + 1}" ${state.lMonth === (i + 1) ? 'selected' : ''}>${name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-[#655D50] mb-1">农历日期</label>
            <select id="conv-l-day" class="w-full px-3 py-1.5 bg-white dark:bg-[#13110F] border border-[#D5CCBC] dark:border-[#38322B] rounded-lg text-sm text-[#24211D] dark:text-[#E8E3D9]">
              ${Array.from({ length: 30 }, (_, i) => i + 1).map(d => `<option value="${d}" ${state.lDay === d ? 'selected' : ''}>${LUNAR_DAY_NAMES[d]}</option>`).join('')}
            </select>
          </div>
          <div class="flex items-end">
            <label class="flex items-center gap-2 p-2 bg-[#FAF7F0] dark:bg-[#1F1B18] border border-[#D5CCBC] dark:border-[#38322B] rounded-lg cursor-pointer w-full">
              <input id="conv-l-leap" type="checkbox" ${state.lIsLeap ? 'checked' : ''} ${leapM !== state.lMonth ? 'disabled' : ''} />
              <span class="text-xs">${leapM === state.lMonth ? `闰${LUNAR_MONTH_NAMES[state.lMonth - 1]}` : '无闰月'}</span>
            </label>
          </div>
        </div>

        <div class="bg-[#FAF7F0] dark:bg-[#1F1B18] rounded-xl border border-[#D5CCBC] dark:border-[#38322B] p-4 space-y-2">
          <div class="text-xs text-[#9B1B1B] dark:text-[#E25353] font-bold">反推公历：</div>
          ${lunResult ? `
            <div class="text-xl sm:text-2xl font-bold text-[#24211D] dark:text-[#EDE8DE]">
              公历 ${lunResult.year}年 ${lunResult.month}月 ${lunResult.day}日
            </div>
            <div class="text-xs text-[#807668]">星期${['日', '一', '二', '三', '四', '五', '六'][new Date(lunResult.year, lunResult.month - 1, lunResult.day).getDay()]}</div>
          ` : `<div class="text-xs text-[#B91C1C]">该年该月不存在此日期或无此闰月。</div>`}
        </div>
      </div>
    `;
  } else {
    html += `
      <div class="bg-[#FCFAF5] dark:bg-[#181513] rounded-2xl border border-[#DCD3C3] dark:border-[#322C26] p-4 sm:p-6 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm sm:text-base font-bold text-[#24211D] dark:text-[#EDE8DE]">传统节日跨世纪推演</h3>
          <div class="flex items-center gap-1.5 text-xs">
            <span>年份：</span>
            <input id="conv-fest-year" type="number" min="1600" max="3000" value="${state.festYear}" class="w-20 px-2 py-0.5 text-center bg-white dark:bg-[#13110F] border rounded text-xs font-bold" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          ${festNames.map(f => {
            let sol = lunarToSolar(state.festYear, f.lM, f.lD, false);
            if (!sol && f.name === '除夕') sol = lunarToSolar(state.festYear, 12, 29, false);
            const str = sol ? `${sol.year}年${sol.month}月${sol.day}日` : '待算';
            return `
              <div class="p-3 bg-[#FAF7F0] dark:bg-[#1F1B18] rounded-xl border border-[#E3DCD0] dark:border-[#2D2824] space-y-1">
                <div class="flex justify-between font-bold">
                  <span class="text-[#9B1B1B] dark:text-[#E25353] text-sm">${f.name}</span>
                  <span class="text-[#24211D] dark:text-[#EDE8DE]">${str}</span>
                </div>
                <div class="italic text-[11px] text-[#807668] dark:text-[#9A9082]">“${f.poem}”</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  html += `</div>`;
  container.innerHTML = html;

  // 绑定模式按钮
  document.querySelectorAll('.conv-mode-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      state.converterMode = e.currentTarget.getAttribute('data-mode');
      renderConverter();
    });
  });

  // 绑定表单输入
  document.getElementById('conv-s-year')?.addEventListener('change', (e) => { state.sYear = Number(e.target.value); renderConverter(); });
  document.getElementById('conv-s-month')?.addEventListener('change', (e) => { state.sMonth = Number(e.target.value); renderConverter(); });
  document.getElementById('conv-s-day')?.addEventListener('change', (e) => { state.sDay = Number(e.target.value); renderConverter(); });

  document.getElementById('conv-l-year')?.addEventListener('change', (e) => { state.lYear = Number(e.target.value); renderConverter(); });
  document.getElementById('conv-l-month')?.addEventListener('change', (e) => { state.lMonth = Number(e.target.value); renderConverter(); });
  document.getElementById('conv-l-day')?.addEventListener('change', (e) => { state.lDay = Number(e.target.value); renderConverter(); });
  document.getElementById('conv-l-leap')?.addEventListener('change', (e) => { state.lIsLeap = e.target.checked; renderConverter(); });

  document.getElementById('conv-fest-year')?.addEventListener('change', (e) => { state.festYear = Number(e.target.value); renderConverter(); });
}

// ==================== 4. 节气物候渲染 ====================
function renderSolarTerms() {
  const container = document.getElementById('view-solarterms');
  if (!container) return;

  const terms = getYearSolarTerms(state.stYear);
  const activeTerm = terms[state.selectedTermIdx] || terms[0];

  let html = `
    <div class="max-w-5xl mx-auto space-y-4 sm:space-y-6 w-full">
      <div class="bg-[#FAF7F0] dark:bg-[#1A1715] p-3 sm:p-4 rounded-xl border border-[#E3DCD0] dark:border-[#2D2824] flex items-center justify-between">
        <div>
          <h3 class="text-base sm:text-lg font-bold text-[#24211D] dark:text-[#EDE8DE]">二十四节气与七十二候</h3>
          <p class="text-xs text-[#807668]">太阳视黄经每15°为一节气</p>
        </div>
        <div class="flex items-center gap-1.5 text-xs">
          <span>演算年份：</span>
          <input id="st-year-input" type="number" min="1600" max="3500" value="${state.stYear}" class="w-18 px-2 py-0.5 text-center bg-white dark:bg-[#13110F] border rounded text-xs font-bold" />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        <div class="lg:col-span-7 bg-[#FCFAF5] dark:bg-[#181513] rounded-2xl border border-[#E3DCD0] dark:border-[#2D2824] p-4 space-y-3">
          <div class="text-xs font-semibold uppercase text-[#685F51] dark:text-[#A79C8E]">
            ${state.stYear}年 二十四节气交节时刻
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            ${terms.map((t, idx) => `
              <button class="st-term-btn p-2 rounded-xl text-left border transition-all cursor-pointer ${state.selectedTermIdx === idx ? 'bg-[#EFE5D3] dark:bg-[#2B241E] border-[#9B1B1B] ring-1 ring-[#9B1B1B]' : 'bg-[#F7F2E7] dark:bg-[#1F1B18] border-[#E5DEC2] dark:border-[#2C2723]'}" data-idx="${idx}">
                <div class="flex justify-between font-bold text-xs sm:text-sm">
                  <span>${t.name}</span>
                  <span class="text-[10px] text-[#8C8273]">${t.angle}°</span>
                </div>
                <div class="text-[10px] sm:text-[11px] text-[#807668] mt-0.5">
                  ${t.date.getMonth() + 1}月${t.date.getDate()}日 ${String(t.date.getHours()).padStart(2, '0')}:${String(t.date.getMinutes()).padStart(2, '0')}
                </div>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="lg:col-span-5 bg-[#FCFAF5] dark:bg-[#181513] rounded-2xl border-2 border-[#D6CDBC] dark:border-[#352F28] p-5 space-y-4">
          <div class="border-b border-[#E3DCD0] dark:border-[#2D2824] pb-3">
            <div class="text-2xl sm:text-3xl font-black text-[#9B1B1B] dark:text-[#E25353]">${activeTerm.name}</div>
            <div class="text-xs text-[#807668] mt-1">交节时刻：${activeTerm.dateFormatted} (黄经 ${activeTerm.angle}°)</div>
          </div>

          <div class="text-xs text-[#383127] dark:text-[#CEC6B7] leading-relaxed">${activeTerm.desc}</div>

          <div class="space-y-1.5">
            <div class="text-xs font-semibold text-[#665D4F]">物候三候：</div>
            ${activeTerm.phenology.map((ph, i) => `
              <div class="p-2 bg-[#F4EFE5] dark:bg-[#201C19] rounded-lg text-xs flex items-center gap-2">
                <span class="w-4 h-4 rounded-full bg-[#15803D]/15 text-[#15803D] text-[10px] font-bold flex items-center justify-center">${i + 1}</span>
                <span>${ph}</span>
              </div>
            `).join('')}
          </div>

          ${activeTerm.poem ? `
            <div class="p-3 bg-[#FAF7F0] dark:bg-[#1A1715] rounded-xl text-xs italic text-[#9B1B1B]">
              “${activeTerm.poem}”
            </div>
          ` : ''}
          ${activeTerm.food ? `<div class="text-xs text-[#52493C] dark:text-[#B6ACA0]"><strong>节令食俗：</strong>${activeTerm.food}</div>` : ''}
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  document.getElementById('st-year-input')?.addEventListener('change', (e) => {
    state.stYear = Number(e.target.value);
    renderSolarTerms();
  });

  document.querySelectorAll('.st-term-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      state.selectedTermIdx = Number(e.currentTarget.getAttribute('data-idx'));
      renderSolarTerms();
    });
  });
}

// ==================== 5. 历法科学专题与SVG天体模拟 ====================
function renderScience() {
  const container = document.getElementById('view-science');
  if (!container) return;

  // 严格根据当前年、月的天数修正日期（解决无31日仍出现31日的bug）
  const maxDays = getSolarDaysInMonth(state.simYear, state.simMonth);
  if (state.simDay > maxDays) {
    state.simDay = maxDays;
  }

  const jd = gregorianToJulianDay(state.simYear, state.simMonth, state.simDay, 12, 0, 0);
  const sunLong = Math.round(getSunApparentLongitude(jd) * 100) / 100;
  const moonLong = Math.round(getMoonApparentLongitude(jd) * 100) / 100;
  const elongation = Math.round(((moonLong - sunLong + 360) % 360) * 10) / 10;
  const lun = solarToLunar(state.simYear, state.simMonth, state.simDay);

  let phase = '朔日 · 新月 (农历初一)';
  if (elongation >= 15 && elongation < 75) phase = '峨眉月 (初二至初六)';
  else if (elongation >= 75 && elongation < 105) phase = '上弦月 (初七至初八)';
  else if (elongation >= 105 && elongation < 165) phase = '盈凸月 (初九至十四)';
  else if (elongation >= 165 && elongation < 195) phase = '望日 · 满月 (十五或十六)';
  else if (elongation >= 195 && elongation < 255) phase = '亏凸月 (十七至廿一)';
  else if (elongation >= 255 && elongation < 285) phase = '下弦月 (廿二至廿三)';
  else if (elongation >= 285 && elongation <= 345) phase = '残月 (廿四至月末)';

  // 太阳与月球在SVG坐标中的极坐标转换
  const sRad = ((sunLong - 90) * Math.PI) / 180;
  const sx = 140 + 95 * Math.cos(sRad);
  const sy = 140 + 95 * Math.sin(sRad);

  const mRad = ((moonLong - 90) * Math.PI) / 180;
  const mx = 140 + 55 * Math.cos(mRad);
  const my = 140 + 55 * Math.sin(mRad);

  let html = `
    <div class="max-w-5xl mx-auto space-y-6 w-full">
      <!-- 动态交互天体运行模拟器 (只用纯文字标题，彻底去除前面的图标) -->
      <div class="bg-[#FCFAF5] dark:bg-[#181513] rounded-2xl border border-[#DCD3C3] dark:border-[#322C26] p-4 sm:p-6 shadow-sm space-y-4">
        <h3 class="text-sm sm:text-base font-bold text-[#24211D] dark:text-[#EDE8DE]">
          天球轨道与黄经模拟器
        </h3>

        <!-- 交互滑块 (日期上限按实际月份天数动态设定，彻底杜绝31日bug) -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F7F2E7] dark:bg-[#1F1B18] p-3 rounded-xl text-xs">
          <div>
            <div class="flex justify-between mb-1"><span>年份：</span><strong>${state.simYear}年</strong></div>
            <input id="sci-year-slider" type="range" min="1600" max="3000" value="${state.simYear}" class="w-full accent-[#9B1B1B]" />
          </div>
          <div>
            <div class="flex justify-between mb-1"><span>月份：</span><strong>${state.simMonth}月</strong></div>
            <input id="sci-month-slider" type="range" min="1" max="12" value="${state.simMonth}" class="w-full accent-[#9B1B1B]" />
          </div>
          <div>
            <div class="flex justify-between mb-1"><span>日期：</span><strong>${state.simDay}日</strong></div>
            <input id="sci-day-slider" type="range" min="1" max="${maxDays}" value="${state.simDay}" class="w-full accent-[#9B1B1B]" />
          </div>
        </div>

        <!-- SVG 天体图解与数据面板 -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div class="md:col-span-6 flex justify-center py-2 overflow-hidden">
            <svg viewBox="0 0 280 280" class="w-full max-w-[260px] sm:max-w-[280px] aspect-square select-none">
              <!-- 黄道天球背景圈 -->
              <circle cx="140" cy="140" r="115" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 4" class="text-[#D8CEBC] dark:text-[#3A332B]"></circle>
              <line x1="25" y1="140" x2="255" y2="140" stroke="currentColor" stroke-width="1" class="text-[#E3DCD0] dark:text-[#2D2824]"></line>
              <line x1="140" y1="25" x2="140" y2="255" stroke="currentColor" stroke-width="1" class="text-[#E3DCD0] dark:text-[#2D2824]"></line>
              <text x="245" y="144" font-size="9" fill="currentColor" class="text-[#8C8273]">春分0°</text>
              <text x="125" y="20" font-size="9" fill="currentColor" class="text-[#8C8273]">夏至90°</text>
              <text x="2" y="144" font-size="9" fill="currentColor" class="text-[#8C8273]">秋分180°</text>
              <text x="125" y="270" font-size="9" fill="currentColor" class="text-[#8C8273]">冬至270°</text>

              <!-- 地球中心 -->
              <circle cx="140" cy="140" r="12" fill="#3B82F6"></circle>
              <text x="140" y="143" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">地球</text>

              <!-- 太阳 -->
              <line x1="140" y1="140" x2="${sx}" y2="${sy}" stroke="#DC2626" stroke-width="1.5" stroke-opacity="0.5"></line>
              <circle cx="${sx}" cy="${sy}" r="10" fill="#DC2626"></circle>
              <text x="${sx}" y="${sy + 3}" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">日</text>

              <!-- 月球 -->
              <line x1="140" y1="140" x2="${mx}" y2="${my}" stroke="#F59E0B" stroke-width="1.5" stroke-opacity="0.5" stroke-dasharray="2 2"></line>
              <circle cx="${mx}" cy="${my}" r="8" fill="#F59E0B"></circle>
              <text x="${mx}" y="${my + 3}" font-size="7" font-weight="bold" fill="#ffffff" text-anchor="middle">月</text>
            </svg>
          </div>

          <div class="md:col-span-6 space-y-2 text-xs">
            <div class="p-3 bg-[#FAF7F0] dark:bg-[#1A1715] rounded-xl border border-[#E3DCD0] dark:border-[#2D2824] space-y-1.5">
              <div class="font-bold text-[#24211D] dark:text-[#EDE8DE]">${state.simYear}年${state.simMonth}月${state.simDay}日 瞬时轨道解</div>
              <div class="grid grid-cols-2 gap-2 text-[11px]">
                <div class="p-1.5 bg-[#F2EDE1] dark:bg-[#221D1A] rounded">太阳视黄经：<strong>${sunLong}°</strong></div>
                <div class="p-1.5 bg-[#F2EDE1] dark:bg-[#221D1A] rounded">月球视黄经：<strong>${moonLong}°</strong></div>
              </div>
              <div class="text-[11px] space-y-1">
                <div>日月黄经差：<strong>${elongation}°</strong></div>
                <div>当前月相：<strong class="text-[#15803D] dark:text-[#4ADE80]">${phase}</strong></div>
                <div>对应农历：<strong class="text-[#9B1B1B] dark:text-[#E25353]">${lun.lunarMonthName}${lun.lunarDayName} (${lun.yearGanZhi}年)</strong></div>
              </div>
            </div>
            <p class="text-[11px] text-[#7A7163] leading-normal italic">
              注：当黄经差为0°附近时即为“定朔”（初一）；当达到180°附近时即为“定望”（十五/十六）。
            </p>
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  document.getElementById('sci-year-slider')?.addEventListener('input', (e) => {
    state.simYear = Number(e.target.value);
    const maxD = getSolarDaysInMonth(state.simYear, state.simMonth);
    if (state.simDay > maxD) state.simDay = maxD;
    renderScience();
  });

  document.getElementById('sci-month-slider')?.addEventListener('input', (e) => {
    state.simMonth = Number(e.target.value);
    const maxD = getSolarDaysInMonth(state.simYear, state.simMonth);
    if (state.simDay > maxD) state.simDay = maxD;
    renderScience();
  });

  document.getElementById('sci-day-slider')?.addEventListener('input', (e) => {
    state.simDay = Number(e.target.value);
    renderScience();
  });
}

// 绑定导航与全局事件
function bindEvents() {
  document.querySelectorAll('.nav-tab-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.getAttribute('data-tab');
      setTab(tab);
    });
  });

  document.getElementById('today-btn')?.addEventListener('click', () => {
    const now = new Date();
    state.currentDate = now;
    state.viewYear = now.getFullYear();
    state.viewMonth = now.getMonth() + 1;
    setTab('calendar');
  });

  document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme);
}

// 页面装载入口
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  bindEvents();
  updateThemeIcon();

  // 自动更新页脚版权年份
  const cpYear = document.getElementById('copyright-year');
  if (cpYear) {
    cpYear.textContent = new Date().getFullYear();
  }

  setTab('calendar');
});
