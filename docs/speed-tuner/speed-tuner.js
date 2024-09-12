// declare form defaults, for use in queryparams
formDefaults = {
  'slowerSpeed': 200,
  'slowerPush': 0,
  'fasterSpeed': 220,
  'fasterPush': 0,
  'fasterTurns': 1,
  'fasterPushesSlower': false,
  'stigmaPolitis': false
};

// get elements from page
//should be fine here since no elements are ever added to or removed from the DOM after inital load
const slowSpeedBox = document.getElementById('slow-max-speed-box');
const fastSpeedBox = document.getElementById('fast-min-speed-box');
const slowSpeedOutput = document.getElementById('slow-max-speed');
const slowOutputLabel = document.getElementById('slow-output-label');
const fastSpeedOutput = document.getElementById('fast-min-speed');
const fastOutputLabel = document.getElementById('fast-output-label');
const recommendationOutput =  document.getElementById('recommendation');

/* eslint-disable no-unused-vars */
const slowerSpeedInput = document.getElementById('slow-unit-speed');
const fasterSpeedInput = document.getElementById('fast-unit-speed');
const slowerPushInput = document.getElementById('slow-unit-push');
let fasterPushInput = document.getElementById('fast-unit-push');
let fasterTurnsInput = document.getElementById('fast-unit-turns');

const fasterPushesSlowerInput = document.getElementById('faster-pushes-switch');
const stigmaPolitisInput = document.getElementById('stigma-or-politis');

const slowerSpeedSlide = document.getElementById('slow-unit-speed-slide');
const fasterSpeedSlide = document.getElementById('fast-unit-speed-slide');
const slowerPushSlide = document.getElementById('slow-unit-push-slide');
let fasterPushSlide = document.getElementById('fast-unit-push-slide');
let fasterTurnsSlide = document.getElementById('fast-unit-turns-slide');

const fastCRDiv = document.getElementById('fast-cr-div');
const fastTurnsDiv = document.getElementById('fast-turns-div');
/* eslint-enable */

fasterPushesSlowUpdate = () => {
  fastCRDiv.innerHTML = '';
  fastTurnsDiv.innerHTML = '';

  if (!fasterPushesSlowerInput.checked) {
    $(fastCRDiv).append(
      `<div class="stat-block">
            <div class="form-group row col-sm-12">
                <label for="fast-unit-push" class="col-md-7 col-form-label form-control-sm">
                    <h5>Faster Unit CR Push (%) <i class="far fa-question-circle fa-xs text-muted" data-toggle="tooltip" title="The amount of combat readiness increase granted to the faster unit"></i></h5>
                </label>
                <div class="input-group input-group-sm col-md-5">
                    <div class="input-group-prepend">
                        <button class="btn btn-outline-secondary" type="button" id="fast-unit-push-minus" onclick="minus('fast-unit-push')">&minus;</button>
                    </div>
                    <input type="number" class="form-control text-center" id="fast-unit-push" value="0" onkeyup="update('fast-unit-push')">
                    <div class="input-group-append">
                        <button class="btn btn-outline-secondary" type="button" id="fast-unit-push-plus" onclick="plus('fast-unit-push')">&plus;</button>
                    </div>
                </div>
            </div>
            <div class="form-group row col-sm-12">
                <input type="range" class="custom-range" id="fast-unit-push-slide" min="0" max="100" value="0" oninput="slide('fast-unit-push')">
            </div>
        </div>`);
    $(fastTurnsDiv).append(
      `<div class="stat-block">
            <div class="form-group row col-sm-12">
                <label for="fast-unit-turns" class="col-md-7 col-form-label form-control-sm">
                    <h5>Faster Unit Turns Needed <i class="far fa-question-circle fa-xs text-muted" data-toggle="tooltip" title="The number of turns the faster unit must take before the slower unit takes its first turn. Example: Vivian needs 2 turns to S3 -> S2 before next unit in Banshee wave 1"></i></h5>
                </label>
                <div class="input-group input-group-sm col-md-5">
                    <div class="input-group-prepend">
                        <button class="btn btn-outline-secondary" type="button" id="fast-unit-turns-minus" onclick="minus('fast-unit-turns')">&minus;</button>
                    </div>
                    <input type="number" class="form-control text-center" id="fast-unit-turns" value="1" onkeyup="update('fast-unit-turns')">
                    <div class="input-group-append">
                        <button class="btn btn-outline-secondary" type="button" id="fast-unit-turns-plus" onclick="plus('fast-unit-turns')">&plus;</button>
                    </div>
                </div>
            </div>
            <div class="form-group row col-sm-12">
                <input type="range" class="custom-range" id="fast-unit-turns-slide" min="1" max="3" value="1" oninput="slide('fast-unit-turns')">
            </div>
        </div>`
    );
    fasterPushInput = document.getElementById('fast-unit-push');
    fasterTurnsInput = document.getElementById('fast-unit-turns');
    fasterPushSlide = document.getElementById('fast-unit-push-slide');
    fasterTurnsSlide = document.getElementById('fast-unit-turns-slide');
  }
};

fasterPushesSlowerInput.addEventListener('change', fasterPushesSlowUpdate);

// set up vars for query params
boolParams = ['fasterPushesSlower', 'stigmaPolitis'];
numberParams = ['slowerSpeed', 'slowerPush', 'fasterSpeed', 'fasterPush', 'fasterTurns'];
page = 'speed_tuner';

fasterPushesToggled = () => {
  window.dataLayer.push({
    'event': 'toggle_faster_pushes',
    'faster_pushes': fasterPushesSlowerInput.checked ? 'on' : 'off'
  });
};

stigmaPolitisToggled = () => {
  window.dataLayer.push({
    'event': 'toggle_stigma_politis',
    'stigma_politis': stigmaPolitisInput.checked ? 'on' : 'off'
  });
};

// style output text and outlines
updateClasses = (correctTune = false) => {
  if (correctTune) {
    slowSpeedBox.classList.replace('border-danger', 'border-success');
    slowSpeedOutput.classList.replace('text-danger', 'text-success');

    fastSpeedBox.classList.replace('border-danger', 'border-success');
    fastSpeedOutput.classList.replace('text-danger', 'text-success');

  } else {
    slowSpeedBox.classList.replace('border-success', 'border-danger');
    slowSpeedOutput.classList.replace('text-success', 'text-danger');

    fastSpeedBox.classList.replace('border-success', 'border-danger');
    fastSpeedOutput.classList.replace('text-success', 'text-danger');
  }
};

/*
 * Return whether the units are tuned properly
 *
 * This could be reduced to a ternary but it'd be a bit long so this is easier to read
 */
correctTune = (slowSpeed, slowSpeedReq, fastSpeed, fastSpeedReq, fastPushes) => {
  if (fastPushes) {
    return slowSpeed < slowSpeedReq || fastSpeed > fastSpeedReq;
  } else {
    return slowSpeed > slowSpeedReq || fastSpeed < fastSpeedReq;
  }
};

/* eslint-disable no-unused-vars */
const resolve = () => {
  if (loadingQueryParams) {
    return; // don't resolve until params are loaded
  }

  const inputValues = getInputValues();
    
  /* 
     * GENERAL FORMULA: fast Speed = slow Speed * fast CR / slow CR
     *
     * For normal mode, 0.95 used as base for slowerUnitCR to ensure that in the worst case (slow unit +5% CR, fast unit +0% CR)
     * the turn order will still hold 100% of the time
     * 
     * For faster unit pushes mode, 0.95 used as base for fasterUnitCR to ensure that in the worst case (fast unit +5% CR, slow unit +0% CR)
     * the turn order will still hold 100% of the time
     * 
     * Take the floor of max speed and ceil of min speed for safety since we can't have fractional speed
     */
  let slowUnitSpeedReq, fastUnitSpeedReq;
  if (inputValues.fasterPushesSlower) {
    const slowerUnitCR = 1 - ((inputValues.slowerPush * (stigmaPolitisInput.checked ? 0.5 : 1)) / 100);
    const fasterUnitCR = 0.95;
    const CRRatio = fasterUnitCR / slowerUnitCR;

    slowUnitSpeedReq = Math.ceil(inputValues.fasterSpeed / CRRatio); // min speed
    fastUnitSpeedReq =  Math.floor(inputValues.slowerSpeed * CRRatio); // max speed

    slowOutputLabel.innerText = 'Slower Unit Min Speed';
    fastOutputLabel.innerText = 'Faster Unit Max Speed';
  } else {
    const slowerUnitCR = 0.95 - ((inputValues.slowerPush * (stigmaPolitisInput.checked ? 0.5 : 1)) / 100);
    const fasterUnitCR = inputValues.fasterTurns - ((inputValues.fasterPush * (inputValues.stigmaPolitis ? 0.5 : 1)) / 100);
    const CRRatio = fasterUnitCR / slowerUnitCR;

    slowUnitSpeedReq = Math.floor(inputValues.fasterSpeed / CRRatio); // max speed
    fastUnitSpeedReq =  Math.ceil(inputValues.slowerSpeed * CRRatio); // min speed

    slowOutputLabel.innerText = 'Slower Unit Max Speed';
    fastOutputLabel.innerText = 'Faster Unit Min Speed';
  } 
    

  // set output text to 'Impossible' in edge cases
  let formattedSlowSpeed = slowUnitSpeedReq <= 0 || slowUnitSpeedReq == 'Infinity' ? 'Impossible' : slowUnitSpeedReq.toString();
  let formattedFastSpeed = fastUnitSpeedReq <= 0 || fastUnitSpeedReq == 'Infinity' ? 'Impossible' : fastUnitSpeedReq.toString();

  let recommendation = '';

  // generate recommendation and update styling accordingly
  if (inputValues.slowerSpeed > inputValues.fasterSpeed) {
    updateClasses(false);
    formattedSlowSpeed = 'Impossible';
    formattedFastSpeed = 'Impossible';
    recommendation = 'The faster unit\'s speed must be greater than the slower unit\'s speed.';
  } else if (correctTune(inputValues.slowerSpeed, slowUnitSpeedReq, inputValues.fasterSpeed, fastUnitSpeedReq, inputValues.fasterPushesSlower)) {
    updateClasses(false);
    recommendation = `Units are improperly tuned, and ${inputValues.fasterPushesSlower ? 'the slower unit may not have 100% CR after the faster unit pushes' : 'the desired turn order isn\'t guaranteed'}.\n` +
                         (formattedSlowSpeed !== 'Impossible' ? `<br>The slower unit needs at least ${Math.abs(inputValues.slowerSpeed - slowUnitSpeedReq)} ${inputValues.fasterPushesSlower ? 'more' : 'less'} speed` : '') +
                         (!(formattedSlowSpeed === 'Impossible' || formattedFastSpeed === 'Impossible') ? ' <strong>OR</strong> ' : '') +
                         (formattedFastSpeed !== 'Impossible' ? `the faster unit needs at least ${Math.abs(fastUnitSpeedReq - inputValues.fasterSpeed)} ${inputValues.fasterPushesSlower ? 'less' : 'more'} speed.` : '');
  } else {
    updateClasses(true);
    recommendation = `Units are properly tuned, and ${inputValues.fasterPushesSlower ? 'the slower unit will have at least 100% CR after the faster unit pushes' : 'the faster unit will always move before the slower unit'}.`;
    if (inputValues.slowerSpeed !== slowUnitSpeedReq || inputValues.fasterSpeed !== fastUnitSpeedReq) {
      recommendation += `<br>The slower unit can have up to ${Math.abs(slowUnitSpeedReq - inputValues.slowerSpeed)} ${inputValues.fasterPushesSlower ? 'less' : 'more'} speed` +
                              ` <strong>OR</strong> the faster unit can have up to ${Math.abs(inputValues.fasterSpeed - fastUnitSpeedReq)} ${inputValues.fasterPushesSlower ? 'more' : 'less'} speed.`;
    }
  }
  
  slowSpeedOutput.innerText = formattedSlowSpeed;
  fastSpeedOutput.innerText = formattedFastSpeed;
  recommendationOutput.innerHTML = recommendation;

  debounce('updateQueryParams', updateQueryParams, [false]);
};
/* eslint-enable */
