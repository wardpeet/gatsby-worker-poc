const { parse: parseURL } = require('url');
const execa = require('execa');
const got = require('got');
const slash = require('slash');
const path = require('path');
const makeDir = require('make-dir');
const fs = require('fs');

const logs = [];
const cloudWorkers = {
  STRUCTURED_LOG: 'https://europe-west1-gatsby-worker-test-project.cloudfunctions.net/worker-structured-log',
  ERROR_LOG: 'https://europe-west1-gatsby-worker-test-project.cloudfunctions.net/worker-error-log',
  IMAGE_PROCESSING: 'https://europe-west1-gatsby-worker-test-project.cloudfunctions.net/worker-image-processing',
  DOWNLOAD_FILE: 'https://europe-west1-gatsby-worker-test-project.cloudfunctions.net/worker-download-file',
  GENERATE_SVG: 'https://europe-west1-gatsby-worker-test-project.cloudfunctions.net/worker-generate-svg',
};

(async () => {
  try {
    const proc = execa('node', ['node_modules/gatsby-cli/lib/index.js', 'build'], {
      stdio: [`inherit`, `inherit`, `inherit`, `ipc`]
    });

    // listen for job creation
    proc.on('message', async (msg) => {
      if (msg.type && msg.type === 'JOB_CREATED') {
        let body;
        logs.push(`cloud: run job ${msg.payload.name}`)

        try {
          // call the worker function with the necessary info
          const resp = await got.post(cloudWorkers[msg.payload.name], {
            body: {
              inputPaths: msg.payload.inputPaths.map(inputPath => slash(inputPath)),
              outputDir: slash(msg.payload.outputDir),
              args: msg.payload.args || {},
            },
            json: true,
          });
          body = resp.body;

          if (body.files) {
            await Promise.all(body.files.map(async file => {
              const { pathname } = parseURL(file);
              const destFilename = pathname.split('/').slice(2).join('/');
              const outputPath = path.join(process.cwd(), destFilename);
              await makeDir(path.dirname(outputPath));
              logs.push(`cloud: writing ${destFilename}`)

              return new Promise(resolve => {
                got.stream(file)
                  .on('response', (res) => {
                    resolve();
                  }).pipe(fs.createWriteStream(outputPath))
              })
            }));
          }
        } catch (err) {
          body = {
            error: err,
          }
        }

        if (body.status === 'success') {
          proc.send({
            type: 'JOB_COMPLETED',
            payload: {
              id: msg.payload.id,
              result: body.result,
            }
          })
        } else {
          proc.send({
            type: 'JOB_FAILED',
            payload: {
              id: msg.payload.id,
              error: body.error,
            }
          })
        }
      }
    })

    await proc;

    console.log(logs)
  } catch (err) {
  }
})();