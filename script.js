// ========================================
// Photo Shushu
// Wedding Photo Wall
// 左 → 右 / 縦横比対応版
// ========================================


// ========================================
// 1. Supabase設定
// ========================================

const SUPABASE_URL =
    "https://tnqnowlvtnrzrcydcsmi.supabase.co";


// ↓↓↓ 今まで使っている Publishable key を入れてください
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
    document.getElementById("photoWall");


// ========================================
// 3. 流れる速さ
// ========================================

const FLOW_DURATION = 31;


// ========================================
// 4. 写真レーン
// ========================================

const PHOTO_LANES = [
    23,
    35,
    47,
    59,
    71
];


let lastLaneIndex = -1;


// ========================================
// 5. 新着写真用
// ========================================

let newPhotoQueue = [];

let isSpecialPhotoPlaying = false;


// ========================================
// レーンを選ぶ
// ========================================

function getNextLane() {

    let laneIndex;

    do {

        laneIndex =
            Math.floor(
                Math.random() *
                PHOTO_LANES.length
            );

    } while (
        laneIndex === lastLaneIndex
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

function showError(message) {

    console.error(message);


    let errorBox =
        document.getElementById(
            "photoError"
        );


    if (!errorBox) {

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

function getPhotoRatio(photo) {

    if (
        !photo.naturalWidth ||
        !photo.naturalHeight
    ) {

        return 1.4;
    }


    return (
        photo.naturalWidth /
        photo.naturalHeight
    );
}


// ========================================
// 通常写真のサイズ
// ========================================

function setNormalPhotoSize(photo) {

    const ratio =
        getPhotoRatio(photo);


    // ------------------------------------
    // 縦写真
    // ------------------------------------

    if (ratio < 0.9) {

        const height =
            Math.random() * 50 + 190;


        const width =
            height * ratio;


        photo.style.width =
            width + "px";


        photo.style.height =
            height + "px";
    }


    // ------------------------------------
    // 正方形に近い写真
    // ------------------------------------

    else if (ratio < 1.15) {

        const size =
            Math.random() * 50 + 175;


        photo.style.width =
            size + "px";


        photo.style.height =
            (
                size / ratio
            ) + "px";
    }


    // ------------------------------------
    // 横写真
    // ------------------------------------

    else {

        const width =
            Math.random() * 80 + 140;


        const height =
            width / ratio;


        photo.style.width =
            width + "px";


        photo.style.height =
            height + "px";
    }


    // 写真そのものを切らない
    photo.style.objectFit =
        "contain";
}


// ========================================
// 新着写真のサイズ
// ========================================

function setSpecialPhotoSize(photo) {

    const ratio =
        getPhotoRatio(photo);


    const maxWidth =
        Math.min(
            window.innerWidth * 0.52,
            600
        );


    const maxHeight =
        Math.min(
            window.innerHeight * 0.68,
            650
        );


    let width;

    let height;


    // 横幅を基準に計算
    width =
        maxWidth;


    height =
        width / ratio;


    // 縦写真などで高さが大きすぎる場合
    if (
        height > maxHeight
    ) {

        height =
            maxHeight;


        width =
            height * ratio;
    }


    photo.style.width =
        width + "px";


    photo.style.height =
        height + "px";


    photo.style.objectFit =
        "contain";
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


    // ========================================
    // 縦位置
    // ========================================

    const y =
        getNextLane();


    photo.style.top =
        y + "%";


    // 最初は左画面外
    photo.style.left =
        "-300px";


    // ========================================
    // 傾き
    // ========================================

    const rotation =
        Math.random() * 16 - 8;


    photo.style.setProperty(
        "--rotation",
        rotation + "deg"
    );


    // ========================================
    // 写真ごとの速度
    // ========================================

    const duration =
        FLOW_DURATION +
        Math.random() * 4 - 2;


    photo.style.setProperty(
        "--flow-duration",
        duration + "s"
    );


    // ========================================
    // 最初だけ途中から開始
    // ========================================

    photo.style.animationDelay =
        "-" + startDelay + "s";


    // ========================================
    // 読み込み成功
    // ========================================

    let started =
        false;


    function handleLoadedPhoto() {

        if (started) {
            return;
        }


        if (
            !photo.naturalWidth ||
            !photo.naturalHeight
        ) {
            return;
        }


        started =
            true;


        // ★ 本来の縦横比でサイズ決定
        setNormalPhotoSize(
            photo
        );


        startFlow(
            photo
        );
    }


    photo.addEventListener(
        "load",
        handleLoadedPhoto,
        { once: true }
    );


    // ========================================
    // 読み込み失敗
    // ========================================

    photo.addEventListener(
        "error",
        function () {

            console.error(
                "画像読み込み失敗:",
                imageURL
            );

        },
        { once: true }
    );


    photoWall.appendChild(
        photo
    );


    // onload設定後にsrc
    photo.src =
        imageURL;


    // キャッシュ対策
    if (
        photo.complete &&
        photo.naturalWidth > 0
    ) {

        handleLoadedPhoto();
    }
}


// ========================================
// 写真を流す
// ========================================

function startFlow(photo) {

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
// 通常写真の周回
// ========================================

photoWall.addEventListener(
    "animationend",
    function (event) {

        const photo =
            event.target;


        if (
            !photo.classList.contains(
                "photo-flow"
            )
        ) {
            return;
        }


        photo.classList.remove(
            "photo-flow"
        );


        // 次の周回はdelayなし
        photo.style.animationDelay =
            "0s";


        // 左へ戻す
        photo.style.left =
            "-300px";


        // レーン変更
        photo.style.top =
            getNextLane() + "%";


        // 傾き変更
        const rotation =
            Math.random() * 16 - 8;


        photo.style.setProperty(
            "--rotation",
            rotation + "deg"
        );


        // 速度を少し変更
        const duration =
            FLOW_DURATION +
            Math.random() * 4 - 2;


        photo.style.setProperty(
            "--flow-duration",
            duration + "s"
        );


        // 待ち時間なしで再スタート
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
// 新着写真を中央に表示
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
        "52%";


    let handled =
        false;


    function handleSpecialLoaded() {

        if (handled) {
            return;
        }


        if (
            !photo.naturalWidth ||
            !photo.naturalHeight
        ) {
            return;
        }


        handled =
            true;


        // ★ 縦横比に合わせて中央表示
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
        handleSpecialLoaded,
        { once: true }
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
        { once: true }
    );


    photoWall.appendChild(
        photo
    );


    photo.src =
        imageURL;


    // キャッシュ対策
    if (
        photo.complete &&
        photo.naturalWidth > 0
    ) {

        handleSpecialLoaded();
    }
}


// ========================================
// 新着写真 → 通常写真
// ========================================

function changeSpecialToNormal(
    photo
) {

    photo.classList.remove(
        "new-photo"
    );


    photo.classList.remove(
        "photo-flow"
    );


    // ★ 本来の比率のまま通常サイズへ
    setNormalPhotoSize(
        photo
    );


    // レーン
    photo.style.top =
        getNextLane() + "%";


    // 左画面外
    photo.style.left =
        "-300px";


    // 傾き
    const rotation =
        Math.random() * 16 - 8;


    photo.style.setProperty(
        "--rotation",
        rotation + "deg"
    );


    // 速度
    const duration =
        FLOW_DURATION +
        Math.random() * 4 - 2;


    photo.style.setProperty(
        "--flow-duration",
        duration + "s"
    );


    // 新着用animationを解除
    photo.style.animation =
        "";


    photo.style.animationDelay =
        "0s";


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
                50 +
                Math.random() * 35 -
                17.5
            ) + "%";


        sparkle.style.top =
            (
                52 +
                Math.random() * 30 -
                15
            ) + "%";


        sparkle.style.setProperty(
            "--sparkle-x",
            (
                Math.random() * 300 -
                150
            ) + "px"
        );


        sparkle.style.setProperty(
            "--sparkle-y",
            (
                Math.random() * 300 -
                150
            ) + "px"
        );


        const size =
            Math.random() * 7 + 4;


        sparkle.style.width =
            size + "px";


        sparkle.style.height =
            size + "px";


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
// 新着写真の待機
// ========================================

function queueNewPhoto(
    imageURL
) {

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
        newPhotoQueue.length === 0
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
// Supabaseから既存写真取得
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
            .from("photos")
            .select(
                "id, image_url, created_at"
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


    if (error) {

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
        !data ||
        data.length === 0
    ) {

        showError(
            "Supabaseのphotosテーブルに写真がありません"
        );


        return;
    }


    console.log(
        data.length +
        "枚の写真を表示します"
    );


    // 最初から画面全体に均等配置
    const total =
        data.length;


    data.forEach(
        function (
            item,
            index
        ) {

            const startDelay =
                (
                    FLOW_DURATION /
                    total
                ) * index;


            createNormalPhoto(
                item.image_url,
                startDelay
            );
        }
    );
}


// ========================================
// Realtime
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
                event: "INSERT",
                schema: "public",
                table: "photos"
            },

            function (payload) {

                if (
                    payload.new &&
                    payload.new.image_url
                ) {

                    queueNewPhoto(
                        payload.new.image_url
                    );
                }
            }
        )
        .subscribe(
            function (status) {

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
