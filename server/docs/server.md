# PM2服务器启动相关
## 启动服务（读取 ecosystem.config.js）
pm2 start ecosystem.config.js

## 查看进程列表
pm2 list

## 看实时日志
pm2 logs bill-record

## 重启（改代码重新build后执行）
pm2 restart bill-record

## 停止服务
pm2 stop bill-record

## 删除进程
pm2 delete bill-record
