// ================== qBittorrent 类型定义 ==================

// qBittorrent 种子状态枚举
// 参考: src/webui/api/serialize/serialize_torrent.cpp
// 注意: qBittorrent v5.0.0+ 将 pausedDL/pausedUP 重命名为 stoppedDL/stoppedUP
export type QBTorrentState =
  | 'error' // 错误状态 - Error
  | 'missingFiles' // 文件缺失 - MissingFiles
  | 'uploading' // 上传中（做种）- Uploading
  | 'pausedUP' // 暂停上传（旧版本，v5.0.0前）- PausedUploading (deprecated)
  | 'stoppedUP' // 已停止上传（v5.0.0+）- StoppedUploading
  | 'queuedUP' // 上传队列中 - QueuedUploading
  | 'stalledUP' // 上传停滞 - StalledUploading
  | 'checkingUP' // 检查上传 - CheckingUploading
  | 'forcedUP' // 强制上传 - ForcedUploading
  | 'allocating' // 分配磁盘空间 - Allocating (注: 此状态在新版本中可能已移除)
  | 'downloading' // 下载中 - Downloading
  | 'metaDL' // 下载元数据 - DownloadingMetadata
  | 'forcedMetaDL' // 强制下载元数据 - ForcedDownloadingMetadata
  | 'pausedDL' // 暂停下载（旧版本，v5.0.0前）- PausedDownloading (deprecated)
  | 'stoppedDL' // 已停止下载（v5.0.0+）- StoppedDownloading
  | 'queuedDL' // 下载队列中 - QueuedDownloading
  | 'stalledDL' // 下载停滞 - StalledDownloading
  | 'checkingDL' // 检查下载 - CheckingDownloading
  | 'forcedDL' // 强制下载 - ForcedDownloading
  | 'checkingResumeData' // 检查恢复数据 - CheckingResumeData
  | 'moving' // 移动文件中 - Moving
  | 'unknown' // 未知状态 - Unknown

// 种子信息
export interface Torrent {
  added_on: number // 添加时间戳
  amount_left: number // 剩余下载量（字节）
  auto_tmm: boolean // 是否启用自动种子管理
  availability: number // 可用性（0-1之间的值）
  category: string // 分类名称
  completed: number // 已完成下载量（字节）
  completion_on: number // 完成时间戳（0表示未完成）
  content_path: string // 内容路径
  dl_limit: number // 下载速度限制（字节/秒，-1表示无限制）
  dlspeed: number // 当前下载速度（字节/秒）
  downloaded: number // 总下载量（字节）
  downloaded_session: number // 本次会话下载量（字节）
  eta: number // 预计剩余时间（秒）
  f_l_piece_prio: boolean // 是否优先下载首尾片段
  force_start: boolean // 是否强制开始
  hash: string // 种子哈希值
  last_activity: number // 最后活动时间戳
  magnet_uri: string // 磁力链接
  max_ratio: number // 最大分享率（-1表示无限制）
  max_seeding_time: number // 最大做种时间（分钟，-1表示无限制）
  max_inactive_seeding_time: number // 最大闲置做种时间（分钟，-1表示无限制）
  name: string // 种子名称
  num_complete: number // 完整peer数量
  num_incomplete: number // 不完整peer数量
  num_leechs: number // 当前连接的下载者数量
  num_seeds: number // 当前连接的做种者数量
  priority: number // 优先级
  progress: number // 下载进度（0-1之间的值）
  ratio: number // 当前分享率
  popularity: number // 流行度（-1表示无限）
  reannounce: number // 距离下次重新向 tracker 宣告的时间（秒），-1 表示不适用（API v2.9.3+ qBittorrent v5.0+）
  save_path: string // 保存路径
  root_path?: string // 根路径
  seeding_time: number // 已做种时间（秒）
  seen_complete: number // 上次看到完整时间戳
  seq_dl: boolean // 是否顺序下载
  size: number // 种子总大小（字节）
  state: QBTorrentState // 种子状态
  super_seeding: boolean // 是否启用超级做种
  tags: string // 标签（逗号分隔的字符串）
  time_active: number // 活动时间（秒）
  total_size: number // 选定文件的总大小（字节）
  tracker: string // 主要tracker URL
  up_limit: number // 上传速度限制（字节/秒，-1表示无限制）
  uploaded: number // 总上传量（字节）
  uploaded_session: number // 本次会话上传量（字节）
  upspeed: number // 当前上传速度（字节/秒）
}

// 种子属性（详细信息）
export interface TorrentProperties {
  addition_date: number // 添加日期
  comment: string // 注释
  completion_date: number // 完成日期
  created_by: string // 创建者
  creation_date: number // 创建日期
  dl_limit: number // 下载限制
  dl_speed: number // 下载速度
  dl_speed_avg: number // 平均下载速度
  eta: number // 预计剩余时间
  last_seen: number // 最后看到时间
  nb_connections: number // 连接数
  nb_connections_limit: number // 连接数限制
  peers: number // peer数量
  peers_total: number // 总peer数量
  piece_size: number // 分片大小
  pieces_have: number // 已有分片数
  pieces_num: number // 总分片数
  reannounce: number // 重新宣告时间
  save_path: string // 保存路径
  seeding_time: number // 做种时间
  seeds: number // 种子数
  seeds_total: number // 总种子数
  share_ratio: number // 分享率
  time_elapsed: number // 已用时间
  total_downloaded: number // 总下载量
  total_downloaded_session: number // 本次会话下载量
  total_size: number // 总大小
  total_uploaded: number // 总上传量
  total_uploaded_session: number // 本次会话上传量
  total_wasted: number // 浪费的数据量
  up_limit: number // 上传限制
  up_speed: number // 上传速度
  up_speed_avg: number // 平均上传速度
  infohash_v1?: string // 信息哈希值 v1
  infohash_v2?: string // 信息哈希值 v2
  private?: boolean // 是否为私密种子
  is_private?: boolean // 是否为私密种子
}

// Tracker 信息
export interface Tracker {
  url: string // Tracker URL
  status: number // 状态码
  tier: number // 层级
  num_peers: number // peer数量
  num_seeds: number // 种子数量
  num_leeches: number // 下载者数量
  num_downloaded: number // 下载次数
  msg: string // 消息
}

// Web seed 信息
export interface WebSeed {
  url: string // URL
}

// 种子文件信息
export interface TorrentFile {
  index: number // 文件索引
  name: string // 文件名
  size: number // 文件大小
  progress: number // 下载进度
  priority: number // 优先级
  is_seed: boolean // 是否为种子
  piece_range: number[] // 分片范围
  availability: number // 可用性
}

// 分类信息
export interface Category {
  name: string // 分类名称
  savePath: string // 保存路径
}

// 应用偏好设置
export interface AppPreferences {
  // ==================== 路径设置 ====================
  save_path?: string // 默认保存路径
  temp_path?: string // 临时路径（未完成的种子保存位置）
  temp_path_enabled?: boolean // 是否启用临时路径

  // ==================== 下载设置 ====================
  use_subcategories?: boolean // 是否启用子分类
  add_stopped_enabled?: boolean // 添加种子时是否暂停（不自动开始下载）
  auto_delete_mode?: number // 自动删除 .torrent 文件模式（0=不删除, 1=删除）
  preallocate_all?: boolean // 是否为所有文件预分配磁盘空间
  incomplete_files_ext?: boolean // 是否为不完整的文件添加 .!qB 扩展名
  add_to_top_of_queue?: boolean // 是否将新种子添加到队列顶部
  torrent_stop_condition?: string // 种子停止条件（'None', 'MetadataReceived', 'FilesChecked'）
  merge_trackers?: boolean // 添加重复种子时是否合并 tracker
  use_unwanted_folder?: boolean // 是否将未选中的文件保留在 ".unwanted" 文件夹中
  use_category_paths_in_manual_mode?: boolean // 手动模式下是否使用分类路径
  excluded_file_names_enabled?: boolean // 是否启用排除文件名功能
  excluded_file_names?: string // 排除的文件名列表（换行分隔）

  // ==================== 自动种子管理 ====================
  auto_tmm_enabled?: boolean // 默认是否启用自动种子管理模式
  torrent_changed_tmm_enabled?: boolean // 种子分类更改时是否重新定位
  save_path_changed_tmm_enabled?: boolean // 默认保存路径更改时是否重新定位受影响的种子
  category_changed_tmm_enabled?: boolean // 分类保存路径更改时是否重新定位受影响的种子

  // ==================== 监控目录 ====================
  scan_dirs?: Record<string, number | string> // 自动添加种子的监控文件夹（文件夹路径 -> 0=监控文件夹, 1=默认保存位置, 字符串=自定义路径）
  export_dir?: string // 复制 .torrent 文件到此目录
  export_dir_fin?: string // 复制已完成的 .torrent 文件到此目录

  // ==================== 邮件通知 ====================
  mail_notification_enabled?: boolean // 是否启用下载完成时的邮件通知
  mail_notification_sender?: string // 发件人邮箱地址
  mail_notification_email?: string // 收件人邮箱地址
  mail_notification_smtp?: string // SMTP 服务器地址
  mail_notification_ssl_enabled?: boolean // 是否启用 SSL 加密连接
  mail_notification_auth_enabled?: boolean // 是否启用 SMTP 身份验证
  mail_notification_username?: string // SMTP 用户名
  mail_notification_password?: string // SMTP 密码

  // ==================== 外部程序 ====================
  autorun_enabled?: boolean // 是否在种子完成时运行外部程序
  autorun_program?: string // 种子完成时运行的程序命令
  autorun_on_torrent_added_enabled?: boolean // 是否在添加种子时运行外部程序
  autorun_on_torrent_added_program?: string // 添加种子时运行的程序命令

  // ==================== 队列设置 ====================
  queueing_enabled?: boolean // 是否启用种子队列功能
  max_active_downloads?: number // 最大活动下载数（-1=无限制）
  max_active_torrents?: number // 最大活动种子数（-1=无限制）
  max_active_uploads?: number // 最大活动上传数（-1=无限制）
  dont_count_slow_torrents?: boolean // 慢速种子是否不计入活动限制
  slow_torrent_dl_rate_threshold?: number // 慢速种子下载速率阈值（KiB/s）
  slow_torrent_ul_rate_threshold?: number // 慢速种子上传速率阈值（KiB/s）
  slow_torrent_inactive_timer?: number // 种子非活动计时器（秒）

  // ==================== 做种限制 ====================
  max_ratio_enabled?: boolean // 是否启用最大分享率限制
  max_ratio?: number // 最大分享率（-1=无限制）
  max_ratio_act?: number // 达到最大分享率后的操作（0=暂停, 1=删除, 2=删除+文件, 3=超级做种）
  max_seeding_time_enabled?: boolean // 是否启用最大做种时间限制
  max_seeding_time?: number // 最大做种时间（分钟，-1=无限制）
  max_seeding_time_act?: number // 达到最大做种时间后的操作
  max_inactive_seeding_time_enabled?: boolean // 是否启用最大不活跃做种时间限制
  max_inactive_seeding_time?: number // 最大不活跃做种时间（分钟，-1=无限制）
  max_active_checking_torrents?: number // 最大活动检查种子数

  // ==================== Tracker 设置 ====================
  add_trackers_enabled?: boolean // 是否自动添加 tracker 到新种子
  add_trackers?: string // 要自动添加的 tracker 列表（换行分隔）

  // ==================== 连接设置 ====================
  listen_port?: number // 监听端口（用于传入连接）
  upnp?: boolean // 是否启用 UPnP / NAT-PMP 端口转发
  random_port?: boolean // 是否使用随机端口

  // ==================== 速度限制 ====================
  dl_limit?: number // 全局下载速度限制（KiB/s，0=无限制）
  up_limit?: number // 全局上传速度限制（KiB/s，0=无限制）

  // ==================== 备用速度限制 ====================
  alt_dl_limit?: number // 备用下载速度限制（KiB/s，0=无限制）
  alt_up_limit?: number // 备用上传速度限制（KiB/s，0=无限制）
  scheduler_enabled?: boolean // 是否启用计划任务（自动切换备用速度限制）
  schedule_from_hour?: number // 计划任务开始时间（小时）
  schedule_from_min?: number // 计划任务开始时间（分钟）
  schedule_to_hour?: number // 计划任务结束时间（小时）
  schedule_to_min?: number // 计划任务结束时间（分钟）
  scheduler_days?: number // 计划任务应用的天数（0=每天, 1=工作日, 2=周末, 3-9=周一到周日）

  // ==================== 连接数限制 ====================
  max_connec?: number // 全局最大连接数（-1=无限制）
  max_connec_per_torrent?: number // 每个种子最大连接数（-1=无限制）
  max_uploads?: number // 全局最大上传槽位数（-1=无限制）
  max_uploads_per_torrent?: number // 每个种子最大上传槽位数（-1=无限制）

  // ==================== 协议设置 ====================
  stop_tracker_timeout?: number // 停止 tracker 超时时间（秒，0=禁用）
  enable_piece_extent_affinity?: boolean // 是否启用相邻文件块下载模式
  bittorrent_protocol?: number // BitTorrent 协议（0=TCP+μTP, 1=TCP, 2=μTP）
  limit_utp_rate?: boolean // 是否对 μTP 协议进行速度限制
  limit_tcp_overhead?: boolean // 是否对传输总开销进行速度限制
  limit_lan_peers?: boolean // 是否对本地网络用户进行速度限制

  // ==================== BitTorrent 功能 ====================
  dht?: boolean // 是否启用 DHT（去中心化网络）
  dhtSameAsBT?: boolean // DHT 端口是否与 BitTorrent 端口相同
  dht_port?: number // DHT 端口
  pex?: boolean // 是否启用 PeX（用户交换）
  lsd?: boolean // 是否启用 LSD（本地服务发现）
  encryption?: number // 加密模式（0=允许加密, 1=强制加密, 2=禁用加密）
  anonymous_mode?: boolean // 是否启用匿名模式

  // ==================== I2P 设置 ====================
  i2p_enabled?: boolean // 是否启用 I2P（实验性）
  i2p_address?: string // I2P 主机地址
  i2p_port?: number // I2P 端口
  i2p_mixed_mode?: boolean // 是否启用 I2P 混合模式

  // ==================== 代理设置 ====================
  proxy_type?: string // 代理类型（'None', 'SOCKS4', 'SOCKS5', 'HTTP'）
  proxy_ip?: string // 代理服务器 IP
  proxy_port?: number // 代理服务器端口
  proxy_auth_enabled?: boolean // 是否启用代理身份验证
  proxy_username?: string // 代理用户名
  proxy_password?: string // 代理密码
  proxy_hostname_lookup?: boolean // 是否通过代理查找主机名
  proxy_bittorrent?: boolean // 是否对 BitTorrent 使用代理
  proxy_peer_connections?: boolean // 是否对用户连接使用代理
  proxy_rss?: boolean // 是否对 RSS 使用代理
  proxy_misc?: boolean // 是否对常规目的使用代理

  // ==================== IP 过滤 ====================
  ip_filter_enabled?: boolean // 是否启用 IP 过滤
  ip_filter_path?: string // IP 过滤规则文件路径（.dat, .p2p, .p2b）
  ip_filter_trackers?: boolean // 是否对 tracker 应用 IP 过滤
  banned_IPs?: string // 手动屏蔽的 IP 地址列表（换行分隔）

  // ==================== Web UI 设置 ====================
  web_ui_domain_list?: string // Web UI 域名白名单（';' 分隔）
  web_ui_address?: string // Web UI 监听地址（'*' 表示所有接口）
  web_ui_port?: number // Web UI 端口
  web_ui_upnp?: boolean // 是否对 Web UI 使用 UPnP 端口转发
  web_ui_username?: string // Web UI 用户名
  web_ui_password?: string // Web UI 密码
  use_https?: boolean // 是否使用 HTTPS
  web_ui_https_cert_path?: string // HTTPS 证书文件路径
  web_ui_https_key_path?: string // HTTPS 密钥文件路径
  bypass_local_auth?: boolean // 是否对本地主机跳过身份验证
  bypass_auth_subnet_whitelist_enabled?: boolean // 是否启用子网白名单（跳过验证）
  bypass_auth_subnet_whitelist?: string // IP 子网白名单（换行分隔）
  web_ui_csrf_protection_enabled?: boolean // 是否启用 CSRF 保护
  web_ui_clickjacking_protection_enabled?: boolean // 是否启用点击劫持保护
  web_ui_secure_cookie_enabled?: boolean // 是否启用安全 Cookie 标志
  web_ui_max_auth_fail_count?: number // 最大身份验证失败次数（0=禁用）
  web_ui_ban_duration?: number // 禁止时长（秒）
  web_ui_session_timeout?: number // 会话超时时间（秒）
  web_ui_host_header_validation_enabled?: boolean // 是否启用 Host Header 验证
  alternative_webui_enabled?: boolean // 是否使用备选 WebUI
  alternative_webui_path?: string // 备选 WebUI 文件路径
  web_ui_use_custom_http_headers_enabled?: boolean // 是否使用自定义 HTTP Headers
  web_ui_custom_http_headers?: string // 自定义 HTTP Headers（换行分隔）
  web_ui_reverse_proxy_enabled?: boolean // 是否启用反向代理支持
  web_ui_reverse_proxies_list?: string // 受信任的反向代理列表（';' 分隔）

  // ==================== 高级设置 ====================
  locale?: string // 界面语言
  version?: string // qBittorrent 版本

  // ==================== RSS 设置 ====================
  rss_refresh_interval?: number // RSS 订阅刷新间隔（分钟）
  rss_max_articles_per_feed?: number // 每个订阅源的最大文章数
  rss_processing_enabled?: boolean // 是否启用 RSS 订阅处理
  rss_auto_downloading_enabled?: boolean // 是否启用 RSS 自动下载

  // ==================== 日志设置 ====================
  file_log_age?: number // 日志文件保留时长
  file_log_age_type?: number // 日志文件保留时长类型（0=天, 1=月, 2=年）
  file_log_backup_enabled?: boolean // 是否启用日志文件备份
  file_log_delete_old?: boolean // 是否删除旧的日志文件
  file_log_enabled?: boolean // 是否启用文件日志
  file_log_max_size?: number // 日志文件最大大小（KiB）
  file_log_path?: string // 日志文件路径

  // ==================== qBittorrent 高级设置 ====================
  resume_data_storage_type?: string // 恢复数据存储类型（'Legacy', 'SQLite'）
  torrent_content_remove_option?: string // 种子内容删除模式（'Delete', 'MoveToTrash'）
  memory_working_set_limit?: number // 物理内存使用限制（MiB）
  current_network_interface?: string // 当前网络接口
  current_interface_address?: string // 绑定的可选 IP 地址
  save_resume_data_interval?: number // 保存恢复数据间隔（分钟）
  save_statistics_interval?: number // 保存统计数据间隔（分钟）
  torrent_file_size_limit?: number // .torrent 文件大小限制（字节）
  confirm_torrent_recheck?: boolean // 是否确认 torrent 重新校验
  recheck_completed_torrents?: boolean // 是否在完成后重新校验 torrent
  app_instance_name?: string // 自定义应用实例名
  refresh_interval?: number // 刷新间隔（毫秒）
  resolve_peer_countries?: boolean // 是否解析用户所在国家
  reannounce_when_address_changed?: boolean // IP 或端口更改时是否重新通知所有 trackers
  enable_embedded_tracker?: boolean // 是否启用内置 tracker
  embedded_tracker_port?: number // 内置 tracker 端口
  embedded_tracker_port_forwarding?: boolean // 是否对内置 tracker 启用端口转发
  mark_of_the_web?: boolean // 是否启用已下载文件的 Mark-of-the-Web (MOTW)
  ignore_ssl_errors?: boolean // 是否忽略 SSL 错误
  python_executable_path?: string // Python 可执行文件路径

  // ==================== libtorrent 性能设置 ====================
  bdecode_depth_limit?: number // Bdecode 深度限制
  bdecode_token_limit?: number // Bdecode 令牌限制
  async_io_threads?: number // 异步 I/O 线程数
  hashing_threads?: number // 哈希计算线程数
  file_pool_size?: number // 文件池大小
  checking_memory_use?: number // 检查时内存使用量（MiB）
  disk_cache?: number // 磁盘缓存大小（MiB，-1=自动）
  disk_cache_ttl?: number // 磁盘缓存 TTL（秒）
  disk_queue_size?: number // 磁盘队列大小（字节）
  disk_io_type?: number // 磁盘 IO 类型（0=默认, 1=内存映射, 2=POSIX）
  disk_io_read_mode?: number // 磁盘 IO 读取模式（0=禁用OS缓存, 1=启用OS缓存）
  disk_io_write_mode?: number // 磁盘 IO 写入模式（0=禁用OS缓存, 1=启用OS缓存, 2=连续写入）
  enable_coalesce_read_write?: boolean // 是否合并读写操作
  enable_os_cache?: boolean // 是否启用操作系统缓存
  enable_upload_suggestions?: boolean // 是否启用上传建议
  enable_download_suggestions?: boolean // 是否启用下载建议
  send_upload_piece_suggestions?: boolean // 是否发送上传片段建议
  send_buffer_watermark?: number // 发送缓冲区上限（KiB）
  send_buffer_low_watermark?: number // 发送缓冲区下限（KiB）
  send_buffer_watermark_factor?: number // 发送缓冲区增长系数（%）
  connection_speed?: number // 每秒传出连接数
  socket_send_buffer_size?: number // 套接字发送缓存大小（字节，0=系统默认）
  socket_receive_buffer_size?: number // 套接字接收缓存大小（字节，0=系统默认）
  socket_backlog_size?: number // Socket backlog 大小
  outgoing_ports_min?: number // 传出端口下限（0=禁用）
  outgoing_ports_max?: number // 传出端口上限（0=禁用）
  upnp_lease_duration?: number // UPnP 租期（秒，0=永久）
  peer_tos?: number // 与 peers 连接的服务类型（ToS）
  utp_tcp_mixed_mode?: number // μTP-TCP 混合模式策略（0=优先TCP, 1=按比重）
  idn_support_enabled?: boolean // 是否支持国际化域名（IDN）
  enable_multi_connections_from_same_ip?: boolean // 是否允许来自同一 IP 的多个连接
  validate_https_tracker_certificate?: boolean // 是否验证 HTTPS tracker 证书
  ssrf_mitigation?: boolean // 是否启用服务器端请求伪造（SSRF）攻击缓解
  block_peers_on_privileged_ports?: boolean // 是否禁止连接到特权端口上的 Peer
  upload_slots_behavior?: number // 上传窗口策略（0=固定窗口, 1=基于上传速度）
  upload_choking_algorithm?: number // 上传阻塞算法（0=轮流, 1=最快, 2=反吸血）

  // ==================== Tracker 高级设置 ====================
  announce_to_all_trackers?: boolean // 是否向所有 tracker 宣告
  announce_to_all_tiers?: boolean // 是否向所有层级的 tracker 宣告
  announce_ip?: string // 宣告给 tracker 的 IP 地址
  announce_port?: number // 宣告给 tracker 的端口（0=监听端口）
  max_concurrent_http_announces?: number // 最大并行 HTTP 宣告数
  peer_turnover?: number // Peer 进出断开百分比（%）
  peer_turnover_cutoff?: number // Peer 进出阈值百分比（%）
  peer_turnover_interval?: number // Peer 进出断开间隔（秒）
  request_queue_size?: number // 单一 peer 的最大未完成请求数
  dht_bootstrap_nodes?: string // DHT Bootstrap 节点
  min_announce_interval?: number // 最小宣告间隔（秒）
  create_torrent_subfolder?: boolean // 是否创建种子子文件夹
  torrent_content_layout?: number // 种子内容布局（0=原始, 1=创建子文件夹, 2=不创建子文件夹）

  // ==================== 其他 ====================
  performance_warning?: boolean // 是否显示性能警告
}

// 传输信息
export interface TransferInfo {
  dl_info_speed: number // 全局下载速度
  dl_info_data: number // 本次会话下载量
  up_info_speed: number // 全局上传速度
  up_info_data: number // 本次会话上传量
  dl_rate_limit: number // 全局下载速度限制
  up_rate_limit: number // 全局上传速度限制
  dht_nodes: number // DHT节点数
  connection_status: string // 连接状态
  alltime_dl?: number // 累计下载量
  alltime_ul?: number // 累计上传量
}

// 同步主数据
export interface SyncMainData {
  rid: number // 响应ID
  full_update?: boolean // 是否完整更新
  torrents?: Record<string, Partial<Torrent>> // 种子更新
  torrents_removed?: string[] // 已删除的种子
  categories?: Record<string, Category> // 分类
  categories_removed?: string[] // 已删除的分类
  tags?: string[] // 标签
  tags_removed?: string[] // 已删除的标签
  server_state?: Partial<TransferInfo> // 服务器状态
  // 每个 tracker 下的种子的 id
  trackers?: Record<string, string[]> // Tracker信息
}

// 同步种子 peers 数据
export interface SyncTorrentPeers {
  rid: number // 响应ID
  full_update?: boolean // 是否完整更新
  peers?: Record<string, TorrentPeer> // peer更新
  peers_removed?: string[] // 已删除的peer
}

// Torrent peer 信息
export interface TorrentPeer {
  client: string // 客户端
  connection: string // 连接类型
  country: string // 国家
  country_code: string // 国家代码
  dl_speed: number // 下载速度
  downloaded: number // 已下载量
  files: string // 文件
  flags: string // 标志
  flags_desc: string // 标志描述
  ip: string // IP地址
  port: number // 端口
  progress: number // 进度
  relevance: number // 相关性
  up_speed: number // 上传速度
  uploaded: number // 已上传量
}

// 日志条目
export interface LogEntry {
  id: number // 日志ID
  message: string // 日志消息
  timestamp: number // 时间戳
  type: number // 类型
}

// Peer 日志条目
export interface PeerLogEntry {
  id: number // 日志ID
  ip: string // IP地址
  timestamp: number // 时间戳
  blocked: boolean // 是否被封禁
  reason: string // 原因
}

// 构建信息
export interface BuildInfo {
  qt: string // Qt版本
  libtorrent: string // libtorrent版本
  boost: string // Boost版本
  openssl: string // OpenSSL版本
  bitness: number // 位数
}

// RSS 文件夹
export interface RSSFolder {
  [key: string]: RSSFolder | RSSFeed
}

// RSS 订阅
export interface RSSFeed {
  uid: string // 唯一ID
  url: string // URL
  title: string // 标题
  lastBuildDate: string // 最后构建日期
  isLoading: boolean // 是否正在加载
  hasError: boolean // 是否有错误
  articles: RSSArticle[] // 文章列表
}

// RSS 文章
export interface RSSArticle {
  id: string // 文章ID
  date: string // 日期
  title: string // 标题
  author: string // 作者
  description: string // 描述
  torrentURL: string // 种子URL
  link: string // 链接
  isRead: boolean // 是否已读
}

// RSS 自动下载规则
export interface RSSRule {
  enabled: boolean // 是否启用
  mustContain: string // 必须包含
  mustNotContain: string // 必须不包含
  useRegex: boolean // 是否使用正则
  episodeFilter: string // 剧集过滤器
  smartFilter: boolean // 智能过滤
  previouslyMatchedEpisodes: string[] // 之前匹配的剧集
  affectedFeeds: string[] // 影响的订阅
  ignoreDays: number // 忽略天数
  lastMatch: string // 最后匹配
  addPaused: boolean // 添加时暂停
  assignedCategory: string // 分配的分类
  savePath: string // 保存路径
}

// 搜索插件
export interface SearchPlugin {
  enabled: boolean // 是否启用
  fullName: string // 完整名称
  name: string // 名称
  supportedCategories: string[] // 支持的分类
  url: string // URL
  version: string // 版本
}

// 搜索状态
export interface SearchStatus {
  id: number // 搜索ID
  status: string // 状态
  total: number // 总结果数
}

// 搜索结果
export interface SearchResult {
  descrLink: string // 描述链接
  fileName: string // 文件名
  fileSize: number // 文件大小
  fileUrl: string // 文件URL
  nbLeechers: number // 下载者数
  nbSeeders: number // 做种者数
  siteUrl: string // 站点URL
}
