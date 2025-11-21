import { useState, useEffect, useContext, useRef } from 'react';
import { Context } from '../App';

function Monitoring() {
    const { isTesting, setIsTesting } = useContext(Context);
    const [socketConfig, setSocketConfig] = useState({});
    const [stream, setStream] = useState(null);
    const [socket, setSocket] = useState(null);
    const [isServerReady, setIsServerReady] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [streamEventText, setStreamEventText] = useState(null);
    const [batchSnapshotText, setBatchSnapshotText] = useState(null);
    const [videoTimer, setVideoTimer] = useState(null);
    const [mediaStream, setMediaStream] = useState(null)
    const videoRef = useRef(null)

    const VIDEO_FRAME_INTERVAL_MS = 1500;
    const BATCH_INTERVAL_MS = 5000;

    /**
     * 
     * TODO batch snapshots function, 
     * stop monitoring function
     * 
     * prep data in state variables to send to backend for storage
     * 
     * 
     */

    // html 
    let videoElement = mediaStream ? <video ref={videoRef} id="camera-preview" muted={true} playsInline></video> : <video id="camera-preview" muted={true} playsInline></video>;

    const previewElement = <div className="preview">
        {videoElement}
    </div>;

    const streamOutputElement = <pre id="stream-output">{streamEventText ?? "No data yet."}</pre>;
    const batchOutputElement = <pre id="batch-output">{batchSnapshotText ?? "No snapshots yet."}</pre>;

    useEffect(()=>{
        if (videoRef.current && mediaStream) {
            videoRef.current.srcObject=mediaStream;
            videoRef.current.play().catch(error => {
                console.error(`Error playing video stream:`, error)
            })
        }
    }, [mediaStream])

    useEffect(() => {
        // call function to start video monitoring in browser
        if(isTesting){
            startMonitoring();
        }else{
            disableMedia();
        }


    }, [isTesting])

    useEffect(() => {
        // loadConfig();
    }, []);


    async function blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                try {
                    const result = reader.result;
                    if (typeof result !== 'string') return reject(new Error('Unexpected reader result type'));
                    const [, base64] = result.split(',');
                    resolve(base64 ?? '');
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(reader.error ?? new Error('Failed to read blob'));
            reader.readAsDataURL(blob);
        });
    }


    function buildWebSocketUrl({ baseUrl, apiKey, configId }) {
        const normalizedBase = (baseUrl ?? 'https://api.hume.ai/v0').replace(/\/+$/, '');
        const protocolReplaced = normalizedBase.replace(/^http(s?):\/\//, (_, tls) => (tls === 's' ? 'wss://' : 'ws://'));
        const wsBase = protocolReplaced.startsWith('ws') ? protocolReplaced : `wss://${protocolReplaced}`;
        const params = new URLSearchParams({ apikey: apiKey });
        if (configId) {
            params.set('config_id', configId);
        }
        return `${wsBase}/stream/models?${params.toString()}`;
    }

    async function enableMedia() {
        if (mediaStream) {
            return;
        };

        const media = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        })

        // console.log('Stream tracks:', media.getTracks()); 
        setMediaStream(media);
        setStatusMessage('Camera and microphone active.');
    };

    async function disableMedia() {
        //await stopMonitoring();
        mediaStream?.getTracks().forEach((track) => {
            track.stop();
        });
        setMediaStream(null);
        setStatusMessage("Camera and microphone released");
    };

    async function startMonitoring(metadata) { 
        await enableMedia();
        await openSocket(config)
        await startVideoStreaming(metadata);
        await startBatchSnapshots(metadata);
        await setStatusMessage("Monitoring enabled via Hume Expression Measurement (video only).");
    };
    async function stopMonitoring() { 



    };


    async function loadConfig() {
        let response = await fetch('Http://localhost:3000/api/hume/config');
        let config = await response.json();
        setSocketConfig(config);
    }
    async function openSocket() {
        const wsURL = buildWebSocketUrl(socketConfig);
        await new Promise((resolve, reject) => {
            const socket = new WebSocket(wsUrl);

            //?
            let settled = false;

            socket.addEventListener('open', () => {
                settled = true;
                setSocket(socket);
                setIsServerReady(true);
                setStatusMessage('Connected to Hume streaming endpoint.');
                resolve();
            });

            socket.addEventListener("message", (event) => {
                handleSocketMessage(event);
            });

            socket.addEventListener("close", (event) => {
                setSocket(null)
                setIsServerReady(true);
                if (!settled) {
                    settled = true;
                    reject(new Error(`Streaming socket closed before connection was established (code ${event.code})`));
                } else {
                    setStatusMessage("Streaming socket closed");
                }
            });

            socket.addEventListener("error", (event) => {
                if (!settled) {
                    settled = true;
                    reject(new Error('Failed to establish connection to Hume streaming endpoint'));
                } else {
                    this.updateStatus(`Streaming error: ${event.message ?? 'unknown error'}`);
                }

            });

            //setSocket(socket);
        });
    };

    async function startVideoStreaming() {
        if (mediaStream) {
            return;
        }

        // const ctx = canvas.getContext('2d', { willReadFrequently: false });
        // if (!ctx) {
        //     console.warn('Unable to create canvas context; video streaming disabled.');
        //     return;
        // };

        const captureFrame = async () => {
            //
            if (!socket || socket.readyState !== WebSocket.OPEN) return;

            const video = videoElement;

            if (!video?.videoWidth || !video.videoHeaight) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            await new Promise(() => {
                canvas.toBlob(
                    async (blob) => {
                        try {
                            if (!blob) return resolve();
                            const base64 = await blobToBase64(blob);
                            const payload = JSON.stringify({
                                data: base64,
                                models: {
                                    face: {},
                                },
                            });
                            if (!this.serverReady) return resolve();
                            setIsServerReady(false);
                            socket.send(payload);
                        } catch (error) {
                            console.error('Failed to encode video frame', error);
                        } finally {
                            resolve();
                        }
                    },
                    'image/jpeg',
                    0.8
                );

            });

        };

        setVideoTimer(setInterval(captureFrame, VIDEO_FRAME_INTERVAL_MS));
    };
    async function startBatchSnapshots() { } // keep from old app

    async function handleSocketMessage(socketEvent) {
        try {
            const payload = await JSON.parse(socketEvent.data);
            if (payload.error) {
                setStatusMessage(`Streaming error: ${payload.error}`);
                setIsServerReady(true);
                return;
            }
            setStreamEventText(payload);

        } catch (error) {
            console.error('Failed to parse streaming message', error);

        } finally {
            //?
            setIsServerReady(true);
        };
    };

    async function renderStreamEvent() { };
    async function renderBatchResult() { }; //keep
    async function updateStatus() { };
    async function extractTopEmotions() { }; // append to state variable with time stamps
    async function collectWarnings() { };

    // use isTesting to start and stop monitoring as well

    // fetch hume ai credentials
    // open socket
    // get video from client
    // stream video to hume api,
    // display hume responses in strema responses div 
    // append timestamped results to state variable object to store in db eventually alongside assesment answers/grade
    // store video clip itself?

    return (
        <div>
            <h2>Emotion Monitoring</h2>
            {previewElement}
            <div className="status-cards">
                <article>
                    <h3>Latest Stream Event</h3>
                    {streamOutputElement}
                </article>
                <article>
                    <h3>Batch Snapshots</h3>
                    {batchOutputElement}
                </article>
            </div>
        </div>
    )
}

export default Monitoring
