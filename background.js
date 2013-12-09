var parts = {
  prefix:    'https://docs\\.google\\.com/',
  appDomain: '(a/[^/]+/)?',
  fileType:  '(document|presentation|drawings)/d/',
  docId:     '(\\w+)/',
  mode:      '(view|edit|preview)',
  fragment:  '(#.*)?'
};

var pattern = new RegExp(
    '^' +
    parts.prefix +
    parts.appDomain +
    parts.fileType +
    parts.docId +
    parts.mode +
    parts.fragment +
    '$');

var MODE = {
  INVALID: 0,
  VIEW:    1,
  PREVIEW: 2,
  EDIT:    3
};

function getMode(matches) {
  if (matches) {
    switch (matches[4]) {
      case 'view': return MODE.VIEW;
      case 'preview': return MODE.PREVIEW;
      case 'edit': return MODE.EDIT;
    }
  }
  return MODE.INVALID;
}

function reload(matches, tab) {
  var url = 'https://docs.google.com/' +
      (matches[1] || '') +  // appDomain
      matches[2] + '/d/' +  // fileType
      matches[3] + '/'   +  // docId
      matches[4] +          // mode
      (matches[5] || '');   // fragment

  chrome.tabs.update(tab.id, {url: url});
}

function checkForGoogleDriveUrl(tabId, changeInfo, tab) {
  var matches = pattern.exec(tab.url);
  var mode = getMode(matches);
  switch (mode) {
    case MODE.INVALID:
      chrome.pageAction.hide(tabId);
      break;
    case MODE.EDIT:
      chrome.pageAction.setIcon({path: 'edit.png', tabId: tab.id});
      chrome.pageAction.show(tabId);
      break;
    case MODE.PREVIEW:
    case MODE.VIEW:
      chrome.pageAction.setIcon({path: 'view.png', tabId: tab.id});
      chrome.pageAction.show(tabId);
      break;
  }
}

function onClicked(tab) {
  var matches = pattern.exec(tab.url);
  var mode = getMode(matches);
  switch (mode) {
    case MODE.EDIT:
      matches[4] = 'view';
      reload(matches, tab);
      break;
    case MODE.PREVIEW:
    case MODE.VIEW:
      matches[4] = 'edit';
      reload(matches, tab);
      break;
  }
}

chrome.tabs.onUpdated.addListener(checkForGoogleDriveUrl);
chrome.pageAction.onClicked.addListener(onClicked);