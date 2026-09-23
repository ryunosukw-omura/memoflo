// ========================================
// MEMORY FLOW
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

const FLOW_DURATION =
    31;


const MAX_DISPLAY_PHOTOS =
    200;


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


    if (
        photoData.id
    ) {

        photo.dataset.photoId =
            photoData.id;
    }



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
// 16. 投稿時の上品なキラキラ
//
// シルバー 55%
// 白       35%
// 淡い金   10%
//
// 丸い光は使わず
// 細い十字のキラキラだけ
// ========================================

function createSparkles() {

    const sparkleCount =
        22;


    for (
        let i = 0;
        i < sparkleCount;
        i++
    ) {

        const sparkle =
            document.createElement(
                "div"
            );


        sparkle.classList.add(
            "photo-sparkle"
        );



        const colorRandom =
            Math.random();


        if (
            colorRandom
            <
            0.55
        ) {

            sparkle.style.color =
                "#e3e8ee";

        } else if (
            colorRandom
            <
            0.90
        ) {

            sparkle.style.color =
                "#ffffff";

        } else {

            sparkle.style.color =
                "#ead59a";
        }



        const angle =
            Math.random()
            *
            Math.PI
            *
            2;



        const startRadiusX =
            13
            +
            Math.random()
            *
            13;


        const startRadiusY =
            11
            +
            Math.random()
            *
            13;



        const startX =
            50
            +
            Math.cos(
                angle
            )
            *
            startRadiusX;


        const startY =
            58
            +
            Math.sin(
                angle
            )
            *
            startRadiusY;



        sparkle.style.left =
            startX
            +
            "%";


        sparkle.style.top =
            startY
            +
            "%";



        const distance =
            55
            +
            Math.random()
            *
            100;



        sparkle.style.setProperty(
            "--sparkle-x",
            Math.cos(
                angle
            )
            *
            distance
            +
            "px"
        );


        sparkle.style.setProperty(
            "--sparkle-y",
            Math.sin(
                angle
            )
            *
            distance
            +
            "px"
        );



        const size =
            3.5
            +
            Math.random()
            *
            5.5;


        sparkle.style.width =
            size
            +
            "px";


        sparkle.style.height =
            size
            +
            "px";



        sparkle.style.background =
            "transparent";


        sparkle.style.boxShadow =
            "none";



        const delay =
            Math.random()
            *
            520;


        sparkle.style.animationDelay =
            delay
            +
            "ms";


        sparkle.style.zIndex =
            "9998";



        photoWall.appendChild(
            sparkle
        );


        setTimeout(
            function () {

                if (
                    sparkle.isConnected
                ) {

                    sparkle.remove();
                }

            },
            1800
            +
            delay
        );
    }
}
// ========================================
// 17. 新着写真を待機列へ
// ========================================

function enqueueNewPhoto(
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


    if (
        alreadyDisplayed
    ) {

        return;
    }


    const alreadyQueued =
        newPhotoQueue.some(
            item =>
                item.id
                ===
                photoData.id
        );


    if (
        alreadyQueued
    ) {

        return;
    }


    if (
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
// 18. 待機列の次の写真を再生
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


    const nextPhoto =
        newPhotoQueue.shift();


    if (
        !nextPhoto
    ) {

        return;
    }


    isSpecialPhotoPlaying =
        true;


    createSpecialPhoto(
        nextPhoto
    );
}



// ========================================
// 19. 初期写真取得
// ========================================

async function loadInitialPhotos() {

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

        showError(
            "写真取得エラー: "
            +
            error.message
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
            "写真はまだありません"
        );


        return;
    }


    // 古い → 新しい順
    const photos =
        [
            ...data
        ].reverse();


    displayedPhotos =
        photos.map(
            photo => ({
                id:
                    photo.id,

                image_url:
                    photo.image_url
            })
        );


    const spacing =
        FLOW_DURATION
        /
        Math.max(
            photos.length,
            1
        );


    photos.forEach(
        function (
            photo,
            index
        ) {

            const startDelay =
                index
                *
                spacing;


            createNormalPhoto(
                photo,
                startDelay
            );
        }
    );


    console.log(
        "初期写真読み込み完了:",
        photos.length
    );
}



// ========================================
// 20. 新着写真リアルタイム監視
// ========================================

function subscribeToNewPhotos() {

    supabaseClient
        .channel(
            "photo-wall-insert-live"
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

                const newPhoto =
                    payload.new;


                console.log(
                    "新着写真:",
                    newPhoto
                );


                if (
                    !newPhoto
                    ||
                    !newPhoto.image_url
                ) {

                    return;
                }


                enqueueNewPhoto(
                    newPhoto
                );
            }
        )

        .subscribe(
            function (
                status
            ) {

                console.log(
                    "Photo INSERT Realtime:",
                    status
                );
            }
        );
}



// ========================================
// 21. 削除写真リアルタイム監視
// ========================================

function subscribeToDeletedPhotos() {

    supabaseClient
        .channel(
            "photo-wall-delete-live"
        )

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

                const deletedPhoto =
                    payload.old;


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
                    "削除写真:",
                    deletedId
                );


                displayedPhotos =
                    displayedPhotos.filter(
                        item =>
                            item.id
                            !==
                            deletedId
                    );


                newPhotoQueue =
                    newPhotoQueue.filter(
                        item =>
                            item.id
                            !==
                            deletedId
                    );


                removePhotoElementsById(
                    deletedId
                );


                if (
                    currentSpecialPhotoId
                    ===
                    deletedId
                ) {

                    currentSpecialPhotoId =
                        null;


                    isSpecialPhotoPlaying =
                        false;


                    playNextQueuedPhoto();
                }
            }
        )

        .subscribe(
            function (
                status
            ) {

                console.log(
                    "Photo DELETE Realtime:",
                    status
                );
            }
        );
}



// ========================================
// 22. 画面サイズ変更時
// ========================================

window.addEventListener(
    "resize",
    function () {

        // CSS側で中央配置を維持

    }
);



// ========================================
// 23. ページ表示状態
// ========================================

document.addEventListener(
    "visibilitychange",
    function () {

        if (
            document.hidden
        ) {

            console.log(
                "Photo wall hidden"
            );

        } else {

            console.log(
                "Photo wall visible"
            );
        }
    }
);



// ========================================
// 24. 初期化
// ========================================

async function initializePhotoWall() {

    if (
        !photoWall
    ) {

        console.error(
            "photoWall が見つかりません"
        );


        return;
    }


    console.log(
        "MEMORY FLOW START"
    );


    await loadInitialPhotos();


    subscribeToNewPhotos();


    subscribeToDeletedPhotos();


    console.log(
        "MEMORY FLOW READY"
    );
}



// ========================================
// 25. 起動
// ========================================

initializePhotoWall();