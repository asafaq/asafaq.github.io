# Set environment variables
$env:DOTENVX_NO_COLOR = "true"
$env:DOTENVX_QUIET = "true"

# Paths
$serverPath = "C:\Users\1\code\guild\server\server.js"
$logPath = "C:\Users\1\code\guild\server\server.log"

# Run server and append output to log
node $serverPath 2>&1 | ForEach-Object {
    "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') $_"
} | Tee-Object -FilePath $logPath -Append
