load.js([
    "/exper/matching/utlis.js",
    "/exper/matching/css.js",
    "/exper/matching/exp.js",
    "/exper/matching/instruction.js",
    "/assets/js/jsencrypt.js"
]);

$("body").css({
    background: "grey",
    overflow: "auto hidden"
});

document.title = "termPaper";
let timeline = [];
let version = "v4"; // 版本号
let info = {}; // 被试信息
let subjectID = "sv02"; // 本次实验ID
let recepetion = 8; // 循环次数
// 8 * 48 = 384
let formNum = 96; // 单个block所包含的试次总数
let pracNum = 60; // 练习数量
let pracAcc = 0.7; // 练习所需正确率
let img = ["matching/img/Tri.png", "matching/img/Squ.png", "matching/img/Pen.png", "matching/img/Cir.png"];
let title = {
    "word": ["三角形", "正方形", "五边形", "圆形"],
    "tag": ["自己", "母亲", "朋友", "生人"]
};
// 以上三个变量可以随心改，但请保证数量一致
let wordEn = {
    "三角形": "triangle",
    "正方形": "square",
    "五边形": "pentagon",
    "圆形": "circular",
    "自己": "self",
    "母亲": "mother",
    "朋友": "friend",
    "生人": "stranger",
    "Tri": "triangle",
    "Squ": "square",
    "Pen": "pentagon",
    "Cir": "circular"
}; // 结尾保持英文用
let mismatch = [1, 2, 3]; // 不匹配 任务数量

if(jsPsych.data.urlVariables().debug) { 
    pracAcc = 0;
    version = "t4";
    recepetion = 1; // 循环次数
    // 8 * 48 = 384
    formNum = 12; // 单个block所包含的试次总数
    pracNum = 5; // 练习数量
}


let sort = jsPsych.utils.permutation(mismatch, 3); // 三种条件随机
var answers = order(["m", "n"]); // 按键随机
let trialInfo = { round: 0 }; // 不知道什么用，估计可以删了
let blockNum = 0, trialNum = 0;
sessionStorage.clear();
sessionStorage.setItem("errorPrac", 0); // 判断是否练习错误
sessionStorage.setItem("type", "");
sessionStorage.setItem("donePrac", 0);
let rsaen = new JSEncrypt();
rsaen.setPublicKey("-----BEGIN PUBLIC KEY-----\
        MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDNdLca2Flu2IMjesyyHkMqC/6C\
        xYoUVvOd45+GfDLS7KkcGI7yeyhlNWRhLCFOONDqUSSp8gIVjBo42plWwXuBAW+X\
        v1MAI6JsYg0ZfohP0shxXb8AoWHFqUDB2L6WmxyVPhgdG9FiKMEoH1z/eTe8uFYn\
        QD7kKnSmMG73Sy9zYQIDAQAB\
        -----END PUBLIC KEY-----"); // 加密用
timeline.push(
    {
        // 进入全屏
        type: 'fullscreen',
        fullscreen_mode: true,
        message: "<p style='font: bold 42px 微软雅黑; color: #B22222'>\
                       欢迎参与我们的实验</p>\
                       <p style='font: 30px 微软雅黑; color: white'><br/>\
                       <单击下方 我同意 进入实验程序><br/><b>实验过程中请勿退出全屏</b>\
                       <br/><br/></p>\
                       <p style='font: 24px 华文中宋; color: grey'>\
                       Mupsy在线实验室<br/>2021年</p>",
        button_label: "我同意",
        on_finish: function () {
            landScape();
            if (window.orientation === 180 || window.orientation === 0) $("#orientLayer")[0].style.display = "block";
            window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", function () {
                if (window.orientation === 180 || window.orientation === 0) {
                    $("#orientLayer")[0].style.display = "block";
                }
                if (window.orientation === 90 || window.orientation === -90) {
                    $("#orientLayer")[0].style.display = "none";
                }
            }, false);
        }
    }, instruction(), {
    type: 'preload',
    images: img,
    // audio: ['sound/speech_green.mp3', 'sound/speech_red.mp3'],
    message: '<p>程序加载中，请稍后......</p>',
    continue_after_error: false,
    max_load_time: 10000,
    on_error: function (file) {
        console.log('Error: ', file);
    },
    on_success: function (file) {
        console.log('Loaded: ', file);
    }
}, info_get(subjectID, [{
    type: "survey-html-form",
    preamble: "<p style =' color : white'>你的手机号是</p>",
    html: "<p><input name='Q0' type='text' value='' maxlength='11' required /></p>",
    button_label: "继续",
    on_load: function () {
        $('#jspsych-survey-html-form-next').attr("disabled", "disabled");
        $("input[type=text]").on("input", function (a) {
            let p = /^[1][3,4,5,7,8][0-9]{9}$/;
            if (p.test(a.currentTarget.value)) {
                $('#jspsych-survey-html-form-next').attr("disabled", false);
            } else {
                $('#jspsych-survey-html-form-next').attr("disabled", true);
            }
        });
    },
    on_finish: function (data) {
        info["PhoneNumber"] = rsaen.encrypt(data.response.Q0);
    }
}]), {
    type: "call-function",
    func: function () {
        if ($(window).outerHeight() < 500) {
            alert("你设备不支持实验，请换一个高分辨率的设备，谢谢。");
            window.location = "";
        }
        let typeSort = sort[parseInt(info["index"].replace(subjectID, "")) % sort.length]; // sort 顺序

        let tmpArrW = order(title[Object.keys(title)[Math.min(info["series"], Object.keys(title).length)]]); // 列出 每行每列均不相等的情况
        let sti = com(img, jsPsych.utils.deepCopy(tmpArrW), mismatch);

        if (parseInt(info["series"])) {
            // 第二天
            // 学习阶段
            jsPsych.addNodeToEndOfTimeline({
                type: "html-button-response",
                stimulus: "<p class='head'>接下来，请你记住下面的联结:</p>" + getMatchWord(sti.match) + "<p class='footer'>然后你会需要回答一些问题，准备好了请点击 继续 </p>",
                choices: ["继续"],
                on_finish: function () {
                    blockNum = 1;
                    trialNum = 0;
                    sessionStorage.setItem("errorStudy", 0);
                }
            });
            jsPsych.addNodeToEndOfTimeline({
                timeline: [{
                    timeline: [{
                        type: "html-button-response",
                        stimulus: "<p class='head'>注意，错误次数过多，请你仔细记住下面的联结:</p>" + getMatchWord(sti.match) + "<p class='footer'>然后你会需要回答一些问题，准备好了请点击 继续 </p>",
                        choices: ["继续"],
                        on_finish: function () {
                            blockNum += 1;
                            trialNum = 0;
                            sessionStorage.setItem("errorStudy", 0);
                        }
                    }],
                    conditional_function: function () {
                        if (parseInt(sessionStorage.getItem("errorStudy"))) {
                            return true
                        } else {
                            return false
                        }
                    }
                }, {
                    type: "html-button-response",
                    stimulus: function () {
                        return "<p class='content'><img src='" + jsPsych.timelineVariable("img", true) + "' ></p><p class='content' style='margin-block: 50px'>+</p>";
                    },
                    choices: title["tag"],
                    on_load: function() { 
                        $("#jspsych-content").append("<p class='content' style='margin-block: 50px'>选择与图形对应的人物标签</p>")
                    },
                    on_finish: function (data) {
                        trialNum += 1;
                        data.blockType = "study";
                        data.block = blockNum;
                        data.trial = trialNum;

                        data.acc = title["tag"][data.response] === jsPsych.timelineVariable("word", true) ? 1 : 0;

                        data.shapeFileName = jsPsych.timelineVariable("img", true).replace("matching/img/", ""); // 图片名称
                        data.shape = jsPsych.timelineVariable("img", true).replace("matching/img/", "").replace(".png", "");
                        data.shapeEn = wordEn[data.shape];
                        // 第二天 图形和人物
                        data.characterName = jsPsych.timelineVariable("word", true);
                        data.characterNameEn = wordEn[jsPsych.timelineVariable("word", true)];
                        data.save = true;
                        // console.log(tags[data.response], jsPsych.timelineVariable("word", true));
                    }
                }, {
                    timeline: [{
                        type: "html-button-response",
                        stimulus: function() {
                            let data = jsPsych.data.get().filter({ blockType: "study" }).last(sti.match.length * 5);
                            let acc = data.select("acc").mean();
                            let rt = data.select("rt").mean();
                            return `<p>你的正确率为：${acc * 100}%</p>
                            <p>接下来是休息时间，当你结束休息后，你可以点击 结束休息 按钮或者按 空格键 继续</p>`
                        },
                        choices: ["结束休息"],
                        on_load: function() {
                            $(document.body).keypress(function(a){ 
                                if(a.originalEvent.key == " ") { 
                                    $(".jspsych-html-button-response-button").click()
                                }
                            });
                        },
                        on_finish: function() {
                            $(document.body).unbind();
                        }
                    }],
                    conditional_function: function () {
                        if (trialNum == sti.match.length * 5) {
                            return true
                        } else {
                            return false
                        }
                    }
                }],
                timeline_variables: jsPsych.randomization.repeat(sti.match, 5),
                loop_function: function () {
                    let data = jsPsych.data.get().filter({ blockType: "study" }).last(sti.match.length * 5).select("acc").mean();
                    if (data >= pracAcc) {
                        sessionStorage.setItem("errorStudy", 0);
                        return false;
                    } else {
                        sessionStorage.setItem("errorStudy", 1);
                        return true;
                    }
                }
            });
            // 学习阶段 end

        }

        typeSort.forEach(v => {
            let exp = exp_process(sti, v - 1);
            // load.plugins(exp);
            jsPsych.addNodeToEndOfTimeline({
                timeline: exp
            });
        });
    }
});

// 主要实验程序
let trial = {
    type: "psychophysics",
    stimuli: [
        {
            obj_type: 'cross',
            startX: "center", // location of the cross's center in the canvas
            startY: "center",
            line_length: 30,
            line_width: 5,
            line_color: 'white', // You can use the HTML color name instead of the HEX color.
            show_start_time: 500,
            show_end_time: 1100// ms after the start of the trial
        }, {
            obj_type: 'image',
            file: jsPsych.timelineVariable("img"),
            startX: "center", // location of the cross's center in the canvas
            startY: function () {
                return $(document).outerHeight() / 2 - 128 * 0.8 - 50;
            },
            show_start_time: 1000, // ms after the start of the trial
            show_end_time: 1100,
            scale: 0.8
        }, {
            obj_type: 'text',
            startX: "center",
            startY: function () {
                return $(document).outerHeight() / 2 + 100;
            },
            content: jsPsych.timelineVariable("word"),
            font: (50).toString() + "px 'Arial'",
            text_color: 'white',
            show_start_time: 1000, // ms after the start of the trial
            show_end_time: 1100
        }
    ],
    // choices: function () {
    //     return answers[parseInt(info["index"].replace(subjectID, "")) % answers.length];
    // }, // 0 always is match condition
    choices: jsPsych.ALL_KEYS,
    response_start_time: 1000,
    trial_duration: function () {
        if (sessionStorage.getItem("type") == "prac") {
            return 1100 + 1000 + Math.floor(Math.random() * 500);
        } else {
            return 1100 + 2000;
        }
    }, // 刺激呈现时间
    background_color: "grey", // 背景灰色
    on_finish: function (data) {
        trialNum += 1;
        trialInfo["round"] = trialInfo["round"] ? trialInfo["round"] + 1 : 1;
        let answer = answers[parseInt(info["index"].replace(subjectID, "")) % answers.length];
        // trial information
        data.shapeFileName = jsPsych.timelineVariable("img", true).replace("matching/img/", ""); // 图片名称
        data.shape = jsPsych.timelineVariable("img", true).replace("matching/img/", "").replace(".png", ""); // 图形形状
        data.shapeEn = wordEn[data.shape];
        data.misNum = sessionStorage.getItem("misNum"); // 不匹配任务数量
        if (info["series"] == 0) {
            // 第一天 图形和名称
            data.shapeName = jsPsych.timelineVariable("word", true);
            data.shapeNameEn = wordEn[jsPsych.timelineVariable("word", true)];
        } else {
            // 第二天 图形和人物
            data.characterName = jsPsych.timelineVariable("word", true);
            data.characterNameEn = wordEn[jsPsych.timelineVariable("word", true)];
        }
        data.condition = jsPsych.timelineVariable("condition", true);
        data.correctResp = data.condition === "match" ? answer[0] : answer[1]; // 对的按键
        data.subjResp = data.key_press; // 被试按键

        data.blockType = sessionStorage.getItem("type"); // 反应类别
        data.block = blockNum;
        data.trial = trialNum;
        data.round = trialInfo["round"];
        data.save = true;
        // reaction & Acc
        data.rt = data.rt;
        data.acc = ((answer[0] === data.key_press && data.condition === "match") || (answer[1] === data.key_press && data.condition === "mismatch")) ? 1 : 0;
        // DDM
        data.subj_idx = info["index"];
        data.response = data.acc;


        $(document).unbind("touchstart", touch);
    },
    on_load: function () {
        $(document).on("touchstart", touch);
    }
};

mupsyStart(timeline, {}, function () {
    document.exitFullscreen();
    let p = ["response_type", "key_press", "avg_frame_time", "center_x", "center_y", "trial_type", "trial_index", "internal_node_id"];
    let data = jsPsych.data.get().filter({ save: true }).addToAll(info).filterColumns((function () {
        // let a = jsPsych.data.get().filter({ save: true }).uniqueNames();
        // p.forEach(v => {
        //     a.splice(a.indexOf(v), 1);
        // });
        return ["index", "subj_idx", "Name", "Sex", "BirthYear", "Education", "PhoneNumber", "shapeFileName", "shape",
            "shapeEn", "shapeName", "shapeNameEn", "characterName", "characterNameEn", "misNum", "correctResp", "subjResp", "series", "condition",
            "block", "blockType", "trial", "response", "acc", "rt", "time_elapsed"];
    })()).csv();
    return {
        save: true,
        id: info["index"] + "_" + version + "_day" + (parseInt(info["series"]) + 1),
        data: data
    }
});