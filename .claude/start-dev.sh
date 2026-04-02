#!/bin/bash
export PATH="/usr/local/bin:/Users/giselycolin/.nvm/versions/node/v22.22.1/bin:/usr/bin:/bin:$PATH"
export NODE_PATH="/Users/giselycolin/tryon-app/node_modules"
cd /Users/giselycolin/tryon-app
exec /usr/local/bin/node node_modules/next/dist/bin/next dev -p "${PORT:-3000}"
