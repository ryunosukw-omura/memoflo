// ========================================
// Photo Shushu
// Wedding Photo Wall
// 左 → 右 / ゆっくり / 途切れにくい版
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

// 前よりさらに約2秒ゆっくり
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

    return PHOTO_LANES[laneIndex];
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
            document.createElement("div");

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
// 通常写真を作る
// ========================================

function createNormalPhoto(
    imageURL,
    startDelay = 0
) {

    const photo =
        document.createElement("img");

    photo.classList.add("photo");


    // ========================================
    // 写真サイズ
    // ========================================

    const width =
        Math.random() * 80 + 140;

    const height =
        width * 0.72;

    photo.style.width =
        width + "px";

    photo.style.height =
        height + "px";


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
    // 最初だけアニメーション位置をずらす
    // 負のdelayで途中から始める
    // ========================================

    photo.style.animationDelay =
        "-" + startDelay + "s";


    // ========================================
    // 読み込み成功
    // ========================================

    photo.addEventListener(
        "load",
        function () {

            startFlow(photo);

        },
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


    photoWall.appendChild(photo);

    photo.src = imageURL;


    // キャッシュ対策
    if (
        photo.complete &&
        photo.naturalWidth > 0
    ) {

        startFlow(photo);
    }
}


// ========================================
// 写真を流す
// ========================================

function startFlow(photo) {

    if (!photo.isConnected) {
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


        // 一度クラスを外す
        photo.classList.remove(
            "photo-flow"
        );


        // 次の周回はdelayなし
        photo.style.animationDelay =
            "0s";


        // 左へ戻す
        photo.style.left =
            "-300px";


        // ========================================
        // 次の周回で少し位置変更
        // ========================================

        photo.style.top =
            getNextLane() + "%";


        // 傾きを少し変える
        const rotation =
            Math.random() * 16 - 8;

        photo.style.setProperty(
            "--rotation",
            rotation + "deg"
        );


        // 速度もほんの少し変える
        const duration =
            FLOW_DURATION +
            Math.random() * 4 - 2;

        photo.style.setProperty(
            "--flow-duration",
            duration + "s"
        );


        // ========================================
        // 待ち時間なしですぐ再スタート
        // ========================================

        requestAnimationFrame(
            function () {

                requestAnimationFrame(
                    function () {

                        startFlow(photo);

                    }
                );
            }
        );
    }
);


// ========================================
// 新着写真を中央に表示
// ========================================

function createSpecialPhoto(imageURL) {

    const photo =
        document.createElement("img");

    photo.classList.add(
        "photo",
        "new-photo"
    );


    const width =
        Math.min(
            window.innerWidth * 0.42,
            520
        );

    const height =
        width * 0.72;

    photo.style.width =
        width + "px";

    photo.style.height =
        height + "px";

    photo.style.left =
        "50%";

    photo.style.top =
        "52%";


    photo.addEventListener(
        "load",
        function () {

            createSparkles();

            setTimeout(
                function () {

                    changeSpecialToNormal(
                        photo
                    );

                },
                3800
            );

        },
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
}


// ========================================
// 新着写真 → 通常写真
// ========================================

function changeSpecialToNormal(photo) {

    photo.classList.remove(
        "new-photo"
    );

    photo.classList.remove(
        "photo-flow"
    );


    // 通常サイズ
    const width =
        Math.random() * 80 + 140;

    const height =
        width * 0.72;

    photo.style.width =
        width + "px";

    photo.style.height =
        height + "px";


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


    // すぐ流れに参加
    requestAnimationFrame(
        function () {

            startFlow(photo);

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
            document.createElement("div");

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

function queueNewPhoto(imageURL) {

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


    // ========================================
    // 重要
    // 最初から画面全体に写真をばらけさせる
    // ========================================

    const total =
        data.length;

    data.forEach(
        function (
            item,
            index
        ) {

            // 例：
            // 12枚なら31秒の中に
            // なるべく均等に配置
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

    if (!window.supabase) {

        showError(
            "Supabaseライブラリを読み込めませんでした"
        );

        return;
    }


    await loadExistingPhotos();

    subscribeToNewPhotos();
}


startPhotoWall();