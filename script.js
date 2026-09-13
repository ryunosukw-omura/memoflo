// ========================================
// PHOTO SHUSHU
// Wedding Photo Wall
// 左 → 右
// 最新200枚
// 新着演出
// 削除リアルタイム対応版
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
// 3. 基本設定
// ========================================

// 写真が画面を横切る秒数
const FLOW_DURATION =
    31;


// 会場画面に保持する最大枚数
const MAX_DISPLAY_PHOTOS =
    200;


// 写真を流す高さ
const PHOTO_LANES = [
    34,
    46,
    58,
    70
];


let lastLaneIndex =
    -1;



// ========================================
// 4. 表示中写真
// ========================================

// 古い → 新しい順で保持
let displayedPhotos =
    [];



// ========================================
// 5. 新着写真
// ========================================

let newPhotoQueue =
    [];


let isSpecialPhotoPlaying =
    false;


let currentSpecialPhotoId =
    null;



// ========================================
// 6. レーンを選ぶ
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
        laneIndex
        ===
        lastLaneIndex
        &&
        PHOTO_LANES.length > 1
    );


    lastLaneIndex =
        laneIndex;


    return PHOTO_LANES[
        laneIndex
    ];
}



// ========================================
// 7. エラー表示
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
// 8. 表示中写真として登録
// ========================================

function registerDisplayedPhoto(
    photoData
) {


    if (
        !photoData
        ||
        !photoData.id
    ) {

        return;
    }


    const alreadyExists =
        displayedPhotos.some(
            item =>
                item.id
                ===
                photoData.id
        );


    if (
        alreadyExists
    ) {

        return;
    }


    displayedPhotos.push(
        {
            id:
                photoData.id,

            image_url:
                photoData.image_url
        }
    );


    trimDisplayedPhotos();
}



// ========================================
// 9. 200枚を超えた古い写真を外す
// ========================================

function trimDisplayedPhotos() {


    while (
        displayedPhotos.length
        >
        MAX_DISPLAY_PHOTOS
    ) {


        const oldest =
            displayedPhotos.shift();


        if (
            !oldest
        ) {

            continue;
        }


        removePhotoElementsById(
            oldest.id
        );
    }
}



// ========================================
// 10. IDから写真DOMを探して消す
// ========================================

function removePhotoElementsById(
    photoId
) {


    if (
        !photoId
    ) {

        return;
    }


    const elements =
        document.querySelectorAll(
            '.photo[data-photo-id="'
            +
            CSS.escape(
                String(
                    photoId
                )
            )
            +
            '"]'
        );


    elements.forEach(
        element => {

            element.remove();
        }
    );
}



// ========================================
// 11. 通常写真を作成
// ========================================

function createNormalPhoto(
    photoData,
    startDelay = 0
) {


    if (
        !photoData
        ||
        !photoData.image_url
    ) {

        return;
    }


    const photo =
        document.createElement(
            "img"
        );


    photo.classList.add(
        "photo"
    );


    // 削除時に写真を特定するID
    if (
        photoData.id
    ) {

        photo.dataset.photoId =
            photoData.id;
    }



    // ========================================
    // 写真サイズ
    // ========================================

    const width =
        Math.random()
        *
        80
        +
        140;


    const height =
        width
        *
        0.72;


    photo.style.width =
        width
        +
        "px";


    photo.style.height =
        height
        +
        "px";



    // ========================================
    // 縦位置
    // ========================================

    photo.style.top =
        getNextLane()
        +
        "%";


    photo.style.left =
        "-300px";



    // ========================================
    // 傾き
    // ========================================

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



    // ========================================
    // 写真ごとの速度
    // ========================================

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



    // ========================================
    // 最初だけ途中から開始
    // ========================================

    photo.style.animationDelay =
        "-"
        +
        startDelay
        +
        "s";



    // ========================================
    // 読み込み成功
    // ========================================

    let started =
        false;


    function startOnce() {


        if (
            started
        ) {

            return;
        }


        started =
            true;


        startFlow(
            photo
        );
    }


    photo.addEventListener(
        "load",
        startOnce,
        {
            once:
                true
        }
    );



    // ========================================
    // 読み込み失敗
    // ========================================

    photo.addEventListener(
        "error",
        function () {


            console.error(
                "画像読み込み失敗:",
                photoData.image_url
            );


            photo.remove();

        },
        {
            once:
                true
        }
    );



    photoWall.appendChild(
        photo
    );


    photo.src =
        photoData.image_url;



    // キャッシュ済み対策
    if (
        photo.complete
        &&
        photo.naturalWidth
        >
        0
    ) {

        startOnce();
    }
}



// ========================================
// 12. 写真を流す
// ========================================

function startFlow(
    photo
) {


    if (
        !photo
        ||
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
// 13. 通常写真の周回
// ========================================

photoWall.addEventListener(
    "animationend",
    function (
        event
    ) {


        const photo =
            event.target;


        if (
            !photo.classList
                .contains(
                    "photo-flow"
                )
        ) {

            return;
        }


        if (
            !photo.isConnected
        ) {

            return;
        }



        // クラスを一度解除
        photo.classList.remove(
            "photo-flow"
        );


        // 2周目以降は待ち時間なし
        photo.style.animationDelay =
            "0s";


        // 左画面外へ戻す
        photo.style.left =
            "-300px";


        // レーンを変更
        photo.style.top =
            getNextLane()
            +
            "%";


        // 傾きを変更
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


        // 速度を少し変更
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
// 14. 新着写真を中央表示
// ========================================

function createSpecialPhoto(
    photoData
) {


    if (
        !photoData
        ||
        !photoData.image_url
    ) {


        isSpecialPhotoPlaying =
            false;


        currentSpecialPhotoId =
            null;


        playNextQueuedPhoto();


        return;
    }


    const photo =
        document.createElement(
            "img"
        );


    photo.classList.add(
        "photo",
        "new-photo"
    );


    if (
        photoData.id
    ) {

        photo.dataset.photoId =
            photoData.id;
    }


    currentSpecialPhotoId =
        photoData.id
        ||
        null;



    // ========================================
    // 新着写真最大サイズ
    // ========================================

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


    photo.style.maxWidth =
        maxWidth
        +
        "px";


    photo.style.maxHeight =
        maxHeight
        +
        "px";


    photo.style.left =
        "50%";


    photo.style.top =
        "58%";



    let handled =
        false;



    // ========================================
    // 読み込み成功
    // ========================================

    photo.addEventListener(
        "load",
        function () {


            if (
                handled
            ) {

                return;
            }


            handled =
                true;


            createSparkles();


            setTimeout(
                function () {


                    if (
                        !photo.isConnected
                    ) {

                        return;
                    }


                    changeSpecialToNormal(
                        photo,
                        photoData
                    );

                },
                3800
            );

        },
        {
            once:
                true
        }
    );



    // ========================================
    // 読み込み失敗
    // ========================================

    photo.addEventListener(
        "error",
        function () {


            console.error(
                "新着写真読み込み失敗:",
                photoData.image_url
            );


            photo.remove();


            isSpecialPhotoPlaying =
                false;


            currentSpecialPhotoId =
                null;


            playNextQueuedPhoto();

        },
        {
            once:
                true
        }
    );



    photoWall.appendChild(
        photo
    );


    photo.src =
        photoData.image_url;



    // キャッシュ済み画像対策
    if (
        photo.complete
        &&
        photo.naturalWidth
        >
        0
        &&
        !handled
    ) {


        handled =
            true;


        createSparkles();


        setTimeout(
            function () {


                if (
                    photo.isConnected
                ) {

                    changeSpecialToNormal(
                        photo,
                        photoData
                    );
                }

            },
            3800
        );
    }
}



// ========================================
// 15. 新着写真 → 通常写真
// ========================================

function changeSpecialToNormal(
    photo,
    photoData
) {


    if (
        !photo
        ||
        !photo.isConnected
    ) {


        isSpecialPhotoPlaying =
            false;


        currentSpecialPhotoId =
            null;


        playNextQueuedPhoto();


        return;
    }


    photo.classList.remove(
        "new-photo"
    );


    photo.classList.remove(
        "photo-flow"
    );



    // ========================================
    // 通常サイズ
    // ========================================

    const width =
        Math.random()
        *
        80
        +
        140;


    const height =
        width
        *
        0.72;


    photo.style.width =
        width
        +
        "px";


    photo.style.height =
        height
        +
        "px";


    photo.style.maxWidth =
        "";


    photo.style.maxHeight =
        "";



    // ========================================
    // レーン
    // ========================================

    photo.style.top =
        getNextLane()
        +
        "%";


    photo.style.left =
        "-300px";



    // ========================================
    // 傾き
    // ========================================

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



    // ========================================
    // 速度
    // ========================================

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



    // 新着アニメーション解除
    photo.style.animation =
        "";


    photo.style.animationDelay =
        "0s";



    // 表示中写真として登録
    registerDisplayedPhoto(
        photoData
    );


    isSpecialPhotoPlaying =
        false;


    currentSpecialPhotoId =
        null;



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
// 16. キラキラ
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
                30
                -
                15
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
// 17. 新着写真を待機列へ
// ========================================

function queueNewPhoto(
    photoData
) {


    if (
        !photoData
        ||
        !photoData.id
        ||
        !photoData.image_url
    ) {

        return;
    }


    const alreadyDisplayed =
        displayedPhotos.some(
            item =>
                item.id
                ===
                photoData.id
        );


    const alreadyQueued =
        newPhotoQueue.some(
            item =>
                item.id
                ===
                photoData.id
        );


    if (
        alreadyDisplayed
        ||
        alreadyQueued
        ||
        currentSpecialPhotoId
        ===
        photoData.id
    ) {

        return;
    }


    newPhotoQueue.push(
        photoData
    );


    playNextQueuedPhoto();
}



// ========================================
// 18. 次の新着写真
// ========================================

function playNextQueuedPhoto() {


    if (
        isSpecialPhotoPlaying
    ) {

        return;
    }


    if (
        newPhotoQueue.length
        ===
        0
    ) {

        return;
    }


    const photoData =
        newPhotoQueue.shift();


    if (
        !photoData
    ) {

        return;
    }


    isSpecialPhotoPlaying =
        true;


    createSpecialPhoto(
        photoData
    );
}



// ========================================
// 19. 削除された写真を会場から消す
// ========================================

function handleDeletedPhoto(
    deletedPhoto
) {


    if (
        !deletedPhoto
        ||
        !deletedPhoto.id
    ) {

        return;
    }


    const deletedId =
        deletedPhoto.id;


    console.log(
        "写真削除を検知:",
        deletedId
    );



    // ========================================
    // 表示中リストから削除
    // ========================================

    displayedPhotos =
        displayedPhotos.filter(
            item =>
                item.id
                !==
                deletedId
        );



    // ========================================
    // 新着待機列から削除
    // ========================================

    newPhotoQueue =
        newPhotoQueue.filter(
            item =>
                item.id
                !==
                deletedId
        );



    // ========================================
    // 現在中央表示中なら停止
    // ========================================

    if (
        currentSpecialPhotoId
        ===
        deletedId
    ) {


        removePhotoElementsById(
            deletedId
        );


        currentSpecialPhotoId =
            null;


        isSpecialPhotoPlaying =
            false;


        playNextQueuedPhoto();


        return;
    }



    // ========================================
    // 通常表示中写真を削除
    // ========================================

    removePhotoElementsById(
        deletedId
    );
}



// ========================================
// 20. Supabaseから既存写真取得
// ========================================

async function loadExistingPhotos() {


    console.log(
        "写真を取得しています..."
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
        data.length
        ===
        0
    ) {


        console.log(
            "現在写真はありません"
        );


        return;
    }



    // 新しい順で取得したものを
    // 古い → 新しい順へ
    const photos =
        [
            ...data
        ].reverse();



    displayedPhotos =
        photos.map(
            item => ({
                id:
                    item.id,

                image_url:
                    item.image_url
            })
        );



    console.log(
        photos.length
        +
        "枚の写真を表示します"
    );



    // ========================================
    // 画面全体に均等配置
    // ========================================

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
                item,
                startDelay
            );
        }
    );
}



// ========================================
// 21. Realtime開始
// ========================================

function startRealtime() {


    console.log(
        "Realtime監視開始"
    );


    supabaseClient

        .channel(
            "wedding-photo-wall"
        )

        // ========================================
        // 新規投稿
        // ========================================

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
                    !payload
                    ||
                    !payload.new
                ) {

                    return;
                }


                const newPhoto =
                    payload.new;


                console.log(
                    "新着写真:",
                    newPhoto.id
                );


                queueNewPhoto(
                    {
                        id:
                            newPhoto.id,

                        image_url:
                            newPhoto.image_url
                    }
                );
            }
        )



        // ========================================
        // 管理画面から削除
        // ========================================

        .on(

            "postgres_changes",

            {

                event:
                    "DELETE",

                schema:
                    "public",

                table:
                    "photos"
            },

            function (
                payload
            ) {


                if (
                    !payload
                    ||
                    !payload.old
                ) {

                    return;
                }


                handleDeletedPhoto(
                    payload.old
                );
            }
        )



        // ========================================
        // 接続
        // ========================================

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
// 22. 起動
// ========================================

async function initializePhotoWall() {


    await loadExistingPhotos();


    startRealtime();
}


initializePhotoWall();
