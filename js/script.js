let orgImgData
let tryImgData
let curImgData

const orgImgElm = document.createElement("img")

const orgCanvasElm = document.querySelector("canvas:nth-of-type(1)")
const tryCanvasElm = document.querySelector("canvas:nth-of-type(2)")
const curCanvasElm = document.querySelector("canvas:nth-of-type(3)")
const curSvgElm = document.querySelector("svg")
const gElm = document.createElementNS("http://www.w3.org/2000/svg", "g")
const styleElm = document.createElementNS("http://www.w3.org/2000/svg", "style")
styleElm.textContent = `text {
    font-family: Courier;
    text-anchor: middle;
    dominant-baseline: central;
}`
curSvgElm.appendChild(styleElm)
curSvgElm.appendChild(gElm)

curCanvasElm.style.display = "none"
tryCanvasElm.style.display = "none"

const orgCtx = orgCanvasElm.getContext("2d")
const tryCtx = tryCanvasElm.getContext("2d", { willReadFrequently: true })
const curCtx = curCanvasElm.getContext("2d", { willReadFrequently: true })

const txtElm = document.querySelector("div")

const charArr = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?"

orgImgElm.onload = _evt => {
    const { width, height } = orgImgElm

    orgCanvasElm.width = curCanvasElm.width = tryCanvasElm.width = curSvgElm.width = width
    orgCanvasElm.height = curCanvasElm.height = tryCanvasElm.height = curSvgElm.height = height

    orgCtx.drawImage(orgImgElm, 0, 0)

    orgImgData = orgCtx.getImageData(0, 0, width, height)

    tryCtx.fillStyle = "rgb(255, 255, 255)"
    tryCtx.rect(0, 0, width, height)
    tryCtx.fill()

    tryCtx.textAlign = "center"
    tryCtx.textBaseline = "middle"

    let cnt = 0
    let drawCnt = 0
    let tryTotal = 0
    let curTotal = 0

    const ticker = _ => {
        txtElm.innerHTML = "" +
            `generation: ${cnt}<br>` +
            `draw: ${drawCnt}<br>` +
            `difference: ${curTotal}`

        const x = Math.floor(Math.random() * width)
        const y = Math.floor(Math.random() * width)
        const size = Math.ceil(Math.random() * width)
        const char = charArr[Math.floor(Math.random() * charArr.length)]
        const hue = Math.floor(360 * Math.random())
        const saturation = Math.ceil(Math.random() * 98)
        const color = `hsl(${hue}, 100%, ${saturation}%)`

        tryCtx.fillStyle = color
        tryCtx.font = `${size}px Courier`
        tryCtx.fillText(char, x, y)

        cnt++

        tryImgData = tryCtx.getImageData(0, 0, width, height)
        curImgData = curCtx.getImageData(0, 0, width, height)

        tryTotal = [...orgImgData.data].reduce((p, c, i) => p + (c - tryImgData.data[i]) ** 2, 0)
        curTotal = [...orgImgData.data].reduce((p, c, i) => p + (c - curImgData.data[i]) ** 2, 0)

        if (tryTotal < curTotal) {
            curCtx.putImageData(tryImgData, 0, 0)
            drawCnt++

            const textElm = document.createElementNS("http://www.w3.org/2000/svg", "text")
            textElm.setAttribute("x", x)
            textElm.setAttribute("y", y)
            textElm.setAttribute("font-size", size)
            textElm.setAttribute("fill", color)
            textElm.textContent = char
            gElm.appendChild(textElm)
        } else {
            tryCtx.putImageData(curImgData, 0, 0)
        }

        requestAnimationFrame(ticker)
    }

    ticker()
}

orgImgElm.src = "img/image.png"
