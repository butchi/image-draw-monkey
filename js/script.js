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

    let size = 0

    const ticker = _ => {
        txtElm.innerHTML = "" +
            `generation: ${cnt}<br>` +
            `draw: ${drawCnt}<br>` +
            `difference: ${curTotal}`

        let x = 128
        let y = 128
        let c = 0
        let pos = 0

        if (size < Math.max(width, height)) {
            tryImgData = tryCtx.getImageData(0, 0, width, height)
            curImgData = curCtx.getImageData(0, 0, width, height)

            for (let i = 0; i < orgImgData.data.length; i++) {
                if (i % 4 !== 0) {
                    continue
                }

                const origRgbArr = orgImgData.data.slice(i, i + 3)
                const tryRgbArr = tryImgData.data.slice(i, i + 3)
                const diff = Math.abs(calcSaturate(...origRgbArr) - calcSaturate(...tryRgbArr))

                const tmpVal = Math.abs(diff)

                if (tmpVal > c) {
                    c = tmpVal
                    pos = i / 4
                }
            }

            x = (pos % width) + (Math.random() * 3 - 1.5)
            y = Math.floor(pos / width) + (Math.random() * 3 - 1.5)

            tryCtx.beginPath();
            // tryCtx.fillStyle = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`
            // const radius = Math.ceil(Math.random() * 48 * Math.exp(- cnt / 65536))
            const rgbArr = orgImgData.data.slice(pos * 4, pos * 4 + 3)
            const rgbMaxVal = Math.max(...rgbArr)

            tryCtx.fillStyle = `rgba(${rgbArr.map(val => val / 0.65).join(", ")}, ${0.65})`
            // const radius = Math.floor(Math.random() * 3)
            const radius = size / 2
            tryCtx.arc(x, y, radius, 0, 2 * Math.PI)
            tryCtx.fill()

            cnt++

            tryImgData = tryCtx.getImageData(0, 0, width, height)

            tryTotal = [...orgImgData.data].reduce((p, c, i) => p + Math.abs(c - tryImgData.data[i]), 0)
            curTotal = [...orgImgData.data].reduce((p, c, i) => p + Math.abs(c - curImgData.data[i]), 0)

            if (tryTotal < curTotal) {
                curCtx.putImageData(tryImgData, 0, 0)
                drawCnt++

                const circleElm = document.createElementNS("http://www.w3.org/2000/svg", "circle")
                circleElm.setAttribute("cx", x)
                circleElm.setAttribute("cy", y)
                circleElm.setAttribute("r", radius)
                circleElm.setAttribute("fill", tryCtx.fillStyle)
                curSvgElm.appendChild(circleElm)

                size *= 1.11
            } else {
                tryCtx.putImageData(curImgData, 0, 0)

                size = Math.max(3 * 5000 / (5000 + cnt), 1.1)
            }
        }

        requestAnimationFrame(ticker)
    }

    ticker()
}

orgImgElm.src = "img/image.png"
