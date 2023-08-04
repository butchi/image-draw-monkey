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

const calcSaturate = (r, g, b) => 0.2989 * r + 0.5870 * g + 0.1140 * b //weights from CCIR 601 spec

const txtElm = document.querySelector("div")

orgImgElm.onload = async evt => {
    const { width, height } = orgImgElm

    orgCanvasElm.width = curCanvasElm.width = tryCanvasElm.width = curSvgElm.width = width
    orgCanvasElm.height = curCanvasElm.height = tryCanvasElm.height = curSvgElm.height = height

    orgCtx.drawImage(orgImgElm, 0, 0)

    orgImgData = orgCtx.getImageData(0, 0, width, height)

    tryCtx.fillStyle = "rgb(255, 255, 255)"
    // tryCtx.fillStyle = "rgb(128, 128, 128)"
    tryCtx.rect(0, 0, width, height)
    tryCtx.fill()
    // curCtx.fillStyle = "rgb(255, 255, 255)"
    // curCtx.rect(0, 0, width, height)
    // curCtx.fill()

    let cnt = 0
    let drawCnt = 0
    let tryTotal = 0
    let curTotal = 0

    const len = 5

    const ticker = _ => {
        txtElm.innerHTML = "" +
            `generation: ${cnt}<br>` +
            `draw: ${drawCnt}<br>` +
            `difference: ${curTotal}`

        let xArr = []
        let yArr = []
        let cArr = (new Array(len)).fill(0)
        let posArr = []

        tryImgData = tryCtx.getImageData(0, 0, width, height)
        curImgData = curCtx.getImageData(0, 0, width, height)

        for (let l = 0; l < len; l++) {
            for (let i = 0; i < orgImgData.data.length; i++) {
                if (i % 4 !== 0) {
                    continue
                }

                const diff = Math.abs(calcSaturate(orgImgData.data[i], orgImgData.data[i + 1], orgImgData.data[i + 2]) - calcSaturate(tryImgData.data[i], tryImgData.data[i + 1], tryImgData.data[i + 2]))

                const tmpVal = Math.abs(diff)

                if (tmpVal > cArr[l] && (l === 0 || posArr[l] !== posArr[l - 1])) {
                    cArr[l] = tmpVal
                    posArr[l] = i / 4

                    xArr[l] = (posArr[l] % width) + 5 * (Math.random() - .5)
                    yArr[l] = Math.floor(posArr[l] / width) + 5 * (Math.random() - .5)
                }
            }
        }

        for (let l = 1; l < len; l++) {
            tryCtx.strokeStyle = `rgb(${orgImgData.data[posArr[0] * 4]}, ${orgImgData.data[posArr[0] * 4 + 1]}, ${orgImgData.data[posArr[0] * 4 + 2]})`
            tryCtx.lineCap = "round"
            tryCtx.lineWidth = 1
            tryCtx.beginPath();
            tryCtx.moveTo(xArr[0], yArr[0])
            for (let i = 1; i <= l; i++) {
                tryCtx.lineTo(xArr[i], yArr[i])
            }
            tryCtx.stroke()

            tryImgData = tryCtx.getImageData(0, 0, width, height)

            tryTotal = [...orgImgData.data].reduce((p, c, i) => p + Math.abs(c - tryImgData.data[i]), 0)
            curTotal = [...orgImgData.data].reduce((p, c, i) => p + Math.abs(c - curImgData.data[i]), 0)

            if (tryTotal < curTotal) {
                curCtx.putImageData(tryImgData, 0, 0)
                drawCnt++

                const lineElm = document.createElementNS("http://www.w3.org/2000/svg", "polyline")
                const ptStr = (new Array(len)).fill(0).map((_, i) => `${xArr[i]}, ${yArr[i]}`).join(" ")
                lineElm.setAttribute("fill", "none")
                lineElm.setAttribute("points", ptStr)
                lineElm.setAttribute("stroke-width", tryCtx.lineWidth)
                lineElm.setAttribute("stroke-linecap", tryCtx.lineCap)
                lineElm.setAttribute("stroke", tryCtx.strokeStyle)
                curSvgElm.appendChild(lineElm)
            } else {
                tryCtx.putImageData(curImgData, 0, 0)
            }
        }

        cnt++

        requestAnimationFrame(ticker)
    }

    ticker()
}

orgImgElm.src = "img/image.png"
