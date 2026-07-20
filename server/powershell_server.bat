$env:NO_COLOR = "true"
node server.js 2>&1 | Tee-Object server.log -Append