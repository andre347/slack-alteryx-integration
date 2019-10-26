const express = require("express");
const app = express();
const port = process.env.PORT || 1234;
const bodyParser = require("body-parser");

// parse the incoming request
app.use(bodyParser.urlencoded({ extended: false }));

// Alteryx
const Gallery = require("./index");
const keys = require("./keys");

const createGallery = () => {
  const gallery = new Gallery(keys.apilocation, keys.apikey, keys.apisecret);
  return gallery;
};
// get request
app.get("/", (req, res) => res.send("Hello Slack!"));

// post request for slack integration when someone makes a /command to runworkflow
app.post("/alteryx", async (req, res) => {
  const { user_name, text } = req.body;

  async function runWorkflow(appId, dataArray) {
    const response = await createGallery().executeWorkflow(appId, dataArray);
    const data = await response.json();
    // check if the job is running and if finished
    const output = await jobs(data.id);
    return output;
  }

  async function jobs(jobId) {
    const response = await createGallery().getJob(jobId);
    const data = await response.json();
    if (data.status !== "Completed") {
      jobs(jobId);
    } else if (data.status === "Error") {
      return "There was an error";
    } else if (data.status === "Completed") {
      console.log("Finished!");
      // if finished display completed message
      const msg = `Hi ${user_name}! Workflow with ID ${keys.appId} ${data.status} with ${data.disposition}`;
      res.send(msg);
    }
  }

  runWorkflow(keys.appId, [{}]);
});

app.post("/workflows", async (req, res) => {
  const { text } = req.body;
  console.log(typeof text);
  async function getWorkflows() {
    let array = [];
    const response = await createGallery().getSubscriptionWorkflows();
    const json = await response.json();
    json.forEach(workflow => {
      array.push({
        id: workflow.id,
        uploadDate: workflow.uploadDate,
        name: workflow.metaInfo.name
      });
    });
    res.json(array.reverse().slice(0, text));
  }
  getWorkflows();
});

app.listen(port, () => console.log(`Alteryx to Slack app listening on port ${port}!`));
