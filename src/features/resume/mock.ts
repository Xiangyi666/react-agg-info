import type { Resume, ResumeData } from './types'

/**
 * 本地 mock 数据：形状与 reactive-resume 的 sample.ts 一致（中文精简版），
 * 用于后端接口就绪前联调编辑器。USE_MOCK 关闭后不再参与打包逻辑。
 */

const data: ResumeData = {
  "picture": {
    "hidden": true,
    "fit": "cover",
    "url": "",
    "size": 80,
    "rotation": 0,
    "aspectRatio": 1,
    "borderRadius": 0,
    "borderColor": "rgba(137,137,137,0.5)",
    "borderWidth": 0,
    "shadowColor": "rgba(0,0,0,0.5)",
    "shadowWidth": 0
  },
  "basics": {
    "name": "L an",
    "headline": "机械工程师 · 电池设计 / 电芯设计 / 成本控制",
    "email": "",
    "phone": "",
    "location": "上海",
    "website": {
      "url": "",
      "label": ""
    },
    "customFields": []
  },
  "summary": {
    "title": "个人总结",
    "icon": "article",
    "columns": 1,
    "hidden": false,
    "showHeading": true,
    "keepTogether": false,
    "startOnNewPage": false,
    "content": "机械工程师，英国布里斯托大学本硕背景（2015-2020），2021年加入SLB，现居上海。主要负责井下电池的电芯设计及电池产线相关设计工作。具备成本控制与供应商整合经验，曾通过减少2家供应商、推动核心部件自研的方式有效降低电池成本。"
  },
  "sections": {
    "profiles": {
      "title": "社交资料",
      "icon": "",
      "columns": 1,
      "hidden": true,
      "showHeading": true,
      "keepTogether": false,
      "startOnNewPage": false,
      "items": []
    },
    "experience": {
      "title": "工作经历",
      "icon": "",
      "columns": 1,
      "hidden": false,
      "showHeading": true,
      "keepTogether": false,
      "startOnNewPage": false,
      "items": [
        {
          "id": "exp-1",
          "hidden": false,
          "company": "SLB",
          "position": "机械工程师",
          "location": "上海",
          "period": "2021 - 至今",
          "website": {
            "url": "",
            "label": "",
            "inlineLink": false
          },
          "description": "- 负责井下电池的电芯设计工作\n- 在电池产线负责电池设计相关工作\n- 通过减少2家供应商、转为自研的方式降低电池成本",
          "roles": []
        }
      ]
    },
    "education": {
      "title": "教育背景",
      "icon": "",
      "columns": 1,
      "hidden": false,
      "showHeading": true,
      "keepTogether": false,
      "startOnNewPage": false,
      "items": [
        {
          "id": "edu-1",
          "hidden": false,
          "school": "布里斯托大学（University of Bristol）",
          "degree": "硕士",
          "area": "",
          "grade": "",
          "location": "英国布里斯托",
          "period": "2020",
          "website": {
            "url": "",
            "label": "",
            "inlineLink": false
          },
          "description": ""
        },
        {
          "id": "edu-2",
          "hidden": false,
          "school": "布里斯托大学（University of Bristol）",
          "degree": "本科",
          "area": "",
          "grade": "",
          "location": "英国布里斯托",
          "period": "",
          "website": {
            "url": "",
            "label": "",
            "inlineLink": false
          },
          "description": ""
        }
      ]
    },
    "projects": {
      "title": "项目经历",
      "icon": "",
      "columns": 1,
      "hidden": false,
      "showHeading": true,
      "keepTogether": false,
      "startOnNewPage": false,
      "items": []
    },
    "skills": {
      "title": "专业技能",
      "icon": "",
      "columns": 1,
      "layout": "default",
      "keywordLayout": "inline",
      "hidden": false,
      "showHeading": true,
      "keepTogether": false,
      "startOnNewPage": false,
      "items": [
        {
          "id": "sk-1",
          "hidden": false,
          "icon": "",
          "iconColor": "",
          "name": "电池设计",
          "proficiency": "熟练",
          "level": 4,
          "keywords": [
            "电池设计",
            "电芯设计",
            "井下电池"
          ]
        },
        {
          "id": "sk-2",
          "hidden": false,
          "icon": "",
          "iconColor": "",
          "name": "机械工程",
          "proficiency": "熟练",
          "level": 4,
          "keywords": [
            "机械工程",
            "机械设计"
          ]
        },
        {
          "id": "sk-3",
          "hidden": false,
          "icon": "",
          "iconColor": "",
          "name": "成本与供应链管理",
          "proficiency": "熟练",
          "level": 4,
          "keywords": [
            "成本控制",
            "供应商整合",
            "自研开发"
          ]
        }
      ]
    },
    "languages": {
      "title": "语言能力",
      "icon": "",
      "columns": 1,
      "hidden": false,
      "showHeading": true,
      "keepTogether": false,
      "startOnNewPage": false,
      "items": []
    },
    "interests": {
      "title": "兴趣爱好",
      "icon": "",
      "columns": 1,
      "hidden": false,
      "showHeading": true,
      "keepTogether": false,
      "startOnNewPage": false,
      "items": []
    },
    "awards": {
      "title": "荣誉奖项",
      "icon": "",
      "columns": 1,
      "hidden": false,
      "showHeading": true,
      "keepTogether": false,
      "startOnNewPage": false,
      "items": []
    },
    "certifications": {
      "title": "证书认证",
      "icon": "",
      "columns": 1,
      "hidden": false,
      "showHeading": true,
      "keepTogether": false,
      "startOnNewPage": false,
      "items": []
    },
    "publications": {
      "title": "出版物",
      "icon": "",
      "columns": 1,
      "hidden": false,
      "showHeading": true,
      "keepTogether": false,
      "startOnNewPage": false,
      "items": []
    },
    "volunteer": {
      "title": "志愿经历",
      "icon": "",
      "columns": 1,
      "hidden": false,
      "showHeading": true,
      "keepTogether": false,
      "startOnNewPage": false,
      "items": []
    },
    "references": {
      "title": "推荐人",
      "icon": "",
      "columns": 1,
      "hidden": false,
      "showHeading": true,
      "keepTogether": false,
      "startOnNewPage": false,
      "items": []
    }
  },
  "customSections": [],
  "metadata": {
    "template": "onyx",
    "layout": {
      "sidebarWidth": 32,
      "pages": [
        {
          "fullWidth": false,
          "main": [
            "summary",
            "experience",
            "education",
            "projects",
            "skills",
            "languages"
          ],
          "sidebar": []
        }
      ]
    },
    "page": {
      "gapX": 4,
      "gapY": 6,
      "marginX": 14,
      "marginY": 12,
      "format": "a4",
      "locale": "zh-CN",
      "dateFormat": "short",
      "hideLinkUnderline": false,
      "hideIcons": false,
      "hideSectionIcons": true
    },
    "design": {
      "colors": {
        "primary": "rgba(175,175,175,1)",
        "text": "rgba(0,0,0,1)",
        "background": "rgba(255,255,255,1)"
      },
      "level": {
        "icon": "star",
        "type": "circle"
      }
    },
    "typography": {
      "body": {
        "fontFamily": "IBM Plex Serif",
        "fontWeights": [
          "400"
        ],
        "fontSize": 10,
        "lineHeight": 1.5
      },
      "heading": {
        "fontFamily": "IBM Plex Serif",
        "fontWeights": [
          "600"
        ],
        "fontSize": 14,
        "lineHeight": 1.5
      }
    },
    "notes": "",
    "styleRules": []
  }
}

/** 构造一份 mock 简历；任意 userId 都返回同一份数据。 */
export function createMockResume(userId: string): Resume {
  const now = new Date().toISOString()
  return {
    id: userId,
    name: '我的中文简历',
    slug: 'my-resume',
    tags: ['默认'],
    data,
    isLocked: false,
    createdAt: now,
    updatedAt: now,
  }
}
