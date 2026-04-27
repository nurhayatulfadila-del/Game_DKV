// ================= CANVAS =================
// Mengambil elemen canvas dari HTML
const canvas = document.getElementById("gameCanvas");

// Context 2D untuk menggambar di canvas
const ctx = canvas.getContext("2d");

// ================= KONFIGURASI GAME =================
const box = 15;          // Ukuran 1 kotak ular (grid)
const speed = 150;       // Kecepatan game (semakin kecil = semakin cepat)
const deadZone = 0.4;    // Batas sensitif joystick analog

// ================= VARIABEL GAME =================
let snake;               // Array posisi tubuh ular
let direction;           // Arah gerak ular
let food;                // Posisi makanan
let game;                // Interval game
let score = 0;           // Skor pemain
let playerName = "";     // Nama pemain

// ================= START GAME =================
// Dipanggil saat tombol "Mulai Game" diklik
function startGame() {

    // Ambil nama dari input
    const nameInput = document.getElementById("playerName").value.trim();

    // Validasi nama wajib diisi
    if (!nameInput) {
        alert("Nama wajib diisi!");
        return;
    }

    // Simpan nama player
    playerName = nameInput;
    document.getElementById("playerLabel").innerText = playerName;

    // Sembunyikan landing page
    document.getElementById("landing").style.display = "none";

    // Tampilkan halaman game
    document.getElementById("gamePage").style.display = "block";

    // Inisialisasi game
    initGame();
}

// ================= INIT GAME =================
// Menyiapkan kondisi awal game
function initGame() {

    // Posisi awal ular (1 kotak)
    snake = [{ x: 10 * box, y: 10 * box }];

    // Arah awal ke kanan
    direction = "RIGHT";

    // Reset skor
    score = 0;
    document.getElementById("score").innerText = score;

    // Buat makanan pertama
    food = spawnFood();

    // Jalankan game secara berulang
    game = setInterval(draw, speed);

    // Aktifkan pembacaan gamepad
    requestAnimationFrame(gamepadLoop);
}

// ================= SPAWN FOOD =================
// Membuat posisi makanan secara acak
function spawnFood() {
    return {
        x: Math.floor(Math.random() * (canvas.width / box)) * box,
        y: Math.floor(Math.random() * (canvas.height / box)) * box
    };
}

// ================= SET ARAH =================
// Mengubah arah ular (dengan mencegah balik arah langsung)
function setDirection(dir) {
    if (dir === "LEFT" && direction !== "RIGHT") direction = dir;
    if (dir === "RIGHT" && direction !== "LEFT") direction = dir;
    if (dir === "UP" && direction !== "DOWN") direction = dir;
    if (dir === "DOWN" && direction !== "UP") direction = dir;
}

// ================= KEYBOARD =================
// Kontrol menggunakan keyboard
document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") setDirection("UP");
    if (e.key === "ArrowDown") setDirection("DOWN");
    if (e.key === "ArrowLeft") setDirection("LEFT");
    if (e.key === "ArrowRight") setDirection("RIGHT");
});

// ================= GAMEPAD =================
// Support joystick: Analog, D-Pad, dan tombol ABXY
function gamepadLoop() {
    const pads = navigator.getGamepads();

    for (let gp of pads) {
        if (!gp) continue;

        // ===== ANALOG STICK =====
        const x = gp.axes[0];
        const y = gp.axes[1];

        if (x < -deadZone) setDirection("LEFT");
        if (x > deadZone) setDirection("RIGHT");
        if (y < -deadZone) setDirection("UP");
        if (y > deadZone) setDirection("DOWN");

        // ===== D-PAD =====
        if (gp.buttons[12]?.pressed) setDirection("UP");
        if (gp.buttons[13]?.pressed) setDirection("DOWN");
        if (gp.buttons[14]?.pressed) setDirection("LEFT");
        if (gp.buttons[15]?.pressed) setDirection("RIGHT");

        // ===== TOMBOL ABXY (CUSTOM MAPPING) =====
        if (gp.buttons[0]?.pressed) setDirection("DOWN");   // A → TURUN
        if (gp.buttons[1]?.pressed) setDirection("RIGHT");  // B → KANAN
        if (gp.buttons[2]?.pressed) setDirection("LEFT");   // X → KIRI
        if (gp.buttons[3]?.pressed) setDirection("UP");     // Y → ATAS

    }

    requestAnimationFrame(gamepadLoop);
}

// ================= DRAW GAME =================
// Fungsi utama untuk menggambar game
function draw() {

    // Bersihkan canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gambar ular
    snake.forEach((s, i) => {
        ctx.fillStyle = i === 0 ? "#00ff99" : "#fff"; // Kepala beda warna
        ctx.fillRect(s.x, s.y, box, box);
    });

    // Gambar makanan
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    // Hitung posisi kepala baru
    let head = { ...snake[0] };
    if (direction === "LEFT") head.x -= box;
    if (direction === "RIGHT") head.x += box;
    if (direction === "UP") head.y -= box;
    if (direction === "DOWN") head.y += box;

    // Cek tabrakan dinding atau tubuh sendiri
    if (
        head.x < 0 || head.y < 0 ||
        head.x >= canvas.width || head.y >= canvas.height ||
        snake.slice(1).some(s => s.x === head.x && s.y === head.y)
    ) {
        gameOver();
        return;
    }

    // Cek makan makanan
    if (head.x === food.x && head.y === food.y) {
        score++;
        document.getElementById("score").innerText = score;
        food = spawnFood();
    } else {
        // Jika tidak makan, ekor dihapus
        snake.pop();
    }

    // Tambah kepala baru
    snake.unshift(head);
}

// ================= GAME OVER =================
// Saat ular menabrak
function gameOver() {
    clearInterval(game);

    // Simpan skor ke localStorage
    const data = JSON.parse(localStorage.getItem("snakeScores")) || [];
    data.push({ name: playerName, score });
    localStorage.setItem("snakeScores", JSON.stringify(data));

    alert(`Game Over\n${playerName} : ${score}`);
    location.reload();
}

// ================= RIWAYAT SKOR =================
// Menampilkan 5 skor terakhir
function loadHistory() {
    const data = JSON.parse(localStorage.getItem("snakeScores")) || [];
    const list = document.getElementById("scoreHistory");
    list.innerHTML = "";

    data.slice(-5).reverse().forEach(d => {
        const li = document.createElement("li");
        li.innerText = `${d.name} : ${d.score}`;
        list.appendChild(li);
    });
}

// ================= RESET RIWAYAT =================
function resetHistory() {
    if (confirm("Hapus semua riwayat skor?")) {
        localStorage.removeItem("snakeScores");
        loadHistory();
    }
}

// Load skor saat halaman dibuka
loadHistory();
