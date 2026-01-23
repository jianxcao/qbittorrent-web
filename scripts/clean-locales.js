import fs from 'fs'
import path from 'path'

const zhPath = path.join(__dirname, '../src/i18n/locales/zh-CN.json')
const enPath = path.join(__dirname, '../src/i18n/locales/en-US.json')

const unusedTopLevel = [
  'settings',
  'settingsDialog',
  'pollingSettings',
  'downloadSettings',
  'otherSettings',
  'queueSettings',
  'bandwidthSettings',
  'networkSettings',
  'rowMenu',
  'otherTorrentSetting',
  'changeTracker',
  'messages',
  'status'
]

const unusedColumns = [
  'hash',
  'seeding_time',
  'seq_dl',
  'max_seeding_time',
  'auto_tmm',
  'super_seeding',
  'force_start',
  'id',
  'tagsArray',
  'trackerHost'
]

function cleanLocale(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const data = JSON.parse(content)

  // Remove unused top-level keys
  unusedTopLevel.forEach((key) => {
    if (data[key]) {
      delete data[key]
    }
  })

  // Remove unused columns
  if (data.columns) {
    unusedColumns.forEach((key) => {
      if (data.columns[key]) {
        delete data.columns[key]
      }
    })
  }

  // Clean torrentState - keep only unknown
  if (data.torrentState) {
    const unknown = data.torrentState.unknown
    data.torrentState = { unknown }
  }

  // Remove torrentDetail if it is the large object (check if it has 'general' child)
  if (data.torrentDetail && data.torrentDetail.general) {
    delete data.torrentDetail
  }

  // Note: en-US has torrentDetail inside pollingSettings but pollingSettings is removed above.
  // en-US also has top-level torrentDetail which is removed here.

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n')
  console.log(`Cleaned ${filePath}`)
}

cleanLocale(zhPath)
cleanLocale(enPath)
