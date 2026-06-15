// ======================================
// INDEX / CATALOG
// ======================================
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startBtn')
    if (startBtn) startBtn.addEventListener('click', () => { window.location.href = 'catalog.html' })

    document.querySelectorAll('.feature-card').forEach(c => {
        c.addEventListener('mouseenter', () => { c.style.transform = 'translateY(-10px)' })
        c.addEventListener('mouseleave', () => { c.style.transform = 'translateY(0)' })
    })

    setupSlider('dressSlider','dressTitle','dressDescription',[
        {src:'images/casual.png', title:'Casual Dress',  desc:'Comfortable everyday dress.'},
        {src:'images/evening.png',title:'Evening Dress', desc:'Luxury evening outfit.'     },
        {src:'images/formal.png', title:'Formal Dress',  desc:'Elegant fashion style.'     },
        {src:'images/summer.png', title:'Summer Dress',  desc:'Light summer collection.'   }
    ])
    setupSlider('suitSlider','suitTitle','suitDescription',[
        {src:'images/suit1.png',title:'Business Style Suit',desc:'Elegant business fashion.'},
        {src:'images/suit2.png',title:'Classic Office Suit', desc:'Modern office style.'    },
        {src:'images/suit3.png',title:'Luxury Fashion Suit', desc:'Premium elegant suit.'   },
        {src:'images/suit4.png',title:'Modern Formal Suit',  desc:'Stylish formal outfit.'  }
    ])
    setupSlider('urbanSlider','urbanTitle','urbanDescription',[
        {src:'images/urban1.png',title:'Modern Urban Fashion',     desc:'Modern streetwear collection.'},
        {src:'images/urban2.png',title:'Global Streetwear Fusion', desc:'Global fashion inspiration.'  },
        {src:'images/urban3.png',title:'Autumn Cable-Knit Look',   desc:'Cozy autumn casual style.'    },
        {src:'images/urban4.png',title:'Everyday Denim Style',     desc:'Everyday denim fashion.'      }
    ])

    document.querySelectorAll('.open-constructor').forEach(btn => {
        btn.addEventListener('click', () => {
            localStorage.setItem('selectedModel', btn.dataset.model)
            window.location.href = 'constructor.html'
        })
    })
})

function setupSlider(imageId, titleId, descId, items) {
    const image = document.getElementById(imageId)
    const title = document.getElementById(titleId)
    const desc  = document.getElementById(descId)
    if (!image || !title || !desc) return
    let i = 0
    setInterval(() => {
        i = (i + 1) % items.length
        image.src = items[i].src
        title.textContent = items[i].title
        desc.textContent  = items[i].desc
    }, 2500)
}


// ======================================
// THREE.JS CONSTRUCTOR
// ======================================

const sceneContainer = document.getElementById('scene-container')
if (sceneContainer) {

// ── SCENE ─────────────────────────────
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xdbeafe)

// ── CAMERA ────────────────────────────
const camera = new THREE.PerspectiveCamera(
    45,
    sceneContainer.clientWidth / sceneContainer.clientHeight,
    0.1, 1000
)
camera.position.set(0, 0.5, 4.5)
camera.lookAt(0, 0, 0)

// ── RENDERER ──────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.2
renderer.physicallyCorrectLights = true
sceneContainer.appendChild(renderer.domElement)

// ── LIGHTS ────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 1.2))
const dirLight = new THREE.DirectionalLight(0xffffff, 3.5)
dirLight.position.set(3, 6, 5)
scene.add(dirLight)
const fillLight = new THREE.DirectionalLight(0xb0c8ff, 1.2)
fillLight.position.set(-3, 2, -3)
scene.add(fillLight)
const rimLight = new THREE.DirectionalLight(0xffffff, 0.8)
rimLight.position.set(0, -2, -4)
scene.add(rimLight)

// ── MODEL ─────────────────────────────
let tshirtModel = null
let shirtMeshes = []

// Читаємо яку модель відкрити
const selectedModel     = localStorage.getItem('selectedModel') || 't_shirt'
const selectedModelName = localStorage.getItem('selectedModelName') || 'Model'

// Показуємо назву в breadcrumb
const breadcrumb = document.getElementById('modelBreadcrumb')
if (breadcrumb && selectedModelName) breadcrumb.textContent = ' / ' + selectedModelName

// GLB файл = назва моделі + .glb
const glbPath = `./glb/${selectedModel}.glb`

const loader = new THREE.GLTFLoader()

// Спочатку перевіряємо чи існує файл через fetch
fetch(glbPath, { method: 'HEAD' })
    .then(res => {
        if (!res.ok) throw new Error('not found')
        return loadModel(glbPath)
    })
    .catch(() => {
        // GLB ще не завантажений — показуємо заглушку
        const msg = document.getElementById('modelMissingMsg')
        const sc  = document.getElementById('scene-container')
        const nm  = document.getElementById('modelMissingName')
        const mf  = document.getElementById('modelMissingFile')
        if (msg) msg.style.display = 'flex'
        if (sc)  sc.style.display  = 'none'
        if (nm)  nm.textContent    = selectedModelName
        if (mf)  mf.textContent    = `${selectedModel}.glb`
    })

function loadModel(path) {
    return new Promise((resolve, reject) => {

        // Show loading spinner
        const loadingMsg  = document.getElementById('modelLoadingMsg')
        const loadingName = document.getElementById('loadingModelName')
        const loadingProg = document.getElementById('loadingProgress')
        const sc          = document.getElementById('scene-container')
        if (loadingMsg)  { loadingMsg.style.display  = 'flex'; }
        if (sc)          { sc.style.display           = 'none'; }
        if (loadingName) { loadingName.textContent    = selectedModelName; }

        loader.load(path, gltf => {

            // Hide spinner, show scene
            if (loadingMsg) loadingMsg.style.display = 'none'
            if (sc)         sc.style.display          = ''

            tshirtModel = gltf.scene

            tshirtModel.traverse(child => {
                if (child.isMesh && !child.name.includes('Stitch')) {
                    shirtMeshes.push(child)
                    if (child.material) {
                        child.material.roughness   = 0.85
                        child.material.metalness   = 0.0
                        child.material.side        = THREE.DoubleSide
                        child.material.needsUpdate = true
                    }
                }
            })

            // Auto-scale: fit model into ~2 unit tall box
            const box    = new THREE.Box3().setFromObject(tshirtModel)
            const size   = box.getSize(new THREE.Vector3())
            const maxDim = Math.max(size.x, size.y, size.z)
            const scale  = 2.0 / maxDim
            tshirtModel.scale.setScalar(scale)

            // Center and position
            const box2    = new THREE.Box3().setFromObject(tshirtModel)
            const center2 = box2.getCenter(new THREE.Vector3())
            tshirtModel.position.set(-center2.x, -box2.min.y - 1, -center2.z)

            scene.add(tshirtModel)
            tshirtModel.updateMatrixWorld(true)
            resolve()

        }, xhr => {
            // Progress
            if (xhr.total && loadingProg) {
                const pct = Math.round(xhr.loaded / xhr.total * 100)
                loadingProg.textContent = pct + '%'
            }
        }, reject)
    })
}

// ── RAYCASTER ─────────────────────────
const raycaster = new THREE.Raycaster()
const mouseVec  = new THREE.Vector2()

// ── PRINT STATE ───────────────────────
// Принт живе в SCENE space — незалежно від моделі.
// Футболка крутиться окремо, принт окремо.
// depthTest:true = принт ховається за геометрією коли потрібно.
let printMesh  = null
let printSize  = 1.0
let printAngle = 0

// ── INTERACTION STATE ─────────────────
// mainMode: 'shirt' | 'print'
// printTool: 'move' | 'scale' | 'rotate'
let mainMode    = 'shirt'
let printTool   = 'move'
let pointerDown = false
let lastX = 0, lastY = 0

// ── MODEL ROTATION STATE ──────────────
let rotY = 0
let rotX = 0

// ── FABRIC SYSTEM ─────────────────────
// Кожна тканина описує PBR-параметри + SVG-прев'ю (без зовнішніх текстур)
const FABRICS = [
    {
        id: 'cotton',
        name: 'Cotton',
        emoji: '🌿',
        desc: 'Soft, matte',
        roughness: 0.92,
        metalness: 0.0,
        normalScale: 0.4,
        envMapIntensity: 0.3,
        // Процедурна текстура: переплетення ниток
        pattern: (ctx, size) => {
            ctx.fillStyle = '#f5f0e8'
            ctx.fillRect(0, 0, size, size)
            const step = size / 12
            ctx.strokeStyle = 'rgba(160,140,110,0.35)'
            ctx.lineWidth = 1
            for (let i = 0; i < 13; i++) {
                ctx.beginPath(); ctx.moveTo(i * step, 0); ctx.lineTo(i * step, size); ctx.stroke()
                ctx.beginPath(); ctx.moveTo(0, i * step); ctx.lineTo(size, i * step); ctx.stroke()
            }
            // Ворсинки
            for (let x = 0; x < size; x += step) {
                for (let y = 0; y < size; y += step) {
                    const ox = (Math.random() - 0.5) * step * 0.4
                    const oy = (Math.random() - 0.5) * step * 0.4
                    ctx.beginPath()
                    ctx.arc(x + ox, y + oy, 0.8, 0, Math.PI * 2)
                    ctx.fillStyle = 'rgba(130,110,80,0.25)'
                    ctx.fill()
                }
            }
        },
        normal: (ctx, size) => {
            const step = size / 12
            ctx.fillStyle = '#8080ff'
            ctx.fillRect(0, 0, size, size)
            ctx.strokeStyle = 'rgba(50,50,200,0.5)'
            ctx.lineWidth = 2
            for (let i = 0; i < 13; i++) {
                ctx.beginPath(); ctx.moveTo(i * step, 0); ctx.lineTo(i * step, size); ctx.stroke()
                ctx.beginPath(); ctx.moveTo(0, i * step); ctx.lineTo(size, i * step); ctx.stroke()
            }
        },
    },
    {
        id: 'silk',
        name: 'Silk',
        emoji: '✨',
        desc: 'Glossy shine',
        roughness: 0.08,
        metalness: 0.0,
        normalScale: 0.08,
        envMapIntensity: 1.8,
        pattern: (ctx, size) => {
            // Шовк: плавні шевронні смуги
            const grad = ctx.createLinearGradient(0, 0, size, size)
            grad.addColorStop(0,   '#fdf6f0')
            grad.addColorStop(0.25,'#ede4d6')
            grad.addColorStop(0.5, '#faf5ee')
            grad.addColorStop(0.75,'#e8ddd0')
            grad.addColorStop(1,   '#fdf6f0')
            ctx.fillStyle = grad
            ctx.fillRect(0, 0, size, size)
            // Тонкі діагональні блики
            ctx.strokeStyle = 'rgba(255,255,240,0.55)'
            ctx.lineWidth = 2
            for (let d = -size; d < size * 2; d += 14) {
                ctx.beginPath()
                ctx.moveTo(d, 0); ctx.lineTo(d + size, size)
                ctx.stroke()
            }
        },
        normal: (ctx, size) => {
            ctx.fillStyle = '#8080ff'
            ctx.fillRect(0, 0, size, size)
            ctx.strokeStyle = 'rgba(100,100,230,0.2)'
            ctx.lineWidth = 1.5
            for (let d = -size; d < size * 2; d += 14) {
                ctx.beginPath()
                ctx.moveTo(d, 0); ctx.lineTo(d + size, size)
                ctx.stroke()
            }
        },
    },
    {
        id: 'denim',
        name: 'Denim',
        emoji: '👖',
        desc: 'Woven, durable',
        roughness: 0.88,
        metalness: 0.0,
        normalScale: 0.7,
        envMapIntensity: 0.2,
        pattern: (ctx, size) => {
            ctx.fillStyle = '#4a6fa5'
            ctx.fillRect(0, 0, size, size)
            const tw = size / 14
            // Саржевий плетив (twill)
            ctx.strokeStyle = 'rgba(30,50,110,0.45)'
            ctx.lineWidth = tw * 0.8
            for (let i = -size; i < size * 2; i += tw * 2) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + size, size); ctx.stroke()
            }
            ctx.strokeStyle = 'rgba(100,140,220,0.25)'
            ctx.lineWidth = tw * 0.4
            for (let i = -size; i < size * 2; i += tw * 2) {
                ctx.beginPath(); ctx.moveTo(i + tw, 0); ctx.lineTo(i + size + tw, size); ctx.stroke()
            }
        },
        normal: (ctx, size) => {
            ctx.fillStyle = '#8080ff'
            ctx.fillRect(0, 0, size, size)
            const tw = size / 14
            ctx.strokeStyle = 'rgba(30,30,200,0.55)'
            ctx.lineWidth = tw * 0.8
            for (let i = -size; i < size * 2; i += tw * 2) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + size, size); ctx.stroke()
            }
        },
    },
    {
        id: 'linen',
        name: 'Linen',
        emoji: '🌾',
        desc: 'Natural texture',
        roughness: 0.96,
        metalness: 0.0,
        normalScale: 0.6,
        envMapIntensity: 0.15,
        pattern: (ctx, size) => {
            ctx.fillStyle = '#e8d9b8'
            ctx.fillRect(0, 0, size, size)
            const step = size / 10
            // Горизонтальні нитки
            ctx.strokeStyle = 'rgba(160,130,80,0.4)'
            ctx.lineWidth = 1.8
            for (let y = 0; y < size; y += step) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(size, y); ctx.stroke()
            }
            // Вертикальні нитки (рідші)
            ctx.strokeStyle = 'rgba(140,110,60,0.3)'
            ctx.lineWidth = 1.2
            for (let x = 0; x < size; x += step) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, size); ctx.stroke()
            }
            // Вузлики
            for (let x = 0; x < size; x += step * 2) {
                for (let y = step; y < size; y += step * 2) {
                    ctx.beginPath(); ctx.arc(x + step * 0.5, y, 1.2, 0, Math.PI * 2)
                    ctx.fillStyle = 'rgba(120,90,40,0.4)'; ctx.fill()
                }
            }
        },
        normal: (ctx, size) => {
            ctx.fillStyle = '#8080ff'
            ctx.fillRect(0, 0, size, size)
            const step = size / 10
            ctx.strokeStyle = 'rgba(50,50,200,0.5)'; ctx.lineWidth = 2
            for (let y = 0; y < size; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(size, y); ctx.stroke() }
            ctx.strokeStyle = 'rgba(50,50,180,0.3)'; ctx.lineWidth = 1.2
            for (let x = 0; x < size; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, size); ctx.stroke() }
        },
    },
    {
        id: 'velvet',
        name: 'Velvet',
        emoji: '💜',
        desc: 'Deep, soft',
        roughness: 0.78,
        metalness: 0.05,
        normalScale: 0.25,
        envMapIntensity: 0.9,
        pattern: (ctx, size) => {
            // Neutral velvet — color comes from shirt color, not texture
            const grad = ctx.createRadialGradient(size*0.5, size*0.4, 0, size*0.5, size*0.5, size*0.7)
            grad.addColorStop(0, '#d0d0d0')
            grad.addColorStop(0.5, '#a0a0a0')
            grad.addColorStop(1, '#606060')
            ctx.fillStyle = grad
            ctx.fillRect(0, 0, size, size)
            // Fine pile fibers
            for (let i = 0; i < 300; i++) {
                const x = Math.random() * size
                const y = Math.random() * size
                ctx.beginPath()
                ctx.moveTo(x, y); ctx.lineTo(x + (Math.random()-0.5)*4, y - Math.random()*7)
                const v = 180 + Math.random()*60
                ctx.strokeStyle = `rgba(${v},${v},${v},0.25)`
                ctx.lineWidth = 0.6; ctx.stroke()
            }
        },
        normal: (ctx, size) => {
            ctx.fillStyle = '#8080ff'; ctx.fillRect(0, 0, size, size)
            for (let i = 0; i < 150; i++) {
                const x = Math.random() * size, y = Math.random() * size
                ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2)
                ctx.fillStyle = 'rgba(50,50,200,0.3)'; ctx.fill()
            }
        },
    },
    {
        id: 'knit',
        name: 'Knit',
        emoji: '🧶',
        desc: 'Knitted structure',
        roughness: 0.94,
        metalness: 0.0,
        normalScale: 0.5,
        envMapIntensity: 0.2,
        pattern: (ctx, size) => {
            ctx.fillStyle = '#f0e6d3'
            ctx.fillRect(0, 0, size, size)
            const cw = size / 10, ch = size / 8
            ctx.strokeStyle = 'rgba(160,120,80,0.5)'
            ctx.lineWidth = 1.5
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 10; col++) {
                    const x = col * cw, y = row * ch
                    // "V" петля
                    ctx.beginPath()
                    ctx.moveTo(x, y + ch * 0.1)
                    ctx.bezierCurveTo(x + cw*0.3, y + ch*0.6, x + cw*0.5, y + ch*0.8, x + cw*0.5, y + ch)
                    ctx.bezierCurveTo(x + cw*0.5, y + ch*0.8, x + cw*0.7, y + ch*0.6, x + cw, y + ch*0.1)
                    ctx.stroke()
                }
            }
        },
        normal: (ctx, size) => {
            ctx.fillStyle = '#8080ff'; ctx.fillRect(0, 0, size, size)
            const cw = size / 10, ch = size / 8
            ctx.strokeStyle = 'rgba(50,50,220,0.45)'; ctx.lineWidth = 2
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 10; col++) {
                    const x = col * cw, y = row * ch
                    ctx.beginPath()
                    ctx.moveTo(x, y + ch * 0.1)
                    ctx.bezierCurveTo(x + cw*0.3, y + ch*0.6, x + cw*0.5, y + ch*0.8, x + cw*0.5, y + ch)
                    ctx.bezierCurveTo(x + cw*0.5, y + ch*0.8, x + cw*0.7, y + ch*0.6, x + cw, y + ch*0.1)
                    ctx.stroke()
                }
            }
        },
    },
]

// Поточна активна тканина (null = без тканини)
let activeFabricId = null
let fabricTextures  = {}  // id → { map, normalMap }

// Генерує Canvas текстуру за функцією малювання
function makeCanvasTex(drawFn, size = 256, isNormal = false) {
    const c = document.createElement('canvas')
    c.width = c.height = size
    drawFn(c.getContext('2d'), size)
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(3, 3)
    tex.flipY = false
    if (!isNormal) tex.encoding = THREE.sRGBEncoding
    return tex
}

// Будує SVG-прев'ю для картки тканини (data URL)
function fabricPreviewDataURL(fabric) {
    const c = document.createElement('canvas')
    c.width = c.height = 96
    fabric.pattern(c.getContext('2d'), 96)
    return c.toDataURL()
}

// Застосовує тканину на сорочку
function applyFabric(fabricId) {
    activeFabricId = fabricId
    document.querySelectorAll('.fabric-card').forEach(el => {
        el.classList.toggle('active', el.dataset.fabricId === fabricId)
    })

    const fabric = FABRICS.find(f => f.id === fabricId)
    if (!fabric) return

    // Будуємо текстури якщо ще не маємо
    if (!fabricTextures[fabricId]) {
        fabricTextures[fabricId] = {
            map:       makeCanvasTex(fabric.pattern, 512, false),
            normalMap: makeCanvasTex(fabric.normal,  512, true),
        }
    }
    const { map, normalMap } = fabricTextures[fabricId]
    const currentColor = shirtColorInp?.value || '#ffffff'

    shirtMeshes.forEach(m => {
        if (!m.material) return
        m.material.map            = map
        m.material.normalMap      = normalMap
        m.material.normalScale    = new THREE.Vector2(fabric.normalScale, fabric.normalScale)
        m.material.roughness      = fabric.roughness
        m.material.metalness      = fabric.metalness
        m.material.envMapIntensity= fabric.envMapIntensity
        m.material.color.set(currentColor)
        m.material.side           = THREE.DoubleSide
        m.material.needsUpdate    = true
    })
}

// Скидає тканину (чиста MeshStandardMaterial)
function resetFabric() {
    activeFabricId = null
    document.querySelectorAll('.fabric-card').forEach(el => el.classList.remove('active'))
    const hex = shirtColorInp?.value || '#ffffff'
    shirtMeshes.forEach(m => {
        if (!m.material) return
        m.material.map         = null
        m.material.normalMap   = null
        m.material.roughness   = 0.85
        m.material.metalness   = 0
        m.material.color.set(hex)
        m.material.needsUpdate = true
    })
}

// Рендеримо картки тканин
const fabricGrid = document.getElementById('fabricGrid')
if (fabricGrid) {
    FABRICS.forEach(fabric => {
        const card = document.createElement('div')
        card.className = 'fabric-card'
        card.dataset.fabricId = fabric.id
        card.title = fabric.desc

        const preview = document.createElement('img')
        preview.className = 'fabric-card-preview'
        preview.src = fabricPreviewDataURL(fabric)

        const label = document.createElement('div')
        label.className = 'fabric-card-label'
        label.textContent = fabric.name

        const badge = document.createElement('div')
        badge.className = 'fabric-badge'
        badge.textContent = fabric.emoji

        card.appendChild(preview)
        card.appendChild(label)
        card.appendChild(badge)
        card.addEventListener('click', () => {
            if (activeFabricId === fabric.id) {
                resetFabric()
            } else {
                applyFabric(fabric.id)
            }
        })
        fabricGrid.appendChild(card)
    })
}

// ── COLOR SWATCHES ────────────────────
const COLORS = [
    {hex:'#ffffff',name:'White'       }, {hex:'#f1f5f9',name:'Cream'    },
    {hex:'#fecaca',name:'Pink'     }, {hex:'#fbcfe8',name:'Lilac'     },
    {hex:'#e9d5ff',name:'Lavender'  }, {hex:'#bfdbfe',name:'Light Blue'   },
    {hex:'#a7f3d0',name:"Mint"     }, {hex:'#fde68a',name:'Yellow'      },
    {hex:'#fed7aa',name:'Peach'  }, {hex:'#3b82f6',name:'Blue'       },
    {hex:'#8b5cf6',name:'Purple'  }, {hex:'#ec4899',name:'Crimson'   },
    {hex:'#10b981',name:'Green'     }, {hex:'#f97316',name:'Orange'},
    {hex:'#000000',name:'Black'      }, {hex:'#1e293b',name:'Navy' },
]
const LIGHT_HEX = new Set(['#ffffff','#f1f5f9','#fecaca','#fbcfe8','#e9d5ff','#bfdbfe','#a7f3d0','#fde68a','#fed7aa'])

const swatchWrap    = document.getElementById('colorSwatches')
const shirtColorInp = document.getElementById('shirtColor')

function applyShirtColor(hex) {
    shirtMeshes.forEach(m => {
        if (!m.material) return
        // Якщо тканина активна — не скидаємо map, тільки змінюємо колір
        if (!activeFabricId) {
            m.material.map = null
        }
        m.material.color.set(hex)
        m.material.needsUpdate = true
    })
    if (shirtColorInp) shirtColorInp.value = hex
    document.querySelectorAll('.swatch').forEach(s => s.classList.toggle('active', s.dataset.hex === hex))
}

if (swatchWrap) {
    COLORS.forEach(c => {
        const s = document.createElement('div')
        s.className = 'swatch' + (c.hex === '#ffffff' ? ' active' : '')
        s.style.background = c.hex
        if (LIGHT_HEX.has(c.hex)) { s.style.outline = '1px solid #475569'; s.style.outlineOffset = '-2px' }
        s.dataset.hex = c.hex
        s.title = c.name
        s.addEventListener('click', () => applyShirtColor(c.hex))
        swatchWrap.appendChild(s)
    })
}
shirtColorInp?.addEventListener('input', e => applyShirtColor(e.target.value))

// ── SIZE BUTTONS ──────────────────────
document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
    })
})

// ── SHIRT ROTATION ────────────────────
// Крутиться МОДЕЛЬ, не камера.
// Принт при цьому залишається нерухомим у scene space.
function rotateShirt(dx, dy) {
    if (!tshirtModel) return
    rotY += dx * 0.008
    rotX += dy * 0.008
    rotX = Math.max(-0.65, Math.min(0.65, rotX))
    tshirtModel.rotation.y = rotY
    tshirtModel.rotation.x = rotX
    tshirtModel.updateMatrixWorld(true)
}

// ── MULTI-PRINT SYSTEM ────────────────
// prints[]  — масив всіх доданих принтів
// activePrint — той, яким зараз керуємо
// Кожен принт: { mesh, size, angle, label, id }

let prints      = []
let activePrint = null
let printIdCounter = 0

// Сумісність зі старим кодом (деякі функції ще читають printMesh)
Object.defineProperty(window, 'printMesh', { get: () => activePrint?.mesh ?? null })

function createPrint(texture, label) {
    const id   = ++printIdCounter
    const size = 1.0
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({
            map:                 texture,
            transparent:         true,
            alphaTest:           0.01,
            depthTest:           true,
            depthWrite:          false,
            polygonOffset:       true,
            polygonOffsetFactor: -6,
            polygonOffsetUnits:  -6,
            side:                THREE.FrontSide,
        })
    )
    mesh.scale.setScalar(size)
    mesh.renderOrder = 1

    if (tshirtModel) {
        mesh.position.set(0, 1.2, 0.62)
        tshirtModel.add(mesh)
    } else {
        mesh.position.set(0, 0.2, 0.62)
        scene.add(mesh)
    }

    const print = { id, mesh, size, angle: 0, label }
    prints.push(print)
    setActivePrint(print)
    updatePrintList()
    showPrintUI()
    return print
}

function setActivePrint(print) {
    // Знімаємо підсвічування з попереднього
    if (activePrint) activePrint.mesh.material.opacity = 1.0

    activePrint = print

    // Синхронізуємо слайдер розміру
    const sl = document.getElementById('printSize')
    if (sl && print) sl.value = (print.size / 5) * 3

    updatePrintList()
    setPrintTool('move')
}

function removeActivePrint() {
    if (!activePrint) return
    const idx = prints.indexOf(activePrint)
    if (idx !== -1) prints.splice(idx, 1)
    const mesh = activePrint.mesh
    if (mesh.parent) mesh.parent.remove(mesh)
    else scene.remove(mesh)
    mesh.geometry.dispose()
    mesh.material.dispose()
    activePrint = null

    // Активуємо останній що залишився
    if (prints.length) {
        setActivePrint(prints[prints.length - 1])
    } else {
        document.getElementById('printToolbar').style.display = 'none'
        if (mswPrint) mswPrint.style.display = 'none'
        setMainMode('shirt')
    }
    updatePrintList()
}

function updatePrintList() {
    const list    = document.getElementById('printList')
    const section = document.getElementById('printsListSection')
    if (!list) return

    if (!prints.length) {
        if (section) section.style.display = 'none'
        list.innerHTML = ''
        return
    }

    if (section) section.style.display = ''

    list.innerHTML = ''
    prints.forEach(p => {
        const item = document.createElement('div')
        item.className = 'print-list-item' + (p === activePrint ? ' active' : '')
        item.innerHTML = `
            <span class="pli-label">${p.label}</span>
            <button class="pli-del" data-id="${p.id}" title="Delete">✕</button>
        `
        item.addEventListener('click', e => {
            if (e.target.classList.contains('pli-del')) return
            setActivePrint(p)
            setMainMode('print')
        })
        item.querySelector('.pli-del').addEventListener('click', () => {
            const wasActive = (p === activePrint)
            const idx = prints.indexOf(p)
            if (idx !== -1) prints.splice(idx, 1)
            if (p.mesh.parent) p.mesh.parent.remove(p.mesh)
            p.mesh.geometry.dispose(); p.mesh.material.dispose()
            if (wasActive) {
                activePrint = null
                if (prints.length) setActivePrint(prints[prints.length - 1])
                else {
                    document.getElementById('printToolbar').style.display = 'none'
                    if (mswPrint) mswPrint.style.display = 'none'
                    setMainMode('shirt')
                }
            }
            updatePrintList()
        })
        list.appendChild(item)
    })
}

// ── RAYCAST → LOCAL SURFACE ───────────
function placePrintAtPointer(e) {
    if (!activePrint || !tshirtModel) return
    const rect = renderer.domElement.getBoundingClientRect()
    mouseVec.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1
    mouseVec.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1
    raycaster.setFromCamera(mouseVec, camera)

    tshirtModel.updateMatrixWorld(true)
    const hits = raycaster.intersectObjects(shirtMeshes, false)
    if (!hits.length) return
    const hit = hits[0]

    const localPos  = tshirtModel.worldToLocal(hit.point.clone())
    const meshNM    = new THREE.Matrix3().getNormalMatrix(hit.object.matrix)
    const localNorm = hit.face.normal.clone().applyMatrix3(meshNM).normalize()

    const mesh = activePrint.mesh
    mesh.position.copy(localPos).addScaledVector(localNorm, 0.008)
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), localNorm)

    if (activePrint.angle !== 0) {
        mesh.quaternion.premultiply(
            new THREE.Quaternion().setFromAxisAngle(localNorm, activePrint.angle)
        )
    }
}

// ── POINTER EVENTS ────────────────────
renderer.domElement.addEventListener('pointerdown', e => {
    pointerDown = true
    lastX = e.clientX
    lastY = e.clientY

    if (mainMode === 'print' && printTool === 'move' && activePrint) {
        placePrintAtPointer(e)
        e.stopPropagation()
    }
})

window.addEventListener('pointermove', e => {
    if (!pointerDown) return
    const dx = e.clientX - lastX
    const dy = e.clientY - lastY
    lastX = e.clientX
    lastY = e.clientY

    if (mainMode === 'shirt') { rotateShirt(dx, dy); return }
    if (!activePrint) return

    if (printTool === 'move') {
        placePrintAtPointer(e)

    } else if (printTool === 'scale') {
        activePrint.size = Math.max(0.1, Math.min(5, activePrint.size - dy * 0.012))
        activePrint.mesh.scale.setScalar(activePrint.size)
        const sl = document.getElementById('printSize')
        if (sl) sl.value = (activePrint.size / 5) * 3

    } else if (printTool === 'rotate') {
        activePrint.angle -= dx * 0.02
        const mesh = activePrint.mesh
        const fwd  = new THREE.Vector3(0, 0, 1).applyQuaternion(mesh.quaternion).normalize()
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), fwd)
        mesh.quaternion.premultiply(
            new THREE.Quaternion().setFromAxisAngle(fwd, activePrint.angle)
        )
    }
})

window.addEventListener('pointerup', () => { pointerDown = false })

// Колесо миші — zoom
renderer.domElement.addEventListener('wheel', e => {
    e.preventDefault()
    camera.position.z = Math.max(2, Math.min(8, camera.position.z + e.deltaY * 0.01))
}, { passive: false })

// ── MAIN MODE ─────────────────────────
const mswShirt = document.getElementById('mswShirt')
const mswPrint = document.getElementById('mswPrint')

function setMainMode(m) {
    mainMode = m
    mswShirt?.classList.toggle('active', m === 'shirt')
    mswPrint?.classList.toggle('active', m === 'print')
    updateHint()
}
mswShirt?.addEventListener('click', () => setMainMode('shirt'))
mswPrint?.addEventListener('click', () => setMainMode('print'))

// ── PRINT TOOL ────────────────────────
function setPrintTool(t) {
    printTool = t
    document.querySelectorAll('.ptool-btn').forEach(b => b.classList.remove('active'))
    document.getElementById({move:'ptMove',scale:'ptScale',rotate:'ptRotate'}[t])?.classList.add('active')
    setMainMode('print')
}

document.getElementById('ptMove')?.addEventListener('click',   () => setPrintTool('move'))
document.getElementById('ptScale')?.addEventListener('click',  () => setPrintTool('scale'))
document.getElementById('ptRotate')?.addEventListener('click', () => setPrintTool('rotate'))

document.getElementById('ptRemove')?.addEventListener('click', () => removeActivePrint())

// ── PRINT SIZE SLIDER ─────────────────
document.getElementById('printSize')?.addEventListener('input', e => {
    if (!activePrint) return
    activePrint.size = parseFloat(e.target.value) * 0.6
    activePrint.mesh.scale.setScalar(activePrint.size)
})

// ── SHOW PRINT UI ─────────────────────
function showPrintUI() {
    document.getElementById('printToolbar').style.display = 'flex'
    if (mswPrint) mswPrint.style.display = ''
    setMainMode('print')
    setPrintTool('move')
}

// ── PRINT UPLOAD ──────────────────────
// Кожне нове зображення = новий незалежний принт
document.getElementById('printUpload')?.addEventListener('change', e => {
    const file = e.target.files[0]; if (!file) return
    const label = '🖼️ ' + file.name.slice(0, 16)
    const reader = new FileReader()
    reader.onload = ev => {
        const img = new Image()
        img.onload = () => {
            // Малюємо на canvas щоб мати CanvasTexture
            const c = document.createElement('canvas')
            c.width = img.naturalWidth; c.height = img.naturalHeight
            c.getContext('2d').drawImage(img, 0, 0)
            const tex = new THREE.CanvasTexture(c)
            tex.encoding = THREE.sRGBEncoding
            createPrint(tex, label)
        }
        img.src = ev.target.result
    }
    reader.readAsDataURL(file)
    // Скидаємо input щоб можна було додати те саме фото ще раз
    e.target.value = ''
})

// ── TEXT → НОВИЙ ПРИНТ ────────────────
// Кожне додавання тексту = новий незалежний принт
document.getElementById('addTextBtn')?.addEventListener('click', () => {
    const text  = document.getElementById('textInput')?.value?.trim()
    const color = document.getElementById('textColor')?.value  || '#000000'
    const font  = document.getElementById('textFont')?.value   || 'Arial'
    if (!text) return

    const c = document.createElement('canvas')
    c.width = 512; c.height = 160
    const ctx = c.getContext('2d')
    ctx.clearRect(0, 0, 512, 160)
    let fs = 110
    ctx.font = `bold ${fs}px ${font}`
    while (ctx.measureText(text).width > 490 && fs > 12) { fs -= 2; ctx.font = `bold ${fs}px ${font}` }
    ctx.fillStyle = color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 3
    ctx.fillText(text, 256, 80)
    ctx.shadowBlur = 0

    const tex = new THREE.CanvasTexture(c)
    tex.encoding = THREE.sRGBEncoding
    createPrint(tex, '✍️ ' + text.slice(0, 14))

    // Не очищуємо текстове поле — зручно додати ще один варіант
})

// ── PATTERN ───────────────────────────
document.getElementById('patternUpload')?.addEventListener('change', e => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
        const tex = new THREE.TextureLoader().load(ev.target.result)
        tex.flipY = false
        tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping
        tex.repeat.set(1, 1)
        tex.needsUpdate = true
        shirtMeshes.forEach(m => { m.material.map = tex; m.material.color.set(0xffffff); m.material.needsUpdate = true })
    }
    reader.readAsDataURL(file)
})
document.getElementById('resetTexture')?.addEventListener('click', () => {
    resetFabric()
    const hex = shirtColorInp?.value || '#ffffff'
    shirtMeshes.forEach(m => { m.material.map = null; m.material.color.set(hex); m.material.needsUpdate = true })
})

// ── SAVE ──────────────────────────────
document.getElementById('savePreviewBtn')?.addEventListener('click', () => {
    renderer.render(scene, camera)
    const a = document.createElement('a')
    a.href = renderer.domElement.toDataURL('image/png')
    a.download = 'my-tshirt.png'
    a.click()
})

// ── HINTS ─────────────────────────────
function updateHint() {
    const p = document.getElementById('hintPanel')
    if (!p) return
    if (mainMode === 'shirt') { p.textContent = '🌐 Drag — rotate shirt. Scroll — zoom.'; return }
    p.textContent = {
        move:   '✋ Drag on shirt — move print',
        scale:  '⇲ Drag up/down — resize',
        rotate: '↻ Drag left/right — rotate print',
    }[printTool] || ''
}
updateHint()

// ── RESIZE ────────────────────────────
window.addEventListener('resize', () => {
    camera.aspect = sceneContainer.clientWidth / sceneContainer.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight)
})

// ── ANIMATE ───────────────────────────
;(function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
})()

} // end constructor
