const mouse = {
    x: 0,
    y: 0,
    ox: 0,
    oy: 0,
    down: false
};
["down", "up", "move"].forEach(name => document.addEventListener("mouse" + name, mouseEvents));

var inminigame = false
var pressedScrewdriver = false
var notstarted = true
var finished = false
var interval

function mouseEvents(e) {
    if (notstarted) return
    if (finished) return
    mouse.x = e.pageX;
    mouse.y = e.pageY;
    mouse.down = e.type === "mousedown" ? true : e.type === "mouseup" ? false : mouse.down;
    update()
}

function getAngleBetween(cx, cy, ox, oy, mx, my) {
    var x1 = ox - cx;
    var y1 = oy - cy;
    var x2 = mx - cx;
    var y2 = my - cy;
    var d1 = Math.max(0.001, Math.sqrt(x1 * x1 + y1 * y1));
    var d2 = Math.max(0.001, Math.sqrt(x2 * x2 + y2 * y2));
    return Math.asin((x1 / d1) * (y2 / d2) - (y1 / d1) * (x2 / d2));
}
var w, h, cw, ch;
var angle = 0
var cycle = 0

function update() {
    cw = (w = rotatingCircle.width = innerWidth) / 2;
    ch = (h = rotatingCircle.height = innerHeight) / 2;
    var change = 0;
    if (mouse.down) {
        change = getAngleBetween(cw, ch, mouse.ox, mouse.oy, mouse.x, mouse.y);
        angle += change;
    }

    $("#rotatingCircle").css("transform", "rotate(" + ((angle * 180 / Math.PI) | 0) * 15 + "deg)")

    mouse.ox = mouse.x;
    mouse.oy = mouse.y

    if (change*10000 >= 25 && cycle == 0) {
        $("#smallScrewdriver").css("background-image", "url(\"./assets/Small-Screwdriver-2.png\")")
    }
    if (change*10000 <= 25 && cycle == 0) {
        $("#smallScrewdriver").css("background-image", "url(\"./assets/Small-Screwdriver-1.png\")") 
    }

    if (change*10000 <= -15 && cycle == 1) {
        $("#smallScrewdriver").css("background-image", "url(\"./assets/Small-Screwdriver-1.png\")")
    }
    if (change*10000 >= -15 && cycle == 1) {
        $("#smallScrewdriver").css("background-image", "url(\"./assets/Small-Screwdriver-2.png\")")
    }

    if (((angle * 180 / Math.PI) | 0) * 15 >= 1080 && cycle != 1 && cycle != 2) {
        cycle++
        $("#rotatingCircle").css("background-image", "url(\"./assets/Rotate-2.png\")")
        $("#rotatingCircle").css("-webkit-filter", "drop-shadow(0 0 0.55vw rgba(25, 219, 22, 1.0))")
        setTimeout(function() {
            $("#rotatingCircle").css("-webkit-filter", "drop-shadow(0 0 0.55vw rgba(255, 255, 255, 1.0))")
        }, 350)
    }

    if (((angle * 180 / Math.PI) | 0) * 15 <= 0 && cycle == 1 && cycle != 2) {
        cycle++
        $("#rotatingCircle").css("-webkit-filter", "drop-shadow(0 0 0.55vw rgba(25, 219, 22, 1.0))")
        setTimeout(function() {
            $("#rotatingCircle").css("-webkit-filter", "drop-shadow(0 0 0.55vw rgba(255, 255, 255, 1.0))")
        }, 350)
    }

    if (cycle == 2) {
        finished = true
        stopMinigame()
    }
}

function startGame() {
    if (inminigame) return
    inminigame = true
    $("#main").css("right", "0vw")
    var currentWidth = 0
    interval = setInterval(function() {
        $("#timerBar").css("width", currentWidth + 23.5 / 100 + "vw")
        currentWidth = currentWidth + 23.5 / 1000
        if (currentWidth >= 24) {
            $.post('http://b01_ctwhotwire/result', JSON.stringify({result: false}));
            stopMinigame()
            clearInterval(interval)
        }
        if (finished) {
            $("#main").css("background-image","url(./assets/LitUpDashboard.png)")
            $.post('http://b01_ctwhotwire/result', JSON.stringify({result: true}));
            clearInterval(interval)
        }
    }, 10)
}

function stopMinigame() {
    $("#rotatingCircle").fadeOut(250)
    setTimeout(function() {
        $("#main").css("right", "-40vw")
    }, 500)
    setTimeout(function() {
        pressedScrewdriver = false
        $("#main").css("background-image","url(./assets/Dashboard.png)")
        $("#rotatingCircle").css("background-image", "url(\"./assets/Rotate-1.png\")")
        $("#bigScrewdriver").css("filter", "drop-shadow(0 0 0.55vw rgba(255, 255, 255, 1.0))")
        $("#bigScrewdriver").css("top", "14vw")
        $("#bigScrewdriver").css("left", "-3.5vw")
        $("#bigScrewdriver").css("pointer-events", "all")
        $("#timerBar").css("width", "0.0vw")
        $("#bigScrewdriver").show()
        $("#smallScrewdriver").hide()
        $("#crackedKeyHole").hide()
        notstarted = true
        finished = false
        inminigame = false
        angle = 0
        cycle = 0
        clearInterval(interval)
    }, 1000)
}

$(document).click(function(event) {
    var targetID = event.target.id
    if (targetID == "bigScrewdriver" && !pressedScrewdriver) {
        pressedScrewdriver = true
        $("#bigScrewdriver").css("filter", "none")
        $("#bigScrewdriver").css("top", "12.25vw")
        $("#bigScrewdriver").css("left", "0.4vw")
        setTimeout(function() {
            $("#bigScrewdriver").hide()
            $("#bigScrewdriver").css("pointer-events", "none")
            $("#smallScrewdriver").show()
            $("#crackedKeyHole").show()
            $("#rotatingCircle").fadeIn(150)
            notstarted = false
        }, 150)
    }
})

$(document).ready(function() {
    window.addEventListener('message', function(event) {
        var data = event.data
        if (data.type == "start"){
            startGame()
        }
        if (data.type == "stop"){
            stopMinigame()
        }
    });
});