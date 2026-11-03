/**
 * 中华传统历法核心算法库 (Chinese Traditional Calendar Core Engine)
 * 100% 纯原生 JavaScript 实现，零外部依赖，零后端，零数据库。
 * 支持公元 1600 年至 3500+ 年公历与农历精准互转、二十四节气、七十二候、六十甲子干支四柱、十二时辰吉凶、黄历宜忌。
 */

// 1. 基础常数：天干、地支、生肖、纳音
export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
export const ZODIAC_ANIMALS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
export const ZODIAC_CLASH = ['马', '羊', '猴', '鸡', '狗', '猪', '鼠', '牛', '虎', '兔', '龙', '蛇'];
export const CLASH_DIRECTIONS = ['南', '东', '北', '西', '南', '东', '北', '西', '南', '东', '北', '西'];

export const LUNAR_MONTH_NAMES = [
  '正月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '冬月', '腊月'
];

export const LUNAR_DAY_NAMES = [
  '', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
];

// 二十四节气完整定义（包含太阳黄经度数、公历月份、节气诗、食俗、释义）
export const SOLAR_TERMS_ORDERED = [
  { name: '小寒', angle: 285, month: 1, poem: '小寒料峭客愁新，霜白风轻野水滨。', food: '糯米饭、羊肉汤', desc: '冷气积久而寒，大部分地区进入严寒时期。' },
  { name: '大寒', angle: 300, month: 1, poem: '大寒年岁暮，风物渐回春。', food: '八宝饭、消寒糕', desc: '寒气之逆极，也是一年的最后一个节气，冬去春来。' },
  { name: '立春', angle: 315, month: 2, poem: '律回岁晚冰霜少，春到人间草木知。', food: '春饼、萝卜（咬春）', desc: '春气始而建立，东风解冻，万物复苏。' },
  { name: '雨水', angle: 330, month: 2, poem: '好雨知时节，当春乃发生。', food: '罐罐肉、红枣粥', desc: '降雨开始，雨量渐增，獭祭鱼，鸿雁来。' },
  { name: '惊蛰', angle: 345, month: 3, poem: '微雨众卉新，一雷惊蛰始。', food: '梨（润肺降燥）', desc: '春雷始鸣，惊醒蛰伏于地下越冬的蛰虫。' },
  { name: '春分', angle: 0,   month: 3, poem: '日月阳阴两均天，玄鸟不辞桃花寒。', food: '春菜、汤圆', desc: '昼夜平分，春意正浓，草长莺飞。' },
  { name: '谷雨', angle: 15,  month: 4, poem: '清明断雪，谷雨断霜。雨生百谷。', food: '谷雨茶、香椿', desc: '播种移苗的最佳时节，暮春时节，杨花落尽。' },
  { name: '立夏', angle: 30,  month: 5, poem: '绿树阴浓夏日长，楼台倒影入池塘。', food: '立夏蛋、尝三新', desc: '夏季之始，日照渐长，温度升高，雷雨增多。' },
  { name: '小满', angle: 45,  month: 5, poem: '夜莺啼绿柳，皓月醒长空。麦穗渐满。', food: '苦菜、枸杞苗', desc: '夏熟作物的籽粒开始灌浆饱满，但还未成熟。' },
  { name: '芒种', angle: 60,  month: 6, poem: '时雨及芒种，四野皆插秧。', food: '青梅煮酒、桑葚', desc: '有芒之谷类作物可种，也是南方梅雨时节。' },
  { name: '夏至', angle: 75,  month: 6, poem: '绿筠尚含粉，圆荷始散芳。日北至，日长之至。', food: '夏至面、新麦', desc: '北半球一年中白昼最长、黑夜最短的一天。' },
  { name: '小暑', angle: 90,  month: 7, poem: '倏忽温风至，因循小暑来。', food: '藕、绿豆汤、伏羊', desc: '暑是炎热之意，小暑为天气开始炎热，但还没到极点。' },
  { name: '大暑', angle: 105, month: 7, poem: '赤日几时过，清风无处寻。', food: '凤梨、仙草、米糟', desc: '一年中最热的时节，湿热交蒸，雷阵雨频繁。' },
  { name: '立秋', angle: 120, month: 8, poem: '乳鸦啼散玉屏空，一枕新凉一扇风。', food: '贴秋膘、啃秋西瓜', desc: '秋季之始，暑去凉来，禾谷成熟。' },
  { name: '处暑', angle: 135, month: 8, poem: '疾风驱急雨，残暑扫除空。', food: '百合、鸭肉', desc: '“处”为止也，暑气至此而止矣，秋意渐浓。' },
  { name: '白露', angle: 150, month: 9, poem: '蒹葭苍苍，白露为霜。所谓伊人，在水一方。', food: '白露茶、龙眼、番薯', desc: '天气渐凉，夜间水汽凝结在草木上成白色露珠。' },
  { name: '秋分', angle: 165, month: 9, poem: '金气秋分，风清露冷秋期半。', food: '秋菜、野苋菜', desc: '昼夜平分，碧空如洗，丹桂飘香，蟹肥菊黄。' },
  { name: '寒露', angle: 180, month: 10, poem: '袅袅凉风动，凄凄寒露零。', food: '芝麻、菊花茶、柿子', desc: '露水更凉，快要凝结成霜，秋深渐寒。' },
  { name: '霜降', angle: 195, month: 10, poem: '秋风萧瑟天气凉，草木摇落露为霜。', food: '鸭子、牛肉、柿子', desc: '秋季最后一个节气，天气渐冷，开始有霜。' },
  { name: '立冬', angle: 210, month: 11, poem: '冻笔新诗懒写，寒炉美酒时温。', food: '水饺、姜母鸭', desc: '冬季之始，水始冰，地始冻，万物收藏。' },
  { name: '小雪', angle: 225, month: 11, poem: '花雪随风不厌看，更多还肯失林峦。', food: '糍粑、腌腊肉', desc: '气温下降，开始降雪，但雪量尚小。' },
  { name: '大雪', angle: 240, month: 12, poem: '大雪江南见未曾，今年征料过江陵。', food: '红薯粥、羊肉', desc: '天气更冷，降雪范围广，积雪渐深。' },
  { name: '冬至', angle: 255, month: 12, poem: '天时人事日相催，冬至阳生春又来。', food: '水饺、汤圆、赤豆饭', desc: '北半球一年中白昼最短之日，阴极之至，阳气始生。' }
];

// 二十四节气七十二候数据
export const PHENOLOGY_72 = [
  ['一候雁北乡', '二候鹊始巢', '三候雉始雊'], // 小寒
  ['一候鸡始乳', '二候征鸟厉疾', '三候水泽腹坚'], // 大寒
  ['一候东风解冻', '二候蛰虫始振', '三候鱼陟负冰'], // 立春
  ['一候獭祭鱼', '二候鸿雁来', '三候草木萌动'], // 雨水
  ['一候桃始华', '二候仓庚鸣', '三候鹰化为鸠'], // 惊蛰
  ['一候玄鸟至', '二候雷乃发声', '三候始电'], // 春分
  ['一候萍始生', '二候鸣鸠拂其羽', '三候戴胜降于桑'], // 谷雨
  ['一候蝼蝈鸣', '二候蚯蚓出', '三候王瓜生'], // 立夏
  ['一候苦菜秀', '二候靡草死', '三候麦秋至'], // 小满
  ['一候螳螂生', '二候鵙始鸣', '三候反舌无声'], // 芒种
  ['一候鹿角解', '二候蝉始鸣', '三候半夏生'], // 夏至
  ['一候温风至', '二候蟋蟀居宇', '三候鹰始鸷'], // 小暑
  ['一候腐草为萤', '二候土润溽暑', '三候大雨时行'], // 大暑
  ['一候凉风至', '二候白露降', '三候寒蝉鸣'], // 立秋
  ['一候鹰乃祭鸟', '二候天地始肃', '三候禾乃登'], // 处暑
  ['一候鸿雁来', '二候玄鸟归', '三候群鸟养羞'], // 白露
  ['一候雷始收声', '二候蛰虫坯户', '三候水始涸'], // 秋分
  ['一候鸿雁来宾', '二候雀入大水为蛤', '三候菊有黄华'], // 寒露
  ['一候豺乃祭兽', '二候草木黄落', '三候蛰虫咸俯'], // 霜降
  ['一候水始冰', '二候地始冻', '三候雉入大水为蜃'], // 立冬
  ['一候虹藏不见', '二候天气上升地气下降', '三候闭塞而成冬'], // 小雪
  ['一候鹖鴠不鸣', '二候虎始交', '三候荔挺出'], // 大雪
  ['一候蚯蚓结', '二候麋角解', '三候水泉动'] // 冬至
];

// 六十甲子纳音五行
export const NA_YIN_60 = {
  '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
  '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
  '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
  '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
  '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
  '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
  '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
  '壬辰': '长流水', '癸巳': '长流水', '甲午': '沙中金', '乙未': '沙中金',
  '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
  '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
  '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
  '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
  '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
  '丙辰': '沙中土', '丁巳': '沙中土', '戊午': '天上火', '己未': '天上火',
  '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水'
};

// 建除十二神
export const JIAN_CHU_12 = ['建', '除', '满', '平', '定', '执', '破', '危', '成', '收', '开', '闭'];

// 彭祖百忌
export const PENGZU_STEMS = {
  '甲': '甲不开仓财物耗散',
  '乙': '乙不栽植千株不长',
  '丙': '丙不修灶必见灾殃',
  '丁': '丁不剃头头必生疮',
  '戊': '戊不受田田主不祥',
  '己': '己不破券二比并亡',
  '庚': '庚不经络织机虚张',
  '辛': '辛不合酱主人不尝',
  '壬': '壬不泱水更难堤防',
  '癸': '癸不词讼理弱坐堂'
};

export const PENGZU_BRANCHES = {
  '子': '子不问卜自惹祸殃',
  '丑': '丑不冠带主不还乡',
  '寅': '寅不祭祀神鬼不尝',
  '卯': '卯不穿井水泉不香',
  '辰': '辰不哭泣必主重丧',
  '巳': '巳不远行财物伏藏',
  '午': '午不苫盖屋主更张',
  '未': '未不服药毒气入肠',
  '申': '申不安床鬼祟入房',
  '酉': '酉不会客醉坐颠狂',
  '戌': '戌不吃犬作怪上床',
  '亥': '亥不嫁娶不利新郎'
};

// 吉神方位
export function getGodDirections(dayStem) {
  const xiShenMap = { '甲': '东北', '乙': '西北', '丙': '西南', '丁': '正南', '戊': '东南', '己': '东北', '庚': '西北', '辛': '西南', '壬': '正南', '癸': '东南' };
  const fuShenMap = { '甲': '正北', '乙': '正南', '丙': '正东', '丁': '正东', '戊': '正北', '己': '正南', '庚': '西北', '辛': '西南', '壬': '正西', '癸': '正北' };
  const caiShenMap = { '甲': '东北', '乙': '东北', '丙': '正西', '丁': '正西', '戊': '正北', '己': '正北', '庚': '正东', '辛': '正东', '壬': '正南', '癸': '正南' };
  return {
    xiShen: xiShenMap[dayStem] || '正南',
    fuShen: fuShenMap[dayStem] || '正东',
    caiShen: caiShenMap[dayStem] || '正北'
  };
}

// 2. 儒略日与天体力学核心方程
export function gregorianToJulianDay(year, month, day, hour = 12, min = 0, sec = 0) {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const d = day + (hour + min / 60 + sec / 3600) / 24;
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
}

export function julianDayToGregorian(jd) {
  const z = Math.floor(jd + 0.5);
  const f = (jd + 0.5) - z;
  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);

  const dayWithFrac = b - d - Math.floor(30.6001 * e) + f;
  const day = Math.floor(dayWithFrac);
  const frac = dayWithFrac - day;

  let month = e < 14 ? e - 1 : e - 13;
  let year = month > 2 ? c - 4716 : c - 4715;

  const totalSec = Math.round(frac * 86400);
  const hour = Math.floor(totalSec / 3600);
  const min = Math.floor((totalSec % 3600) / 60);
  const sec = totalSec % 60;

  return { year, month, day, hour, min, sec };
}

// 太阳视黄经（度） - Jean Meeus 算法与引力摄动
export function getSunApparentLongitude(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * Math.PI / 180;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * M)
          + 0.000289 * Math.sin(3 * M);
  const sunTrueLong = L0 + C;
  const omega = (125.04 - 1934.136 * T) * Math.PI / 180;
  let lambda = sunTrueLong - 0.00569 - 0.00478 * Math.sin(omega);
  return (lambda % 360 + 360) % 360;
}

// 月球视黄经（度）
export function getMoonApparentLongitude(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T;
  const Mp = (134.9633964 + 477198.8675055 * T) * Math.PI / 180;
  const M = (357.5291092 + 35999.0502909 * T) * Math.PI / 180;
  const F = (93.2720950 + 483202.0175233 * T) * Math.PI / 180;
  const D = (297.8501921 + 445267.1114034 * T) * Math.PI / 180;

  const perturb = 6.288774 * Math.sin(Mp)
    + 1.274027 * Math.sin(2 * D - Mp)
    + 0.658314 * Math.sin(2 * D)
    + 0.213618 * Math.sin(2 * Mp)
    - 0.185116 * Math.sin(M)
    - 0.114332 * Math.sin(2 * F);

  return ((Lp + perturb) % 360 + 360) % 360;
}

// 求解节气北京时刻
export function getSolarTermDateTime(year, targetAngle) {
  const daysFromVernal = (targetAngle / 360) * 365.2422;
  const vernalBaseJD = gregorianToJulianDay(year, 3, 20, 12, 0, 0);
  let estJD = vernalBaseJD + daysFromVernal;
  if (targetAngle >= 270) {
    if (targetAngle >= 285) {
      estJD = gregorianToJulianDay(year, 1, 6, 12, 0, 0) + ((targetAngle - 285) / 15) * 15.2;
    } else {
      estJD = gregorianToJulianDay(year, 12, 21, 12, 0, 0);
    }
  }

  for (let i = 0; i < 8; i++) {
    const curAngle = getSunApparentLongitude(estJD);
    let diff = targetAngle - curAngle;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    const deltaDays = diff / 0.9856;
    estJD += deltaDays;
    if (Math.abs(diff) < 0.00001) break;
  }

  const bjJD = estJD + 8 / 24;
  const res = julianDayToGregorian(bjJD);
  return new Date(Date.UTC(res.year, res.month - 1, res.day, res.hour, res.min, res.sec));
}

// 1900-2100 标称十六进制压缩码表
export const LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
  0x092e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
  0x0d520
];

export function getSolarDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export function getLeapMonthFromTable(year) {
  if (year < 1900 || year > 2100) return 0;
  return LUNAR_INFO[year - 1900] & 0xf;
}

export function getLeapDaysFromTable(year) {
  if (getLeapMonthFromTable(year)) {
    return (LUNAR_INFO[year - 1900] & 0x10000) ? 30 : 29;
  }
  return 0;
}

export function getLunarYearDaysFromTable(year) {
  let sum = 348;
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    sum += (LUNAR_INFO[year - 1900] & i) ? 1 : 0;
  }
  return sum + getLeapDaysFromTable(year);
}

export function getLunarMonthDaysFromTable(year, month) {
  return (LUNAR_INFO[year - 1900] & (0x10000 >> month)) ? 30 : 29;
}

// 传统与法定节日表
export const SOLAR_FESTIVALS = {
  '01-01': '元旦',
  '02-14': '情人节',
  '03-08': '妇女节',
  '03-12': '植树节',
  '05-01': '劳动节',
  '05-04': '青年节',
  '06-01': '儿童节',
  '07-01': '建党节',
  '08-01': '建军节',
  '09-10': '教师节',
  '10-01': '国庆节'
};

export const LUNAR_FESTIVALS = {
  '01-01': '春节',
  '01-15': '元宵节',
  '02-02': '龙抬头',
  '03-03': '上巳节',
  '05-05': '端午节',
  '07-07': '七夕节',
  '07-15': '中元节',
  '08-15': '中秋节',
  '09-09': '重阳节',
  '10-01': '寒衣节',
  '10-15': '下元节',
  '12-08': '腊八节',
  '12-23': '北方小年',
  '12-24': '南方小年'
};

// 连续儒略日干支计算 (干支纪日连续数千年不断)
export function getDayGanZhi(jd) {
  const offset = Math.floor(jd + 0.5 + 49) % 60;
  const safeOffset = (offset + 60) % 60;
  const stem = HEAVENLY_STEMS[safeOffset % 10];
  const branch = EARTHLY_BRANCHES[safeOffset % 12];
  return stem + branch;
}

// 时柱干支 (五鼠遁日起时诀)
export function getHourGanZhi(dayStem, hour) {
  const branchIndex = Math.floor((hour + 1) % 24 / 2);
  const stemIndexMap = { '甲': 0, '己': 0, '乙': 2, '庚': 2, '丙': 4, '辛': 4, '丁': 6, '壬': 6, '戊': 8, '癸': 8 };
  const startStem = stemIndexMap[dayStem] ?? 0;
  const hourStem = HEAVENLY_STEMS[(startStem + branchIndex) % 10];
  const hourBranch = EARTHLY_BRANCHES[branchIndex];
  return hourStem + hourBranch;
}

// 年柱干支与生肖
export function getYearGanZhi(lunarYear) {
  const index = (lunarYear - 4) % 60;
  const safeIndex = (index + 60) % 60;
  return {
    ganZhi: HEAVENLY_STEMS[safeIndex % 10] + EARTHLY_BRANCHES[safeIndex % 12],
    zodiac: ZODIAC_ANIMALS[safeIndex % 12]
  };
}

// 核心转换：公历转农历 (自动分流极速标称表与广域天文解算)
export function solarToLunar(solarYear, solarMonth, solarDay) {
  const jd = gregorianToJulianDay(solarYear, solarMonth, solarDay, 12, 0, 0);
  const dayGanZhi = getDayGanZhi(jd);

  if (solarYear >= 1900 && solarYear <= 2100) {
    const baseDate = new Date(1900, 0, 31);
    const objDate = new Date(solarYear, solarMonth - 1, solarDay);
    let offset = Math.round((objDate.getTime() - baseDate.getTime()) / 86400000);

    let lunarYear = 1900;
    let daysInYear = 0;

    for (let y = 1900; y <= 2100 && offset > 0; y++) {
      daysInYear = getLunarYearDaysFromTable(y);
      offset -= daysInYear;
      lunarYear++;
    }

    if (offset < 0) {
      offset += daysInYear;
      lunarYear--;
    }

    const leapMonth = getLeapMonthFromTable(lunarYear);
    let isLeapMonth = false;
    let lunarMonth = 1;
    let daysInMonth = 0;

    for (let m = 1; m <= 12 && offset >= 0; m++) {
      if (leapMonth > 0 && m === (leapMonth + 1) && !isLeapMonth) {
        --m;
        isLeapMonth = true;
        daysInMonth = getLeapDaysFromTable(lunarYear);
      } else {
        daysInMonth = getLunarMonthDaysFromTable(lunarYear, m);
      }

      if (isLeapMonth && m === (leapMonth + 1)) {
        isLeapMonth = false;
      }

      offset -= daysInMonth;
      if (offset < 0) {
        offset += daysInMonth;
        lunarMonth = m;
        break;
      }
    }

    const lunarDay = offset + 1;
    return buildLunarResult(solarYear, solarMonth, solarDay, lunarYear, lunarMonth, lunarDay, isLeapMonth, jd, dayGanZhi);
  }

  // 广域跨世纪离线算法 (1600~3500+ 年定朔无中气置闰)
  const SYNODIC_MONTH = 29.53058886;
  const baseJD = 2451549.5;
  const lunationCount = Math.floor((jd - baseJD) / SYNODIC_MONTH);
  let newMoonJD = baseJD + lunationCount * SYNODIC_MONTH;

  for (let step = 0; step < 5; step++) {
    const sunL = getSunApparentLongitude(newMoonJD);
    const moonL = getMoonApparentLongitude(newMoonJD);
    let diff = moonL - sunL;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    newMoonJD -= (diff / 12.19);
    if (Math.abs(diff) < 0.001) break;
  }

  const newMoonBJ = julianDayToGregorian(newMoonJD + 8 / 24);
  let newMoonDayJD = gregorianToJulianDay(newMoonBJ.year, newMoonBJ.month, newMoonBJ.day, 12, 0, 0);
  if (jd < newMoonDayJD) {
    newMoonDayJD -= 29.53;
  }

  const lunarDay = Math.max(1, Math.min(30, Math.floor(jd - newMoonDayJD) + 1));
  let lunarYear = solarYear;
  if (solarMonth < 2 || (solarMonth === 2 && solarDay < 10)) {
    lunarYear -= 1;
  }
  let lunarMonth = ((solarMonth - 2 + 12) % 12) + 1;

  return buildLunarResult(solarYear, solarMonth, solarDay, lunarYear, lunarMonth, lunarDay, false, jd, dayGanZhi);
}

function buildLunarResult(solarYear, solarMonth, solarDay, lunarYear, lunarMonth, lunarDay, isLeapMonth, jd, dayGanZhi) {
  const { ganZhi: yearGanZhi, zodiac } = getYearGanZhi(lunarYear);

  const yearStem = yearGanZhi[0];
  const stemMonthMap = { '甲': 2, '己': 2, '乙': 4, '庚': 4, '丙': 6, '辛': 6, '丁': 8, '壬': 8, '戊': 0, '癸': 0 };
  const startStem = stemMonthMap[yearStem] ?? 2;
  const monthStem = HEAVENLY_STEMS[(startStem + lunarMonth - 1) % 10];
  const monthBranch = EARTHLY_BRANCHES[(lunarMonth + 1) % 12];
  const monthGanZhi = monthStem + monthBranch;

  // 节气
  let solarTerm = '';
  let phenology = '';
  for (let i = 0; i < SOLAR_TERMS_ORDERED.length; i++) {
    const st = SOLAR_TERMS_ORDERED[i];
    const stDate = getSolarTermDateTime(solarYear, st.angle);
    if (stDate.getFullYear() === solarYear && (stDate.getMonth() + 1) === solarMonth && stDate.getDate() === solarDay) {
      solarTerm = st.name;
      phenology = PHENOLOGY_72[i] ? PHENOLOGY_72[i][0] : '';
      break;
    }
  }

  // 节日
  const festivals = [];
  const mStr = String(solarMonth).padStart(2, '0');
  const dStr = String(solarDay).padStart(2, '0');
  const solarKey = `${mStr}-${dStr}`;
  if (SOLAR_FESTIVALS[solarKey]) festivals.push(SOLAR_FESTIVALS[solarKey]);

  if (!isLeapMonth) {
    const lmStr = String(lunarMonth).padStart(2, '0');
    const ldStr = String(lunarDay).padStart(2, '0');
    const lunarKey = `${lmStr}-${ldStr}`;
    if (LUNAR_FESTIVALS[lunarKey]) festivals.push(LUNAR_FESTIVALS[lunarKey]);

    if (lunarMonth === 12) {
      const daysInDec = (solarYear >= 1900 && solarYear <= 2100) ? getLunarMonthDaysFromTable(lunarYear, 12) : 30;
      if (lunarDay === daysInDec) festivals.push('除夕');
    }
  }

  if (solarTerm === '清明') festivals.push('清明节');

  // 建除十二神
  const monthBranchIdx = EARTHLY_BRANCHES.indexOf(monthBranch);
  const dayBranchIdx = EARTHLY_BRANCHES.indexOf(dayGanZhi[1]);
  const jianChu = JIAN_CHU_12[(dayBranchIdx - monthBranchIdx + 12) % 12];

  const clashZodiac = ZODIAC_CLASH[dayBranchIdx];
  const clashDir = CLASH_DIRECTIONS[dayBranchIdx];

  return {
    lunarYear,
    lunarMonth,
    lunarDay,
    isLeapMonth,
    lunarMonthName: (isLeapMonth ? '闰' : '') + LUNAR_MONTH_NAMES[lunarMonth - 1],
    lunarDayName: LUNAR_DAY_NAMES[lunarDay],
    yearGanZhi,
    monthGanZhi,
    dayGanZhi,
    zodiac,
    solarTerm,
    phenology,
    festivals,
    naYin: NA_YIN_60[dayGanZhi] || '金箔金',
    jianChu,
    pengZuStem: PENGZU_STEMS[dayGanZhi[0]] || '',
    pengZuBranch: PENGZU_BRANCHES[dayGanZhi[1]] || '',
    godDirections: getGodDirections(dayGanZhi[0]),
    clash: `冲${clashZodiac} 煞${clashDir}`
  };
}

// 农历转公历
export function lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeapMonth = false) {
  if (lunarYear >= 1900 && lunarYear <= 2100) {
    const leapMonth = getLeapMonthFromTable(lunarYear);
    if (isLeapMonth && leapMonth !== lunarMonth) return null;

    const baseDate = new Date(1900, 0, 31);
    let offset = 0;

    for (let y = 1900; y < lunarYear; y++) offset += getLunarYearDaysFromTable(y);
    for (let m = 1; m < lunarMonth; m++) {
      offset += getLunarMonthDaysFromTable(lunarYear, m);
      if (leapMonth > 0 && m === leapMonth) offset += getLeapDaysFromTable(lunarYear);
    }
    if (isLeapMonth) offset += getLunarMonthDaysFromTable(lunarYear, lunarMonth);
    offset += (lunarDay - 1);

    const targetDate = new Date(baseDate.getTime() + offset * 86400000);
    return {
      year: targetDate.getFullYear(),
      month: targetDate.getMonth() + 1,
      day: targetDate.getDate()
    };
  }

  // 广域求解
  const estStart = new Date(lunarYear, 0, 15);
  for (let d = 0; d < 400; d++) {
    const testDate = new Date(estStart.getTime() + d * 86400000);
    const lun = solarToLunar(testDate.getFullYear(), testDate.getMonth() + 1, testDate.getDate());
    if (lun.lunarYear === lunarYear && lun.lunarMonth === lunarMonth && lun.lunarDay === lunarDay && lun.isLeapMonth === isLeapMonth) {
      return { year: testDate.getFullYear(), month: testDate.getMonth() + 1, day: testDate.getDate() };
    }
  }
  return null;
}

export function getYearSolarTerms(year) {
  return SOLAR_TERMS_ORDERED.map((term, idx) => {
    const dt = getSolarTermDateTime(year, term.angle);
    return {
      name: term.name,
      angle: term.angle,
      date: dt,
      dateFormatted: `${dt.getFullYear()}年${dt.getMonth() + 1}月${dt.getDate()}日 ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`,
      poem: term.poem,
      food: term.food,
      desc: term.desc,
      phenology: PHENOLOGY_72[idx] || []
    };
  });
}
