// Defaults

var drawing = false;
var pen_size = 30;
var tool = "pen";
var current_color = "black";
var css_root = document.querySelector(':root')
var background = document.getElementById("back_image")

// Elements

var canvas = document.getElementById("canvas");

// Images

var transparent_image = document.getElementById("transparent_image");

// CSS Vars

function css_get(variable) {
    var fetch = getComputedStyle(css_root);
    return fetch.getPropertyValue(`--${variable}`);
}

function css_set(variable,value) {
    css_root.style.setProperty(`--${variable}`, value);
}

// Themes

const themes = {
    dark: function(){
        css_set("back","#000000")
        css_set("main","#202020")
        css_set("border","#ffffff")
        css_set("text","#ffffff")
        background.src = "none"
    },
    light: function(){
        css_set("back","#dadada")
        css_set("main","#ffffff")
        css_set("border","#000000")
        css_set("text","#000000")
        background.src = "none"
    },
    sakura: function(){
        css_set("back","#a95d6e")
        css_set("main","#ffa3b8")
        css_set("border","#ffffff")
        css_set("text","#ffffff")
        background.src = "images/sakura.png"
    },
    buzz: function(){
        css_set("back","transparent")
        css_set("main","#ffefaf")
        css_set("border","#000000")
        css_set("text","#000000")
        background.src = "images/bees.png"
    },
    pacifica: function(){
        css_set("back","#C3EFEB")
        css_set("main","#9FCECA")
        css_set("border","#ffffff")
        css_set("text","#ffffff")
        background.src = "images/pacifica.png"
    },
    update: function(select){
        eval("themes." + select.value + "()")
    },
}

// Tools

const tools = {
    pen: function(){
        tool = "pen"
    },
    eraser: function(){
        tool = "eraser"
    },
    line: function(){
        tool = "line"
    },
    rect: function(){
        tool = "rect"
    },
    update: function(select){
        eval("tools." + select.value + "()")
    }
}

function change_size(destination){
    if(destination > 100){
        destination = 100
    }
    pen_size = destination
    circle.style.width = pen_size
    circle.style.height = pen_size
    document.getElementById("size_box").value = pen_size
    document.getElementById("size_slider").value = pen_size
}

function change_color(destination){
    current_color = destination
}

// Layers

class Layer {
    constructor(name) {
        this.element = document.createElement("canvas");
        this.element.style.position = "absolute";
        canvas.appendChild(this.element);
        this.element.width = 900;
        this.element.height = 450;
        this.element.classList.add("canvas_layer")
        this.ctx = this.element.getContext("2d");
        this.ctx.imageSmoothingQuality = "high";
        this.saves = [];

        // Preview Layer

        this.preview = document.createElement("canvas");
        this.preview.style.position = "absolute";
        canvas.appendChild(this.preview);
        this.preview.width = 900;
        this.preview.height = 450;
        this.preview.classList.add("canvas_layer")
        this.ctx2 = this.preview.getContext("2d");
        this.ctx2.imageSmoothingQuality = "high";
        this.saves = [];
    }
    save() {
        this.saves.push(this.ctx.getImageData(0, 0, this.element.width, this.element.height));
    }
    undo() {
        if (this.saves.length > 0) {
            this.ctx.putImageData(this.saves.pop(), 0, 0);
        }
    }
}

// Transparent Layer

var transparent_layer = new Layer("transparent_layer");
transparent_layer.ctx.beginPath();
transparent_layer.ctx.drawImage(transparent_image, 0, 0, 900, 450);
transparent_layer.ctx.stroke();
transparent_layer.element.style.opacity = "50%"

var layer1 = new Layer("layer1");

// Event Handling
tools.pen()

document.addEventListener('mousedown', start);
document.addEventListener('mouseup', end);
document.addEventListener('mousemove', draw);
document.addEventListener('keydown', shortcut);

var ogX = 0
var ogY = 0

function start(e) {
    if(tool == "pen"){
        drawing = true;
        layer1.save();
        draw(e)
    }
    if(tool == "line"){
        drawing = true;
        layer1.save();
        var rect = layer1.element.getBoundingClientRect(),
        scaleX = layer1.element.width / rect.width,
        scaleY = layer1.element.height / rect.height,
        x = (e.clientX - rect.left) * scaleX,
        y = (e.clientY - rect.top) * scaleY;
        ogX = x
        ogY = y
        console.log(ogX,ogY)
        draw(e)
    }
    if(tool == "rect"){
        drawing = true;
        layer1.save();
        var rect = layer1.element.getBoundingClientRect(),
        scaleX = layer1.element.width / rect.width,
        scaleY = layer1.element.height / rect.height,
        x = (e.clientX - rect.left) * scaleX,
        y = (e.clientY - rect.top) * scaleY;
        ogX = x
        ogY = y
        console.log(ogX,ogY)
        draw(e)
    }
    if(tool == "eraser"){
        drawing = true;
        layer1.save();
        draw(e)
    }
}

function draw(e) {
    if(tool == "pen"){
        if (!drawing) return;
        var rect = layer1.element.getBoundingClientRect(),
            scaleX = layer1.element.width / rect.width,
            scaleY = layer1.element.height / rect.height,
            x = (e.clientX - rect.left) * scaleX,
            y = (e.clientY - rect.top) * scaleY;
        layer1.ctx.globalCompositeOperation = "source-over"
        layer1.ctx.lineWidth = pen_size;
        layer1.ctx.lineCap = "round";
        layer1.ctx.strokeStyle = current_color;
        layer1.ctx.lineTo(x, y);
        layer1.ctx.stroke();
        layer1.ctx.beginPath();
        layer1.ctx.moveTo(x, y);
    }
    if(tool == "line"){
        if (!drawing) return;
        var rect = layer1.element.getBoundingClientRect(),
            scaleX = layer1.element.width / rect.width,
            scaleY = layer1.element.height / rect.height,
            x = (e.clientX - rect.left) * scaleX,
            y = (e.clientY - rect.top) * scaleY;
        layer1.ctx2.clearRect(0,0,layer1.element.width,layer1.element.height)
        layer1.ctx2.globalCompositeOperation = "source-over"
        layer1.ctx2.lineWidth = pen_size;
        layer1.ctx2.lineCap = "round";
        layer1.ctx2.strokeStyle = current_color;
        layer1.ctx2.moveTo(ogX, ogY);
        layer1.ctx2.lineTo(x, y);
        layer1.ctx2.stroke();
        layer1.ctx2.beginPath();
    }
    if(tool == "rect"){
        if (!drawing) return;
        var rect = layer1.element.getBoundingClientRect(),
            scaleX = layer1.element.width / rect.width,
            scaleY = layer1.element.height / rect.height,
            x = (e.clientX - rect.left) * scaleX,
            y = (e.clientY - rect.top) * scaleY;
        layer1.ctx2.clearRect(0,0,layer1.element.width,layer1.element.height)
        layer1.ctx2.globalCompositeOperation = "source-over"
        layer1.ctx2.lineWidth = pen_size;
        layer1.ctx2.lineCap = "round";
        layer1.ctx2.strokeStyle = current_color;
        layer1.ctx2.rect(ogX,ogY,(x - ogX),(y - ogY));
        layer1.ctx2.stroke();
        layer1.ctx2.beginPath();
    }
    if(tool == "eraser"){
        if (!drawing) return;
        var rect = layer1.element.getBoundingClientRect(),
            scaleX = layer1.element.width / rect.width,
            scaleY = layer1.element.height / rect.height,
            x = (e.clientX - rect.left) * scaleX,
            y = (e.clientY - rect.top) * scaleY;
        layer1.ctx.globalCompositeOperation = "destination-out"
        layer1.ctx.lineWidth = pen_size;
        layer1.ctx.lineCap = "round";
        layer1.ctx.strokeStyle = current_color;
        layer1.ctx.lineTo(x, y);
        layer1.ctx.stroke();
        layer1.ctx.beginPath();
        layer1.ctx.moveTo(x, y);
    }
}

function end(e) {
    if(tool == "pen"){
        drawing = false;
        layer1.ctx.beginPath();
    }
    if(tool == "line"){
        drawing = false;
        layer1.ctx2.clearRect(0,0,layer1.element.width,layer1.element.height)
        layer1.ctx.beginPath();
        var rect = layer1.element.getBoundingClientRect(),
            scaleX = layer1.element.width / rect.width,
            scaleY = layer1.element.height / rect.height,
            x = (e.clientX - rect.left) * scaleX,
            y = (e.clientY - rect.top) * scaleY;
        layer1.ctx.globalCompositeOperation = "source-over"
        layer1.ctx.lineWidth = pen_size;
        layer1.ctx.lineCap = "round";
        layer1.ctx.strokeStyle = current_color;
        layer1.ctx.moveTo(ogX, ogY);
        layer1.ctx.lineTo(x, y);
        layer1.ctx.stroke();
    }
    if(tool == "rect"){
        drawing = false;
        layer1.ctx2.clearRect(0,0,layer1.element.width,layer1.element.height)
        layer1.ctx.beginPath();
        var rect = layer1.element.getBoundingClientRect(),
            scaleX = layer1.element.width / rect.width,
            scaleY = layer1.element.height / rect.height,
            x = (e.clientX - rect.left) * scaleX,
            y = (e.clientY - rect.top) * scaleY;
        layer1.ctx.globalCompositeOperation = "source-over"
        layer1.ctx.lineWidth = pen_size;
        layer1.ctx.lineCap = "round";
        layer1.ctx.strokeStyle = current_color;
        layer1.ctx.rect(ogX,ogY,(x - ogX),(y - ogY));
        layer1.ctx.stroke();
    }
    if(tool == "eraser"){
        drawing = false;
        layer1.ctx.beginPath();
    }
}

// Keyboard Shortcuts

function shortcut(e) {
    if (e.key == 'z') {
        layer1.undo()
    }
}

// cursor 

var circle = document.createElement("div");
circle.style.position = "fixed";
circle.style.top = "0";
circle.style.left = "0";
circle.style.width = pen_size;
circle.style.height = pen_size;
circle.style.border = "1px solid black";
circle.style.borderRadius = "100px";
circle.style.pointerEvents = "none";
circle.style.visibility = "hidden"

document.body.appendChild(circle);

canvas.addEventListener("mousemove", function(event) {
    console.log()
    circle.style.left = (event.clientX - (parseInt(circle.style.width) / 2)) + "px";
    circle.style.top = (event.clientY - (parseInt(circle.style.height) / 2)) + "px";
    circle.style.visibility = "visible"
});

canvas.addEventListener("mouseleave", function() {
    circle.style.visibility = "hidden"
});