// 自动按键盘
function keyAuto(keys = []) {
    let id = [];
    if (typeof (keys) !== "object" || keys.length < 1) { return 0; }
    for (let i = 0; i < keys.length; i++) {
        id.push(setInterval(function () {
            document.getElementsByTagName("body")[0].dispatchEvent(new KeyboardEvent("keydown", { key: keys[i] }));
            document.getElementsByTagName("body")[0].dispatchEvent(new KeyboardEvent("keyup", { key: keys[i] }));
        }, 1000));
    }
    return id;
}

window.load = (function() {
    let o ={};
    o.loaded = [];

    o.plugins = function(timeline){
        let plugins = jsPsych.utils.getPluginNames(timeline);
        plugins.forEach(f => {
            // let p = document.createElement("script");
            // p.type = "text/javascript"; p.setAttribute("async", "true");;
            let p;
            switch (f) {
                default:
                    p = "/assets/jspsych/plugins/jspsych-" + f + ".js";
                    break;
                case "psychophysics":
                    p = "/assets/jspsych-psychophysics/jspsych-psychophysics.js";
            }
            if(o.loaded.indexOf(p) >= 0) return 0;
            Skip.addJs(document.head, p);
            o.loaded.push(p);
        });
    }
    o.js = function(arr) {
        if (arr.length && arr.length > 0) {
            arr.forEach(function (url) {
                if(o.loaded.indexOf(url) >= 0) return 0;
                Skip.addJs(document.head, url);
                o.loaded.push(url);
            })
        }
    }
    return o;
})();

// 文本切片，防止过大
function strSplice(str = "", n = 1024) {
    let strArr = [];
    for (var i = 0, l = str.length; i < l / n; i++) {
        var a = str.slice(n * i, n * (i + 1));
        strArr.push(a);
    }
    return strArr;
}