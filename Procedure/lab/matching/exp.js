// 主体实验程序
function exp(variable, trial, match, maxMismatch, misType = 0) {
    let subTV = jsPsych.randomization.shuffleNoRepeats(variable, function (x, y) { return x.img === y.img && x.word === y.word });
    let subT = [{
        timeline: [{
            type: "instructions",
            pages: function() {
                let start = "<p class='header'>如果您已经完成理解了实验任务，按继续键，进入练习前的准备阶段。</p>\
                            <p class='header'>下面是1对3任务，请您记住如下联结:</p>",
                    end = "<p class='footer'>按 继续 进入练习阶段</p><div>";
                    sessionStorage.setItem("type", "prac");
                    sessionStorage.setItem("misNum", misType);
                    blockNum = 1; 
                    trialNum = 0;
                return [start + getMatchWord(match) + end + getKeys()];
            },
            show_clickable_nav: true,
            allow_backward: false,
            button_label_previous: "返回",
            button_label_next: "继续",
        }],
        conditional_function: function() { 
            if(parseInt(sessionStorage.getItem("donePrac"))) {
                return false;
            } else { 
                return true;
            }
        }
    }, {
        timeline: [{
            timeline: [{
                type: "instructions",
                pages: function() {
                    let start = "<p class='header'>接下来还是1对3不匹配任务，请您仔细记住如下联结:</p>",
                        end = "<p class='footer'>按 继续 进入练习阶段</p><div>";
                    blockNum += 1;
                    trialNum = 0;
                    return [start + getMatchWord(match) + end + getKeys()];
                },
                show_clickable_nav: true,
                allow_backward: false,
                button_label_previous: "返回",
                button_label_next: "继续",
                on_finish: function() { 
                    sessionStorage.setItem("errorPrac", 0);
                }
            }],
            conditional_function: function() {
                if(parseInt(sessionStorage.getItem("errorPrac"))) {
                    return true
                } else {
                    return false
                }
            }
        }, trial, {
            type: "html-keyboard-response",
            stimulus: function () {
                let a = jsPsych.data.get().last(1).values()[0];
                if(a.subjResp && a.subjResp != "m" && a.subjResp != "n") return getKeys();
                if (a.acc) {
                    return "<span style='color: blue; font-size: 55px;' class='feedback'>✓</span>";
                } else if (a.subjResp) {
                    return "<span style='color: red; font-size: 55px;' class='feedback'>×</span>";
                } else {
                    return "<span style='color: yellow' class='feedback'>太慢</span>";
                }
            },
            choices: jsPsych.NO_KEYS,
            trial_duration: 1000
        }, {
            timeline: [{
                type: "html-button-response",
                stimulus: function() {
                    let data = jsPsych.data.get().filter({ save: true }).last(pracNum);
                    let acc = data.select("acc").mean();
                    let rt = data.select("rt").mean();
                    return `<p>你的正确率为：${acc * 100}%</p>
                    <p>接下来是休息时间，当你结束休息后，你可以点击 结束休息 按钮或者按 空格键 继续</p>
                    <p>您当前休息了<span id="iii">0</span>秒</p>`
                },
                choices: ["结束休息"],
                on_load: function() {
                    $(document.body).keypress(function(a){ 
                        if(a.originalEvent.key == " ") { 
                            $(".jspsych-html-button-response-button").click()
                        }
                    });
                    let tmpTime = setInterval(function() { 
                        $("#iii").text(parseInt($("#iii").text()) + 1);
                    }, 1000);
                    sessionStorage.setItem("tmpInter", tmpTime);
                },
                on_finish: function() {
                    $(document.body).unbind();
                    clearInterval(parseInt(sessionStorage.getItem("tmpInter")));
                }
            }],
            conditional_function: function () {
                if (trialNum == pracNum) {
                    return true
                } else {
                    return false
                }
            }
        }],
        timeline_variables: jsPsych.randomization.shuffle(maxMismatch.length ? maxMismatch : variable).splice(0, pracNum), // 练习次数
        loop_function: function () {
            let data = jsPsych.data.get().filter({ save: true }).last(pracNum).select("acc").mean();
            if (data >= pracAcc) {
                sessionStorage.setItem("errorPrac", 0);
                sessionStorage.setItem("donePrac", 1);
                return false;
            } else {
                sessionStorage.setItem("errorPrac", 1);
                return true;
            }
        },
        randomize_order: true,
        conditional_function: function() { 
            if(parseInt(sessionStorage.getItem("donePrac"))) {
                return false;
            } else { 
                return true;
            }
        }
    }]; // 练习阶段
    subT.push({
        type: "instructions",
        pages: function() {
            let start = misType ? "<p class='header'>如果您已经完成理解了实验任务，按继续键，进入正式实验。</p> \
                    <p class='header'>下面是1对" + misType + "任务，请您记住如下联结:</p>" : "<p class='header'>请您记住如下联结:</p>",
                end = "<p class='footer'>按 继续 进入正式实验</p><div>";
            blockNum = 1; 
            trialNum = 0;
            sessionStorage.setItem("type", "formal");
            return [start + getMatchWord(match) + end + getKeys()];
        },
        show_clickable_nav: true,
        allow_backward: false,
        button_label_previous: "返回",
        button_label_next: "继续",
    }, {
        timeline: [trial],
        timeline_variables: subTV.splice(0, formNum),
        randomize_order: true
    }, {
        type: "html-button-response",
        stimulus: function() {
            let data = jsPsych.data.get().filter({ save: true }).last(formNum);
            let acc = data.select("acc").mean();
            let rt = data.select("rt").mean();
            return `<p>你的正确率为：${acc * 100}%</p>
            <p>你的平均反应时为：${ rt } ms</p>
            <p>接下来是休息时间，当你结束休息后，你可以点击 结束休息 按钮或者按 空格键 继续</p>
            <p>您当前休息了<span id="iii">0</span>秒</p>`
        },
        choices: ["结束休息"],
        on_load: function() {
            $(document.body).keypress(function(a){ 
                if(a.originalEvent.key == " ") { 
                    $(".jspsych-html-button-response-button").click()
                }
            });
            let tmpTime = setInterval(function() { 
                $("#iii").text(parseInt($("#iii").text()) + 1);
            }, 1000);
            sessionStorage.setItem("tmpInter", tmpTime);
        },
        on_finish: function() {
            $(document.body).unbind();
            clearInterval(parseInt(sessionStorage.getItem("tmpInter")));
        }
    });
    while (subTV.length > 0) {
        subT.push({
            type: "instructions",
            pages: function() {
                let start = misType ? "<p class='header'>如果您已经完成理解了实验任务，按继续键，进入正式实验。</p> \
                <p class='header'>下面是1对" + misType + "任务，请您记住如下联结:</p>" : "<p class='header'>请您记住如下联结:</p>",
                end = "<p class='footer'>按 继续 进入正式实验</p><div>";
                blockNum += 1;
                trialNum = 0;
                return [start + getMatchWord(match) + end + getKeys()];
            },
            show_clickable_nav: true,
            allow_backward: false,
            button_label_previous: "返回",
            button_label_next: "继续",
        }, {
            timeline: [trial],
            timeline_variables: subTV.splice(0, Math.min(formNum, subTV.length)),
            randomize_order: true
        }, {
            type: "html-button-response",
            stimulus: function() {
                let data = jsPsych.data.get().filter({ save: true }).last(formNum);
                let acc = data.select("acc").mean();
                let rt = data.select("rt").mean();
                return `<p>你的正确率为：${acc * 100}%</p>
                <p>你的平均反应时为：${ rt } ms</p>
                <p>接下来是休息时间，当你结束休息后，你可以点击 结束休息 按钮或者按 空格键 继续。</p>
                <p>您当前休息了<span id="iii">0</span>秒</p>`
            },
            choices: ["结束休息"],
            on_load: function() {
                $(document.body).keypress(function(a){ 
                    if(a.originalEvent.key == " ") { 
                        $(".jspsych-html-button-response-button").click()
                    }
                });
                let tmpTime = setInterval(function() { 
                    $("#iii").text(parseInt($("#iii").text()) + 1);
                }, 1000);
                sessionStorage.setItem("tmpInter", tmpTime);
            },
            on_finish: function() {
                $(document.body).unbind();
                clearInterval(parseInt(sessionStorage.getItem("tmpInter")));
            }
        });
    }
    return subT;
}
// 指导语中按键部分
function getKeys() {
    let answer = answers[parseInt(info["index"].replace(subjectID, "")) % answers.length];
    return `
    <p class="key">如果二者匹配，请按 ${answer[0]} 键</p>
    <p class="key">如果二者不匹配，请按 ${answer[1]} 键</p>
    `;
}
// 指导语中联结呈现部分
function getMatchWord(arr) {
    if(arr.length && !arr.length) return 0;
    let a = "";
    arr.forEach(v => {
        a = a + `<p class="content">
        <img src="${v.img}" >--- <span class="word">${v.word}</span>
        </p>`;
    });
    return "<div class='box'>" + a + "</div>";
}
function exp_process(sti, typeThis) { 
        // 求公倍数，以保证数量一致
        let n = [];
        Object.keys(sti).forEach(v => {
            n.push(sti[v].length * 2);
            if (n.length > 1) {
                n.push(getLcm(n.splice(0, 1)[0], n.splice(0, 1)[0]));
            }
        });
        n = n[0];
        // 将所有情况组合出来
        let tmpA = [];
        Object.keys(sti).forEach((v, j) => {
            let tmp = [];
            if(j != 0) {
                for (let i = 0; i < (sti[v].length / sti["match"].length); i++) {
                    sti.match.forEach(f => {
                        tmp.push(f);
                    });
                }
                sti[v].forEach(f => {
                    tmp.push(f);
                });
                tmpA.push(tmp);
            }
        });
        let timevar = tmpA[typeThis];
        let tmpMaxMis = [];
        tmpA.forEach(v => {
            if (tmpMaxMis.length < v.length) { 
                tmpMaxMis = v;
            }
        });
        timevar = jsPsych.randomization.repeat(timevar, (n * recepetion) / timevar.length);
        return exp(timevar, trial, sti.match, jsPsych.randomization.repeat(tmpMaxMis, (n * recepetion) / tmpMaxMis.length), typeThis + 1);
}