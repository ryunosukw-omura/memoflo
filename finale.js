/* =========================================================
   PHOTO SHUSHU
   Wedding Finale
   写真集合 → ハート → 星 → THANK YOU → Special Thanks
========================================================= */


/* =========================================================
   Supabase
========================================================= */

const FINALE_SUPABASE_URL =
    "https://tnqnowlvtnrzrcydcsmi.supabase.co";


/*
   ★あとでここだけ変更します★

   script.js で現在使っている
   Publishable key と同じものを入れます。

   今はこのままでOKです。
*/
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

const FINALE_MAX_PHOTOS =
    200;


let finaleRunning =
    false;


let lastFinaleCommand =
    "";


let finaleTimers =
    [];



/* =========================================================
   タイマー
========================================================= */

function addFinaleTimer(
    callback,
    delay
) {

    const timer =
        setTimeout(
            callback,
            delay
        );


    finaleTimers.push(
        timer
    );
}


function clearFinaleTimers() {

    finaleTimers.forEach(
        timer => {

            clearTimeout(
                timer
            );
        }
    );


    finaleTimers =
        [];
}



/* =========================================================
   フィナーレ画面を作る
========================================================= */

function createFinaleScreen() {

    if (
        document.getElementById(
            "finaleOverlay"
        )
    ) {

        return;
    }


    const overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        "finaleOverlay";


    overlay.innerHTML = `

        <div
            class="finale-glow"
        ></div>


        <div
            id="finalePhotoStage"
        ></div>


        <div
            id="finaleThankYou"
            class="finale-message"
        >

            <div
                class="finale-thankyou-main"
            >
                THANK YOU
            </div>


            <div
                class="finale-thankyou-names"
            >
                RYUNOSUKE &amp; MAKOTO
            </div>


            <div
                class="finale-divider"
            ></div>


            <div
                class="finale-thankyou-date"
            >
                2027.02.22
            </div>

        </div>


        <div
            id="finaleSpecialThanks"
            class="finale-message"
        >

            <div
                class="finale-special-title"
            >
                Special Thanks
            </div>


            <div
                class="finale-special-text"
            >
                みなさまの素敵な写真が<br>
                最高の思い出になりました<br>
                本当にありがとうございました
            </div>


            <div
                class="finale-divider"
            ></div>

        </div>

    `;


    document.body.appendChild(
        overlay
    );


    createFinaleSparkles();
}



/* =========================================================
   星のキラキラ
========================================================= */

function createFinaleSparkles() {

    const overlay =
        document.getElementById(
            "finaleOverlay"
        );


    if (
        !overlay
    ) {

        return;
    }


    for (
        let i = 0;
        i < 45;
        i++
    ) {

        const sparkle =
            document.createElement(
                "div"
            );


        sparkle.className =
            "finale-sparkle";


        sparkle.style.setProperty(
            "--sl",
            (
                3
                +
                Math.random()
                *
                94
            )
            +
            "%"
        );


        sparkle.style.setProperty(
            "--st",
            (
                4
                +
                Math.random()
                *
                92
            )
            +
            "%"
        );


        sparkle.style.setProperty(
            "--ss",
            (
                3
                +
                Math.random()
                *
                6
            )
            +
            "px"
        );


        sparkle.style.setProperty(
            "--sd",
            (
                1.8
                +
                Math.random()
                *
                2.8
            )
            +
            "s"
        );


        sparkle.style.setProperty(
            "--sdelay",
            (
                Math.random()
                *
                3
            )
            +
            "s"
        );


        overlay.appendChild(
            sparkle
        );
    }
}



/* =========================================================
   Supabaseからフィナーレ用写真取得
========================================================= */

async function getFinalePhotos() {

    const {
        data,
        error
    } =
        await finaleSupabase

            .from(
                "photos"
            )

            .select(
                "id, image_url, created_at"
            )

            .order(
                "created_at",
                {
                    ascending:
                        false
                }
            )

            .limit(
                FINALE_MAX_PHOTOS
            );


    if (
        error
    ) {

        console.error(
            "Finale photo load error:",
            error
        );


        return [];
    }


    return (
        data
        ||
        []
    ).reverse();
}



/* =========================================================
   写真サイズ
========================================================= */

function getFinalePhotoSize(
    count
) {

    let width;


    if (
        count <= 30
    ) {

        width =
            Math.min(
                92,
                window.innerWidth
                *
                0.085
            );
    }

    else if (
        count <= 70
    ) {

        width =
            Math.min(
                76,
                window.innerWidth
                *
                0.065
            );
    }

    else if (
        count <= 120
    ) {

        width =
            Math.min(
                62,
                window.innerWidth
                *
                0.052
            );
    }

    else {

        width =
            Math.min(
                52,
                window.innerWidth
                *
                0.043
            );
    }


    width =
        Math.max(
            width,
            28
        );


    return {

        width:
            width,

        height:
            width
            *
            0.74
    };
}



/* =========================================================
   ハート座標
========================================================= */

function createHeartPoint(
    angle,
    ratio
) {

    const x =
        16
        *
        Math.pow(
            Math.sin(
                angle
            ),
            3
        );


    const y =
        13
        *
        Math.cos(
            angle
        )

        -

        5
        *
        Math.cos(
            2
            *
            angle
        )

        -

        2
        *
        Math.cos(
            3
            *
            angle
        )

        -

        Math.cos(
            4
            *
            angle
        );


    return {

        x:
            50
            +
            x
            *
            1.35
            *
            ratio,

        y:
            52
            -
            y
            *
            1.22
            *
            ratio
    };
}


function getHeartPoints(
    count
) {

    const points =
        [];


    const rings =
        Math.max(
            4,
            Math.ceil(
                Math.sqrt(
                    count
                )
                /
                1.5
            )
        );


    for (
        let ring = rings;
        ring >= 1;
        ring--
    ) {

        if (
            points.length
            >=
            count
        ) {

            break;
        }


        const ratio =
            ring
            /
            rings;


        const ringCount =
            Math.max(
                5,
                Math.ceil(
                    count
                    /
                    rings
                )
            );


        for (
            let i = 0;
            i < ringCount;
            i++
        ) {

            if (
                points.length
                >=
                count
            ) {

                break;
            }


            const angle =
                Math.PI
                *
                2
                *
                i
                /
                ringCount;


            points.push(
                createHeartPoint(
                    angle,
                    ratio
                )
            );
        }
    }


    while (
        points.length
        <
        count
    ) {

        points.push(
            {

                x:
                    50
                    +
                    (
                        Math.random()
                        -
                        0.5
                    )
                    *
                    16,

                y:
                    53
                    +
                    (
                        Math.random()
                        -
                        0.5
                    )
                    *
                    14
            }
        );
    }


    return points;
}



/* =========================================================
   星の座標
========================================================= */

function createStarVertices() {

    const vertices =
        [];


    for (
        let i = 0;
        i < 10;
        i++
    ) {

        const angle =
            -Math.PI
            /
            2

            +

            i
            *
            Math.PI
            /
            5;


        const radius =
            i % 2 === 0
            ?
            1
            :
            0.43;


        vertices.push(
            {

                x:
                    50
                    +
                    Math.cos(
                        angle
                    )
                    *
                    32
                    *
                    radius,

                y:
                    52
                    +
                    Math.sin(
                        angle
                    )
                    *
                    34
                    *
                    radius
            }
        );
    }


    return vertices;
}


function getStarPoints(
    count
) {

    const vertices =
        createStarVertices();


    const points =
        [];


    const outlineCount =
        Math.min(
            count,
            Math.max(
                20,
                Math.round(
                    count
                    *
                    0.58
                )
            )
        );


    for (
        let i = 0;
        i < outlineCount;
        i++
    ) {

        const position =
            i
            /
            outlineCount
            *
            10;


        const segment =
            Math.floor(
                position
            )
            %
            10;


        const progress =
            position
            -
            Math.floor(
                position
            );


        const start =
            vertices[
                segment
            ];


        const end =
            vertices[
                (
                    segment
                    +
                    1
                )
                %
                10
            ];


        points.push(
            {

                x:
                    start.x
                    +
                    (
                        end.x
                        -
                        start.x
                    )
                    *
                    progress,

                y:
                    start.y
                    +
                    (
                        end.y
                        -
                        start.y
                    )
                    *
                    progress
            }
        );
    }


    while (
        points.length
        <
        count
    ) {

        const source =
            points[
                Math.floor(
                    Math.random()
                    *
                    Math.max(
                        1,
                        points.length
                    )
                )
            ]

            ||

            {
                x:
                    50,

                y:
                    52
            };


        const shrink =
            0.25
            +
            Math.random()
            *
            0.68;


        points.push(
            {

                x:
                    50
                    +
                    (
                        source.x
                        -
                        50
                    )
                    *
                    shrink,

                y:
                    52
                    +
                    (
                        source.y
                        -
                        52
                    )
                    *
                    shrink
            }
        );
    }


    return points;
}



/* =========================================================
   写真を作る
========================================================= */

function buildFinalePhotos(
    photos
) {

    const stage =
        document.getElementById(
            "finalePhotoStage"
        );


    stage.innerHTML =
        "";


    const heartPoints =
        getHeartPoints(
            photos.length
        );


    const starPoints =
        getStarPoints(
            photos.length
        );


    const size =
        getFinalePhotoSize(
            photos.length
        );


    photos.forEach(
        function (
            photoData,
            index
        ) {

            const photo =
                document.createElement(
                    "img"
                );


            photo.className =
                "finale-photo";


            photo.alt =
                "";


            photo.style.setProperty(
                "--pw",
                size.width
                +
                "px"
            );


            photo.style.setProperty(
                "--ph",
                size.height
                +
                "px"
            );


            photo.style.setProperty(
                "--gx",
                (
                    Math.random()
                    *
                    180
                    -
                    90
                )
                +
                "px"
            );


            photo.style.setProperty(
                "--gy",
                (
                    Math.random()
                    *
                    150
                    -
                    75
                )
                +
                "px"
            );


            photo.style.setProperty(
                "--gr",
                (
                    Math.random()
                    *
                    30
                    -
                    15
                )
                +
                "deg"
            );


            photo.style.setProperty(
                "--hx",
                heartPoints[
                    index
                ].x
                +
                "%"
            );


            photo.style.setProperty(
                "--hy",
                heartPoints[
                    index
                ].y
                +
                "%"
            );


            photo.style.setProperty(
                "--sx",
                starPoints[
                    index
                ].x
                +
                "%"
            );


            photo.style.setProperty(
                "--sy",
                starPoints[
                    index
                ].y
                +
                "%"
            );


            photo.addEventListener(
                "load",
                function () {

                    setTimeout(
                        function () {

                            photo.classList.add(
                                "visible"
                            );

                        },
                        index
                        *
                        10
                    );
                },
                {
                    once:
                        true
                }
            );


            photo.addEventListener(
                "error",
                function () {

                    photo.remove();
                },
                {
                    once:
                        true
                }
            );


            stage.appendChild(
                photo
            );


            photo.src =
                photoData.image_url;


            if (
                photo.complete
                &&
                photo.naturalWidth
                >
                0
            ) {

                setTimeout(
                    function () {

                        photo.classList.add(
                            "visible"
                        );

                    },
                    index
                    *
                    10
                );
            }
        }
    );
}



/* =========================================================
   フィナーレ段階切替
========================================================= */

function setFinalePhase(
    phase
) {

    const overlay =
        document.getElementById(
            "finaleOverlay"
        );


    overlay.classList.remove(
        "finale-gather",
        "finale-heart",
        "finale-star"
    );


    if (
        phase
    ) {

        overlay.classList.add(
            phase
        );
    }
}



/* =========================================================
   写真を消す
========================================================= */

function fadeFinalePhotos() {

    document
        .querySelectorAll(
            ".finale-photo"
        )
        .forEach(
            function (
                photo
            ) {

                photo.classList.add(
                    "fade"
                );
            }
        );
}



/* =========================================================
   THANK YOU
========================================================= */

function showFinaleThankYou() {

    fadeFinalePhotos();


    document
        .getElementById(
            "finaleThankYou"
        )
        .classList.add(
            "show"
        );
}



/* =========================================================
   Special Thanks
========================================================= */

function showFinaleSpecialThanks() {

    document
        .getElementById(
            "finaleThankYou"
        )
        .classList.remove(
            "show"
        );


    addFinaleTimer(
        function () {

            document
                .getElementById(
                    "finaleSpecialThanks"
                )
                .classList.add(
                    "show"
                );

        },
        1200
    );
}



/* =========================================================
   フィナーレ開始
========================================================= */

async function startWeddingFinale() {

    if (
        finaleRunning
    ) {

        return;
    }


    finaleRunning =
        true;


    clearFinaleTimers();


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


    thankYou.classList.remove(
        "show"
    );


    specialThanks.classList.remove(
        "show"
    );


    const photos =
        await getFinalePhotos();


    if (
        photos.length
        ===
        0
    ) {

        console.error(
            "フィナーレ用写真がありません"
        );


        finaleRunning =
            false;


        return;
    }


    buildFinalePhotos(
        photos
    );


    document.body.classList.add(
        "finale-running"
    );


    overlay.style.display =
        "block";


    void overlay.offsetWidth;


    overlay.classList.add(
        "finale-active"
    );


    /* 中央へ集合 */

    addFinaleTimer(
        function () {

            setFinalePhase(
                "finale-gather"
            );

        },
        250
    );


    /* ハート */

    addFinaleTimer(
        function () {

            setFinalePhase(
                "finale-heart"
            );

        },
        4000
    );


    /* 星 */

    addFinaleTimer(
        function () {

            setFinalePhase(
                "finale-star"
            );

        },
        11000
    );


    /* THANK YOU */

    addFinaleTimer(
        function () {

            showFinaleThankYou();

        },
        18000
    );


    /* Special Thanks */

    addFinaleTimer(
        function () {

            showFinaleSpecialThanks();

        },
        25000
    );
}



/* =========================================================
   通常画面へ戻す
========================================================= */

function stopWeddingFinale() {

    clearFinaleTimers();


    const overlay =
        document.getElementById(
            "finaleOverlay"
        );


    if (
        overlay
    ) {

        overlay.classList.remove(
            "finale-active",
            "finale-gather",
            "finale-heart",
            "finale-star"
        );


        overlay.style.display =
            "none";


        const stage =
            document.getElementById(
                "finalePhotoStage"
            );


        if (
            stage
        ) {

            stage.innerHTML =
                "";
        }
    }


    document.body.classList.remove(
        "finale-running"
    );


    finaleRunning =
        false;
}



/* =========================================================
   Supabase Realtime
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

            function (
                payload
            ) {

                const row =
                    payload.new;


                if (
                    !row
                    ||
                    !row.finale_command
                ) {

                    return;
                }


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


                if (
                    row.finale_command
                    ===
                    "start"
                ) {

                    startWeddingFinale();
                }


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
            function (
                status
            ) {

                console.log(
                    "Finale Realtime:",
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
    function () {

        createFinaleScreen();

        startFinaleRealtime();
    }
);


/*
   後でローカルテストするときは
   Consoleで

   startWeddingFinale()

   と入力すると開始できます。

   戻す場合は

   stopWeddingFinale()
*/