import { useState, useEffect, useContext } from "react";
import { Context } from '../App';

function PainAssessment({ formOID }) {
    const [questions, setQuestions] = useState([]);
    const [responses, setResponses] = useState({});
    const [loading, setLoading] = useState(true);
    const [scoreTheta, setScoreTheta] = useState(null);
    const [scoreStdError, setScoreStdError] = useState(null);
    const [submitError, setSubmitError] = useState(null);
    
    const {participantID, setParticipantID} = useContext(Context);
    const {isTesting, setIsTesting} = useContext(Context);
    const {displayTest, setDisplayTest} = useContext(Context);

    const base_uri = import.meta.env.VITE_server_base_uri ?? 'http://localhost:3000'


    const handleBeginAssessment = (event) => {
        setIsTesting(true);
        setDisplayTest(true);
        getFormQuestions();
    }

    const getFormQuestions = async () => {
        const uri = await `${base_uri}/api/promis/forms/${formOID}`
        fetch(uri)
            .then((res) => res.json())
            .then((data) => {
                setQuestions(data.Items || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error loading questions:", err);
                setLoading(false);
            });
    }

    const handleChange = (id, value) => {
        setResponses((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Build payload array expected by API
        const payload = Object.entries(responses).map(
            ([itemID, itemResponseOID], index) => ({
                ItemID: itemID,
                ItemResponseOID: itemResponseOID,
                Order: index + 1
            })
        );

        console.log(JSON.stringify(payload));

        try {
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }

            const resp = await fetch(`${base_uri}/api/promis/forms/${formOID}/stateless`, options)

            if (!resp.ok) {
                throw new Error(`API responded with status ${resp.status}`);
            }

            const result = await resp.json();
            setScoreTheta(result.Theta);
            setScoreStdError(result.StdError);

            setIsTesting(false);

            console.log(resp)

            console.log("Assessment result:", result);

        } catch (err) {
            console.error("Submission error:", err);
            setSubmitError(err.message);
        }
    };

    // if (loading) {
    //     return <div className="text-center text-gray-500">Loading questions...</div>;
    // }

    useEffect(() => {
        // setQuestions(data.Items || []);
        // setLoading(false);
        // getFormQuestions();


    }, []);

    return (
        <div className="questionnaire">
            {displayTest ? (<>
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
                    Pain Interference Assessment
                </h1>

                <form onSubmit={handleSubmit}>
                    {questions.map((item) => {
                        const timeframe =
                            item.Elements.find((e) => e.ElementOrder === "1")?.Description || "";
                        const questionText =
                            item.Elements.find((e) => e.ElementOrder === "2")?.Description || "";
                        const options =
                            item.Elements.find((e) => e.Map && e.Map.length > 0)?.Map || [];

                        return (
                            <div
                                key={item.FormItemOID}
                                className="question-block"
                            >
                                <div className="timeframe">{timeframe}</div>
                                <div className="question-text">{questionText}</div>

                                <div className="options-group">
                                    {options.map((opt) => (
                                        <label
                                            key={opt.ItemResponseOID}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <input
                                                type="radio"
                                                name={item.ID}
                                                value={opt.Value}
                                                checked={responses[item.ID] === opt.Value}
                                                onChange={(e) => handleChange(item.ID, e.target.value)}
                                                required
                                            />
                                            <span className="text-gray-700">{opt.Description}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    <div className="flex justify-center mt-8">
                        <button
                            type="submit"
                        >
                            Submit
                        </button>
                    </div>
                </form>

                {scoreTheta !== null && (
                    <div className="results-card">
                        <h2>Results</h2>
                        <p>Theta: {scoreTheta}</p>
                        <p>Standard Error: {scoreStdError}</p>
                    </div>
                )}

                {submitError && (
                    <p className="error-text">
                        Submission Error: {submitError}
                    </p>
                )}
            </>) : (
                <>
                    <p className="question-text"> Welcome to the Ipsum Lorem Pain Assessment site: Impsum lorem ipsum lorem ipsum lorem. While you take the assesment, pyfeat cv will be used to measure your facial expressions. Please enter your participant Id below and begin test</p>
                    <form>
                        <label htmlFor="participantID" className="text-gray-700" > Participant ID: </label>
                        <input type="text" name="participantID" onChange={(event)=>{ setParticipantID(event.target.value)}} />
                        <button type="submit" className="flex justify-center mt-8" onClick={(event)=>{handleBeginAssessment(event)}}>Begin Test</button>
                    </form>
                </>
            )}
        </div>
    );
}

export default PainAssessment;
