// Get Canvas and Context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Define movement variables
let speedX = 1.5; // Reduced speed by half
let x = 0; // Start at zero
let y = canvas.height; // Start at the bottom
let counter = 1.00;
let cashedOut = false;
let placedBet = false;
let isFlying = true;
let dotPath = [];
let randomStop = generateRandomCrash(); // Initial crash multiplier
const takeoffTime = 2000; // 2 seconds

// Bet & balance elements
let balanceAmount = document.getElementById('balance-amount');
let calculatedBalanceAmount = 3000;
balanceAmount.textContent = calculatedBalanceAmount.toFixed(2) + '€';

let betButton = document.getElementById('bet-button');
let messageField = document.getElementById('message');
let inputBox = document.getElementById('bet-input');

betButton.textContent = 'Bet';
messageField.textContent = 'Wait for the next round';

// Load the plane image
const image = new Image();
image.src = './img/aviator_jogo.png';

// Prevent "e" in input
inputBox.addEventListener("keydown", function (e) {
    if (["-", "+", "e"].includes(e.key)) {
        e.preventDefault();
    }
});

// Start animation loop
let startTime = performance.now();
let animationId = requestAnimationFrame(draw);

function draw(timestamp) {
    let elapsedTime = timestamp - startTime;
    counter += 0.025; // Reduced speed for smoother scaling
    document.getElementById('counter').textContent = counter.toFixed(2) + 'x';

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    if (elapsedTime <= takeoffTime) {
        // Takeoff phase (rising upwards)
        x += speedX;
        y = canvas.height - (elapsedTime / takeoffTime) * (canvas.height / 2);
    } else {
        // Maintain position with smooth up-and-down motion
        y = canvas.height / 2 + 40 * Math.sin(x / 100);
        x += speedX; // Continue moving forward at reduced speed
    }

    if (counter >= randomStop) {
        isFlying = false;
        messageField.textContent = 'Place your bet';
        cancelAnimationFrame(animationId); // Stop animation

        setTimeout(() => {
            resetGame(); // Start new round
        }, 5000);
        return;
    }

    dotPath.push({ x, y });

    // Draw flight path
    ctx.strokeStyle = '#dc3545';
    ctx.lineWidth = 2;
    for (let i = 1; i < dotPath.length; i++) {
        ctx.beginPath();
        ctx.moveTo(dotPath[i - 1].x, dotPath[i - 1].y);
        ctx.lineTo(dotPath[i].x, dotPath[i].y);
        ctx.stroke();
    }

    // Draw plane
    ctx.drawImage(image, x - 28, y - 30, 120, 55);

    animationId = requestAnimationFrame(draw);
}

// Reset game after crash
function resetGame() {
    counter = 1.0;
    x = 0;
    y = canvas.height;
    dotPath = [];
    cashedOut = false;
    placedBet = false;
    isFlying = true;
    messageField.textContent = '';

    randomStop = generateRandomCrash(); // Generate new crash multiplier
    startTime = performance.now(); // Reset timer
    animationId = requestAnimationFrame(draw);
}

// Generate a random crash multiplier
function generateRandomCrash() {
    return (Math.random() * 50 + 1.2).toFixed(2); // Random crash between 1.2x and 50x
}

// Betting logic
betButton.addEventListener('click', () => {
    if (placedBet) {
        cashOut();
    } else {
        placeBet();
    }
});

function placeBet() {
    let betAmount = parseFloat(inputBox.value);
    
    if (placedBet || isNaN(betAmount) || betAmount <= 0 || betAmount > calculatedBalanceAmount || isFlying) {
        messageField.textContent = 'Invalid bet';
        return;
    }

    calculatedBalanceAmount -= betAmount;
    balanceAmount.textContent = calculatedBalanceAmount.toFixed(2) + '€';
    placedBet = true;
    betButton.textContent = 'Cash Out';
    messageField.textContent = 'Bet Placed!';
}

function cashOut() {
    if (cashedOut || !placedBet) {
        return;
    }

    if (counter < randomStop) {
        let winnings = parseFloat(inputBox.value) * counter;
        calculatedBalanceAmount += winnings;
        balanceAmount.textContent = calculatedBalanceAmount.toFixed(2) + '€';
        cashedOut = true;
        placedBet = false;
        betButton.textContent = 'Bet';
        messageField.textContent = `Cashed out: ${winnings.toFixed(2)}€`;
    } else {
        messageField.textContent = "Too late!";
    }
}
