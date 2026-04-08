const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const http = require('http');

// Web server giữ cho Render không kill process
http.createServer((req, res) => {
    res.writeHead(200);
    res.end(`Bot Army Active - ${activeBots}/${totalBots} bots online`);
}).listen(10000);

// CẤU HÌNH SERVER
const config = {
    host: "darkblademc.joinmc.world",
    port: 20674,
    version: "1.21.1",
    password: "matkhaucuaban"
};

// DANH SÁCH TÊN ĐỂ TẠO 1000 BOT KHÁC NHAU
const prefixes = ['Pro', 'Super', 'Ultra', 'Mega', 'Elite', 'Legend', 'Master', 'God', 'King', 'Queen', 'Lord', 'Shadow', 'Dark', 'Light', 'Storm', 'Blaze', 'Frost', 'Iron', 'Steel', 'Gold'];
const suffixes = ['X', 'Z', 'VN', 'US', 'EU', 'ASIA', 'Pro', 'Noob', 'God', 'King', '2000', '2024', '2025', 'MC', 'Bot'];

// Tạo username không trùng
function generateUsername(id) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${prefix}_${id}_${suffix}`;
}

// DANH SÁCH CÂU CHAT NGẪU NHIÊN
const chatMessages = [
    "Hello!", "Hi!", "Hey!", "Good game!", "Let's play!", "Anyone online?",
    "Nice server!", "gg", "wp", "lol", "What's up?", "How are you?",
    "Team up?", "Let's go!", "Mining time!", "Building!", "PVP anyone?",
    "Where's the boss?", "Trading items!", "Selling gear!", "Need help!",
    "Great server!", "Best server!", "So fun!", "Awesome!", "Cool!"
];

// Delay helper
const randomDelay = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

// Bot tracking
let activeBots = 0;
let totalBots = 1000; // 1000 CON BOT
let botInstances = [];

// Tạo 1 bot
async function createBot(botId) {
    const username = generateUsername(botId);
    
    console.log(`[Bot ${botId}] 🔌 Đang kết nối: ${username} (${activeBots + 1}/${totalBots})`);
    
    const bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: username,
        version: config.version,
        auth: 'offline',
        hideErrors: true,
        connectTimeout: 60000
    });
    
    bot.loadPlugin(pathfinder);
    
    // Biến lưu trạng thái bot
    let actionInterval = null;
    let jumpInterval = null;
    let lastChat = 0;
    let onlineStart = Date.now();
    
    bot.once('spawn', () => {
        activeBots++;
        console.log(`[Bot ${botId}] ✅ ĐÃ VÀO SERVER! Username: ${username} | Active: ${activeBots}/${totalBots}`);
        
        // === ĐĂNG NHẬP / ĐĂNG KÝ ===
        setTimeout(() => {
            bot.chat(`/login ${config.password}`);
            setTimeout(() => {
                bot.chat(`/register ${config.password} ${config.password}`);
                setTimeout(() => {
                    bot.chat(`/login ${config.password}`);
                }, 1000);
            }, 1000);
        }, randomDelay(1000, 3000));
        
        // === GỬI 1 CÂU CHAT NGAY KHI VÀO ===
        setTimeout(() => {
            const welcomeMsg = chatMessages[Math.floor(Math.random() * chatMessages.length)];
            bot.chat(welcomeMsg);
            console.log(`[Bot ${botId}] 💬 Đã chat: "${welcomeMsg}"`);
        }, randomDelay(3000, 6000));
        
        // === HÀNH ĐỘNG CHÍNH MỖI 1-3 GIÂY ===
        actionInterval = setInterval(async () => {
            if (!bot.entity || !bot.entity.position) return;
            
            const action = Math.random();
            const now = Date.now();
            
            try {
                // 1. NHẢY LIÊN TỤC (random 0.5-2 giây/lần)
                if (Math.random() > 0.6) {
                    bot.setControlState('jump', true);
                    setTimeout(() => bot.setControlState('jump', false), randomDelay(100, 300));
                }
                
                // 2. DI CHUYỂN NGẪU NHIÊN (40%)
                if (action < 0.4) {
                    const range = randomDelay(3, 10);
                    const x = bot.entity.position.x + (Math.random() - 0.5) * range;
                    const z = bot.entity.position.z + (Math.random() - 0.5) * range;
                    const movements = new Movements(bot);
                    movements.allowParkour = true;
                    bot.pathfinder.setMovements(movements);
                    bot.pathfinder.setGoal(new goals.GoalNear(x, bot.entity.position.y, z, 1));
                }
                
                // 3. XOAY ĐẦU QUAN SÁT (30%)
                else if (action < 0.7) {
                    const yaw = Math.random() * Math.PI * 2;
                    const pitch = (Math.random() - 0.5) * Math.PI / 2;
                    bot.look(yaw, pitch);
                }
                
                // 4. ĐÀO BLOCK (15%)
                else if (action < 0.85) {
                    const block = bot.findBlock({
                        matching: (b) => ['stone', 'dirt', 'grass_block', 'sand', 'gravel', 'cobblestone'].includes(b.name),
                        maxDistance: 4
                    });
                    if (block) {
                        await bot.dig(block).catch(() => {});
                    }
                }
                
                // 5. CHAT SPAM (15% nhưng có cooldown 20-40 giây)
                else if (now - lastChat > randomDelay(20000, 40000)) {
                    const msg = chatMessages[Math.floor(Math.random() * chatMessages.length)];
                    bot.chat(msg);
                    lastChat = now;
                    console.log(`[Bot ${botId}] 💬 Chat: "${msg}"`);
                }
                
            } catch (err) {
                // Bỏ qua lỗi
            }
        }, randomDelay(1000, 3000)); // Mỗi 1-3 giây hành động 1 lần
        
        // === NHẢY RIÊNG BIỆT MỖI 1 GIÂY ===
        jumpInterval = setInterval(() => {
            if (bot.entity && Math.random() > 0.5) {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), randomDelay(50, 150));
            }
        }, randomDelay(800, 1200));
        
        // === TỰ ĐỘNG THOÁT SAU 3-7 PHÚT (luân phiên) ===
        const onlineDuration = randomDelay(180000, 420000); // 3-7 phút
        setTimeout(() => {
            console.log(`[Bot ${botId}] 🔄 Luân phiên: thoát sau ${Math.floor(onlineDuration/60000)} phút`);
            if (actionInterval) clearInterval(actionInterval);
            if (jumpInterval) clearInterval(jumpInterval);
            bot.quit();
        }, onlineDuration);
    });
    
    // === XỬ LÝ KHI THOÁT ===
    bot.on('end', (reason) => {
        activeBots--;
        console.log(`[Bot ${botId}] ❌ THOÁT: ${reason} | Active: ${activeBots}/${totalBots}`);
        
        if (actionInterval) clearInterval(actionInterval);
        if (jumpInterval) clearInterval(jumpInterval);
        
        // Xóa khỏi danh sách
        const index = botInstances.indexOf(bot);
        if (index > -1) botInstances.splice(index, 1);
        
        // RECONNECT SAU 1-3 PHÚT
        const reconnectDelay = randomDelay(60000, 180000);
        console.log(`[Bot ${botId}] ⏰ Reconnect sau ${Math.floor(reconnectDelay/1000)} giây`);
        setTimeout(() => {
            createBot(botId);
        }, reconnectDelay);
    });
    
    // === XỬ LÝ LỖI ===
    bot.on('error', (err) => {
        if (err.code !== 'ECONNREFUSED') {
            console.log(`[Bot ${botId}] ⚠️ Lỗi: ${err.code || err.message}`);
        }
    });
    
    bot.on('kicked', (reason) => {
        console.log(`[Bot ${botId}] 👢 BỊ KICK: ${reason.substring(0, 100)}`);
        setTimeout(() => createBot(botId), randomDelay(60000, 120000));
    });
    
    botInstances.push(bot);
    return bot;
}

// === KHỞI TẠO 1000 BOT ===
console.log('🔥 ===== BOT ARMY 1000 CON ===== 🔥');
console.log(`🎯 Target: ${totalBots} bots`);
console.log(`📡 Server: ${config.host}:${config.port}`);
console.log('================================\n');

// Spawn bot từ từ, mỗi lần 5 bot, cách nhau 2 giây
const BOTS_PER_BATCH = 5;
const BATCH_DELAY = 2000;

async function spawnAllBots() {
    for (let i = 1; i <= totalBots; i++) {
        createBot(i);
        
        // Spawn theo batch để tránh quá tải
        if (i % BOTS_PER_BATCH === 0) {
            console.log(`📦 Đã spawn ${i}/${totalBots} bot`);
            await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
        }
        
        // Delay nhỏ giữa mỗi bot
        await new Promise(resolve => setTimeout(resolve, randomDelay(100, 500)));
    }
}

spawnAllBots();

// === GIÁM SÁT HIỆU SUẤT MỖI 30 GIÂY ===
setInterval(() => {
    console.log(`\n📊 === STATUS ===`);
    console.log(`🟢 Active bots: ${activeBots}/${totalBots}`);
    console.log(`💾 Memory: ${Math.floor(process.memoryUsage().rss / 1024 / 1024)} MB`);
    console.log(`⏱️ Uptime: ${Math.floor(process.uptime() / 60)} phút`);
    console.log(`================\n`);
}, 30000);

// === XỬ LÝ THOÁT ===
process.on('SIGINT', () => {
    console.log('\n🛑 Đang tắt bot...');
    botInstances.forEach(bot => {
        if (bot && bot.end) bot.quit();
    });
    setTimeout(() => process.exit(0), 5000);
});

console.log('✅ ĐANG CHẠY 1000 BOT...');
