import { useI18n } from 'vue-i18n'
import { colord } from 'colord'

const priorityMeta = [
  { color: '#FF7F0A', text: (t: any) => t('priority.high'), key: 1 },
  { color: '#1BA784', text: (t: any) => t('priority.normal'), key: 0 },
  { color: '#FFC300', text: (t: any) => t('priority.low'), key: -1 }
]

export const priorityOptions = priorityMeta.map((item) => ({
  label: () => {
    const { t } = useI18n()
    const label = item.text(t)
    return h('div', { class: 'flex items-center' }, [
      h('span', { style: `background:${item.color};width:10px;height:10px;border-radius:50%;margin-right:4px;` }),
      label
    ])
  },
  key: item.key
}))

export const priorityTagColorConfig: Record<string, { color: string; textColor: string; borderColor: string }> = {
  1: {
    color: colord(priorityMeta[0].color).alpha(0.5).toRgbString(),
    textColor: priorityMeta[0].color,
    borderColor: colord(priorityMeta[0].color).alpha(0.5).toRgbString()
  },
  0: {
    color: colord(priorityMeta[1].color).alpha(0.5).toRgbString(),
    textColor: priorityMeta[1].color,
    borderColor: colord(priorityMeta[1].color).alpha(0.5).toRgbString()
  },
  '-1': {
    color: colord(priorityMeta[2].color).alpha(0.5).toRgbString(),
    textColor: priorityMeta[2].color,
    borderColor: colord(priorityMeta[2].color).alpha(0.5).toRgbString()
  }
}
