/* =========================================================
   MEMORY FLOW
   Wedding Photo Contest
   Stable Award Announcement
========================================================= */


/* =========================================================
   Supabase
========================================================= */

const AWARD_SUPABASE_URL =
    "https://tnqnowlvtnrzrcydcsmi.supabase.co";


const AWARD_SUPABASE_ANON_KEY =
    "sb_publishable_Mp7PsY2wh5VZtEDYC9fHrg_wvFDa8rO";


const awardSupabase =
    window.supabase.createClient(
        AWARD_SUPABASE_URL,
        AWARD_SUPABASE_ANON_KEY
    );


/* =========================================================
   時間設定
========================================================= */

const DRUMROLL_TIME = 10000;

const WINNER_DISPLAY_TIME = 10000;


/* =========================================================
   状態
========================================================= */

let lastAnnouncement = "";

let introTimer = null;

let hideTimer = null;

let drumrollAudio = null;

let applauseAudio = null;

let soundReady = false;

let soundPreparing = false;


/* =========================================================
   音声作成
========================================================= */

function createAwardAudio() {

    drumrollAudio =
        new Audio(
            "sounds/SE114_3.mp3"
        );


    applauseAudio =
        new Audio(
            "sounds/winner_applause_5sec.mp3"
        );


    drumrollAudio.preload =
        "auto";


    applauseAudio.preload =
        "auto";


    drumrollAudio.volume =
        0.9;


    applauseAudio.volume =
        1.0;


    drumrollAudio.load();

    applauseAudio.load();
}


/* =========================================================
   音声読み込み待ち
========================================================= */

function waitForAudioReady(
    audio,
    timeout = 8000
) {

    return new Promise(
        resolve => {

            if (
                audio.readyState >= 3
            ) {

                resolve(
                    true
                );

                return;
            }


            let finished =
                false;


            const finish =
                result => {

                    if (
                        finished
                    ) {
                        return;
                    }


                    finished =
                        true;


                    audio.removeEventListener(
                        "canplaythrough",
                        onReady
                    );


                    audio.removeEventListener(
                        "canplay",
                        onReady
                    );


                    clearTimeout(
                        timeoutId
                    );


                    resolve(
                        result
                    );
                };


            const onReady =
                () => {

                    finish(
                        true
                    );
                };


            audio.addEventListener(
                "canplaythrough",
                onReady
            );


            audio.addEventListener(
                "canplay",
                onReady
            );


            const timeoutId =
                setTimeout(
                    () => {

                        finish(
                            audio.readyState >= 2
                        );

                    },
                    timeout
                );


            audio.load();
        }
    );
}


/* =========================================================
   安定再生
========================================================= */

async function safePlay(
    audio,
    label
) {

    if (
        !audio
    ) {

        console.log(
            label,
            "音声がありません"
        );

        return false;
    }


    try {

        audio.pause();

        audio.currentTime =
            0;


        await audio.play();


        return true;

    }
    catch (
        error
    ) {

        console.log(
            label,
            "1回目の再生失敗",
            error
        );
    }


    /* ---------------------------------
       1回だけ再読み込みして再試行
    --------------------------------- */

    try {

        audio.load();


        await waitForAudioReady(
            audio,
            2500
        );


        audio.currentTime =
            0;


        await audio.play();


        console.log(
            label,
            "再試行で再生成功"
        );


        return true;

    }
    catch (
        error
    ) {

        console.log(
            label,
            "再試行も失敗",
            error
        );


        return false;
    }
}


/* =========================================================
   発表画面
========================================================= */

function createAwardScreen() {

    if (
        document.getElementById(
            "awardOverlay"
        )
    ) {
        return;
    }


    const overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        "awardOverlay";


    overlay.innerHTML = `

        <div
            class="award-blackout"
        ></div>


        <div
            class="
                award-light
                award-light-left
            "
        ></div>


        <div
            class="
                award-light
                award-light-right
            "
        ></div>


        <div
            id="awardIntro"
            class="award-intro"
        >

            <div
                class="award-small-title"
            >
                WEDDING
            </div>

            <div
                class="award-main-title"
            >
                PHOTO CONTEST
            </div>

            <div
                class="award-line"
            ></div>

            <div
                class="award-waiting"
            >
                AND THE WINNER IS...
            </div>

        </div>


        <div
            id="awardWinner"
            class="award-winner"
        >

            <div
                class="award-trophy"
            >
                🏆
            </div>

            <div
                id="awardName"
                class="award-name"
            >
                BEST PHOTO
            </div>

            <div
                class="award-photo-frame"
            >
                <img
                    id="awardPhoto"
                    alt="受賞写真"
                >
            </div>

            <div
                id="awardNickname"
                class="award-nickname"
            ></div>

            <div
                class="award-congratulations"
            >
                CONGRATULATIONS!
            </div>

        </div>


        <div
            id="awardCrackerLeft"
            class="
                award-cracker
                award-cracker-left
            "
        >
            🎉
        </div>


        <div
            id="awardCrackerRight"
            class="
                award-cracker
                award-cracker-right
            "
        >
            🎉
        </div>

    `;


    document.body.appendChild(
        overlay
    );


    createAwardStyles();
}


/* =========================================================
   CSS
========================================================= */

function createAwardStyles() {

    if (
        document.getElementById(
            "awardStyle"
        )
    ) {
        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "awardStyle";


    style.textContent = `

        #awardOverlay {

            position: fixed;

            inset: 0;

            z-index: 999999;

            display: none;

            align-items: center;

            justify-content: center;

            overflow: hidden;

            opacity: 0;

            pointer-events: none;
        }


        #awardOverlay.award-active {

            display: flex;

            opacity: 1;

            pointer-events: auto;
        }


        #awardOverlay.award-fadeout {

            animation:
                awardFadeOut
                1s
                ease
                forwards;
        }


        .award-blackout {

            position: absolute;

            inset: 0;

            background:
                radial-gradient(
                    circle at center,
                    rgba(30,25,20,0.82) 0%,
                    rgba(5,5,8,0.96) 65%,
                    rgba(0,0,0,1) 100%
                );

            opacity: 0;

            animation:
                awardBlackout
                1.5s
                ease
                forwards;
        }


        .award-light {

            position: absolute;

            top: -35vh;

            width: 48vw;

            height: 160vh;

            opacity: 0;

            background:
                linear-gradient(
                    to bottom,
                    rgba(255,245,190,0.85),
                    rgba(255,236,170,0.25) 38%,
                    rgba(255,255,255,0.02) 80%
                );

            clip-path:
                polygon(
                    46% 0,
                    54% 0,
                    100% 100%,
                    0 100%
                );

            filter:
                blur(7px);

            transform-origin:
                top center;

            pointer-events: none;
        }


        .award-light-left {

            left: -19vw;

            animation:
                awardLightLeft
                3.2s
                ease-in-out
                infinite
                alternate;
        }


        .award-light-right {

            right: -19vw;

            animation:
                awardLightRight
                3.6s
                ease-in-out
                infinite
                alternate;
        }


        .award-intro {

            position: relative;

            z-index: 20;

            text-align: center;

            color: white;

            width: 92vw;

            opacity: 0;

            animation:
                awardIntroIn
                1.5s
                0.5s
                ease
                forwards;
        }


        .award-small-title {

            font-size:
                clamp(
                    18px,
                    2vw,
                    30px
                );

            letter-spacing: 10px;

            font-weight: 500;

            color:
                rgba(
                    255,
                    255,
                    255,
                    0.72
                );
        }


        .award-main-title {

            margin-top: 10px;

            font-size:
                clamp(
                    44px,
                    7vw,
                    105px
                );

            font-weight: 900;

            letter-spacing: 5px;

            color: white;

            text-shadow:
                0 0 30px
                rgba(
                    255,
                    220,
                    140,
                    0.32
                );
        }


        .award-line {

            width: 120px;

            height: 2px;

            margin:
                30px
                auto;

            background:
                linear-gradient(
                    to right,
                    transparent,
                    #ffd977,
                    transparent
                );
        }


        .award-waiting {

            margin-top: 15px;

            font-size:
                clamp(
                    26px,
                    4vw,
                    58px
                );

            font-weight: 700;

            letter-spacing: 4px;

            color: #ffe7a2;

            animation:
                awardWaitingPulse
                1.25s
                ease-in-out
                infinite;
        }


        .award-winner {

            position: relative;

            z-index: 40;

            width: 94vw;

            height: 96vh;

            display: none;

            flex-direction: column;

            justify-content: center;

            align-items: center;

            text-align: center;

            opacity: 0;
        }


        .award-winner.show {

            display: flex;

            animation:
                awardWinnerIn
                0.8s
                cubic-bezier(
                    0.18,
                    0.89,
                    0.32,
                    1.28
                )
                forwards;
        }


        .award-trophy {

            font-size:
                clamp(
                    55px,
                    7vw,
                    100px
                );

            line-height: 1;

            animation:
                awardTrophy
                1.1s
                ease-out;
        }


        .award-name {

            margin-top: 4px;

            font-size:
                clamp(
                    36px,
                    5vw,
                    74px
                );

            font-weight: 900;

            letter-spacing: 3px;

            color: #ffd76b;

            text-shadow:
                0 0 15px
                rgba(
                    255,
                    215,
                    107,
                    0.65
                );
        }


        .award-photo-frame {

            margin-top: 15px;

            padding: 10px;

            background: white;

            border-radius: 8px;

            max-width: 72vw;

            max-height: 57vh;

            box-shadow:
                0 0 35px
                rgba(
                    255,
                    219,
                    120,
                    0.5
                ),
                0 30px 80px
                rgba(
                    0,
                    0,
                    0,
                    0.65
                );

            animation:
                awardPhotoPop
                1s
                ease-out;
        }


        #awardPhoto {

            display: block;

            width: auto;

            height: auto;

            max-width: 100%;

            max-height: 53vh;

            object-fit: contain;

            border-radius: 3px;
        }


        .award-nickname {

            margin-top: 16px;

            font-size:
                clamp(
                    25px,
                    3.3vw,
                    48px
                );

            font-weight: 700;

            color: white;
        }


        .award-congratulations {

            margin-top: 6px;

            font-size:
                clamp(
                    17px,
                    2vw,
                    28px
                );

            letter-spacing: 6px;

            font-weight: bold;

            color: #ffd76b;
        }


        .award-cracker {

            position: fixed;

            z-index: 70;

            top: 48%;

            font-size:
                clamp(
                    75px,
                    9vw,
                    140px
                );

            opacity: 0;

            pointer-events: none;
        }


        .award-cracker-left {

            left: 2vw;
        }


        .award-cracker-right {

            right: 2vw;

            transform:
                scaleX(-1);
        }


        .award-cracker-left.fire {

            animation:
                crackerLeft
                1.6s
                ease-out
                forwards;
        }


        .award-cracker-right.fire {

            animation:
                crackerRight
                1.6s
                ease-out
                forwards;
        }


        .award-sparkle {

            position: fixed;

            z-index: 1000002;

            pointer-events: none;

            opacity: 0;

            animation:
                sparkleFly
                2.3s
                ease-out
                forwards;
        }


        .award-confetti {

            position: fixed;

            z-index: 1000001;

            width: 9px;

            height: 16px;

            border-radius: 2px;

            pointer-events: none;

            animation:
                confettiFly
                2.8s
                ease-out
                forwards;
        }


        #awardSoundButton {

            position: fixed;

            top: 14px;

            right: 14px;

            z-index: 1000003;

            padding:
                11px
                18px;

            border: none;

            border-radius: 30px;

            background:
                rgba(
                    20,
                    20,
                    20,
                    0.82
                );

            color: white;

            font-size: 14px;

            font-weight: bold;

            cursor: pointer;

            box-shadow:
                0 4px 18px
                rgba(
                    0,
                    0,
                    0,
                    0.28
                );
        }


        #awardSoundButton:disabled {

            cursor: wait;

            opacity: 0.8;
        }


        #awardSoundButton.sound-on {

            background:
                rgba(
                    42,
                    130,
                    70,
                    0.92
                );
        }


        @keyframes awardBlackout {

            from {
                opacity: 0;
            }

            to {
                opacity: 1;
            }
        }


        @keyframes awardLightLeft {

            0% {

                opacity: 0.35;

                transform:
                    rotate(-28deg);
            }

            100% {

                opacity: 0.70;

                transform:
                    rotate(30deg);
            }
        }


        @keyframes awardLightRight {

            0% {

                opacity: 0.35;

                transform:
                    rotate(28deg);
            }

            100% {

                opacity: 0.70;

                transform:
                    rotate(-30deg);
            }
        }


        @keyframes awardIntroIn {

            from {

                opacity: 0;

                transform:
                    translateY(20px);
            }

            to {

                opacity: 1;

                transform:
                    translateY(0);
            }
        }


        @keyframes awardWaitingPulse {

            0%,
            100% {

                opacity: 0.5;

                transform:
                    scale(0.98);
            }

            50% {

                opacity: 1;

                transform:
                    scale(1.02);
            }
        }


        @keyframes awardWinnerIn {

            0% {

                opacity: 0;

                transform:
                    scale(0.72);
            }

            70% {

                opacity: 1;

                transform:
                    scale(1.04);
            }

            100% {

                opacity: 1;

                transform:
                    scale(1);
            }
        }


        @keyframes awardTrophy {

            0% {

                transform:
                    scale(0)
                    rotate(-20deg);
            }

            70% {

                transform:
                    scale(1.3)
                    rotate(8deg);
            }

            100% {

                transform:
                    scale(1)
                    rotate(0);
            }
        }


        @keyframes awardPhotoPop {

            from {

                transform:
                    scale(0.55)
                    rotate(-3deg);

                opacity: 0;
            }

            to {

                transform:
                    scale(1)
                    rotate(0);

                opacity: 1;
            }
        }


        @keyframes crackerLeft {

            0% {

                opacity: 0;

                transform:
                    scale(0.2)
                    rotate(35deg);
            }

            20% {

                opacity: 1;

                transform:
                    scale(1.3)
                    rotate(25deg);
            }

            100% {

                opacity: 0;

                transform:
                    translate(
                        35px,
                        -40px
                    )
                    scale(1)
                    rotate(15deg);
            }
        }


        @keyframes crackerRight {

            0% {

                opacity: 0;

                transform:
                    scaleX(-1)
                    scale(0.2)
                    rotate(35deg);
            }

            20% {

                opacity: 1;

                transform:
                    scaleX(-1)
                    scale(1.3)
                    rotate(25deg);
            }

            100% {

                opacity: 0;

                transform:
                    translate(
                        -35px,
                        -40px
                    )
                    scaleX(-1)
                    scale(1)
                    rotate(15deg);
            }
        }


        @keyframes sparkleFly {

            0% {

                opacity: 0;

                transform:
                    scale(0)
                    rotate(0deg);
            }

            25% {

                opacity: 1;

                transform:
                    scale(1.4)
                    rotate(80deg);
            }

            100% {

                opacity: 0;

                transform:
                    translateY(-100px)
                    scale(0.2)
                    rotate(200deg);
            }
        }


        @keyframes confettiFly {

            0% {

                opacity: 1;

                transform:
                    translate(0,0)
                    rotate(0deg);
            }

            100% {

                opacity: 0;

                transform:
                    translate(
                        var(--x),
                        var(--y)
                    )
                    rotate(600deg);
            }
        }


        @keyframes awardFadeOut {

            from {
                opacity: 1;
            }

            to {
                opacity: 0;
            }
        }


        @media (
            max-width: 700px
        ) {

            .award-photo-frame {

                max-width: 84vw;
            }


            #awardPhoto {

                max-height: 48vh;
            }
        }

    `;


    document.head.appendChild(
        style
    );
}


/* =========================================================
   音声ONボタン
========================================================= */

function createSoundButton() {

    if (
        document.getElementById(
            "awardSoundButton"
        )
    ) {
        return;
    }


    const button =
        document.createElement(
            "button"
        );


    button.id =
        "awardSoundButton";


    button.type =
        "button";


    button.textContent =
        "🔊 発表音声を有効にする";


    button.addEventListener(
        "click",
        prepareAwardSound
    );


    document.body.appendChild(
        button
    );
}


/* =========================================================
   音声準備
========================================================= */

async function prepareAwardSound() {

    if (
        soundPreparing
    ) {
        return;
    }


    const button =
        document.getElementById(
            "awardSoundButton"
        );


    soundPreparing =
        true;


    soundReady =
        false;


    button.disabled =
        true;


    button.classList.remove(
        "sound-on"
    );


    button.textContent =
        "🔄 音声を読み込み中…";


    try {

        await Promise.all(
            [
                waitForAudioReady(
                    drumrollAudio
                ),

                waitForAudioReady(
                    applauseAudio
                )
            ]
        );


        /* -------------------------------
           ブラウザの再生許可を取得
        -------------------------------- */

        drumrollAudio.volume =
            0.01;


        drumrollAudio.currentTime =
            0;


        await drumrollAudio.play();


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    120
                )
        );


        drumrollAudio.pause();

        drumrollAudio.currentTime =
            0;

        drumrollAudio.volume =
            0.9;



        applauseAudio.volume =
            0.01;


        applauseAudio.currentTime =
            0;


        await applauseAudio.play();


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    120
                )
        );


        applauseAudio.pause();

        applauseAudio.currentTime =
            0;

        applauseAudio.volume =
            1.0;


        soundReady =
            true;


        button.textContent =
            "🔊 発表音声 ON";


        button.classList.add(
            "sound-on"
        );

    }
    catch (
        error
    ) {

        console.log(
            "音声準備エラー",
            error
        );


        soundReady =
            false;


        button.textContent =
            "🔊 もう一度押してください";
    }


    button.disabled =
        false;


    soundPreparing =
        false;
}


/* =========================================================
   キラキラ
========================================================= */

function createSparkles() {

    const marks =
        [
            "✨",
            "⭐",
            "💫",
            "✦"
        ];


    for (
        let i = 0;
        i < 40;
        i++
    ) {

        const sparkle =
            document.createElement(
                "div"
            );


        sparkle.className =
            "award-sparkle";


        sparkle.textContent =
            marks[
                Math.floor(
                    Math.random()
                    *
                    marks.length
                )
            ];


        sparkle.style.left =
            (
                8
                +
                Math.random()
                *
                84
            )
            +
            "vw";


        sparkle.style.top =
            (
                12
                +
                Math.random()
                *
                72
            )
            +
            "vh";


        sparkle.style.fontSize =
            (
                16
                +
                Math.random()
                *
                32
            )
            +
            "px";


        sparkle.style.animationDelay =
            (
                Math.random()
                *
                0.7
            )
            +
            "s";


        document.body.appendChild(
            sparkle
        );


        setTimeout(
            () => {

                sparkle.remove();

            },
            3200
        );
    }
}


/* =========================================================
   紙吹雪
========================================================= */

function createConfetti() {

    const colors =
        [
            "#ffd86b",
            "#ff9eb5",
            "#ffffff",
            "#b7e7a7",
            "#ffbd59"
        ];


    for (
        let i = 0;
        i < 60;
        i++
    ) {

        const confetti =
            document.createElement(
                "div"
            );


        confetti.className =
            "award-confetti";


        confetti.style.background =
            colors[
                Math.floor(
                    Math.random()
                    *
                    colors.length
                )
            ];


        const leftSide =
            i % 2 === 0;


        confetti.style.top =
            (
                43
                +
                Math.random()
                *
                15
            )
            +
            "vh";


        if (
            leftSide
        ) {

            confetti.style.left =
                "6vw";


            confetti.style.setProperty(
                "--x",
                (
                    120
                    +
                    Math.random()
                    *
                    420
                )
                +
                "px"
            );

        }
        else {

            confetti.style.right =
                "6vw";


            confetti.style.setProperty(
                "--x",
                (
                    -120
                    -
                    Math.random()
                    *
                    420
                )
                +
                "px"
            );
        }


        confetti.style.setProperty(
            "--y",
            (
                -100
                -
                Math.random()
                *
                340
            )
            +
            "px"
        );


        confetti.style.animationDelay =
            (
                Math.random()
                *
                0.25
            )
            +
            "s";


        document.body.appendChild(
            confetti
        );


        setTimeout(
            () => {

                confetti.remove();

            },
            3300
        );
    }
}


/* =========================================================
   クラッカー
========================================================= */

function fireCrackers() {

    const left =
        document.getElementById(
            "awardCrackerLeft"
        );


    const right =
        document.getElementById(
            "awardCrackerRight"
        );


    left.classList.remove(
        "fire"
    );


    right.classList.remove(
        "fire"
    );


    void left.offsetWidth;


    left.classList.add(
        "fire"
    );


    right.classList.add(
        "fire"
    );


    createConfetti();

    createSparkles();
}


/* =========================================================
   発表開始
========================================================= */

async function showAward(
    photo
) {

    clearAwardTimers();


    const overlay =
        document.getElementById(
            "awardOverlay"
        );


    const intro =
        document.getElementById(
            "awardIntro"
        );


    const winner =
        document.getElementById(
            "awardWinner"
        );


    const awardName =
        document.getElementById(
            "awardName"
        );


    const photoElement =
        document.getElementById(
            "awardPhoto"
        );


    const nickname =
        document.getElementById(
            "awardNickname"
        );


    overlay.classList.remove(
        "award-fadeout"
    );


    winner.classList.remove(
        "show"
    );


    winner.style.display =
        "none";


    intro.style.display =
        "block";


    awardName.textContent =
        photo.award
        ||
        "BEST PHOTO";


    photoElement.src =
        photo.image_url;


    nickname.textContent =
        (
            photo.nickname
            ||
            "ゲスト"
        )
        +
        " さん";


    overlay.style.display =
        "flex";


    overlay.classList.add(
        "award-active"
    );


    if (
        !soundReady
    ) {

        console.log(
            "音声ONがまだ完了していません"
        );
    }


    await safePlay(
        drumrollAudio,
        "ドラムロール"
    );


    introTimer =
        setTimeout(
            () => {

                revealWinner();

            },
            DRUMROLL_TIME
        );
}


/* =========================================================
   受賞発表
========================================================= */

async function revealWinner() {

    const intro =
        document.getElementById(
            "awardIntro"
        );


    const winner =
        document.getElementById(
            "awardWinner"
        );


    drumrollAudio.pause();

    drumrollAudio.currentTime =
        0;


    intro.style.display =
        "none";


    winner.style.display =
        "flex";


    void winner.offsetWidth;


    winner.classList.add(
        "show"
    );


    fireCrackers();


    await safePlay(
        applauseAudio,
        "拍手・歓声"
    );


    hideTimer =
        setTimeout(
            () => {

                hideAward();

            },
            WINNER_DISPLAY_TIME
        );
}


/* =========================================================
   発表終了
========================================================= */

function hideAward() {

    const overlay =
        document.getElementById(
            "awardOverlay"
        );


    overlay.classList.add(
        "award-fadeout"
    );


    setTimeout(
        () => {

            overlay.classList.remove(
                "award-active"
            );


            overlay.classList.remove(
                "award-fadeout"
            );


            overlay.style.display =
                "none";


            resetAward();

        },
        1000
    );
}


/* =========================================================
   リセット
========================================================= */

function resetAward() {

    const intro =
        document.getElementById(
            "awardIntro"
        );


    const winner =
        document.getElementById(
            "awardWinner"
        );


    intro.style.display =
        "block";


    winner.style.display =
        "none";


    winner.classList.remove(
        "show"
    );


    drumrollAudio.pause();

    drumrollAudio.currentTime =
        0;


    applauseAudio.pause();

    applauseAudio.currentTime =
        0;
}


/* =========================================================
   タイマー解除
========================================================= */

function clearAwardTimers() {

    if (
        introTimer
    ) {

        clearTimeout(
            introTimer
        );


        introTimer =
            null;
    }


    if (
        hideTimer
    ) {

        clearTimeout(
            hideTimer
        );


        hideTimer =
            null;
    }
}


/* =========================================================
   Supabase Realtime
========================================================= */

function startAwardRealtime() {

    awardSupabase
        .channel(
            "wedding-award-live"
        )

        .on(
            "postgres_changes",

            {

                event:
                    "UPDATE",

                schema:
                    "public",

                table:
                    "photos"

            },

            payload => {

                const photo =
                    payload.new;


                if (
                    !photo
                ) {
                    return;
                }


                if (
                    !photo.announced_at
                ) {
                    return;
                }


                const key =
                    photo.id
                    +
                    "-"
                    +
                    photo.announced_at;


                if (
                    key
                    ===
                    lastAnnouncement
                ) {
                    return;
                }


                lastAnnouncement =
                    key;


                showAward(
                    photo
                );
            }
        )

        .subscribe(
            status => {

                console.log(
                    "Award Realtime:",
                    status
                );
            }
        );
}


/* =========================================================
   起動
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        createAwardAudio();

        createAwardScreen();

        createSoundButton();

        startAwardRealtime();

    }
);