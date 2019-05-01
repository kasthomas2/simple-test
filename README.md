# Simple Demo of Veritone API Stuff

Under construction.

Live demo: https://simple-test.netlify.com

To use it, you should first sign up at https://www.veritone.com/wp/sign-up/ (free account). Then you can use those same credentials to sign in via the demo page. That way, the demo page obtains your bearer token (session token for the Veritone API) and can use it to run GraphQL queries on your behalf.

You should also (optionally) obtain a Slack webhook and paste your webhook URL into the form on the second page of the demo app. This lets you get some pretty cool log messages in your Slack channel.

**What the Demo Demonstrates**

- How to send log messages to Slack
- How to log in to Veritone and get the bearer token
- How to run GraphQL queries via browser fetch
- How to delegate GraphQL queries to an AWS Lambda so you can run your queries as simple GETs against the lambda. (Veritone's API server only accepts POSTs.)
- Create/read/delete TDOs (Temporal Data Objects).

Coming soon: Run a transcription job on a video. (And more.)

You can use/steal/copy my code, but only at your own risk!
