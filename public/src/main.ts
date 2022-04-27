// Hello TypeScript

/**
 * returns random int. min <= return <= max
 * @param min minimum value
 * @param max max value
 * @returns min to max random int
 */
const getRandomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * round numbers to n decimal places
 * @param value any number
 * @param n digit default -> 0
 * @returns number rounded to n decimal places
 */
const orgRound = (value: number, n: number = 0): number => {
    return Math.round(value * (10 ** n)) / (10 ** n);
}

/**
 * array shuffle
 * @param arr any array
 * @returns shuffled array
 */
const shuffle = (arr: any[]): any[] => {
    for (let i = arr.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * two array equal?
 * @param a any array
 * @param b any array
 * @returns a === b ? true : false
 */
const array_equal = (a: any[], b: any[]): boolean => {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}

/**
 * @param ans answer
 * @param min minimum value
 * @param max max value
 * @param arr already exists options. default -> []
 * @param evenOdd true -> match even odd numbers with answer. default -> false
 * @returns returns is not equal answer and not in arr
 */
const fake = (ans: number, min: number, max: number, arr: number[] = [], evenOdd: boolean = false): number => {
    let res: number;
    if ((max - min < arr.length) || (evenOdd && Math.ceil((max - min) / 2) <= arr.length)) { // 最小値から最大値まで全てを使い切っている場合の無限ループ回避
        return 0;
    }
    while (true) {
        res = getRandomInt(min, max);
        if (evenOdd && res % 2 !== ans % 2) {
            continue;
        }
        let endFlag = true;
        arr.forEach(element => {
            if (element === res) {
                endFlag = false;
            }
        });
        if (res === ans) {
            endFlag = false;
        }
        if (endFlag) {
            break;
        }
    }
    return res;
}

/**
 * ;
 * @param arr length 1 or more array
 * @returns radio
 */
const optHtmlCreate = (arr: number[]): string => {
    if (arr.length < 1) {
        console.log("error");
        return "";
    }
    let res = `<label><input type="radio" name="ans" class="ans" value="${arr[0]}" checked>${arr[0]}</label>`;
    for (let i = 1; i < arr.length; i++) {
        res += `<label><input type="radio" name="ans" class="ans" value="${arr[i]}">${arr[i]}</label>`
        if (i === Math.round(arr.length / 2) - 1) {
            res += "<br>"
        }
    }
    res += `<br><button id="next">解答・解説へ</button>`;
    return res;
}

// const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * time counts until over time limit or id="next" element is clicked
 * @param s time limit. by seconds
 */
const timeCount = (s: number) => new Promise<void>((resolve) => {
    const timer = setInterval(() => {
        s--;
        $("#time").html(`<p>残り${s}秒</p>`);
        if (s == 0) {
            clearInterval(timer);
            resolve();
        }
    }, 1000);

    $("#next").on("click", () => {
        clearInterval(timer);
        resolve();
    });
});

/**
 * stop until id="next" element is clicked
 */
const pause = () => new Promise<void>((resolve) => {
    $("#next").on("click", () => {
        resolve();
    });
});

const result = (userAns: number, dic: dict, diff: diffList, type: questions) => new Promise<boolean>((resolve) => {
    let res: boolean;
    switch (type) {
        case questions.tsurukame:
            res = turukameResult(userAns, dic, diff);
            break;
        case questions.inference:
            res = inferenceResult(userAns, dic, diff);
            break;
        case questions.profitLoss:
            res = profitLossResult(userAns, dic, diff);
            break;
        default:
            res = false;
            break;
    }

    $("#next").on("click", () => {
        $("#result").html("");
        resolve(res);
    });
});

$("#start").on("click", () => {
    const qNum: number = Number($("#questionNum").val());
    if (qNum < 1 || qNum > 99) {
        alert("1~99の数値を入れてください");
        return;
    }
    const diff = $("input[name='diff']:checked").val();
    const type = $("input[name='type']:checked").val();
    let questionType: questions;
    let diffType: diffList;
    switch (type) {
        case "tsurukame":
            questionType = questions.tsurukame;
            break;
        case "profitLoss":
            questionType = questions.profitLoss;
            break;
        case "inference":
            questionType = questions.inference;
            break;
        case "random":
            questionType = questions.random;
            break;
        default:
            console.log("err1");
            return;
    }
    switch (diff) {
        case "easy":
            diffType = diffList.e;
            break;
        case "normal":
            diffType = diffList.n;
            break;
        case "hard":
            diffType = diffList.h;
            break;
        case "random":
            diffType = diffList.random;
            break;
        default:
            console.log("err2");
            return;
    }
    if (questionType === questions.random || diffType === diffList.random) {
        randomStart(questionType, diffType, qNum);
    } else {
        start(questionType, diffType, qNum);
    }
    $("#select").html("");
});

const start = async (type: questions, diff: diffList, n: number) => {
    let question: tsurukame | inference | profitLoss;
    switch (type) {
        case questions.tsurukame:
            question = new tsurukame;
            break;
        case questions.profitLoss:
            question = new profitLoss;
            break;
        case questions.inference:
            question = new inference;
            break;
        default:
            console.log("err3");
            return;
    }

    const ansList: boolean[] = [];
    const timeLimit: number = Number($("#timeLimit").val());
    const notTime: boolean = $("#inf").prop("checked");
    for (let i = 1; i <= n; i++) {
        const dic: dict = diff === diffList.e ? question.easy(i) : diff === diffList.n ? question.normal(i) : question.hard(i);
        if (notTime) {
            await pause();
        } else {
            $("#time").html(`<p>残り${timeLimit}秒</p>`);
            await timeCount(timeLimit);
        }
        const userAns: number = Number($("input[name='ans']:checked").val());
        $("#question").html("");
        $("#ans").html("");
        $("#time").html("");
        const r = await result(userAns, dic, diff, type);
        ansList.push(r);
    }

    let html = "";
    let cnt = 0;
    ansList.forEach((element, i) => {
        if (element) {
            html += `<p>${i + 1}問目 : o</p>`;
            cnt++;
        } else {
            html += `<p>${i + 1}問目 : x</p>`;
        }
    });
    html = `<h3>${n}問中${cnt}問正解</h4>` + html;
    html += `<button onclick="location.href='index.html'">戻る</button>`;
    $("#result").html(html);
}

const randomStart = async (type: questions, diff: diffList, n: number) => {
    let question: tsurukame | inference | profitLoss;
    const typeRandom = type === questions.random;
    const diffRandom = diff === diffList.random;
    switch (type) {
        case questions.tsurukame:
            question = new tsurukame;
            break;
        case questions.profitLoss:
            question = new profitLoss;
            break;
        case questions.inference:
            question = new inference;
            break;
        default:
            [question, type] = randomQuestion();
            break;
    }
    const ansList: boolean[] = [];
    const timeLimit: number = Number($("#timeLimit").val());
    const notTime: boolean = $("#inf").prop("checked");
    for (let i = 1; i <= n; i++) {
        if (typeRandom) {
            [question, type] = randomQuestion();
        }
        if (diffRandom) {
            diff = randomDiff();
        }
        const dic: dict = diff === diffList.e ? question.easy(i) : diff === diffList.n ? question.normal(i) : question.hard(i);
        if (notTime) {
            await pause();
        } else {
            $("#time").html(`<p>残り${timeLimit}秒</p>`);
            await timeCount(timeLimit);
        }
        const userAns: number = Number($("input[name='ans']:checked").val());
        $("#question").html("");
        $("#ans").html("");
        $("#time").html("");
        const r = await result(userAns, dic, diff, type);
        ansList.push(r);
    }

    let html = "";
    let cnt = 0;
    ansList.forEach((element, i) => {
        if (element) {
            html += `<p>${i + 1}問目 : o</p>`;
            cnt++;
        } else {
            html += `<p>${i + 1}問目 : x</p>`;
        }
    });
    html = `<h3>${n}問中${cnt}問正解</h4>` + html;
    html += `<button onclick="location.href='index.html'">戻る</button>`;
    $("#result").html(html);
}

const randomQuestion = () => {
    let res: [tsurukame | inference | profitLoss, questions];
    const n = getRandomInt(0,questions.random-1);
    switch (n) {
        case 0:
            res = [new tsurukame, questions.tsurukame];
            break;
        case 1:
            res = [new inference, questions.inference];
            break;
        case 2:
            res = [new profitLoss, questions.profitLoss];
            break;
        default:
            res = [new tsurukame, questions.tsurukame];
            break;
    }
    return res;
}

const randomDiff = () => {
    let res: diffList;
    const n = getRandomInt(0, diffList.random-1);
    switch (n) {
        case 0:
            res = diffList.e;
            break;
        case 1:
            res = diffList.n;
            break;
        case 2:
            res = diffList.h;
            break;
        default:
            res = diffList.e;
            break;
    }
    return res;
}

/**
 * difficulty list
 */
enum diffList {
    e,
    n,
    h,
    random,
}

/**
 * question type
 */
enum questions {
    tsurukame,
    inference,
    profitLoss,
    random,
}

// 参考 https://qiita.com/uhyo/items/583ddf7af3b489d5e8e9
type RequireOne<T, K extends keyof T = keyof T> =
    K extends keyof T ? PartialRequire<T, K> : never;
type PartialRequire<O, K extends keyof O> = {
    [P in K]-?: O[P]
} & O;

type dict = RequireOne<{
    /**鶴亀算*/
    tsurukame?: {
        ans: number;
        apple: number;
        appleValues: number;
        orange: number;
        orangeValues: number;
        banana?: number;
        bananaValues?: number;
        sum: number;
        sumValues: number;
        /**問題文のHTML*/
        html: string;
    };
    /**推論*/
    inference?: {
        ans: number;
        arr: string[];
        a: number;
        b: number;
        c: number;
        d: number;
        e?: number;
        /**問題文のHTML*/
        html: string;
    };
    /**損益算*/
    profitLoss?: {
        ans: number;
        /**原価*/
        cost: number;
        /**利益率*/
        profit: number;
        /**定価*/
        regular: number;
        /**割引率*/
        discount: number;
        /**最終的な売値*/
        selling: number;
        /**問題文のHTML*/
        html: string;
    }
}>;

interface q {
    easy(rep: number): dict;
    normal(rep: number): dict;
    hard(rep: number): dict;
}
