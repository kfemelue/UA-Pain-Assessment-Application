# UA-Pain-Assessment-Application

## FrontEnd

React Vite application that allows research participants to fill out Assessment forms while a while being monitored via video. A computer vision model int he backend analyses emotion expressions.


## Backend

A Python Fast API server that communicates with the http://www.assessmentcenter.net/ac_api to retrieve and grade pain assessment form questions.

[Py-Feat Facial Expression Analysis Toolbox](https://py-feat.org/pages/intro.html) is used to analyze the emotions of the participant from video. 
