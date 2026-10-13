import type { Resume, ResumeData, ResumeResponse } from './types'
import { parseResumeData } from './schema'
import { createMockResume } from './mock'
import { http } from '@/services/api'

/**
 * 简历数据访问层。数据源最终是服务端，接口契约：
 *
 *   GET /api/resume/:id                 → ApiResponse<Resume>          读取简历
 *   PUT /api/resume/:id                 body { data: ResumeData }
 *                                       → ApiResponse<Resume>          整份保存（自动保存调用）
 *
 * 后端未就绪时走 USE_MOCK，与 mainSearch 的开关模式一致；
 * 服务端 data 字段会经过 parseResumeData 归一化，缺失字段补默认值。
 */

// 后端未就绪时的本地 mock 开关：真实接口可用后改成 false 即可
const USE_MOCK = true

// 模拟网络延迟，让加载态与保存状态肉眼可见
const MOCK_LATENCY_MS = 300

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** 读取一份简历。失败（网络错 / HttpError）一律抛出，由调用方承接。 */
export async function fetchResume(resumeId: string, signal?: AbortSignal): Promise<Resume> {
  if (USE_MOCK) {
    await sleep(MOCK_LATENCY_MS)
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    return createMockResume(resumeId)
  }

  const response = await http.get<ResumeResponse>(`/resume/${resumeId}`, { signal })
  return normalizeResume(response.data)
}

/** 保存整份简历 JSON（自动保存与手动重试都走这里），返回服务端回显的简历。 */
export async function saveResume(resumeId: string, data: ResumeData, signal?: AbortSignal): Promise<Resume> {
  if (USE_MOCK) {
    await sleep(MOCK_LATENCY_MS)
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    const mocked = createMockResume(resumeId)
    // 回显提交的数据，只更新服务端拥有的元数据字段
    return { ...mocked, data, updatedAt: new Date().toISOString() }
  }

  const response = await http.put<ResumeResponse>(`/resume/${resumeId}`, { data }, { signal })
  return normalizeResume(response.data)
}

/** 服务端返回的 resume.data 统一归一化，编辑器拿到的一定是结构完整的 ResumeData。 */
function normalizeResume(resume: Resume): Resume {
  return { ...resume, data: parseResumeData(resume.data) }
}
