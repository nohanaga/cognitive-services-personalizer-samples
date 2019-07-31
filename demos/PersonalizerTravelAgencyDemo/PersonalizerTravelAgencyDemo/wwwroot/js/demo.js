let context = {
    device: "mobile",
    packageAdditionals: null,
    costs: null,
    userAgent: null
};

let userAgent = {};
let selectedView = 'HTML';

document.addEventListener("DOMContentLoaded", function () {
    const goBtnEle = document.getElementById("go-btn");
    const brandLogoImg = document.getElementById("brand-logo");
    const mobileShowBackstageBtn = document.getElementById("mobile-show-backstage-btn");
    const mobileHideBackstageBtn = document.getElementById("mobile-hide-backstage-btn");
    const navbar = document.getElementById('navbar-container');
    const articleContainer = document.getElementById('article-container');
    const graphContainer = document.getElementById('graph-container');
    const backstage = document.getElementById('collapseBackstage');
    const backstageBtn = document.getElementById("backstage-btn");
    const showActionJsonBtn = document.getElementById("showActionsJson");
    const showActionHtmlBtn = document.getElementById('showActionsHtml');

    const costsOptions = ["allInclusive", "luxuryPackage"];
    const additionalOptions = ["boatTrip", "dinnerAndBreakfast"];

    showActionHtmlBtn.style.display = 'none';

    let currentSize;
    let gaugeInterval = -1;
    const SCREEN_SIZE_SMALL = 0;
    const SCREEN_SIZE_BIG = 1;
    const mobileSize = 991;

    context.costs = getRandomOption(costsOptions);
    context.packageAdditionals = getRandomOption(additionalOptions);

    showActionJsonBtn.addEventListener('click', function () {
        selectedView = 'JSON';
        showActionHtmlBtn.style.display = 'flex';
        showActionJsonBtn.style.display = 'none';
        setupActionControls();
    });

    showActionHtmlBtn.addEventListener("click", function () {
        selectedView = 'HTML';
        showActionJsonBtn.style.display = 'flex';
        showActionHtmlBtn.style.display = 'none';
        setupActionControls();
    });

    backstageBtn.addEventListener("click", function () {
        backstageBtn.innerText = backstage.classList.contains('show') ? MainArticleShowBackstageLabel : MainArticleCloseBackstageLabel;
    });


    mobileShowBackstageBtn.addEventListener("click", function () {
        if (!backstage.classList.contains('show')) {
            hidePageContent();
        }
    });

    mobileHideBackstageBtn.addEventListener("click", function () {
        if (backstage.classList.contains('show')) {
            showPageContent();
        }
    });

    let personalizerCallResult;

    setupActionControls();
    setupContextControls();

    if (!startDemoWithBlankPage) {
        getRecommendation().then(result => {
            personalizerCallResult = result;
            updateBasedOnRecommendation(result);
        });
    }

    if (document.documentElement.clientWidth > mobileSize) {
        currentSize = SCREEN_SIZE_BIG;
    }
    else {
        currentSize = SCREEN_SIZE_SMALL;
    }

    window.onresize = function () {
        if (window.innerWidth > mobileSize) {
            if (currentSize === SCREEN_SIZE_SMALL) {
                currentSize = SCREEN_SIZE_BIG;
                setBigLayoutConfiguration();
            }
        } else {
            if (currentSize === SCREEN_SIZE_BIG) {
                currentSize = SCREEN_SIZE_SMALL;
                setSmallLayoutConfiguration();
            }
        }
    };

    goBtnEle.addEventListener("click", function () {
        updateRecommendation();
    });

    function setIframeContentSize(mainContainer, isBackStageOpen) {
        if (isBackStageOpen) {
            mainContainer.className = "col-12";
        }
        else {
            mainContainer.className = "col-xl-8 offset-xl-2 col-12";
        }
    }

    function setBigLayoutConfiguration() {
        if (backstage.classList.contains('show')) {
            showPageContent();
            backstageBtn.firstChild.data = MainArticleCloseBackstageLabel;
        } else {
            backstageBtn.firstChild.data = MainArticleShowBackstageLabel;
        }
    }

    function setSmallLayoutConfiguration() {
        if (backstage.classList.contains('show')) {
            hidePageContent();
        }
    }

    // Hides the page content except for the backstage
    function showPageContent() {
        navbar.style.display = 'flex';
        articleContainer.style.display = 'block';
        graphContainer.style.display = 'flex';
    }

    // Makes the page content visible except for the backstage which will remain unchanged
    function hidePageContent() {
        navbar.style.display = 'none';
        articleContainer.style.display = 'none';
        graphContainer.style.display = 'none';
    }

    const articleViewer = document.getElementById("article-viewer");
    articleViewer.addEventListener("load", function () {
        const articleDoc = articleViewer.contentDocument;
        const mainContainer = articleViewer.contentWindow.document.getElementById("main-container");
        const articleFooter = articleViewer.contentWindow.document.getElementById("article-footer");
        const gauge = articleViewer.contentWindow.document.getElementById("gauge");
        const boundSetIframeContentSize = setIframeContentSize.bind(null, mainContainer);

        let reward = RewardInitValue;

        function sendRewardHandler(reward) {
            clearInterval(gaugeInterval);
            sendReward(personalizerCallResult.eventId, reward);
        }

        clearInterval(gaugeInterval);
        gaugeInterval = -1;

        boundSetIframeContentSize(backstage.classList.contains('show'));

        backstageBtn.addEventListener('click', function () {
            boundSetIframeContentSize(!backstage.classList.contains('show'));
        });

        if (articleViewer.contentWindow.location.href.indexOf("onfirmation") > -1) {

            articleDoc.getElementById("btn-confirm").addEventListener("click", function () { sendRewardHandler(reward); });
            articleDoc.getElementById("link-save-later").addEventListener("click", function () { sendRewardHandler(SaveForLaterReward); });

            updateShowGraphbtn(true);

            updateRewardValue(reward, articleDoc);

            gauge.addEventListener("transitionend", function gaugeTransitionEndHandler(event) {
                gauge.removeEventListener("transitionend", gaugeTransitionEndHandler);
                gaugeInterval = setInterval(function () {
                    reward -= RewardDecreaseAmount;
                    if (reward <= RewardDecreaseLimit) {
                        clearInterval(gaugeInterval);
                        gaugeInterval = -1;
                        updateRewardValue(RewardDecreaseLimit, articleDoc);
                    } else {
                        updateRewardValue(reward, articleDoc);
                    }

                }, RewardDecreaseInterval * 1000);
            }, false);            

            var innerDoc = articleViewer.contentWindow.document;
            var iframeBackBtn = innerDoc.getElementById('iframe-backBtn');
            const gaugeContainerEle = innerDoc.getElementById('gauge-container');

            if (iframeBackBtn !== undefined) {
                iframeBackBtn.style.display = "block";
                iframeBackBtn.addEventListener("click", function () {
                    gaugeContainerEle.style.display = 'none';
                    articleViewer.contentWindow.history.back();
                });
            }

            brandLogoImg.addEventListener("click", function () {
                if (iframeBackBtn !== undefined) {
                    gaugeContainerEle.style.display = 'none';
                }
                articleViewer.contentWindow.history.back();
            });
        }
        else {
            updateShowGraphbtn(false);
        }
    });
});

function updateRewardValue(value, articleDoc) {
    const turnValue = value / 2;
    const rewardEle = articleDoc.getElementById('gauge');
    rewardEle.setAttribute('style', `transform:rotate(${turnValue}turn)`);
    const comment = articleDoc.getElementById('gauge-comment');
    comment.innerText = `${value.toFixed(1)}`;
}

function setupActionControls() {
    getActions(false).then(updateActionsTab);
}

function setupContextControls() {
    const deviceSelectEle = document.getElementById('device');

    deviceSelectEle.addEventListener('change', (event) => {
        updateContext(event.target.value, null, null, false, null);
    });

    const UseUserAgentEle = document.getElementById('use-useragent');
    UseUserAgentEle.addEventListener('change', (event) => {
        const checkbox = event.target;
        if (checkbox.checked) {
            updateContext(null, null, null, false, userAgent);
        } else {
            updateContext(null, null, null, true, null);
        }
    });

    const costSelectEle = document.getElementById('costs');
    costSelectEle.addEventListener('change', (event) => {
        updateContext(null, event.target.value, null, false, null);
    });

    const packageSelectEle = document.getElementById('packageAdditionals');
    packageSelectEle.addEventListener('change', (event) => {
        updateContext(null, null, event.target.value, false, null);
    });

    getUserAgent().then(userAgentResponse => {
        userAgent = userAgentResponse;
        updateContext(deviceSelectEle.value, null, null, !UseUserAgentEle.checked, userAgent);
    });

    updateContext(deviceSelectEle.value, null, null, false, null);
}

function updateContext(device, currentCost, currentAdditionals, removeUserAgent, userAgent) {
    context.device = device || context.device;
    context.costs = currentCost || context.costs;
    context.packageAdditionals = currentAdditionals || context.packageAdditionals;
    context.userAgent = removeUserAgent ? null : userAgent || context.userAgent;

    let contextFeatures = [
        {
            device: context.device,
            costs: context.costs,
            packageAdditionals: context.packageAdditionals
        }
    ];


    if (context.userAgent) {
        contextFeatures.push({ userAgent: context.userAgent });
    }

    updateCodeElementWithJSON("context-code", { contextFeatures: contextFeatures });
}

function ramdomizeSelectedOption(select) {
    var items = select.getElementsByTagName('option');
    var index = Math.floor(Math.random() * items.length);

    return index;
}

function updateBasedOnRecommendation(result) {
    showResultContainer();
    hideResultAlert();
    updateArticle(result);
    updateResult(result);
    updatePersonalizerMethod(result);
}

function showResultContainer() {
    const resultContainerEle = document.getElementById("result-container");
    resultContainerEle.classList.remove("d-none");
}

function hideResultAlert() {
    const resultAlertElement = document.getElementById("result-alert");
    resultAlertElement.classList.add("d-none");
}

function updatePersonalizerMethod(recommendation) {
    const exploringBoxEle = document.getElementById("exploring-box");
    const exploitingBoxEle = document.getElementById("exploiting-box");

    if (isExploiting(recommendation)) {
        exploitingBoxEle.className = 'card border-left border-primary';
        exploringBoxEle.className = 'card';
    } else {
        exploringBoxEle.className = 'card border-primary';
        exploitingBoxEle.className = 'card';
    }
}

function isExploiting(recommendation) {
    const rewardActionId = recommendation.rewardActionId;
    const ranking = recommendation.ranking;

    let max = Math.max.apply(Math, recommendation.ranking.map((r) => { return r.probability; }));

    for (var i = 0; i < ranking.length; i++) {
        if (ranking[i].id === rewardActionId) {
            return ranking[i].probability === max;
        }
    }
}

function updateResult(result) {
    updateCodeElementWithJSON("result-code", { result: result }, result.rewardActionId);
}

function updateCodeElementWithJSON(eleId, jsonObj, resultId) {
    const codeEle = document.getElementById(eleId);
    let code = JSON.stringify(jsonObj, null, 2);

    if (resultId) {
        let aux = JSON.parse(code);
        aux = {
            result: {
                eventId: aux.result.eventId,
                rewardActionId: aux.result.rewardActionId,
                ranking: aux.result.ranking
            }
        };
        code = JSON.stringify(aux, null, 2);
        const regex = new RegExp(`(.*)("rewardActionId":\\s"${resultId}")(.*)`, 'gm');
        code = code.replace(regex, '$1<mark>$2</mark>$3');
    }

    codeEle.innerHTML = code;
}

function updateActionsTab(actions) {
    const actionsHeaderTab = document.getElementById("actions-tab");
    const actionsTabContent = document.getElementById("actions-tabContent");

    cleanChilds(actionsHeaderTab);
    cleanChilds(actionsTabContent);

    let actionsTabHeadersString = "";
    let actionsTabContentString = "";

    if (selectedView == 'HTML') {
        let actionTabContent = createActionTab(actions[i], i === 0);
        actionsTabContentString += actionTabContent.tabContent;
    } else {
        for (var i = 0; i < actions.length; i++) {
            let actionTabContent = createActionTab(actions[i], i === 0);
            actionsTabContentString += actionTabContent.tabContent;
        }
    }
    actionsTabContent.innerHTML = actionsTabContentString;
}

function createActionTab(actionObj, active) {
    let action = {};
   

    if (selectedView == 'JSON') {
        for (var attr in actionObj) {
            if (actionObj.hasOwnProperty(attr) && attr !== "title" && attr !== "imageName") action[attr] = actionObj[attr];
        }
        return {
            tabContent: `<div class="tab-pane fade ${active ? "show active" : ""}" role="tabpanel" id="${actionObj.id}-article" role="tabpanel" aria-labelledby="${actionObj.id}-article-tab">
                        <p class="h6 p-1 pt-2 mb-0"><strong>Title:</strong> ${actionObj.title}</p>
                        <pre class="pre-scrollable border m-0 actionsjson"><code>${JSON.stringify(action, null, 2)}</code></pre>
                    </div>`
        }
    }
    else {
        return {
            tabContent: `<div container><div class="row mx-auto">
                <div class="col-3"><div class="row pr-3"><p class="">Image</p></div><div class="row h-100 pr-3">
                        <div class="row py-2 pl-2 mb-3 align-items-end"><div class="col-12"><img id="beach" src="/img/beach.jpg" alt="Beach" /></div></div>
                        <div class="row py-2 pl-2 align-items-start"><div class="col-12"><img id="pool" src="/img/pool.jpg" alt="Pool" /></div></div></div></div>
                <div class="col-3"><div class="row pr-1"><p>Layout</p></div><div class="row h-75 pr-1">
                        <div class="row align-items-center"><div class="col-12"><img id="layout-a" src="/img/layout-a.jpg" alt="Layout A" /></div></div>
                        <div class="row align-items-center"><div class="col-12"><img id="layout-b" src="/img/layout-b.jpg" alt="Layout B" /></div></div>
                        <div class="row align-items-center"><div class="col-12"><img id="layout-c" src="/img/layout-c.jpg" alt="Layout C" /></div></div>
                    </div></div>
                <div class="col-3"><div class="row pr-1"><p>Tone & Font</p></div><div class="row h-100 pr-1">
                        <div class="row mb-3 align-items-end pl-1"><div class="col-12"><img id="casual" src="/img/casual.jpg" alt="Casual" /></div></div>
                        <div class="row align-items-start pl-1"><div class="col-12"><img id="formal" src="/img/formal.jpg" alt="Formal" /></div></div></div></div>
                <div class="col-3"><div class="row pr-1"><p>Buy Button</p></div><div class="row h-100 pr-1">
                        <div class="row mb-3 align-items-end mx-1"><div class="col-12"><img class="border border-dark" id="blue" src="/img/buybutton-blue.jpg" alt="Blue" /> </div></div>
                        <div class="row align-items-start mx-1"><div class="col-12"><img class="border border-dark" id="orange" src="/img/buybutton-orange.jpg" alt="Orange" /></div></div>
                    </div></div></div></div>`
        }
    }
}

function updateArticle(result) {
    const articleViewer = document.getElementById("article-viewer");
    articleViewer.src = `/home/Confirmation?actionId=${result.rewardActionId}`;
}

function getActions() {
    return fetch(`/api/Metadata/Actions`).then(r => r.json());
}

function getRecommendation() {
    const requestContext = {
        device: context.device,
        costs: context.costs,
        packageAdditionals: context.packageAdditionals,
        useUserAgent: !!context.userAgent
    };

    return fetch("/api/Personalizer/Recommendation", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestContext)
    }).then(r => r.json());
}

function getUserAgent() {
    return fetch("/api/Metadata/UserAgent").then(r => r.json());
}

function sendReward(eventid, value) {
    return fetch("/api/Personalizer/Reward", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            eventid: eventid,
            value: value
        })
    });
}

function updateShowGraphbtn(shouldShow) {
    let previousClass = "visible";
    let actualClass = "invisible";

    if (shouldShow) {
        previousClass = "invisible";
        actualClass = "visible";
    }

    document.getElementById("learn-button").classList.replace(previousClass, actualClass);
    document.getElementById("mobile-learn-button").classList.replace(previousClass, actualClass);
}

function getRandomOption(options) {
    var randomNumber = Math.floor(Math.random() * options.length);

    return options[randomNumber];
}

function updateRecommendation() {
    getRecommendation().then(result => {
        personalizerCallResult = result;
        updateBasedOnRecommendation(result);
    });
}