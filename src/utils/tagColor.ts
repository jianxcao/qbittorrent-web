export interface TagColor {
  background: string
  text: string
  border: string
}

const PALETTE: TagColor[] = [
  { background: 'rgba(24, 160, 88, 0.18)', text: '#63e2b7', border: 'rgba(99, 226, 183, 0.45)' },
  { background: 'rgba(32, 128, 240, 0.18)', text: '#70c0ff', border: 'rgba(112, 192, 255, 0.45)' },
  { background: 'rgba(240, 160, 32, 0.18)', text: '#f2c97d', border: 'rgba(242, 201, 125, 0.5)' },
  { background: 'rgba(208, 48, 80, 0.18)', text: '#e88080', border: 'rgba(232, 128, 128, 0.45)' },
  { background: 'rgba(139, 92, 246, 0.18)', text: '#c4b5fd', border: 'rgba(196, 181, 253, 0.45)' },
  { background: 'rgba(14, 165, 164, 0.18)', text: '#5eead4', border: 'rgba(94, 234, 212, 0.45)' },
  { background: 'rgba(236, 72, 153, 0.18)', text: '#f9a8d4', border: 'rgba(249, 168, 212, 0.45)' },
  { background: 'rgba(132, 204, 22, 0.18)', text: '#bef264', border: 'rgba(190, 242, 100, 0.45)' }
]

export function tagColor(name: string): TagColor {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  return PALETTE[hash % PALETTE.length]
}
