let orgImgData;
let tryImgData;
let curImgData;

const orgImgElm = document.createElement("img")

const orgCanvasElm = document.querySelector("canvas:nth-of-type(1)")
const tryCanvasElm = document.querySelector("canvas:nth-of-type(2)")
const curCanvasElm = document.querySelector("canvas:nth-of-type(3)")
const curSvgElm = document.querySelector("svg")

orgCanvasElm.style.display = "none"
curCanvasElm.style.display = "none"
tryCanvasElm.style.display = "none"

const orgCtx = orgCanvasElm.getContext("2d")
const tryCtx = tryCanvasElm.getContext("2d", { willReadFrequently: true })
const curCtx = curCanvasElm.getContext("2d", { willReadFrequently: true })

const txtElm = document.querySelector("div")

charArr = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

orgImgElm.onload = async evt => {
    const { width, height } = orgImgElm

    orgCanvasElm.width = curCanvasElm.width = tryCanvasElm.width = curSvgElm.width = width
    orgCanvasElm.height = curCanvasElm.height = tryCanvasElm.height = curSvgElm.height = height

    orgCtx.drawImage(orgImgElm, 0, 0)

    orgImgData = orgCtx.getImageData(0, 0, width, height)

    tryCtx.fillStyle = "rgb(255, 255, 255)"
    tryCtx.rect(0, 0, width, height)
    tryCtx.fill()

    let cnt = 0
    let drawCnt = 0
    let tryTotal = 0
    let curTotal = 0

    const ticker = _ => {
        txtElm.innerHTML = "" +
            `generation: ${cnt}<br>` +
            `draw: ${drawCnt}<br>` +
            `difference: ${curTotal}`

        tryImgData = tryCtx.getImageData(0, 0, width, height)
        curImgData = curCtx.getImageData(0, 0, width, height)

        const x = Math.floor(Math.random() * width)
        const y = Math.floor(Math.random() * height)
        const size = Math.floor(Math.random() * height)
        const char = charArr[Math.floor(Math.random() * charArr.length)]
        rgbArr = [
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
        ]

        tryCtx.fillStyle = `rgb(${rgbArr.join(", ")})`
        tryCtx.font = `${size}px Courier`
        tryCtx.textAlign = "center"
        tryCtx.textBaseline = "middle"
        tryCtx.fillText(char, x, y)

        cnt++

        tryImgData = tryCtx.getImageData(0, 0, width, height)

        tryTotal = [...orgImgData.data].reduce((p, c, i) => p + Math.abs(c - tryImgData.data[i]), 0)
        curTotal = [...orgImgData.data].reduce((p, c, i) => p + Math.abs(c - curImgData.data[i]), 0)

        if (tryTotal < curTotal) {
            curCtx.putImageData(tryImgData, 0, 0)
            drawCnt++

            const textElm = document.createElementNS("http://www.w3.org/2000/svg", "text")
            textElm.setAttribute("x", x)
            textElm.setAttribute("y", y)
            textElm.setAttribute("font-size", size)
            textElm.setAttribute("font-family", "Courier")
            textElm.setAttribute("text-anchor", "middle")
            textElm.setAttribute("dominant-baseline", "central")
            textElm.setAttribute("fill", tryCtx.fillStyle)
            textElm.textContent = char
            curSvgElm.appendChild(textElm)
        } else {
            tryCtx.putImageData(curImgData, 0, 0)
        }

        requestAnimationFrame(ticker)
    }

    ticker()
}

orgImgElm.src = "img/image.png"
