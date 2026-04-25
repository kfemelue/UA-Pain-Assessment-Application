# UA-Pain-Assessment-Application

## FrontEnd 

Vite + React web application that allows research participants to fill out Assessment forms while a while being monitored via video. 
The web app sends data to a Python backend.

[Frontend README](Frontend/README.md)
[Vite Documentation](https://vite.dev/guide/)

## Backend

A Python Application with Fast API server endpoints. The application communicates with the http://www.assessmentcenter.net/ac_api to retrieve and grade pain assessment form questions.

The python application also uses the pyfeat computer vision model to analyse the emotions in snapshots of the participant while the assessment is being completed.

[Backend README](Backend/README.md)
[FastAPI Documentation](https://fastapi.tiangolo.com/)


[Py-Feat Facial Expression Analysis Toolbox](https://py-feat.org/pages/intro.html)
