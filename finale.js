/* =========================================================
   MEMORY FLOW
   WEDDING FINALE

   写真が散らばる
        ↓
   ♥ ハートへ集合
        ↓
   ♥で静止
        ↓
   同じ写真が★へ変形
        ↓
   ★で静止
        ↓
   THANK YOU
        ↓
   Special Thanks
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const FINALE_SUPABASE_URL =
    "https://tnqnowlvtnrzrcydcsmi.supabase.co";

const FINALE_SUPABASE_ANON_KEY =
    "sb_publishable_Mp7PsY2wh5VZtEDYC9fHrg_wvFDa8rO";

const finaleSupabase =
    window.supabase.createClient(
        FINALE_SUPABASE_URL,
        FINALE_SUPABASE_ANON_KEY
    );


/* =========================================================
   基本設定
========================================================= */

const FINALE_MAX_PHOTOS = 200;

let finaleRunning = false;
let finaleTimers = [];
let lastFinaleCommand = "";


/* =========================================================
   タイマー
========================================================= */

function addFinaleTimer(callback, delay) {
    const timer = setTimeout(callback, delay);
    finaleTimers.push(timer);
}


function clearFinaleTimers() {
    finaleTimers.forEach(function (timer) {
        clearTimeout(timer);
    });

    finaleTimers = [];
}


/* =========================================================
   フィナーレ画面作成
========================================================= */

function createFinaleScreen() {

    if (document.getElementById("finaleOverlay")) {
        return;
    }

    const overlay = document.createElement("div");

    overlay.id = "finaleOverlay";

    overlay.innerHTML = `

        <div class="finale-glow"></div>

        <div
            id="finalePhotoStage"
            class="finale-photo-stage"
        ></div>

        <div
            id="finaleThankYou"
            class="finale-message"
        >

            <div class="finale-thankyou-main">
                THANK YOU
            </div>

            <div class="finale-thankyou-names">
                RYUNOSUKE &amp; MAKOTO
            </div>

            <div class="finale-divider"></div>

            <div class="finale-thankyou-date">
                2027.02.22
            </div>

        </div>

        <div
            id="finaleSpecialThanks"
            class="finale-message"
        >

            <div class="finale-special-title">
                Special Thanks
            </div>

            <div class="finale-special-text">
                みなさまの素敵な写真が<br>
                最高の思い出になりました<br>
                本当にありがとうございました
            </div>

            <div class="finale-divider"></div>

        </div>
    `;

    document.body.appendChild(overlay);

    createFinaleSparkles();
}


/* =========================================================
   キラキラ
========================================================= */

function createFinaleSparkles() {

    const overlay =
        document.getElementById("finaleOverlay");

    if (!overlay) {
        return;
    }

    for (let i = 0; i < 40; i++) {

        const sparkle =
            document.createElement("div");

        sparkle.className =
            "finale-sparkle";

        sparkle.style.setProperty(
            "--sparkle-left",
            (3 + Math.random() * 94) + "%"
        );

        sparkle.style.setProperty(
            "--sparkle-top",
            (3 + Math.random() * 94) + "%"
        );

        sparkle.style.setProperty(
            "--sparkle-size",
            (3 + Math.random() * 7) + "px"
        );

        sparkle.style.setProperty(
            "--sparkle-duration",
            (2 + Math.random() * 3) + "s"
        );

        sparkle.style.setProperty(
            "--sparkle-delay",
            (Math.random() * 3) + "s"
        );

        overlay.appendChild(sparkle);
    }
}


/* =========================================================
   SUPABASEから写真取得
========================================================= */

async function getFinalePhotos() {

    const { data, error } =
        await finaleSupabase
            .from("photos")
            .select(
                "id, image_url, created_at"
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            )
            .limit(FINALE_MAX_PHOTOS);

    if (error) {

        console.error(
            "Finale photo load error:",
            error
        );

        return [];
    }

    return (data || []).reverse();
}


/* =========================================================
   ♥ ハート配置

   今回の重要変更点。

   ハートの「線」ではなく
   ハートの内側を判定して、
   中まで写真で埋める。
========================================================= */

function generateHeartLayout(photoCount) {

    function insideHeart(x, y) {

        const a =
            x * x
            +
            y * y
            -
            1;

        return (
            a * a * a
            -
            x * x * y * y * y
        ) <= 0;
    }


    let bestPoints = [];
    let bestDifference = Infinity;


    /*
       写真枚数にちょうど良い
       格子の細かさを自動で探す
    */

    for (
        let step = 0.34;
        step >= 0.075;
        step -= 0.005
    ) {

        const points = [];

        let row = 0;


        for (
            let y = -1.12;
            y <= 1.18;
            y += step
        ) {

            /*
               1段おきに少しずらすことで
               写真の隙間を減らす
            */

            const offset =
                (row % 2)
                *
                step
                *
                0.5;


            for (
                let x =
                    -1.28
                    +
                    offset;

                x <= 1.28;

                x += step
            ) {

                /*
                   ハート内部だけ採用
                */

                if (
                    insideHeart(
                        x,
                        -y
                    )
                ) {

                    points.push({

                        /*
                           横幅
                        */

                        x:
                            50
                            +
                            x
                            *
                            28.5,

                        /*
                           高さ
                        */

                        y:
                            49
                            +
                            y
                            *
                            27.0
                    });
                }
            }

            row++;
        }


        const difference =
            Math.abs(
                points.length
                -
                photoCount
            );


        if (
            difference
            <
            bestDifference
        ) {

            bestDifference =
                difference;

            bestPoints =
                points;
        }
    }


    /*
       配置点の方が多い場合。

       上から単純に削除すると
       ハートの下側が消えてしまうので
       全体から均等に取る。
    */

    if (
        bestPoints.length
        >
        photoCount
    ) {

        const selected = [];


        for (
            let i = 0;
            i < photoCount;
            i++
        ) {

            const index =
                Math.floor(
                    i
                    *
                    bestPoints.length
                    /
                    photoCount
                );


            selected.push(
                bestPoints[index]
            );
        }


        bestPoints =
            selected;
    }


    /*
       万が一写真の方が多かった場合。

       ハート内部へ追加する。
    */

    let safety = 0;


    while (
        bestPoints.length
        <
        photoCount
        &&
        safety
        <
        20000
    ) {

        safety++;


        const x =
            -1.25
            +
            Math.random()
            *
            2.5;


        const y =
            -1.08
            +
            Math.random()
            *
            2.18;


        if (
            insideHeart(
                x,
                -y
            )
        ) {

            bestPoints.push({

                x:
                    50
                    +
                    x
                    *
                    28.5,

                y:
                    49
                    +
                    y
                    *
                    27.0
            });
        }
    }


    return bestPoints.slice(
        0,
        photoCount
    );
}


/* =========================================================
   ★ 星の形

   今回は左右を短くする。

   outerX < outerY にすることで
   横へ広がりすぎない★になる。
========================================================= */

function createStarPolygon() {

    const points = [];


    /*
       ★の外側

       横 36
       縦 43

       → 前より左右が短い
    */

    const outerX = 36;
    const outerY = 43;


    /*
       ★の内側
    */

    const innerX = 16.5;
    const innerY = 19.5;


    for (
        let i = 0;
        i < 10;
        i++
    ) {

        const angle =
            -Math.PI / 2
            +
            i
            *
            Math.PI / 5;


        const isOuter =
            i % 2 === 0;


        points.push({

            x:
                50
                +
                Math.cos(angle)
                *
                (
                    isOuter
                    ?
                    outerX
                    :
                    innerX
                ),

            y:
                50
                +
                Math.sin(angle)
                *
                (
                    isOuter
                    ?
                    outerY
                    :
                    innerY
                )
        });
    }


    return points;
}


/* =========================================================
   点が★の内側にあるか判定
========================================================= */

function pointInsidePolygon(
    x,
    y,
    polygon
) {

    let inside = false;


    for (
        let i = 0,
            j = polygon.length - 1;

        i < polygon.length;

        j = i++
    ) {

        const xi =
            polygon[i].x;

        const yi =
            polygon[i].y;

        const xj =
            polygon[j].x;

        const yj =
            polygon[j].y;


        const intersect =
            (
                (yi > y)
                !==
                (yj > y)
            )
            &&
            (
                x
                <
                (
                    (xj - xi)
                    *
                    (y - yi)
                    /
                    (
                        (yj - yi)
                        ||
                        0.000001
                    )
                )
                +
                xi
            );


        if (intersect) {
            inside = !inside;
        }
    }


    return inside;
}


/* =========================================================
   ★配置生成

   ★の内部まで写真で埋める。
========================================================= */

function generateStarLayout(photoCount) {

    const polygon =
        createStarPolygon();


    let bestPoints = [];
    let bestDifference = Infinity;
    let bestStep = 8;


    /*
       写真枚数に近くなる
       格子サイズを探す
    */

    for (
        let step = 12;
        step >= 2.2;
        step -= 0.12
    ) {

        const points = [];

        let row = 0;


        for (
            let y = step / 2;
            y < 100;
            y += step
        ) {

            /*
               1段ごとに半分ずらす
            */

            const offset =
                row % 2 === 0
                    ?
                    0
                    :
                    step / 2;


            for (
                let x =
                    step / 2
                    +
                    offset;

                x < 100;

                x += step
            ) {

                if (
                    pointInsidePolygon(
                        x,
                        y,
                        polygon
                    )
                ) {

                    points.push({
                        x: x,
                        y: y
                    });
                }
            }


            row++;
        }


        const difference =
            Math.abs(
                points.length
                -
                photoCount
            );


        if (
            difference
            <
            bestDifference
        ) {

            bestDifference =
                difference;

            bestPoints =
                points;

            bestStep =
                step;
        }
    }


    /*
       点が多い場合は
       ★全体から均等に選ぶ
    */

    if (
        bestPoints.length
        >
        photoCount
    ) {

        const selected = [];


        for (
            let i = 0;
            i < photoCount;
            i++
        ) {

            const index =
                Math.floor(
                    i
                    *
                    bestPoints.length
                    /
                    photoCount
                );


            selected.push(
                bestPoints[index]
            );
        }


        bestPoints =
            selected;
    }


    /*
       万が一足りない場合
       ★内部に追加
    */

    let safety = 0;


    while (
        bestPoints.length
        <
        photoCount
        &&
        safety
        <
        10000
    ) {

        safety++;


        const x =
            8
            +
            Math.random()
            *
            84;


        const y =
            5
            +
            Math.random()
            *
            90;


        if (
            pointInsidePolygon(
                x,
                y,
                polygon
            )
        ) {

            bestPoints.push({
                x: x,
                y: y
            });
        }
    }


    return {

        points:
            bestPoints.slice(
                0,
                photoCount
            ),

        size:
            bestStep
            *
            1.04
    };
}


/* =========================================================
   写真サイズ
========================================================= */

function getFinalePhotoDimensions(
    photoCount,
    baseSize
) {

    let width =
        baseSize;


    if (
        photoCount <= 35
    ) {

        width *= 1.08;
    }


    if (
        photoCount >= 120
    ) {

        width *= 0.92;
    }


    return {

        width:
            width,

        height:
            width
            *
            0.72
    };
}


/* =========================================================
   写真作成

   1枚の写真に

   ・散らばり位置
   ・♥位置
   ・★位置

   を全部持たせる
========================================================= */

function buildFinalePhotos(photos) {

    const stage =
        document.getElementById(
            "finalePhotoStage"
        );


    if (!stage) {
        return;
    }


    stage.innerHTML = "";


    const heartPoints =
        generateHeartLayout(
            photos.length
        );


    const starLayout =
        generateStarLayout(
            photos.length
        );


    const starPoints =
        starLayout.points;


    const dimensions =
        getFinalePhotoDimensions(
            photos.length,
            starLayout.size
        );


    photos.forEach(
        function (
            photoData,
            index
        ) {

            const heartPoint =
                heartPoints[index];


            const starPoint =
                starPoints[index];


            if (
                !heartPoint
                ||
                !starPoint
            ) {

                return;
            }


            const photo =
                document.createElement(
                    "img"
                );


            photo.className =
                "finale-photo";


            photo.alt = "";


            /* =============================================
               ♥位置
            ============================================= */

            photo.style.setProperty(
                "--heart-x",
                heartPoint.x + "%"
            );


            photo.style.setProperty(
                "--heart-y",
                heartPoint.y + "%"
            );


            /* =============================================
               ★位置
            ============================================= */

            photo.style.setProperty(
                "--star-x",
                starPoint.x + "%"
            );


            photo.style.setProperty(
                "--star-y",
                starPoint.y + "%"
            );


            /* =============================================
               写真サイズ

               サイズ差は少しだけにする。

               バラバラ感は残すが、
               ♥と★の形が崩れないようにする。
            ============================================= */

            const sizeVariation =
                0.94
                +
                Math.random()
                *
                0.10;


            photo.style.setProperty(
                "--photo-width",
                (
                    dimensions.width
                    *
                    sizeVariation
                )
                +
                "%"
            );


            photo.style.setProperty(
                "--photo-height",
                (
                    dimensions.height
                    *
                    sizeVariation
                )
                +
                "%"
            );


            /* =============================================
               最初の散らばり位置
            ============================================= */

            const startX =
                4
                +
                Math.random()
                *
                92;


            const startY =
                4
                +
                Math.random()
                *
                92;


            photo.style.setProperty(
                "--start-x",
                startX + "%"
            );


            photo.style.setProperty(
                "--start-y",
                startY + "%"
            );


            /* =============================================
               最初の傾き
            ============================================= */

            const rotation =
                -16
                +
                Math.random()
                *
                32;


            photo.style.setProperty(
                "--start-rotation",
                rotation + "deg"
            );


            /* =============================================
               ♥へ集まる時間差
            ============================================= */

            photo.style.setProperty(
                "--move-delay",
                (
                    Math.random()
                    *
                    0.55
                )
                +
                "s"
            );


            /* =============================================
               写真読み込み失敗時
            ============================================= */

            photo.addEventListener(
                "error",
                function () {

                    photo.remove();
                },
                {
                    once: true
                }
            );


            stage.appendChild(
                photo
            );


            photo.src =
                photoData.image_url;
        }
    );
}


/* =========================================================
   散らばった写真を表示
========================================================= */

function showScatteredPhotos() {

    const overlay =
        document.getElementById(
            "finaleOverlay"
        );


    if (!overlay) {
        return;
    }


    overlay.classList.add(
        "finale-scattered"
    );
}


/* =========================================================
   ♥へ集合
========================================================= */

function assemblePhotoHeart() {

    const overlay =
        document.getElementById(
            "finaleOverlay"
        );


    if (!overlay) {
        return;
    }


    overlay.classList.remove(
        "finale-star-assembled"
    );


    overlay.classList.add(
        "finale-heart-assembled"
    );
}


/* =========================================================
   ♥ → ★
========================================================= */

function transformHeartToStar() {

    const overlay =
        document.getElementById(
            "finaleOverlay"
        );


    if (!overlay) {
        return;
    }


    const photos =
        document.querySelectorAll(
            "#finalePhotoStage .finale-photo"
        );


    /*
       ♥から★への変形は
       ほぼ一斉に動かす。

       少しだけ時間差をつけて
       有機的な動きにする。
    */

    photos.forEach(
        function (photo) {

            photo.style.setProperty(
                "--move-delay",
                (
                    Math.random()
                    *
                    0.18
                )
                +
                "s"
            );
        }
    );


    overlay.classList.remove(
        "finale-heart-assembled"
    );


    overlay.classList.add(
        "finale-star-assembled"
    );
}
/* =========================================================
   ★を消す
========================================================= */

function hidePhotoStar() {

    const overlay =
        document.getElementById(
            "finaleOverlay"
        );

    if (!overlay) {
        return;
    }

    overlay.classList.add(
        "finale-star-fade"
    );
}


/* =========================================================
   THANK YOU
========================================================= */

function showFinaleThankYou() {

    hidePhotoStar();

    const thankYou =
        document.getElementById(
            "finaleThankYou"
        );

    addFinaleTimer(
        function () {

            if (thankYou) {

                thankYou.classList.add(
                    "show"
                );
            }

        },
        1300
    );
}


/* =========================================================
   SPECIAL THANKS
========================================================= */

function showFinaleSpecialThanks() {

    const thankYou =
        document.getElementById(
            "finaleThankYou"
        );

    const specialThanks =
        document.getElementById(
            "finaleSpecialThanks"
        );

    if (thankYou) {

        thankYou.classList.remove(
            "show"
        );
    }

    addFinaleTimer(
        function () {

            if (specialThanks) {

                specialThanks.classList.add(
                    "show"
                );
            }

        },
        1200
    );
}


/* =========================================================
   フィナーレ開始

   流れ

   ① 写真が散らばって出る
   ② ♥へ集合
   ③ ♥完成状態を見せる
   ④ 同じ写真が★へ変形
   ⑤ ★完成状態を見せる
   ⑥ THANK YOU
   ⑦ Special Thanks
========================================================= */

async function startWeddingFinale() {

    /*
       二重スタート防止
    */

    if (finaleRunning) {
        return;
    }


    finaleRunning = true;


    clearFinaleTimers();


    /*
       フィナーレ画面がなければ作成
    */

    createFinaleScreen();


    const overlay =
        document.getElementById(
            "finaleOverlay"
        );


    const thankYou =
        document.getElementById(
            "finaleThankYou"
        );


    const specialThanks =
        document.getElementById(
            "finaleSpecialThanks"
        );


    if (!overlay) {

        finaleRunning = false;

        return;
    }


    /* =====================================================
       前回の状態を完全リセット
    ===================================================== */

    overlay.classList.remove(
        "finale-active",
        "finale-scattered",
        "finale-heart-assembled",
        "finale-star-assembled",
        "finale-star-fade"
    );


    if (thankYou) {

        thankYou.classList.remove(
            "show"
        );
    }


    if (specialThanks) {

        specialThanks.classList.remove(
            "show"
        );
    }


    /* =====================================================
       Supabaseから写真取得
    ===================================================== */

    const photos =
        await getFinalePhotos();


    if (
        !photos
        ||
        photos.length === 0
    ) {

        console.error(
            "フィナーレ用写真がありません"
        );


        finaleRunning = false;

        return;
    }


    console.log(
        "Finale photos:",
        photos.length
    );


    /* =====================================================
       写真を作る

       この時点で各写真に

       ・散らばり位置
       ・♥位置
       ・★位置

       が設定される
    ===================================================== */

    buildFinalePhotos(
        photos
    );


    /* =====================================================
       通常画面をフィナーレ状態へ
    ===================================================== */

    document.body.classList.add(
        "finale-running"
    );


    overlay.style.display =
        "block";


    /*
       CSSを一度確実に読み直させる
    */

    void overlay.offsetWidth;


    overlay.classList.add(
        "finale-active"
    );


    /* =====================================================
       STEP 1

       写真が画面全体へ
       バラバラに現れる
    ===================================================== */

    addFinaleTimer(
        function () {

            showScatteredPhotos();

        },
        300
    );


    /* =====================================================
       STEP 2

       ♥へ集合開始
    ===================================================== */

    addFinaleTimer(
        function () {

            assemblePhotoHeart();

        },
        1800
    );


    /*
       CSS側で約3.6秒かけて移動。

       1.8秒で集合開始
            ↓
       約5.4秒で♥完成
            ↓
       約3秒間♥を見せる
    */


    /* =====================================================
       STEP 3

       ♥ → ★へ変形
    ===================================================== */

    addFinaleTimer(
        function () {

            transformHeartToStar();

        },
        8500
    );


    /*
       8.5秒で★への変形開始
            ↓
       約12.1秒で★完成

       ★完成後も約4秒見せる
    */


    /* =====================================================
       STEP 4

       ★を消して
       THANK YOU
    ===================================================== */

    addFinaleTimer(
        function () {

            showFinaleThankYou();

        },
        16500
    );


    /* =====================================================
       STEP 5

       Special Thanks
    ===================================================== */

    addFinaleTimer(
        function () {

            showFinaleSpecialThanks();

        },
        24500
    );
}


/* =========================================================
   フィナーレ停止

   通常の写真画面へ戻す
========================================================= */

function stopWeddingFinale() {

    /*
       予約中の演出を全部停止
    */

    clearFinaleTimers();


    const overlay =
        document.getElementById(
            "finaleOverlay"
        );


    if (overlay) {

        overlay.classList.remove(
            "finale-active",
            "finale-scattered",
            "finale-heart-assembled",
            "finale-star-assembled",
            "finale-star-fade"
        );


        overlay.style.display =
            "none";
    }


    /*
       フィナーレ写真を削除
    */

    const stage =
        document.getElementById(
            "finalePhotoStage"
        );


    if (stage) {

        stage.innerHTML =
            "";
    }


    /*
       THANK YOUリセット
    */

    const thankYou =
        document.getElementById(
            "finaleThankYou"
        );


    if (thankYou) {

        thankYou.classList.remove(
            "show"
        );
    }


    /*
       Special Thanksリセット
    */

    const specialThanks =
        document.getElementById(
            "finaleSpecialThanks"
        );


    if (specialThanks) {

        specialThanks.classList.remove(
            "show"
        );
    }


    /*
       通常画面を復活
    */

    document.body.classList.remove(
        "finale-running"
    );


    finaleRunning =
        false;
}


/* =========================================================
   SUPABASE REALTIME

   管理画面から

   finale_command = start

   が来たら開始。


   finale_command = stop

   が来たら通常画面へ戻る。
========================================================= */

function startFinaleRealtime() {

    finaleSupabase

        .channel(
            "wedding-finale-live"
        )

        .on(
            "postgres_changes",

            {

                event:
                    "UPDATE",

                schema:
                    "public",

                table:
                    "wedding_control",

                filter:
                    "id=eq.main"
            },

            function (payload) {

                const row =
                    payload.new;


                /*
                   データがない場合
                */

                if (
                    !row
                    ||
                    !row.finale_command
                ) {

                    return;
                }


                /*
                   同じイベントを
                   二重で処理しないためのキー
                */

                const key =
                    row.finale_command
                    +
                    "-"
                    +
                    (
                        row.updated_at
                        ||
                        ""
                    );


                if (
                    key
                    ===
                    lastFinaleCommand
                ) {

                    return;
                }


                lastFinaleCommand =
                    key;


                console.log(
                    "Finale command:",
                    row.finale_command
                );


                /* =========================================
                   フィナーレ開始
                ========================================= */

                if (
                    row.finale_command
                    ===
                    "start"
                ) {

                    startWeddingFinale();
                }


                /* =========================================
                   フィナーレ終了
                ========================================= */

                if (
                    row.finale_command
                    ===
                    "stop"
                ) {

                    stopWeddingFinale();
                }
            }
        )

        .subscribe(
            function (status) {

                console.log(
                    "Finale Realtime:",
                    status
                );
            }
        );
}


/* =========================================================
   ページ起動時
========================================================= */

document.addEventListener(
    "DOMContentLoaded",

    function () {

        /*
           フィナーレ画面を準備
        */

        createFinaleScreen();


        /*
           管理画面からの
           start / stop を監視
        */

        startFinaleRealtime();
    }
);


/* =========================================================
   ローカル確認用

   ブラウザConsoleで

   startWeddingFinale()

   と入力するとフィナーレ開始。


   戻す場合は

   stopWeddingFinale()

========================================================= */