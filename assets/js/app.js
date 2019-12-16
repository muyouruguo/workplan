const $ = (selector) => {
    return document.querySelector(selector)
};
const $$ = (selector) => {
    return document.querySelectorAll(selector)
};
const isDOM = (typeof HTMLElement === 'object') ? obj => {
    return obj instanceof HTMLElement;
} : obj => {
    return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string'
};

/*const removeDOM = (selector) => {
    let el;
    if (typeof selector === 'string') {
        el = $(selector);
    } else if (typeof selector === 'object' && isDOM(selector)) {
        el = selector
    }
    el.parentNode.removeChild(el);
};*/
/**
 * 事件绑定或委托
 * @param selector
 * @param event
 * @param childClass
 * @param callback
 */
const on = (selector, event, childClass, callback) => {
    let el;
    if (typeof selector === 'string') {
        el = $(selector);
    } else if (typeof selector === 'object' && isDOM(selector)) {
        el = selector
    }
    el.addEventListener(event, (e) => {
        if (typeof childClass === 'string') {
            if (e.target.classList.contains(childClass)) {
                callback && callback(e.target);
            } else {
                let parent = e.target;
                while (true){
                    parent = parent.parentNode;
                    if(parent.classList.contains(childClass)){
                        callback && callback(parent);
                        return
                    }
                    if(parent.nodeName === 'BODY'){
                        return
                    }
                }
            }
        } else if (typeof childClass === 'function') {
            childClass && childClass(e, e.target);
        }
    })
};


window.onload = function () {
    let days = init();
    $$('.list').forEach((item) => {
        on(item, 'click', 'icon-delete', (el) => {
            let plan = el.parentNode;
            let id = plan.dataset.id;
            days = removePlan(days, id);
            update(days);
        });
        on(item, 'click', 'plan', (el) => {
            setPlanState(days,el.dataset.id, el.dataset.state === '0' ? '1' : '0');
        })
    });
    let input = $('#input');
    input.name = new Date().getTime();
    on('#addPlanForm', 'submit', () => {
        event.preventDefault();
        addPlan(days, input.value);
        update(days);
        input.value = '';
        return false;
    });
};

/**
 * 渲染天
 * @param day
 * @returns {string}
 */
function renderDay(day) {
    let html = '';
    if (typeof day === 'object' && day.length !== null) {
        day.map((item) => {
            html +=
                `<div class="day">
                    <div class="date">${item.date}</div>
                    <div class="plans">
                        ${renderPlan(item.plans)}
                    </div>
                </div>`
        });
    }
    return html
}

/**
 * 渲染计划
 * @param plans
 * @returns {string}
 */
function renderPlan(plans) {
    let html = '';
    if (typeof plans === 'object' && plans.length !== null) {
        plans.map((item) => {
            if (item.state === '0') {
                html +=
                    `<div class="plan" data-id="${item.id}" data-state="${item.state}">
                        <span class="iconfont icon-checkbox"></span>
                        <span class="text">${item.text}</span>
                        <!--<span class="iconfont icon-edit"></span>-->
                        <span class="iconfont icon-delete"></span>
                    </div>`;
            } else {
                html +=
                    `<div class="plan" data-id="${item.id}" data-state="${item.state}">
                        <span class="iconfont icon-checkbox icon-checkbox-checked"></span>
                        <span class="text delete">${item.text}</span>
                        <span class="iconfont icon-delete"></span>
                    </div>`;
            }

        });
    }
    return html;
}


function render(el, data) {
    let $el = $(el);
    if ($el.length !== 0) {
        $el.innerHTML = renderDay(data);
    }
}

/**
 * 初始化
 * @returns {Array}
 */
function init() {
    let days = localStorage.getItem('days');
    days = days ? JSON.parse(days) : [];

    render('#days', days);
    return days
}

/**
 * 添加计划
 * @param days
 * @param text
 */
function addPlan(days, text) {
    let day = {
        date: new Date().Format('yyyy年MM月dd日'),
        plans: [{
            text,
            id: new Date().getTime() + parseInt(Math.random() * 1000) + '',
            state: '0'
        }]
    };
    if (typeof days === 'object' && days.length !== null) {
        let isFirstPlan = true;
        days.map((item) => {
            if (item.date === day.date) {
                item.plans.unshift(day.plans[0]);
                isFirstPlan = false;
            }
        });
        if (isFirstPlan) {
            days.unshift(day)
        }
    }
}

/**
 * 删除计划
 * @param days
 * @param id
 * @returns {*}
 */
function removePlan(days, id) {
    days = days.filter(day => {
        day.plans = day.plans.filter((item) => {
            return !(item.id === id)
        });
        return !(day.plans.length === 0)
    });
    return days
}

/**
 * 更新缓存数据和页面
 * @param days
 */
function update(days) {
    localStorage.setItem('days', JSON.stringify(days));
    init();
}

/**
 * 设置计划状态
 * @param days
 * @param id
 * @param state
 */
function setPlanState(days, id, state) {
    days.map(day => {
        day.plans.map(item =>{
            if(item.id === id){
                item.state = state
            }
        });
    });
    update(days);
}

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.Format = function (fmt) {
    let o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (let k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};
