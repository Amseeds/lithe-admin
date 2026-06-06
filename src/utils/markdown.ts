import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
})

function preprocess(text: string): string {
  let result = text
  // #### / ### / ## 在行首但无空格 → 补空格
  result = result.replace(/^(#{2,4})([^\s#])/gm, '$1 $2')
  // #### / ### / ## 不在行首 → 前插入换行 + 补空格
  result = result.replace(/([^\n#])(#{2,4})([^\s#])/g, '$1\n\n$2 $3')
  // #### 标题后紧跟破折号列表 → 拆行
  result = result.replace(/^(#{2,4}\s+[^\n]{2,18}?)(-)/gm, '$1\n$2')
  // 已知标题精确匹配（AI 固定输出的标题，后跟正文 → 直接拆行）
  result = result.replace(
    /^(#{2,4}\s+)((?:\d+\.)?血糖[、/和及]血压(?:[、/和及]血脂)?[、/和及]尿酸控制目标|(?:\d+\.)?药物相互作用审查|(?:\d+\.)?肝肾功能安全性评估|(?:\d+\.)?生活方式干预建议|(?:\d+\.)?药品档案|(?:\d+\.)?复诊与购药建议|(?:\d+\.)?特别注意事项|(?:\d+\.)?服药时间提醒|(?:\d+\.)?服药时间表|(?:\d+\.)?用药建议|(?:\d+\.)?用药指导|(?:\d+\.)?多病共存用药指导)(：?)([^\n]+)/gm,
    '$1$2$3\n$4',
  )
  // 句号后加粗序号标题（如"。**一、关键指标**"）→ 句号后换行
  result = result.replace(/([。])(\*\*[一-鿿]+[、].*?\*\*)/g, '$1\n$2')
  // #### 标题后紧跟 1.** 粗体数字标记（如"控制目标1.**血糖**"）→ 拆行
  result = result.replace(/^(#{2,4}\s+[^\n]{4,20}?)1\.\*\*/gm, '$1\n1.**')
  // #### 标题后紧跟正文 → 利用重复2字词边界拆行（如"建议建议"）
  result = result.replace(
    /^(#{2,4}\s+[^\n]{3,18}?)([一-鿿]{2})\2/gm,
    '$1$2\n$2',
  )
  // 标题很短（4-6字）+ 正文很长（15+字）→ 标题后截断
  result = result.replace(/^(#{2,4}\s+[^\n]{4,6})([^\n]{15,})/gm, '$1\n$2')
  // 标题较长（7-12字）+ 正文很长（15+字）→ 借助内容词组截断
  result = result.replace(
    /^(#{2,4}\s+[^\n]{7,12})([^\n]{15,})/gm,
    (_m, heading, rest) => {
      // 只在正文以常见内容开头词开始时才拆分
      if (/^(建议患者|建议在|由于患者|由于目前|鉴于|患者正|患者目|患者当|患者应|患者可|用于|关于|针对|对于|需要|如果|目前|此外|另外|并且|同时|虽然|但是|因此|主要|尤其)/.test(rest)) {
        return heading + '\n' + rest;
      }
      return _m;
    },
  )
  // 词组匹配：标题后紧跟常见正文开头词（作为短标题规则的补充）
  result = result.replace(
    /^(#{2,4}\s+[^\n]{3,18}?)(建议患者|建议在|建议如|由于患者|由于目前|根据医嘱|根据病情|如果出现|请注意|一般而言|通常情况|可以采取|主要包括|所有药物|任何不适|以上建议|此外|另外|并且|同时|鉴于|患者正|患者目|患者目前|患者当|患者应|患者可|患者需|对于|关于|针对|需要|如果)/gm,
    '$1\n$2',
  )
  result = result.replace(/([^\n#])(#{2,4})\s/g, '$1\n\n$2 ')
  // **加粗标题**（3+字）后跟破折号列表 → 标题段落化 + 列表独立
  result = result.replace(/([^\n.])\*\*([^*]{3,})\*\*(-)/g, '$1\n\n**$2**\n\n$3')
  // **加粗标题**（3+字）后跟数字列表 → 标题段落化 + 列表紧跟
  result = result.replace(/([^\n.])\*\*([^*]{3,})\*\*(\d+\.)/g, '$1\n\n**$2**\n$3')
  // **加粗标题**（3+字）后紧跟数字列表或破折号 → 拆行（排除 1.** 等数字列表项）
  result = result.replace(/(?<!\d\.)\*\*([^*]{3,})\*\*(\d+\.)/g, '**$1**\n$2')
  result = result.replace(/(?<!\d\.)\*\*([^*]{3,})\*\*(-)/g, '**$1**\n\n$2')
  // **加粗标题**前后与内容衔接 → 标题独立段落化
  result = result.replace(/([^\n.])\*\*([^*]{3,})\*\*(由于|根据|如果|注意|请|目前|需要|一般|通常|可以)/g, '$1\n\n**$2**\n\n$3')
  // 右括号/中文文字后紧跟数字列表 → 换行（排除小数如 0.9）
  result = result.replace(/([）\)一-鿿])(\d+)\.(?![\d*])/g, '$1\n$2.')
  // 中文句号/分号后紧跟数字列表项 → 换行
  result = result.replace(/([。；])(\d+)\.(?!\d)/g, '$1\n$2.')
  // 英文句号/分号后紧跟数字列表项 → 换行
  result = result.replace(/([.;])\s*(\d+)\.(?!\d)/g, '$1\n$2.')
  // 中文冒号后紧跟数字列表项（排除小数）
  result = result.replace(/([：])(\d+)\.(?!\d)/g, '$1\n$2.')
  // 数字加粗标题（如 1.**已知标题**正文）→ ** 后换行
  result = result.replace(
    /^(\d+\.\*\*)(血糖[、/和及]血压(?:[、/和及]血脂)?[、/和及]尿酸控制目标|药物相互作用审查|肝肾功能安全性评估|生活方式干预建议|药品档案|复诊与购药建议|特别注意事项|服药时间提醒|服药时间表|用药建议|用药指导|饮食建议|运动建议|多病共存用药指导)(\*\*)(：?)([^\n]+)/gm,
    '$1$2$3$4\n$5',
  )
  // 数字标题（如"1.药物相互作用审查"）后紧跟正文 → 标题尾插入换行
  result = result.replace(
    /^(\d+\.\s*[^\n]{7,18}?)(目前|由于|根据|如果|注意|请|因为|虽然|但是|然而|因此|此外|另外|首先|其次|最后|总之|需要|应该|可以|能够|必须|推荐|主要|尤其|特别|对本|该患|本患|此患|从目|从上|一般|通常|常规|基于|考虑|针对|关于)/gm,
    '$1\n$2',
  )
  // 标点后紧跟 ** 粗体闭合 → 零宽空格分隔（Unicode 标点前置时 markdown-it 不识别闭合）
  result = result.replace(/([）\)。])\*\*/g, '$1​**')
  // 破折号后紧跟 ** 粗体标记（无空格）→ 补空格 + 前插换行
  result = result.replace(/([^-\n])-\*\*/g, '$1\n- **')
  // 破折号列表项（无空格，且前字符非英文字母避免 LDL-C 等被拆分）→ 补空格 + 前插换行
  result = result.replace(/([^-\nA-Za-z])-([一-鿿A-Za-z])/g, '$1\n- $2')
  // 破折号列表项（有空格）→ 前插换行
  result = result.replace(/([^-\n])- (?=\S)/g, '$1\n- ')
  // 最终：修复换行后破折号无空格的情况（确保成为合法列表项）
  result = result.replace(/\n-([^\s-])/g, '\n- $1')
  // 破折号列表项后紧跟数字项 → 插入空行结束列表，防止数字项被吞入 <li>
  result = result.replace(/(\n- [^\n]+)\n(\d+\.)/g, '$1\n\n$2')
  return result
}

export function renderMarkdown(text: string): string {
  if (!text) return ''
  return md.render(preprocess(text))
}

export interface ParsedAiResponse {
  thinking: string
  response: string
  hasFinal: boolean
}

export function parseAiResponse(raw: string): ParsedAiResponse {
  let thinking = ''
  let response = ''
  let hasFinal = false

  const thinkMatch = raw.match(/##\s*Thinking([\s\S]*?)(?=##\s*FinalResponse|$)/i)
  if (thinkMatch) {
    thinking = thinkMatch[1].replace(/^\s*\n?/, '').trim()
  }

  const finalMatch = raw.match(/##\s*FinalResponse([\s\S]*)$/i)
  if (finalMatch) {
    hasFinal = true
    response = finalMatch[1]
      .replace(/^\s*\n?/, '')
      .replace(/\bfinish\b\s*$/i, '')
      .trim()
  }

  if (!thinkMatch && !finalMatch) {
    response = raw
      .replace(/##\s*Thinking\s*/gi, '')
      .replace(/##\s*FinalResponse\s*/gi, '')
      .replace(/\bfinish\b\s*$/i, '')
      .trim()
  }

  return { thinking, response, hasFinal }
}
