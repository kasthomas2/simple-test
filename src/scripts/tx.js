_pollkey = null; // Ugh, this is needed for clearInterval()
_totalPollAttempts = 0;
//var MAX_POLL_ATTEMPTS = 10;

function logToScreen(msg, selector) {
  var s = selector || "#tdoZoneCode";
  document.querySelector(s).innerHTML = document.querySelector(s).innerHTML + "\n" + msg;
}
function clearScreenLog(selector) { 
  if (!selector) return;
  document.querySelector(s).innerHTML = "";
}

async function checkTheJob(jobID, engineID) {

  // DEBUG
  logToScreen("Entered checkTheJob().");


    var q = `query jobStatus {
  job(id: "JOB_ID") {   
    status
    createdDateTime
    targetId
    tasks {    
      records {    
        status
        createdDateTime
        modifiedDateTime
        id
        engine {
          id
          name
          category {
            name
          }
        }
      }
    }
  }
}`.replace(/JOB_ID/, jobID);


 
    var json = await runQueryGET(q,_token);
    if (json && typeof json == 'string') {
        json = JSON.parse(json);
        if ('errors'in json) {
          showSnackbar( "Error response. Stale token?");
        } else {

           // Are we done yet?
            var jobFinished = (json.data.job.status == 'complete');

            // Are all tasks 'complete'?
            var totalTasks = json.data.job.tasks.records.length;
            var completedTasks = 0;
            json.data.job.tasks.records.forEach(t=>{
                completedTasks += (t.status == 'complete');
            }
            );
            var tasksAllCompleted = (completedTasks == totalTasks) ? true : false;
                     
            var tdoID = json.data.job.targetId; // the tdoID is hidden under targetID
      
            if (jobFinished && tasksAllCompleted) {

                logToScreen("Job complete, all tasks complete.");

                clearInterval( _pollkey );
                _totalPollAttempts = 0;

                var q = createEngineResultsQuery(tdoID, engineID);
                var tx = await getResults(q, _token);

                // TODO: showMsg() and show tx in div.
                logToScreen( tx );
            }
            else logToScreen("Job complete = " + jobFinished + " & " + completedTasks + " tasks complete, out of " + totalTasks);

            if ( _totalPollAttempts++ >= MAX_POLL_ATTEMPTS ) {
                clearInterval( _pollkey );
                _totalPollAttempts = 0;
                logToScreen("Stopped polling after MAX_POLL_ATTEMPTS");                 
            }

        } // else

    } // if json
   
} // function 

function createTheJobQuery(tdoID, engineID, mediaID) {

    // We will hard-code the realtime adapter ID of
    // "9e611ad7-2d3b-48f6-a51b-0a1ba40feab4"

    return `mutation createJob{
  createJob(input: {
    targetId: "TDO_ID",
    tasks: [{
         engineId:"9e611ad7-2d3b-48f6-a51b-0a1ba40feab4",
         payload:{
             url: "MEDIA_URI"
         }
    },{
      engineId: "ENGINE_ID",
    }
    ]
  }) {
    id
  }
}`.replace(/TDO_ID/, tdoID).replace(/ENGINE_ID/, engineID).replace(/MEDIA_URI/, mediaID);
}

function createEngineResultsQuery(tdoID, engineID) {

    return `query getEngineOutput {
  engineResults(tdoId: "TDO",
    engineIds: ["ENGINE_ID"]) {
    records {
      tdoId
      engineId
      jsondata
    }
  }
}`.replace(/TDO/, tdoID).replace(/ENGINE_ID/, engineID);

}

function extractTranscript(json) {
    let theRecords = json.data.engineResults.records[0].jsondata.series;
    var ar = [];
    theRecords.forEach(r=>{
        for (var i = 0; i < r.words.length; i++)
            ar.push(r.words[i].word);
    }
    );
    return ar.join(' ').replace(/\s\./g, ".");
}

async function createTDO() {

    // This is the mutation to create a TDO
    var mutation_create = `mutation {createTDO(input:{
  startDateTime:"startxxx",
  stopDateTime:"endxxx"
}){
  id
  name
} }`.replace("startxxx", new Date()).replace("endxxx", new Date(3600 * 1000 + (new Date * 1)));

    var json = await runQueryGET(mutation_create,_token);
    if (json && typeof json == 'string') {
        json = JSON.parse(json);
    }
    return json;
}

async function getResults(q, _token) {

    var json = null;
    var theTranscript = "";

    try {
        var data = await runQueryGET(q,_token);
        if (data && typeof data == 'string') {
            json = JSON.parse(data);
            if ('errors'in json) {
                showSnackbar("Errors. Check console.", true);
                console.log(JSON.stringify(json));
            }
            theTranscript = extractTranscript(json);
        }
    } catch (e) {
        console.log("Exception in runQuery(): " + e.toString());
        showSnackbar("Oops, ajax exception. Check console.", true);
    }

    return theTranscript;
}


async function transcribe(mediaURI) {

    var json = null;
    var jobID = null;

    try {
        let engineID = "54525249-da68-4dbf-b6fe-aea9a1aefd4d";

        let tdo = await createTDO();
        console.log(tdo.data.createTDO.id + " is the tdo ID");
        let tdoID = tdo.data.createTDO.id;
        var q = createTheJobQuery(tdoID, engineID, mediaURI);

        // start the job
        var data = await runQueryGET(q,_token);
        if (data && typeof data == 'string') {
            json = JSON.parse(data);
            if ('errors'in json) {// TODO bail
            }
            jobID = json.data.createJob.id;
            // TODO: Log
            // TODO: checkTheJob( jobID, engineID )
            // q = createEngineResultsQuery(tdoID, engineID);
            // var tx = await getResults(q, _token);
            // showMsg( ) in a proper div
        }

    } catch (e) {
        "Exception caught in transcribe(): " + e.toString();
    }

}


