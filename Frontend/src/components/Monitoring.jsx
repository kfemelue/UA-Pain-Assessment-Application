import { useState, useEffect, useContext, useRef } from 'react';
import { Context } from '../App';

function Monitoring() {
    const { isTesting, setIsTesting } = useContext(Context);
    // const [socketConfig, setSocketConfig] = useState({});
    const [stream, setStream] = useState(null);
    const socket = useRef(null);
    const [isServerReady, setIsServerReady] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [streamEventText, setStreamEventText] = useState(null);
    const [batchSnapshotText, setBatchSnapshotText] = useState(null);
    //const [videoTimer, setVideoTimer] = useState(0);
    const [mediaStream, setMediaStream] = useState(null)
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const base64Img = useRef(null)

    const VIDEO_FRAME_INTERVAL_MS = 1500;
    const BATCH_INTERVAL_MS = 5000;
    const wsURL = import.meta.env.stream_url ?? "http://localhost:3000/stream"

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
    let videoElement = mediaStream ? <video ref={videoRef} id="camera-preview" muted={true} playsInline></video> : <video  ref={videoRef} id="camera-preview" muted={true} playsInline></video>;

    const previewElement = <div className="preview">
        {videoElement}
    </div>;

    const streamOutputElement = <pre id="stream-output">{streamEventText ?? "No data yet."}</pre>;
    const batchOutputElement = <pre id="batch-output">{batchSnapshotText ?? "No snapshots yet."}</pre>;

    let video = previewElement;
    

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
            startMonitoring()
        }else {
            disableMedia()
        }

    }, [isTesting])


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

    async function startMonitoring() { 

        try {
            await enableMedia();
            await openSocket(); //config
            await startVideoStreaming();
            await startBatchSnapshots();

        }catch (error){
            console.error(error)
        }

        await setStatusMessage("Expression Measurement Monitoring Enabled (video only).");
    };

    async function stopMonitoring() { 



    };


    async function openSocket() {
        // const wsURL = buildWebSocketUrl(socketConfig);
        await new Promise((resolve, reject) => {
            const new_socket = new WebSocket(wsURL);

            let settled = false;

            new_socket.addEventListener('open', (event) => {
                console.log("socket open", event)
                settled = true;
                socket.current = new_socket;
                setIsServerReady(true);
                setStatusMessage('Connected to Streaming Point');
                resolve();
            });

            new_socket.addEventListener("message", (event) => {
                console.log("message received", event.data)
                handleSocketMessage(event);
            });

            new_socket.addEventListener("close", (event) => {
                socket.current = null
                setIsServerReady(true);
                if (!settled) {
                    settled = true;
                    reject(new Error(`Streaming socket closed before connection was established (code ${event.code})`));
                } else {
                    setStatusMessage("Streaming socket closed", event.code , event.reason);
                }
            });

            new_socket.addEventListener("error", (event) => {
                if (!settled) {
                    settled = true;
                    reject(new Error('Failed to establish connection to streaming endpoint'));
                } else {
                    setStatusMessage(`Streaming error: ${event.message ?? 'unknown error'}`);
                }
            });

            socket.current = new_socket
        });
    };

    const captureFrame = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
 
        const ctx = canvasRef.current && canvasRef.current.getContext("2d");

        await ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        await canvasRef.current.toBlob(async (blob)=>{
                base64Img.current = await blobToBase64(blob);
                const payload = JSON.stringify({
                    data: base64Img.current,
                    models: {
                    face: {},
                    }
                });
            
            console.log(payload);

            socket.current.send(payload);
            setIsServerReady(false);

        }, 'image/jpeg', 0.8);
        
    };


    async function startVideoStreaming( ) {
        setInterval( ()=>{ 
            captureFrame()
        }, VIDEO_FRAME_INTERVAL_MS)

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
            console.log(payload);

        } catch (error) {
            console.error('Failed to parse streaming message', error);

        } finally {
            setIsServerReady(true);
        };
    };

    async function renderStreamEvent() { };
    async function renderBatchResult() { }; //keep
    async function updateStatus() { };
    async function extractTopEmotions() { }; // append to state variable with time stamps
    async function collectWarnings() { };

    // display responses in strema responses div
    // stop monitoring on form submit 
    // append timestamped results to state variable object to store in db eventually alongside assesment answers/grade
    // store video clip itself?

    return (
        <div>
            <h2>Emotion Monitoring</h2>
            {previewElement}
            <div hidden><canvas ref={canvasRef} width={video.videoWidth} height={video.videoHeight}> </canvas></div>
            
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
