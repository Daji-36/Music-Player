const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'DAJI_PLAYER'

const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('.progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Anh Đã Ổn Hơn',
            singer: 'RPT MCK',
            path: './assets/music/AnhDaOnHon.mp3',
            image: './assets/img/anhdaonhon.jpg'
        },

        {
            name: 'Bad Trip',
            singer: 'RPT MCK',
            path: './assets/music/BadTrip.mp3',
            image: './assets/img/badtrip.jpg'
        },

        {
            name: 'Tháp Drill Tự Do',
            singer: 'RPT MCK',
            path: './assets/music/ThapDrillTuDo.mp3',
            image: './assets/img/thapdrill.jpg'
        }, 

        {
            name: 'Tại Vì Sao',
            singer: 'RPT MCK',
            path: './assets/music/TaiViSao.mp3',
            image: './assets/img/taivisao.jpg'
        },

        {
            name: 'Chỉ Một Đêm Nữa Thôi',
            singer: 'RPT MCK',
            path: './assets/music/ChiMotDemNuaThoi.mp3',
            image: './assets/img/chimotdemnuathoi.jpg'
        }, 

        {
            name: 'Va Vào Giai Điệu Này',
            singer: 'RPT MCK',
            path: './assets/music/VaVaoGiaiDieuNay.mp3',
            image: './assets/img/vavaogiaidieunay.jpg'
        }, 

        {
            name: 'Chìm Sâu',
            singer: 'RPT MCK',
            path: './assets/music/ChimSau.mp3',
            image: './assets/img/chimsau.jpg'
        }
    ],

    setConfig: function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },

    render : function() {
        const html = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active':' '}" data-index=${index}>
                <div
                    class="thumb"
                    style="background-image: url('${song.image}')"
                ></div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>`
        });

        playlist.innerHTML = html.join('')
    },

    
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    }, 
    
    handleEvents: function() {
        const _this = this
        const cdWidth = cd.offsetWidth;

        //Xu ly CD quay / dung
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000, //10s
            iterations: Infinity
        })
        cdThumbAnimate.pause();
        // Xu ly cuon CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newWidth = cdWidth - scrollTop;
            cd.style.width = newWidth > 0 ? newWidth + 'px' : 0;
            cd.style.opacity = newWidth / cdWidth;
            
        }
        // Xu ly play
        playBtn.onclick = function(){
            if(_this.isPlaying) {
                audio.pause()
            }
            else{
                audio.play()
            }
        }

        // Khi song duoc play 
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }
        //Khi song pause
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }
        //Khi tien do bai hat thay doi
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
                _this.updateProgressColor(progressPercent)
            }
        }
        //
        progress.oninput = function(e) {
            const percent = e.target.value
            _this.updateProgressColor(percent);
        }
        //Xu ly khi tua bai hat
        progress.onchange = function(e) {
            const percent = e.target.value
            const seekTime = (percent/100) * audio.duration
            audio.currentTime = seekTime;
            _this.updateProgressColor(percent)
        }


        //Xu ly khi next bai hat
        nextBtn.onclick = function() {
            if(_this.isRandom) {
                _this.randomSong()
            } else{
                _this.nextSong();
            } 
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        //Xu ly prev bai hat
        prevBtn.onclick = function() {
            if(_this.isRandom) {
                _this.randomSong()
            } else{
                _this.prevSong();
            } 
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        //Xu ly random bai hat
        randomBtn.onclick = function(){
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }
        // Xu ly next song khi audio ended
        audio.onended = function () {
            if(_this.isRepeat){
                audio.play();
            } else {
                nextBtn.click();
            }
        }
        //Xu ly repeat song
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }
        // Xu ly click vao playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            const optionNode = e.target.closest('.option')
            if(songNode || optionNode){
                //Xu ly khi click vao song
                if(songNode){
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
                //Xu ly option
                if(optionNode){
                    alert('Chưa cập nhật!')
                }
            }
        }
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`
        audio.src = this.currentSong.path
    },
       
    nextSong: function(){
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },

    prevSong: function() {
        this.currentIndex--;
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong()
    }, 
    randomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    }, 

    scrollToActiveSong: function(){
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }, 300)
        
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },

    updateProgressColor: function(percent){
        progress.style.background = `linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ${percent}%, #d3d3d3 ${percent}%)`;
    },

    start : function() {
        //Gan cau hinh tu config vao app
        this.loadConfig();
        //Dinh nghia cac thuoc tinh cho object
        this.defineProperties();
        //Lang nghe / xu ly su kien (DOM Events)
        this.handleEvents();
        //Tai thong tin bai hat dau tien vao UI khi chay
        this.loadCurrentSong();
        //Render playlist
        this.render();
        //Hien thi trang thai ban dau cua btn random va btn repeat
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }

    
}

app.start();