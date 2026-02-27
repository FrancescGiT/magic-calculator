let currentInput = "0";
let previousInput = null;
let currentOperator = null;
let isMagicPrepared = false;
let shouldResetScreen = false;

const display = document.getElementById('display-text');
const btnClear = document.getElementById('btn-clear');
const btnMagic = document.getElementById('magic-zone');
const opBtns = document.querySelectorAll('.op-btn');

function resizeText() {
    const container = document.querySelector('.display');
    let fontSize = 90;
    display.style.fontSize = fontSize + 'px';
    while (display.offsetWidth > container.offsetWidth - 20 && fontSize > 20) {
        fontSize -= 2;
        display.style.fontSize = fontSize + 'px';
    }
}

function updateDisplay() {
    display.textContent = currentInput.replace('.', ',');
    
    if (currentInput === "0" || currentInput === "0." || currentInput === "-0") {
        btnClear.textContent = "AC";
    } else {
        btnClear.textContent = "C";
    }
    resizeText();
}

btnMagic.addEventListener('click', (e) => {
    isMagicPrepared = true;
});
btnMagic.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isMagicPrepared = true;
}, {passive: false});

function handleNumClick(num) {
    if (shouldResetScreen) {
        currentInput = num.toString();
        shouldResetScreen = false;
    } else {
        if (currentInput === "0") {
            currentInput = num.toString();
        } else if (currentInput === "-0") {
            currentInput = "-" + num;
        } else {
            // Permitimos hasta 9 dígitos habitualmente en pantalla para parecer realista
            if (currentInput.replace(/[-.]/g, '').length < 9) {
                currentInput += num.toString();
            } else if (isMagicPrepared) {
                // Si está preparada la magia, no hay restricción de límite solo por si acaso
                if (currentInput.replace(/[-.]/g, '').length < 9) {
                    currentInput += num.toString();
                }
            }
        }
    }
    updateDisplay();
    removeActiveOps();
}

document.querySelectorAll('.num-btn').forEach(btn => {
    btn.addEventListener('click', () => handleNumClick(btn.getAttribute('data-num')));
});

function calculateResult() {
    if (currentOperator === null || previousInput === null) return;
    
    let a = parseFloat(previousInput);
    let b = parseFloat(currentInput);
    let result = 0;
    switch(currentOperator) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '×': result = a * b; break;
        case '÷': 
            if (b === 0) {
                currentInput = "Error";
                previousInput = null;
                currentOperator = null;
                shouldResetScreen = true;
                updateDisplay();
                return;
            }
            result = a / b; break;
    }
    
    let resStr = result.toString();
    if (resStr.length > 10) {
        resStr = parseFloat(result.toPrecision(9)).toString();
    }
    currentInput = resStr;
    previousInput = null;
    currentOperator = null;
}

document.getElementById('btn-equal').addEventListener('click', () => {
    if (isMagicPrepared) {
        // Ejecución de la magia (Genera DDMMAAAAHHMM)
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const aaaa = now.getFullYear();
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        
        currentInput = `${dd}${mm}${aaaa}${hh}${min}`;
        
        isMagicPrepared = false;
        previousInput = null;
        currentOperator = null;
        shouldResetScreen = true;
        updateDisplay();
        removeActiveOps();
        return;
    }

    if (currentOperator !== null) {
        calculateResult();
        shouldResetScreen = true;
        updateDisplay();
    }
    removeActiveOps();
});

document.getElementById('btn-clear').addEventListener('click', () => {
    // Si la magia ya se ha preparado, no reseteamos el trick flag
    if (btnClear.textContent === "C") {
        currentInput = "0";
    } else {
        currentInput = "0";
        previousInput = null;
        currentOperator = null;
        shouldResetScreen = false;
    }
    updateDisplay();
    removeActiveOps();
});

function removeActiveOps() {
    opBtns.forEach(b => b.classList.remove('active-op'));
}

opBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const op = btn.getAttribute('data-op');
        if (currentOperator !== null && !shouldResetScreen) {
            calculateResult();
            updateDisplay();
        }
        previousInput = currentInput;
        currentOperator = op;
        shouldResetScreen = true;
        
        removeActiveOps();
        btn.classList.add('active-op');
    });
});

document.getElementById('btn-comma').addEventListener('click', () => {
    if (shouldResetScreen) {
        currentInput = "0.";
        shouldResetScreen = false;
    } else {
        if (!currentInput.includes(".")) {
            currentInput += ".";
        }
    }
    updateDisplay();
    removeActiveOps();
});

document.getElementById('btn-sign').addEventListener('click', () => {
    if (currentInput !== "0" && currentInput !== "0.") {
        if (currentInput.startsWith("-")) {
            currentInput = currentInput.slice(1);
        } else {
            currentInput = "-" + currentInput;
        }
    } else if (currentInput === "0") {
        currentInput = "-0";
    }
    updateDisplay();
    removeActiveOps();
});

document.getElementById('btn-percent').addEventListener('click', () => {
    let val = parseFloat(currentInput);
    currentInput = (val / 100).toString();
    shouldResetScreen = true;
    updateDisplay();
    removeActiveOps();
});

document.getElementById('btn-backspace').addEventListener('click', () => {
    if (shouldResetScreen) {
        currentInput = "0";
    } else {
        if (currentInput.length > 1) {
            currentInput = currentInput.slice(0, -1);
            if (currentInput === "-") currentInput = "0";
        } else {
            currentInput = "0";
        }
    }
    updateDisplay();
    removeActiveOps();
});

// Inicialización
updateDisplay();
