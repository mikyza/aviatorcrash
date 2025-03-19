// Get Canvas and Context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Define movement variables
let speedX = 0.75; // Reduced speed
let x = 0;
let y = canvas.height;
let counter = 1.00;
let cashedOut = false;
let placedBet = false;
let isFlying = true;
let randomStop = generateRandomCrash();
const takeoffTime = 2000; // 2 seconds for takeoff
let finalX = 0, finalY = 0;

// Load plane image
const image = new Image();
image.src = './img/aviator_jogo.png';

// Betting elements
let balanceAmount = document.getElementById('balance-amount');
let calculatedBalanceAmount = 3000;
balanceAmount.textContent = calculatedBalanceAmount.toFixed(2) + '€';

let betButton = document.getElementById('bet-button');
let messageField = document.getElementById('message');
let inputBox = document.getElementById('bet-input');

betButton.textContent = 'Bet';
messageField.textContent = 'Wait for the next round';

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
    
    if (counter < 2.00) {
        counter += 0.0083; // Slower increase from 1.00 to 2.00
    } else if (counter < 20.00) {
        counter += 0.025; // Normal speed increase after 2.00
    } else {
        counter += 0.05; // Faster increase after 20.00
    }
    
    document.getElementById('counter').textContent = counter.toFixed(2) + 'x';

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    if (elapsedTime <= takeoffTime) {
        // 🚀 Takeoff phase (moving upwards for 2s)
        x += speedX;
        y = canvas.height - (elapsedTime / takeoffTime) * (canvas.height / 2);
        finalX = x; // Store last position
        finalY = y;
    } else {
        // ✈️ Fixed position with smooth up-and-down movement
        x = finalX;
        y = finalY + 30 * Math.sin(timestamp / 300); // Oscillating movement
    }

    if (counter >= randomStop) {
        isFlying = false;
        cancelAnimationFrame(animationId); // Stop animation
        messageField.textContent = 'Place your bet';

        // Make the plane fly away at crash
        flyAway();

        setTimeout(() => {
            resetGame(); // Start new round
        }, 5000);
        return;
    }

    // 🛠 Rope Movement (Moving opposite of Plane)
    ctx.strokeStyle = '#dc3545';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);

    let controlX1 = x / 2;
    let controlY1 = (y + canvas.height) / 2 - 30 * Math.sin(timestamp / 300);

    let controlX2 = x * 0.75;
    let controlY2 = (y + canvas.height) / 2 + 20 * Math.sin(timestamp / 400);

    ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, x - 20, y + 10);
    ctx.stroke();

    // Draw plane
    ctx.drawImage(image, x - 40, y - 30, 120, 55);

    animationId = requestAnimationFrame(draw);
}

function flyAway() {
    let flyAwayInterval = setInterval(() => {
        x += 5; // Speed of flying away
        y -= 3; // Move up while flying away
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, x - 40, y - 30, 120, 55);

        if (x > canvas.width) {
            clearInterval(flyAwayInterval);
        }
    }, 20);
}

// Reset game after crash
function resetGame() {
    counter = 1.0;
    x = 0;
    y = canvas.height;
    cashedOut = false;
    placedBet = false;
    isFlying = true;

    randomStop = generateRandomCrash(); // Generate new crash multiplier
    startTime = performance.now(); // Reset timer
    animationId = requestAnimationFrame(draw);
}

// Generate a random crash multiplier with a house edge of 20%
function generateRandomCrash() {
    let crash;
    let randomNumber = Math.random() * 100;
    
    if (randomNumber < 50) {
        // 50% chance: Very low crashes (1.00x - 2.00x)
        crash = (1 + Math.random()).toFixed(2);
    } else if (randomNumber < 75) {
        // 25% chance: Mid-range crashes (2.00x - 10.00x)
        crash = (2 + Math.random() * 8).toFixed(2);
    } else if (randomNumber < 97) {
        // 22% chance: High crashes (10.00x - 50.00x)
        crash = (10 + Math.random() * 40).toFixed(2);
    } else {
        // 3% chance: Very rare crashes (50.00x - 100.00x+)
        crash = (50 + Math.random() * 50).toFixed(2);
    }
    
    return parseFloat(crash);
}

// Anti-cheat measures
function isSuspiciousBet(user, betAmount) {
    if (user.previousBets.includes(betAmount)) {
        return true; // Avoid pattern exploits
    }
    if (user.accountAge < 1 && betAmount > 1000) {
        return true; // Prevent new accounts from high betting
    }
    return false;
}

// More security logic ensuring fairness and house profit
const houseEdgeProtection = () => {
    let crashResults = [];
    for (let i = 0; i < 1000; i++) {
        crashResults.push(generateRandomCrash());
    }
    
    let lowCrashes = crashResults.filter(crash => crash < 2).length;
    let highCrashes = crashResults.filter(crash => crash > 60).length;
    let extremeCrashes = crashResults.filter(crash => crash > 100).length;
    
    console.log(`Low Crashes (<2x): ${lowCrashes}`);
    console.log(`High Crashes (>60x): ${highCrashes}`);
    console.log(`Extreme Crashes (>100x): ${extremeCrashes}`);
};

houseEdgeProtection();


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
