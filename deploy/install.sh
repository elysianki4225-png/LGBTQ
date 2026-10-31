#!/usr/bin/env bash
#
# 光谱档案 · 一键部署脚本（Debian 12+ / Ubuntu 22.04+）
#
# 用法：
#   curl -fsSL https://raw.githubusercontent.com/elysianki4225-png/LGBTQ/main/deploy/install.sh | sudo bash
#   DOMAIN=lgbtq.example.org EMAIL=you@example.org sudo -E bash deploy/install.sh
#
# 可选环境变量：
#   DOMAIN        站点域名。留空或 auto → <公网IP>.nip.io；none → 只配置 HTTP。
#   EMAIL         Let's Encrypt 通知邮箱（建议填写）。
#   CERT_PATH     自有证书链（PEM）；与 KEY_PATH 同时设置时跳过 ACME。
#   KEY_PATH      自有私钥（PEM）。
#   SITE_ROOT     静态文件目录，默认 /var/www/lgbtq。
#   REPO_REF      下载的分支或标签，默认 main。
#   ARCHIVE_URL   自定义压缩包地址（覆盖默认 GitHub 下载）。
#   ENABLE_HSTS   1（默认）启用 HSTS；0 关闭。
#   NGINX_SITE    配置名，默认 lgbtq。
#   SKIP_PACKAGES 1 → 不安装系统包（需已装 nginx 与 certbot）。
#   DRY_RUN       1 → 只打印将执行的操作，不修改系统。
#
# 脚本只做这些事：安装 nginx/certbot、下载站点静态文件、写入一个 nginx
# 站点配置、申请或安装证书、reload nginx。不上传文件、不接入统计、
# 不创建数据库，也不执行下载内容中的任何脚本。

set -Eeuo pipefail

readonly SCRIPT_NAME="spectrum-archive"
readonly DEFAULT_REPO="elysianki4225-png/LGBTQ"
readonly STAMP="$(date +%Y%m%d-%H%M%S)"

log()  { printf '\033[1;35m[%s]\033[0m %s\n' "$SCRIPT_NAME" "$*"; }
ok()   { printf '\033[1;32m[  ok  ]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[ warn ]\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31m[fail  ]\033[0m %s\n' "$*" >&2; exit 1; }

on_error() {
  local code=$?
  warn "第 $1 行执行失败（退出码 ${code}）。nginx 配置可能未生效。"
  warn "排查：nginx -t；journalctl -u nginx -n 50 --no-pager；/var/log/letsencrypt/letsencrypt.log"
  exit "$code"
}
trap 'on_error $LINENO' ERR

run() {
  if [[ "${DRY_RUN:-0}" == "1" ]]; then
    printf '  [dry-run] %s\n' "$*"
    return 0
  fi
  "$@"
}

has() { command -v "$1" >/dev/null 2>&1; }

require_root() {
  [[ ${EUID} -eq 0 ]] || die "请使用 root 或 sudo 运行：sudo bash install.sh"
}

detect_os() {
  [[ -r /etc/os-release ]] || die "无法读取 /etc/os-release，仅支持 Debian / Ubuntu。"
  # shellcheck disable=SC1091
  . /etc/os-release
  case "${ID:-}" in
    debian|ubuntu) ;;
    *)
      case "${ID_LIKE:-}" in
        *debian*|*ubuntu*) ;;
        *) die "当前系统 ${PRETTY_NAME:-未知} 不受支持。请使用 Debian 12+ 或 Ubuntu 22.04+。" ;;
      esac
      ;;
  esac
  log "系统：${PRETTY_NAME:-$ID}"
}

# ---------------------------------------------------------------- 参数

DOMAIN="${DOMAIN:-}"
EMAIL="${EMAIL:-}"
CERT_PATH="${CERT_PATH:-}"
KEY_PATH="${KEY_PATH:-}"
SITE_ROOT="${SITE_ROOT:-/var/www/lgbtq}"
REPO_REF="${REPO_REF:-main}"
ARCHIVE_URL="${ARCHIVE_URL:-}"
ENABLE_HSTS="${ENABLE_HSTS:-1}"
NGINX_SITE="${NGINX_SITE:-lgbtq}"
SKIP_PACKAGES="${SKIP_PACKAGES:-0}"
DRY_RUN="${DRY_RUN:-0}"

TLS_MODE="none"
readonly CONF_AVAILABLE="/etc/nginx/sites-available/${NGINX_SITE}"
readonly CONF_ENABLED="/etc/nginx/sites-enabled/${NGINX_SITE}"
readonly SSL_DIR="/etc/nginx/ssl/${NGINX_SITE}"
readonly TMP_DIR="$(mktemp -d)"

cleanup() { rm -rf "${TMP_DIR}"; }
trap cleanup EXIT

# ---------------------------------------------------------------- 依赖

install_packages() {
  if [[ "${SKIP_PACKAGES}" == "1" ]]; then
    warn "SKIP_PACKAGES=1：跳过系统包安装。"
  else
    log "安装 nginx / certbot / curl / tar …"
    run env DEBIAN_FRONTEND=noninteractive apt-get update -qq
    run env DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
      nginx certbot python3-certbot-nginx curl ca-certificates tar gzip openssl
  fi
  has nginx || die "未找到 nginx。请先安装或去掉 SKIP_PACKAGES。"
  ok "nginx 就绪：$(nginx -v 2>&1)"
}

# ---------------------------------------------------------------- 域名

public_ip() {
  local url ip
  for url in https://api.ipify.org https://ifconfig.me/ip https://icanhazip.com; do
    ip="$(curl -fsS4 --max-time 6 "$url" 2>/dev/null | tr -d '[:space:]' || true)"
    if [[ "$ip" =~ ^[0-9]{1,3}(\.[0-9]{1,3}){3}$ ]]; then
      printf '%s' "$ip"
      return 0
    fi
  done
  ip="$(ip -4 route get 1.1.1.1 2>/dev/null | awk '{for (i = 1; i <= NF; i++) if ($i == "src") { print $(i + 1); exit }}')"
  [[ -n "$ip" ]] && printf '%s' "$ip"
}

resolve_domain() {
  local ip
  if [[ -n "${CERT_PATH}" && -n "${KEY_PATH}" && -z "${DOMAIN}" ]]; then
    die "使用自有证书时必须显式设置 DOMAIN（证书的域名）。"
  fi
  case "${DOMAIN}" in
    ''|auto)
      ip="$(public_ip || true)"
      [[ -n "$ip" ]] || die "无法检测公网 IP。请设置 DOMAIN=your.domain 或 DOMAIN=none。"
      DOMAIN="${ip}.nip.io"
      TLS_MODE="acme"
      log "未指定域名，使用 nip.io：${DOMAIN}"
      ;;
    none|http)
      DOMAIN="_"
      TLS_MODE="none"
      warn "DOMAIN=none：只配置 HTTP，不申请证书。"
      ;;
    *)
      TLS_MODE="acme"
      log "使用自定义域名：${DOMAIN}"
      ;;
  esac
}

# ---------------------------------------------------------------- 静态文件

download_site() {
  local archive url staging item
  if [[ -n "${ARCHIVE_URL}" ]]; then
    url="${ARCHIVE_URL}"
  elif [[ "${REPO_REF}" == v* ]]; then
    url="https://codeload.github.com/${DEFAULT_REPO}/tar.gz/refs/tags/${REPO_REF}"
  else
    url="https://codeload.github.com/${DEFAULT_REPO}/tar.gz/refs/heads/${REPO_REF}"
  fi
  archive="${TMP_DIR}/site.tar.gz"
  staging="${TMP_DIR}/site"

  log "下载站点：${url}"
  run curl -fsSL --retry 3 --retry-delay 2 --max-time 120 -o "${archive}" "${url}" \
    || die "下载失败。检查网络、REPO_REF 或改用 ARCHIVE_URL。"
  run mkdir -p "${staging}"
  run tar -xzf "${archive}" -C "${staging}" --strip-components=1 \
    || die "解压失败：压缩包格式异常。"

  if [[ "${DRY_RUN}" != "1" && ! -f "${staging}/index.html" ]]; then
    die "压缩包中没有 index.html，可能不是本项目的构建产物。"
  fi

  if [[ -d "${SITE_ROOT}" && "${DRY_RUN}" != "1" ]]; then
    log "备份现有目录 → ${SITE_ROOT}.bak.${STAMP}"
    mv "${SITE_ROOT}" "${SITE_ROOT}.bak.${STAMP}"
  fi
  run mkdir -p "${SITE_ROOT}"

  # 只发布静态产物：不复制 src、tools、deploy 与 .git。
  for item in index.html 404.html robots.txt sitemap.xml site.webmanifest assets \
              identities china rights health support ally history data news \
              resources glossary security deploy faq about search; do
    if [[ -e "${staging}/${item}" ]]; then
      run cp -a "${staging}/${item}" "${SITE_ROOT}/"
    fi
  done

  if [[ "${DRY_RUN}" != "1" ]]; then
    [[ -f "${SITE_ROOT}/index.html" ]] || die "部署目录中缺少 index.html。"

    # GitHub Pages 的 404 使用 /LGBTQ/ 绝对路径；部署到域名根目录时要改写。
    if [[ -f "${SITE_ROOT}/404.html" ]]; then
      sed -i 's#"/LGBTQ/#"/#g' "${SITE_ROOT}/404.html" || true
    fi

    chown -R www-data:www-data "${SITE_ROOT}" 2>/dev/null || true
    chmod -R a+rX "${SITE_ROOT}"
  fi
  ok "静态文件已就位：${SITE_ROOT}"
}

# ---------------------------------------------------------------- nginx

ACME_WEBROOT="${SITE_ROOT}"

cert_file_for_mode() {
  case "${TLS_MODE}" in
    own)  printf '%s' "${SSL_DIR}/fullchain.pem" ;;
    acme) printf '%s' "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ;;
    *)    printf '' ;;
  esac
}

key_file_for_mode() {
  case "${TLS_MODE}" in
    own)  printf '%s' "${SSL_DIR}/privkey.pem" ;;
    acme) printf '%s' "/etc/letsencrypt/live/${DOMAIN}/privkey.pem" ;;
    *)    printf '' ;;
  esac
}

write_nginx_conf() {
  local cert_file key_file have_tls=0 hsts_header="" server_name_line tls_block http_block
  cert_file="$(cert_file_for_mode)"
  key_file="$(key_file_for_mode)"
  if [[ -n "${cert_file}" && -f "${cert_file}" ]]; then
    have_tls=1
  fi

  if [[ "${ENABLE_HSTS}" == "1" && "${have_tls}" == "1" ]]; then
    hsts_header='add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;'
  fi

  server_name_line="server_name _;"
  [[ "${DOMAIN}" != "_" ]] && server_name_line="server_name ${DOMAIN};"

  if [[ "${have_tls}" == "1" ]]; then
    tls_block="
    ssl_certificate     ${cert_file};
    ssl_certificate_key ${key_file};
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;"
    http_block="
    location ^~ /.well-known/acme-challenge/ {
        root ${ACME_WEBROOT};
        default_type \"text/plain\";
    }

    location / {
        return 301 https://\$host\$request_uri;
    }"
  else
    http_block="
    location ^~ /.well-known/acme-challenge/ {
        root ${ACME_WEBROOT};
        default_type \"text/plain\";
    }

    location / {
        try_files \$uri \$uri/ \$uri/index.html =404;
        expires -1;
    }"
  fi

  {
    cat <<EOF
# 由 ${SCRIPT_NAME} 生成于 ${STAMP}
# 站点：${DOMAIN}（TLS 模式：${TLS_MODE}；HTTPS：$([[ "${have_tls}" == 1 ]] && echo 已启用 || echo 未启用)）
# 修改后请运行：nginx -t && systemctl reload nginx

server {
    listen 80;
    listen [::]:80;
    ${server_name_line}

    root ${SITE_ROOT};
    index index.html;
    charset utf-8;
    charset_types text/css application/javascript application/json image/svg+xml;
    server_tokens off;
    absolute_redirect off;
    autoindex off;

    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
${http_block}
}
EOF

    if [[ "${have_tls}" == "1" ]]; then
      cat <<EOF

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    ${server_name_line}
${tls_block}

    root ${SITE_ROOT};
    index index.html;
    charset utf-8;
    charset_types text/css application/javascript application/json image/svg+xml;
    server_tokens off;
    absolute_redirect off;
    autoindex off;

    # 与 src/layout.html 的 CSP 保持一致
    add_header Content-Security-Policy "default-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; manifest-src 'self'; media-src 'none'; worker-src 'none'; upgrade-insecure-requests" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()" always;
    ${hsts_header}

    gzip on;
    gzip_vary on;
    gzip_comp_level 6;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml application/javascript application/json application/xml image/svg+xml;

    # 注意：location 内的 add_header 会覆盖 server 级别，因此这里只用 expires，
    # 让 CSP/HSTS 等安全头保持继承自 server 块。
    location ^~ /assets/ {
        try_files \$uri =404;
        expires 30d;
        access_log off;
    }

    location / {
        try_files \$uri \$uri/ \$uri/index.html =404;
        expires -1;
    }

    error_page 404 /404.html;
    location = /404.html {
        internal;
    }

    location ~ /\. { deny all; }
    location ~* \.(?:bak|conf|inc|log|sh|sql|tar|gz|zip)$ { deny all; }

    # 隐私：默认不写访问日志。
    access_log off;
    error_log  /var/log/nginx/${NGINX_SITE}.error.log warn;
}
EOF
    else
      cat <<'EOF'

# 未启用 HTTPS：
#   * acme → 证书尚未签发（见上方 certbot 输出），修复后重跑脚本
#   * none → 按 DOMAIN=none 的请求只配置 HTTP
EOF
    fi
  } >"${TMP_DIR}/nginx.conf"

  if [[ "${DRY_RUN}" == "1" ]]; then
    log "[dry-run] 将写入 ${CONF_AVAILABLE}："
    sed -n '1,60p' "${TMP_DIR}/nginx.conf"
    return 0
  fi

  install -d -m 755 /etc/nginx/sites-available /etc/nginx/sites-enabled
  install -m 644 "${TMP_DIR}/nginx.conf" "${CONF_AVAILABLE}"
  ln -sfn "${CONF_AVAILABLE}" "${CONF_ENABLED}"

  if [[ -L /etc/nginx/sites-enabled/default && "${DOMAIN}" != "_" ]]; then
    log "暂时移除 Debian 默认站点（备份为 default.disabled.${STAMP}）"
    mv /etc/nginx/sites-enabled/default "/etc/nginx/sites-enabled/default.disabled.${STAMP}"
  fi

  nginx -t || die "nginx 配置校验失败。请检查 ${CONF_AVAILABLE}。"
  systemctl reload nginx || systemctl restart nginx
  ok "nginx 已加载新配置（HTTPS：$([[ "${have_tls}" == 1 ]] && echo 已启用 || echo 未启用)）"
}

# ---------------------------------------------------------------- 证书

install_own_cert() {
  [[ -r "${CERT_PATH}" ]] || die "无法读取 CERT_PATH=${CERT_PATH}"
  [[ -r "${KEY_PATH}" ]]  || die "无法读取 KEY_PATH=${KEY_PATH}"

  if has openssl; then
    local a b
    a="$(openssl x509 -noout -modulus -in "${CERT_PATH}" 2>/dev/null | openssl md5 || true)"
    b="$(openssl rsa  -noout -modulus -in "${KEY_PATH}"  2>/dev/null | openssl md5 || true)"
    if [[ -n "$a" && -n "$b" && "$a" != "$b" ]]; then
      die "证书与私钥不匹配（modulus 不同）。请检查 CERT_PATH / KEY_PATH。"
    fi
    if ! openssl x509 -noout -checkend 0 -in "${CERT_PATH}" >/dev/null 2>&1; then
      warn "证书似乎已过期或格式异常，请确认后继续。"
    fi
  fi

  install -d -m 700 "${SSL_DIR}"
  install -m 644 "${CERT_PATH}" "${SSL_DIR}/fullchain.pem"
  install -m 600 "${KEY_PATH}"  "${SSL_DIR}/privkey.pem"
  TLS_MODE="own"
  ok "已安装自有证书：${SSL_DIR}/fullchain.pem"
}

obtain_cert() {
  if [[ -n "${CERT_PATH}" && -n "${KEY_PATH}" ]]; then
    TLS_MODE="own"
    install_own_cert
    return 0
  fi
  if [[ "${TLS_MODE}" == "none" ]]; then
    warn "跳过证书申请（DOMAIN=none）。"
    return 0
  fi

  run mkdir -p "${ACME_WEBROOT}"
  run chmod a+rX "${ACME_WEBROOT}"

  local email_arg=(--register-unsafely-without-email)
  [[ -n "${EMAIL}" ]] && email_arg=(--email "${EMAIL}")

  log "通过 webroot 申请 Let's Encrypt 证书：${DOMAIN}"
  if ! run certbot certonly --webroot \
      -w "${ACME_WEBROOT}" \
      -d "${DOMAIN}" \
      --non-interactive --agree-tos --keep-until-expiring \
      "${email_arg[@]}"; then
    warn "certbot 申请失败。常见原因："
    warn "  * 80 端口未开放（云安全组 / ufw / firewalld）"
    warn "  * 域名未解析到本机：dig +short ${DOMAIN}"
    warn "  * nip.io 解析异常或被网络拦截"
    warn "  * Let's Encrypt 速率限制"
    warn "站点将以 HTTP 继续提供服务；修复后重跑脚本即可。"
    TLS_MODE="none"
    return 0
  fi

  ok "证书已签发：/etc/letsencrypt/live/${DOMAIN}/"
  if run systemctl enable --now certbot.timer 2>/dev/null; then
    ok "已启用 certbot.timer 自动续期"
  else
    warn "未能启用 certbot.timer，请确认定时续期（cron 或 systemd timer）。"
  fi
}

# ---------------------------------------------------------------- 验证

verify() {
  if [[ "${DRY_RUN}" == "1" ]]; then
    warn "DRY_RUN=1：跳过网络验证。"
    return 0
  fi
  local scheme="http" host
  host="${DOMAIN}"
  if [[ "${TLS_MODE}" != "none" && -f "$(cert_file_for_mode)" ]]; then
    scheme="https"
  fi
  [[ "$host" == "_" ]] && host="127.0.0.1"

  if [[ ! -s "${SITE_ROOT}/index.html" ]]; then
    die "index.html 为空或缺失。"
  fi

  log "请求验证：${scheme}://${host}/"
  if curl -fsS --max-time 12 -o /dev/null -w '%{http_code}' "${scheme}://${host}/" 2>/dev/null \
     | grep -q '^200$'; then
    ok "HTTP 200：${scheme}://${host}/"
  else
    warn "无法通过 ${scheme}://${host}/ 访问。检查防火墙、安全组、DNS 与 nginx 状态。"
  fi
}

# ---------------------------------------------------------------- 输出

summary() {
  local scheme="http" host
  host="${DOMAIN}"
  [[ "$host" == "_" ]] && host="127.0.0.1"
  [[ "${TLS_MODE}" != "none" && -f "$(cert_file_for_mode)" ]] && scheme="https"

  cat <<EOF

────────────────────────────────────────────────────────────
 光谱档案部署完成
────────────────────────────────────────────────────────────
 访问地址   ${scheme}://${host}/
 站点目录   ${SITE_ROOT}
 配置文件   ${CONF_AVAILABLE}
 证书模式   ${TLS_MODE}
 访问日志   已关闭（错误日志：/var/log/nginx/${NGINX_SITE}.error.log）

 常用命令
   nginx -t && systemctl reload nginx      # 校验并重载
   certbot renew --dry-run                 # 验证证书续期
   bash install.sh                         # 重新部署（自动备份）

 提醒
   * 本脚本不收集数据，也不安装统计工具。
   * nip.io 只是通配 DNS，正式站点建议绑定自己的域名。
   * 部署前请阅读源码：https://github.com/${DEFAULT_REPO}/blob/main/deploy/install.sh
────────────────────────────────────────────────────────────

EOF
}

# ---------------------------------------------------------------- 主流程

spectrum_main() {
  require_root
  detect_os
  install_packages
  resolve_domain

  download_site
  write_nginx_conf   # 先用 HTTP 起站，供 ACME 验证

  obtain_cert

  if [[ "${TLS_MODE}" == "own" ]] || \
     { [[ "${TLS_MODE}" == "acme" ]] && [[ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; }; then
    write_nginx_conf # 证书就绪，启用 443 与跳转
  fi

  verify
  summary
}

spectrum_main "$@"
