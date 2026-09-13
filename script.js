// ========================================
// PHOTO SHUSHU
// Wedding Photo Wall
//
// 本番安定版
// ・Supabaseには全写真を保存
// ・スクリーン表示は最新200枚まで
// ・新着写真は中央表示後、流れに合流
// ・左 → 右へゆっくり流れる
// ========================================


// ========================================
// 1. Supabase設定
// ========================================

const SUPABASE_URL =
    "https://tnqnowlvtnrzrcydcsmi.supabase.co";


const SUPABASE_ANON_KEY =
    "sb_publishable_Mp7PsY2wh5VZtEDYC9fHrg_wvFDa8rO";



// ========================================
// 2. Supabase接続
// ========================================

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


const photoWall =
    document.getElementById(
        "photoWall"
    );



// ========================================
// 3. 本番用設定
// ========================================

// 写真が画面を横切る時間
const FLOW_DURATION =
    31;


// 会場スクリーンに残す最大枚数
// Supabase内の写真は削除されません
const MAX_DISPLAY_PHOTOS =
    200;


// 写真レーン
// 上側はタイトル用に空ける
const PHOTO_LANES = [
    34,
    46,
    58,
    70
];


let lastLaneIndex =
    -1;



// ========================================
// 4. 表示中の写真を管理
// ========================================

const displayedPhotos =
    [];



// ========================================
// 5. 新着写真キュー
// ========================================

let newPhotoQueue =
    [];


let isSpecialPhotoPlaying =
    false;



// ========================================
// レーン選択
// ========================================

function getNextLane() {

    let laneIndex;


    do {

        laneIndex =
            Math.floor(
                Math.random()
                *
                PHOTO_LANES.length
            );

    }
    while (
        laneIndex ===
        lastLaneIndex
    );


    lastLaneIndex =
        laneIndex;


    return PHOTO_LANES[
        laneIndex
    ];
}



// ========================================
// エラー表示
// ========================================

function showError(
    message
) {

    console.error(
        message
    );


    let errorBox =
        document.getElementById(
            "photoError"
        );


    if (
        !errorBox
    ) {

        errorBox =
            document.createElement(
                "div"
            );


        errorBox.id =
            "photoError";


        errorBox.style.position =
            "fixed";

        errorBox.style.left =
            "15px";

        errorBox.style.bottom =
            "15px";

        errorBox.style.padding =
            "10px 14px";

        errorBox.style.background =
            "rgba(0,0,0,0.75)";

        errorBox.style.color =
            "white";

        errorBox.style.fontSize =
            "13px";

        errorBox.style.zIndex =
            "99999";

        errorBox.style.borderRadius =
            "6px";


        document.body.appendChild(
            errorBox
        );
    }


    errorBox.textContent =
        message;
}



// ========================================
// 写真の縦横比
// ========================================

function getPhotoRatio(
    photo
) {

    if (
        photo.naturalWidth > 0
        &&
        photo.naturalHeight > 0
    ) {

        return (
            photo.naturalWidth
            /
            photo.naturalHeight
        );
    }


    return 1.4;
}



// ========================================
// 通常写真サイズ
// ========================================

function setNormalPhotoSize(
    photo
) {

    const ratio =
        getPhotoRatio(
            photo
        );


    photo.style.objectFit =
        "contain";


    // 縦写真
    if (
        ratio < 0.9
    ) {

        const height =
            190
            +
            Math.random()
            *
            50;


        const width =
            height
            *
            ratio;


        photo.style.width =
            width
            +
            "px";


        photo.style.height =
            height
            +
            "px";


        return;
    }


    // 正方形に近い写真
    if (
        ratio < 1.15
    ) {

        const size =
            175
            +
            Math.random()
            *
            50;


        photo.style.width =
            size
            +
            "px";


        photo.style.height =
            (
                size
                /
                ratio
            )
            +
            "px";


        return;
    }


    // 横写真
    const width =
        140
        +
        Math.random()
        *
        80;


    photo.style.width =
        width
        +
        "px";


    photo.style.height =
        (
            width
            /
            ratio
        )
        +
        "px";
}



// ========================================
// 新着写真サイズ
// ========================================

function setSpecialPhotoSize(
    photo
) {

    const ratio =
        getPhotoRatio(
            photo
        );


    const maxWidth =
        Math.min(
            window.innerWidth
            *
            0.46,
            460
        );


    const maxHeight =
        Math.min(
            window.innerHeight
            *
            0.55,
            560
        );


    let width =
        maxWidth;


    let height =
        width
        /
        ratio;


    if (
        height >
        maxHeight
    ) {

        height =
            maxHeight;


        width =
            height
            *
            ratio;
    }


    photo.style.width =
        width
        +
        "px";


    photo.style.height =
        height
        +
        "px";


    photo.style.objectFit =
        "contain";
}



// ========================================
// 表示枚数を200枚以内に保つ
// ========================================

function trimDisplayedPhotos() {

    while (
        displayedPhotos.length >
        MAX_DISPLAY_PHOTOS
    ) {

        const oldestPhoto =
            displayedPhotos.shift();


        if (
            oldestPhoto
            &&
            oldestPhoto.isConnected
        ) {

            oldestPhoto.remove();
        }
    }
}



// ========================================
// 通常写真を登録
// ========================================

function registerDisplayedPhoto(
    photo
) {

    if (
        displayedPhotos.includes(
            photo
        )
    ) {

        return;
    }


    displayedPhotos.push(
        photo
    );


    trimDisplayedPhotos();
}



// ========================================
// 通常写真を作る
// ========================================

function createNormalPhoto(
    imageURL,
    startDelay = 0
) {

    const photo =
        document.createElement(
            "img"
        );


    photo.classList.add(
        "photo"
    );


    photo.style.top =
        getNextLane()
        +
        "%";


    photo.style.left =
        "-300px";


    const rotation =
        Math.random()
        *
        16
        -
        8;


    photo.style.setProperty(
        "--rotation",
        rotation
        +
        "deg"
    );


    const duration =
        FLOW_DURATION
        +
        Math.random()
        *
        4
        -
        2;


    photo.style.setProperty(
        "--flow-duration",
        duration
        +
        "s"
    );


    photo.style.animationDelay =
        "-"
        +
        startDelay
        +
        "s";


    let started =
        false;


    function preparePhoto() {

        if (
            started
        ) {

            return;
        }


        started =
            true;


        setNormalPhotoSize(
            photo
        );


        registerDisplayedPhoto(
            photo
        );


        startFlow(
            photo
        );
    }


    photo.addEventListener(
        "load",
        preparePhoto,
        {
            once: true
        }
    );


    photo.addEventListener(
        "error",
        function () {

            console.error(
                "画像読み込み失敗:",
                imageURL
            );


            photo.remove();

        },
        {
            once: true
        }
    );


    photoWall.appendChild(
        photo
    );


    photo.src =
        imageURL;


    if (
        photo.complete
        &&
        photo.naturalWidth > 0
    ) {

        preparePhoto();
    }
}



// ========================================
// 写真を流す
// ========================================

function startFlow(
    photo
) {

    if (
        !photo.isConnected
    ) {

        return;
    }


    photo.classList.remove(
        "photo-flow"
    );


    void photo.offsetWidth;


    photo.classList.add(
        "photo-flow"
    );
}



// ========================================
// 写真の周回
// ========================================

photoWall.addEventListener(
    "animationend",
    function (
        event
    ) {

        const photo =
            event.target;


        if (
            !photo.classList.contains(
                "photo-flow"
            )
        ) {

            return;
        }


        // すでに200枚制限で削除済みなら終了
        if (
            !photo.isConnected
        ) {

            return;
        }


        photo.classList.remove(
            "photo-flow"
        );


        photo.style.animationDelay =
            "0s";


        photo.style.left =
            "-300px";


        photo.style.top =
            getNextLane()
            +
            "%";


        const rotation =
            Math.random()
            *
            16
            -
            8;


        photo.style.setProperty(
            "--rotation",
            rotation
            +
            "deg"
        );


        const duration =
            FLOW_DURATION
            +
            Math.random()
            *
            4
            -
            2;


        photo.style.setProperty(
            "--flow-duration",
            duration
            +
            "s"
        );


        requestAnimationFrame(
            function () {

                requestAnimationFrame(
                    function () {

                        startFlow(
                            photo
                        );

                    }
                );

            }
        );
    }
);



// ========================================
// 新着写真を大きく表示
// ========================================

function createSpecialPhoto(
    imageURL
) {

    const photo =
        document.createElement(
            "img"
        );


    photo.classList.add(
        "photo",
        "new-photo"
    );


    photo.style.left =
        "50%";


    photo.style.top =
        "58%";


    let handled =
        false;


    function prepareSpecialPhoto() {

        if (
            handled
        ) {

            return;
        }


        handled =
            true;


        setSpecialPhotoSize(
            photo
        );


        createSparkles();


        setTimeout(
            function () {

                changeSpecialToNormal(
                    photo
                );

            },
            3800
        );
    }


    photo.addEventListener(
        "load",
        prepareSpecialPhoto,
        {
            once: true
        }
    );


    photo.addEventListener(
        "error",
        function () {

            console.error(
                "新着写真読み込み失敗:",
                imageURL
            );


            photo.remove();


            isSpecialPhotoPlaying =
                false;


            playNextQueuedPhoto();

        },
        {
            once: true
        }
    );


    photoWall.appendChild(
        photo
    );


    photo.src =
        imageURL;


    if (
        photo.complete
        &&
        photo.naturalWidth > 0
    ) {

        prepareSpecialPhoto();
    }
}



// ========================================
// 新着写真 → 通常写真
// ========================================

function changeSpecialToNormal(
    photo
) {

    if (
        !photo.isConnected
    ) {

        isSpecialPhotoPlaying =
            false;


        playNextQueuedPhoto();


        return;
    }


    photo.classList.remove(
        "new-photo"
    );


    photo.classList.remove(
        "photo-flow"
    );


    setNormalPhotoSize(
        photo
    );


    photo.style.top =
        getNextLane()
        +
        "%";


    photo.style.left =
        "-300px";


    const rotation =
        Math.random()
        *
        16
        -
        8;


    photo.style.setProperty(
        "--rotation",
        rotation
        +
        "deg"
    );


    const duration =
        FLOW_DURATION
        +
        Math.random()
        *
        4
        -
        2;


    photo.style.setProperty(
        "--flow-duration",
        duration
        +
        "s"
    );


    photo.style.animation =
        "";


    photo.style.animationDelay =
        "0s";


    registerDisplayedPhoto(
        photo
    );


    isSpecialPhotoPlaying =
        false;


    requestAnimationFrame(
        function () {

            startFlow(
                photo
            );

        }
    );


    playNextQueuedPhoto();
}



// ========================================
// キラキラ
// ========================================

function createSparkles() {

    for (
        let i = 0;
        i < 18;
        i++
    ) {

        const sparkle =
            document.createElement(
                "div"
            );


        sparkle.classList.add(
            "photo-sparkle"
        );


        sparkle.style.left =
            (
                50
                +
                Math.random()
                *
                35
                -
                17.5
            )
            +
            "%";


        sparkle.style.top =
            (
                58
                +
                Math.random()
                *
                25
                -
                12.5
            )
            +
            "%";


        sparkle.style.setProperty(
            "--sparkle-x",
            (
                Math.random()
                *
                300
                -
                150
            )
            +
            "px"
        );


        sparkle.style.setProperty(
            "--sparkle-y",
            (
                Math.random()
                *
                300
                -
                150
            )
            +
            "px"
        );


        const size =
            Math.random()
            *
            7
            +
            4;


        sparkle.style.width =
            size
            +
            "px";


        sparkle.style.height =
            size
            +
            "px";


        photoWall.appendChild(
            sparkle
        );


        setTimeout(
            function () {

                sparkle.remove();

            },
            1200
        );
    }
}



// ========================================
// 新着写真を待機列へ
// ========================================

function queueNewPhoto(
    imageURL
) {

    if (
        !imageURL
    ) {

        return;
    }


    newPhotoQueue.push(
        imageURL
    );


    playNextQueuedPhoto();
}



// ========================================
// 次の新着写真
// ========================================

function playNextQueuedPhoto() {

    if (
        isSpecialPhotoPlaying
    ) {

        return;
    }


    if (
        newPhotoQueue.length ===
        0
    ) {

        return;
    }


    isSpecialPhotoPlaying =
        true;


    const imageURL =
        newPhotoQueue.shift();


    createSpecialPhoto(
        imageURL
    );
}



// ========================================
// 既存写真取得
//
// DBには全部残す
// スクリーンは最新200枚だけ取得
// ========================================

async function loadExistingPhotos() {

    console.log(
        "最新"
        +
        MAX_DISPLAY_PHOTOS
        +
        "枚まで取得します..."
    );


    const {
        data,
        error
    } =
        await supabaseClient
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
                MAX_DISPLAY_PHOTOS
            );


    if (
        error
    ) {

        console.error(
            "Supabase写真取得エラー:",
            error
        );


        showError(
            "写真取得エラー：Supabase接続を確認してください"
        );


        return;
    }


    if (
        !data
        ||
        data.length === 0
    ) {

        console.log(
            "まだ写真はありません"
        );


        return;
    }


    // Supabaseからは新しい順で取得
    // 表示開始時は古い → 新しい順に戻す
    const photos =
        [...data].reverse();


    console.log(
        photos.length
        +
        "枚をスクリーンに表示します"
    );


    const total =
        photos.length;


    photos.forEach(
        function (
            item,
            index
        ) {

            const startDelay =
                (
                    FLOW_DURATION
                    /
                    total
                )
                *
                index;


            createNormalPhoto(
                item.image_url,
                startDelay
            );

        }
    );
}



// ========================================
// Realtime
// 新しく投稿された写真だけ受け取る
// ========================================

function subscribeToNewPhotos() {

    console.log(
        "Realtime監視開始"
    );


    supabaseClient
        .channel(
            "wedding-photo-wall"
        )
        .on(
            "postgres_changes",
            {
                event:
                    "INSERT",

                schema:
                    "public",

                table:
                    "photos"
            },
            function (
                payload
            ) {

                if (
                    payload.new
                    &&
                    payload.new.image_url
                ) {

                    console.log(
                        "新着写真を受信"
                    );


                    queueNewPhoto(
                        payload
                            .new
                            .image_url
                    );
                }

            }
        )
        .subscribe(
            function (
                status
            ) {

                console.log(
                    "Realtime:",
                    status
                );

            }
        );
}



// ========================================
// 開始
// ========================================

async function startPhotoWall() {

    if (
        !window.supabase
    ) {

        showError(
            "Supabaseライブラリを読み込めませんでした"
        );


        return;
    }


    await loadExistingPhotos();


    subscribeToNewPhotos();
}


startPhotoWall();
