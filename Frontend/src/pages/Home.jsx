import React, { useState, useContext, useEffect, createContext } from 'react';
import PainAssessment from '../components/PainAssessment';
import Header from '../components/Header';
import Monitoring from '../components/Monitoring';
import { Context } from '../App';


function Home() {
    const { participantID, setParticipantID } = useContext(Context);
    const { isTesting, setIsTesting } = useContext(Context);
    const { displayTest, setDisplayTest } = useContext(Context);


    const formOID = import.meta.env.VITE_form_oid ?? "154D0273-C3F6-4BCE-8885-3194D4CC4596"


    // conditionally display a registration form, once submitted swap the <main></main> with a new main to show assessment and monitoring
    return (
        <div>
            <Header />
            <main className="layout">
                <section className="promis-panel">
                    <PainAssessment formOID={formOID} />
                </section>
                <section className="monitoring-panel">
                    <Monitoring />
                </section>
            </main>
        </div>
    )
}

export default Home;
