auto(); // 无障碍服务
setScreenMetrics(1080, 2160); // 修改这里 屏幕分辨率,主要影响的是 unlock、 lock、 killXXQG 三个函数中写死的操作位置

var videoNum = 6; // 至少观看几个视频
var videoTimeInMinute = 9; // 视频至少观看几分钟
var articleNum = 7; // 一共阅读几篇文章
var articleCommentNum = 1; // 一共需要评论几篇文章
var articleTimeInMinute = 6; // 文章至少阅读几分钟
// 修改这里 修改下方的“北京”为自己的城市 或者 修改学习强国中的本地城市为北京
var city = "北京"; // 当前城市
var isCheckSpecialQuestionsOnce = true;    // 是否只检查一次专项答题，true 的话将只检查进入专项答题的第一页，不会一直往下翻到头。建议使用true，因为翻到头要很久，可能也会很卡。
var maxTryEnterMyScore = 3; // 最多尝试进入我的积分几次
var maxTryChallenge = 5; // 如果挑战答题未满分，最多进行几次尝试
var showConsole = false; // 是否打开调试，如果开启调试，则显示控制台以输出日志
var autoLockAndUnlock = false; // 是否自动解锁屏幕以及完成后锁屏（用于定时自动执行），如果是true的话需要自行完成下面的 unlock 和 lock 两个函数（最主要是 unlock 函数），当然如果每天手动运行脚本的话不影响
var killXXQGInStart = false; // 开始获取积分前杀掉学习强国，主要是为了控制脚本开始运行时学习强国的状态是可预料的。该项不是必须的。如果true的话需要自行完成下方的 killXXQG 函数

// 修改这里 (这部分是在锁屏状态下，自动进行解锁的代码。不保证任何UI的设备都能适配，因此需要自己摸索。如果每天手动运行的话，这部分不修改也不影响)
function unlock() {
    // 下方的函数仅作参考
    if (!device.isScreenOn()) { // 如果在息屏状态
        sleep(2000);
        device.wakeUp(); // 唤醒屏幕
        sleep(2000);
       Swipe(200, 300, 200, 1000, 1000); // 下拉通知栏
        sleep(2000);
        click(230, 230); // 点击左上角时间用于唤醒解锁界面
        sleep(2000);
        gesture(1000, [250, 1240], [540, 1240], [540, 1530], [830, 1240]); // 解锁手势
        sleep(random(10, 100) * 100); // 休眠若干秒
        toast('成功解锁!');
    }
}
function exit_app(name) {
    // fClear();
    log("尝试结束" + name + "APP");
    var packageName = getPackageName(name);
    if (!packageName) {
        if (getAppName(name)) {
            packageName = name;
        } else {
            return false;
        }
    }
    log("打开应用设置界面");
    app.openAppSetting(packageName);
    var appName = app.getAppName(packageName);
    //log(appName);
    log("等待加载界面")
    //textMatches(/应用信息|应用详情/).findOne(5000);
    text(appName).findOne(5000);
    sleep(1500);
    log("查找结束按钮")
    //let stop = textMatches(/(^强行.*|.*停止$|^结束.*)/).packageNameMatches(/.*settings.*|.*securitycenter.*/).findOne();
    let stop = textMatches(/(强.停止$|.*停止$|结束运行|停止运行|[Ff][Oo][Rr][Cc][Ee] [Ss][Tt][Oo][Pp])/).findOne();
    log("stop:", stop.enabled())
    if (stop.enabled()) {
        //log("click:", stop.click());
        real_click(stop);
        sleep(1000);
        log("等待确认弹框")
        //let sure = textMatches(/(确定|^强行.*|.*停止$)/).packageNameMatches(/.*settings.*|.*securitycenter.*/).clickable().findOne();
        let sure = textMatches(/(确定|.*停止.*|[Ff][Oo][Rr][Cc][Ee] [Ss][Tt][Oo][Pp]|O[Kk])/).clickable().findOne(1500);
        if (!sure) {
            fInfo(appName + "应用已关闭");
            back();
            return false;
        }
        log("sure click:", sure.click());
        log(appName + "应用已被关闭");
        sleep(1000);
        back();
    } else {
        log(appName + "应用不能被正常关闭或不在后台运行");
        sleep(1000);
        back();
    }
    return true;
}
function real_click(obj) {
    for (let i = 1; i <= 3; i++) {
        if (obj.click()) {
            log("real click: true");
            return true;
        }
        sleep(300);
    }
    console.warn("控件无法正常点击：", obj);
    log("尝试再次点击");
    click(obj.bounds().centerX(), obj.bounds().centerY());
    return false;
}
// 修改这里 (这部分是在从下拉控制栏中点击锁屏来关闭手机)
function lock() {
    // 下拉控制栏
    if (quickSettings()) {
        sleep(2000);
        click(180, 1300); // 点击快捷操作栏中的锁屏所在的位置
    }
}

// 修改这里 (下面这几行代码块是杀掉后台的学习强国，需要根据自己的设备情况调整。目标是从应用详情中点击强制停止-确认强制停止)
function killXXQG() {
    openAppSetting(getPackageName("学习强国"));
    sleep(1500);
    click(500, 100); // 如果有弹窗，点击空白处关掉弹窗
    sleep(500);
    click("结束运行"); // 点击结束运行
    sleep(1500);
    click("确定"); // 是否强行停止？ - 确定
    sleep(1500);
}



// 
function xxqg() {
    

    device.keepScreenOn(60 * 60 * 1000)// 设置屏幕常亮

    // 取消新版本体验
    if (text("取消").exists()) {
        text("取消").click()
        sleep(3000);
    }
    enterMyScore(maxTryEnterMyScore)
    var scoreToday = getCurrentScore(); // 获取当前积分


    if (40 > scoreToday) { // 分数还不足40则进行
        back()
        // 获取视频以及文章的积分
        enterMyScore(maxTryEnterMyScore);
        wenzhang()
        app.launchApp("学习强国")
        while (true) {
            // 获取控件id为1的控件对象
            var controlId1 = id("comm_head_xuexi_score").findOne();

            if (controlId1) {
                // 存在则停止循环
                break;
            } else {
                // 不存在则返回并休息2秒
                back();
                sleep(2000);
            }
        }

        enterMyScore(maxTryEnterMyScore); // 进入我的积分

        // 每日答题
        var everydayQuestions = className("android.view.View").text("每日答题").findOne();
        while ("去答题" == everydayQuestions.parent().child(4).text()) { // 每日答题还没拿满分
            everydayQuestions.parent().child(4).click(); // 进入每日答题
            answerQuestions(5);
            sleep(random(100, 200) * 10);
            back();
            sleep(random(200, 300) * 10);
            everydayQuestions = className("android.view.View").text("每日答题").findOne();
        }
        setInfo("每日答题 OK");
        sleep(random(100, 200) * 10);



        try {
            var scoreToday = getCurrentScore(); // 获取当前积分

            var str = "日一二三四五六".charAt(new Date().getDay()); log(str);

            if (40 > scoreToday) { // 分数还不足40则进行
                if (str == '一' || str == '四') {
                    foursomeCompetition();
                } else if (str == '三' || str == '六') {
                    pvp();
                } else if (str == '二' || str == '五' || str == '日') {
                    answerChallenge();
                }
                foursomeCompetition();
                scoreToday = getCurrentScore();
                sleep(random(2000, 3000));
            }

            // TODO: 下面的订阅逻辑可能有问题，但通常情况下执行到这里都会满40分，所以很少会进行这一步，因此暂时不做修改
            // if (40 > scoreToday) { // 如果分数不足40，尝试订阅
            //     var leftToSub = subscribe();
            //     scoreToday += (2 - leftToSub);
            //     setInfo(scoreToday)
            //     sleep(random(2000, 3000));
            // }




        } catch (error) {
            showConsole = true
            console.error(error)
        } finally {
            if (!showConsole) {
                console.clear()
            }
        }
        back() // 回到学习强国主界面
        sleep(random(1000, 2000));
        sc()

    } else {
        back(); sc()
    }
}

function sc() {
    function POST_request(url, params) {
        try {
            var res, sbody, obady;
            try {
                res = http.post(url, params);
                sbody = res.body.string();
                obady = JSON.parse(sbody);
            } catch (e) {
                sbody = null;
            }

            return obady;
        } catch (err) {
            return false;
        }
    }
    text("我的").findOne().click(); sleep(3000)
    className("android.widget.LinearLayout").waitFor(); sleep(2000)
    // name = id("my_display_name").findOne().text();
    while (true) {
        if (text("我的信息").exists) {
            Tap(160, 350); break
        } else {
            sleep(2000)
        }

    }
    id("tv_item_title").className("android.widget.TextView").text("电话").findOne().parent().parent().click();
    var 电话 = id("tv_your_phone").findOne()
    zhanghao = 电话.text()
    log(zhanghao)
    var arr = zhanghao.split(":");
    a1 = arr[0]; a2 = arr[1]; log(a2)
    back(); sleep(1000); back(); sleep(1000); back(); sleep(1000);
    id("comm_head_xuexi_score").findOne().click();
    sleep(3000);
    a = className("android.view.View").text("积分规则").findOne().parent().child(1).text()
    log(a)
    b = a.replace("", "").replace("累积", "累积:").replace("积分", ":积分")
    log(b)
    var arr = b.split(":");
    jinri = arr[1]; log(jinri);
    ccc = open("/sdcard/38.txt");
    bbb = ccc.read()
    var pushplus_token = bbb; log(pushplus_token)
    log("执行完毕，正在生成推送内容");
    var account = a2; log(a2)
    if (pushplus_token == "ccc") {
        log("取消推送")
    } else {
        log("执行完毕，正在生成推送内容");
        var account = a2; log(a2)
        message = account + ",您的今日得分" + jinri + "分。"; log(message)
        http.postJson("http://www.pushplus.plus/send", {
            token: pushplus_token,
            title: "学习通知",
            content: message,
        });
    }
    sleep(1000); back();
    zongfen = id("comm_head_xuexi_score").findOne().text(); log(zongfen)
    text("我的").findOne().click(); sleep(2000)
    while (true) {
        if (text("我的信息").exists) {
            Tap(160, 350); break
        } else {
            sleep(2000)
        }

    }
    id("tv_item_title").className("android.widget.TextView").text("电话").findOne().parent().parent().click();
    var 电话 = id("tv_your_phone").findOne()
    zhanghao = 电话.text()
    log(zhanghao)
    var arr = zhanghao.split(":");
    a1 = arr[0]; a2 = arr[1]; log(a2)
    wj = open("/sdcard/文本.txt");
    du = wj.read()
    var device = du;
    var username = du;
    var password = du;

    var res = POST_request(
        "http://38.47.205.96:8081/CloudOnline/admins/login?=&username=" + username + "&password=" + password,
        {}
    );
    console.log(res);
    var token = (res['token'])
    var account = a2
    var num = jinri
    var status = 1
    var integral = zongfen
    cccc = open("/sdcard/37.txt");
    bbbb = cccc.read()
    var username = bbbb; log(username)


    var res = POST_request("http://38.47.205.96:8081/CloudOnline/user/update?token=" + token + "&username=" + username + "&account=" + account + "&num=" + num + "&status=" + status + "&integral=" + integral,
        {}
    );
    console.log(res);
    sleep(random(1000, 2000)); back(); sleep(random(1000, 2000)); back(); sleep(random(1000, 2000)); back()
    var [device_w, device_h] = init_wh();
    b = text("我的").findOne();
    log("mine:", b);
    b.click();
    log("等待设置按钮");
    if (e = id("my_setting").findOne(3000)) sleep(1000), log("点击设置按钮"), real_click(e);
    else {
        swipe(device_w / 2, .8 * device_h, device_w / 2, .1 * device_h, 1000);
        log("minebounds: " + b.bounds());
        sleep(6000);
        do e = random(b.bounds().centerX(), b.bounds().right), c = b.bounds().centerY(), log("点击设置按钮: " + e + "," + c), click(e, c); while (!id("setting_sign_out").findOne(1500))
    }
    log("等待退出登录");
    b = id("setting_sign_out").findOne();
    sleep(1E3);
    log("点击退出登录");
    real_click(b);
    text("确认").findOne().click();
}
// 悬浮信息
var w = floaty.window(
    <frame gravity="center" bg="#88ffccee">
        <text id="text">学习强国！</text>
    </frame>
);


var comments = [
    "爱迪生：天才是百分之一的勤奋加百分之九十九的汗水。",
    "查尔斯·史：一个人几乎可以在任何他怀有无限热忱的事情上成功。",
    "培根说过，深窥自己的心，而后发觉一切的奇迹在你自己。",
    "歌德曾经：流水在碰到底处时才会释放活力。",
    "莎士比亚：那脑袋里的智慧，就像打火石里的火花一样，不去打它是不肯出来的。",
    "戴尔·卡耐基：多数人都拥有自己不了解的能力和机会，都有可能做到未曾梦想的事情。",
    "白哲特：坚强的信念能赢得强者的心，并使他们变得更坚强。",
    "伏尔泰： 不经巨大的困难，不会有伟大的事业。",
    "富勒曾经： 苦难磨炼一些人，也毁灭另一些人。",
    "文森特·皮尔： 改变你的想法，你就改变了自己的世界。",
    "拿破仑·希尔： 不要等待，时机永远不会恰到好处。",
    "塞涅卡： 生命如同寓言，其价值不在与长短，而在与内容。",
    "奥普拉·温弗瑞： 你相信什么，你就成为什么样的人。",
    "吕凯特： 生命不可能有两次，但许多人连一次也不善于度过。",
    "莎士比亚： 人的一生是短的，但如果卑劣地过这一生，就太长了。",
    "笛卡儿： 我的努力求学没有得到别的好处，只不过是愈来愈发觉自己的无知。",
    "左拉： 生活的道路一旦选定，就要勇敢地走到底，决不回头。",
    "米歇潘： 生命是一条艰险的峡谷，只有勇敢的人才能通过。",
    "吉姆·罗恩： 要么你主宰生活，要么你被生活主宰。",
    "日本谚语： 不幸可能成为通向幸福的桥梁。",
    "海贝尔： 人生就是学校。在那里，与其说好的教师是幸福，不如说好的教师是不幸。",
    "杰纳勒尔·乔治·S·巴顿： 接受挑战，就可以享受胜利的喜悦。",
    "德谟克利特： 节制使快乐增加并使享受加强。",
    "裴斯泰洛齐： 今天应做的事没有做，明天再早也是耽误了。",
    "歌德： 决定一个人的一生，以及整个命运的，只是一瞬之间。",
    "卡耐基： 一个不注意小事情的人，永远不会成就大事业。",
    "卢梭： 浪费时间是一桩大罪过。",
    "康德： 既然我已经踏上这条道路，那么，任何东西都不应妨碍我沿着这条路走下去。",
    "克劳斯·莫瑟爵士： 教育需要花费钱，而无知也是一样。",
    "伏尔泰： 坚持意志伟大的事业需要始终不渝的精神。",
    "亚伯拉罕·林肯： 你活了多少岁不算什么，重要的是你是如何度过这些岁月的。",
    "韩非： 内外相应，言行相称。",
    "富兰克林： 你热爱生命吗？那么别浪费时间，因为时间是组成生命的材料。",
    "马尔顿： 坚强的信心，能使平凡的人做出惊人的事业。",
    "笛卡儿： 读一切好书，就是和许多高尚的人谈话。",
    "塞涅卡： 真正的人生，只有在经过艰难卓绝的斗争之后才能实现。",
    "易卜生： 伟大的事业，需要决心，能力，组织和责任感。",
    "歌德： 没有人事先了解自己到底有多大的力量，直到他试过以后才知道。",
    "达尔文： 敢于浪费哪怕一个钟头时间的人，说明他还不懂得珍惜生命的全部价值。",
    "佚名： 感激每一个新的挑战，因为它会锻造你的意志和品格。",
    "奥斯特洛夫斯基： 共同的事业，共同的斗争，可以使人们产生忍受一切的力量。　",
    "苏轼： 古之立大事者，不惟有超世之才，亦必有坚忍不拔之志。",
    "王阳明： 故立志者，为学之心也；为学者，立志之事也。",
    "歌德： 读一本好书，就如同和一个高尚的人在交谈。",
    "乌申斯基： 学习是劳动，是充满思想的劳动。",
    "别林斯基： 好的书籍是最贵重的珍宝。",
    "富兰克林： 读书是易事，思索是难事，但两者缺一，便全无用处。",
    "鲁巴金： 读书是在别人思想的帮助下，建立起自己的思想。",
    "培根： 合理安排时间，就等于节约时间。",
    "屠格涅夫： 你想成为幸福的人吗？但愿你首先学会吃得起苦。",
    "莎士比亚： 抛弃时间的人，时间也抛弃他。",
    "叔本华： 普通人只想到如何度过时间，有才能的人设法利用时间。",
    "博： 一次失败，只是证明我们成功的决心还够坚强。 维",
    "拉罗什夫科： 取得成就时坚持不懈，要比遭到失败时顽强不屈更重要。",
    "莎士比亚： 人的一生是短的，但如果卑劣地过这一生，就太长了。",
    "俾斯麦： 失败是坚忍的最后考验。",
    "池田大作： 不要回避苦恼和困难，挺起身来向它挑战，进而克服它。",
    "莎士比亚： 那脑袋里的智慧，就像打火石里的火花一样，不去打它是不肯出来的。",
    "希腊： 最困难的事情就是认识自己。",
    "黑塞： 有勇气承担命运这才是英雄好汉。",
    "非洲： 最灵繁的人也看不见自己的背脊。",
    "培根： 阅读使人充实，会谈使人敏捷，写作使人精确。",
    "斯宾诺莎： 最大的骄傲于最大的自卑都表示心灵的最软弱无力。",
    "西班牙： 自知之明是最难得的知识。",
    "塞内加： 勇气通往天堂，怯懦通往地狱。",
    "赫尔普斯： 有时候读书是一种巧妙地避开思考的方法。",
    "笛卡儿： 阅读一切好书如同和过去最杰出的人谈话。",
    "邓拓： 越是没有本领的就越加自命不凡。",
    "爱尔兰： 越是无能的人，越喜欢挑剔别人的错儿。",
    "老子： 知人者智，自知者明。胜人者有力，自胜者强。",
    "歌德： 意志坚强的人能把世界放在手中像泥块一样任意揉捏。",
    "迈克尔·F·斯特利： 最具挑战性的挑战莫过于提升自我。",
    "爱迪生： 失败也是我需要的，它和成功对我一样有价值。",
    "罗素·贝克： 一个人即使已登上顶峰，也仍要自强不息。",
    "马云： 最大的挑战和突破在于用人，而用人最大的突破在于信任人。",
    "雷锋： 自己活着，就是为了使别人过得更美好。",
    "布尔沃： 要掌握书，莫被书掌握；要为生而读，莫为读而生。",
    "培根： 要知道对好事的称颂过于夸大，也会招来人们的反感轻蔑和嫉妒。",
    "莫扎特： 谁和我一样用功，谁就会和我一样成功。",
    "马克思： 一切节省，归根到底都归结为时间的节省。",
    "莎士比亚： 意志命运往往背道而驰，决心到最后会全部推倒。",
    "卡莱尔： 过去一切时代的精华尽在书中。",
    "培根： 深窥自己的心，而后发觉一切的奇迹在你自己。",
    "罗曼·罗兰： 只有把抱怨环境的心情，化为上进的力量，才是成功的保证。",
    "孔子： 知之者不如好之者，好之者不如乐之者。",
    "达·芬奇： 大胆和坚定的决心能够抵得上武器的精良。",
    "叔本华： 意志是一个强壮的盲人，倚靠在明眼的跛子肩上。",
    "黑格尔： 只有永远躺在泥坑里的人，才不会再掉进坑里。",
    "普列姆昌德： 希望的灯一旦熄灭，生活刹那间变成了一片黑暗。",
    "维龙： 要成功不需要什么特别的才能，只要把你能做的小事做得好就行了。",
    "郭沫若： 形成天才的决定因素应该是勤奋。",
    "洛克： 学到很多东西的诀窍，就是一下子不要学很多。",
    "西班牙： 自己的鞋子，自己知道紧在哪里。",
    "拉罗什福科： 我们唯一不会改正的缺点是软弱。",
    "亚伯拉罕·林肯： 我这个人走得很慢，但是我从不后退。",
    "美华纳： 勿问成功的秘诀为何，且尽全力做你应该做的事吧。",
    "俾斯麦： 对于不屈不挠的人来说，没有失败这回事。",
    "阿卜·日·法拉兹： 学问是异常珍贵的东西，从任何源泉吸收都不可耻。",
    "白哲特： 坚强的信念能赢得强者的心，并使他们变得更坚强。 ",
    "查尔斯·史考伯： 一个人几乎可以在任何他怀有无限热忱的事情上成功。 ",
    "贝多芬： 卓越的人一大优点是：在不利与艰难的遭遇里百折不饶。",
    "莎士比亚： 本来无望的事，大胆尝试，往往能成功。",
    "卡耐基： 我们若已接受最坏的，就再没有什么损失。",
    "德国： 只有在人群中间，才能认识自己。",
    "史美尔斯： 书籍把我们引入最美好的社会，使我们认识各个时代的伟大智者。",
    "冯学峰： 当一个人用工作去迎接光明，光明很快就会来照耀着他。",
    "吉格·金克拉： 如果你能做梦，你就能实现它。"
];

// 设置左上角的提示内容
function setInfo(str) {
    console.log(str)
    ui.run(function () {
        w.text.setText(str);
    });
}
// 间歇性震动n秒
function vibrateSeconds(n) {
    if (n < 2.5) {
        n = 2.5;
    }
    for (var i = n / 2.5; i > 0; i--) {
        device.vibrate(500); // 震动0.5秒
        sleep(2000);
    }
}
// 进入"我的积分"
function enterMyScore(tryCount) {
    sleep(1000);
    id("comm_head_xuexi_score").findOne().click(); // 点击我的积分
    // 等待页面刷新
    if (text("登录").findOne(3000) != null) {
        sleep(1000);
        toast("success");
        scrollDown()
        sleep(2000);
    } else {
        if (tryCount <= 0) {
            vibrateSeconds(10); // 震动10秒提醒失败
            log("无法进入我的积分!");
            exit(); // 结束脚本
        } else {
            back();
            sleep(2000);
            enterMyScore(tryCount - 1);
        }
    }
}
// 长时间等待
function watchLongTime(timeInMinute, watchType) {
    if (timeInMinute < 1) {
        timeInMinute = 1;
    }
    for (var count = (timeInMinute - 1) * 6 + random(0, 6); count > 0; count--) {
        device.wakeUpIfNeeded()
        setInfo(watchType + "剩余" + (count * 10) + "秒");
        sleep(10 * 1000);
    }
}
// 查看提示，返回提示的字符串
function getTips() {
    // https://hyb1996.github.io/AutoJs-Docs/#/widgetsBasedAutomation?id=uiselectorfindone
    // findOne() 会阻塞直到找到控件，不会返回null
    var giveMeTips = text("查看提示").findOne();
    giveMeTips.click(); // 查看提示
    className("android.view.View").text("提示").waitFor(); // 等待提示出现
    var tips = className("android.view.View").text("提示").findOne(2000);
    var answer = tips.parent().parent().child(1).child(0); // 获取提示内容
    sleep(1000);
    back();
    sleep(1000);
    return answer.text();
}
// 选出正确答案，返回值为字符串数组，若找不到答案，则单选A
function getSelections(tips) {
    var answer = [];
    var dist = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (tips == null) {
        return ["A"];
    }
    // 选项值是否在提示中出现
    className("android.widget.ListView").findOne().children().forEach(
        (child, index) => {
            if (tips.indexOf(child.child(0).child(2).text()) != -1) {
                answer.push(dist[index]);
            }
        }
    );
    if (answer.length == 0) {
        setInfo("找不到答案！");
        return ["A"];
    }
    setInfo("选择" + answer);
    return answer;
}
// 检查填空长大于答案长度就全填1
function checkBlankAnswer(answer, blankParent) {
    setInfo("填空：" + answer);
    sleep(2000);
    var blankLength = blankParent.childCount() - 1;
    if (answer.length < blankLength) {
        setInfo("填空：" + answer + " 错误！");
        return "111111111111111111111111111111111111111"
    } else {
        return answer;
    }
}
// 填空题根据提示判断
function fillBlank(tips) {
    var blankParent = className("android.widget.EditText").findOne().parent();
    var answer = "";
    if (blankParent.parent().childCount() == 3) {
        // 如果待填空的项在题干中间
        var fragment0 = blankParent.parent().child(0).text(); // 空格前的文字
        var fragment2 = blankParent.parent().child(2).text(); // 空格后的文字
        var fragment0_last4 = fragment0.substring(fragment0.length - 4); // 空格前4字
        var fragment2_head4 = fragment2.substring(0, 4); // 空格后4字
        var index = tips.indexOf(fragment0_last4) + fragment0_last4.length; // 用空格前4字在提示中的位置，找答案可能的位置
        if (fragment0.length + fragment2.length < tips.length) {
            // 提示长度大于问题长度
            if (fragment2_head4.length == 1) {
                // 如果空格后是一个句号，则有几个空格就取几个字作为答案
                answer = tips.substring(index, index + blankParent.childCount() - 1);
            } else {
                // 如果空格后是正常的字，根据空格前后4个字的位置取答案
                answer = tips.substring(index, tips.indexOf(fragment2_head4));
            }
        } else {
            // 提示长度小于问题长度，取空格前4字在提示中的位置之后的所有字
            answer = tips.substring(index, tips.length);
        }
        answer = checkBlankAnswer(answer, blankParent);
    } else if (blankParent.parent().childCount() == 2) {
        // 如果待填空在开头（其实我没遇到这种题）
        var fragment = blankParent.parent().child(1).text();
        var index = tips.indexOf(fragment.substring(0, 4));
        if (index > 0) {
            answer = tips.substring(index - blankParent.childCount() - 1, index);
            answer = checkBlankAnswer(answer, blankParent);
        } else {
            setInfo("无答案");
            answer = "111111111111111111111111111111111111111";
        }
    } else {
        setInfo("未知题目种类");
        answer = "111111111111111111111111111111111111111";
    }
    setText(answer);
}
// 回答问题，questionsNum为问题数，每日答题为5.专项为10(或者修正后的5)
function answerQuestions(questionsNum) {
    sleep(1000);
    for (var i = 0; i < questionsNum; i++) {
        text("查看提示").waitFor(); // 阻塞直到页面刷新
        if (textContains("填空题").exists()) {
            sleep(1000);
            var tips = getTips();
            fillBlank(tips);
        } else if (textContains("单选题").exists() || textContains("多选题").exists()) {
            sleep(1000);
            var tips = getTips();
            answer = getSelections(tips);
            answer.forEach(
                item => {
                    sleep(random(50, 100) * 10);
                    className("android.view.View").textStartsWith(item).findOne().click();
                }
            )
        } else {
            setInfo("未知题型")
        }

        sleep(random(50, 100) * 10);
        click("确定")
        sleep(random(100, 200) * 10);
        var hasNext = className("android.view.View").text("下一题").exists();
        if (hasNext) {
            className("android.view.View").text("下一题").findOne().click();
            sleep(random(100, 200) * 10);
        }
        if (className("android.view.View").text("完成").exists()) {Swipe(500, 1600, 500, 600, 1000);
            className("android.view.View").text("完成").findOne().click();
            sleep(random(300, 500) * 10);
        }
        if (!hasNext) {
            if (dealWithAccessError()) {
                if (textStartsWith("积分").findOne(3000) == null) {
                    vibrateSeconds(10);
                    alert("请手动处理“访问异常”，然后可以尝试重新执行本脚本");
                    throw "fail to deal with '访问异常'" // 抛异常
                }
            }
        }
    }
}
// 处理访问异常
function dealWithAccessError() {
    sleep(random(2000, 3000));
    if (className("android.view.View").text("访问异常").exists()) {
        setInfo("处理“访问异常”...")
        var b = className("android.view.View").depth(9).findOne().bounds();
       Swipe(b.left + random(20, 80),          // x1
            b.centerY() + random(-30, 30),      // y1
            b.right + random(-30, 30),          // x2
            b.centerY() + random(-20, 20),      // y2
            random(3100, 3500));                // duration
        sleep(random(300, 500) * 10);
        return true
    }
    return false
}
// 进行专项中没做的答题
function answerListQuestions(questionsNum, flag) {
    sleep(random(100, 200) * 10);
    var toDoList = text(flag).find();   // 找到包含flag的列表
    var noMoreQuestion = false;         // noMoreQuestion 为 true 时，没有题做了
    var endFlag = null;                 // endFlag 不为空则说明已经找到头了

    // 答题列表为空时，循环找到待答题列表
    while (toDoList.empty()) {
        // 找到头/只检查一次专项答题 时结束检查
        if (endFlag != null ||
            (questionsNum == 10 && isCheckSpecialQuestionsOnce)) {
            noMoreQuestion = true;
            sleep(random(50, 100) * 10);
            back();
            break;
        }
       
        sleep(random(500, 1000));
        endFlag = text("您已经看到了我的底线").findOne(1000);
        toDoList = text(flag).find();
    }
    if (!noMoreQuestion) { // 如果存在未做的题
        toDoList[toDoList.size() - 1].click();
        sleep(random(2000, 3000));
        // 如果是专项答题，修正真实的题目数量
        if (questionsNum == 10 && className("android.view.View").text("1 /5").exists()) {
            questionsNum = 5
        }
        answerQuestions(questionsNum);
        sleep(random(100, 200) * 10);
        back(); // 返回答题列表
        sleep(random(100, 200) * 10);
        back(); // 返回积分列表
    }
}
// 获取当前分数
function getCurrentScore() {
    scrollUp()
    sleep(500)
    var scoreTodayText = className("android.view.View").textStartsWith("今日已累积").findOne().text();
    var score = scoreTodayText.replace(/[^\d.]/g, "")
    setInfo("当前积分:" + score)
    sleep(500)
    scrollDown()
    sleep(500)
    return score
}
// 两个字符串简易相似度（不考虑语序问题）
function simpleSimilarity(a, b) {
    if (typeof a != "string" || typeof b != "string" || a.length == 0 || b.length == 0) {
        return 0
    }
    a = a.replace(/[\s ]/g, "").split("").sort();
    b = b.replace(/[\s ]/g, "").split("").sort();
    var sum = a.length > b.length ? a.length : b.length;
    var count = 0;
    var x = a.shift(), y = b.shift();
    while (x != null && y != null) {
        if (x == y) {
            count++;
            x = a.shift();
            y = b.shift();
        } else if (x < y) {
            x = a.shift();
        } else {
            y = b.shift();
        }
    }
    return count / sum
}
// 从问题中分割出连续的语句作为关键词
function getKeywords(question) {
    var splitters = ["，", "。", "（", "）", "？", "、", " ", "　", "共产党"]; // www.syiban.com 的搜索不支持以上几种符号以及屏蔽了某些关键词
    question = question.replace(" ", "，").replace(/ /g, "") // 删除 u+00a0 空格, 该空格被作为答案占位符使用
    question = question.replace(/来源：.*$/g, "") // 删除来源
    var keywords = [question];
    for (splitter of splitters) { // 把问题循环放入上述分隔符进行分割
        console.log("getKeywords:\nsplitter:", splitter, "\nkeywords:", keywords)
        var l = keywords.length
        for (var i = 0; i < l; i++) {
            if (keywords[i].includes(splitter)) {
                var tmp = keywords[i].split(splitter)
                keywords.splice(i, 1)
                i--
                l--
                // 不考虑会有连续的空字符串，因为正常语句中不会连续出现两个待分割的字符，因此只需要去除最开始的空字符串或者最后的空字符串
                if (tmp[0].length == 0) {
                    tmp.splice(0, 1)
                }
                if (tmp[tmp.length - 1].length == 0) {
                    tmp.splice(tmp.length - 1, 1)
                }
                keywords = keywords.concat(tmp)
            }
        }
    }
    // 对结果按照字符串长度排序
    keywords.sort(function (a, b) { if (a.length > b.length) return -1; return 1; })
    console.log("getKeywords return:", keywords)
    return keywords
}
// 网络请求回答问题
function httpAnswer(question, keyword, selections) {
    var res = null, html = "";
    for (var i = 0; i < 5; i++) { // 网络请求最多尝试5次
        sleep(random(1000, 2000))
        res = http.get("http://www.syiban.com/search/index/init.html?modelid=1&q=" + keyword)
        if (res.statusCode == 200) { // 如果成功查询
            html = res.body.string()
            break
        }
    }
    if (res.statusCode != 200 || !html.includes("title_color")) { // 如果查询失败或者查询的结果没有相关的关键词则返回失败
        return 0
    }
    // qnas: 搜索出来的问题和答案, qs: 搜索到的问题, as: 搜索到的答案, al: 可选答案列表, sl: 可选答案对应的选项结果
    var qnas = null, qs = [], as = [], al = [], sl = [];
    // <div class="yzm-news"><div class="yzm-news-right"> <!-- 内容属性 --><a href="http://www.syiban.com/?search" target="_blank"><span class="title_color">“湖上春来似画图，乱峰围绕水平铺。”出自唐代诗人<span style="color:red;">白居易</span>的《春题湖上》。诗中描写的湖是____。</span></a><p><span style="font-size: 16px; color: #0000FF;">答案：B、西湖</span></p></div></div>
    qnas = html.replace(/\s/g, "").match(/title_color.*?\/p>/g) // 正则表达式先去除换行符以及空白符，然后匹配出问题答案列表
    console.log("搜索出来的问题和答案:", qnas)
    for (var i = 0; i < qnas.length; i++) {
        var j = qnas[i].match(/title_color.*?<\/a>/) // 切割出问题
        if (j == null) {
            qs.push("")
        } else {
            qs.push(j[0])
        }
        var k = qnas[i].match(/答案：.*?<\/span>/) // 切割出对应的答案
        if (k == null) {
            as.push("")
        } else {
            if (k[0].includes("不对") || k[0].includes("错")) { // 如果是判断题就补充对应的另外的表达方式
                as.push(k[0] + "错误")
            } else if (k[0].includes("对")) {
                as.push(k[0] + "正确")
            } else {
                as.push(k[0])
            }
        }
    }
    for (var i = 0; i < as.length; i++) { // 遍历网络查询的答案列表，看看当前的选项是否在这些答案中，如果在的话就列入待选
        for (var j = 0; j < selections.length; j++) {
            if (as[i].includes(selections[j].parent().child(1).text())) {
                al.push(i)
                sl.push(j)
            }
        }
    }
    console.log("搜索到的问题:", qs, "\n搜索到的答案:", as, "\n可选答案列表:", al, "\n可选答案对应的选项结果:", sl)
    // 不存在答案，无法选择
    if (al.length == 0) {
        return 0
    }
    var maxIndex = 0;
    // 如果存在答案，判断该答案对应的题目与本题的文本相似度，取最高的作为答案
    // 这么做是因为可能搜出了相似的题目包含了待选的结果（其实概率不是很大），但是题目毕竟不一样，因此通过这个额外的方法做判断
    for (var i = 0; i < al.length; i++) {
        al[i] = simpleSimilarity(question, qs[al[i]])
        if (al[i] > al[maxIndex]) {
            maxIndex = i
        }
    }
    setInfo("待选：" + sl.toString() + " 选择：" + sl[maxIndex])
    console.log("题目相似度:", al, "\n选项坐标:", maxIndex)
    // 选择最高相似度的选项
    selections[sl[maxIndex]].click()
    return 1
}
// 回答挑战答题，enough表示分数是否已经足够
function answerChallengeQuestion(enough) {
    var question = className("android.view.View").depth(25).findOne(1500).text(); // 获取挑战答题题目
    var selections = className("android.widget.RadioButton").find() // 获取挑战答题选项
    sleep(random(1500, 2500))
    if (enough) { // 如果分数足够，默认选第一个
        setInfo("分数足够，选择第一个选项")
        selections[0].click()
        return
    }
    console.log("question:", question)
    for (var i = 0; i < selections.length; i++) {
        console.log("selection", i, "：", selections[i].parent().child(1).text())
    }
    var keywords = []
    if (question.includes("词形") || question.includes("读音")) { // 如果是判断字形或者读音的题目，直接把选项当作关键词
        for (var i = 0; i < selections.length; i++) {
            keywords.push(selections[i].parent().child(1).text())
        }
    } else { // 否则从题目里分割关键词
        keywords = getKeywords(question)
    }
    setInfo("关键词: " + keywords.toString())
    console.log("keywords:", keywords)
    for (var i = 0; i < keywords.length && i < 5 && keywords[i].length > 1; i++) { // 关键词只选前5个且长度大于1的关键词
        var keyword = keywords[i]
        if (keyword.length > 10) { // 关键词太长则剪裁关键词
            keyword = keyword.substring(0, 10)
        }
        if (httpAnswer(question, keyword, selections)) { // 回答问题
            sleep(random(1500, 2500))
            return
        }
        sleep(random(1500, 2500))
    }
    setInfo("网络查询失败，尝试第一个答案")
    selections[0].click()
}
// 挑战答题
function answerChallenge() {
    var challengeQuestions = className("android.view.View").text("趣味答题").findOne();
    if ("去看看" == challengeQuestions.parent().child(4).text()) { // 挑战答题还没拿满分
        challengeQuestions.parent().child(4).click(); // 进入挑战答题
        sleep(5000);
        if (textContains("科普知识").exists()) {
            click("科普知识");
            sleep(5000);
        }
        if (className("android.view.View").depth(24).findOne(1000) == null) { // 如果网络不是很好刷不开挑战答题的界面
            if (id("button1").exists()) { // 如果自动弹窗提示了
                id("button1").click(); // 点击返回
                sleep(1000);
            } else {
                back(); // 主动返回
                sleep(1000);
                text("退出").click(); // 提示是否要退出，点击确认退出
                sleep(1000);
                if (textContains("科普知识").exists()) {
                    back();
                }
            }
            answerChallenge() // 重新进行挑战答题
            return
        }
        // countCorrect: 本次挑战答题正确数, countTry: 第几次进行挑战答题
        var countCorrect = 0, countTry = 0;
        while (true) {
            var enough = false
            if (countCorrect >= 3) { // 正确超过5题就足够了
                enough = true
            }
            answerChallengeQuestion(enough) // 回答问题
            sleep(random(2000, 3000))
            if (text("结束本局").exists()) { // 如果答错了
                if (enough) { // 如果分数足够，就结束返回积分页
                    text("结束本局").click()
                    sleep(random(1000, 2000))
                    back()
                    break
                }
                sleep(random(1000, 2000))
                text("立即复活").findOne().click() // 如果还不够5题则复活一次，然后继续答题
                sleep(random(2000, 3000))
            } else if (text("再来一局").exists()) { // 如果是第二次答错
                if (enough) { // 分数足够就退出
                    back()
                    break
                }
                if (countTry >= maxTryChallenge) { // 分数不足并且已经超过了最大尝试次数，则提示答题失败了，结束答题
                    toast("超过最大尝试次数，挑战答题失败")
                    setInfo("超过最大尝试次数，挑战答题失败")
                    return
                }
                countTry++ // 否则计数器加一，然后再来一局
                text("再来一局").click()
                countCorrect = 0
                sleep(random(1000, 2000))
            } else { // 回答正确，答题数+1
                countCorrect++
            }
            sleep(random(1000, 2000))
        }
    }
    sleep(1000);
    if (textContains("科普知识").exists()) {
        back();
    }
    setInfo("挑战答题已完成");
    sleep(random(1000, 2000));
}



//文章
function wenzhang() {
    sleep(random(1000, 2000));
    var wz = className("android.view.View").text("我要选读文章").findOne();
    if ("去看看" == wz.parent().child(4).text()) { // 文章还没完成
        wz.parent().child(4).click(); // 进入文章阅读
        startwenzhang()
    }
    setInfo("文章已完成");
    sleep(random(1000, 2000));
}
//开始文章
function startwenzhang() {
    var xx = id("home_bottom_tab_text_highlight").className("android.widget.TextView").text("工作").findOne().bounds() // 获取学习的位置（即底部栏中间的按钮）
    click(xx.centerX(), xx.centerY()); // 点击学习
    sleep(2000);
    className("android.widget.FrameLayout").clickable(true).depth(15).find()[2].click(); // 展开全部频道
    sleep(2000);
    click(city); // 点击本地
    sleep(1500);
    banner = classNameContains("RecyclerView").findOne();
    //log(banner);        
    sleep(1000);
    log("查找北京学习平台，尝试点击");
    first_obj = banner.findOne(text("北京学习平台"));
    //   while (!text("北京学习平台").findOne().parent().click()) {log("click: false");}
    //   log("click: true");
    //   real_click(text("北京学习平台").findOne().parent());
    real_click(first_obj.parent());
    log("等待加载");
    sleep(1000);
    text("新思想扎根京华").waitFor();
    sleep(2000);
    back()
    var xxpt = textEndsWith('学习平台').findOne(5000); // 等待页面刷新
    // 没找到说明可能没刷新出来
    id("tv_search_marquee").findOne().click()
    sleep(2000); setText(0, "唐诗三百首"); sleep(2000)
    click("");
    className("android.view.View").text("唐诗三百首·五言绝句 电台-听文化-听诗文 ").findOne().click(); sleep(3000); click("全部播放"); back(); sleep(11500)
    back(); sleep(2000); back(); sleep(2000); back(); sleep(2000); back(); sleep(2000); back(); sleep(2000); back(); sleep(2000);
    app.launchApp("学习强国");
    sleep(7000);
    setInfo('开始学习文章');
    className("android.widget.FrameLayout").clickable(true).depth(15).find()[2].click(); // 展开全部频道
    sleep(3000);
    click("旅游"); // 点击本地
    sleep(3000);
    text("旅游头条").waitFor();
    sleep(3000);
    Swipe(500, 1600, 500, 600, 1000); sleep(1000); Swipe(500, 1600, 500, 600, 1000); sleep(1000); sleep(1000); Swipe(500, 1600, 500, 600, 1000)
    var lastReadedArticleTitle = "" // 上次阅读的文章标题
    var top = device.height / 10 * 2, bottom = device.height / 10 * 9; // 默认的可视范围，如果下面的 view 没有正确识别出来，就使用该默认值，因此可能需要修改（通常情况下不需要修改）
    var view = className("android.widget.FrameLayout").depth(14).findOne(500) // 文章列表的容器的范围
    if (view != null) {
        top = view.bounds().top + 10 // 列表页的上界+10
        bottom = id("home_bottom_tab_button_ding").findOne().bounds().top - 10 //百灵的上界-10
        console.log("main view top:", (top - 10), "bottom:", (bottom + 10))
    }
    console.log("set bounds: top:", top, "bottom:", bottom, "\n")
    for (var i = 0; i < articleNum; i++) {
        setInfo('正在阅读第' + (i + 1) + '篇文章');
        sleep(2000);

        sleep(3000);
        var articles = className("android.widget.TextView").depth(25).find(); // 只看这种标题深度为25的文章，深度为24的文章可能有视频，不计入文章阅读
        // 如果没找到文章，或者找到的最后一篇文章是上一篇，又或者找到的文章不在可视范围内，就重新再找新的
        if (articles.empty() ||
            articles[articles.length - 1].text() == lastReadedArticleTitle ||
            articles[articles.length - 1].text() == "加载中" ||
            articles[articles.length - 1].bounds().top < top ||
            articles[articles.length - 1].bounds().top > bottom ||
            articles[articles.length - 1].bounds().centerX() < 0) {
            i--;
            setInfo('无符合要求的文章，继续找');
            sleep(1000);
            Swipe(500, 1600, 500, 600, 1000)
            continue;
        }
        var nextArticle = articles[articles.length - 1]
        lastReadedArticleTitle = nextArticle.text()
        console.log("nextArticle:", lastReadedArticleTitle, "\nbounds:", nextArticle.bounds(), "\n")
        click(lastReadedArticleTitle, 0)
        sleep(10 * 1000); // 等待10秒
        if (!text("欢迎发表你的观点").exists() ||
            className("android.widget.SeekBar").exists()) { // 如果无法评论或者顶部有视频，则跳过
            i--;
            back();
            continue;
        }
        if (i < articleCommentNum) {
            className("android.widget.TextView").text("欢迎发表你的观点").findOne().click() // 点开评论
            sleep(3000);
            setText(comments[random(0, comments.length - 1)]); // 随机评论
            sleep(3000);
            click("发布"); // 点击发布
            sleep(random(20, 50) * 100); // 继续等待5~10秒
            text("删除").findOne().click();
            sleep(1000);
            text("确认").findOne().click();
            sleep(random(20, 50) * 100)
        } else if (i != articleNum - 1) {
            sleep(random(50, 100) * 100); // 其他文章一共阅读15~20秒
        } else {
            watchLongTime(articleTimeInMinute, "文章"); // 最后一篇文章阅读久一点
        }
        setInfo("第" + (i + 1) + "篇文章阅读完成");
        back(); // 返回学习强国首页
        sleep(3000);
    }
}

// 开始四人赛
function startFoursomeCompetition() {
    text("开始比赛").waitFor() // 等待界面刷新
    sleep(random(2000, 3000))
    text("开始比赛").findOne().click() // 开始比赛
    dealWithAccessError();
    className("android.view.View").text("100").waitFor() // 等待比赛界面刷新
    while (true) {
        if (className("android.widget.RadioButton").findOne(5000) != null) { // 等待选项出现，如果选项出现了说明还没结束
            sleep(random(2200, 2700))
            try {
                var selections = className("android.widget.RadioButton").find()
                selections[random(0, selections.length - 1)].click() // 随机选择一个选项
            } catch (e) {
                if (!e.toString().includes('method "click" of undefined')) { // 可能出现挑战结束了，但是脚本还是读出了选项并进行了选择，此时会报错，因此需要排除这个错
                    throw e
                }
            }
        }
        // 是否结束
        if (text("继续挑战").exists()) { 
            sleep(random(2000, 3000))
            back()
            sleep(random(2000, 3000))
            back()
            sleep(random(2000, 3000))
            return
        }
    }
}
// 四人赛
function foursomeCompetition() {
    sleep(random(1000, 2000));
    var foursome = className("android.view.View").text("趣味答题").findOne();
    if ("去看看" == foursome.parent().child(4).text()) { // 四人赛还没完成
        foursome.parent().child(4).click(); // 进入四人赛
        startFoursomeCompetition()
    }
    setInfo("四人赛已完成");
    sleep(random(1000, 2000));
}
// 开始双人对战
function startPvP() {
    text("随机匹配").waitFor();
    sleep(1000);
    let match = text("随机匹配").findOne().parent().child(0);
    real_click(match)
    sleep(random(5000, 7000)); // 等待随机匹配
    while (true) {
        if (className("android.widget.RadioButton").findOne(5000) != null) { // 等待选项出现，如果选项出现了说明还没结束
            sleep(random(2200, 2700))
            try {
                var selections = className("android.widget.RadioButton").find()
                selections[random(0, selections.length - 1)].click() // 随机选择一个选项
            } catch (e) {
                if (!e.toString().includes('method "click" of undefined')) { // 可能出现挑战结束了，但是脚本还是读出了选项并进行了选择，此时会报错，因此需要排除这个错
                    throw e
                }
            }
        }
        // 是否结束
            if (text("继续挑战").exists()) {
                sleep(1000);
                let tz_click = text("继续挑战").findOne().click();
                log("点击继续挑战:" + tz_click);
                sleep(1500);
                back();
                var exit_click = text("退出").findOne().click();
                log("点击退出:" + exit_click);
                sleep(1000);
                return
        }
    }
}
// 双人对战
function pvp() {
    sleep(random(1000, 2000));
    var vs = className("android.view.View").text("趣味答题").findOne();
    if ("去看看" == vs.parent().child(4).text()) { // 双人对战还没完成
        vs.parent().child(4).click(); // 进入双人对战
        startPvP()
    }
    setInfo("双人对战已完成");
    sleep(random(1000, 2000));
}
// 获取订阅分数
function subscribe() {
    var leftToSub = 2;  // 剩余订阅数
    var sub = className("android.view.View").text("订阅").findOne();
    sub.parent().child(4).click(); // 进入订阅
    sleep(1000);
    var curBar = className("android.view.View").text("地方媒体").findOne(); // 从地方媒体开始找订阅
    // 点击侧边栏
    if (curBar.click()) {
        // 只找一次可订阅列表，可能找不齐
        sleep(1000);
        var imageViewList = className("android.widget.ImageView").clickable(true).depth(15).find();
        // 找出可订阅项目，+2是因为一个是图片，一个是+号，都代表同一个订阅
        for (var i = 0; i < imageViewList.length; i += 2) {
            imageViewList.get(i).click() // 点击图片进入订阅详情
            sleep(1000);
            var status = className("android.widget.TextView").text("订阅").findOne(1500); // 是否已订阅
            if (status != null) { // 未订阅
                sleep(1000);
                click(status.bounds().centerX(), status.bounds().centerY()); // 订阅
                leftToSub--;  // 剩余订阅数
                sleep(1000);
            }
            back(); // 返回订阅列表
            sleep(1000);
            if (leftToSub == 0) {
                back(); // 返回积分列表
                sleep(1000);
                return 0
            }
        }
    }
    back(); // 返回积分列表
    sleep(1000);
    return leftToSub
}
function main(userinfo) {
    setInterval(function () {


        if (id("btn_next").exists() == false) {
            log(id("btn_next").exists())
            log("已登录")
            exit_app("学习强国");
            sleep(1500);
            app.launchApp('学习强国');
            sleep(7000);
            if (text("我的").exists) {
                var [device_w, device_h] = init_wh();
                b = text("我的").findOne();
                log("mine:", b);
                b.click();
                log("等待设置按钮");
                if (e = id("my_setting").findOne(3000)) sleep(1000), log("点击设置按钮"), real_click(e);
                else {
                    swipe(device_w / 2, .8 * device_h, device_w / 2, .1 * device_h, 1000);
                    log("minebounds: " + b.bounds());
                    sleep(6000);
                    do e = random(b.bounds().centerX(), b.bounds().right), c = b.bounds().centerY(), log("点击设置按钮: " + e + "," + c), click(e, c); while (!id("setting_sign_out").findOne(1500))
                }
                log("等待退出登录");
                b = id("setting_sign_out").findOne();
                sleep(1E3);
                log("点击退出登录");
                real_click(b);
                text("确认").findOne().click();
            } else {
                sleep(1000)
            }


        }
            
        else {
            log("未登录")
            function POST_request(url, params) {
                try {
                    var res, sbody, obady;
                    try {
                        res = http.post(url, params);
                        sbody = res.body.string();
                        obady = JSON.parse(sbody);
                    } catch (e) {
                        sbody = null;
                    }

                    return obady;
                } catch (err) {
                    return false;
                }
            }
            wj = open("/sdcard/文本.txt");
            du = wj.read()
            var device = du;
            var username = du;
            var password = du;

            var res = POST_request(
                "http://38.47.205.96:8081/CloudOnline/admins/login?=&username=" + username + "&password=" + password,
                {}
            );
            console.log(res);
            var token = (res['token'])
            var res = POST_request(
                "http://38.47.205.96:8081/CloudOnline/users/cloudGet?=&device=" + device + "&token=" + token,
                {}
            );
            console.log(res);
            if (res) {
                console.log("成功");
                message = (res['message'])
                if (message == "取号成功") {
                    pushplus_token = (res.data.token); log(pushplus_token); log("推送token"); toast(pushplus_token)
                    if (pushplus_token == null) {
                        a = ""
                        files.write("/sdcard/38.txt", a, encoding = "utf-8")
                    } else {
                        a = pushplus_token
                        files.write("/sdcard/38.txt", a, encoding = "utf-8")
                    }
                    username = (res.data.username); log(username); files.write("/sdcard/37.txt", username, encoding = "utf-8")
                    a = (res.data.account); setText(0, a); sleep(1E3)
                    b = (res.data.password); setText(1, b); sleep(1E3); id("btn_next").findOne().click(); sleep(20E3)
                    if (textContains("我的").exists()) {
                        var retry_time; var watchdog = 1000
                        if (!Number(watchdog)) {
                            retry_time = 5400;
                        } else if (Number(watchdog) < 900) {
                            log("建议重试延迟不要低于900s即15分钟，已设为1800s");
                            retry_time = 1800;
                        } else {
                            retry_time = Number(watchdog)
                        }
                        for (let i = 0; i < 1; i++) {
                            log("开始第" + (i + 1) + "轮，最长运行时间为" + retry_time + "s");
                            let xxqg_begin = new Date();
                            var main_thread = threads.start(function () {
                                xxqg();
                            })
                            main_thread.join(retry_time * 1000);
                            if (main_thread.isAlive()) {
                                main_thread.interrupt();
                                log("运行超时，重试");
                                exit_app("学习强国");
                                sleep(1500);
                                app.launchApp('学习强国');
                                sleep(2000);
                                sc()
                            } else {
                                let xxqg_end = new Date();
                                let spent_time = ((xxqg_end - xxqg_begin) / 1000).toFixed();
                                log("本轮已结束，花费时间" + spent_time + "s"), 600 > spent_time && log("时间过短，请检查日志是报错导致脚本结束，正常结束请无视");
                                return true
                            }
                        }
                    } else if (id("message").exists()) {
                        if (textContains("号码或密码错误，请重新输入").exists()) {
                            //上传密码错误
                            wj = open("/sdcard/文本.txt");
                            du = wj.read()
                            var username = du;
                            var password = du;
                            var res = POST_request(
                                "http://38.47.205.96:8081/CloudOnline/admins/login?=&username=" + username + "&password=" + password,
                                {}
                            );
                            console.log(res);
                            var token = (res['token'])
                            var account = a
                            var num = 0
                            var status = 0
                            var integral = 0
                            cccc = open("/sdcard/37.txt");
                            bbbb = cccc.read()
                            var username = bbbb; log(username)
                            wj = open("/sdcard/文本.txt");


                            var res = POST_request("http://38.47.205.96:8081/CloudOnline/user/update?token=" + token + "&username=" + username + "&account=" + account + "&num=" + num + "&status=" + status + "&integral=" + integral,
                                {}
                            );
                            console.log(res);
                            back()
                        } else {
                            sleep(2000)
                        }
                    } else {
                        if (textContains("你在新的设备登录学习强国，为了保障你的账户安全，需要使用短信验证码确认").exists()) {
                            //上传需验证
                            wj = open("/sdcard/文本.txt");
                            du = wj.read()
                            var username = du;
                            var password = du;
                            var res = POST_request(
                                "http://38.47.205.96:8081/CloudOnline/admins/login?=&username=" + username + "&password=" + password,
                                {}
                            );
                            console.log(res);
                            var token = (res['token'])
                            var account = a
                            var num = 0
                            var status = 0
                            var integral = 0
                            cccc = open("/sdcard/37.txt");
                            bbbb = cccc.read()
                            var username = bbbb; log(username)
                            wj = open("/sdcard/文本.txt");


                            var res = POST_request("http://38.47.205.96:8081/CloudOnline/user/update?token=" + token + "&username=" + username + "&account=" + account + "&num=" + num + "&status=" + status + "&integral=" + integral,
                                {}
                            );
                            console.log(res);
                            back()
                        } else {
                            sleep(2000); back()
                        }
                    }
                } else {
                    sleep(60E3)
                }



            } else {
                console.log("错误"); toast("睡眠5秒")
                sleep(5000);
            }
        }

    }, 20000);
}
main()

function restart(myEngine) {

    let survive_state = engines.all().find((item) => {

        return item.getSource().toString() == myEngine
    })
    if (survive_state == null) {
        engines.execScriptFile(myEngine, {
            path: engines.myEngine().cwd()
        })
        engines.myEngine().forceStop()
    }
    sleep(60 * 1000)
    survive_state = null
    restart(myEngine)

}
function exec(action, args) {
    args = args || {};
    engines.execScript(action.name, action.name + "(" + JSON.stringify(args) + ");\n" + action.toString());
}
exec(restart, engines.myEngine().getSource().toString());

function real_click(obj) {
    for (let i = 1; i <= 3; i++) {
        if (obj.click()) {
            log("real click: true");
            return true;
        }
        sleep(300);
    }
    console.warn("控件无法正常点击：", obj);
    log("尝试再次点击");
    click(obj.bounds().centerX(), obj.bounds().centerY());
    return false;
}

function init_wh() {
    log("屏幕方向检测");
    log(device.width + "*" + device.height);
    var device_w = depth(0).findOne().bounds().width();
    var device_h = depth(0).findOne().bounds().height();
    log(device_w + "*" + device_h);
    if (device.width == device_h && device.height == device_w) {
        log("设备屏幕方向检测为横向，后续运行很可能会报错，建议调整后重新运行脚本");
        sleep(10000);
    } else if (device.width == 0 || device.height == 0) {
        log("识别不出设备宽高，建议重启强国助手后重新运行脚本");
        sleep(10000);
    }
    return [device_w, device_h]
}
