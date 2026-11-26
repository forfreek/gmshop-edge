# Cloudflare deployment / Cloudflare 部署

The `Deploy Cloudflare` workflow deploys this fork's `main` branch on push or
manual dispatch. Configure `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
in repository Actions secrets. Dependencies use the committed Bun version and lockfile.

`Deploy Cloudflare` 工作流在推送或手动触发时部署此 Fork 的 `main` 分支。
在仓库 Actions Secrets 中配置上述两项凭据，依赖使用仓库固定版本与锁文件。

All five repository quality gates run before remote changes. The explicit
`predeploy` step creates or reuses named D1/KV/R2/Queues resources, applies remote
D1 migrations, and builds the Workers output. Deployment uses the generated
`dist/server/wrangler.json`, including resolved storage IDs. Deployments are serialized.

远程变更前先执行项目五项质量检查。`predeploy` 准备资源、迁移远程 D1 并构建
Workers；部署使用含解析后资源 ID 的生成配置。同一时间只允许一个生产部署。

After the first deployment, open `/install` to create your own root account and
confirm Origin/Allowed Hosts. Provider credentials are configured in `/admin`.
Before subsequent schema changes, back up D1 and private R2 data.

首次部署后访问 `/install` 创建自己的管理员并确认 Origin/Allowed Hosts；
业务凭据在 `/admin` 配置。后续更改数据库结构前备份 D1 和私有 R2 数据。
