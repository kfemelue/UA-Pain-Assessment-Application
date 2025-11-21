import React, { useState, useContext, useEffect, createContext } from 'react';
import Home from './pages/Home';
import './App.css';

export const Context = React.createContext()

function App() {
  // context variables can be added for admin user auth.
  // context variables and a form to control them can can be added participant id, name,dob, etc for database storage
  const [isTesting, setIsTesting] = useState(false)
  const [displayTest, setDisplayTest] = useState(false)
  const [participantID, setParticipantID] = useState("");
  
  const contextVariables = {
    isTesting,
    setIsTesting,
    displayTest,
    setDisplayTest,
    participantID,
    setParticipantID
  }

  useEffect(()=>{
    // window.electron.subscribeStatistics()
  },[])

  const formOID = import.meta.env.oid ?? "154D0273-C3F6-4BCE-8885-3194D4CC4596";

  return (
    <Context.Provider value={contextVariables}>
      <div>
        <Home />
      </div>
    </Context.Provider>
  )
}
export default App
