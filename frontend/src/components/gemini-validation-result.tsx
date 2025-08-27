import React from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export interface ValidationResult {
  score: number
  status: 'perfect' | 'good' | 'needs_improvement'
  message?: string
  comment?: string
  improvement_suggestions?: string
  correct_answer?: string
  suggestion_markdown?: string
  improvements?: string[]
  suggestion_html?: string
  rich_html?: string
}

interface GeminiValidationResultProps {
  validationResult: ValidationResult
  className?: string
}

// Sanitize limited HTML from model output: allow only whitelisted tags and safe style/class attributes
const sanitizeHtml = (html: string) => {
  const allowed = new Set([
    'DIV',
    'P',
    'SPAN',
    'STRONG',
    'B',
    'EM',
    'I',
    'H4',
    'UL',
    'LI',
    'U',
    'S',
    'MARK',
  ])
  const allowedStyleProps = new Set([
    'color',
    'text-decoration',
    'font-weight',
    'font-style',
    'background-color',
  ])
  const container = document.createElement('div')
  container.innerHTML = html
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT)
  const removeNodes: Element[] = []
  let node = walker.nextNode() as Element | null
  while (node) {
    const currentEl: Element = node
    if (!allowed.has(currentEl.tagName)) {
      removeNodes.push(currentEl)
    } else {
      // allow only safe class and limited style attributes
      const classAttr = currentEl.getAttribute('class')
      if (currentEl.tagName === 'DIV' && classAttr === 'feedback') {
        currentEl.setAttribute('class', 'feedback')
      } else if (classAttr) {
        currentEl.removeAttribute('class')
      }

      const styleAttr = currentEl.getAttribute('style') || ''
      if (styleAttr) {
        const safeCss: string[] = []
        styleAttr
          .split(';')
          .map((d) => d.trim())
          .filter(Boolean)
          .forEach((declaration) => {
            const [propRaw, valueRaw] = declaration.split(':')
            if (!propRaw || !valueRaw) return
            const prop = propRaw.trim().toLowerCase()
            const value = valueRaw.trim()
            const safeValuePattern = /^[#a-zA-Z0-9(),.%\s-]+$/
            if (allowedStyleProps.has(prop) && safeValuePattern.test(value)) {
              safeCss.push(`${prop}: ${value}`)
            }
          })
        if (safeCss.length > 0) {
          currentEl.setAttribute('style', safeCss.join('; '))
        } else {
          currentEl.removeAttribute('style')
        }
      }

      // remove any other attributes
      Array.from(currentEl.attributes).forEach((attr) => {
        if (attr.name !== 'class' && attr.name !== 'style') {
          currentEl.removeAttribute(attr.name)
        }
      })
    }
    node = walker.nextNode() as Element | null
  }
  removeNodes.forEach((el) => el.replaceWith(...Array.from(el.childNodes)))
  return { __html: container.innerHTML }
}

// Format suggestion string with ~~strike~~ and **highlight** markup into styled HTML
const formatSuggestion = (text: string) => {
  // Escape HTML first
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  const html = escaped
    .replace(/~~(.*?)~~/g, '<span class="line-through text-red-600">$1</span>')
    .replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold text-green-700">$1</span>')
  return { __html: html }
}

export function GeminiValidationResult({ validationResult, className = '' }: GeminiValidationResultProps) {
  const getStatusConfig = (status: ValidationResult['status']) => {
    switch (status) {
      case 'perfect':
        return {
          icon: <CheckCircle className='h-5 w-5 text-green-700 dark:text-green-400' />,
          textColor: 'text-green-800 dark:text-green-200',
        }
      case 'good':
        return {
          icon: <CheckCircle className='h-5 w-5 text-yellow-700 dark:text-yellow-400' />,
          textColor: 'text-yellow-800 dark:text-yellow-200',
        }
      case 'needs_improvement':
      default:
        return {
          icon: <XCircle className='h-5 w-5 text-red-700 dark:text-red-400' />,
          textColor: 'text-red-800 dark:text-red-200',
        }
    }
  }

  const statusConfig = getStatusConfig(validationResult.status)

  return (
    <Card className={className}>
      <CardContent className='pt-6'>
        <div className='rounded-lg border p-4 border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'>
          <div className='mb-2 flex items-center gap-2'>
            {statusConfig.icon}
            <span className={`font-semibold ${statusConfig.textColor}`}>
              Điểm: {validationResult.score}/100
            </span>
          </div>

          {validationResult.rich_html && (
            <div className='mb-3'>
              <div
                className='text-sm'
                dangerouslySetInnerHTML={sanitizeHtml(validationResult.rich_html)}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
