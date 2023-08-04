let origImgData;
let newImgData;
const origImg = document.createElement("img")

const origCanvas = document.querySelector("canvas:nth-of-type(1)")
const tryCanvas = document.querySelector("canvas:nth-of-type(2)")
const newCanvas = document.querySelector("canvas:nth-of-type(3)")

const origCtx = origCanvas.getContext("2d")
const tryCtx = tryCanvas.getContext("2d", { willReadFrequently: true })
const newCtx = newCanvas.getContext("2d", { willReadFrequently: true })

const txtElm = document.querySelector("div")

origImg.onload = async evt => {
    origCtx.drawImage(origImg, 0, 0)

    origImgData = origCtx.getImageData(0, 0, 256, 256)

    tryCtx.fillStyle = "rgb(128, 128, 128)"
    tryCtx.rect(0, 0, 256, 256)
    tryCtx.fill()
    newCtx.fillStyle = "rgb(128, 128, 128)"
    newCtx.rect(0, 0, 256, 256)
    newCtx.fill()

    for (let i = 0; i < 1024; i++) {
        tryImgData = tryCtx.getImageData(0, 0, 256, 256)

        tryCtx.moveTo(16, 16)
        tryCtx.beginPath();
        tryCtx.fillStyle = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`
        tryCtx.arc(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 24 + 24), 0, 2 * Math.PI)
        tryCtx.fill()

        newCtx.putImageData(tryImgData, 0, 0)
    }

    let cnt = 0
    let drawCnt = 0
    let tryTotal = 0
    let newTotal = 0

    const ticker = _ => {
        txtElm.innerHTML = "" +
            `generation: ${cnt}<br>` +
            `draw: ${drawCnt}<br>` +
            `difference: ${newTotal}`

        tryImgData = tryCtx.getImageData(0, 0, 256, 256)
        newImgData = newCtx.getImageData(0, 0, 256, 256)

        tryCtx.moveTo(16, 16)
        tryCtx.beginPath();
        tryCtx.fillStyle = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`
        const x = Math.floor(Math.random() * 256)
        const y = Math.floor(Math.random() * 256)
        const radius = Math.ceil(Math.random() * 48 * Math.exp(- cnt / 65536))
        tryCtx.arc(x, y, radius, 0, 2 * Math.PI)
        tryCtx.fill()

        cnt++

        tryTotal = [...origImgData.data].reduce((p, c, i) => p + Math.abs(c - tryImgData.data[i]), 0)
        newTotal = [...origImgData.data].reduce((p, c, i) => p + Math.abs(c - newImgData.data[i]), 0)

        console.log(tryTotal, newTotal)

        if (tryTotal === newTotal) {
            newCtx.putImageData(tryImgData, 0, 0)
            requestAnimationFrame(ticker)
        } else if (tryTotal < newTotal) {
            newCtx.putImageData(tryImgData, 0, 0)
            drawCnt++
            ticker()
        } else {
            tryCtx.putImageData(newImgData, 0, 0)
            requestAnimationFrame(ticker)
        }
    }

    ticker()
}

origImg.src = "img/image.png"
