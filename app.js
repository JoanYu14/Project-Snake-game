const canvas = document.getElementById("myCanvas");

// getContext() method會回傳一個canvas的drawing context(繪畫環境)給我們
// drawing context可以用來在canvas內畫圖，因為貪食蛇遊戲是2d的所以，所以我們寫"2d"
// getContext("2d")回傳的就是CanvasRenderingContext2D，所以可以上網查詢它的用法
const ctx = canvas.getContext("2d");

// 320(canvas長寬)/20=16，所以長寬就是切成16格
const unit = 20;
const row = canvas.height / unit; // 320/20=16
const column = canvas.width / unit; // 320/20=16

let snake = []; // array中的每個元素都是一個物件，物件的工作是儲存身體的x,y座標，所以有x屬性和y屬性

//Canvas的原點(0,0)是在畫布左上角，所以x座標是越往右越大，y座標是越往下越大
// 為了程式碼乾淨，所以把創建蛇的程式碼包進createSnake function內，後面在呼叫
function createSnake() {
  // 我們最開始設定蛇的長度為4，並且透過每個元素的xy座標設定來讓它初始位置為左上
  snake[0] = {
    x: 80,
    y: 0,
  };

  snake[1] = {
    x: 60,
    y: 0,
  };
  snake[2] = {
    x: 40,
    y: 0,
  };
  snake[3] = {
    x: 20,
    y: 0,
  };
}

class Fruit {
  constructor(x, y) {
    // 因為我們把Canvas當成一個網格，方塊只能在x與y交叉的位子出現
    // 而長寬各320，方塊為20*20，320/20=16，所以canvas就可以說是16*16的網格
    // 所以x與y的座標只能是0~300之間的20的倍數(因為方塊是以左上角為原點向右下畫，所以不能用320，會超出範圍)
    // Math.random() * 16會讓我們得到0~15.xxx之間的隨機數值
    // 再用floor讓這個隨機數值無條件捨去小數，這樣就能得到0~15的隨機整數了
    // 然後再乘以unit就能得到它的座標
    this.x = Math.floor(Math.random() * column) * unit;
    this.y = Math.floor(Math.random() * row) * unit;
  }

  // 畫出黃色的果實，這個drawFruit函式是添加在Fruit這個constructor function的prototype中，所以所有用Fruit創建的物件都有這個method
  drawFruit() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x, this.y, unit, unit);
  }

  // pickAlocation()這個method用來選定果實新位置
  pickAlocation() {
    let overlapping = false; // 用來判斷是否有跟蛇重疊
    let new_x;
    let new_y;

    //  checkOverlap函式是用來確認果實新的xy座標有沒有跟蛇重疊
    function checkOverlap(new_x, new_y) {
      for (let i = 0; i < snake.length; i++) {
        // 如果果實新的xy座標有跟snake陣列中某一個元素(物件)的xy一樣的話
        // overlapping變為true，然後return結束迴圈
        if (new_x == snake[i].x && new_y == snake[i].y) {
          overlapping = true;
          return;
        } else {
          // 如果沒有重疊這裡也要設定overlapping = false，否則只要重疊過一次，overlapping就永遠為true，下面的do while迴圈就不會停止了
          overlapping = false;
        }
      }
    }

    // do while迴圈就是不管如何先執行do內程式，如果while判斷為true的話再繼續執行do,然後再判斷...直到while判斷為false
    // 先製作新的new_x與new_y，再用checkOverlap函式檢查
    // 如果checkOverlap函式內的for loop檢查結束都overlapping沒有變成true的話
    // 那while的判斷式overlapping==true就不會成立，所以此while do迴圈就不會再執行
    do {
      new_x = Math.floor(Math.random() * column) * unit;
      new_y = this.y = Math.floor(Math.random() * row) * unit;
      checkOverlap(new_x, new_y);
    } while (overlapping);

    // 如果確認新的座標不會與蛇重疊，就讓調用pickAlocation()這個method的物件的x屬性等於new_x，y屬性等於new_y
    this.x = new_x;
    this.y = new_y;
  }
}

// =====================================================================================================================================================

// 初始設定
// 建立蛇
createSnake();
// 創建myFruit物件，因為物件屬性的值在class內會隨機賦予了，所以這邊不用傳入引數
let myFruit = new Fruit();

// 監聽瀏覽器的keydown(按下鍵盤)事件，如果事件發生就執行名為chageDirection的function
window.addEventListener("keydown", chageDirection);
// d是存方向
let d = "Right";

// e參數放的就是keydown發生時JS會自動回傳的event object
function chageDirection(e) {
  // keydown回傳的event object(e)的key屬性的值為我們按下的鍵
  // 所以我們可以用這個值來得知貪食蛇是否有改變方向
  // 因為蛇不能180度大迴轉走(不能本來是頭往右，直接變成頭往左)

  if (e.key == "ArrowLeft" && d != "Right") {
    // 如果按下左鍵且目前d不等於Right的話d就改成Left
    d = "Left";
  } else if (e.key == "ArrowDown" && d != "Up") {
    d = "Down";
  } else if (e.key == "ArrowRight" && d != "Left") {
    d = "Right";
  } else if (e.key == "ArrowUp" && d != "Down") {
    d = "Up";
  }

  // 在每次按上下左右鍵之後，在下一幀被畫出來之前
  // 不接受任何keydown事件
  // 這樣可以防止短時間連續按鍵導致蛇在邏輯上自殺(180度反咬自己)
  // 刪除監聽"keydown"事件執行chageDirection這個事件監聽器
  // 所以就會變成每次draw的執行時間內(0.1秒)只能觸發keydown一次，執行一次chageDirection
  window.removeEventListener("keydown", chageDirection);
  // 再draw函式的最下面再把此事件監聽器加回來
}

// 設定初始分數為0，宣告highestScore變數
let score = 0;
let highestScore;
document.getElementById("myScore").innerHTML = "遊戲分數:" + score;
// 使用loadHighestScore()函式把存在localstorage中key為HighestScore的值取出來
loadHighestScore();
document.getElementById("myScore2").innerHTML = "最高分數" + highestScore;

// =====================================================================================================================================================

// 遊戲設計

function draw() {
  // 每次畫圖之前，確認蛇有沒有咬到自己
  // 因為頭的index為0，所以for loop從1開始
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x == snake[0].x && snake[i].y == snake[0].y) {
      // 將myGmae所重複執行的程式(draw function)暫停
      clearInterval(myGame);
      alert("遊戲結束");
      // 用return結束draw function，因為上面clearInterval(myGame)，所以draw不會再重複執行了
      // 且在return下面的程式碼也都不會被執行了
      return;
    }
  }

  // 因為上一次畫的結果並不會被清除，會疊加
  // 所以我們每進行一次draw我們就要把畫布用黑色填滿一次(下兩行)，不然蛇的身體不管有沒有吃到果實會一直變長
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 用myFruit物件的drawFruit這個method來畫出果實
  myFruit.drawFruit();

  // 畫出貪食蛇
  for (let i = 0; i < snake.length; i++) {
    // fillstyle是設定我們接下來要填滿的顏色為何
    if (i == 0) {
      // i==0表示是貪食蛇的頭
      ctx.fillStyle = "lightgreen";
    } else {
      ctx.fillStyle = "lightblue";
    }
    // strokeStyle是邊框顏色
    ctx.strokeStyle = "white";

    // fillRect就是畫出實心長方形，參數依序為x座標,y座標,width,height
    ctx.fillRect(snake[i].x, snake[i].y, unit, unit);
    // strokeRect就是畫出帶有外框的空心長方形
    ctx.strokeRect(snake[i].x, snake[i].y, unit, unit);
  }

  // 以目前d變數的方向，來決定蛇的下一幀要放在哪個座標
  // 找到目前蛇的頭(index為0的那個)的座標為何
  let snakeX = snake[0].x; // snake[0].x就是snake的頭那個物件的名為x的屬性的值
  let snakeY = snake[0].y;
  if (d == "Left") {
    // 如果方向為左，snakeX就減一個unit的值
    snakeX -= unit;
    if (snakeX < 0) {
      // 如果新的頭的X座標小於0就代表它會超出canvas的左邊框，此時就讓新的頭的X座標要等於300，這樣下一次在執行draw時新的頭就會畫在X為300的地方(下一次執行draw時的snake[0].x的值)
      // 就是新的新的長方形要畫在X座標為300的位子(因為是以左上角對齊X為300的地方往右下畫出長寬20的方形，所以這邊是用320-20=300)，然後刪除最後一個身體
      // 然後下一個新的頭就不會觸發這個if了，所以下一個新頭的X座標就會是280，然後刪除最後一個身體
      // 以初始長度為4個格子為例，觸發後此if後再執行3次draw時，整條蛇就徹底穿牆了
      snakeX = canvas.width - unit;
    }
  } else if (d == "Up") {
    // 如果方向為上，snakeY就減一個unit的值(canvas的Y座標越往上越小)
    snakeY -= unit;
    if (snakeY < 0) {
      // 如果新的頭的Y座標小於0就代表它會超出canvas的上邊框，此時就讓新的頭的Y座標要等於300(因為是以左上角對齊X為300的地方往右下畫出長寬20的方形，所以這邊是用320-20=300)
      snakeY = canvas.height - unit;
    }
  } else if (d == "Right") {
    snakeX += unit;
    if (snakeX > canvas.width) {
      // 如果新的頭的X座標大於canvas.width(320)就代表它會超出canvas的右邊框，此時就讓新的頭的X座標要等於0，(因為是以左上角對齊X為0的地方往右下畫出長寬20的方形，所以這裡不用-20了)
      snakeX = 0;
    }
  } else if (d == "Down") {
    snakeY += unit;
    if (snakeY > canvas.height) {
      // 如果新的頭的X座標大於canvas.height(320)就代表它會超出canvas的下邊框，此時就讓新的頭的Y座標要等於0，(因為是以左上角對齊Y為0的地方往右下畫出長寬20的方形，所以這裡不用-20了)
      snakeY = 0;
    }
  }

  // 製作newHead物件來儲存新的頭的座標
  let newHead = {
    x: snakeX,
    y: snakeY,
  };

  // 每次畫圖之前，確認蛇有沒有咬到自己
  // 因為頭的index為0，所以for loop從1開始
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x == snake[0].x && snake[i].y == snake[0].y) {
      // 將myGmae所重複執行的程式(draw function)暫停
      clearInterval(myGame);
      alert("遊戲結束");
      // 用return結束draw function，因為上面clearInterval(myGame)，所以draw不會再重複執行了
      // 且在return下面的程式碼也都不會被執行了
      return;
    }
  }

  // 確認蛇是否吃到果實
  // 如果蛇此時的頭(這個時後newHead還沒被加進去)的xy座標跟myFruit的xy座標一樣的話就代表吃到果實了
  if (snake[0].x == myFruit.x && snake[0].y == myFruit.y) {
    // 讓myFruit選定新的出現位置
    myFruit.pickAlocation();

    // 只要有吃到果實score就+1，並且更新id為myScore的element
    score++;
    document.getElementById("myScore").innerHTML = "遊戲分數:" + score;
    // 這裡執行setHighestScore(score)判斷需不需要更新localstorage，還有判斷需不需要更新上面宣告的highestScore變數
    setHighestScore(score);
    // 然後再更新myScore2的最高分數(如果score還沒比存在localstorage的分數高的話highestScore就不會有變化)
    document.getElementById("myScore2").innerHTML = "最高分數:" + highestScore;
  } else {
    // 如果沒吃到果實就要刪除最後一個元素
    // 因為前進的話代表snake陣列的最後一個元素要刪除(存有蛇的尾巴座標的物件)，所以用pop刪除
    snake.pop();
  }

  // 把newHead這個物件存到snake陣列中的第一個位置(unshift就是添加元素在陣列的頭)
  snake.unshift(newHead);
  // 此時就已經確定下一幀已被畫出，所以就再把監聽keydown事件，觸發事件時執行chageDirection事件監聽器加回去
  window.addEventListener("keydown", chageDirection);
}

// =====================================================================================================================================================
// 一些function設定

// setInterval讓我們可以每100毫秒(0.1秒)執行一次名為draw的function
let myGame = setInterval(draw, 100);

// 定義loadHighestScore函式來找最高分
function loadHighestScore() {
  // 如果找localStorage中key為highestScore的值回傳為null(沒有這個key)
  // 那就把0賦予給highestScore這個變數(前面宣告過了)
  if (localStorage.getItem("highestScore") == null) {
    highestScore = 0;
  } else {
    // 否則就把從localStorage中找到的key為highestScore的value賦予給highestScore這個變數
    // localStorage的值都是string，所以要轉為number
    highestScore = Number(localStorage.getItem("highestScore"));
  }
}

function setHighestScore() {
  if (score > highestScore) {
    localStorage.setItem("highestScore", score);
    highestScore = score;
  }
}
