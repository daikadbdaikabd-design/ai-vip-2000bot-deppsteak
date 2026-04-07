const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const http = require('http');

// 1. TẠO WEB SERVER GIẢ (FIX LỖI RENDER RESTART)
http.createServer((req, res) => {
    res.write('Bot is alive!');
    res.end();
}).listen(10000); 

const config = {
    host: "warmhousesmp.nethr.nl", 
    port: 9598,        
    username: 'Pro_SuperBot',
    version: '1.21.1',  
    password: 'matkhaucuaban' 
};

function startBot() {
    const bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: config.username,
        version: config.version,
        hideErrors: true // Ẩn bớt lỗi vặt để log sạch hơn
    });

    bot.loadPlugin(pathfinder);

    console.log('--- Đang gửi yêu cầu kết nối... ---');

    bot.on('spawn', () => {
        console.log('✅ Bot đã vào server thành công!');
        
        // Đăng nhập/Đăng ký
        setTimeout(() => {
            bot.chat(`/register ${config.password} ${config.password}`);
            bot.chat(`/login ${config.password}`);
        }, 2000);

        // Chuỗi hành động quậy phá (8 giây đổi 1 lần)
        const actionInterval = setInterval(async () => {
            if (!bot.entity) return;
            const r = Math.random();
            
            try {
                if (r < 0.25) { // Phá block
                    const block = bot.findBlock({
                        matching: (b) => ['grass_block', 'dirt', 'stone', 'sand', 'short_grass', 'tall_grass'].includes(b.name),
                        maxDistance: 4
                    });
                    if (block) await bot.dig(block);
                } else if (r < 0.5) { // Đi dạo
                    const x = bot.entity.position.x + (Math.random() - 0.5) * 6;
                    const z = bot.entity.position.z + (Math.random() - 0.5) * 6;
                    bot.pathfinder.setMovements(new Movements(bot));
                    bot.pathfinder.setGoal(new goals.GoalNear(x, bot.entity.position.y, z, 1));
                } else if (r < 0.7) { // Xoay + Nhảy
                    bot.look(Math.random() * Math.PI * 2, 0);
                    bot.setControlState('jump', true);
                    setTimeout(() => bot.setControlState('jump', false), 500);
                } else { // Chat
                    bot.chat("Checking server status... [AFK]");
                }
            } catch (e) {}
        }, 8000);

        // Treo lâu hơn (10 phút) để tránh lỗi "Tên này đã online" do ra vào liên tục
        setTimeout(() => {
            console.log('Nghỉ giải lao 1 phút...');
            clearInterval(actionInterval);
            bot.quit();
        }, 600000); 
    });

    bot.on('end', (reason) => {
        console.log(`Bot thoát do: ${reason}. Chờ 60 giây để vào lại...`);
        setTimeout(() => startBot(), 60000);
    });

    bot.on('error', (err) => {
        if (err.code === 'ECONNREFUSED') {
            console.log('❌ Server đang tắt, chờ kết nối lại...');
        } else {
            console.log('Lỗi:', err.message);
        }
    });
}

// Bắt đầu chạy
startBot();
