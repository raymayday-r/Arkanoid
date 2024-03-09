// 按R重新開始
addEventListener("keydown", reset);
function reset(down) {
  if (down.key == "r" || down.key == "R") {
    location.reload();
  }
}

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// 每次畫面刷新的間隔時間，越小速度越快
const gameSpeed = 4;

// 板子屬性
let slide = {
  length: 94, // 距離為左右圓心
  thickness: 6,
  xLocation: null,
  yLocation: 356,
  speed: (() => {
    if (
      navigator.userAgent.indexOf("Edg") != -1 ||
      navigator.userAgent.indexOf("Chrome") != -1
    ) {
      return 3;
    } else if (navigator.userAgent.indexOf("Firefox") != -1) {
      return 12;
    }
  })(), // 依瀏覽器變化
  direction: "stop",
  leftKeySwitch: true, // 移動鍵接受的開關，用於改善操作體驗
  rightKeySwitch: true,
};
slide.xLocation = (canvas.width - slide.length) / 2; // 換算板子X位置、置中

// 球屬性
let ball = {
  radius: 12,
  angle: 57.5, // 彈跳V字型的內角角度，57.5遊戲體驗較佳
  hypotenuseSpeed: (() => {
    if (
      navigator.userAgent.indexOf("Edg") != -1 ||
      navigator.userAgent.indexOf("Chrome") != -1
    ) {
      return 1.5;
    } else if (navigator.userAgent.indexOf("Firefox") != -1) {
      return 6;
    }
  })(),
  xAxisSpeed: null, // 用 hypotenuseSpeed 換算出的x軸進程
  yAxisSpeed: null, // 用 hypotenuseSpeed 換算出的y軸進程
  xLocation: canvas.width / 2,
  yLocation: null,
  direction: null,
};
ball.yLocation = slide.yLocation - slide.thickness / 2 - ball.radius;
// 換算球的斜線移動速度
ball.xAxisSpeed =
  Math.sin((ball.angle / 2) * (Math.PI / 180)) * ball.hypotenuseSpeed;
ball.yAxisSpeed =
  Math.cos((ball.angle / 2) * (Math.PI / 180)) * ball.hypotenuseSpeed;

// 磚塊屬性
let brick = {
  width: 56.3,
  height: 23.3,
  gap: 7,
  column: 10,
  row: 3,
  group: [], // 所有磚塊位置放置處
  shotDown: 0, // 擊破計分
};
// 將磚塊寬、高、間距、列數、行數轉成座標，導入 group，供 ctx 繪製
let j = 0;
let k = 0;
for (let i = 0; i < brick.column * brick.row; i++) {
  if (j == brick.column) {
    j = 0;
    k++;
  }
  let bricksX = brick.gap + brick.width * j + brick.gap * j;
  let bricksY = brick.gap + brick.height * k + brick.gap * k;
  let newBrick = {
    x: bricksX,
    y: bricksY,
  };
  brick.group.push(newBrick);
  j++;
}

// 顏色屬性
let colors = {
  background: "black",
  slide: "#FFFFFF",
  ball: "gold",
  oneRow: "#467500",
  twoRow: "#64A600",
  threeRow: "#82D900",
  brickFrame: "#737300",
  pass: "aquamarine",
  gameOver: "white",
};

// 按下的規則
addEventListener("keydown", slideDirection);
function slideDirection(down) {
  // 按住左鍵時，按右會改往右
  if (
    (down.key == "ArrowLeft" || down.key == "a" || down.key == "A") &&
    slide.leftKeySwitch
  ) {
    slide.direction = "Left";
    slide.leftKeySwitch = false;

    // 按住右鍵時，按左會改往左
  } else if (
    (down.key == "ArrowRight" || down.key == "d" || down.key == "D") &&
    slide.rightKeySwitch
  ) {
    slide.direction = "Right";
    slide.rightKeySwitch = false;
  }
}

// 放開的規則
addEventListener("keyup", slideDirectionChange);
function slideDirectionChange(up) {
  // 放開左鍵的時候
  if (
    (up.key == "ArrowLeft" || up.key == "a" || up.key == "A") &&
    !slide.leftKeySwitch
  ) {
    // 沒按右鍵，便停
    if (slide.rightKeySwitch) {
      slide.direction = "stop";
      // 有按右鍵，便向右
    } else if (!slide.rightKeySwitch) {
      slide.direction = "Right";
    }
    slide.leftKeySwitch = true;

    // 放開右鍵的時候
  } else if (
    (up.key == "ArrowRight" || up.key == "d" || up.key == "D") &&
    !slide.rightKeySwitch
  ) {
    // 沒按左鍵，便停
    if (slide.leftKeySwitch) {
      slide.direction = "stop";
      // 有按左鍵，便向右
    } else if (!slide.leftKeySwitch) {
      slide.direction = "Left";
    }
    slide.rightKeySwitch = true;
  }
}

// 一開始的靜止畫面
canvasDrawing();
// 負責繪製，除了一開始的靜止畫面，每次畫面刷新時繪製，依照每個物件各自的參數、位置繪製
function canvasDrawing() {
  // 重新刷黑
  ctx.beginPath();
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 畫板
  ctx.fillStyle = colors.slide;
  // 左端半圓
  ctx.arc(
    slide.xLocation,
    slide.yLocation,
    slide.thickness / 2,
    Math.PI * 0.5,
    Math.PI * 1.5
  );
  // 右端半圓
  ctx.arc(
    slide.xLocation + slide.length,
    slide.yLocation,
    slide.thickness / 2,
    Math.PI * 1.5,
    Math.PI * 0.5
  );
  ctx.fill();

  // 畫球
  ctx.beginPath();
  ctx.fillStyle = colors.ball;
  ctx.arc(ball.xLocation, ball.yLocation, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  //畫磚塊
  for (i = 0; i < brick.group.length; i++) {
    ctx.beginPath();
    let brickLayer = Math.round(
      (brick.group[i].y - brick.gap) / (brick.height + brick.gap)
    );
    if (brickLayer >= 0 && brickLayer < 1) {
      ctx.fillStyle = colors.oneRow;
    } else if (brickLayer >= 1 && brickLayer < 2) {
      ctx.fillStyle = colors.twoRow;
    } else if (brickLayer >= 2) {
      ctx.fillStyle = colors.threeRow;
    }
    ctx.fillRect(brick.group[i].x, brick.group[i].y, brick.width, brick.height);
  }
}

// 遊戲結束畫面
function gameOver() {
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.font = "70px arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (brick.shotDown == brick.column * brick.row) {
    // 遊戲過關
    ctx.fillStyle = colors.pass;
    ctx.fillText("You Win!", canvas.width * 0.5, canvas.height * 0.5);
    ctx.fill();
  } else {
    // 遊戲失敗
    ctx.fillStyle = colors.gameOver;
    ctx.fillText("Game Over", canvas.width * 0.5, canvas.height * 0.5);
    ctx.fill();
  }
}

// 設定遊戲開始
addEventListener("keydown", startSlide);
function startSlide(down) {
  if (down.key == "ArrowLeft" || down.key == "a" || down.key == "A") {
    ball.direction = "leftUpper";
    startDrawBasisAndOffSwitch();
  } else if (down.key == "ArrowRight" || down.key == "d" || down.key == "D") {
    ball.direction = "rightUpper";
    startDrawBasisAndOffSwitch();
  }
  function startDrawBasisAndOffSwitch() {
    mySlide = setInterval(drawBasis, gameSpeed);
    // 避免重複啟用造成的錯誤，例如不斷加速、感應反彈
    removeEventListener("keydown", startSlide);
  }
}

// 繪製的參數在這裡做動態變化，控制 scenes() 繪製的方式
function drawBasis() {
  // 板子的移動速度、方向
  // slide.speed 是每次繪製的距離，作為條件可防止板子下次繪製時穿出
  if (slide.direction == "Left" && slide.xLocation > slide.speed) {
    slide.xLocation -= slide.speed;
  } else if (
    slide.direction == "Right" &&
    slide.xLocation < canvas.width - slide.length - slide.speed
  ) {
    slide.xLocation += slide.speed;
  }

  // 球的移動速度、方向
  switch (ball.direction) {
    case "rightBottom":
      ball.xLocation += ball.xAxisSpeed;
      ball.yLocation += ball.yAxisSpeed;
      break;
    case "leftUpper":
      ball.xLocation -= ball.xAxisSpeed;
      ball.yLocation -= ball.yAxisSpeed;
      break;
    case "leftBottom":
      ball.xLocation -= ball.xAxisSpeed;
      ball.yLocation += ball.yAxisSpeed;
      break;
    case "rightUpper":
      ball.xLocation += ball.xAxisSpeed;
      ball.yLocation -= ball.yAxisSpeed;
      break;
  }

  // 球碰到板子的反彈
  if (
    ball.xLocation >= slide.xLocation - slide.thickness &&
    ball.xLocation <= slide.xLocation + slide.length + slide.thickness &&
    ball.yLocation + ball.radius >= slide.yLocation - slide.thickness / 2 - 1 &&
    ball.yLocation <= slide.yLocation
  ) {
    if (
      // 板往左或停，左下球彈左上
      ((slide.direction == "Left" || slide.direction == "stop") &&
        ball.direction == "leftBottom") ||
      // 板往左，右下球彈回左上
      (slide.direction == "Left" && ball.direction == "rightBottom")
    ) {
      ball.direction = "leftUpper";
    } else if (
      // 板往右或停，右下球彈右上
      ((slide.direction == "Right" || slide.direction == "stop") &&
        ball.direction == "rightBottom") ||
      // 板往右，左下球彈回右上
      (slide.direction == "Right" && ball.direction == "leftBottom")
    ) {
      ball.direction = "rightUpper";
    }
  }

  // 球碰到牆壁的反彈，這裡的2是將 CSS 的 border 線寬算入
  else if (
    // 右上球碰上邊牆、左下球碰左邊牆，彈向右下
    (ball.direction == "rightUpper" && ball.yLocation - ball.radius <= 2) ||
    (ball.direction == "leftBottom" && ball.xLocation - ball.radius <= 2)
  ) {
    ball.direction = "rightBottom";
  } else if (
    // 右上球碰右邊牆，彈向左上
    ball.direction == "rightUpper" &&
    ball.xLocation + ball.radius >= canvas.width - 2
  ) {
    ball.direction = "leftUpper";
  } else if (
    // 右下球碰右邊牆、左上球碰上邊牆，彈向左下
    (ball.direction == "rightBottom" &&
      ball.xLocation + ball.radius >= canvas.width - 2) ||
    (ball.direction == "leftUpper" && ball.yLocation - ball.radius <= 2)
  ) {
    ball.direction = "leftBottom";
  } else if (
    // 左上球碰左邊牆，彈向右上
    ball.direction == "leftUpper" &&
    ball.xLocation - ball.radius <= 2
  ) {
    ball.direction = "rightUpper";
  }

  // 球碰到磚塊的反彈、刪除磚塊
  for (let i = 0; i < brick.column * brick.row; i++) {
    // 撞磚角是修正畫面更新後球穿過四角在磚塊裡，導致球穿過磚頭的 bug，
    // 原理是計算球圓心與四角的直線距離，半徑以下就反彈
    // 撞磚右上角
    if (
      Math.sqrt(
        (ball.xLocation - (brick.group[i].x + brick.width)) ** 2 +
          (ball.yLocation - brick.group[i].y) ** 2
      ) <= ball.radius
    ) {
      ball.direction = "rightUpper";
      brickDelete();
    }
    // 撞磚右下角
    else if (
      Math.sqrt(
        (ball.xLocation - (brick.group[i].x + brick.width)) ** 2 +
          (ball.yLocation - (brick.group[i].y + brick.height)) ** 2
      ) <= ball.radius
    ) {
      ball.direction = "rightBottom";
      brickDelete();
    }
    // 撞磚左下角
    else if (
      Math.sqrt(
        (ball.xLocation - brick.group[i].x) ** 2 +
          (ball.yLocation - (brick.group[i].y + brick.height)) ** 2
      ) <= ball.radius
    ) {
      ball.direction = "leftBottom";
      brickDelete();
    }
    // 撞磚左上角
    else if (
      Math.sqrt(
        (ball.xLocation - brick.group[i].x) ** 2 +
          (ball.yLocation - brick.group[i].y) ** 2
      ) <= ball.radius
    ) {
      ball.direction = "leftUpper";
      brickDelete();
    }
    // 碰到磚塊上邊、下邊的反彈邏輯
    else if (
      ball.xLocation >= brick.group[i].x &&
      ball.xLocation <= brick.group[i].x + brick.width &&
      ball.yLocation + ball.radius >= brick.group[i].y - 1 &&
      ball.yLocation - ball.radius <= brick.group[i].y + brick.height + 1
    ) {
      if (ball.direction == "rightBottom") {
        ball.direction = "rightUpper";
      } else if (ball.direction == "leftUpper") {
        ball.direction = "leftBottom";
      } else if (ball.direction == "leftBottom") {
        ball.direction = "leftUpper";
      } else if (ball.direction == "rightUpper") {
        ball.direction = "rightBottom";
      }
      brickDelete();

      // 碰到磚塊左邊、右邊的反彈邏輯
    } else if (
      ball.xLocation + ball.radius >= brick.group[i].x - 1 &&
      ball.xLocation - ball.radius <= brick.group[i].x + brick.width + 1 &&
      ball.yLocation >= brick.group[i].y &&
      ball.yLocation <= brick.group[i].y + brick.height
      // 撞到磚四角，偏左右邊的反彈邏輯
      // 撞磚左上角
    ) {
      if (ball.direction == "rightBottom") {
        ball.direction = "leftBottom";
      } else if (ball.direction == "leftUpper") {
        ball.direction = "rightUpper";
      } else if (ball.direction == "leftBottom") {
        ball.direction = "rightBottom";
      } else if (ball.direction == "rightUpper") {
        ball.direction = "leftUpper";
      }
      brickDelete();
    }
    function brickDelete() {
      brick.group.splice(i, 1, 0);
      brick.shotDown++;
    }
  }

  // 畫面刷新
  canvasDrawing();

  // 計分滿分 or 球穿過底下，停止繪圖、進入遊戲結束
  if (
    brick.shotDown == brick.column * brick.row ||
    ball.yLocation - ball.radius > canvas.height
  ) {
    clearInterval(mySlide);
    gameOver();
  }
}
