import type { AITaskSuggestion } from '@/types'

const CF_API_BASE = 'https://api.cloudflare.com/client/v4'

export async function decomposeTaskWithAI(
  title: string,
  subject: string,
  totalMinutes: number,
  deadline: string,
  apiKey: string,
  accountId: string
): Promise<AITaskSuggestion[]> {
  const daysLeft = Math.max(1, Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  ))

  const prompt = `你是一位专业的学习规划专家。用户是一名中学生，需要将一个复杂学习任务拆解为可执行的子任务步骤。

任务标题: ${title}
科目: ${subject}
总可用时间: ${totalMinutes} 分钟
截止日期: ${deadline}
距离截止还有: ${daysLeft} 天

请将此任务拆解为多个子任务。每个子任务包含：标题（简短）、预估时间（分钟）、建议番茄钟次数、学习策略提示。

以 JSON 数组格式返回，不要包含任何其他文字。格式示例：
[{"subtaskTitle":"梳理知识点框架","estimatedMinutes":30,"suggestedPomodoros":1,"strategy":"先通读教材目录，建立知识结构图"}]`

  const response = await fetch(
    `${CF_API_BASE}/accounts/${accountId}/ai/run/@cf/meta/llama-3-8b-instruct-awq`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: '你是一个学习规划专家。请只返回JSON数组，不要包含任何markdown或其他文字。' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 2048,
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Cloudflare AI API error: ${response.statusText}`)
  }

  const data = await response.json()
  const content = data.result?.response || ''

  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as AITaskSuggestion[]
    }
    return JSON.parse(content) as AITaskSuggestion[]
  } catch {
    throw new Error('Failed to parse AI response')
  }
}

export async function suggestTaskDifficulty(
  title: string,
  subject: string,
  apiKey: string,
  accountId: string
): Promise<string> {
  const prompt = `请根据以下任务信息，判断该任务最适合的学习类型。只返回以下四种之一：背诵/记忆、逻辑/理解、复习/做题、写作/创作。

任务标题: ${title}
科目: ${subject}

只返回类型名称，不要包含其他文字。`

  const response = await fetch(
    `${CF_API_BASE}/accounts/${accountId}/ai/run/@cf/meta/llama-3-8b-instruct-awq`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: '你是一位教育专家。请只返回学习类型分类。' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 50,
      }),
    }
  )

  if (!response.ok) {
    return '复习/做题'
  }

  const data = await response.json()
  const types = ['背诵/记忆', '逻辑/理解', '复习/做题', '写作/创作']
  const content = (data.result?.response || '').trim()

  for (const t of types) {
    if (content.includes(t)) return t
  }
  return '复习/做题'
}
