let orgImgData;
let tryImgData;
let curImgData;

const orgImg = document.createElement("img")

const orgCanvas = document.querySelector("canvas:nth-of-type(1)")
const tryCanvas = document.querySelector("canvas:nth-of-type(2)")
const curCanvas = document.querySelector("canvas:nth-of-type(3)")
const curSvg = document.querySelector("svg")

orgCanvas.style.display = "none"
curCanvas.style.display = "none"
tryCanvas.style.display = "none"

const orgCtx = orgCanvas.getContext("2d")
const tryCtx = tryCanvas.getContext("2d", { willReadFrequently: true })
const curCtx = curCanvas.getContext("2d", { willReadFrequently: true })

const txtElm = document.querySelector("div")

orgImg.onload = async evt => {
    orgCtx.drawImage(orgImg, 0, 0)

    orgImgData = orgCtx.getImageData(0, 0, 256, 256)

    tryCtx.fillStyle = "rgb(255, 255, 255)"
    // tryCtx.fillStyle = "rgb(128, 128, 128)"
    tryCtx.rect(0, 0, 256, 256)
    tryCtx.fill()
    // curCtx.fillStyle = "rgb(255, 255, 255)"
    // curCtx.rect(0, 0, 256, 256)
    // curCtx.fill()

    // for (let i = 0; i < 1024; i++) {
    //     tryImgData = tryCtx.getImageData(0, 0, 256, 256)

    //     tryCtx.moveTo(16, 16)
    //     tryCtx.beginPath();
    //     tryCtx.fillStyle = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`
    //     tryCtx.arc(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 24 + 24), 0, 2 * Math.PI)
    //     tryCtx.fill()

    //     curCtx.putImageData(tryImgData, 0, 0)
    // }

    let cnt = 0
    let drawCnt = 0
    let tryTotal = 0
    let curTotal = 0

    const ticker = _ => {
        txtElm.innerHTML = "" +
            `generation: ${cnt}<br>`

        tryImgData = tryCtx.getImageData(0, 0, 256, 256)
        curImgData = curCtx.getImageData(0, 0, 256, 256)

        let x = 128
        let y = 128
        let c = 0
        let pos = 0

        for (let i = 0; i < orgImgData.data.length; i++) {
            if (i % 4 !== 0) {
                continue
            }

            // const rDiff = orgImgData.data[i] - tryImgData.data[i]
            // const gDiff = orgImgData.data[i + 1] - tryImgData.data[i + 1]
            // const bDiff = orgImgData.data[i + 2] - tryImgData.data[i + 2]
            const diff = Math.max(orgImgData.data[i], orgImgData.data[i + 1], orgImgData.data[i + 2]) - Math.max(tryImgData.data[i], tryImgData.data[i + 1], tryImgData.data[i + 2])

            const tmpVal = Math.abs(diff)

            if (tmpVal > c) {
                c = tmpVal
                pos = i / 4
            }
        }

        x = pos % 256
        y = Math.floor(pos / 256)

        tryCtx.moveTo(16, 16)
        tryCtx.beginPath();
        // tryCtx.fillStyle = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`
        // const radius = Math.ceil(Math.random() * 48 * Math.exp(- cnt / 65536))
        tryCtx.fillStyle = `rgb(${orgImgData.data[pos * 4]}, ${orgImgData.data[pos * 4 + 1]}, ${orgImgData.data[pos * 4 + 2]})`
        // const radius = Math.floor(Math.random() * 3)
        const radius = Math.random() * 3
        tryCtx.arc(x, y, radius, 0, 2 * Math.PI)
        tryCtx.fill()

        cnt++

        curCtx.putImageData(tryImgData, 0, 0)
        requestAnimationFrame(ticker)

        const circleElm = document.createElementNS("http://www.w3.org/2000/svg", "circle")
        circleElm.setAttribute("cx", x)
        circleElm.setAttribute("cy", y)
        circleElm.setAttribute("r", radius)
        circleElm.setAttribute("fill", tryCtx.fillStyle)
        curSvg.appendChild(circleElm)

        // tryTotal = [...orgImgData.data].reduce((p, c, i) => p + Math.abs(c - tryImgData.data[i]), 0)
        // curTotal = [...orgImgData.data].reduce((p, c, i) => p + Math.abs(c - curImgData.data[i]), 0)

        // if (tryTotal === curTotal) {
        //     curCtx.putImageData(tryImgData, 0, 0)
        //     requestAnimationFrame(ticker)
        // } else if (tryTotal < curTotal) {
        //     curCtx.putImageData(tryImgData, 0, 0)
        //     drawCnt++
        //     requestAnimationFrame(ticker)
        // } else {
        //     curCtx.putImageData(tryImgData, 0, 0)
        //     requestAnimationFrame(ticker)
        // }
    }

    ticker()
}

orgImg.src = "img/image.png"
