
require("TimeSlice").guard(function () {
    (require("ServerJSDefine")).handleDefines([
        ["PhotoSnowliftActionsGating", [], {
                "ALLOW_MAKE_COVER_PHOTO_BUTTON": false,
                "ALLOW_MAKE_PROFILE_PICTURE_BUTTON": false
            }, 887],
        ["GroupsProductDetailGating", [], {
                "tuzi_dialog": null
            }, 1461],
        ["FunnelLoggerConfig", [], {
                "freq": {
                    "WWW_CANVAS_AD_CREATION_FUNNEL": 1,
                    "WWW_CANVAS_EDITOR_FUNNEL": 1,
                    "WWW_LINK_PICKER_DIALOG_FUNNEL": 1,
                    "WWW_MEME_PICKER_DIALOG_FUNNEL": 1,
                    "WWW_LEAD_GEN_FORM_CREATION_FUNNEL": 1,
                    "WWW_LEAD_GEN_DESKTOP_AD_UNIT_FUNNEL": 1,
                    "WWW_CAMPFIRE_COMPOSER_UPSELL_FUNNEL": 1,
                    "WWW_RECRUITING_SEARCH_FUNNEL": 1,
                    "WWW_EXAMPLE_FUNNEL": 1,
                    "WWW_REACTIONS_NUX_FUNNEL": 1,
                    "MSITE_EXAMPLE_FUNNEL": 10,
                    "WWW_FEED_SHARE_DIALOG_FUNNEL": 100,
                    "MSITE_FEED_SHARE_DIALOG_FUNNEL": 100,
                    "MSITE_COMMENT_TYPING_FUNNEL": 500,
                    "WWW_SEARCH_AWARENESS_LEARNING_NUX_FUNNEL": 1,
                    "WWW_CONSTITUENT_TITLE_UPSELL_FUNNEL": 1,
                    "MTOUCH_FEED_MISSED_STORIES_FUNNEL": 10,
                    "WWW_UFI_SHARE_LINK_FUNNEL": 1,
                    "default": 1000
                }
            }, 1271],
        ["AccessibilityConfig", [], {
                "a11yDontMessWithTabindex": false,
                "a11yNewsfeedStoryEnumeration": false
            }, 1227],
        ["PageNavigationStageLoggerGK", [], {
                "gk_check": false
            }, 1434],
        ["ErrorSignalConfig", [], {
                "uri": "https:\/\/error.facebook.com\/common\/scribe_endpoint.php"
            }, 319],
        ["WWWBase", [], {
                "uri": "https:\/\/www.facebook.com\/"
            }, 318],
        ["SessionNameConfig", [], {
                "seed": "1UGi"
            }, 757],
        ["UserAgentData", [], {
                "browserArchitecture": "32",
                "browserFullVersion": null,
                "browserMinorVersion": null,
                "browserName": "Unknown",
                "browserVersion": null,
                "deviceName": "Unknown",
                "engineName": "Unknown",
                "engineVersion": null,
                "platformArchitecture": "32",
                "platformName": "Unknown",
                "platformVersion": null,
                "platformFullVersion": null
            }, 527],
        ["InitialServerTime", [], {
                "serverTime": 1466394631000
            }, 204],
        ["LSD", [], {
                "token": "AVol7hBW"
            }, 323],
        ["URLFragmentPreludeConfig", [], {
                "incorporateQuicklingFragment": true,
                "hashtagRedirect": true
            }, 137],
        ["TrackingConfig", [], {
                "domain": "https:\/\/pixel.facebook.com"
            }, 325],
        ["VideoPlayerAbortLoadingExperiment", [], {
                "canAbort": false,
                "withoutLoad": true
            }, 824],
        ["BigPipeExperiments", [], {
                "preparse_content": "",
                "download_js": "blocked_by_dom_ready",
                "link_images_to_pagelets": false,
                "dd_before_lr": true
            }, 907],
        ["WebSpeedExperiments", [], {
                "non_blocking_tracker": false,
                "non_blocking_logger": false
            }, 1160],
        ["ISB", [], {}, 330],
        ["IntlPhonologicalRules", [], {}, 1496],
        ["FbtLogger", [], {
                "logger": null
            }, 288],
        ["CSSLoaderConfig", [], {
                "timeout": 5000,
                "modulePrefix": "BLCSS:"
            }, 619],
        ["CurrentUserInitialData", [], {
                "USER_ID": "0",
                "ACCOUNT_ID": "0"
            }, 270],
        ["PageTransitionsConfig", [], {
                "reloadOnBootloadError": false
            }, 1067],
        ["CoreWarningGK", [], {
                "forceWarning": false
            }, 725],
        ["ZeroRewriteRules", [], {}, 1478],
        ["CurrentCommunityInitialData", [], {}, 490],
        ["ServerNonce", [], {
                "ServerNonce": "KzlNka2c_BiU4v1o3CSZ3q"
            }, 141],
        ["SiteData", [], {
                "revision": 2400666,
                "tier": "",
                "push_phase": "V3",
                "pkg_cohort": "PHASED:DEFAULT",
                "pkg_cohort_key": "__pc",
                "spdy_enabled": false,
                "haste_site": "www",
                "be_mode": -1,
                "be_key": "__be",
                "is_rtl": false,
                "vip": "31.13.78.35"
            }, 317],
        ["LinkReactUnsafeHrefConfig", [], {
                "LinkHrefChecker": null
            }, 1182],
        ["AsyncRequestConfig", [], {
                "retryOnNetworkError": "1",
                "logAsyncRequest": false
            }, 328],
        ["LinkshimHandlerConfig", [], {
                "supports_meta_referrer": false,
                "default_meta_referrer_policy": "default",
                "switched_meta_referrer_policy": "origin",
                "render_verification_rate": 1000,
                "link_react_default_hash": "0AQESGL9L",
                "linkshim_host": "l.facebook.com"
            }, 27],
        ["ZeroCategoryHeader", [], {}, 1127],
        ["ReactGK", [], {
                "logTopLevelRenders": false,
                "useCreateElement": true
            }, 998],
        ["MarauderConfig", [], {
                "app_version": 2400666,
                "gk_enabled": false
            }, 31],
        ["BanzaiConfig", [], {
                "EXPIRY": 86400000,
                "MAX_SIZE": 10000,
                "MAX_WAIT": 150000,
                "RESTORE_WAIT": 150000,
                "blacklist": ["time_spent"],
                "gks": {
                    "boosted_component": true,
                    "boosted_pagelikes": true,
                    "boosted_posts": true,
                    "boosted_website": true,
                    "jslogger": true,
                    "mercury_send_error_logging": true,
                    "pages_client_logging": true,
                    "platform_oauth_client_events": true,
                    "useraction": true,
                    "videos": true,
                    "visibility_tracking": true,
                    "vitals": true,
                    "graphexplorer": true,
                    "gqls_web_logging": true
                }
            }, 7],
        ["FbtQTOverrides", [], {
                "overrides": {
                    "1_2340e43c54f5a3de9ca7fc0a7efc2cae": "B\u1ea1n ngh\u0129 th\u1ebf n\u00e0o?",
                    "1_ed7840cabbf4b98217dc7126131aa00f": "B\u1eb1ng th\u00f4ng tin ch\u00ednh x\u00e1c c\u1ee7a b\u1ea1n \u0111\u1ec3 c\u00f3 k\u1ebft n\u1ed1i th\u1ef1c."
                }
            }, 551],
        ["FbtResultGK", [], {
                "shouldReturnFbtResult": false,
                "inlineMode": "NO_INLINE"
            }, 876],
        ["IntlViewerContext", [], {
                "GENDER": 50331648
            }, 772],
        ["DTSGInitialData", [], {}, 258],
        ["BootloaderConfig", [], {
                "maxJsRetries": 0,
                "jsRetries": null,
                "jsRetryAbortNum": 2,
                "jsRetryAbortTime": 5,
                "payloadEndpointURI": "https:\/\/www.facebook.com\/ajax\/haste-response\/"
            }, 329]
    ]);
    new (require("ServerJS"))().handle({
        "require": [
            ["TimeSlice"],
            ["markJSEnabled"],
            ["lowerDomain"],
            ["URLFragmentPrelude"],
            ["Primer"],
            ["BigPipe"],
            ["Bootloader"],
            ["TimeSlice", "disableHeartbeat", [],
                [],
                []
            ]
        ]
    });
}, "ServerJS define", {
    "root": true
})();


requireLazy(["Bootloader"], function (Bootloader) {
    Bootloader.setResourceMap({
        "cGIYc": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2i90g4\/yM\/l\/vi_VN\/ao7Vw28gJiB.js",
            "crossOrigin": 1
        },
        "X3OeH": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2iqa34\/yr\/l\/vi_VN\/jwxceueUUQv.js",
            "crossOrigin": 1
        },
        "ccpBO": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2\/yn\/r\/8v2_hdH4Nfm.js",
            "crossOrigin": 1
        },
        "fs\/dE": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2iIU84\/yF\/l\/vi_VN\/KKkXqVssgJ5.js",
            "crossOrigin": 1
        },
        "+ClWy": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2\/yH\/r\/OJIhOkl_3ZX.js",
            "crossOrigin": 1
        },
        "ZHtKx": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2\/yE\/r\/hA-z84X9-jY.js",
            "crossOrigin": 1
        },
        "oeUXN": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2\/yZ\/r\/aBvqchyj98N.js",
            "crossOrigin": 1
        },
        "e\/2cX": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2ikNp4\/yZ\/l\/vi_VN\/sm-LFqSFv4Z.js",
            "crossOrigin": 1
        },
        "uyBhh": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2iIsD4\/yH\/l\/vi_VN\/vm6oja8mJsv.js",
            "crossOrigin": 1
        },
        "2x670": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2iP0R4\/yC\/l\/vi_VN\/tZpboZnfmEe.js",
            "crossOrigin": 1
        },
        "I5Z1U": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2iKLX4\/yZ\/l\/vi_VN\/D6eI55NNQ1r.js",
            "crossOrigin": 1
        },
        "Ie5Ur": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2ini74\/yn\/l\/vi_VN\/XvzHH6ns4lI.js",
            "crossOrigin": 1
        },
        "bfqZ3": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2iGoW4\/yi\/l\/vi_VN\/lk3SylzKfeA.js",
            "crossOrigin": 1
        },
        "oDvUL": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2iM-l4\/y9\/l\/vi_VN\/ZzoCKBOVt87.js",
            "crossOrigin": 1
        },
        "d25Q1": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2\/yX\/r\/mDFA6vM1_WF.js",
            "crossOrigin": 1
        },
        "oE4Do": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2\/y7\/r\/90LhU1ioCvl.js",
            "crossOrigin": 1
        },
        "2uaA5": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2ia1R4\/yy\/l\/vi_VN\/F9aWKV4y3Ps.js",
            "crossOrigin": 1
        },
        "cNca2": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2\/yz\/r\/pcg5-FiFhYe.js",
            "crossOrigin": 1
        },
        "HicDU": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2\/yJ\/r\/dkn-ocrxJB6.js",
            "crossOrigin": 1
        },
        "cID4v": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2\/y1\/r\/4ly_dwEKmCa.js",
            "crossOrigin": 1
        },
        "cEK9F": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2\/yf\/r\/kJOu-pAvKEW.js",
            "crossOrigin": 1
        },
        "30Ha8": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2\/yU\/r\/Ug7XJ4AmLtU.js",
            "crossOrigin": 1
        },
        "SFQa5": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2\/yg\/r\/tRm5V9070U8.js",
            "crossOrigin": 1
        },
        "ol0V7": {
            "type": "css",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2\/ys\/r\/-ZL3wC7yFIy.css",
            "permanent": 1,
            "crossOrigin": 1
        },
        "2+CBf": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2inEY4\/yJ\/l\/vi_VN\/iUN38tvhlJh.js",
            "crossOrigin": 1
        },
        "rxn2o": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2in1r4\/yp\/l\/vi_VN\/srOP6TZQ23t.js",
            "crossOrigin": 1
        },
        "laa5+": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2iTIW4\/yK\/l\/vi_VN\/jdQr0ZiXxRz.js",
            "crossOrigin": 1
        },
        "8+mZj": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2iAMQ4\/yi\/l\/vi_VN\/v7CqZ3q5Uq5.js",
            "crossOrigin": 1
        },
        "RP5PM": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2i-T64\/yb\/l\/vi_VN\/z8--AKZKf0z.js",
            "crossOrigin": 1
        },
        "7unvu": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2\/yU\/r\/i9JBBeCfGUu.js",
            "crossOrigin": 1
        },
        "ZHLh0": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2i9Yi4\/yL\/l\/vi_VN\/nMGv14hXfwf.js",
            "crossOrigin": 1
        },
        "B+3kG": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2\/yH\/r\/VyWi4fzI-vh.js",
            "crossOrigin": 1
        },
        "dC1\/A": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2\/yh\/r\/Q4qu04-ue_j.js",
            "crossOrigin": 1
        },
        "zyFOp": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2\/yG\/r\/d9fPUBqNW0G.js",
            "crossOrigin": 1
        },
        "6AU0l": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2ijs34\/y5\/l\/vi_VN\/IwTr0Yb3BAy.js",
            "crossOrigin": 1
        },
        "VDymv": {
            "type": "css",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2\/yq\/r\/Zku4fNrnZfz.css",
            "permanent": 1,
            "crossOrigin": 1
        },
        "SD0gJ": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2\/y-\/r\/UELpN5unbK-.js",
            "crossOrigin": 1
        },
        "fO5Yh": {
            "type": "css",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2\/y8\/r\/_BHmbwAipbM.css",
            "permanent": 1,
            "crossOrigin": 1
        },
        "jy3Kd": {
            "type": "css",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2\/yK\/r\/sGjp6868kth.css",
            "permanent": 1,
            "crossOrigin": 1
        },
        "s3I5x": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2iQ2U4\/yE\/l\/vi_VN\/NB7rU66i_ym.js",
            "crossOrigin": 1
        },
        "pXF7m": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2\/yD\/r\/mBT750n78wD.js",
            "crossOrigin": 1
        },
        "VddxS": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2\/yr\/r\/G4qjIk5qWnu.js",
            "crossOrigin": 1
        },
        "4NbBA": {
            "type": "js",
            "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2\/ya\/r\/9-MLzRdHnMp.js",
            "crossOrigin": 1
        }
    });
    if (true) {
        Bootloader.enableBootload({
            "QuickSandSolver": {
                "resources": ["cGIYc", "gVRUN", "X3OeH", "ccpBO", "fs\/dE", "+ClWy"],
                "module": 1
            },
            "AsyncSignal": {
                "resources": ["cGIYc", "gVRUN"],
                "module": 1
            },
            "XLinkshimLogController": {
                "resources": ["cGIYc", "ZHtKx", "oeUXN"],
                "module": 1
            },
            "ExceptionDialog": {
                "resources": ["e\/2cX", "cGIYc", "uyBhh", "gVRUN", "ocuef", "ZHtKx", "2x670", "I5Z1U", "Ie5Ur", "bfqZ3", "oDvUL"],
                "module": 1
            },
            "React": {
                "resources": ["2x670", "cGIYc", "ZHtKx", "gVRUN"],
                "module": 1
            },
            "AsyncDOM": {
                "resources": ["cGIYc", "gVRUN", "d25Q1"],
                "module": 1
            },
            "ConfirmationDialog": {
                "resources": ["cGIYc", "gVRUN", "e\/2cX", "oE4Do"],
                "module": 1
            },
            "Dialog": {
                "resources": ["cGIYc", "2x670", "gVRUN", "uyBhh", "e\/2cX", "ocuef", "2uaA5"],
                "module": 1
            },
            "ErrorSignal": {
                "resources": ["cGIYc", "gVRUN", "ZHtKx", "cNca2"],
                "module": 1
            },
            "ReactDOM": {
                "resources": ["2x670", "ZHtKx", "cGIYc", "gVRUN", "e\/2cX"],
                "module": 1
            },
            "AccessibilityWebVirtualCursorClickLogger": {
                "resources": ["cGIYc", "ZHtKx", "HicDU", "e\/2cX", "2x670", "cID4v", "cEK9F"],
                "module": 1
            },
            "WebStorageMonster": {
                "resources": ["cGIYc", "gVRUN", "30Ha8", "2x670", "ZHtKx", "e\/2cX"],
                "module": 1
            },
            "Animation": {
                "resources": ["cGIYc", "2x670", "gVRUN", "uyBhh"],
                "module": 1
            },
            "AsyncDialog": {
                "resources": ["cGIYc", "gVRUN", "e\/2cX", "uyBhh", "ocuef", "ZHtKx", "2x670"],
                "module": 1
            },
            "AsyncRequest": {
                "resources": ["cGIYc", "gVRUN"],
                "module": 1
            },
            "FormSubmit": {
                "resources": ["cGIYc", "gVRUN", "SFQa5"],
                "module": 1
            },
            "DialogX": {
                "resources": ["e\/2cX", "cGIYc", "uyBhh", "gVRUN", "ocuef", "ZHtKx", "2x670"],
                "module": 1
            },
            "XUIDialogBody.react": {
                "resources": ["2x670", "cGIYc", "ZHtKx", "gVRUN", "e\/2cX", "ocuef", "uyBhh"],
                "module": 1
            },
            "XUIDialogButton.react": {
                "resources": ["2x670", "cGIYc", "ZHtKx", "gVRUN", "e\/2cX", "I5Z1U"],
                "module": 1
            },
            "XUIDialogFooter.react": {
                "resources": ["2x670", "cGIYc", "ZHtKx", "gVRUN", "e\/2cX", "ocuef", "uyBhh", "I5Z1U"],
                "module": 1
            },
            "XUIDialogTitle.react": {
                "resources": ["2x670", "cGIYc", "ZHtKx", "gVRUN", "e\/2cX", "ocuef", "uyBhh"],
                "module": 1
            },
            "XUIGrayText.react": {
                "resources": ["2x670", "cGIYc", "ZHtKx", "gVRUN", "e\/2cX", "bfqZ3"],
                "module": 1
            },
            "PageTransitions": {
                "resources": ["cGIYc", "gVRUN", "e\/2cX", "2x670", "cID4v", "2uaA5", "ZHtKx", "uyBhh", "ocuef"],
                "module": 1
            },
            "Hovercard": {
                "resources": ["cGIYc", "gVRUN", "uyBhh", "e\/2cX", "ocuef", "ol0V7", "2+CBf", "rxn2o"],
                "module": 1
            },
            "EncryptedImg": {
                "resources": ["cGIYc", "2x670", "bfqZ3", "I5Z1U"],
                "module": 1
            },
            "AsyncResponse": {
                "resources": ["cGIYc"],
                "module": 1
            },
            "Live": {
                "resources": ["cGIYc", "gVRUN", "d25Q1", "2x670"],
                "module": 1
            },
            "PhotoInlineEditor": {
                "resources": ["cGIYc", "gVRUN", "e\/2cX", "laa5+", "SFQa5", "8+mZj", "bfqZ3", "ocuef", "RP5PM", "7unvu"],
                "module": 1
            },
            "PhotoTagApproval": {
                "resources": ["cGIYc", "gVRUN", "laa5+", "ZHLh0"],
                "module": 1
            },
            "PhotoTagger": {
                "resources": ["cGIYc", "gVRUN", "B+3kG", "uyBhh", "e\/2cX", "ocuef", "ol0V7", "2+CBf", "rxn2o", "ZHtKx", "laa5+"],
                "module": 1
            },
            "PhotoTags": {
                "resources": ["cGIYc", "gVRUN", "laa5+", "ZHLh0"],
                "module": 1
            },
            "PhotosButtonTooltips": {
                "resources": ["cGIYc", "gVRUN", "e\/2cX", "ocuef", "2+CBf", "uyBhh", "dC1\/A"],
                "module": 1
            },
            "SpotlightShareViewer": {
                "resources": ["cGIYc", "gVRUN", "2x670", "cID4v", "e\/2cX", "zyFOp"],
                "module": 1
            },
            "TagTokenizer": {
                "resources": ["cGIYc", "gVRUN", "bfqZ3", "ocuef", "RP5PM", "ZHLh0", "e\/2cX", "8+mZj", "SFQa5"],
                "module": 1
            },
            "VideoRotate": {
                "resources": ["cGIYc", "gVRUN", "2x670", "uyBhh", "e\/2cX", "ocuef", "2uaA5", "6AU0l"],
                "module": 1
            },
            "css:fb-photos-snowlift-fullscreen-css": {
                "resources": ["VDymv"]
            },
            "PhotoSnowlift": {
                "resources": ["cGIYc", "gVRUN", "ZHtKx", "2x670", "uyBhh", "e\/2cX", "ocuef", "2uaA5", "bfqZ3", "I5Z1U", "cID4v", "SD0gJ", "laa5+", "fO5Yh", "jy3Kd", "s3I5x", "2+CBf"],
                "module": 1
            },
            "Toggler": {
                "resources": ["cGIYc", "gVRUN", "e\/2cX", "uyBhh", "ocuef", "ZHtKx"],
                "module": 1
            },
            "Tooltip": {
                "resources": ["cGIYc", "gVRUN", "e\/2cX", "ocuef", "2+CBf", "uyBhh"],
                "module": 1
            },
            "DOM": {
                "resources": ["cGIYc", "gVRUN"],
                "module": 1
            },
            "Form": {
                "resources": ["cGIYc", "gVRUN"],
                "module": 1
            },
            "Input": {
                "resources": ["cGIYc"],
                "module": 1
            },
            "trackReferrer": {
                "resources": [],
                "module": 1
            }
        });
    }
});
requireLazy(["ix"], function (ix) {
    ix.add({
        "arrow-right:white:small": {
            "sprited": true,
            "spriteMapCssClass": "sp_HodqdOxY8N5",
            "spriteCssClass": "sx_e24636"
        }
    });
});


requireLazy(["InitialJSLoader"], function (InitialJSLoader) {
    InitialJSLoader.loadOnDOMContentReady(["cGIYc", "pXF7m", "e\/2cX", "ZHtKx", "X3OeH", "VddxS", "4NbBA", "2x670"]);
});



require("TimeSlice").guard(function () {
    require("ServerJSDefine").handleDefines([]);
    require("InitialJSLoader").handleServerJS({
        "elements": [
            ["__elem_835c633a_0_0", "login_form", 1],
            ["__elem_f46f4946_0_0", "u_0_0", 1],
            ["__elem_f46f4946_0_1", "u_0_1", 1],
            ["__elem_45d73b5d_0_0", "loginbutton", 1],
            ["__elem_a6f65671_0_0", "pagelet_bluebar", 1],
            ["__elem_a588f507_0_0", "globalContainer", 2],
            ["__elem_85b7cbf7_0_0", "login_form", 1],
            ["__elem_a32d506f_0_0", "u_0_2", 1],
            ["__elem_a32d506f_0_1", "u_0_3", 1]
        ],
        "require": [
            ["PixelRatio", "startDetecting", [],
                [1],
                []
            ],
            ["TimezoneAutoset", "setInputValue", ["__elem_f46f4946_0_0"],
                [{
                        "__m": "__elem_f46f4946_0_0"
                    }, 1466394631],
                []
            ],
            ["ScreenDimensionsAutoSet", "setInputValue", ["__elem_f46f4946_0_1"],
                [{
                        "__m": "__elem_f46f4946_0_1"
                    }],
                []
            ],
            ["LoginFormController", "init", ["__elem_835c633a_0_0", "__elem_45d73b5d_0_0"],
                [{
                        "__m": "__elem_835c633a_0_0"
                    }, {
                        "__m": "__elem_45d73b5d_0_0"
                    }],
                []
            ],
            ["PostLoadJS", "loadAndCall", [],
                ["QuickSandSolver", "solveAndUpdateForm", [1, "s?goz?\u06de?6?\u001b?\u045c?UBF\u0005?\u0003?????v?5,?", 10, 42, 100, "login_form", "AZkuDuBgcYjNj3AnrRHfwYD7e48Hhi-BMo3-WcafWyGgGaihzjmuZblwitgzkBoliO1CBhP422lSVnXBKz3xv0teulW3LhIoAEox-Ej4dUIVz2opJPa25e05T7LAZW8WDk_zogWEoXWvfdsq8dlqfuNSBt9ClOUkp-lwfmVqYC5BpeEmNCjVggPaz3foL6V1ylsXcDUy1cFPmTeP-Th80CM-FgvrNiU48_zwVpFhkJWqQQ"]],
                []
            ],
            ["FocusListener"],
            ["FlipDirectionOnKeypress"],
            ["ControlledReferer"],
            ["ControlledReferer", "useFacebookRefererHtml", ["__elem_a32d506f_0_0"],
                [{
                        "__m": "__elem_a32d506f_0_0"
                    }, "\u003Cform method=\"get\" action=\"https:\/\/www.facebook.com\/sem_campaigns\/sem_pixel_test\/\" id=\"theform\">\u003Cinput name=\"google_pixel_category\" value=\"4\" type=\"hidden\" autocomplete=\"off\" \/>\u003Cinput name=\"google_pixel_src\" value=\"https:\/\/googleads.g.doubleclick.net\/pagead\/viewthroughconversion\/995153884\/?value=1.00&amp;currency_code=USD&amp;label=szBrCMnWkWAQ3K_D2gM&amp;guid=ON&amp;script=0\" type=\"hidden\" autocomplete=\"off\" \/>\u003C\/form>\u003Ciframe frameborder=\"0\" width=\"1\" height=\"1\" onload=\"document.getElementById(&#039;theform&#039;).submit()\">\u003C\/iframe>"],
                []
            ],
            ["ControlledReferer", "useFacebookRefererHtml", ["__elem_a32d506f_0_1"],
                [{
                        "__m": "__elem_a32d506f_0_1"
                    }, "\u003Cform method=\"get\" action=\"https:\/\/googleads.g.doubleclick.net\/pagead\/viewthroughconversion\/995153884\/\" id=\"theform\">\u003Cinput name=\"value\" value=\"1.00\" type=\"hidden\" autocomplete=\"off\" \/>\u003Cinput name=\"currency_code\" value=\"USD\" type=\"hidden\" autocomplete=\"off\" \/>\u003Cinput name=\"label\" value=\"szBrCMnWkWAQ3K_D2gM\" type=\"hidden\" autocomplete=\"off\" \/>\u003Cinput name=\"guid\" value=\"ON\" type=\"hidden\" autocomplete=\"off\" \/>\u003Cinput name=\"script\" value=\"0\" type=\"hidden\" autocomplete=\"off\" \/>\u003C\/form>\u003Ciframe frameborder=\"0\" width=\"1\" height=\"1\" onload=\"document.getElementById(&#039;theform&#039;).submit()\">\u003C\/iframe>"],
                []
            ],
            ["ScriptPath", "set", [],
                ["\/login.php", "ad976420", {
                        "imp_id": "895406f6"
                    }],
                []
            ],
            ["UITinyViewportAction", "init", [],
                [],
                []
            ],
            ["ResetScrollOnUnload", "init", ["__elem_a588f507_0_0"],
                [{
                        "__m": "__elem_a588f507_0_0"
                    }],
                []
            ],
            ["PostLoadJS", "loadAndCall", ["__elem_a6f65671_0_0", "__elem_a588f507_0_0"],
                ["AccessibilityWebVirtualCursorClickLogger", "init", [
                        [{
                                "__m": "__elem_a6f65671_0_0"
                            }, {
                                "__m": "__elem_a588f507_0_0"
                            }]
                    ]],
                []
            ],
            ["PostLoadJS", "loadAndCall", [],
                ["WebStorageMonster", "schedule", []],
                []
            ],
            ["AsyncRequestNectarLogging"],
            ["IntlUtils"]
        ]
    });
}, "ServerJS define", {
    "root": true
})();


var bigPipe = new (require("BigPipe"))({
    "lid": "6298116984029397201",
    "forceFinish": true
});

bigPipe.beforePageletArrive("first_response")


require("TimeSlice").guard((function () {
    bigPipe.onPageletArrive({
        "id": "first_response",
        "phase": 0,
        "jsmods": {},
        "is_last": true,
        "allResources": ["gVRUN", "ocuef", "vBrdZ", "cGIYc", "pQtcx", "pXF7m", "e\/2cX", "ZHtKx", "X3OeH", "VddxS", "4NbBA", "2x670"],
        "displayResources": ["gVRUN", "ocuef", "vBrdZ", "pQtcx"]
    });
}), "onPageletArrive first_response", {
    "root": true,
    "pagelet": "first_response"
})();

bigPipe.beforePageletArrive("last_response")


require("TimeSlice").guard((function () {
    bigPipe.onPageletArrive({
        "id": "last_response",
        "phase": 1,
        "jsmods": {
            "require": [
                ["Cookie", "setIfFirstPartyContext", [],
                    ["_js_datr", "B2hnV3FE1g7r0x7lUe1sxrGp", 63072000000, "\/", false],
                    []
                ],
                ["Cookie", "setIfFirstPartyContext", [],
                    ["_js_reg_fb_ref", "https:\/\/www.facebook.com\/login.php?login_attempt=1&lwv=100", 0, "\/", false],
                    []
                ],
                ["Cookie", "setIfFirstPartyContext", [],
                    ["_js_reg_fb_gate", "https:\/\/www.facebook.com\/login.php?login_attempt=1&lwv=100", 0, "\/", false],
                    []
                ],
                ["NavigationMetrics", "setPage", [],
                    [{
                            "page": "\/login.php",
                            "page_type": "normal",
                            "page_uri": "https:\/\/www.facebook.com\/login.php?login_attempt=1&lwv=100",
                            "serverLID": "6298116984029397201"
                        }],
                    []
                ],
                ["PostLoadJS", "loadAndRequire", [],
                    ["DimensionTracking"],
                    []
                ],
                ["PostLoadJS", "loadAndCall", [],
                    ["HighContrastMode", "init", [{
                                "isHCM": false,
                                "spacerImage": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2\/y4\/r\/-PAXP-deijE.gif"
                            }]],
                    []
                ],
                ["ClickRefLogger"],
                ["PostLoadJS", "loadAndCall", [],
                    ["DetectBrokenProxyCache", "run", [0, "c_user"]],
                    []
                ],
                ["TimeSlice", "setLogging", [],
                    [false, 0.01],
                    []
                ],
                ["NavigationClickPointHandler"],
                ["UserActionHistory"],
                ["ScriptPathLogger", "startLogging", [],
                    [],
                    []
                ],
                ["TimeSpentBitArrayLogger", "init", [],
                    [],
                    []
                ]
            ],
            "define": [
                ["TimeSpentConfig", [], {
                        "0_delay": 0,
                        "0_timeout": 8,
                        "delay": 200000,
                        "timeout": 64
                    }, 142],
                ["ImmediateActiveSecondsConfig", [], {
                        "sampling_rate": 0
                    }, 423]
            ]
        },
        "is_last": true,
        "bootloadable": {
            "DimensionTracking": {
                "resources": ["cGIYc", "WLvgd"],
                "module": 1
            },
            "HighContrastMode": {
                "resources": ["cGIYc", "gVRUN", "lgOzt", "hivrN"],
                "module": 1
            },
            "DetectBrokenProxyCache": {
                "resources": ["cGIYc", "gVRUN", "sgZDr"],
                "module": 1
            }
        },
        "resource_map": {
            "WLvgd": {
                "type": "js",
                "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2\/y4\/r\/R9GKCzjAnbk.js",
                "crossOrigin": 1
            },
            "lgOzt": {
                "type": "js",
                "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2ilUE4\/y-\/l\/vi_VN\/0TFqudpY6NG.js",
                "crossOrigin": 1
            },
            "hivrN": {
                "type": "js",
                "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2\/yr\/r\/YnSasnyq68i.js",
                "crossOrigin": 1
            },
            "sgZDr": {
                "type": "js",
                "src": "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v2\/yU\/r\/kQf_jlUv-kX.js",
                "crossOrigin": 1
            }
        },
        "allResources": ["gVRUN", "ocuef", "vBrdZ", "cGIYc", "pQtcx", "pXF7m", "e\/2cX", "ZHtKx", "X3OeH", "VddxS", "4NbBA", "2x670"],
        "displayResources": ["gVRUN", "ocuef", "vBrdZ", "pQtcx"],
        "the_end": true
    });
}), "onPageletArrive last_response", {
    "root": true,
    "pagelet": "last_response"
})();
        