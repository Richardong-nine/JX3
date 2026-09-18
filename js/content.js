(() => {
'use strict';

const ALLOWED_CHAPTER_TYPES = new Set(['single', 'multi', 'couple']);
const IMAGE_POSITION_PATTERN = /^(left|center|right)\s+(top|center|bottom)$/;

const siteContent = {
  title: '剑网3 · 130级纪念',
  level: 130,
  subtitle: '山河仍在，故人仍在',
  hero: {
    groupImage: null,
    mobilePosition: 'center center',
    desktopPosition: 'center center'
  },
  chapters: [
    {
      id: 'sansetuanzhi',
      type: 'single',
      enabled: true,
      label: '故人录',
      people: [{
        id: 'friend-sansetuanzi',
        roles: [{
          id: 'role-sansetuanzi',
          name: '三色团子',
          faction: '万花',
          intro: '这一身装束，也是一段被留住的江湖。',
          image: {
            src: './image/三色团子.png',
            alt: '三色团子的万花角色立绘',
            position: 'center top'
          },
          representative: true
        }]
      }]
    },
    {
      id: 'tangwuyue',
      type: 'single',
      enabled: true,
      label: '故人录',
      people: [{
        id: 'friend-tangwuyue',
        roles: [{
          id: 'role-tangwuyue',
          name: '唐无岳',
          faction: '唐门',
          intro: '机括无声，旧日并肩的片刻却仍清晰如初。',
          image: {
            src: './image/唐无岳.png',
            alt: '唐无岳的唐门角色立绘',
            position: 'center top'
          },
          representative: true
        }]
      }]
    },
    {
      id: 'jiaogao',
      type: 'single',
      enabled: true,
      label: '故人录',
      people: [{
        id: 'friend-jiaogao',
        roles: [{
          id: 'role-jiaogao',
          name: '蕉糕',
          faction: '五毒',
          intro: '银白衣影从旧日截图中走来，仍像第一次相逢。',
          image: {
            src: './image/蕉糕.jpg',
            alt: '蕉糕的五毒角色截图',
            position: 'center top'
          },
          representative: true
        }]
      }]
    },
    {
      id: 'luoxueyiqing',
      type: 'single',
      enabled: true,
      label: '故人录',
      people: [{
        id: 'friend-luoxueyiqing',
        roles: [{
          id: 'role-luoxueyiqing',
          name: '落雪依情',
          faction: '丐帮',
          intro: '风雪落定，仍有一身侠气留在共同走过的路上。',
          image: {
            src: './image/落雪依情.png',
            alt: '落雪依情的丐帮角色立绘',
            position: 'center top'
          },
          representative: true
        }]
      }]
    },
    {
      id: 'qianyueyuan',
      type: 'single',
      enabled: true,
      label: '故人录',
      people: [{
        id: 'friend-qianyueyuan',
        roles: [{
          id: 'role-qianyueyuan',
          name: '千月渊',
          faction: '天策',
          intro: '月色落在衣袂之间，也落进共同走过的年月。',
          image: {
            src: './image/千月渊.png',
            alt: '千月渊的天策角色立绘',
            position: 'center top'
          },
          representative: true
        }]
      }]
    },
    {
      id: 'weiwei-guangzhu',
      type: 'couple',
      enabled: true,
      label: '双人共同章',
      people: [
        {
          id: 'friend-weiweiliangdeguangzhu',
          roles: [{
            id: 'role-weiweiliangdeguangzhu',
            name: '微微凉的广筑',
            faction: '七秀',
            intro: '名字彼此呼应，同行的身影也被留在同一段江湖里。',
            image: {
              src: './image/微微凉的广筑.png',
              alt: '微微凉的广筑的七秀角色立绘',
              position: 'center top'
            },
            representative: true
          }]
        },
        {
          id: 'friend-guangzhudeweiweiliang',
          roles: [{
            id: 'role-guangzhudeweiweiliang',
            name: '广筑的微微凉',
            faction: '唐门',
            intro: '从相遇到并肩，两个人的故事在这一章汇成同一条路。',
            image: {
              src: './image/广筑的微微凉.png',
              alt: '广筑的微微凉的唐门角色立绘',
              position: 'center top'
            },
            representative: true
          }]
        }
      ]
    }
  ]
};

function validateSiteContent(content) {
  const errors = [];
  const chapterIds = new Set();
  const personIds = new Set();
  const roleIds = new Set();

  if (!content || typeof content !== 'object') {
    return ['site content must be an object'];
  }
  if (!String(content.title ?? '').trim()) errors.push('site title is required');
  if (!Number.isFinite(content.level)) errors.push('site level must be a number');
  if (!Array.isArray(content.chapters)) return [...errors, 'chapters must be an array'];

  for (const chapter of content.chapters) {
    if (!chapter || typeof chapter !== 'object') {
      errors.push('each chapter must be an object');
      continue;
    }
    if (!String(chapter.id ?? '').trim()) {
      errors.push('chapter id is required');
    } else if (chapterIds.has(chapter.id)) {
      errors.push(`duplicate chapter id: ${chapter.id}`);
    } else {
      chapterIds.add(chapter.id);
    }

    if (!ALLOWED_CHAPTER_TYPES.has(chapter.type)) {
      errors.push(`invalid chapter type: ${chapter.type}`);
    }

    const people = Array.isArray(chapter.people) ? chapter.people : [];
    if (!Array.isArray(chapter.people)) errors.push(`chapter ${chapter.id} people must be an array`);
    if (chapter.type === 'couple' && people.length !== 2) {
      errors.push(`couple chapter ${chapter.id} must contain exactly two people`);
    }
    if ((chapter.type === 'single' || chapter.type === 'multi') && people.length !== 1) {
      errors.push(`${chapter.type} chapter ${chapter.id} must contain exactly one person`);
    }

    const enabledRoleCount = people.flatMap((person) => person.roles ?? []).filter((role) => role.enabled !== false).length;
    if (chapter.enabled !== false && enabledRoleCount === 0) {
      errors.push(`enabled chapter ${chapter.id} must contain at least one enabled role`);
    }

    for (const person of people) {
      if (!String(person?.id ?? '').trim()) {
        errors.push(`chapter ${chapter.id} has a person without an id`);
      } else if (personIds.has(person.id)) {
        errors.push(`duplicate person id: ${person.id}`);
      } else {
        personIds.add(person.id);
      }

      if (!Array.isArray(person?.roles)) {
        errors.push(`person ${person?.id ?? 'unknown'} roles must be an array`);
        continue;
      }

      for (const role of person.roles) {
        const prefix = `role ${role?.id ?? 'unknown'}`;
        if (!String(role?.id ?? '').trim()) {
          errors.push('role id is required');
        } else if (roleIds.has(role.id)) {
          errors.push(`duplicate role id: ${role.id}`);
        } else {
          roleIds.add(role.id);
        }

        for (const field of ['name', 'faction', 'intro']) {
          if (!String(role?.[field] ?? '').trim()) errors.push(`${prefix} ${field} is required`);
        }
        if (!String(role?.image?.src ?? '').trim()) errors.push(`${prefix} image src is required`);
        if (!String(role?.image?.alt ?? '').trim()) errors.push(`${prefix} image alt is required`);
        if (!IMAGE_POSITION_PATTERN.test(String(role?.image?.position ?? ''))) {
          errors.push(`${prefix} image position is invalid`);
        }
      }
    }
  }

  return errors;
}

globalThis.JX3Content = Object.freeze({ siteContent, validateSiteContent });
})();
