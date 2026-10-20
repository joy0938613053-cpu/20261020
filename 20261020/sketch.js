// p5.js 食物連連看測驗系統 (Food Matching Quiz)
// sketch.js

let gameState = "START"; // "START", "PLAYING", "RESULT"
let currentQuestions = [];
let currentQIndex = 0;
let score = 0;
let totalQuestions = 3;

// 15題完整題庫 (包含中英文註解、目標食物繪圖參數與干擾選項)
let masterFoodBank = [
  { name: "漢堡 (Hamburger)", type: "fastfood", color: [222, 140, 71], correct: "漢堡 (Hamburger)" },
  { name: "薯條 (French Fries)", type: "fastfood", color: [241, 196, 15], correct: "薯條 (French Fries)" },
  { name: "披薩 (Pizza)", type: "fastfood", color: [230, 126, 34], correct: "披薩 (Pizza)" },
  { name: "壽司 (Sushi)", type: "japanese", color: [236, 240, 241], correct: "壽司 (Sushi)" },
  { name: "拉麵 (Ramen)", type: "japanese", color: [243, 156, 18], correct: "拉麵 (Ramen)" },
  { name: "章魚燒 (Takoyaki)", type: "japanese", color: [211, 84, 0], correct: "章魚燒 (Takoyaki)" },
  { name: "小籠包 (Soup Dumpling)", type: "chinese", color: [250, 250, 250], correct: "小籠包 (Soup Dumpling)" },
  { name: "牛肉麵 (Beef Noodles)", type: "chinese", color: [120, 66, 18], correct: "牛肉麵 (Beef Noodles)" },
  { name: "珍奶 (Bubble Tea)", type: "beverage", color: [160, 82, 45], correct: "珍奶 (Bubble Tea)" },
  { name: "芒果冰 (Mango Shaved Ice)", type: "dessert", color: [241, 196, 15], correct: "芒果冰 (Mango Shaved Ice)" },
  { name: "鬆餅 (Waffle)", type: "dessert", color: [211, 137, 72], correct: "鬆餅 (Waffle)" },
  { name: "馬卡龍 (Macaron)", type: "dessert", color: [255, 182, 193], correct: "馬卡龍 (Macaron)" },
  { name: "義大利麵 (Spaghetti)", type: "western", color: [241, 196, 15], correct: "義大利麵 (Spaghetti)" },
  { name: "凱薩沙拉 (Caesar Salad)", type: "western", color: [46, 204, 113], correct: "凱薩沙拉 (Caesar Salad)" },
  { name: "牛排 (Steak)", type: "western", color: [139, 69, 19], correct: "牛排 (Steak)" }
];

// 當前題目的配對資料
let targets = []; // 上方3個目標食物
let options = []; // 下方6個文字選項
let selectedTarget = null;
let selectedOption = null;
let userAnswers = []; // 紀錄使用者的連線回答

// UI 按鈕
let startButton, submitButton, restartButton;

// 裝飾用 GIF 圖片物件陣列
let decors = [];

function setup() {
  createCanvas(900, 700);
  textAlign(CENTER, CENTER);
  rectMode(CORNER);

  // 建立動態裝飾小物件/GIF 模擬漂浮物
  for (let i = 0; i < 6; i++) {
    decors.push({
      x: random(50, width - 50),
      y: random(40, height - 40),
      speedX: random(-0.8, 0.8),
      speedY: random(-0.5, 0.5),
      size: random(25, 45),
      emoji: random(["✨", "⭐", "🍃", "💖", "🎈", "🌟"])
    });
  }
}

function draw() {
  background(248, 250, 252);

  // 繪製背景漂浮裝飾（不影響作答）
  drawBackgroundDecor();

  if (gameState === "START") {
    drawStartScreen();
  } else if (gameState === "PLAYING") {
    drawGameScreen();
  } else if (gameState === "RESULT") {
    drawResultScreen();
  }
}

// 繪製背景裝飾與 GIF 動態感
function drawBackgroundDecor() {
  push();
  for (let d of decors) {
    d.x += d.speedX;
    d.y += d.speedY;
    if (d.x < 20 || d.x > width - 20) d.speedX *= -1;
    if (d.y < 20 || d.y > height - 20) d.speedY *= -1;

    textSize(d.size);
    // 輕微晃動效果
    let wobble = sin(frameCount * 0.05 + d.x) * 5;
    text(d.emoji, d.x, d.y + wobble);
  }
  pop();
}

// 1. 開始畫面
function drawStartScreen() {
  if (startButton && startButton.elt) startButton.show();
  if (submitButton && submitButton.elt) submitButton.hide();
  if (restartButton && restartButton.elt) restartButton.hide();

  push();
  // 標題外框裝飾
  fill(255, 255, 255, 220);
  stroke(220, 180, 200);
  strokeWeight(4);
  rect(width / 2 - 320, height / 2 - 200, 640, 380, 25);

  noStroke();
  fill(50, 50, 70);
  textSize(36);
  textStyle(BOLD);
  text("🍽️ 食物連連看大挑戰 🍽️", width / 2, height / 2 - 120);

  textSize(18);
  textStyle(NORMAL);
  fill(90, 90, 110);
  text("測驗說明：", width / 2, height / 2 - 60);
  text("1. 總共 3 個關卡，每關上方有 3 個晃動的美味食物圖示。", width / 2, height / 2 - 20);
  text("2. 下方有 6 個純文字選項（含中英文），請點選左側目標再點選右側文字進行連線。", width / 2, height / 2 + 20);
  text("3. 全部作答完畢後統一提交，系統將自動比對並給予音效與成績結算！", width / 2, height / 2 + 60);

  // 繪製開始按鈕 (如果還沒建立DOM)
  if (!startButton) {
    startButton = createButton("開始遊戲 Start Game");
    startButton.position(width / 2 - 110, height / 2 + 130);
    startButton.size(220, 50);
    startButton.style('background-color', '#ff6b81');
    startButton.style('color', 'white');
    startButton.style('font-size', '18px');
    startButton.style('font-weight', 'bold');
    startButton.style('border', 'none');
    startButton.style('border-radius', '25px');
    startButton.style('cursor', 'pointer');
    startButton.mousePressed(startGame);
  }
  pop();
}

function startGame() {
  if (startButton) startButton.hide();
  gameState = "PLAYING";
  currentQIndex = 0;
  score = 0;
  userAnswers = [];
  loadNewRound();
}

// 載入新一局題目（3個目標，6個選項）
function loadNewRound() {
  // 從題庫隨機挑選 3 個不同的食物作為本局目標
  let shuffledBank = shuffle([...masterFoodBank]);
  let roundTargets = shuffledBank.slice(0, 3);

  targets = roundTargets.map((item, index) => ({
    id: index,
    data: item,
    x: 180 + index * 270,
    y: 180,
    w: 200,
    h: 130
  }));

  // 準備 3 個正確答案 + 3 個隨機干擾選項
  let correctAnswers = roundTargets.map(item => item.correct);
  let distractors = masterFoodBank
    .filter(item => !roundTargets.includes(item))
    .map(item => item.correct);
  let shuffledDistractors = shuffle(distractors).slice(0, 3);
  
  let combinedOptions = shuffle([...correctAnswers, ...shuffledDistractors]);

  options = combinedOptions.map((optText, index) => ({
    id: index,
    text: optText,
    x: 180 + (index % 3) * 270,
    y: 490 + Math.floor(index / 3) * 85,
    w: 220,
    h: 65
  }));

  selectedTarget = null;
  selectedOption = null;
}

// 2. 遊戲進行畫面
function drawGameScreen() {
  if (startButton && startButton.elt) startButton.hide();

  // 建立提交按鈕
  if (!submitButton) {
    submitButton = createButton("提交答案 Submit");
    submitButton.position(width / 2 - 90, height - 60);
    submitButton.size(180, 40);
    submitButton.style('background-color', '#2ed573');
    submitButton.style('color', 'white');
    submitButton.style('font-size', '16px');
    submitButton.style('font-weight', 'bold');
    submitButton.style('border', 'none');
    submitButton.style('border-radius', '20px');
    submitButton.style('cursor', 'pointer');
    submitButton.mousePressed(submitRound);
  }
  submitButton.show();

  // 顯示進度與提示
  push();
  fill(50);
  textSize(20);
  textStyle(BOLD);
  text(`第 ${currentQIndex + 1} 題 / 共 ${totalQuestions} 題`, width / 2, 40);
  
  textSize(14);
  fill(120);
  text("請點擊上方具備晃動特效的食物圖卡，再點擊下方對應的中英文文字選項進行連線", width / 2, 70);
  pop();

  // 繪製上方目標食物（帶有晃動裝飾）
  for (let t of targets) {
    push();
    // 晃動特效角度
    let wiggleAngle = sin(frameCount * 0.08 + t.id * 2) * 0.05;
    translate(t.x, t.y);
    rotate(wiggleAngle);

    // 卡片外框
    fill(255);
    stroke(selectedTarget === t ? '#ff4757' : '#ced6e0');
    strokeWeight(selectedTarget === t ? 4 : 2);
    rect(-t.w/2, -t.h/2, t.w, t.h, 15);

    // 模擬食物圖形
    noStroke();
    fill(t.data.color[0], t.data.color[1], t.data.color[2]);
    ellipse(0, -15, 60, 60);
    
    // 裝飾小貼圖
    textSize(20);
    text("⭐", 50, -35);

    // 標題
    fill(40);
    textSize(13);
    textStyle(BOLD);
    text(t.data.name, 0, 32);
    pop();
  }

  // 繪製下方文字選項（嚴格規定：前面不可以有圖片，純文字）
  for (let o of options) {
    push();
    fill(255);
    stroke(selectedOption === o ? '#3742fa' : '#dfe4ea');
    strokeWeight(selectedOption === o ? 4 : 2);
    rect(o.x - o.w/2, o.y - o.h/2, o.w, o.h, 12);

    fill(47, 54, 64);
    textSize(15);
    textStyle(BOLD);
    // 純文字呈現，無任何圖片或Emoji在選項前
    text(o.text, o.x, o.y);
    pop();
  }

  // 繪製已連線的線條
  for (let conn of userAnswers) {
    if (conn.round === currentQIndex) {
      let tObj = targets.find(t => t.data.name === conn.targetName);
      let oObj = options.find(o => o.text === conn.optionText);
      if (tObj && oObj) {
        stroke(53, 59, 72);
        strokeWeight(3);
        line(tObj.x, tObj.y + tObj.h/2, oObj.x, oObj.y - oObj.h/2);
      }
    }
  }

  // 如果當前選中了目標與選項，自動記錄連線
  if (selectedTarget && selectedOption) {
    // 移除舊的該目標連線
    userAnswers = userAnswers.filter(a => !(a.round === currentQIndex && a.targetName === selectedTarget.data.name));
    // 增加新連線
    userAnswers.push({
      round: currentQIndex,
      targetName: selectedTarget.data.name,
      optionText: selectedOption.text
    });
    selectedTarget = null;
    selectedOption = null;
  }
}

// 滑鼠點擊互動選取
function mousePressed() {
  if (gameState !== "PLAYING") return;

  // 檢查是否點擊上方目標
  for (let t of targets) {
    if (mouseX > t.x - t.w/2 && mouseX < t.x + t.w/2 &&
        mouseY > t.y - t.h/2 && mouseY < t.y + t.h/2) {
      selectedTarget = t;
      playClickSound();
      return;
    }
  }

  // 檢查是否點擊下方文字選項
  for (let o of options) {
    if (mouseX > o.x - o.w/2 && mouseX < o.x + o.w/2 &&
        mouseY > o.y - o.h/2 && mouseY < o.y + o.h/2) {
      selectedOption = o;
      playClickSound();
      return;
    }
  }
}

// 提交當前關卡
function submitRound() {
  // 檢查是否3個目標都連線了
  let currentRoundConns = userAnswers.filter(a => a.round === currentQIndex);
  if (currentRoundConns.length < 3) {
    alert("請將所有 3 個食物目標都完成連線後再提交！");
    return;
  }

  currentQIndex++;
  if (currentQIndex < totalQuestions) {
    loadNewRound();
  } else {
    // 全局結算
    if (submitButton) submitButton.hide();
    gameState = "RESULT";
    calculateScore();
  }
}

// 計算總成績
function calculateScore() {
  score = 0;
  for (let ans of userAnswers) {
    if (ans.targetName === ans.optionText) {
      score++;
    }
  }
  playResultSound(score);
}

// 3. 結算畫面
function drawResultScreen() {
  if (submitButton && submitButton.elt) submitButton.hide();

  push();
  fill(255, 255, 255, 240);
  stroke(200, 220, 240);
  strokeWeight(4);
  rect(width / 2 - 350, height / 2 - 240, 700, 440, 25);

  noStroke();
  fill(47, 54, 64);
  textSize(32);
  textStyle(BOLD);
  text("🎉 測驗結算與解答揭曉 🎉", width / 2, height / 2 - 180);

  textSize(22);
  let totalPairs = totalQuestions * 3;
  fill(score === totalPairs ? 46 : 220, score === totalPairs ? 204 : 20, score === totalPairs ? 113 : 60);
  text(`您的總成績：${score} / ${totalPairs} 題正確`, width / 2, height / 2 - 130);

  // 顯示詳細解答與對錯綠紅框提示
  textSize(14);
  fill(80);
  text("【連線對錯回顧】", width / 2, height / 2 - 90);

  let startY = height / 2 - 60;
  let index = 0;
  for (let ans of userAnswers) {
    let isCorrect = (ans.targetName === ans.optionText);
    
    // 繪製對錯外框提示
    stroke(isCorrect ? '#2ed573' : '#ff4757');
    strokeWeight(2);
    fill(isCorrect ? 220 : 255, 245, 230, 100);
    rect(width / 2 - 300, startY + index * 42, 600, 36, 8);

    noStroke();
    fill(40);
    textAlign(LEFT, CENTER);
    text(`目標: ${ans.targetName}`, width / 2 - 280, startY + index * 42 + 18);
    text(`您的回答: ${ans.optionText}`, width / 2 - 40, startY + index * 42 + 18);
    
    // 對錯標示文字
    fill(isCorrect ? '#2ed573' : '#ff4757');
    textStyle(BOLD);
    text(isCorrect ? "✔ 答對" : "✘ 答錯", width / 2 + 220, startY + index * 42 + 18);
    textStyle(NORMAL);

    index++;
  }
  textAlign(CENTER, CENTER);

  // 重新開始按鈕
  if (!restartButton) {
    restartButton = createButton("重新挑戰 Play Again");
    restartButton.position(width / 2 - 110, height / 2 + 155);
    restartButton.size(220, 45);
    restartButton.style('background-color', '#3742fa');
    restartButton.style('color', 'white');
    restartButton.style('font-size', '16px');
    restartButton.style('font-weight', 'bold');
    restartButton.style('border', 'none');
    restartButton.style('border-radius', '22px');
    restartButton.style('cursor', 'pointer');
    restartButton.mousePressed(resetGame);
  }
  restartButton.show();
  pop();
}

function resetGame() {
  if (restartButton) restartButton.hide();
  gameState = "START";
}

// Web Audio API 音效產生器
function playClickSound() {
  try {
    let ctx = getAudioContext();
    if (ctx.state !== 'running') ctx.resume();
    let osc = ctx.createOscillator();
    let gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    // 略過瀏覽器自動撥放限制
  }
}

function playResultSound(finalScore) {
  try {
    let ctx = getAudioContext();
    if (ctx.state !== 'running') ctx.resume();
    let osc = ctx.createOscillator();
    let gain = ctx.createGain();
    osc.type = 'triangle';
    if (finalScore >= 8) {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3);
    } else {
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.setValueAtTime(200, ctx.currentTime + 0.2);
    }
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {}
}