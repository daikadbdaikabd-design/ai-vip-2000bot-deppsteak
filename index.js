const mineflayer = require('mineflayer')

function createBot() {

const bot = mineflayer.createBot({
  host: 'darkblademc.falix.dev',
  port: 31985,
  username: 'MeMayBeo',
  version: false
})

bot.on('messagestr', (msg) => {

  // nếu server yêu cầu register
  if (msg.includes('/register')) {
    bot.chat('/register bot123 bot123')
  }

  // nếu server yêu cầu login
  if (msg.includes('/login')) {
    bot.chat('/login bot123')
  }

})

bot.on('spawn', () => {
  console.log('Bot đã vào server')

  // chống AFK
  setInterval(() => {
    bot.setControlState('jump', true)
    setTimeout(() => bot.setControlState('jump', false), 400)
  }, 20000)

})

bot.on('end', () => {
  console.log('Bot bị dis, reconnect sau 20s...')
  setTimeout(createBot, 20000)
})

bot.on('error', () => {})

}

createBot()