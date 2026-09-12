/* ========================================
   PHOTO SHUSHU
   Award Announcement System
   何度でも発表できる修正版
======================================== */

const AWARD_SUPABASE_URL =
    "https://tnqnowlvtnrzrcydcsmi.supabase.co";


const AWARD_SUPABASE_ANON_KEY =
    "sb_publishable_Mp7PsY2wh5VZtEDYC9fHrg_wvFDa8rO";


/* ========================================
   Supabase
======================================== */

const awardSupabase =
    window.supabase.createClient(
        AWARD_SUPABASE_URL,
        AWARD_SUPABASE_ANON_KEY
    );


let lastAnnouncement = null;
let awardTimer = null;


/* ========================================
   発表画面を作る
======================================== */

function createAwardOverlay() {

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
        <div class="award-content">

            <div class="award-trophy">
                🏆
            </div>

            <div
                id="awardTitle"
                class="award-title"
            >
                BEST PHOTO
            </div>

            <div
                class="award-image-frame"
            >
                <img
                    id="awardImage"
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
    `;


    document.body.appendChild(
        overlay
    );


    addAwardStyles();
}


/* ========================================
   デザイン
======================================== */

function addAwardStyles() {

    if (
        document.getElementById(
            "awardStyles"
        )
    ) {
        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "awardStyles";


    style.textContent = `

        #awardOverlay {

            position: fixed;

            inset: 0;

            z-index: 999999;

            display: none;

            align-items: center;

            justify-content: center;

            text-align: center;

            overflow: hidden;

            background:
                radial-gradient(
                    circle at center,
                    rgba(255,255,255,0.98),
                    rgba(255,236,242,0.97),
                    rgba(255,247,213,0.97)
                );
        }


        #awardOverlay.show {

            display: flex;

            animation:
                awardFadeIn
                0.8s
                ease
                forwards;
        }


        #awardOverlay.hide {

            display: flex;

            animation:
                awardFadeOut
                0.8s
                ease
                forwards;
        }


        .award-content {

            width: 90vw;

            max-width: 900px;

            max-height: 95vh;

            display: flex;

            flex-direction: column;

            align-items: center;

            justify-content: center;
        }


        .award-trophy {

            font-size:
                clamp(
                    55px,
                    7vw,
                    95px
                );

            animation:
                trophyPop
                1s
                ease;
        }


        .award-title {

            margin-top: 5px;

            font-size:
                clamp(
                    34px,
                    5vw,
                    70px
                );

            font-weight: 900;

            color: #d69a25;

            letter-spacing: 3px;

            text-shadow:
                0 3px 0 white,
                0 6px 15px
                rgba(150,100,20,0.20);
        }


        .award-image-frame {

            margin-top: 20px;

            padding: 10px;

            background: white;

            border-radius: 12px;

            box-shadow:
                0 20px 55px
                rgba(100,60,70,0.28);

            max-width: 70vw;

            max-height: 58vh;

            animation:
                awardPhotoPop
                1.1s
                cubic-bezier(
                    0.18,
                    0.89,
                    0.32,
                    1.28
                );
        }


        #awardImage {

            display: block;

            max-width: 100%;

            max-height: 55vh;

            object-fit: contain;

            border-radius: 5px;
        }


        .award-nickname {

            margin-top: 18px;

            font-size:
                clamp(
                    25px,
                    3.5vw,
                    48px
                );

            font-weight: bold;

            color: #d76f91;
        }


        .award-congratulations {

            margin-top: 8px;

            font-size:
                clamp(
                    18px,
                    2.2vw,
                    30px
                );

            font-weight: bold;

            letter-spacing: 3px;

            color: #7d6b70;
        }


        .award-sparkle {

            position: fixed;

            z-index: 1000000;

            pointer-events: none;

            animation:
                awardSparkle
                1.7s
                ease-out
                forwards;
        }


        @keyframes awardFadeIn {

            from {
                opacity: 0;
            }

            to {
                opacity: 1;
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


        @keyframes trophyPop {

            0% {
                transform:
                    scale(0)
                    rotate(-30deg);
            }

            70% {
                transform:
                    scale(1.25)
                    rotate(10deg);
            }

            100% {
                transform:
                    scale(1)
                    rotate(0);
            }
        }


        @keyframes awardPhotoPop {

            0% {

                opacity: 0;

                transform:
                    scale(0.3)
                    rotate(-8deg);
            }

            70% {

                opacity: 1;

                transform:
                    scale(1.05)
                    rotate(2deg);
            }

            100% {

                opacity: 1;

                transform:
                    scale(1)
                    rotate(0);
            }
        }


        @keyframes awardSparkle {

            0% {

                opacity: 0;

                transform:
                    scale(0)
                    rotate(0deg);
            }

            20% {

                opacity: 1;

                transform:
                    scale(1.4)
                    rotate(70deg);
            }

            100% {

                opacity: 0;

                transform:
                    translateY(-80px)
                    scale(0.2)
                    rotate(180deg);
            }
        }


        @media (
            max-width: 600px
        ) {

            .award-image-frame {
                max-width: 85vw;
            }

            #awardImage {
                max-height: 50vh;
            }
        }

    `;


    document.head.appendChild(
        style
    );
}


/* ========================================
   キラキラ
======================================== */

function createAwardSparkles() {

    const sparkleCharacters =
        [
            "✨",
            "⭐",
            "♡",
            "✨",
            "✦"
        ];


    for (
        let i = 0;
        i < 35;
        i++
    ) {

        const sparkle =
            document.createElement(
                "div"
            );


        sparkle.className =
            "award-sparkle";


        sparkle.textContent =
            sparkleCharacters[
                Math.floor(
                    Math.random()
                    *
                    sparkleCharacters.length
                )
            ];


        sparkle.style.left =
            (
                Math.random()
                *
                100
            )
            +
            "vw";


        sparkle.style.top =
            (
                20
                +
                Math.random()
                *
                75
            )
            +
            "vh";


        sparkle.style.fontSize =
            (
                15
                +
                Math.random()
                *
                30
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
            2500
        );
    }
}


/* ========================================
   受賞写真を表示
======================================== */

function showAward(photo) {

    createAwardOverlay();


    const overlay =
        document.getElementById(
            "awardOverlay"
        );


    const awardTitle =
        document.getElementById(
            "awardTitle"
        );


    const awardImage =
        document.getElementById(
            "awardImage"
        );


    const awardNickname =
        document.getElementById(
            "awardNickname"
        );


    /*
       前回のdisplay:noneを完全解除
    */

    overlay.style.display = "";


    overlay.classList.remove(
        "hide"
    );

    overlay.classList.remove(
        "show"
    );


    /*
       アニメーションを毎回最初から
    */

    void overlay.offsetWidth;


    awardTitle.textContent =
        photo.award
        ||
        "BEST PHOTO";


    awardNickname.textContent =
        (
            photo.nickname
            ||
            "ゲスト"
        )
        +
        " さん";


    awardImage.style.display =
        "block";


    awardImage.onload =
        () => {

            awardImage.style.display =
                "block";
        };


    awardImage.onerror =
        () => {

            awardImage.style.display =
                "none";
        };


    awardImage.src =
        photo.image_url;


    overlay.classList.add(
        "show"
    );


    createAwardSparkles();


    if (awardTimer) {

        clearTimeout(
            awardTimer
        );
    }


    awardTimer =
        setTimeout(
            () => {

                hideAward();

            },
            10000
        );
}


/* ========================================
   発表終了
======================================== */

function hideAward() {

    const overlay =
        document.getElementById(
            "awardOverlay"
        );


    if (!overlay) {
        return;
    }


    overlay.classList.remove(
        "show"
    );


    overlay.classList.add(
        "hide"
    );


    setTimeout(
        () => {

            overlay.classList.remove(
                "hide"
            );

            /*
               inlineのdisplay:noneは使わない
               これで2回目以降も表示可能
            */

        },
        800
    );
}


/* ========================================
   リアルタイム監視
======================================== */

function startAwardRealtime() {

    awardSupabase
        .channel(
            "wedding-award-announcement"
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
                    ||
                    !photo.announced_at
                ) {

                    return;
                }


                if (
                    lastAnnouncement
                    ===
                    photo.announced_at
                ) {

                    return;
                }


                lastAnnouncement =
                    photo.announced_at;


                showAward(
                    photo
                );
            }
        )

        .subscribe(
            status => {

                console.log(
                    "Award realtime:",
                    status
                );
            }
        );
}


/* ========================================
   起動
======================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        createAwardOverlay();

        startAwardRealtime();

    }
);
