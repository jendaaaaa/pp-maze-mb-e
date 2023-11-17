// GROUP MB-E
// color C1, neopixel N1, wall W1
// radio from MB-A

// PINOUT
let PIN_NEOPIXEL = DigitalPin.P1;
let PIN_SERVO = AnalogPin.P0;
let PIN_SWITCH_OPEN = DigitalPin.P8;
let PIN_SWITCH_CLOSE = DigitalPin.P9;

// INIT
radio.setGroup(8);
basic.showString("E");
apds9960.Init(11.12);
apds9960.ColorMode();
let NUM_LEDS = 8;
let strip = neopixel.create(PIN_NEOPIXEL, NUM_LEDS, NeoPixelMode.RGB);
pins.setPull(PIN_SWITCH_CLOSE, PinPullMode.PullUp);
pins.setPull(PIN_SWITCH_OPEN, PinPullMode.PullUp);

// COLORS
let COL_BLUE = 216;
let COL_PINK = -14;
let COL_GREEN = 150;
let COL_YELLOW = 20;
let COL_NO_COLOR = 60;
let COL_EMPTY = -1000;
let ARR_COL = [COL_BLUE, COL_PINK, COL_GREEN, COL_YELLOW];
let ERROR = 20;
let LIGHT_TRESHOLD = 1100;

// NEOPIXEL COLORS
let NEO_BLUE = neopixel.rgb(0, 203, 255);
let NEO_GREEN = neopixel.rgb(28, 238, 0);
let NEO_YELLOW = neopixel.rgb(255, 130, 0);
let NEO_PINK = neopixel.rgb(255, 0, 59);

// CONSTANTS
let SERVO_STOP = 90
let SERVO_SPEED = 70;
let SERVO_OPEN = SERVO_STOP + SERVO_SPEED;
let SERVO_CLOSE = SERVO_STOP - SERVO_SPEED;

// VARIABLES
let colorCorrect = COL_EMPTY;
let colorMeasured = COL_NO_COLOR;
let colorNeopixel = 0;
let ambientMeasured = 0;
let isCorrect = false;
let servoSpeed = SERVO_STOP;

// RADIO
let RADIO_RESET = 1;
let RADIO_CLOSE = 2;
let RADIO_COLOR_NAME = "COLOR1";

// INTERRUPT
radio.onReceivedNumber(function (receivedNumber) {
    if (receivedNumber === RADIO_RESET) {
        resetState();
    }
})

radio.onReceivedValue(function (name: string, value: number) {
    if (name === RADIO_COLOR_NAME) {
        colorCorrect = value;
        // basic.showNumber(value);
    }
})

// MAIN
basic.forever(function () {
    if (apds9960.Data_Ready()) {
        colorMeasured = apds9960.ReadColor();
        ambientMeasured = apds9960.Read_Ambient();
    } else {
        //
    }
    if (ambientMeasured <= LIGHT_TRESHOLD) {
        colorNeopixel = NeoPixelColors.White;
        isCorrect = false;
    } else {
        // neopixel
        if (colorMeasured <= COL_GREEN + ERROR && colorMeasured >= COL_GREEN - ERROR) {
            colorNeopixel = NEO_GREEN;
        } else if (colorMeasured <= COL_BLUE + ERROR && colorMeasured >= COL_BLUE - ERROR) {
            colorNeopixel = NEO_BLUE;
        // } else if (colorMeasured <= COL_ORANGE + ERROR && colorMeasured >= COL_ORANGE - ERROR) {
        //     colorNeopixel = neopixel.rgb(255, 34, 0);
        } else if (colorMeasured <= COL_YELLOW + ERROR && colorMeasured >= COL_YELLOW - ERROR) {
            colorNeopixel = NEO_YELLOW;
        } else if (colorMeasured <= COL_PINK + ERROR && colorMeasured >= COL_PINK - ERROR) {
            colorNeopixel = NEO_PINK;
        } else {
            colorNeopixel = NeoPixelColors.White;
        }
        // check if correct
        if (colorMeasured <= colorCorrect + ERROR && colorMeasured >= colorCorrect - ERROR) {
            isCorrect = true;
        } else {
            isCorrect = false;
        }
    }
    strip.showColor(colorNeopixel);
    pause(100);
})

basic.forever(function () {
    if (isCorrect) {
        gateOpen();
    } else {
        gateClose();
    }
    pins.servoWritePin(PIN_SERVO, servoSpeed);
})

// FUNCTIONS
function resetState() {
    gateClose();
}


function gateClose() {
    if (pins.digitalReadPin(PIN_SWITCH_OPEN)) {
        servoSpeed = SERVO_CLOSE;
    } else {
        servoSpeed = SERVO_STOP;
    }
}

function gateOpen() {
    if (pins.digitalReadPin(PIN_SWITCH_CLOSE)) {
        servoSpeed = SERVO_OPEN;
    } else {
        servoSpeed = SERVO_STOP;
    }
}