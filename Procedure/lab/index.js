// Mupsy 开始实验
function mupsyStart(timeline, start = {}, end = function(){ return {} }) {

    start = Object.assign({}, {
        timeline: timeline,
        on_finish: function (data) {
            mupsyEnd(end());
            return undefined;
        },
        on_trial_start: function (data) {
            return undefined;
        },
        on_trial_finish: function (data) {
            return undefined;
        },
        on_data_update: function (data) {
            return undefined;
        },
        on_interaction_data_update: function (data) {
            return undefined;
        },
        on_close: function () {
            return undefined;
        },
        // 个人标志 外加实验进度条
        show_progress_bar: false,
        message_progress_bar: "Mupsy",
        auto_update_progress_bar: true,
        default_iti: 200,
        // 调节参数，默认为好
        minimum_valid_rt: 0,
        experiment_width: null,
        override_safe_mode: false,
        case_sensitive_responses: false,
        display_element: undefined
    }, start);

    jsPsych.init(start);
}

function mupsyEnd(option = {}) {
    console.log(option);
    // 定义 option
    option = Object.assign({}, {
        data: jsPsych.data.get().csv(),
        name: document.title,
        id: jsPsych.randomization.randomID(),
        url: "",
        end_html: "感谢你参与本次实验，本次实验到这里就结束了",
        save: true
    }, option);

    let DOM = document.getElementById("jspsych-content");
    DOM.innerHTML = "<p>正在保存数据中，请稍后</p>";

    if (option["url"] !== "") {
        // 开启新方法，切片数据文件
        let strs = strSplice(option["data"], 1024 * 1024); // 按照 1kb切片
        strs.forEach(str => {
            $.ajax({
                url: option["url"],
                type: "POST",
                data: {
                    data: str,
                    name: option["name"],
                    id: option["id"]
                },
                success: function (e) {
                    if (strs.indexOf(str) < strs.length - 1) { 
                        DOM.innerHTML = "<p>正在保存数据中，保存进度：" + strs.indexOf(str) / strs.length + "%</p>"
                    } else {
                        if (option["end_html"] !== "") {
                            DOM.innerHTML = option["end_html"];
                        } else {
                            jsPsych.data.displayData();
                        }
                    }
                }
            });
        });
    } else if (option["end_html"] !== "") {
        DOM.innerHTML = option["end_html"];
    } else {
        jsPsych.data.displayData();
    }
    if(option["save"]) { 
        jsPsych.data.get().localSave("csv", option["id"] + ".csv");
    }
}

// 实验被试信息收集
function info_get(subjectID = "Mupsy", other = []) {
    let a =  [{
        // 实验编号填写
        type: "survey-html-form",
        preamble: "<p style =' color : white'>你分配到的实验编号是</p>",
        html: "<p><input name='Q0' type='text' value='" + subjectID + "' disabled='disabled' /></p> \
        <p><input name='Q1' type='number' value='' min='1' required/></p>\
        <p id='numberf' style='font-size: 20px; color: white;'>你的最终编号是：</p>",
        button_label: "继续",
        on_load: function () {
            $("input[type=number]").on("input", function (e) {
                $("#numberf").html("你的最终编号是：" + $("input[name=Q0]").val() + e.currentTarget.value.toString().padStart(4, "0"));
                info["index"] = $("input[name=Q0]").val() + $("input[name=Q1]").val().toString().padStart(4, "0");
            });
        },
        on_finish: function() { 
            if(localStorage.getItem(info["index"])) { 
                info = JSON.parse(localStorage.getItem(info["index"]));
            }
        }
    }, {
        // 实验次数填写
        type: "survey-html-form",
        preamble: "<p style = 'color : white'>你完整参与本次实验的次数是</p>",
        html: function() {
            let data = localStorage.getItem(info["index"]) ? JSON.parse(localStorage.getItem(info["index"]))["frequencyOfExper"] : 0;
            return "<p><input name='Q0' type='number' value='" + data + "' min='0' required/></p>"
        },
        button_label: "继续",
        on_finish: function(data) { 
            info["series"] = data.response.Q0;
        }
    }, {
        type:"survey-html-form",
        preamble:"<p style =' color : white'>你的名字是</p>",
        html:function() {
            let data = localStorage.getItem(info["index"]) ? JSON.parse(localStorage.getItem(info["index"]))["Name"] : "";
            return "<p><input name='Q0' type='text' value='" + data + "' required/></p>";
        },
        button_label:"继续",
        on_finish: function (data) {
            info["Name"] = data.response.Q0;
        }
    }, {
        type: 'html-button-response',
        stimulus: "<p style = 'color : white'>你的性别</p>",
        choices: ['男', '女', '其他'],
        on_finish: function (data) {
            info["Sex"] = data.button_pressed == 0 ? "Male" : (data.button_pressed == 1 ? "Female" : "Other")
        }
    }, {
        type: 'survey-html-form',
        preamble: "<p style = 'color : white'>你的出生年</p>",
        html: function() {
            let data = localStorage.getItem(info["index"]) ? JSON.parse(localStorage.getItem(info["index"]))["BirthYear"] : "";
            return `<p>
    <input name="Q0" type="number" value=${data} placeholder="1900~2020" min=1900 max=2020 oninput="if(value.length>4) value=value.slice(0,4)" required />
    </p>`
        },
        button_label: '继续',
        on_finish: function (data) {
            info["BirthYear"] = data.response.Q0;
        }
    }, {
        type: 'survey-html-form',
        preamble: "<p style = 'color : white'>教育经历</p>",
        html: function () { 
            return `
            <p><select name="Q0" size=10>
            <option value=1>小学以下</option>
            <option value=2>小学</option>
            <option value=3>初中</option>
            <option value=4>高中</option>
            <option value=5>大学</option>
            <option value=6>硕士</option>
            <option value=7>博士</option>
            <option value=8>其他</option>
            </select></p>`
        },
        on_load: function() {
            $("option[value=" + (["below primary school", "primary school", "junior middle school", "high school", "university", "master", "doctor", "other"].indexOf(localStorage.getItem(info["index"]) ? JSON.parse(localStorage.getItem(info["index"]))["Education"] : "") + 1) + "]").attr("selected", true);
        },
        button_label: '继续',
        on_finish: function (data) {
            let edu = ["below primary school", "primary school", "junior middle school", "high school", "university", "master", "doctor", "other"];

            info["Education"] = edu[parseInt(data.response.Q0) - 1];
        }
    }];
    if(other.length > 0) { other.forEach(c => { a.push(c); }); }
    a.push({
        type: "call-function",
        func: function() {
            localStorage.removeItem(info["index"]);
            localStorage.setItem(info["index"], JSON.stringify(info));
        }
    });
    return {
        timeline: a
    }
}